let nextJointId = 1;

/**
 * Joint: Abstrakte Basisklasse für alle kinematischen und dynamischen Gelenke.
 * Unterstützt Materialbruch (Breaking Force / Breaking Torque).
 */
export class Joint {
  constructor(bodyA, bodyB, type = 'joint', config = {}) {
    this.id = nextJointId++;
    this.type = type;
    this.bodyA = bodyA;
    this.bodyB = bodyB;
    this.collideConnected = config.collideConnected ?? false; // Ob verbundene Körper miteinander kollidieren dürfen
    this.breakingForce = config.breakingForce ?? Infinity;    // Max. Reißkraft vor Bruch in Newton
    this.breakingTorque = config.breakingTorque ?? Infinity;  // Max. Bruchmoment in Nm
    this.isBroken = false;
  }

  getReactionForce(dt) {
    return 0.0;
  }

  getReactionTorque(dt) {
    return 0.0;
  }

  initVelocityConstraints(dt) {
    throw new Error('initVelocityConstraints() must be implemented');
  }

  solveVelocityConstraints() {
    throw new Error('solveVelocityConstraints() must be implemented');
  }
}
