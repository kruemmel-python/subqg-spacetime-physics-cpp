import { Joint } from './Joint.mjs';
import { Vec2 } from '../../math/Vec2.mjs';

/**
 * PrismaticJoint: Schubgelenk (Kolben, Aufzug, Gleitschiene).
 * Erlaubt ausschließlich lineare Verschiebung entlang einer festgelegten Achse
 * und blockiert relative Drehung.
 */
export class PrismaticJoint extends Joint {
  constructor(bodyA, bodyB, anchorWorld, axisWorld, config = {}) {
    super(bodyA, bodyB, 'prismatic', config);
    this.localAnchorA = bodyA.transform.inverseTransformPoint(anchorWorld);
    this.localAnchorB = bodyB.transform.inverseTransformPoint(anchorWorld);
    this.localXAxisA = bodyA.transform.inverseTransformVector(axisWorld).normalize();
    this.localYAxisA = this.localXAxisA.perp();
    this.referenceAngle = config.referenceAngle ?? (bodyB.angle - bodyA.angle);

    // Motor
    this.enableMotor = config.enableMotor ?? false;
    this.motorSpeed = config.motorSpeed ?? 0.0;
    this.maxMotorForce = config.maxMotorForce ?? 20.0;
    this.motorImpulse = 0.0;

    // Translation Limits
    this.enableLimit = config.enableLimit ?? false;
    this.lowerTranslation = config.lowerTranslation ?? -1.0;
    this.upperTranslation = config.upperTranslation ?? 1.0;
    this.limitImpulse = 0.0;

    // Interne Solver-Zustände
    this.rA = new Vec2(0, 0);
    this.rB = new Vec2(0, 0);
    this.axis = new Vec2(1, 0);
    this.perp = new Vec2(0, 1);
    this.perpMass = 0.0;
    this.angularMass = 0.0;
    this.motorMass = 0.0;
    this.perpImpulse = 0.0;
    this.angularImpulse = 0.0;
    this.perpBias = 0.0;
    this.angularBias = 0.0;
  }

  getTranslation() {
    const pA = this.bodyA.transform.transformPoint(this.localAnchorA);
    const pB = this.bodyB.transform.transformPoint(this.localAnchorB);
    const d = Vec2.sub(pB, pA);
    const axis = this.bodyA.transform.transformVector(this.localXAxisA);
    return d.dot(axis);
  }

  initVelocityConstraints(dt) {
    const bA = this.bodyA;
    const bB = this.bodyB;

    this.rA = bA.transform.transformVector(this.localAnchorA);
    this.rB = bB.transform.transformVector(this.localAnchorB);
    this.axis = bA.transform.transformVector(this.localXAxisA);
    this.perp = this.axis.perp();

    const mA = bA.invMass;
    const mB = bB.invMass;
    const iA = bA.invInertia;
    const iB = bB.invInertia;

    const pA = Vec2.add(bA.position, this.rA);
    const pB = Vec2.add(bB.position, this.rB);
    const d = Vec2.sub(pB, pA);

    // K-Terme für Orthogonalität
    const s1 = Vec2.add(d, this.rA).cross(this.perp);
    const s2 = this.rB.cross(this.perp);
    const kPerp = mA + mB + iA * s1 * s1 + iB * s2 * s2;
    this.perpMass = kPerp > 1e-12 ? 1.0 / kPerp : 0.0;

    // K-Term für relative Drehung
    const kAng = iA + iB;
    this.angularMass = kAng > 1e-12 ? 1.0 / kAng : 0.0;

    // Motor Trägheitsmasse entlang Schiene
    const a1 = Vec2.add(d, this.rA).cross(this.axis);
    const a2 = this.rB.cross(this.axis);
    const kMotor = mA + mB + iA * a1 * a1 + iB * a2 * a2;
    this.motorMass = kMotor > 1e-12 ? 1.0 / kMotor : 0.0;

    // Baumgarte-Biases
    this.perpBias = 0.3 * d.dot(this.perp) / Math.max(dt, 1e-4);
    this.angularBias = 0.3 * (bB.angle - bA.angle - this.referenceAngle) / Math.max(dt, 1e-4);

    // Warm starting
    const p = Vec2.scale(this.perp, this.perpImpulse);
    bA.velocity.subScaled(p, mA);
    bA.angularVelocity -= iA * (s1 * this.perpImpulse + this.angularImpulse);
    bB.velocity.addScaled(p, mB);
    bB.angularVelocity += iB * (s2 * this.perpImpulse + this.angularImpulse);
  }

  solveVelocityConstraints() {
    const bA = this.bodyA;
    const bB = this.bodyB;
    const mA = bA.invMass;
    const mB = bB.invMass;
    const iA = bA.invInertia;
    const iB = bB.invInertia;

    // 1. Orthogonale Translation sperren
    const vA = Vec2.add(bA.velocity, Vec2.crossScalarVec(bA.angularVelocity, this.rA));
    const vB = Vec2.add(bB.velocity, Vec2.crossScalarVec(bB.angularVelocity, this.rB));
    const cDotPerp = Vec2.sub(vB, vA).dot(this.perp) + this.perpBias;
    const perpImp = -this.perpMass * cDotPerp;
    this.perpImpulse += perpImp;

    const p = Vec2.scale(this.perp, perpImp);
    bA.velocity.subScaled(p, mA);
    bA.angularVelocity -= iA * (this.rA.cross(p));
    bB.velocity.addScaled(p, mB);
    bB.angularVelocity += iB * (this.rB.cross(p));

    // 2. Relative Rotation sperren
    const cDotAng = bB.angularVelocity - bA.angularVelocity + this.angularBias;
    const angImp = -this.angularMass * cDotAng;
    this.angularImpulse += angImp;

    bA.angularVelocity -= iA * angImp;
    bB.angularVelocity += iB * angImp;

    // 3. Motor entlang der Schiene
    if (this.enableMotor) {
      const vRelAxis = Vec2.sub(vB, vA).dot(this.axis) - this.motorSpeed;
      let imp = -this.motorMass * vRelAxis;
      const oldImp = this.motorImpulse;
      const maxImp = this.maxMotorForce * 0.02;
      this.motorImpulse = Math.max(-maxImp, Math.min(maxImp, oldImp + imp));
      imp = this.motorImpulse - oldImp;

      const pAxis = Vec2.scale(this.axis, imp);
      bA.velocity.subScaled(pAxis, mA);
      bB.velocity.addScaled(pAxis, mB);
    }
  }

  getReactionForce(dt) {
    return Math.abs(this.linearImpulse) / Math.max(dt, 1e-4);
  }

  getReactionTorque(dt) {
    return Math.abs(this.angularImpulse) / Math.max(dt, 1e-4);
  }
}
