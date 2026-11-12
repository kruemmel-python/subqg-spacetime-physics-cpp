import { Shape } from './Shape.mjs';
import { Vec2 } from '../../math/Vec2.mjs';
import { AABB } from '../../math/AABB.mjs';

/**
 * Polygon: Konvexe Polygonform für Dreiecke, Sechsecke, Keile, Rampen etc.
 */
export class Polygon extends Shape {
  constructor(vertices = [], offset = new Vec2(0, 0)) {
    super('polygon');
    if (vertices.length < 3) {
      throw new Error('Polygon requires at least 3 vertices');
    }
    this.offset = offset.clone();
    this.localVertices = vertices.map(v => v.clone());
    this._ensureCounterClockwise();
    this.localNormals = this._computeLocalNormals();
  }

  _ensureCounterClockwise() {
    let area2 = 0;
    const n = this.localVertices.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area2 += this.localVertices[i].cross(this.localVertices[j]);
    }
    // Wenn im Uhrzeigersinn definiert, umkehren
    if (area2 < 0) {
      this.localVertices.reverse();
    }
  }

  _computeLocalNormals() {
    const normals = [];
    const n = this.localVertices.length;
    for (let i = 0; i < n; i++) {
      const p1 = this.localVertices[i];
      const p2 = this.localVertices[(i + 1) % n];
      const edge = Vec2.sub(p2, p1);
      // Nach außen gerichtete Normale (bei CCW ist das edge.perp() bzw. (edge.y, -edge.x) invertiert)
      const normal = new Vec2(edge.y, -edge.x).normalize();
      normals.push(normal);
    }
    return normals;
  }

  computeMassData(density) {
    let area = 0.0;
    let cx = 0.0;
    let cy = 0.0;
    let inertia = 0.0;
    const n = this.localVertices.length;

    for (let i = 0; i < n; i++) {
      const p1 = this.localVertices[i];
      const p2 = this.localVertices[(i + 1) % n];
      const cross = p1.cross(p2);
      area += cross * 0.5;
      cx += (p1.x + p2.x) * cross;
      cy += (p1.y + p2.y) * cross;

      // Trägheitsintegral über Dreieck
      const intx2 = p1.x * p1.x + p1.x * p2.x + p2.x * p2.x;
      const inty2 = p1.y * p1.y + p1.y * p2.y + p2.y * p2.y;
      inertia += (0.25 * (1.0 / 3.0) * cross) * (intx2 + inty2);
    }

    area = Math.abs(area);
    const mass = density * area;
    inertia = Math.abs(inertia) * density;

    return { mass, inertia: Math.max(1e-4, inertia), area };
  }

  getWorldVertices(transform) {
    return this.localVertices.map(v => {
      const local = Vec2.add(v, this.offset);
      return transform.transformPoint(local);
    });
  }

  getWorldNormals(transform) {
    return this.localNormals.map(n => transform.transformVector(n));
  }

  computeAABB(transform) {
    const verts = this.getWorldVertices(transform);
    const min = new Vec2(Infinity, Infinity);
    const max = new Vec2(-Infinity, -Infinity);

    for (const v of verts) {
      if (v.x < min.x) min.x = v.x;
      if (v.x > max.x) max.x = v.x;
      if (v.y < min.y) min.y = v.y;
      if (v.y > max.y) max.y = v.y;
    }

    return new AABB(min, max);
  }

  testPoint(point, transform) {
    const verts = this.getWorldVertices(transform);
    const n = verts.length;
    for (let i = 0; i < n; i++) {
      const p1 = verts[i];
      const p2 = verts[(i + 1) % n];
      const edge = Vec2.sub(p2, p1);
      const toPoint = Vec2.sub(point, p1);
      if (edge.cross(toPoint) < 0) {
        return false;
      }
    }
    return true;
  }

  raycast(ray, transform, maxDist = Infinity) {
    const verts = this.getWorldVertices(transform);
    const normals = this.getWorldNormals(transform);
    let tmin = 0.0;
    let tmax = maxDist;
    let hitNormal = Vec2.zero();

    for (let i = 0; i < verts.length; i++) {
      const normal = normals[i];
      const v = verts[i];
      const denom = normal.dot(ray.direction);
      const numer = normal.dot(Vec2.sub(v, ray.origin));

      if (Math.abs(denom) < 1e-9) {
        // Parallel zur Kante
        if (numer < 0.0) return { hit: false };
      } else {
        const t = numer / denom;
        if (denom < 0.0) {
          // Strahl trifft von außen
          if (t > tmin) {
            tmin = t;
            hitNormal = normal;
          }
        } else {
          // Strahl verlässt Polygon
          if (t < tmax) {
            tmax = t;
          }
        }
      }
      if (tmin > tmax) return { hit: false };
    }

    return {
      hit: true,
      fraction: tmin,
      point: Vec2.add(ray.origin, Vec2.scale(ray.direction, tmin)),
      normal: hitNormal
    };
  }

  static createRegularPolygon(radius, sides = 5, offset = new Vec2(0, 0)) {
    const verts = [];
    const step = (Math.PI * 2.0) / sides;
    for (let i = 0; i < sides; i++) {
      const a = i * step;
      verts.push(new Vec2(Math.cos(a) * radius, Math.sin(a) * radius));
    }
    return new Polygon(verts, offset);
  }
}
