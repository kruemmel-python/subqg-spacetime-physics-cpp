import { Vec2 } from '../math/Vec2.mjs';
import { Transform } from '../math/Transform.mjs';
import { AABB } from '../math/AABB.mjs';

let nextBodyId = 1;

/**
 * Body: Repräsentiert einen starren Körper (RigidBody) in der Simulation.
 * 
 * Unterstützte Typen:
 * - 'dynamic': Vollständig physikalisch simuliert (Kräfte, Gravitation, Stöße).
 * - 'static': Feste Umgebung (Böden, Wände, Hindernisse). Unendliche Masse, bewegt sich nicht.
 * - 'kinematic': Bewegt sich rein durch gesetzte Geschwindigkeit, wird nicht von Kräften beschleunigt.
 */
export class Body {
  constructor(config = {}) {
    this.id = nextBodyId++;
    this.type = config.type ?? 'dynamic'; // 'dynamic', 'static', 'kinematic'

    // Zustandsvariablen
    this.position = config.position ? config.position.clone() : new Vec2(0, 0);
    this.velocity = config.velocity ? config.velocity.clone() : new Vec2(0, 0);
    this.angle = config.angle ?? 0.0;
    this.angularVelocity = config.angularVelocity ?? 0.0;

    // Gespeicherte Transformation
    this.transform = new Transform(this.position, this.angle);

    // Akkumulierte Kräfte und Drehmomente für aktuellen Zeitschritt
    this.force = new Vec2(0, 0);
    this.torque = 0.0;

    // Dämpfung und Skalierungen
    this.linearDamping = config.linearDamping ?? 0.01;
    this.angularDamping = config.angularDamping ?? 0.02;
    this.gravityScale = config.gravityScale ?? 1.0;

    // Massendaten
    this.mass = 0.0;
    this.invMass = 0.0;
    this.inertia = 0.0;
    this.invInertia = 0.0;

    // Zerstörbarkeit & Materialbruch (SubQG Destruction Physics)
    this.isDestructible = config.isDestructible ?? false;
    this.fractureForce = config.fractureForce ?? 1500.0;
    this.isBroken = false;

    // Formen des Körpers (Compound Body Support)
    this.shapes = [];
    this.aabb = new AABB();
    this.boundingRadius = 0.5;

    // Schlafzustand (Sleeping Island Optimization)
    this.isSleeping = false;
    this.allowSleep = config.allowSleep ?? true;
    this.sleepTime = 0.0;

    // Benutzerdefinierte Daten (z. B. Spiel-Logik, Sprites, Entities)
    this.userData = config.userData ?? null;

    // Broadphase Tree Leaf Referenz
    this.treeLeaf = null;

    if (config.shape) {
      this.addShape(config.shape);
    }
  }

  addShape(shape) {
    shape.body = this;
    if (!shape.id) shape.id = nextBodyId++;
    this.shapes.push(shape);
    this._recomputeMassData();
    this.updateAABB();
    this.wakeUp();
    return this;
  }

  removeShape(shape) {
    const idx = this.shapes.indexOf(shape);
    if (idx !== -1) {
      this.shapes.splice(idx, 1);
      shape.body = null;
      this._recomputeMassData();
      this.updateAABB();
      this.wakeUp();
    }
    return this;
  }

  _recomputeMassData() {
    let totalMass = 0.0;
    let totalInertia = 0.0;
    let maxRadius = 0.1;

    for (const shape of this.shapes) {
      const data = shape.computeMassData(shape.material.density);
      totalMass += data.mass;
      totalInertia += data.inertia;

      // Ungefährer Hüllradius
      const r = shape.radius || Math.hypot(shape.width || 0.5, shape.height || 0.5);
      if (r > maxRadius) maxRadius = r;
    }

    if (this.type === 'static') {
      // Statische Körper (z.B. Planeten, Böden) besitzen Gravitationsmasse für das SubQG-Gitter,
      // aber inverse Masse = 0, sodass sie kinematisch unbeweglich sind.
      this.mass = totalMass > 0 ? totalMass : 0.0;
      this.invMass = 0.0;
      this.inertia = totalInertia > 0 ? totalInertia : 0.0;
      this.invInertia = 0.0;
      this.boundingRadius = maxRadius;
      return;
    }

    if (totalMass > 0.0) {
      this.mass = totalMass;
      this.invMass = 1.0 / totalMass;
      this.inertia = Math.max(1e-4, totalInertia);
      this.invInertia = 1.0 / this.inertia;
    } else {
      this.mass = 1.0;
      this.invMass = 1.0;
      this.inertia = 1.0;
      this.invInertia = 1.0;
    }

    this.boundingRadius = maxRadius;
  }

  updateAABB() {
    this.transform.set(this.position, this.angle);
    this.aabb.reset();
    for (const shape of this.shapes) {
      const shapeAABB = shape.computeAABB(this.transform);
      this.aabb.combine(shapeAABB);
    }
    return this.aabb;
  }

  setPosition(x, y) {
    this.position.set(x, y);
    this.updateAABB();
    this.wakeUp();
    return this;
  }

  setAngle(angle) {
    this.angle = angle;
    this.updateAABB();
    this.wakeUp();
    return this;
  }

  setVelocity(vx, vy) {
    this.velocity.set(vx, vy);
    this.wakeUp();
    return this;
  }

  setAngularVelocity(w) {
    this.angularVelocity = w;
    this.wakeUp();
    return this;
  }

  applyForce(f) {
    if (this.type !== 'dynamic' || this.isSleeping) return;
    this.force.add(f);
    this.wakeUp();
  }

  applyTorque(t) {
    if (this.type !== 'dynamic' || this.isSleeping) return;
    this.torque += t;
    this.wakeUp();
  }

  applyForceAtPoint(f, worldPoint) {
    if (this.type !== 'dynamic' || this.isSleeping) return;
    this.force.add(f);
    const r = Vec2.sub(worldPoint, this.position);
    this.torque += r.cross(f);
    this.wakeUp();
  }

  applyImpulse(impulse) {
    if (this.type !== 'dynamic') return;
    this.velocity.addScaled(impulse, this.invMass);
    this.wakeUp();
  }

  applyAngularImpulse(impulse) {
    if (this.type !== 'dynamic') return;
    this.angularVelocity += impulse * this.invInertia;
    this.wakeUp();
  }

  applyImpulseAtPoint(impulse, worldPoint) {
    if (this.type !== 'dynamic') return;
    this.velocity.addScaled(impulse, this.invMass);
    const r = Vec2.sub(worldPoint, this.position);
    this.angularVelocity += r.cross(impulse) * this.invInertia;
    this.wakeUp();
  }

  getVelocityAtPoint(worldPoint) {
    const r = Vec2.sub(worldPoint, this.position);
    return new Vec2(
      this.velocity.x - this.angularVelocity * r.y,
      this.velocity.y + this.angularVelocity * r.x
    );
  }

  wakeUp() {
    this.isSleeping = false;
    this.sleepTime = 0.0;
  }

  putToSleep() {
    if (!this.allowSleep || this.type !== 'dynamic') return;
    this.isSleeping = true;
    this.velocity.set(0, 0);
    this.angularVelocity = 0.0;
    this.force.set(0, 0);
    this.torque = 0.0;
  }

  integrateForces(dt) {
    if (this.type !== 'dynamic' || this.isSleeping) return;

    // Halber Geschwindigkeitsschritt oder Euler: v += dt * (F * invMass)
    this.velocity.addScaled(this.force, dt * this.invMass);
    this.angularVelocity += (this.torque * this.invInertia) * dt;

    // Dämpfung (Luftwiderstand)
    const linDamp = Math.max(0.0, 1.0 - this.linearDamping * dt);
    const angDamp = Math.max(0.0, 1.0 - this.angularDamping * dt);
    this.velocity.scale(linDamp);
    this.angularVelocity *= angDamp;

    // Kräfte für nächsten Zeitschritt leeren
    this.force.set(0, 0);
    this.torque = 0.0;
  }

  integrateVelocities(dt) {
    if (this.type === 'static' || this.isSleeping) return;

    // Schutzgrenze gegen unphysikalische Überschall-Geschwindigkeiten
    const maxSpeed = 30.0; // 30 m/s = 108 km/h
    const speedSq = this.velocity.lengthSq();
    if (speedSq > maxSpeed * maxSpeed) {
      this.velocity.scale(maxSpeed / Math.sqrt(speedSq));
    }
    const maxAngSpeed = 35.0; // rad/s
    if (Math.abs(this.angularVelocity) > maxAngSpeed) {
      this.angularVelocity = Math.sign(this.angularVelocity) * maxAngSpeed;
    }

    this.position.addScaled(this.velocity, dt);
    this.angle += this.angularVelocity * dt;

    this.updateAABB();
  }
}
