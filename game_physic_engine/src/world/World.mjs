import { Vec2 } from '../math/Vec2.mjs';
import { AABB } from '../math/AABB.mjs';
import { Body } from '../dynamics/Body.mjs';
import { Box } from '../collision/shapes/Box.mjs';
import { Circle } from '../collision/shapes/Circle.mjs';
import { Polygon } from '../collision/shapes/Polygon.mjs';
import { Capsule } from '../collision/shapes/Capsule.mjs';
import { Segment } from '../collision/shapes/Segment.mjs';
import { Material } from '../dynamics/Material.mjs';
import { DynamicAABBTree } from '../collision/broadphase/DynamicAABBTree.mjs';
import { CollisionNarrowphase } from '../collision/narrowphase/CollisionNarrowphase.mjs';
import { ContactSolver } from '../dynamics/ContactSolver.mjs';
import { TriggerSystem } from '../collision/TriggerSystem.mjs';
import { Ray, RaycastHit } from '../collision/Raycast.mjs';
import { StepConfig } from './StepConfig.mjs';
import { RelationalGraph } from '../subqg/RelationalGraph.mjs';
import { MetricLatticeSolver } from '../subqg/MetricLatticeSolver.mjs';
import { SubQGGravitationField } from '../subqg/SubQGGravitationField.mjs';
import { SubQGContactBridge } from '../subqg/SubQGContactBridge.mjs';
import { SubQGPureDynamics } from '../subqg/SubQGPureDynamics.mjs';
import { DistanceJoint } from '../dynamics/joints/DistanceJoint.mjs';
import { RevoluteJoint } from '../dynamics/joints/RevoluteJoint.mjs';
import { PrismaticJoint } from '../dynamics/joints/PrismaticJoint.mjs';
import { WeldJoint } from '../dynamics/joints/WeldJoint.mjs';
import { PulleyJoint } from '../dynamics/joints/PulleyJoint.mjs';
import { SubQGDestructionSystem } from '../destruction/SubQGDestructionSystem.mjs';

/**
 * World: Die zentrale Simulationswelt der SubQG Game Physics Engine.
 * 
 * Stellt Spieleentwicklern eine vertraute, hochperformante RigidBody-API zur Verfügung
 * (Körper, Kräfte, Gelenke, Raycasts, Trigger, Stöße, Reibung),
 * während intern alle Gravitations-, Trägheits- und Kontaktwechselwirkungen
 * auf dem relationalen SubQG-Kantennetzwerk und der Kantenwirkungs-Minimierung basieren.
 */
export class World {
  constructor(config = {}) {
    this.stepConfig = new StepConfig(config);
    this.engineMode = config.engineMode ?? 'hybrid'; // 'pure-subqg' (100% First-Principles) oder 'hybrid' (Echtzeit-Optimiert)

    // SubQG Subsysteme
    this.subqgGraph = new RelationalGraph(config.subqg || {});
    this.subqgSolver = new MetricLatticeSolver(this.subqgGraph);
    this.subqgBridge = new SubQGContactBridge(config.subqg || {});
    this.subqgPureDynamics = new SubQGPureDynamics(this.subqgGraph, config.subqg || {});
    this.subqgGravitation = new SubQGGravitationField({
      gravity: config.gravity ?? (this.engineMode === 'pure-subqg' ? new Vec2(0, 0) : new Vec2(0, -9.81)),
      enableMutualAttraction: config.enableMutualAttraction ?? (this.engineMode === 'pure-subqg')
    });

    // Kollisions- und Dynamiksysteme
    this.broadPhase = new DynamicAABBTree(config.fatPadding ?? 0.05);
    this.narrowPhase = new CollisionNarrowphase(this.subqgBridge);
    this.contactSolver = new ContactSolver(this.subqgBridge);
    this.triggerSystem = new TriggerSystem();
    this.destructionSystem = new SubQGDestructionSystem(this, config.destruction || {});
    this.contactSolverCalls = 0;
    this.jointSolverCalls = 0;
    this.classicalSolverCalls = 0;
    this.brokenJointsCount = 0;
    this.materialFractureEvents = []; // Aufzeichnung realer Materialbruch-Ereignisse

    // Entitäten
    this.bodies = [];
    this.joints = [];
    this.contactManifolds = new Map(); // key -> ContactManifold

    // Event Listener
    this.contactListeners = [];
    this.jointBreakListeners = [];

    // Letzte Diagnosedaten
    this.subqgDiagnostics = {
      totalEdgeAction: 0,
      maxStrain: 0,
      edgeCount: 0,
      nodeCount: 0,
      stepTimeMs: 0
    };
  }

  setGravity(gx, gy) {
    this.subqgGravitation.setGravity(gx, gy);
  }

  getGravity() {
    return this.subqgGravitation.gravity.clone();
  }

  addContactListener(listener) {
    this.contactListeners.push(listener);
    this.triggerSystem.addListener(listener);
    return this;
  }

  // ==========================================
  // KÖRPER-VERWALTUNG & ERGONOMISCHE FACTORIES
  // ==========================================

  addBody(body) {
    if (this.bodies.includes(body)) return body;
    this.bodies.push(body);
    body.updateAABB();
    body.treeLeaf = this.broadPhase.insertLeaf(body, body.aabb);
    return body;
  }

  removeBody(body) {
    const idx = this.bodies.indexOf(body);
    if (idx !== -1) {
      this.bodies.splice(idx, 1);
      if (body.treeLeaf) {
        this.broadPhase.removeLeaf(body.treeLeaf);
        body.treeLeaf = null;
      }
      // Entferne alle verbundenen Gelenke
      for (let i = this.joints.length - 1; i >= 0; i--) {
        const j = this.joints[i];
        if (j.bodyA === body || j.bodyB === body) {
          this.removeJoint(j);
        }
      }
    }
    return this;
  }

  createBody(config = {}) {
    const body = new Body(config);
    return this.addBody(body);
  }

  createBox(x, y, width, height, options = {}) {
    const body = new Body({
      position: new Vec2(x, y),
      type: options.type ?? 'dynamic',
      angle: options.angle ?? 0,
      linearDamping: options.linearDamping,
      angularDamping: options.angularDamping,
      isDestructible: options.isDestructible ?? false,
      fractureForce: options.fractureForce ?? 1500.0,
      allowSleep: options.allowSleep ?? true,
      gravityScale: options.gravityScale ?? 1.0,
      userData: options.userData
    });

    const box = new Box(width, height, options.offset || new Vec2(0, 0));
    if (options.material) box.setMaterial(options.material);
    if (options.isTrigger) box.setTrigger(true);

    body.addShape(box);
    return this.addBody(body);
  }

  createCircle(x, y, radius, options = {}) {
    const body = new Body({
      position: new Vec2(x, y),
      type: options.type ?? 'dynamic',
      angle: options.angle ?? 0,
      linearDamping: options.linearDamping,
      angularDamping: options.angularDamping,
      isDestructible: options.isDestructible ?? false,
      fractureForce: options.fractureForce ?? 1500.0,
      allowSleep: options.allowSleep ?? true,
      gravityScale: options.gravityScale ?? 1.0,
      userData: options.userData
    });

    const circle = new Circle(radius, options.offset || new Vec2(0, 0));
    if (options.material) circle.setMaterial(options.material);
    if (options.isTrigger) circle.setTrigger(true);

    body.addShape(circle);
    return this.addBody(body);
  }

  createPolygon(x, y, vertices, options = {}) {
    const body = new Body({
      position: new Vec2(x, y),
      type: options.type ?? 'dynamic',
      angle: options.angle ?? 0,
      linearDamping: options.linearDamping,
      angularDamping: options.angularDamping,
      isDestructible: options.isDestructible ?? false,
      fractureForce: options.fractureForce ?? 1500.0,
      allowSleep: options.allowSleep ?? true,
      gravityScale: options.gravityScale ?? 1.0,
      userData: options.userData
    });

    const poly = new Polygon(vertices, options.offset || new Vec2(0, 0));
    if (options.material) poly.setMaterial(options.material);
    if (options.isTrigger) poly.setTrigger(true);

    body.addShape(poly);
    return this.addBody(body);
  }

  createCapsule(x, y, length, radius, options = {}) {
    const body = new Body({
      position: new Vec2(x, y),
      type: options.type ?? 'dynamic',
      angle: options.angle ?? 0,
      linearDamping: options.linearDamping,
      angularDamping: options.angularDamping,
      isDestructible: options.isDestructible ?? false,
      fractureForce: options.fractureForce ?? 1500.0,
      allowSleep: options.allowSleep ?? true,
      gravityScale: options.gravityScale ?? 1.0,
      userData: options.userData
    });

    const capsule = new Capsule(length, radius, options.offset || new Vec2(0, 0));
    if (options.material) capsule.setMaterial(options.material);
    if (options.isTrigger) capsule.setTrigger(true);

    body.addShape(capsule);
    return this.addBody(body);
  }

  createSegment(x1, y1, x2, y2, options = {}) {
    const body = new Body({
      position: new Vec2(0, 0),
      type: options.type ?? 'static',
      isDestructible: options.isDestructible ?? false,
      fractureForce: options.fractureForce ?? 1500.0,
      userData: options.userData
    });

    const seg = new Segment(new Vec2(x1, y1), new Vec2(x2, y2));
    if (options.material) seg.setMaterial(options.material);
    if (options.isTrigger) seg.setTrigger(true);

    body.addShape(seg);
    return this.addBody(body);
  }

  // ==========================================
  // GELENK-VERWALTUNG & FACTORIES
  // ==========================================

  addJoint(joint) {
    if (this.joints.includes(joint)) return joint;
    this.joints.push(joint);
    if (!joint.bodyA.joints) joint.bodyA.joints = [];
    if (!joint.bodyB.joints) joint.bodyB.joints = [];
    if (!joint.bodyA.joints.includes(joint)) joint.bodyA.joints.push(joint);
    if (!joint.bodyB.joints.includes(joint)) joint.bodyB.joints.push(joint);
    joint.bodyA.wakeUp();
    joint.bodyB.wakeUp();
    return joint;
  }

  removeJoint(joint) {
    const idx = this.joints.indexOf(joint);
    if (idx !== -1) {
      this.joints.splice(idx, 1);
      if (joint.bodyA.joints) {
        const jIdxA = joint.bodyA.joints.indexOf(joint);
        if (jIdxA !== -1) joint.bodyA.joints.splice(jIdxA, 1);
      }
      if (joint.bodyB.joints) {
        const jIdxB = joint.bodyB.joints.indexOf(joint);
        if (jIdxB !== -1) joint.bodyB.joints.splice(jIdxB, 1);
      }
      joint.bodyA.wakeUp();
      joint.bodyB.wakeUp();
    }
    return this;
  }

  createDistanceJoint(bodyA, bodyB, anchorA, anchorB, config = {}) {
    const j = new DistanceJoint(bodyA, bodyB, anchorA, anchorB, config);
    return this.addJoint(j);
  }

  createRevoluteJoint(bodyA, bodyB, anchorWorld, config = {}) {
    const j = new RevoluteJoint(bodyA, bodyB, anchorWorld, config);
    return this.addJoint(j);
  }

  createPrismaticJoint(bodyA, bodyB, anchorWorld, axisWorld, config = {}) {
    const j = new PrismaticJoint(bodyA, bodyB, anchorWorld, axisWorld, config);
    return this.addJoint(j);
  }

  createWeldJoint(bodyA, bodyB, anchorWorld, config = {}) {
    const j = new WeldJoint(bodyA, bodyB, anchorWorld, config);
    return this.addJoint(j);
  }

  createPulleyJoint(bodyA, bodyB, groundA, groundB, anchorA, anchorB, ratio = 1.0, config = {}) {
    const j = new PulleyJoint(bodyA, bodyB, groundA, groundB, anchorA, anchorB, ratio, config);
    return this.addJoint(j);
  }

  onJointBreak(callback) {
    this.jointBreakListeners.push(callback);
    return this;
  }

  // ==========================================
  // ABFRAGEN: RAYCAST, AABB, PUNKT
  // ==========================================

  raycast(origin, direction, maxDistance = Infinity) {
    const ray = new Ray(origin, direction, maxDistance);
    let closestHit = null;

    this.broadPhase.raycast(origin, ray.direction, maxDistance, (body) => {
      for (const shape of body.shapes) {
        const hit = shape.raycast(ray, body.transform, maxDistance);
        if (hit.hit) {
          if (!closestHit || hit.fraction < closestHit.fraction) {
            closestHit = new RaycastHit(body, shape, hit.point, hit.normal, hit.fraction);
          }
        }
      }
    });

    return closestHit;
  }

  raycastAll(origin, direction, maxDistance = Infinity) {
    const ray = new Ray(origin, direction, maxDistance);
    const hits = [];

    this.broadPhase.raycast(origin, ray.direction, maxDistance, (body) => {
      for (const shape of body.shapes) {
        const hit = shape.raycast(ray, body.transform, maxDistance);
        if (hit.hit) {
          hits.push(new RaycastHit(body, shape, hit.point, hit.normal, hit.fraction));
        }
      }
    });

    hits.sort((a, b) => a.fraction - b.fraction);
    return hits;
  }

  queryAABB(aabb) {
    const results = [];
    this.broadPhase.queryAABB(aabb, (body) => {
      if (body.aabb.intersects(aabb)) {
        results.push(body);
      }
    });
    return results;
  }

  queryPoint(point) {
    const results = [];
    const ptAABB = new AABB(
      new Vec2(point.x - 0.01, point.y - 0.01),
      new Vec2(point.x + 0.01, point.y + 0.01)
    );

    this.broadPhase.queryAABB(ptAABB, (body) => {
      for (const shape of body.shapes) {
        if (shape.testPoint(point, body.transform)) {
          results.push({ body, shape });
        }
      }
    });

    return results;
  }

  // ==========================================
  // SIMULATIONSSCHRITT: SUBQG + SOLVER CYCLE
  // ==========================================

  step(customDt = null) {
    const startTime = performance.now();
    const dt = customDt ?? this.stepConfig.dt;
    if (dt <= 0.0) return;

    // 1. SubQG internes Netzwerk updaten
    if (this.stepConfig.enableSubQGLattice) {
      this.subqgGraph.resetDensities();
      for (const body of this.bodies) {
        this.subqgGraph.injectBodyMass(body);
      }
      const solveRes = this.subqgSolver.solve();
      this.subqgDiagnostics.totalEdgeAction = solveRes.totalEdgeAction;
      this.subqgDiagnostics.maxStrain = solveRes.maxStrain;
      this.subqgDiagnostics.edgeCount = solveRes.edgeCount;
      this.subqgDiagnostics.nodeCount = solveRes.nodeCount;
    }

    // 2. Gravitation anwenden
    if (this.engineMode === 'pure-subqg') {
      // Reiner SubQG-Modus: Gravitationskräfte entstehen direkt aus ∇Phi des Gitters
      // plus emergentem Hintergrund-Metrikgradienten
      this.subqgPureDynamics.evaluateGravitationalForces(this.bodies, this.subqgGravitation.gravity);
    } else {
      this.subqgGravitation.applyGravity(this.bodies, this.stepConfig.enableSubQGLattice ? this.subqgGraph : null);
    }

    // 3. Externe Kräfte & Drehmomente integrieren (v += F/m * dt)
    for (const body of this.bodies) {
      body.integrateForces(dt);
    }

    // 4. Broadphase AABB-Baum aktualisieren
    for (const body of this.bodies) {
      if (body.type !== 'static' && !body.isSleeping) {
        const disp = Vec2.scale(body.velocity, dt);
        this.broadPhase.updateLeaf(body.treeLeaf, body.aabb, disp);
      }
    }

    // 5. Kollisions-Paare finden & Narrowphase Kontakt-Manifolds berechnen
    const activeManifolds = [];
    const checkedPairs = new Set();

    this.broadPhase.queryPairs((bodyA, bodyB) => {
      // Zwei statische Körper kollidieren nicht miteinander
      if (bodyA.type === 'static' && bodyB.type === 'static') return;
      // Beide schlafen -> keine Berechnung nötig
      if (bodyA.isSleeping && bodyB.isSleeping) return;

      const pKey = bodyA.id < bodyB.id ? `${bodyA.id}:${bodyB.id}` : `${bodyB.id}:${bodyA.id}`;
      if (checkedPairs.has(pKey)) return;
      checkedPairs.add(pKey);

      // Prüfe verbundene Gelenke, ob Kollision erlaubt ist
      for (const joint of this.joints) {
        if (!joint.collideConnected) {
          if ((joint.bodyA === bodyA && joint.bodyB === bodyB) ||
              (joint.bodyA === bodyB && joint.bodyB === bodyA)) {
            return;
          }
        }
      }

      // Alle Formenpaare testen
      for (const sA of bodyA.shapes) {
        for (const sB of bodyB.shapes) {
          const manifold = this.narrowPhase.collide(bodyA, bodyB, sA, sB);
          if (manifold && manifold.points.length > 0) {
            if (manifold.isTrigger) {
              this.triggerSystem.registerOverlap(manifold);
            } else {
              // Match mit vorherigen Impulsen für Warm-Starting
              const prev = this.contactManifolds.get(manifold.key);
              if (prev && this.stepConfig.enableWarmStarting) {
                for (let k = 0; k < Math.min(manifold.points.length, prev.points.length); k++) {
                  manifold.points[k].normalImpulse = prev.points[k].normalImpulse;
                  manifold.points[k].tangentImpulse = prev.points[k].tangentImpulse;
                }
              }
              activeManifolds.push(manifold);
            }
          }
        }
      }
    });

    // Update Kontakt-Map
    this.contactManifolds.clear();
    for (const m of activeManifolds) {
      this.contactManifolds.set(m.key, m);
    }

    // 6. Kontakt- und Gelenklösung
    if (this.engineMode === 'pure-subqg') {
      // REINER SUBQG-MODUS (100% First-Principles):
      // Null Kontakt-Impulssolver!
      // Kontakt- und Reibungskräfte entstehen direkt aus der SubQG-Kantenbarriere-Wirkung (contactSolverCalls = 0)
      this.subqgPureDynamics.applyPureContactForces(activeManifolds, dt);
      for (const body of this.bodies) {
        body.integrateForces(dt);
      }
      // Topologische Gelenkbindungen (kinematische Invarianten)
      for (const joint of this.joints) {
        joint.initVelocityConstraints(dt);
      }
      for (let it = 0; it < this.stepConfig.velocityIterations; it++) {
        for (const joint of this.joints) {
          joint.solveVelocityConstraints();
          this.jointSolverCalls++;
        }
      }
    } else {
      // HYBRID-MODUS:
      // Klassischer sequentieller Impulssolver für maximale Framerate bei 60 FPS
      for (const joint of this.joints) {
        joint.initVelocityConstraints(dt);
      }
      this.contactSolver.initVelocityConstraints(activeManifolds, dt);

      for (let it = 0; it < this.stepConfig.velocityIterations; it++) {
        for (const joint of this.joints) {
          joint.solveVelocityConstraints();
          this.jointSolverCalls++;
        }
        this.contactSolverCalls++;
        this.classicalSolverCalls++;
        this.contactSolver.solveVelocityConstraints(activeManifolds);
      }
    }

    // 7. SubQG Zerstörungsphysik: Belastung -> Materialschaden -> Bruch -> Trümmerteile
    this.destructionSystem.evaluateJointFracture(dt);
    this.destructionSystem.evaluateBodyFracture(activeManifolds, dt);
    this.destructionSystem.stepDebris(dt);

    // 8. Geschwindigkeiten integrieren (x += v * dt)
    for (const body of this.bodies) {
      body.integrateVelocities(dt);
    }

    // 9. Schlafzustände auswerten (Sleeping)
    if (this.stepConfig.enableSleeping) {
      this._evaluateSleeping(dt);
    }

    // 10. Trigger-Ereignisse feuern (onTriggerEnter, onTriggerStay, onTriggerExit)
    this.triggerSystem.flushEvents();

    this.subqgDiagnostics.stepTimeMs = performance.now() - startTime;
  }

  _evaluateSleeping(dt) {
    const linTolSq = 0.002;
    const angTolSq = 0.002;

    for (const b of this.bodies) {
      if (b.type !== 'dynamic' || !b.allowSleep) continue;

      const linSpeedSq = b.velocity.lengthSq();
      const angSpeedSq = b.angularVelocity * b.angularVelocity;

      if (linSpeedSq > linTolSq || angSpeedSq > angTolSq) {
        b.sleepTime = 0.0;
        b.isSleeping = false;
      } else {
        b.sleepTime += dt;
        if (b.sleepTime >= this.stepConfig.timeToSleep) {
          b.putToSleep();
        }
      }
    }
  }

  getSubQGDiagnostics() {
    return { ...this.subqgDiagnostics };
  }
}
