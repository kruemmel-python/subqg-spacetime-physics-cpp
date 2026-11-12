import fs from 'node:fs';

/**
 * Pure First-Principles SubQG Overlap Simulation
 * 
 * NO MOND formula mu(x).
 * NO Tully-Fisher formula v_flat = (G M a0)^(1/4).
 * NO imported 1/r or 1/r^2 law.
 * 
 * ONLY:
 * 1. Microscopic nodes with support radius R and density rho0.
 * 2. Overlap kernel Omega(d) = max(0, 1 - d/(2R)).
 * 3. Phase interaction H = sum Omega_ij * [1 - cos(phi_i - phi_j)].
 * 4. Central cluster of N_M excitations.
 * 5. Variational relaxation of the network phases.
 * 6. Test particle binding energy V(r) and force F(r) = - dV/dr.
 */

export class SubQGFirstPrinciplesEngine {
  constructor({
    dimension = 3,
    boxSize = 20.0,
    rho0 = 0.8,              // vacuum background node density
    supportRadius = 1.8,     // support radius R (interaction reach 2R = 3.6)
    stiffness = 1.0,
    seed = 12345
  } = {}) {
    this.dimension = dimension;
    this.boxSize = boxSize;
    this.rho0 = rho0;
    this.supportRadius = supportRadius;
    this.stiffness = stiffness;
    this.seed = seed >>> 0;

    this.nodes = [];
    this.links = [];
    this.centralNodeIds = [];
    this.vacuumNodeIds = [];
  }

  random() {
    this.seed = (Math.imul(1664525, this.seed) + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }

  buildUniverse({ centralMassNodes = 10, clusterRadius = 1.0 } = {}) {
    this.nodes = [];
    this.links = [];
    this.centralNodeIds = [];
    this.vacuumNodeIds = [];

    const halfBox = this.boxSize / 2;
    const volume = Math.pow(this.boxSize, this.dimension);
    const nVacuum = Math.floor(volume * this.rho0);

    let idCounter = 0;

    // 1. Generate Central Mass Cluster (localized excitations around origin)
    for (let i = 0; i < centralMassNodes; i++) {
      const pos = [];
      for (let d = 0; d < this.dimension; d++) {
        // Gaussian/clustered around 0
        const u1 = Math.max(1e-7, this.random());
        const u2 = this.random();
        const randStd = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        pos.push(randStd * (clusterRadius / 2));
      }
      const node = {
        id: idCounter++,
        pos,
        phase: 0.0, // coherent phase
        isCentral: true
      };
      this.nodes.push(node);
      this.centralNodeIds.push(node.id);
    }

    // 2. Generate Uniform Vacuum Background Nodes
    for (let i = 0; i < nVacuum; i++) {
      const pos = [];
      for (let d = 0; d < this.dimension; d++) {
        pos.push((this.random() - 0.5) * this.boxSize);
      }
      const distFromCenter = Math.hypot(...pos);
      // Exclude immediate inner core to avoid artificial overlap clash with mass
      if (distFromCenter < clusterRadius * 0.5) continue;

      const node = {
        id: idCounter++,
        pos,
        phase: (this.random() - 0.5) * 2 * Math.PI, // random initial vacuum phases
        isCentral: false
      };
      this.nodes.push(node);
      this.vacuumNodeIds.push(node.id);
    }

    // 3. Build Microscopic Overlap Graph
    const reach = 2 * this.supportRadius;
    const nTotal = this.nodes.length;
    for (let i = 0; i < nTotal; i++) {
      for (let j = i + 1; j < nTotal; j++) {
        const d = Math.hypot(...this.nodes[i].pos.map((p, idx) => p - this.nodes[j].pos[idx]));
        if (d < reach) {
          const overlap = 1.0 - d / reach;
          this.links.push({ i, j, overlap, d });
        }
      }
    }

    return {
      nTotal: this.nodes.length,
      nCentral: this.centralNodeIds.length,
      nVacuum: this.vacuumNodeIds.length,
      nLinks: this.links.length
    };
  }

  /**
   * Variational Ground-State Relaxation:
   * Minimizes microscopic interaction Hamiltonian:
   * H = sum_{<i,j>} Omega_ij * [1 - cos(phi_i - phi_j)]
   * with central mass phases locked to 0 (coherent source).
   */
  relaxPhases({ iterations = 300, lr = 0.05, tolerance = 1e-5 } = {}) {
    const N = this.nodes.length;
    const isFixed = new Uint8Array(N);
    for (const id of this.centralNodeIds) isFixed[id] = 1;

    for (let it = 0; it < iterations; it++) {
      const grad = new Float64Array(N);
      for (const link of this.links) {
        const { i, j, overlap } = link;
        const dPhi = this.nodes[i].phase - this.nodes[j].phase;
        const torque = overlap * Math.sin(dPhi);
        grad[i] += torque;
        grad[j] -= torque;
      }

      let maxUpdate = 0;
      for (let i = 0; i < N; i++) {
        if (!isFixed[i]) {
          const step = lr * grad[i];
          this.nodes[i].phase -= step;
          if (Math.abs(step) > maxUpdate) maxUpdate = Math.abs(step);
        }
      }

      if (maxUpdate < tolerance) break;
    }
  }

  /**
   * Measures the microscopic binding energy of a test excitation at position rVec:
   * V(r) = - sum_{k} Omega(|rVec - x_k|) * (1 + cos(phi_test - phi_k)) / 2
   */
  probeBindingEnergy(rVec, probePhase = 0.0) {
    const reach = 2 * this.supportRadius;
    let binding = 0;
    let neighborCount = 0;

    for (const node of this.nodes) {
      const d = Math.hypot(...rVec.map((p, idx) => p - node.pos[idx]));
      if (d < reach) {
        const overlap = 1.0 - d / reach;
        const phaseFactor = (1.0 + Math.cos(probePhase - node.phase)) / 2.0;
        binding += overlap * phaseFactor;
        neighborCount++;
      }
    }

    return { bindingEnergy: -binding, neighborCount };
  }

  /**
   * Computes the radial force profile F(r) = - dV/dr by placing test probes
   * at radii r along multiple radial directions and taking the finite difference.
   */
  measureForceProfile({ rMin = 1.5, rMax = 8.0, steps = 15, directions = 6 } = {}) {
    const dr = (rMax - rMin) / (steps - 1);
    const profile = [];

    // Direction vectors on unit sphere/circle
    const dirVectors = [];
    for (let dir = 0; dir < directions; dir++) {
      const angle = (2 * Math.PI * dir) / directions;
      if (this.dimension === 2) {
        dirVectors.push([Math.cos(angle), Math.sin(angle)]);
      } else {
        const phi = angle;
        const theta = Math.PI / 3 + (dir % 3) * (Math.PI / 6);
        dirVectors.push([
          Math.sin(theta) * Math.cos(phi),
          Math.sin(theta) * Math.sin(phi),
          Math.cos(theta)
        ]);
      }
    }

    const deltaR = 0.1;

    for (let s = 0; s < steps; s++) {
      const r = rMin + s * dr;
      let totalForce = 0;
      let validDirs = 0;

      for (const dVec of dirVectors) {
        const rIn = dVec.map(c => c * (r - deltaR / 2));
        const rOut = dVec.map(c => c * (r + deltaR / 2));

        const eIn = this.probeBindingEnergy(rIn, 0.0).bindingEnergy;
        const eOut = this.probeBindingEnergy(rOut, 0.0).bindingEnergy;

        // F = - dV/dr = - (eOut - eIn) / deltaR = (eIn - eOut) / deltaR
        // If eIn < eOut (inner point is more bound/lower potential), F is negative (inward attraction)
        const force = -(eOut - eIn) / deltaR;
        totalForce += force;
        validDirs++;
      }

      const meanForce = totalForce / validDirs;
      // Inward attractive force magnitude
      const attractiveMagnitude = Math.max(0, -meanForce);

      profile.push({
        r,
        forceRaw: meanForce,
        attractiveMagnitude
      });
    }

    // Compute local power-law exponents: alpha = - d(log F) / d(log r)
    // where F ~ r^(-alpha).
    // alpha = 2 -> Newtonian (1/r^2)
    // alpha = 1 -> MOND / Tully-Fisher (1/r)
    // alpha = 0 -> constant force
    for (let i = 1; i < profile.length; i++) {
      const pPrev = profile[i - 1];
      const pCurr = profile[i];
      if (pPrev.attractiveMagnitude > 1e-5 && pCurr.attractiveMagnitude > 1e-5) {
        const logFDiff = Math.log(pCurr.attractiveMagnitude) - Math.log(pPrev.attractiveMagnitude);
        const logRDiff = Math.log(pCurr.r) - Math.log(pPrev.r);
        pCurr.powerLawExponent = -logFDiff / logRDiff;
      } else {
        pCurr.powerLawExponent = null;
      }
    }

    return profile;
  }
}
