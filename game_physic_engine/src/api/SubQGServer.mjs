import net from 'node:net';
import http from 'node:http';
import { World } from '../world/World.mjs';
import { Vec2 } from '../math/Vec2.mjs';
import { Material } from '../dynamics/Material.mjs';
import { DemoScenes } from '../../demo/demo_scenes.mjs';

/**
 * SubQG Server: Universal High-Performance API Bridge
 * 
 * Provides dual interface:
 * 1. TCP Socket (Default Port 3001): Low-latency NDJSON streaming for Unreal Engine C++,
 *    Blender Python, and Custom Game Engines (C++, C#, Rust, Python).
 * 2. HTTP JSON-RPC (Default Port 3002): REST & Batch baking endpoint for DCC tools.
 */
export class SubQGServer {
  constructor(options = {}) {
    this.tcpPort = options.tcpPort ?? 3001;
    this.httpPort = options.httpPort ?? 3002;
    this.world = new World({
      engineMode: options.engineMode ?? 'pure-subqg',
      gravity: new Vec2(0, -9.81),
      enableSubQGLattice: true
    });

    this.namedBodies = new Map(); // name/id -> Body
    this.namedJoints = new Map();
    this.autoIncrementId = 1;

    this.tcpServer = null;
    this.httpServer = null;
    this.activeSubscriptions = new Set();
    this.tickerInterval = null;
  }

  start() {
    return new Promise((resolve, reject) => {
      // 1. TCP Socket Server
      this.tcpServer = net.createServer((socket) => {
        let buffer = '';

        socket.on('data', (chunk) => {
          buffer += chunk.toString('utf-8');
          let newlineIdx;
          while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
            const line = buffer.slice(0, newlineIdx).trim();
            buffer = buffer.slice(newlineIdx + 1);
            if (line.length > 0) {
              try {
                const req = JSON.parse(line);
                const res = this.handleCommand(req);
                socket.write(JSON.stringify(res) + '\n');
              } catch (err) {
                socket.write(JSON.stringify({ error: err.message, id: null }) + '\n');
              }
            }
          }
        });

        socket.on('error', (err) => {
          this.activeSubscriptions.delete(socket);
        });

        socket.on('close', () => {
          this.activeSubscriptions.delete(socket);
        });
      });

      this.tcpServer.on('error', (err) => {
        console.error(`[SubQG TCP Server Error] ${err.message}`);
      });

      // 2. HTTP Server
      this.httpServer = http.createServer((req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.writeHead(204);
          res.end();
          return;
        }

        if (req.url === '/api/state' && req.method === 'GET') {
          const state = this.getStateSnapshot();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(state));
          return;
        }

        if (req.url === '/api/rpc' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', () => {
            try {
              const rpc = JSON.parse(body);
              const result = this.handleCommand(rpc);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(result));
            } catch (err) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
      });

      this.tcpServer.listen(this.tcpPort, () => {
        this.httpServer.listen(this.httpPort, () => {
          console.log(`[SubQG Server] Running! TCP Bridge: port ${this.tcpPort} | HTTP RPC: port ${this.httpPort}`);
          resolve({ tcpPort: this.tcpPort, httpPort: this.httpPort });
        });
      });
    });
  }

  stop() {
    if (this.tickerInterval) clearInterval(this.tickerInterval);
    if (this.tcpServer) this.tcpServer.close();
    if (this.httpServer) this.httpServer.close();
  }

  handleCommand(req) {
    const id = req.id ?? null;
    const method = req.method;
    const params = req.params || {};

    try {
      switch (method) {
        case 'create_world': {
          this.world = new World({
            engineMode: params.engineMode ?? 'pure-subqg',
            gravity: params.gravity ? new Vec2(params.gravity[0], params.gravity[1]) : new Vec2(0, -9.81),
            enableSubQGLattice: params.enableSubQGLattice ?? true,
            velocityIterations: params.velocityIterations ?? 10
          });
          this.namedBodies.clear();
          this.namedJoints.clear();
          this.autoIncrementId = 1;
          return { id, result: { status: 'ok', engineMode: this.world.engineMode } };
        }

        case 'load_scene': {
          const sceneName = params.scene;
          if (DemoScenes[sceneName]) {
            this.world = new World({
              engineMode: params.engineMode ?? 'pure-subqg',
              gravity: new Vec2(0, -9.81),
              enableSubQGLattice: true
            });
            this.namedBodies.clear();
            this.namedJoints.clear();
            DemoScenes[sceneName](this.world);
            return { id, result: { status: 'ok', scene: sceneName, bodies: this.world.bodies.length } };
          }
          throw new Error(`Scene not found: ${sceneName}`);
        }

        case 'create_box': {
          const bodyId = params.id || `box_${this.autoIncrementId++}`;
          const mat = new Material({
            density: params.density ?? 1.0,
            friction: params.friction ?? 0.5,
            restitution: params.restitution ?? 0.1
          });
          const body = this.world.createBox(params.x ?? 0, params.y ?? 0, params.width ?? 1.0, params.height ?? 1.0, {
            type: params.type ?? 'dynamic',
            angle: params.angle ?? 0,
            linearDamping: params.linearDamping ?? 0.05,
            angularDamping: params.angularDamping ?? 0.1,
            isDestructible: params.isDestructible ?? false,
            fractureForce: params.fractureForce ?? 1500.0,
            material: mat,
            userData: bodyId
          });
          body.apiId = bodyId;
          this.namedBodies.set(bodyId, body);
          return { id, result: { bodyId, x: body.position.x, y: body.position.y } };
        }

        case 'create_circle': {
          const bodyId = params.id || `circle_${this.autoIncrementId++}`;
          const mat = new Material({
            density: params.density ?? 1.0,
            friction: params.friction ?? 0.5,
            restitution: params.restitution ?? 0.1
          });
          const body = this.world.createCircle(params.x ?? 0, params.y ?? 0, params.radius ?? 0.5, {
            type: params.type ?? 'dynamic',
            angle: params.angle ?? 0,
            linearDamping: params.linearDamping ?? 0.05,
            angularDamping: params.angularDamping ?? 0.1,
            isDestructible: params.isDestructible ?? false,
            fractureForce: params.fractureForce ?? 1500.0,
            material: mat,
            userData: bodyId
          });
          body.apiId = bodyId;
          this.namedBodies.set(bodyId, body);
          return { id, result: { bodyId, x: body.position.x, y: body.position.y } };
        }

        case 'create_capsule': {
          const bodyId = params.id || `capsule_${this.autoIncrementId++}`;
          const mat = new Material({
            density: params.density ?? 1.0,
            friction: params.friction ?? 0.5,
            restitution: params.restitution ?? 0.1
          });
          const body = this.world.createCapsule(params.x ?? 0, params.y ?? 0, params.length ?? 1.0, params.radius ?? 0.3, {
            type: params.type ?? 'dynamic',
            angle: params.angle ?? 0,
            linearDamping: params.linearDamping ?? 0.05,
            angularDamping: params.angularDamping ?? 0.1,
            isDestructible: params.isDestructible ?? false,
            fractureForce: params.fractureForce ?? 1500.0,
            material: mat,
            userData: bodyId
          });
          body.apiId = bodyId;
          this.namedBodies.set(bodyId, body);
          return { id, result: { bodyId, x: body.position.x, y: body.position.y } };
        }

        case 'create_segment': {
          const bodyId = params.id || `segment_${this.autoIncrementId++}`;
          const mat = new Material({ friction: params.friction ?? 0.8 });
          const body = this.world.createSegment(params.x1, params.y1, params.x2, params.y2, {
            type: 'static',
            material: mat,
            userData: bodyId
          });
          body.apiId = bodyId;
          this.namedBodies.set(bodyId, body);
          return { id, result: { bodyId } };
        }

        case 'create_joint': {
          const jointId = params.id || `joint_${this.autoIncrementId++}`;
          const bA = this.namedBodies.get(params.bodyA);
          const bB = this.namedBodies.get(params.bodyB);
          if (!bA || !bB) throw new Error(`Joint bodies not found: ${params.bodyA}, ${params.bodyB}`);

          let joint;
          if (params.type === 'revolute') {
            const anchor = new Vec2(params.anchorX ?? bA.position.x, params.anchorY ?? bA.position.y);
            joint = this.world.createRevoluteJoint(bA, bB, anchor, {
              breakingForce: params.breakingForce,
              enableMotor: params.enableMotor,
              motorSpeed: params.motorSpeed,
              maxMotorTorque: params.maxMotorTorque,
              enableLimit: params.enableLimit,
              lowerAngle: params.lowerAngle,
              upperAngle: params.upperAngle
            });
          } else if (params.type === 'distance') {
            const aA = new Vec2(params.localAnchorAx ?? 0, params.localAnchorAy ?? 0);
            const aB = new Vec2(params.localAnchorBx ?? 0, params.localAnchorBy ?? 0);
            joint = this.world.createDistanceJoint(bA, bB, aA, aB, {
              length: params.length,
              frequencyHz: params.frequencyHz,
              dampingRatio: params.dampingRatio,
              breakingForce: params.breakingForce
            });
          } else if (params.type === 'weld') {
            const anchor = new Vec2(params.anchorX ?? bA.position.x, params.anchorY ?? bA.position.y);
            joint = this.world.createWeldJoint(bA, bB, anchor, {
              breakingForce: params.breakingForce
            });
          }
          this.namedJoints.set(jointId, joint);
          return { id, result: { jointId } };
        }

        case 'step': {
          const dt = params.dt ?? (1.0 / 60.0);
          this.world.step(dt);
          return { id, result: this.getStateSnapshot() };
        }

        case 'get_state': {
          return { id, result: this.getStateSnapshot() };
        }

        case 'apply_force': {
          const b = this.namedBodies.get(params.id);
          if (b) {
            const f = new Vec2(params.fx, params.fy);
            if (params.px !== undefined && params.py !== undefined) {
              b.applyForceAtPoint(f, new Vec2(params.px, params.py));
            } else {
              b.applyForce(f);
            }
          }
          return { id, result: { status: 'ok' } };
        }

        case 'apply_impulse': {
          const b = this.namedBodies.get(params.id);
          if (b) {
            const imp = new Vec2(params.ix, params.iy);
            if (params.px !== undefined && params.py !== undefined) {
              b.applyImpulseAtPoint(imp, new Vec2(params.px, params.py));
            } else {
              b.applyImpulse(imp);
            }
          }
          return { id, result: { status: 'ok' } };
        }

        case 'raycast': {
          const origin = new Vec2(params.origin[0], params.origin[1]);
          const direction = new Vec2(params.direction[0], params.direction[1]);
          const maxDist = params.maxDistance ?? Infinity;
          const hit = this.world.raycast(origin, direction, maxDist);
          if (hit) {
            return {
              id,
              result: {
                hit: true,
                bodyId: hit.body.apiId || hit.body.userData,
                point: [hit.point.x, hit.point.y],
                normal: [hit.normal.x, hit.normal.y],
                fraction: hit.fraction
              }
            };
          }
          return { id, result: { hit: false } };
        }

        case 'bake': {
          const steps = params.steps ?? 240;
          const dt = params.dt ?? (1.0 / 60.0);
          const frames = [];

          for (let f = 0; f < steps; f++) {
            this.world.step(dt);
            frames.push({
              frame: f,
              time: f * dt,
              snapshot: this.getStateSnapshot()
            });
          }

          return { id, result: { totalFrames: steps, frames } };
        }

        default:
          throw new Error(`Unknown method: ${method}`);
      }
    } catch (err) {
      return { id, error: err.message };
    }
  }

  getStateSnapshot() {
    const bodies = [];
    for (const b of this.world.bodies) {
      bodies.push({
        id: b.apiId || b.userData || `b_${b.id}`,
        type: b.type,
        x: Number(b.position.x.toFixed(4)),
        y: Number(b.position.y.toFixed(4)),
        angle: Number(b.angle.toFixed(4)),
        angleDeg: Number((b.angle * 180.0 / Math.PI).toFixed(2)),
        vx: Number(b.velocity.x.toFixed(3)),
        vy: Number(b.velocity.y.toFixed(3)),
        w: Number(b.angularVelocity.toFixed(3)),
        isSleeping: b.isSleeping,
        shape: b.shapes[0]?.type || 'box'
      });
    }

    const events = [...this.world.destructionSystem.fractureEvents];
    // Leere Ereignisliste für nächsten Abruf
    this.world.destructionSystem.fractureEvents = [];

    return {
      time: performance.now(),
      bodyCount: this.world.bodies.length,
      jointCount: this.world.joints.length,
      brokenJoints: this.world.brokenJointsCount,
      bodies,
      events,
      subqg: {
        totalEdgeAction: this.world.subqgDiagnostics.totalEdgeAction,
        maxStrain: this.world.subqgDiagnostics.maxStrain,
        edgeCount: this.world.subqgDiagnostics.edgeCount
      }
    };
  }
}
