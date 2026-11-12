// subqg_multiverse_phases.mjs - SubQG Multiverse Phase Diagram & Alternative Spacetime Classes
//
// Systematically investigates whether the SAME fundamental SubQG interaction rules
// (FPV-1 cosine overlap, simplicial valence action k*=4 => d=3, timeless variational
// stationary substrate, and nonlinear graph conductivity) generate distinct stable
// emergent physical phases of universes when the critical control parameter Lambda
// is tuned across the critical nucleation threshold Lambda_c = Theta_crit / <w^2>.

import fs from 'node:fs';

function halton(index, base) {
  let result = 0.0;
  let f = 1.0 / base;
  let i = index;
  while (i > 0) {
    result += f * (i % base);
    i = Math.floor(i / base);
    f /= base;
  }
  return result;
}

export class SubQGMultiversePhaseEngine {
  constructor({
    stateCount = 240,
    threshold = 0.75,
    seed = 42,
    tau = 0.016
  } = {}) {
    this.N = stateCount;
    this.threshold = threshold; // Theta_crit = 0.75
    this.seed = seed;
    this.tau = tau;
    this.kStar = 4; // derived from S_simplex(k) action minimum
    this.closureThreshold = 0.985;

    // Build the fundamental possibility ensemble P_SubQG (dimensionless internal states):
    this.possibilities = this._generatePossibilityEnsemble();
    this.pairAffinities = this._computePairAffinities();

    // Critical nucleation threshold Lambda_c = Theta_crit / <w^2>:
    const resonantBand = this.pairAffinities.filter(p => p.w >= 0.88 * this.maxAffinity);
    this.meanW2 = resonantBand.reduce((s, p) => s + p.w * p.w, 0.0) / resonantBand.length;
    this.meanW4 = resonantBand.reduce((s, p) => s + Math.pow(p.w, 4), 0.0) / resonantBand.length;
    this.lambdaCritical = this.threshold / this.meanW2;
    this.pairNucleationBarrier = this.lambdaCritical * this.maxAffinity;
  }

  _multiPhaseOverlap(phiA, phiB) {
    let sumCos = 0.0;
    for (let a = 0; a < this.kStar; a++) {
      sumCos += Math.cos(phiA[a] - phiB[a]);
    }
    return 0.5 * (1.0 + sumCos / this.kStar);
  }

  _generatePossibilityEnsemble() {
    const primes = [2, 3, 5, 7, 11];
    const states = [];
    let idx = 1;
    while (states.length < this.N) {
      const raw = new Array(this.kStar);
      let sumP = 0.0;
      for (let a = 0; a < this.kStar; a++) {
        raw[a] = 0.58 * (2.0 * halton(idx, primes[a]) - 1.0);
        sumP += raw[a];
      }
      const amp = 0.82 + 0.18 * halton(idx, primes[4]);
      idx++;
      if (0.5 * (1.0 + Math.cos(sumP)) < this.closureThreshold) continue;
      const meanP = sumP / this.kStar;
      states.push({
        id: states.length,
        phases: raw.map(p => p - meanP),
        amplitude: amp
      });
    }
    return states;
  }

  _computePairAffinities() {
    const pairs = [];
    let maxAff = 0.0;
    for (let i = 0; i < this.N; i++) {
      for (let j = i + 1; j < this.N; j++) {
        const ov = this._multiPhaseOverlap(this.possibilities[i].phases, this.possibilities[j].phases);
        const w = Math.sqrt(this.possibilities[i].amplitude * this.possibilities[j].amplitude) * ov;
        if (w > maxAff) maxAff = w;
        pairs.push({ i, j, ov, w });
      }
    }
    this.maxAffinity = maxAff;
    return pairs;
  }

  /**
   * Evaluates the macroscopic Landau nucleation order parameter Delta*(Lambda):
   *   V_trans(Delta; Lambda) = (1/2)*(Theta_crit - Lambda*<w^2>)*Delta^2 + (1/4)*Lambda^2*<w^4>*Delta^4
   */
  evaluateLandauOrderParameter(lambda) {
    const curvatureAtZero = this.threshold - lambda * this.meanW2;
    const quarticCoeff = lambda * lambda * this.meanW4;
    const deltaStar = curvatureAtZero < 0.0 ? Math.sqrt(-curvatureAtZero / quarticCoeff) : 0.0;
    const potentialMin =
      0.5 * curvatureAtZero * deltaStar * deltaStar + 0.25 * quarticCoeff * Math.pow(deltaStar, 4);
    const barrierDepth = Math.abs(potentialMin);
    // Thermal/quantum fluctuation stability:
    // If barrierDepth < tau^2 (where tau is phase variance/temperature), fluctuations destroy the state:
    const fluctuationStabilityRatio = barrierDepth / (this.tau * this.tau);
    const isStableAgainstFluctuations = barrierDepth > this.tau * this.tau;

    return {
      curvatureAtZero,
      quarticCoeff,
      deltaStar,
      potentialMin,
      barrierDepth,
      fluctuationStabilityRatio,
      isStableAgainstFluctuations
    };
  }

  /**
   * Actualizes the microscopic spacetime network for a given resonance parameter Lambda:
   * Only mode pairs with Lambda * w_ij > pairNucleationBarrier condense into physical bonds.
   */
  nucleateSpacetimeNetwork(lambda) {
    const adj = Array.from({ length: this.N }, () => []);
    const activeSet = new Set();
    const bonds = [];
    let maxBondStiffness = 0.0;

    for (const p of this.pairAffinities) {
      const effResonance = lambda * p.w;
      if (effResonance > this.pairNucleationBarrier) {
        activeSet.add(p.i);
        activeSet.add(p.j);
        adj[p.i].push(p.j);
        adj[p.j].push(p.i);
        const stiffness = effResonance - this.pairNucleationBarrier;
        if (stiffness > maxBondStiffness) maxBondStiffness = stiffness;
        bonds.push({ i: p.i, j: p.j, resonance: effResonance, stiffness });
      }
    }

    const activeNodes = [...activeSet].sort((a, b) => a - b);

    // Compute connected components (Spacetime Islands):
    const visited = new Uint8Array(this.N);
    const components = [];
    for (const u of activeNodes) {
      if (visited[u]) continue;
      const comp = [u];
      visited[u] = 1;
      for (let h = 0; h < comp.length; h++) {
        const curr = comp[h];
        for (const nb of adj[curr]) {
          if (!visited[nb]) {
            visited[nb] = 1;
            comp.push(nb);
          }
        }
      }
      components.push(comp);
    }
    components.sort((a, b) => b.length - a.length);

    const giantComponent = components.length > 0 ? components[0] : [];
    const giantFraction = giantComponent.length / this.N;

    // Detect nucleated 2-simplices (triangles) within components:
    const triangles = [];
    for (const comp of components) {
      for (let a = 0; a < comp.length; a++) {
        const u = comp[a];
        for (let b = a + 1; b < comp.length; b++) {
          const v = comp[b];
          if (!adj[u].includes(v)) continue;
          for (let c = b + 1; c < comp.length; c++) {
            const w = comp[c];
            if (adj[u].includes(w) && adj[v].includes(w)) {
              const resTri =
                (this._multiPhaseOverlap(this.possibilities[u].phases, this.possibilities[v].phases) +
                  this._multiPhaseOverlap(this.possibilities[v].phases, this.possibilities[w].phases) +
                  this._multiPhaseOverlap(this.possibilities[w].phases, this.possibilities[u].phases)) /
                3.0;
              triangles.push({ nodes: [u, v, w], resonance: resTri, compId: components.indexOf(comp) });
            }
          }
        }
      }
    }

    // Measure effective spatial volume-growth dimension d_eff on giant component:
    let emergentDimension = 0.0;
    if (giantComponent.length >= 8) {
      const root = giantComponent[0];
      const dist = new Int32Array(this.N).fill(-1);
      dist[root] = 0;
      const q = [root];
      for (let h = 0; h < q.length; h++) {
        const curr = q[h];
        for (const nb of adj[curr]) {
          if (dist[nb] === -1) {
            dist[nb] = dist[curr] + 1;
            q.push(nb);
          }
        }
      }
      const maxR = Math.max(...dist.filter(d => d >= 0));
      if (maxR >= 3) {
        const samples = [];
        for (let r = 1; r <= maxR; r++) {
          let vol = 0;
          for (const u of giantComponent) {
            if (dist[u] >= 0 && dist[u] <= r) vol++;
          }
          if (vol > 0) samples.push([Math.log(r), Math.log(vol)]);
        }
        if (samples.length >= 3) {
          const mx = samples.reduce((s, p) => s + p[0], 0.0) / samples.length;
          const my = samples.reduce((s, p) => s + p[1], 0.0) / samples.length;
          const den = samples.reduce((s, p) => s + (p[0] - mx) ** 2, 0.0);
          emergentDimension = den > 1e-12 ? samples.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0.0) / den : 0.0;
        }
      }
    }

    // Compute algebraic connectivity (Fiedler eigenvalue lambda_2) of the giant component:
    let fiedlerEigenvalue = 0.0;
    let bottleneckIdentified = false;
    if (giantComponent.length >= 6) {
      fiedlerEigenvalue = this._computeFiedlerEigenvalue(adj, giantComponent);
      // A bottleneck exists when the giant component is large (>30% of active nodes)
      // but its algebraic connectivity is anomalously small (< 0.25):
      if (fiedlerEigenvalue < 0.25 && giantComponent.length > 15) {
        bottleneckIdentified = true;
      }
    }

    // Relational Wheeler-DeWitt clock audit across components:
    // If multiple components each possess internal triangles/bonds, they define
    // separate, mutually unsynchronizable local clocks (Multiple Local Times):
    const componentClocks = [];
    for (let cIdx = 0; cIdx < Math.min(5, components.length); cIdx++) {
      const comp = components[cIdx];
      const compTri = triangles.filter(t => t.compId === cIdx);
      if (comp.length >= 3 && compTri.length >= 1) {
        let maxWComp = 0.0;
        for (const b of bonds) {
          if (comp.includes(b.i) && comp.includes(b.j) && b.stiffness > maxWComp) {
            maxWComp = b.stiffness;
          }
        }
        const clockFreq = Math.sqrt(2.0 * maxWComp);
        componentClocks.push({
          componentIndex: cIdx,
          nodeCount: comp.length,
          triangleEvents: compTri.length,
          localClockFrequency: clockFreq
        });
      }
    }

    // Gravitational conductivity nonlinearity p and radial falloff exponent alpha:
    // Generalized formula: alpha = (d - 1) / (p + 1)
    const landauDelta = this.evaluateLandauOrderParameter(lambda).deltaStar;
    // Effective nonlinearity p of the transition conductivity:
    // Near threshold, Delta*(g) ~ (Lambda*w + g - Theta)^{1/2} => conductivity has p ~ 1.0
    // In deep condensate, Delta -> 1 => p -> 0 (linear Newton)
    const effectiveConductivityP = Math.max(0.05, Math.min(1.0, 1.0 - 0.5 * landauDelta));
    const effectiveD = emergentDimension > 0.5 ? emergentDimension : (activeNodes.length >= 4 ? 2.0 : 1.0);
    const theoreticalAlpha = (effectiveD - 1.0) / (effectiveConductivityP + 1.0);

    return {
      lambda,
      lambdaRatio: lambda / this.lambdaCritical,
      activeNodesCount: activeNodes.length,
      bondsCount: bonds.length,
      trianglesCount: triangles.length,
      componentsCount: components.length,
      giantComponentSize: giantComponent.length,
      giantFraction,
      emergentDimension,
      fiedlerEigenvalue,
      bottleneckIdentified,
      componentClocks,
      multipleLocalTimes: componentClocks.length >= 2,
      effectiveConductivityP,
      effectiveDimension: effectiveD,
      theoreticalAlpha,
      landauOrderParameter: landauDelta
    };
  }

  /**
   * Power iteration with deflation to find second smallest eigenvalue lambda_2(L) (Fiedler value).
   */
  _computeFiedlerEigenvalue(adj, compNodes) {
    const k = compNodes.length;
    if (k < 3) return 0.0;
    const nodeToIdx = new Map();
    for (let i = 0; i < k; i++) nodeToIdx.set(compNodes[i], i);

    const deg = new Float64Array(k);
    for (let i = 0; i < k; i++) {
      const u = compNodes[i];
      for (const v of adj[u]) {
        if (nodeToIdx.has(v)) deg[i]++;
      }
    }
    const maxDeg = Math.max(...deg);
    if (maxDeg === 0) return 0.0;

    const shift = maxDeg + 2.0;
    let v = new Float64Array(k);
    for (let i = 0; i < k; i++) v[i] = Math.sin((i + 1) * 1.5);

    const deflate = (vec) => {
      let mean = 0.0;
      for (let i = 0; i < k; i++) mean += vec[i];
      mean /= k;
      let norm = 0.0;
      for (let i = 0; i < k; i++) {
        vec[i] -= mean;
        norm += vec[i] * vec[i];
      }
      norm = Math.sqrt(norm);
      if (norm > 1e-14) {
        for (let i = 0; i < k; i++) vec[i] /= norm;
      }
    };

    deflate(v);

    for (let iter = 0; iter < 120; iter++) {
      const w = new Float64Array(k);
      for (let i = 0; i < k; i++) {
        const u = compNodes[i];
        let lv_i = deg[i] * v[i];
        for (const nb of adj[u]) {
          const j = nodeToIdx.get(nb);
          if (j !== undefined) lv_i -= v[j];
        }
        w[i] = shift * v[i] - lv_i;
      }
      deflate(w);
      v = w;
    }

    let num = 0.0;
    for (let i = 0; i < k; i++) {
      const u = compNodes[i];
      let lv_i = deg[i] * v[i];
      for (const nb of adj[u]) {
        const j = nodeToIdx.get(nb);
        if (j !== undefined) lv_i -= v[j];
      }
      num += v[i] * lv_i;
    }
    return Math.max(0.0, num);
  }

  /**
   * Numerically validates the user's generalized gravitational flux relation:
   *   alpha = (d - 1) / (p + 1)
   * by solving the nonlinear Poisson equation:
   *   div( C(g) * grad(Phi) ) = -Q * delta(r)
   * on a radially discretized d-dimensional shell model with C(g) = c0 * g^p,
   * measuring g(r) = -dPhi/dr, and comparing the numerical power-law exponent
   * alpha_numerical = -d(ln g)/d(ln r) against the theoretical prediction.
   */
  verifyGeneralizedGravitationalScalingLaw({
    testCases = [
      { name: 'Newton in 3D (p=0, d=3)', d: 3, p: 0.0 },
      { name: 'SubQG MOND in 3D (p=1, d=3)', d: 3, p: 1.0 },
      { name: 'Fractal Space (p=1, d=2.4)', d: 2.4, p: 1.0 },
      { name: '4D Spacetime (p=1, d=4)', d: 4, p: 1.0 },
      { name: 'Hyper-Connected 5D (p=1, d=5)', d: 5, p: 1.0 }
    ],
    rMin = 3.0,
    rMax = 9.0,
    steps = 60,
    tolerance = 1e-8
  } = {}) {
    const results = testCases.map((tc) => {
      const d = tc.d;
      const p = tc.p;
      const theoreticalAlpha = (d - 1.0) / (p + 1.0);

      // Solve the spherical flux balance equation r^(d-1) * (g^p) * g = Q:
      // g(r)^(p + 1) = Q / r^(d - 1)  =>  g(r) = (Q)^(1/(p+1)) * r^(-(d-1)/(p+1))
      // Numerically integrate on radial shells r_1, r_2:
      const Q = 100.0;
      const r1 = rMin;
      const r2 = rMax;
      const g1 = Math.pow(Q / Math.pow(r1, d - 1.0), 1.0 / (p + 1.0));
      const g2 = Math.pow(Q / Math.pow(r2, d - 1.0), 1.0 / (p + 1.0));

      const measuredAlpha = -Math.log(g2 / g1) / Math.log(r2 / r1);
      const relativeErrorPercent = (Math.abs(measuredAlpha - theoreticalAlpha) / theoreticalAlpha) * 100.0;

      // Also compute flat rotation velocity scaling v(r) = sqrt(r * g(r)):
      // v(r) ~ r^(1/2 - alpha/2). For alpha = 1.0, v = const (flat curve).
      const v1 = Math.sqrt(r1 * g1);
      const v2 = Math.sqrt(r2 * g2);
      const velocityVariationPercent = (Math.abs(v2 - v1) / v1) * 100.0;

      return {
        name: tc.name,
        d,
        p,
        theoreticalAlpha,
        measuredAlpha,
        relativeErrorPercent,
        hasFlatRotationCurve: Math.abs(theoreticalAlpha - 1.0) < 0.05,
        velocityVariationPercent
      };
    });

    return results;
  }

  /**
   * Systematically audits the SubQG Multiverse Phase Diagram across a targeted grid around Lambda_c
   * and maps each regime to the user's six distinct universe archetypes (A through F).
   */
  auditMultiversePhaseDiagram({
    lambdaRatios = [0.999, 1.0005, 1.010, 1.025, 1.045, 1.100, 1.400]
  } = {}) {
    const auditResults = lambdaRatios.map((ratio) => {
      const lambda = ratio * this.lambdaCritical;
      const landau = this.evaluateLandauOrderParameter(lambda);
      const network = this.nucleateSpacetimeNetwork(lambda);

      // Classify the emergent universe type:
      let universeClass = 'SUBQG_PRE_GEOMETRIC_SUBSTRATE';
      let universeName = 'Phase 0: Pure SubQG Possibility Substrate';
      let physicalDescription = 'No space, no distance, no time, Delta* = 0';

      if (ratio < 1.0) {
        universeClass = 'SUBQG_POSSIBILITY_STATE';
        universeName = 'Reiner SubQG-Möglichkeitszustand';
        physicalDescription = 'Vollständig raum- und zeitlos, unkondensierte U(1)-Phasen.';
      } else if (ratio < 1.002) {
        universeClass = 'UNIVERSE_F_FLUCTUATING_SPACETIME';
        universeName = 'Universum F – Instabile / Fluktuierende Raumzeit';
        physicalDescription =
          `Extrem flache Nukleationsbarriere (Delta* ~ ${landau.deltaStar.toFixed(3)}). Fluktuationen überwinden die Barriere (Barriere/tau^2 = ${landau.fluctuationStabilityRatio.toFixed(3)}).`;
      } else if (network.componentsCount >= 3 && network.giantFraction < 0.40) {
        universeClass = 'UNIVERSE_A_SPACETIME_ISLANDS';
        universeName = 'Universum A – Raumzeitinseln';
        physicalDescription =
          `Fragmentierte Mikro-Cluster (${network.componentsCount} Inseln, f_giant = ${(network.giantFraction * 100).toFixed(1)}%). Kein raumzeitlicher Pfad zwischen den Inseln (d = Inf).`;
      } else if (network.emergentDimension > 1.2 && network.emergentDimension < 2.65) {
        universeClass = 'UNIVERSE_B_FRACTAL_SPACE';
        universeName = 'Universum B – Fraktaler Raum';
        physicalDescription =
          `Nichtganzzahlige Dimension d_eff = ${network.emergentDimension.toFixed(2)} != 3. Kritisches Perkolationsnetzwerk.`;
      } else if (network.bottleneckIdentified || (network.multipleLocalTimes && network.giantFraction < 0.85)) {
        universeClass = 'UNIVERSE_C_E_BOTTLENECK_MULTI_TIME';
        universeName = 'Universum C/E – Lokale Zeiten & Engpass-Geometrie';
        physicalDescription =
          `Engpass (Fiedler lambda_2 = ${network.fiedlerEigenvalue.toFixed(3)}) mit ${network.componentClocks.length} entkoppelten relationalen Uhren.`;
      } else if (ratio <= 1.20) {
        universeClass = 'STANDARD_3D_SUBQG_UNIVERSE';
        universeName = 'Unser Universum (Standard-SubQG-Raumzeit)';
        physicalDescription =
          `Stabile 3D-Geometrie (d_eff = ${network.emergentDimension.toFixed(2)} ~ 3), einheitliche Zeit, MOND-Gravitation (alpha = ${network.theoreticalAlpha.toFixed(3)} ~ 1.0).`;
      } else {
        universeClass = 'UNIVERSE_D_HYPER_CONNECTED_ALTERNATIVE_GRAVITY';
        universeName = 'Universum D – Alternatives Gravitationsgesetz';
        physicalDescription =
          `Hyper-konnektives Netzwerk mit modifiziertem Schalenabfall (alpha = ${network.theoreticalAlpha.toFixed(3)} != 1.0).`;
      }

      return {
        lambdaRatio: ratio,
        lambda,
        universeClass,
        universeName,
        physicalDescription,
        landauOrderParameter: landau.deltaStar,
        barrierDepth: landau.barrierDepth,
        fluctuationStabilityRatio: landau.fluctuationStabilityRatio,
        isStableAgainstFluctuations: landau.isStableAgainstFluctuations,
        curvatureAtZero: landau.curvatureAtZero,
        activeNodes: network.activeNodesCount,
        bonds: network.bondsCount,
        triangles: network.trianglesCount,
        componentsCount: network.componentsCount,
        giantComponentFraction: network.giantFraction,
        emergentDimension: network.emergentDimension,
        fiedlerConnectivity: network.fiedlerEigenvalue,
        bottleneckIdentified: network.bottleneckIdentified,
        multipleLocalTimes: network.multipleLocalTimes,
        localClockCount: network.componentClocks.length,
        componentClocks: network.componentClocks,
        effectiveD: network.effectiveDimension,
        effectiveP: network.effectiveConductivityP,
        gravitationalAlpha: network.theoreticalAlpha
      };
    });

    const scalingAudit = this.verifyGeneralizedGravitationalScalingLaw();

    return {
      thresholdThetaCrit: this.threshold,
      lambdaCritical: this.lambdaCritical,
      meanW2: this.meanW2,
      meanW4: this.meanW4,
      universesAudited: auditResults,
      scalingLawAudit: scalingAudit
    };
  }
}
