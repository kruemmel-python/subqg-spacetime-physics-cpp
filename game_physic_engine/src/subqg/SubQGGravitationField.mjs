import { Vec2 } from '../math/Vec2.mjs';

/**
 * SubQGGravitationField: Berechnet die Gravitationskräfte auf Körper
 * basierend auf dem emergenten SubQG-Gradienten -grad(Phi).
 * 
 * Formal in Lean 4 bewiesen:
 * 'SubQG.constant_metric_gradient_gives_universal_acceleration':
 * F_grav = -M * grad(Phi) => a = F_grav / M = -grad(Phi) = g (Masseunabhängig!)
 */
export class SubQGGravitationField {
  constructor(config = {}) {
    // Standard Erdbeschleunigung g = (0, -9.81) m/s²
    this.gravity = config.gravity ? config.gravity.clone() : new Vec2(0, -9.81);
    this.enableMutualAttraction = config.enableMutualAttraction ?? false;
    this.G = config.G ?? 1.0; // SubQG Gravitationskonstante für n-Körper-Attraktion
  }

  setGravity(gx, gy) {
    this.gravity.set(gx, gy);
  }

  /**
   * Wendet die Gravitation auf alle dynamischen Körper an
   */
  applyGravity(bodies, graph = null) {
    for (const body of bodies) {
      if (body.type !== 'dynamic' || body.mass <= 0 || body.isSleeping) continue;

      // 1. Hintergrundbeschleunigung g (aus uniformem SubQG-Metrikgradienten)
      const fGrav = Vec2.scale(this.gravity, body.mass * body.gravityScale);
      body.applyForce(fGrav);

      // 2. Optional: Lokaler Gradient aus dem SubQG-Gitterpotential
      if (graph && this.enableMutualAttraction) {
        const grad = graph.sampleGradient(body.position);
        // F = -m * grad(Phi)
        const fLattice = new Vec2(-body.mass * grad.x, -body.mass * grad.y);
        body.applyForce(fLattice);
      }
    }

    // 3. Optional: Wechselseitige SubQG Punktkörper-Attraktion (N-Körper)
    if (this.enableMutualAttraction && bodies.length > 1) {
      const n = bodies.length;
      for (let i = 0; i < n; i++) {
        const b1 = bodies[i];
        if (b1.type !== 'dynamic' || b1.mass <= 0) continue;

        for (let j = i + 1; j < n; j++) {
          const b2 = bodies[j];
          if (b2.mass <= 0) continue;

          const delta = Vec2.sub(b2.position, b1.position);
          const distSq = delta.lengthSq() + 0.04; // Weicher Kern gegen Singularitäten (Plummer-Radius)
          const dist = Math.sqrt(distSq);
          const forceMagnitude = (this.G * b1.mass * b2.mass) / distSq;
          const force = Vec2.scale(delta, forceMagnitude / dist);

          b1.applyForce(force);
          if (b2.type === 'dynamic') {
            b2.applyForce(force.clone().negate());
          }
        }
      }
    }
  }
}
