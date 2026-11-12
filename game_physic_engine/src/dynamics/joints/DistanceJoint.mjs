import { Joint } from './Joint.mjs';
import { Vec2 } from '../../math/Vec2.mjs';

/**
 * DistanceJoint: Hält zwei Ankerpunkte auf festem Abstand (starre Stange)
 * oder simuliert eine gedämpfte Federung (z. B. Fahrzeug-Stoßdämpfer, Seil).
 */
export class DistanceJoint extends Joint {
  constructor(bodyA, bodyB, anchorA, anchorB, config = {}) {
    super(bodyA, bodyB, 'distance', config);
    this.localAnchorA = bodyA.transform.inverseTransformPoint(anchorA);
    this.localAnchorB = bodyB.transform.inverseTransformPoint(anchorB);

    const worldA = bodyA.transform.transformPoint(this.localAnchorA);
    const worldB = bodyB.transform.transformPoint(this.localAnchorB);
    this.length = config.length ?? worldA.distanceTo(worldB);

    // Federungsparameter
    this.frequencyHz = config.frequencyHz ?? 0.0; // 0 = starr
    this.dampingRatio = config.dampingRatio ?? 0.0;

    // Interne Solver-Variablen
    this.u = new Vec2(0, 1);
    this.rA = new Vec2(0, 0);
    this.rB = new Vec2(0, 0);
    this.mass = 0.0;
    this.impulse = 0.0;
    this.bias = 0.0;
    this.gamma = 0.0;
  }

  initVelocityConstraints(dt) {
    const bA = this.bodyA;
    const bB = this.bodyB;

    this.rA = bA.transform.transformVector(this.localAnchorA);
    this.rB = bB.transform.transformVector(this.localAnchorB);

    const pA = Vec2.add(bA.position, this.rA);
    const pB = Vec2.add(bB.position, this.rB);
    const d = Vec2.sub(pB, pA);
    const currentLen = d.length();

    if (currentLen > 1e-6) {
      this.u = Vec2.scale(d, 1.0 / currentLen);
    } else {
      this.u.set(0, 0);
    }

    const crAu = this.rA.cross(this.u);
    const crBu = this.rB.cross(this.u);
    let invMass = bA.invMass + bB.invMass + bA.invInertia * crAu * crAu + bB.invInertia * crBu * crBu;

    if (this.frequencyHz > 0.0) {
      const C = currentLen - this.length;
      const omega = 2.0 * Math.PI * this.frequencyHz;
      const dCoeff = 2.0 * this.mass * this.dampingRatio * omega;
      const kCoeff = this.mass * omega * omega;

      this.gamma = dt * (dCoeff + dt * kCoeff);
      this.gamma = this.gamma !== 0.0 ? 1.0 / this.gamma : 0.0;
      this.bias = C * dt * kCoeff * this.gamma;

      invMass += this.gamma;
      this.mass = invMass !== 0.0 ? 1.0 / invMass : 0.0;
    } else {
      this.gamma = 0.0;
      const rawBias = 0.2 * Math.max(0, currentLen - this.length) / Math.max(dt, 1e-4);
      this.bias = Math.min(3.5, rawBias); // Begrenzung gegen Resonanzkatastrophen
      this.mass = invMass !== 0.0 ? 1.0 / invMass : 0.0;
    }

    // Warm starting
    const p = Vec2.scale(this.u, this.impulse);
    bA.velocity.subScaled(p, bA.invMass);
    bA.angularVelocity -= bA.invInertia * this.rA.cross(p);
    bB.velocity.addScaled(p, bB.invMass);
    bB.angularVelocity += bB.invInertia * this.rB.cross(p);
  }

  solveVelocityConstraints() {
    const bA = this.bodyA;
    const bB = this.bodyB;

    const vA = Vec2.add(bA.velocity, Vec2.crossScalarVec(bA.angularVelocity, this.rA));
    const vB = Vec2.add(bB.velocity, Vec2.crossScalarVec(bB.angularVelocity, this.rB));
    const vRel = this.u.dot(Vec2.sub(vB, vA));

    let impulse = -this.mass * (vRel + this.bias + this.gamma * this.impulse);
    this.impulse += impulse;

    const p = Vec2.scale(this.u, impulse);
    bA.velocity.subScaled(p, bA.invMass);
    bA.angularVelocity -= bA.invInertia * this.rA.cross(p);
    bB.velocity.addScaled(p, bB.invMass);
    bB.angularVelocity += bB.invInertia * this.rB.cross(p);
  }

  getReactionForce(dt) {
    return Math.abs(this.impulse) / Math.max(dt, 1e-4);
  }
}
