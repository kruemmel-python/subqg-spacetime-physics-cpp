import { Shape } from './Shape.mjs';
import { Vec2 } from '../../math/Vec2.mjs';
import { AABB } from '../../math/AABB.mjs';

/**
 * Segment: 1D Liniensegment (Kante) für Böden, Wände, Rampen und Hänge.
 * Normalerweise für statische Körper (`body.type = 'static'`).
 */
export class Segment extends Shape {
  constructor(p1 = new Vec2(-1, 0), p2 = new Vec2(1, 0)) {
    super('segment');
    this.p1 = p1.clone();
    this.p2 = p2.clone();
    this.thickness = 0.05; // Leichte Dicke zur Vermeidung von Tunneling
  }

  computeMassData(density) {
    // Statische Segmente haben standardmäßig unendliche Masse / 0 inverse Masse
    return { mass: 0, inertia: 0, area: 0 };
  }

  getWorldEndpoints(transform) {
    return [
      transform.transformPoint(this.p1),
      transform.transformPoint(this.p2)
    ];
  }

  computeAABB(transform) {
    const [w1, w2] = this.getWorldEndpoints(transform);
    const pad = this.thickness;
    return new AABB(
      new Vec2(Math.min(w1.x, w2.x) - pad, Math.min(w1.y, w2.y) - pad),
      new Vec2(Math.max(w1.x, w2.x) + pad, Math.max(w1.y, w2.y) + pad)
    );
  }

  testPoint(point, transform) {
    const [w1, w2] = this.getWorldEndpoints(transform);
    const seg = Vec2.sub(w2, w1);
    const lenSq = seg.lengthSq();
    if (lenSq < 1e-9) return w1.distanceToSq(point) <= this.thickness * this.thickness;
    const t = Math.max(0, Math.min(1, Vec2.sub(point, w1).dot(seg) / lenSq));
    const closest = Vec2.add(w1, Vec2.scale(seg, t));
    return closest.distanceToSq(point) <= this.thickness * this.thickness;
  }

  raycast(ray, transform, maxDist = Infinity) {
    const [w1, w2] = this.getWorldEndpoints(transform);
    const v1 = ray.origin;
    const v2 = Vec2.add(ray.origin, Vec2.scale(ray.direction, maxDist));

    const edge = Vec2.sub(w2, w1);
    const normal = new Vec2(edge.y, -edge.x).normalize();

    // 2D Linien-Schnittpunkt
    const d = ray.direction.cross(edge);
    if (Math.abs(d) < 1e-9) return { hit: false };

    const qp = Vec2.sub(w1, ray.origin);
    const t = qp.cross(edge) / d;
    const u = qp.cross(ray.direction) / d;

    if (t >= 0.0 && t <= maxDist && u >= 0.0 && u <= 1.0) {
      const hitPoint = Vec2.add(ray.origin, Vec2.scale(ray.direction, t));
      return {
        hit: true,
        fraction: t,
        point: hitPoint,
        normal: normal.dot(ray.direction) < 0 ? normal : normal.negate()
      };
    }

    return { hit: false };
  }
}
