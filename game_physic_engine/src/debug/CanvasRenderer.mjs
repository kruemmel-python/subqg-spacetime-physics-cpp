import { Vec2 } from '../math/Vec2.mjs';

/**
 * CanvasRenderer: Leichtgewichtiger 2D Canvas-Renderer zur Darstellung
 * von SubQG-Welten, RigidBodies, Gelenken, Kontakten und internem Metrikgitter.
 */
export class CanvasRenderer {
  constructor(canvas, world, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.world = world;

    // Kamera & Skalierung
    this.scale = options.scale ?? 30.0; // Pixel pro Meter
    this.camera = options.camera ?? new Vec2(0, 5); // Weltzentrum der Ansicht

    // Render-Flags
    this.showShapes = options.showShapes ?? true;
    this.showJoints = options.showJoints ?? true;
    this.showContacts = options.showContacts ?? true;
    this.showAABBs = options.showAABBs ?? false;
    this.showSubQGLattice = options.showSubQGLattice ?? false;
    this.showRaycasts = options.showRaycasts ?? true;

    this.activeRays = [];
  }

  worldToScreen(worldPos) {
    const cx = this.canvas.width * 0.5;
    const cy = this.canvas.height * 0.5;
    return {
      x: cx + (worldPos.x - this.camera.x) * this.scale,
      y: cy - (worldPos.y - this.camera.y) * this.scale // Y nach oben invertieren
    };
  }

  screenToWorld(screenX, screenY) {
    const cx = this.canvas.width * 0.5;
    const cy = this.canvas.height * 0.5;
    return new Vec2(
      this.camera.x + (screenX - cx) / this.scale,
      this.camera.y - (screenY - cy) / this.scale
    );
  }

  addDebugRay(ray, hit) {
    this.activeRays.push({ ray, hit, time: 0.1 });
  }

  render(dt = 0.016) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. SubQG Metrik-Gitter (falls aktiv)
    if (this.showSubQGLattice) {
      this._renderSubQGLattice();
    }

    // 2. Formen & Körper
    if (this.showShapes) {
      this._renderBodies();
    }

    // 3. Gelenke
    if (this.showJoints) {
      this._renderJoints();
    }

    // 4. Kontakte & Normalen
    if (this.showContacts) {
      this._renderContacts();
    }

    // 5. Raycasts
    if (this.showRaycasts) {
      this._renderRays(dt);
    }

    // 6. SubQG Trümmerteile & Holzsplitter
    this._renderDebris();
  }

  _renderSubQGLattice() {
    const ctx = this.ctx;
    const graph = this.world.subqgGraph;
    ctx.save();
    ctx.lineWidth = 1;

    for (const edge of graph.edges) {
      const uNode = graph.nodes.get(edge.u);
      const vNode = graph.nodes.get(edge.v);
      if (!uNode || !vNode) continue;

      const p1 = this.worldToScreen(uNode.pos);
      const p2 = this.worldToScreen(vNode.pos);

      // Kantenverzerrung visualisieren (Grün = flach, Rot = verzerrt)
      const strain = Math.min(1.0, Math.abs(edge.x_e - 1.0) * 10.0);
      if (strain > 0.01) {
        ctx.strokeStyle = `rgba(255, ${Math.floor(255 * (1 - strain))}, 0, ${0.2 + 0.6 * strain})`;
      } else {
        ctx.strokeStyle = 'rgba(70, 90, 120, 0.15)';
      }

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  _renderBodies() {
    const ctx = this.ctx;

    for (const b of this.world.bodies) {
      ctx.save();
      const isSleeping = b.isSleeping;
      const isStatic = b.type === 'static';

      for (const shape of b.shapes) {
        if (shape.isTrigger) {
          ctx.fillStyle = 'rgba(255, 200, 0, 0.25)';
          ctx.strokeStyle = '#ffbb00';
        } else if (isStatic) {
          ctx.fillStyle = '#2c3e50';
          ctx.strokeStyle = '#7f8c8d';
        } else if (isSleeping) {
          ctx.fillStyle = '#4a5568';
          ctx.strokeStyle = '#a0aec0';
        } else {
          // Dynamisch: Farbe nach Material
          const rest = shape.material.restitution;
          if (rest > 0.6) {
            ctx.fillStyle = '#e74c3c'; // Gummi / Springend
            ctx.strokeStyle = '#c0392b';
          } else if (shape.material.density > 4.0) {
            ctx.fillStyle = '#95a5a6'; // Metall
            ctx.strokeStyle = '#7f8c8d';
          } else {
            ctx.fillStyle = '#3498db'; // Standard Holz / Kiste
            ctx.strokeStyle = '#2980b9';
          }
        }

        ctx.lineWidth = 1.5;

        if (shape.type === 'circle') {
          const center = b.transform.transformPoint(shape.offset);
          const sc = this.worldToScreen(center);
          const r = shape.radius * this.scale;

          ctx.beginPath();
          ctx.arc(sc.x, sc.y, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Rotationslinie
          const edgePt = b.transform.transformPoint(new Vec2(shape.offset.x + shape.radius, shape.offset.y));
          const scEdge = this.worldToScreen(edgePt);
          ctx.beginPath();
          ctx.moveTo(sc.x, sc.y);
          ctx.lineTo(scEdge.x, scEdge.y);
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();

        } else if (shape.type === 'box' || shape.type === 'polygon') {
          const verts = shape.getWorldVertices(b.transform);
          if (verts.length > 0) {
            ctx.beginPath();
            const start = this.worldToScreen(verts[0]);
            ctx.moveTo(start.x, start.y);
            for (let i = 1; i < verts.length; i++) {
              const sc = this.worldToScreen(verts[i]);
              ctx.lineTo(sc.x, sc.y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }

        } else if (shape.type === 'capsule') {
          const [p1, p2] = shape.getWorldEndpoints(b.transform);
          const sc1 = this.worldToScreen(p1);
          const sc2 = this.worldToScreen(p2);
          const r = shape.radius * this.scale;

          ctx.lineWidth = r * 2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(sc1.x, sc1.y);
          ctx.lineTo(sc2.x, sc2.y);
          ctx.stroke();

        } else if (shape.type === 'segment') {
          const [w1, w2] = shape.getWorldEndpoints(b.transform);
          const sc1 = this.worldToScreen(w1);
          const sc2 = this.worldToScreen(w2);

          ctx.strokeStyle = '#ecf0f1';
          ctx.lineWidth = Math.max(2, shape.thickness * this.scale);
          ctx.beginPath();
          ctx.moveTo(sc1.x, sc1.y);
          ctx.lineTo(sc2.x, sc2.y);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }

  _renderJoints() {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = '#2ecc71';
    ctx.fillStyle = '#2ecc71';
    ctx.lineWidth = 2;

    for (const j of this.world.joints) {
      if (j.type === 'distance') {
        const pA = j.bodyA.transform.transformPoint(j.localAnchorA);
        const pB = j.bodyB.transform.transformPoint(j.localAnchorB);
        const scA = this.worldToScreen(pA);
        const scB = this.worldToScreen(pB);

        ctx.beginPath();
        ctx.moveTo(scA.x, scA.y);
        ctx.lineTo(scB.x, scB.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(scA.x, scA.y, 4, 0, Math.PI * 2);
        ctx.arc(scB.x, scB.y, 4, 0, Math.PI * 2);
        ctx.fill();

      } else if (j.type === 'revolute') {
        const pA = j.bodyA.transform.transformPoint(j.localAnchorA);
        const scA = this.worldToScreen(pA);

        ctx.beginPath();
        ctx.arc(scA.x, scA.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#e67e22';
        ctx.fill();
        ctx.stroke();

      } else if (j.type === 'pulley') {
        const pA = j.bodyA.transform.transformPoint(j.localAnchorA);
        const pB = j.bodyB.transform.transformPoint(j.localAnchorB);
        const gA = j.groundAnchorA;
        const gB = j.groundAnchorB;

        const scA = this.worldToScreen(pA);
        const scB = this.worldToScreen(pB);
        const scGA = this.worldToScreen(gA);
        const scGB = this.worldToScreen(gB);

        ctx.strokeStyle = '#9b59b6';
        ctx.beginPath();
        ctx.moveTo(scA.x, scA.y);
        ctx.lineTo(scGA.x, scGA.y);
        ctx.lineTo(scGB.x, scGB.y);
        ctx.lineTo(scB.x, scB.y);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  _renderContacts() {
    const ctx = this.ctx;
    ctx.save();
    for (const m of this.world.contactManifolds.values()) {
      if (m.isTrigger) continue;
      for (const cp of m.points) {
        const sc = this.worldToScreen(cp.point);

        // Kontaktpunkt
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(sc.x, sc.y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Normalenvektor
        const normalEnd = Vec2.add(cp.point, Vec2.scale(m.normal, 0.3));
        const scNorm = this.worldToScreen(normalEnd);
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sc.x, sc.y);
        ctx.lineTo(scNorm.x, scNorm.y);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  _renderRays(dt) {
    const ctx = this.ctx;
    ctx.save();

    for (let i = this.activeRays.length - 1; i >= 0; i--) {
      const item = this.activeRays[i];
      item.time -= dt;
      if (item.time <= 0) {
        this.activeRays.splice(i, 1);
        continue;
      }

      const ray = item.ray;
      const hit = item.hit;
      const start = this.worldToScreen(ray.origin);
      const endPt = hit && hit.hit ? hit.point : Vec2.add(ray.origin, Vec2.scale(ray.direction, Math.min(20, ray.maxDistance)));
      const end = this.worldToScreen(endPt);

      ctx.strokeStyle = hit && hit.hit ? '#2ecc71' : '#e74c3c';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      ctx.setLineDash([]);

      if (hit && hit.hit) {
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath();
        ctx.arc(end.x, end.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  _renderDebris() {
    if (!this.world.destructionSystem) return;
    const particles = this.world.destructionSystem.debrisParticles;
    if (!particles || particles.length === 0) return;

    const ctx = this.ctx;
    ctx.save();
    for (const p of particles) {
      const sc = this.worldToScreen(new Vec2(p.x, p.y));
      const r = Math.max(1.5, p.size * this.scale);
      ctx.fillStyle = p.color || '#f6ad55';
      ctx.globalAlpha = Math.max(0.1, Math.min(1.0, p.life));
      ctx.beginPath();
      ctx.arc(sc.x, sc.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
