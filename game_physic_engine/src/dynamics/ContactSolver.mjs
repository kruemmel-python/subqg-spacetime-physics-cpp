import { Vec2 } from '../math/Vec2.mjs';

/**
 * ContactSolver: Hochpräziser sequentieller Impulssolver (Projected Gauss-Seidel)
 * zur simultanen Lösung von Normalstößen, Haft-/Gleitreibung (Coulomb-Reibungskegel)
 * und elastischem Rückprall mit Warm-Starting und Baumgarte-Stabilisierung.
 */
export class ContactSolver {
  constructor(bridge) {
    this.bridge = bridge;
    this.restitutionThreshold = 0.5; // m/s: darunter elastischer Stoß abgedämpft gegen Ruhezittern
  }

  initVelocityConstraints(manifolds, dt) {
    for (const m of manifolds) {
      if (m.isTrigger) continue;

      const bA = m.bodyA;
      const bB = m.bodyB;
      const mA = bA.invMass;
      const mB = bB.invMass;
      const iA = bA.invInertia;
      const iB = bB.invInertia;
      const normal = m.normal;
      const tangent = m.tangent;

      for (const cp of m.points) {
        // Hebelarme berechnen
        cp.rA = Vec2.sub(cp.point, bA.position);
        cp.rB = Vec2.sub(cp.point, bB.position);

        const rnA = cp.rA.cross(normal);
        const rnB = cp.rB.cross(normal);
        const kNormal = mA + mB + iA * rnA * rnA + iB * rnB * rnB;
        cp.normalMass = kNormal > 1e-12 ? 1.0 / kNormal : 0.0;

        const rtA = cp.rA.cross(tangent);
        const rtB = cp.rB.cross(tangent);
        const kTangent = mA + mB + iA * rtA * rtA + iB * rtB * rtB;
        cp.tangentMass = kTangent > 1e-12 ? 1.0 / kTangent : 0.0;

        // Relative Geschwindigkeit an Kontaktstelle
        const vA = bA.getVelocityAtPoint(cp.point);
        const vB = bB.getVelocityAtPoint(cp.point);
        const vRel = Vec2.sub(vB, vA);
        const vNormal = vRel.dot(normal);

        // Baumgarte-Stabilisierung
        const penBias = this.bridge.computePenetrationBias(cp.penetration, dt);

        // Restitutions-Bias (Rückprall)
        let restBias = 0.0;
        if (vNormal < -this.restitutionThreshold) {
          restBias = -m.restitution * vNormal;
        }

        cp.bias = penBias + restBias;

        // Warm-Starting: Wende akkumulierte Impulse aus vorherigem Frame an
        const p = Vec2.add(
          Vec2.scale(normal, cp.normalImpulse),
          Vec2.scale(tangent, cp.tangentImpulse)
        );

        if (bA.type === 'dynamic') {
          bA.velocity.subScaled(p, mA);
          bA.angularVelocity -= iA * cp.rA.cross(p);
        }
        if (bB.type === 'dynamic') {
          bB.velocity.addScaled(p, mB);
          bB.angularVelocity += iB * cp.rB.cross(p);
        }
      }
    }
  }

  solveVelocityConstraints(manifolds) {
    for (const m of manifolds) {
      if (m.isTrigger) continue;

      const bA = m.bodyA;
      const bB = m.bodyB;
      const mA = bA.invMass;
      const mB = bB.invMass;
      const iA = bA.invInertia;
      const iB = bB.invInertia;
      const normal = m.normal;
      const tangent = m.tangent;
      const friction = m.friction;

      for (const cp of m.points) {
        // 1. Reibungs-Impuls (Tangential)
        const vA1 = bA.getVelocityAtPoint(cp.point);
        const vB1 = bB.getVelocityAtPoint(cp.point);
        const vRel1 = Vec2.sub(vB1, vA1);
        const vTangent = vRel1.dot(tangent);

        let lambdaT = -vTangent * cp.tangentMass;
        // Reibungskegel: |tangentImpulse| <= friction * normalImpulse
        const maxFriction = friction * cp.normalImpulse;
        const oldTangentImpulse = cp.tangentImpulse;
        cp.tangentImpulse = Math.max(-maxFriction, Math.min(maxFriction, oldTangentImpulse + lambdaT));
        lambdaT = cp.tangentImpulse - oldTangentImpulse;

        const pT = Vec2.scale(tangent, lambdaT);
        if (bA.type === 'dynamic') {
          bA.velocity.subScaled(pT, mA);
          bA.angularVelocity -= iA * cp.rA.cross(pT);
        }
        if (bB.type === 'dynamic') {
          bB.velocity.addScaled(pT, mB);
          bB.angularVelocity += iB * cp.rB.cross(pT);
        }

        // 2. Normal-Impuls (Nicht-Durchdringung)
        const vA2 = bA.getVelocityAtPoint(cp.point);
        const vB2 = bB.getVelocityAtPoint(cp.point);
        const vRel2 = Vec2.sub(vB2, vA2);
        const vNormal = vRel2.dot(normal);

        let lambdaN = -(vNormal - cp.bias) * cp.normalMass;
        const oldNormalImpulse = cp.normalImpulse;
        cp.normalImpulse = Math.max(0.0, oldNormalImpulse + lambdaN);
        lambdaN = cp.normalImpulse - oldNormalImpulse;

        const pN = Vec2.scale(normal, lambdaN);
        if (bA.type === 'dynamic') {
          bA.velocity.subScaled(pN, mA);
          bA.angularVelocity -= iA * cp.rA.cross(pN);
        }
        if (bB.type === 'dynamic') {
          bB.velocity.addScaled(pN, mB);
          bB.angularVelocity += iB * cp.rB.cross(pN);
        }
      }
    }
  }
}
