import { Vec2 } from '../math/Vec2.mjs';
import { Material } from '../dynamics/Material.mjs';

/**
 * SubQGDestructionSystem:
 * Verwaltet die vollständige Zerstörungsphysik (SubQG Destruction Physics):
 * Belastung (Stress/Strain) -> Materialschaden (Damage) -> Bruch (Fracture) -> bewegliche Trümmerteile (Debris)
 */
export class SubQGDestructionSystem {
  constructor(world, config = {}) {
    this.world = world;
    this.enabled = config.enabled ?? true;
    this.debrisParticles = []; // Visuelle und physikalische Splitter
    this.maxDebrisCount = config.maxDebrisCount ?? 150;
    this.fractureEvents = [];
  }

  /**
   * Prüft Gelenkbelastungen und reißt überlastete Verbindungen dauerhaft ab
   */
  evaluateJointFracture(dt) {
    if (!this.enabled) return;

    for (let i = this.world.joints.length - 1; i >= 0; i--) {
      const joint = this.world.joints[i];
      const rf = joint.getReactionForce(dt);
      const rt = joint.getReactionTorque(dt);

      if (rf > joint.breakingForce || rt > joint.breakingTorque) {
        joint.isBroken = true;
        this.world.brokenJointsCount++;

        const breakPt = joint.bodyA.transform.transformPoint(joint.localAnchorA || new Vec2(0, 0));
        const event = {
          type: 'joint_break',
          jointId: joint.id,
          jointType: joint.type,
          reactionForce: rf,
          breakingForce: joint.breakingForce,
          point: breakPt
        };

        this.fractureEvents.push(event);
        this.world.materialFractureEvents.push(event);
        for (const cb of this.world.jointBreakListeners) cb(event);

        // Erzeuge physikalische Splitter an der Bruchstelle
        this.spawnFractureSplinters(breakPt, 8, new Vec2(0, 2));

        // Entferne das Gelenk dauerhaft aus der Welt
        this.world.removeJoint(joint);
      }
    }
  }

  /**
   * Prüft Körper auf Kontaktschlagbelastung und spaltet überlastete Körper in Trümmerteile
   */
  evaluateBodyFracture(activeManifolds, dt) {
    if (!this.enabled) return;

    const bodiesToFracture = new Map();

    for (const m of activeManifolds) {
      if (m.isTrigger) continue;

      // Katapult-Arm und Wurfschale dienen der gezielten Geschossbeschleunigung
      // und zerdrücken das Projektil nicht beim Abwurf
      const isLaunchA = m.bodyA.userData === 'Katapult-Arm' || m.bodyA.userData === 'Katapult-Schale';
      const isLaunchB = m.bodyB.userData === 'Katapult-Arm' || m.bodyB.userData === 'Katapult-Schale';
      if (isLaunchA || isLaunchB) continue;

      for (const cp of m.points) {
        const impulse = cp.normalImpulse ?? 0;
        const impactForce = impulse / Math.max(dt, 1e-4);

        if (m.bodyA.type === 'dynamic' && m.bodyA.isDestructible && !m.bodyA.isBroken) {
          if (impactForce > (m.bodyA.fractureForce ?? 1500.0)) {
            bodiesToFracture.set(m.bodyA.id, { body: m.bodyA, impactPoint: cp.point, normal: m.normal });
          }
        }

        if (m.bodyB.type === 'dynamic' && m.bodyB.isDestructible && !m.bodyB.isBroken) {
          if (impactForce > (m.bodyB.fractureForce ?? 1500.0)) {
            bodiesToFracture.set(m.bodyB.id, { body: m.bodyB, impactPoint: cp.point, normal: m.normal });
          }
        }
      }
    }

    for (const item of bodiesToFracture.values()) {
      this.fractureBody(item.body, item.impactPoint, item.normal);
    }
  }

  /**
   * Zerteilt einen Körper in realistische physikalische Trümmerteile (Box, Kreis/Fels, Ball, Kapsel)
   */
  fractureBody(body, impactPoint, normal) {
    if (!body || body.isBroken) return;
    body.isBroken = true;

    const shape = body.shapes[0];
    if (!shape) return;

    const parentPos = body.position;
    const parentVel = body.velocity.clone();
    const parentAngle = body.angle;
    const parentMat = shape.material || new Material({ density: 1.2 });
    const density = parentMat.density || 1.2;
    const friction = parentMat.friction || 0.6;
    const restitution = parentMat.restitution || 0.05;

    // Materialtyp ermitteln für Farben und Partikel
    let colorType = 'wood';
    if (density >= 3.0 || (body.userData && String(body.userData).includes('Fels'))) {
      colorType = 'stone';
    } else if (restitution >= 0.4 || (body.userData && String(body.userData).includes('Ball'))) {
      colorType = 'rubber';
    }

    const pieces = [];
    const n = normal ? normal.clone().normalize() : new Vec2(0, 1);
    const tangent = new Vec2(-n.y, n.x);

    if (shape.type === 'box') {
      const isWider = shape.width >= shape.height;
      if (isWider) {
        const halfW = shape.width * 0.5;
        const pieceW = shape.width * 0.46;
        const pieceH = shape.height * 0.95;

        // Linkes Bruchstück
        const offsetL = body.transform.transformVector(new Vec2(-halfW * 0.52, 0));
        const piece1 = this.world.createBox(parentPos.x + offsetL.x, parentPos.y + offsetL.y, pieceW, pieceH, {
          type: 'dynamic',
          angle: parentAngle + (Math.random() - 0.5) * 0.15,
          linearDamping: 0.15,
          angularDamping: 0.25,
          material: new Material({ density, friction, restitution })
        });
        piece1.setVelocity(parentVel.x * 0.3 - tangent.x * 1.0, parentVel.y * 0.3 - tangent.y * 1.0);
        piece1.angularVelocity = (Math.random() - 0.5) * 4.0;
        pieces.push(piece1);

        // Rechtes Bruchstück
        const offsetR = body.transform.transformVector(new Vec2(halfW * 0.52, 0));
        const piece2 = this.world.createBox(parentPos.x + offsetR.x, parentPos.y + offsetR.y, pieceW, pieceH, {
          type: 'dynamic',
          angle: parentAngle + (Math.random() - 0.5) * 0.15,
          linearDamping: 0.15,
          angularDamping: 0.25,
          material: new Material({ density, friction, restitution })
        });
        piece2.setVelocity(parentVel.x * 0.3 + tangent.x * 1.0, parentVel.y * 0.3 + tangent.y * 1.0);
        piece2.angularVelocity = (Math.random() - 0.5) * 4.0;
        pieces.push(piece2);
      } else {
        const halfH = shape.height * 0.5;
        const pieceW = shape.width * 0.95;
        const pieceH = shape.height * 0.46;

        const offset1 = body.transform.transformVector(new Vec2(0, -halfH * 0.52));
        const piece1 = this.world.createBox(parentPos.x + offset1.x, parentPos.y + offset1.y, pieceW, pieceH, {
          type: 'dynamic',
          angle: parentAngle + (Math.random() - 0.5) * 0.15,
          linearDamping: 0.15,
          angularDamping: 0.25,
          material: new Material({ density, friction, restitution })
        });
        piece1.setVelocity(parentVel.x * 0.3 - n.x * 0.8, parentVel.y * 0.3 - n.y * 0.8);
        piece1.angularVelocity = (Math.random() - 0.5) * 4.0;
        pieces.push(piece1);

        const offset2 = body.transform.transformVector(new Vec2(0, halfH * 0.52));
        const piece2 = this.world.createBox(parentPos.x + offset2.x, parentPos.y + offset2.y, pieceW, pieceH, {
          type: 'dynamic',
          angle: parentAngle + (Math.random() - 0.5) * 0.15,
          linearDamping: 0.15,
          angularDamping: 0.25,
          material: new Material({ density, friction, restitution })
        });
        piece2.setVelocity(parentVel.x * 0.3 + n.x * 0.8, parentVel.y * 0.3 + n.y * 0.8);
        piece2.angularVelocity = (Math.random() - 0.5) * 4.0;
        pieces.push(piece2);
      }
    } else if (shape.type === 'circle') {
      // Felsblock oder Ball: Zerspringt in zwei kleinere Gesteinsbrocken / Hälften
      const r = shape.radius;
      const pieceR = r * 0.68; // 2 Bruchstücke mit flächenerhaltendem Radius

      const offset1 = Vec2.scale(tangent, pieceR * 0.65);
      const piece1 = this.world.createCircle(parentPos.x + offset1.x, parentPos.y + offset1.y, pieceR, {
        type: 'dynamic',
        linearDamping: 0.15,
        angularDamping: 0.25,
        material: new Material({ density, friction, restitution })
      });
      piece1.setVelocity(parentVel.x * 0.4 - tangent.x * 1.5, parentVel.y * 0.4 - tangent.y * 1.5);
      piece1.angularVelocity = (Math.random() - 0.5) * 5.0;
      pieces.push(piece1);

      const offset2 = Vec2.scale(tangent, -pieceR * 0.65);
      const piece2 = this.world.createCircle(parentPos.x + offset2.x, parentPos.y + offset2.y, pieceR, {
        type: 'dynamic',
        linearDamping: 0.15,
        angularDamping: 0.25,
        material: new Material({ density, friction, restitution })
      });
      piece2.setVelocity(parentVel.x * 0.4 + tangent.x * 1.5, parentVel.y * 0.4 + tangent.y * 1.5);
      piece2.angularVelocity = (Math.random() - 0.5) * 5.0;
      pieces.push(piece2);
    } else if (shape.type === 'capsule') {
      // Kapsel: Bricht in zwei halbe Kapseln
      const halfLen = Math.max(0.2, shape.length * 0.45);
      const r = shape.radius * 0.95;

      const offset1 = body.transform.transformVector(new Vec2(-shape.length * 0.28, 0));
      const piece1 = this.world.createCapsule(parentPos.x + offset1.x, parentPos.y + offset1.y, halfLen, r, {
        type: 'dynamic',
        angle: parentAngle + (Math.random() - 0.5) * 0.25,
        linearDamping: 0.15,
        angularDamping: 0.25,
        material: new Material({ density, friction, restitution })
      });
      piece1.setVelocity(parentVel.x * 0.3 - tangent.x * 1.0, parentVel.y * 0.3 - tangent.y * 1.0);
      piece1.angularVelocity = (Math.random() - 0.5) * 4.0;
      pieces.push(piece1);

      const offset2 = body.transform.transformVector(new Vec2(shape.length * 0.28, 0));
      const piece2 = this.world.createCapsule(parentPos.x + offset2.x, parentPos.y + offset2.y, halfLen, r, {
        type: 'dynamic',
        angle: parentAngle + (Math.random() - 0.5) * 0.25,
        linearDamping: 0.15,
        angularDamping: 0.25,
        material: new Material({ density, friction, restitution })
      });
      piece2.setVelocity(parentVel.x * 0.3 + tangent.x * 1.0, parentVel.y * 0.3 + tangent.y * 1.0);
      piece2.angularVelocity = (Math.random() - 0.5) * 4.0;
      pieces.push(piece2);
    }

    // Material-spezifische Splitterpartikel am Einschlagsort sprühen
    this.spawnFractureSplinters(impactPoint, 24, parentVel, colorType);

    // Entferne den ursprünglichen Körper
    this.world.removeBody(body);

    const shatterEvt = {
      type: 'body_shatter',
      bodyId: body.id,
      point: impactPoint,
      pieces: pieces.map(p => p.id)
    };
    this.fractureEvents.push(shatterEvt);
    this.world.materialFractureEvents.push(shatterEvt);
  }

  /**
   * Erzeugt materialspezifische Splitterpartikel
   */
  spawnFractureSplinters(pos, count = 16, baseVel = new Vec2(0, 0), colorType = 'wood') {
    let colors = ['#d97706', '#b45309', '#f59e0b', '#92400e', '#78350f']; // Holz
    if (colorType === 'stone') {
      colors = ['#94a3b8', '#64748b', '#475569', '#334155', '#cbd5e1', '#e2e8f0']; // Stein / Fels
    } else if (colorType === 'rubber') {
      colors = ['#ef4444', '#f97316', '#fbbf24', '#dc2626', '#b91c1c']; // Gummi / Elastisch
    }

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.0 + Math.random() * 4.0;
      const vx = baseVel.x * 0.2 + Math.cos(angle) * speed;
      const vy = baseVel.y * 0.2 + Math.sin(angle) * speed + 1.2;
      this.debrisParticles.push({
        x: pos.x,
        y: pos.y,
        vx,
        vy,
        size: 0.05 + Math.random() * 0.09,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
        decay: 0.015 + Math.random() * 0.015
      });
    }

    if (this.debrisParticles.length > this.maxDebrisCount) {
      this.debrisParticles.splice(0, this.debrisParticles.length - this.maxDebrisCount);
    }
  }

  /**
   * Bewegt Trümmerpartikel
   */
  stepDebris(dt) {
    for (let i = this.debrisParticles.length - 1; i >= 0; i--) {
      const p = this.debrisParticles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy -= 9.81 * dt; // Schwerkraft
      p.life -= p.decay;
      if (p.life <= 0 || p.y < 0) {
        this.debrisParticles.splice(i, 1);
      }
    }
  }
}
