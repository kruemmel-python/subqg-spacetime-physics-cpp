import { Joint } from './Joint.mjs';
import { Vec2 } from '../../math/Vec2.mjs';
import { Mat22 } from '../../math/Mat22.mjs';

/**
 * WeldJoint: Schweißgelenk (starre Verbindung zweier Körper).
 * Fixiert sowohl Relativposition als auch Relativwinkel komplett.
 */
export class WeldJoint extends Joint {
  constructor(bodyA, bodyB, anchorWorld, config = {}) {
    super(bodyA, bodyB, 'weld', config);
    this.localAnchorA = bodyA.transform.inverseTransformPoint(anchorWorld);
    this.localAnchorB = bodyB.transform.inverseTransformPoint(anchorWorld);
    this.referenceAngle = config.referenceAngle ?? (bodyB.angle - bodyA.angle);

    this.rA = new Vec2(0, 0);
    this.rB = new Vec2(0, 0);
    this.linearMass = new Mat22();
    this.angularMass = 0.0;
    this.linearImpulse = new Vec2(0, 0);
    this.angularImpulse = 0.0;
    this.linearBias = new Vec2(0, 0);
    this.angularBias = 0.0;
  }

  initVelocityConstraints(dt) {
    const bA = this.bodyA;
    const bB = this.bodyB;

    this.rA = bA.transform.transformVector(this.localAnchorA);
    this.rB = bB.transform.transformVector(this.localAnchorB);

    const mA = bA.invMass;
    const mB = bB.invMass;
    const iA = bA.invInertia;
    const iB = bB.invInertia;

    const k11 = mA + mB + iA * this.rA.y * this.rA.y + iB * this.rB.y * this.rB.y;
    const k12 = -iA * this.rA.x * this.rA.y - iB * this.rB.x * this.rB.y;
    const k21 = k12;
    const k22 = mA + mB + iA * this.rA.x * this.rA.x + iB * this.rB.x * this.rB.x;
    this.linearMass.setElements(k11, k12, k21, k22).invert();

    this.angularMass = iA + iB > 0.0 ? 1.0 / (iA + iB) : 0.0;

    const pA = Vec2.add(bA.position, this.rA);
    const pB = Vec2.add(bB.position, this.rB);
    const rawLinBias = Vec2.scale(Vec2.sub(pB, pA), 0.2 / Math.max(dt, 1e-4));
    const biasLen = rawLinBias.length();
    this.linearBias = biasLen > 3.5 ? Vec2.scale(rawLinBias, 3.5 / biasLen) : rawLinBias;
    const rawAngBias = 0.2 * (bB.angle - bA.angle - this.referenceAngle) / Math.max(dt, 1e-4);
    this.angularBias = Math.max(-4.0, Math.min(4.0, rawAngBias));

    // Warm starting
    bA.velocity.subScaled(this.linearImpulse, mA);
    bA.angularVelocity -= iA * (this.rA.cross(this.linearImpulse) + this.angularImpulse);
    bB.velocity.addScaled(this.linearImpulse, mB);
    bB.angularVelocity += iB * (this.rB.cross(this.linearImpulse) + this.angularImpulse);
  }

  solveVelocityConstraints() {
    const bA = this.bodyA;
    const bB = this.bodyB;
    const mA = bA.invMass;
    const mB = bB.invMass;
    const iA = bA.invInertia;
    const iB = bB.invInertia;

    // Linear
    const vA = Vec2.add(bA.velocity, Vec2.crossScalarVec(bA.angularVelocity, this.rA));
    const vB = Vec2.add(bB.velocity, Vec2.crossScalarVec(bB.angularVelocity, this.rB));
    const cDotLinear = Vec2.add(Vec2.sub(vB, vA), this.linearBias);
    const linImp = this.linearMass.mulVec(cDotLinear).negate();
    this.linearImpulse.add(linImp);

    bA.velocity.subScaled(linImp, mA);
    bA.angularVelocity -= iA * this.rA.cross(linImp);
    bB.velocity.addScaled(linImp, mB);
    bB.angularVelocity += iB * this.rB.cross(linImp);

    // Angular
    const cDotAng = bB.angularVelocity - bA.angularVelocity + this.angularBias;
    const angImp = -this.angularMass * cDotAng;
    this.angularImpulse += angImp;

    bA.angularVelocity -= iA * angImp;
    bB.angularVelocity += iB * angImp;
  }

  getReactionForce(dt) {
    return this.linearImpulse.length() / Math.max(dt, 1e-4);
  }

  getReactionTorque(dt) {
    return Math.abs(this.angularImpulse) / Math.max(dt, 1e-4);
  }
}
