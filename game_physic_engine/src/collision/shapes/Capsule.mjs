import { Shape } from './Shape.mjs';
import { Vec2 } from '../../math/Vec2.mjs';
import { AABB } from '../../math/AABB.mjs';

/**
 * Capsule: Kapselform (zwei Halbkreise verbunden durch ein Rechteck)
 * Ideal für Spielfiguren, Ragdolls, Gliedmaßen und Projektile.
 */
export class Capsule extends Shape {
  constructor(length = 1.0, radius = 0.3, offset = new Vec2(0, 0)) {
    super('capsule');
    this.length = Math.max(1e-4, length);
    this.radius = Math.max(1e-4, radius);
    this.offset = offset.clone();
    this.hl = this.length * 0.5;
  }

  computeMassData(density) {
    // Rechteck (length * 2 * radius) + zwei Halbkreise = 1 Vollkreis (pi * radius^2)
    const rectArea = this.length * (2.0 * this.radius);
    const circleArea = Math.PI * this.radius * this.radius;
    const area = rectArea + circleArea;
    const mass = density * area;

    // Trägheitsmoment um Zentrum:
    // I_rect = 1/12 * m_rect * (length^2 + (2*radius)^2)
    const mRect = density * rectArea;
    const iRect = (1.0 / 12.0) * mRect * (this.length * this.length + 4.0 * this.radius * this.radius);

    // I_circle = m_circle * (1/2 * r^2 + hl^2)
    const mCircle = density * circleArea;
    const iCircle = mCircle * (0.5 * this.radius * this.radius + this.hl * this.hl);

    const dSq = this.offset.lengthSq();
    const inertia = (iRect + iCircle) + mass * dSq;

    return { mass, inertia, area };
  }

  getLocalEndpoints() {
    const ox = this.offset.x;
    const oy = this.offset.y;
    // Entlang Y-Achse ausgerichtet
    return [
      new Vec2(ox, oy - this.hl),
      new Vec2(ox, oy + this.hl)
    ];
  }

  getWorldEndpoints(transform) {
    const [p1, p2] = this.getLocalEndpoints();
    return [
      transform.transformPoint(p1),
      transform.transformPoint(p2)
    ];
  }

  computeAABB(transform) {
    const [p1, p2] = this.getWorldEndpoints(transform);
    const r = this.radius;
    const min = new Vec2(
      Math.min(p1.x, p2.x) - r,
      Math.min(p1.y, p2.y) - r
    );
    const max = new Vec2(
      Math.max(p1.x, p2.x) + r,
      Math.max(p1.y, p2.y) + r
    );
    return new AABB(min, max);
  }

  testPoint(point, transform) {
    const [p1, p2] = this.getWorldEndpoints(transform);
    const seg = Vec2.sub(p2, p1);
    const lenSq = seg.lengthSq();
    if (lenSq < 1e-9) {
      return p1.distanceToSq(point) <= this.radius * this.radius;
    }
    const t = Math.max(0, Math.min(1, Vec2.sub(point, p1).dot(seg) / lenSq));
    const closest = Vec2.add(p1, Vec2.scale(seg, t));
    return closest.distanceToSq(point) <= this.radius * this.radius;
  }

  raycast(ray, transform, maxDist = Infinity) {
    // Kapsel als Minkowski-Summe aus Liniensegment und Kreis
    const [p1, p2] = this.getWorldEndpoints(transform);
    // Näherungs-Raycast über Segmentabstand
    const seg = Vec2.sub(p2, p1);
    const segLen = seg.length();
    // Bounding Box Test zuerst
    const aabb = this.computeAABB(transform);
    const hitBox = aabb.raycast(ray.origin, ray.direction, maxDist);
    if (!hitBox.hit) return { hit: false };

    // Feinprüfung: Teste Kreis an p1, Kreis an p2 und Zylinder-Flanken
    let bestHit = null;
    let minFraction = Infinity;

    // Test Endkappen als Kreise
    for (const p of [p1, p2]) {
      const m = Vec2.sub(ray.origin, p);
      const b = m.dot(ray.direction);
      const c = m.dot(m) - this.radius * this.radius;
      if (!(c > 0 && b > 0)) {
        const discr = b * b - c;
        if (discr >= 0) {
          let t = -b - Math.sqrt(discr);
          if (t >= 0 && t < minFraction && t <= maxDist) {
            minFraction = t;
            const pt = Vec2.add(ray.origin, Vec2.scale(ray.direction, t));
            bestHit = {
              hit: true,
              fraction: t,
              point: pt,
              normal: Vec2.sub(pt, p).normalize()
            };
          }
        }
      }
    }

    if (bestHit) return bestHit;
    return hitBox;
  }
}
