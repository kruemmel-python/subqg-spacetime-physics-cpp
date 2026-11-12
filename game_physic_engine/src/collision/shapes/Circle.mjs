import { Shape } from './Shape.mjs';
import { Vec2 } from '../../math/Vec2.mjs';
import { AABB } from '../../math/AABB.mjs';

/**
 * Circle: Kreis-Kollisionsform (z. B. Bälle, Räder, Fässer).
 */
export class Circle extends Shape {
  constructor(radius = 0.5, offset = new Vec2(0, 0)) {
    super('circle');
    this.radius = Math.max(1e-4, radius);
    this.offset = offset.clone();
  }

  computeMassData(density) {
    const area = Math.PI * this.radius * this.radius;
    const mass = density * area;
    // Trägheitsmoment um Zentrum: I_0 = 1/2 * m * r^2
    // Nach Steinerschem Satz bei Versatz d: I = I_0 + m * d^2
    const dSq = this.offset.lengthSq();
    const inertia = 0.5 * mass * this.radius * this.radius + mass * dSq;
    return { mass, inertia, area };
  }

  computeAABB(transform) {
    const center = transform.transformPoint(this.offset);
    const r = this.radius;
    return new AABB(
      new Vec2(center.x - r, center.y - r),
      new Vec2(center.x + r, center.y + r)
    );
  }

  testPoint(point, transform) {
    const center = transform.transformPoint(this.offset);
    return center.distanceToSq(point) <= this.radius * this.radius;
  }

  raycast(ray, transform, maxDist = Infinity) {
    const center = transform.transformPoint(this.offset);
    const m = Vec2.sub(ray.origin, center);
    const b = m.dot(ray.direction);
    const c = m.dot(m) - this.radius * this.radius;

    // Strahlursprung außerhalb und zielt vom Kreis weg
    if (c > 0.0 && b > 0.0) return { hit: false };

    const discr = b * b - c;
    if (discr < 0.0) return { hit: false };

    let t = -b - Math.sqrt(discr);
    if (t < 0.0) t = 0.0; // Strahl startete im Kreis

    if (t > maxDist) return { hit: false };

    const hitPoint = Vec2.add(ray.origin, Vec2.scale(ray.direction, t));
    const normal = Vec2.sub(hitPoint, center).normalize();

    return {
      hit: true,
      fraction: t,
      point: hitPoint,
      normal
    };
  }
}
