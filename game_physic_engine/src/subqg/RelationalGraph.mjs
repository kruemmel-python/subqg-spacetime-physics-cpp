import { Vec2 } from '../math/Vec2.mjs';

/**
 * RelationalGraph: Das interne diskrete Kantennetzwerk der Subquantum Graphity (SubQG).
 * Das Netzwerk dient als quantenmechanisches Hintergrundmodell, auf dem Raum und Metrik
 * relational emergieren.
 */
export class RelationalGraph {
  constructor(config = {}) {
    this.gridSpacing = config.gridSpacing ?? 1.0; // Gitterabstand in Welteinheiten (Meter)
    this.beta = config.beta ?? 0.05;              // SubQG metrische Kopplungskonstante
    this.extentX = config.extentX ?? 40.0;        // Halbe Ausdehnung in X
    this.extentY = config.extentY ?? 30.0;        // Halbe Ausdehnung in Y

    this.nodes = new Map(); // id -> { pos: Vec2, rho: number, phi: number, clock: number }
    this.edges = [];        // Array von { u: string, v: string, x_e: number, restLen: 1.0, weight: 1.0 }

    this._initLattice();
  }

  _nodeKey(gx, gy) {
    return `${gx},${gy}`;
  }

  _initLattice() {
    const minGX = Math.floor(-this.extentX / this.gridSpacing);
    const maxGX = Math.ceil(this.extentX / this.gridSpacing);
    const minGY = Math.floor(-this.extentY / this.gridSpacing);
    const maxGY = Math.ceil(this.extentY / this.gridSpacing);

    // Erzeuge Knoten
    for (let gx = minGX; gx <= maxGX; gx++) {
      for (let gy = minGY; gy <= maxGY; gy++) {
        const key = this._nodeKey(gx, gy);
        this.nodes.set(key, {
          gx,
          gy,
          pos: new Vec2(gx * this.gridSpacing, gy * this.gridSpacing),
          rho: 0.0,
          phi: 0.0,
          clock: 0
        });
      }
    }

    // Erzeuge relationale Kanten (4-Nachbarschaft + Diagonalen)
    const deltas = [
      [1, 0], [0, 1], [1, 1], [1, -1]
    ];

    for (let gx = minGX; gx <= maxGX; gx++) {
      for (let gy = minGY; gy <= maxGY; gy++) {
        const uKey = this._nodeKey(gx, gy);
        for (const [dx, dy] of deltas) {
          const vKey = this._nodeKey(gx + dx, gy + dy);
          if (this.nodes.has(vKey)) {
            const diag = (dx !== 0 && dy !== 0);
            this.edges.push({
              u: uKey,
              v: vKey,
              x_e: 1.0, // Flache Hintergrundmetrik (x_e = 1.0)
              restLen: diag ? Math.SQRT2 : 1.0,
              weight: diag ? 0.5 : 1.0
            });
          }
        }
      }
    }
  }

  /**
   * Setzt die Dichten rho auf allen Knoten zurück
   */
  resetDensities() {
    for (const node of this.nodes.values()) {
      node.rho = 0.0;
      node.phi = 0.0;
    }
  }

  /**
   * Injiziert die Massendichte eines Körpers (als SubQG-Wellenpaket) in das Netzwerk
   */
  injectBodyMass(body) {
    const pos = body.position;
    const mass = body.mass;
    if (mass <= 0 || !Number.isFinite(mass)) return;

    // Kernel-Ausbreitung (charakteristische Wellenpaketbreite sigma)
    const sigma = Math.max(this.gridSpacing * 0.8, body.boundingRadius * 0.5);
    const sigmaSq2 = 2.0 * sigma * sigma;
    const radiusCells = Math.ceil((sigma * 2.5) / this.gridSpacing);

    const centerGX = Math.round(pos.x / this.gridSpacing);
    const centerGY = Math.round(pos.y / this.gridSpacing);

    let weightSum = 0.0;
    const affectedNodes = [];

    for (let gx = centerGX - radiusCells; gx <= centerGX + radiusCells; gx++) {
      for (let gy = centerGY - radiusCells; gy <= centerGY + radiusCells; gy++) {
        const key = this._nodeKey(gx, gy);
        const node = this.nodes.get(key);
        if (node) {
          const distSq = node.pos.distanceToSq(pos);
          const w = Math.exp(-distSq / sigmaSq2);
          weightSum += w;
          affectedNodes.push({ node, w });
        }
      }
    }

    if (weightSum > 1e-9) {
      const normFactor = mass / weightSum;
      for (const { node, w } of affectedNodes) {
        node.rho += w * normFactor;
        node.clock += 1; // Lokaler Kausal-Uhr-Schritt bei Materie-Ereignis
      }
    }
  }

  /**
   * Interpoliert das metrische Potential phi(x, y) an beliebigen Weltkoordinaten
   */
  samplePotential(worldPos) {
    const gx = worldPos.x / this.gridSpacing;
    const gy = worldPos.y / this.gridSpacing;
    const i = Math.floor(gx);
    const j = Math.floor(gy);
    const fx = gx - i;
    const fy = gy - j;

    const n00 = this.nodes.get(this._nodeKey(i, j))?.phi ?? 0;
    const n10 = this.nodes.get(this._nodeKey(i + 1, j))?.phi ?? 0;
    const n01 = this.nodes.get(this._nodeKey(i, j + 1))?.phi ?? 0;
    const n11 = this.nodes.get(this._nodeKey(i + 1, j + 1))?.phi ?? 0;

    // Bilineare Interpolation
    const top = n00 * (1 - fx) + n10 * fx;
    const bottom = n01 * (1 - fx) + n11 * fx;
    return top * (1 - fy) + bottom * fy;
  }

  /**
   * Berechnet den Gradienten des metrischen Potentials grad(phi) an beliebiger Stelle
   */
  sampleGradient(worldPos) {
    const eps = this.gridSpacing * 0.25;
    const phiX1 = this.samplePotential(new Vec2(worldPos.x + eps, worldPos.y));
    const phiX0 = this.samplePotential(new Vec2(worldPos.x - eps, worldPos.y));
    const phiY1 = this.samplePotential(new Vec2(worldPos.x, worldPos.y + eps));
    const phiY0 = this.samplePotential(new Vec2(worldPos.x, worldPos.y - eps));

    return new Vec2(
      (phiX1 - phiX0) / (2.0 * eps),
      (phiY1 - phiY0) / (2.0 * eps)
    );
  }
}
