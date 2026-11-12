import { Joint } from './Joint.mjs';
import { Vec2 } from '../../math/Vec2.mjs';

/**
 * PulleyJoint: Flaschenzug- / Seilzuggelenk.
 * Verbindet zwei Körper über zwei fixe Umlenkrollen mit Übersetzung:
 * length1 + ratio * length2 = totalLength
 */
export class PulleyJoint extends Joint {
  constructor(bodyA, bodyB, groundAnchorA, groundAnchorB, anchorA, anchorB, ratio = 1.0, config = {}) {
    super(bodyA, bodyB, 'pulley', config);
    this.groundAnchorA = groundAnchorA.clone();
    this.groundAnchorB = groundAnchorB.clone();
    this.localAnchorA = bodyA.transform.inverseTransformPoint(anchorA);
    this.localAnchorB = bodyB.transform.inverseTransformPoint(anchorB);
    this.ratio = ratio;

    const pA = bodyA.transform.transformPoint(this.localAnchorA);
    const pB = bodyB.transform.transformPoint(this.localAnchorB);
    this.lengthA = pA.distanceTo(this.groundAnchorA);
    this.lengthB = pB.distanceTo(this.groundAnchorB);
    this.constant = this.lengthA + this.ratio * this.lengthB;

    this.uA = new Vec2(0, 1);
    this.uB = new Vec2(0, 1);
    this.rA = new Vec2(0, 0);
    this.rB = new Vec2(0, 0);
    this.mass = 0.0;
    this.impulse = 0.0;
    this.bias = 0.0;
  }

  initVelocityConstraints(dt) {
    const bA = this.bodyA;
    const bB = this.bodyB;

    this.rA = bA.transform.transformVector(this.localAnchorA);
    this.rB = bB.transform.transformVector(this.localAnchorB);

    const pA = Vec2.add(bA.position, this.rA);
    const pB = Vec2.add(bB.position, this.rB);

    const sA = Vec2.sub(pA, this.groundAnchorA);
    const sB = Vec2.sub(pB, this.groundAnchorB);

    const lenA = sA.length();
    const lenB = sB.length();

    this.uA = lenA > 1e-6 ? Vec2.scale(sA, 1.0 / lenA) : new Vec2(0, 0);
    this.uB = lenB > 1e-6 ? Vec2.scale(sB, 1.0 / lenB) : new Vec2(0, 0);

    const crAu = this.rA.cross(this.uA);
    const crBu = this.rB.cross(this.uB);

    const mA = bA.invMass + bA.invInertia * crAu * crAu;
    const mB = bB.invMass + bB.invInertia * crBu * crBu;

    const k = mA + this.ratio * this.ratio * mB;
    this.mass = k > 1e-12 ? 1.0 / k : 0.0;

    const C = (lenA + this.ratio * lenB) - this.constant;
    this.bias = 0.2 * Math.max(0, C) / Math.max(dt, 1e-4);

    // Warm starting
    const p1 = Vec2.scale(this.uA, -this.impulse);
    const p2 = Vec2.scale(this.uB, -this.ratio * this.impulse);
    bA.velocity.addScaled(p1, bA.invMass);
    bA.angularVelocity += bA.invInertia * this.rA.cross(p1);
    bB.velocity.addScaled(p2, bB.invMass);
    bB.angularVelocity += bB.invInertia * this.rB.cross(p2);
  }

  solveVelocityConstraints() {
    const bA = this.bodyA;
    const bB = this.bodyB;

    const vA = Vec2.add(bA.velocity, Vec2.crossScalarVec(bA.angularVelocity, this.rA));
    const vB = Vec2.add(bB.velocity, Vec2.crossScalarVec(bB.angularVelocity, this.rB));

    const cDot = this.uA.dot(vA) + this.ratio * this.uB.dot(vB);
    let impulse = -this.mass * (cDot + this.bias);
    const oldImp = this.impulse;
    this.impulse = Math.max(0.0, oldImp + impulse);
    impulse = this.impulse - oldImp;

    const p1 = Vec2.scale(this.uA, -impulse);
    const p2 = Vec2.scale(this.uB, -this.ratio * impulse);
    bA.velocity.addScaled(p1, bA.invMass);
    bA.angularVelocity += bA.invInertia * this.rA.cross(p1);
    bB.velocity.addScaled(p2, bB.invMass);
    bB.angularVelocity += bB.invInertia * this.rB.cross(p2);
  }

  getReactionForce(dt) {
    return Math.abs(this.impulse) / Math.max(dt, 1e-4);
  }
}
