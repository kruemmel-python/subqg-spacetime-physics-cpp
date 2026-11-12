import { Joint } from './Joint.mjs';
import { Vec2 } from '../../math/Vec2.mjs';
import { Mat22 } from '../../math/Mat22.mjs';
import { normalizeAngle } from '../../math/MathUtils.mjs';

/**
 * RevoluteJoint: Drehgelenk (Scharnier, Pin-Gelenk, Achse, Radlager).
 * Hält zwei Körper an einem gemeinsamen Drehpunkt zusammen,
 * unterstützt motorisierten Antrieb und Winkelbegrenzungen.
 */
export class RevoluteJoint extends Joint {
  constructor(bodyA, bodyB, anchorWorld, config = {}) {
    super(bodyA, bodyB, 'revolute', config);
    this.localAnchorA = bodyA.transform.inverseTransformPoint(anchorWorld);
    this.localAnchorB = bodyB.transform.inverseTransformPoint(anchorWorld);
    this.referenceAngle = config.referenceAngle ?? (bodyB.angle - bodyA.angle);

    // Motor
    this.enableMotor = config.enableMotor ?? false;
    this.motorSpeed = config.motorSpeed ?? 0.0; // rad/s
    this.maxMotorTorque = config.maxMotorTorque ?? 10.0;
    this.motorImpulse = 0.0;

    // Winkelbegrenzungen
    this.enableLimit = config.enableLimit ?? false;
    this.lowerAngle = config.lowerAngle ?? 0.0;
    this.upperAngle = config.upperAngle ?? 0.0;
    this.limitImpulse = 0.0;

    // Interne Solver-Zustände
    this.rA = new Vec2(0, 0);
    this.rB = new Vec2(0, 0);
    this.linearMass = new Mat22();
    this.linearImpulse = new Vec2(0, 0);
    this.linearBias = new Vec2(0, 0);
    this.motorMass = 0.0;
  }

  getJointAngle() {
    return normalizeAngle(this.bodyB.angle - this.bodyA.angle - this.referenceAngle);
  }

  getJointSpeed() {
    return this.bodyB.angularVelocity - this.bodyA.angularVelocity;
  }

  setMotorSpeed(speed) {
    this.motorSpeed = speed;
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

    // 2x2 K-Matrix: K = (mA + mB)*I - rA_skew * iA * rA_skew - rB_skew * iB * rB_skew
    const k11 = mA + mB + iA * this.rA.y * this.rA.y + iB * this.rB.y * this.rB.y;
    const k12 = -iA * this.rA.x * this.rA.y - iB * this.rB.x * this.rB.y;
    const k21 = k12;
    const k22 = mA + mB + iA * this.rA.x * this.rA.x + iB * this.rB.x * this.rB.x;

    this.linearMass.setElements(k11, k12, k21, k22).invert();

    // Motor Trägheitsmasse
    this.motorMass = iA + iB > 0.0 ? 1.0 / (iA + iB) : 0.0;

    // Positionsfehler (Baumgarte) - Gedämpft und strikt begrenzt gegen Energie-Explosionen
    const pA = Vec2.add(bA.position, this.rA);
    const pB = Vec2.add(bB.position, this.rB);
    const posError = Vec2.sub(pB, pA);
    const rawBias = Vec2.scale(posError, 0.2 / Math.max(dt, 1e-4));
    const maxBiasSpeed = 3.5; // m/s Obergrenze verhindert unphysikalische Kettenresonanz
    const biasLen = rawBias.length();
    this.linearBias = biasLen > maxBiasSpeed ? Vec2.scale(rawBias, maxBiasSpeed / biasLen) : rawBias;

    // Warm starting linear
    bA.velocity.subScaled(this.linearImpulse, mA);
    bA.angularVelocity -= iA * this.rA.cross(this.linearImpulse);
    bB.velocity.addScaled(this.linearImpulse, mB);
    bB.angularVelocity += iB * this.rB.cross(this.linearImpulse);

    // Warm starting motor & limit
    if (this.enableMotor) {
      bA.angularVelocity -= iA * this.motorImpulse;
      bB.angularVelocity += iB * this.motorImpulse;
    }
  }

  solveVelocityConstraints() {
    const bA = this.bodyA;
    const bB = this.bodyB;
    const mA = bA.invMass;
    const mB = bB.invMass;
    const iA = bA.invInertia;
    const iB = bB.invInertia;

    // 1. Löse Motor
    if (this.enableMotor) {
      const cDot = bB.angularVelocity - bA.angularVelocity - this.motorSpeed;
      let impulse = -this.motorMass * cDot;
      const oldImpulse = this.motorImpulse;
      const maxImp = this.maxMotorTorque * 0.02; // Begrenzung pro Zeitschritt
      this.motorImpulse = Math.max(-maxImp, Math.min(maxImp, oldImpulse + impulse));
      impulse = this.motorImpulse - oldImpulse;

      bA.angularVelocity -= iA * impulse;
      bB.angularVelocity += iB * impulse;
    }

    // 2. Löse Winkelbegrenzungen
    if (this.enableLimit) {
      const jointAngle = this.getJointAngle();
      if (jointAngle < this.lowerAngle) {
        const cDot = bB.angularVelocity - bA.angularVelocity;
        let impulse = -this.motorMass * (cDot + 0.2 * (jointAngle - this.lowerAngle));
        const oldImp = this.limitImpulse;
        this.limitImpulse = Math.max(0.0, oldImp + impulse);
        impulse = this.limitImpulse - oldImp;
        bA.angularVelocity -= iA * impulse;
        bB.angularVelocity += iB * impulse;
      } else if (jointAngle > this.upperAngle) {
        const cDot = bB.angularVelocity - bA.angularVelocity;
        let impulse = -this.motorMass * (cDot + 0.2 * (jointAngle - this.upperAngle));
        const oldImp = this.limitImpulse;
        this.limitImpulse = Math.min(0.0, oldImp + impulse);
        impulse = this.limitImpulse - oldImp;
        bA.angularVelocity -= iA * impulse;
        bB.angularVelocity += iB * impulse;
      }
    }

    // 3. Löse Punkt-Koinzidenz (Linear Constraint)
    const vA = Vec2.add(bA.velocity, Vec2.crossScalarVec(bA.angularVelocity, this.rA));
    const vB = Vec2.add(bB.velocity, Vec2.crossScalarVec(bB.angularVelocity, this.rB));
    const vRel = Vec2.sub(vB, vA);

    const cDot = Vec2.add(vRel, this.linearBias);
    const impulse = this.linearMass.mulVec(cDot).negate();

    this.linearImpulse.add(impulse);

    bA.velocity.subScaled(impulse, mA);
    bA.angularVelocity -= iA * this.rA.cross(impulse);
    bB.velocity.addScaled(impulse, mB);
    bB.angularVelocity += iB * this.rB.cross(impulse);
  }

  getReactionForce(dt) {
    return this.linearImpulse.length() / Math.max(dt, 1e-4);
  }

  getReactionTorque(dt) {
    return Math.abs(this.motorImpulse + this.limitImpulse) / Math.max(dt, 1e-4);
  }
}
