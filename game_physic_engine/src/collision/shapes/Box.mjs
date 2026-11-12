import { Shape } from './Shape.mjs';
import { Vec2 } from '../../math/Vec2.mjs';
import { AABB } from '../../math/AABB.mjs';

/**
 * Box: Rechteckige Kollisionsform (Kisten, Böden, Wände, Plattformen).
 */
export class Box extends Shape {
  constructor(width = 1.0, height = 1.0, offset = new Vec2(0, 0)) {
    super('box');
    this.width = Math.max(1e-4, width);
    this.height = Math.max(1e-4, height);
    this.offset = offset.clone();
    this.hx = this.width * 0.5;
    this.hy = this.height * 0.5;
  }

  computeMassData(density) {
    const area = this.width * this.height;
    const mass = density * area;
    // Trägheitsmoment Kiste: I_0 = 1/12 * m * (w^2 + h^2)
    // Steiner: + m * d^2
    const dSq = this.offset.lengthSq();
    const inertia = (1.0 / 12.0) * mass * (this.width * this.width + this.height * this.height) + mass * dSq;
    return { mass, inertia, area };
  }

  getLocalVertices() {
    const ox = this.offset.x;
    const oy = this.offset.y;
    return [
      new Vec2(ox - this.hx, oy - this.hy),
      new Vec2(ox + this.hx, oy - this.hy),
      new Vec2(ox + this.hx, oy + this.hy),
      new Vec2(ox - this.hx, oy + this.hy)
    ];
  }

  getWorldVertices(transform) {
    const local = this.getLocalVertices();
    return local.map(v => transform.transformPoint(v));
  }

  getWorldNormals(transform) {
    // 2 orthogonale Einheitsnormalen reichen für Rechteck im SAT
    const n1 = transform.transformVector(new Vec2(1, 0));
    const n2 = transform.transformVector(new Vec2(0, 1));
    return [n1, n2];
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
    // Transformiere Weltpunkt in lokales Kistensystem
    const local = transform.inverseTransformPoint(point);
    const dx = local.x - this.offset.x;
    const dy = local.y - this.offset.y;
    return Math.abs(dx) <= this.hx && Math.abs(dy) <= this.hy;
  }

  raycast(ray, transform, maxDist = Infinity) {
    // Transformiere Strahl ins lokale System
    const localOrigin = transform.inverseTransformPoint(ray.origin);
    const localDir = transform.inverseTransformVector(ray.direction);

    const aabb = new AABB(
      new Vec2(this.offset.x - this.hx, this.offset.y - this.hy),
      new Vec2(this.offset.x + this.hx, this.offset.y + this.hy)
    );

    const hit = aabb.raycast(localOrigin, localDir, maxDist);
    if (!hit.hit) return { hit: false };

    // Zurück in Weltkoordinaten transformieren
    const worldPoint = transform.transformPoint(hit.point);
    const worldNormal = transform.transformVector(hit.normal);

    return {
      hit: true,
      fraction: hit.fraction,
      point: worldPoint,
      normal: worldNormal
    };
  }
}
