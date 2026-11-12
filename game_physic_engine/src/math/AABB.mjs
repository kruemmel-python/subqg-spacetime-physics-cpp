import { Vec2 } from './Vec2.mjs';

/**
 * AABB: Achsenparallele Bounding Box für Broadphase-Prüfungen & Raycasts.
 */
export class AABB {
  constructor(min = new Vec2(Infinity, Infinity), max = new Vec2(-Infinity, -Infinity)) {
    this.min = min.clone();
    this.max = max.clone();
  }

  set(min, max) {
    this.min.copy(min);
    this.max.copy(max);
    return this;
  }

  copy(aabb) {
    this.min.copy(aabb.min);
    this.max.copy(aabb.max);
    return this;
  }

  clone() {
    return new AABB(this.min, this.max);
  }

  reset() {
    this.min.set(Infinity, Infinity);
    this.max.set(-Infinity, -Infinity);
    return this;
  }

  expand(margin) {
    this.min.x -= margin;
    this.min.y -= margin;
    this.max.x += margin;
    this.max.y += margin;
    return this;
  }

  expandByVec(v) {
    if (v.x < 0) this.min.x += v.x;
    else this.max.x += v.x;
    if (v.y < 0) this.min.y += v.y;
    else this.max.y += v.y;
    return this;
  }

  combine(other) {
    this.min.x = Math.min(this.min.x, other.min.x);
    this.min.y = Math.min(this.min.y, other.min.y);
    this.max.x = Math.max(this.max.x, other.max.x);
    this.max.y = Math.max(this.max.y, other.max.y);
    return this;
  }

  containsPoint(p) {
    return (
      p.x >= this.min.x &&
      p.x <= this.max.x &&
      p.y >= this.min.y &&
      p.y <= this.max.y
    );
  }

  containsAABB(other) {
    return (
      this.min.x <= other.min.x &&
      this.min.y <= other.min.y &&
      this.max.x >= other.max.x &&
      this.max.y >= other.max.y
    );
  }

  intersects(other) {
    return !(
      this.max.x < other.min.x ||
      this.min.x > other.max.x ||
      this.max.y < other.min.y ||
      this.min.y > other.max.y
    );
  }

  getCenter() {
    return new Vec2(
      (this.min.x + this.max.x) * 0.5,
      (this.min.y + this.max.y) * 0.5
    );
  }

  getExtents() {
    return new Vec2(
      (this.max.x - this.min.x) * 0.5,
      (this.max.y - this.min.y) * 0.5
    );
  }

  getArea() {
    const w = Math.max(0, this.max.x - this.min.x);
    const h = Math.max(0, this.max.y - this.min.y);
    return w * h;
  }

  getPerimeter() {
    const w = Math.max(0, this.max.x - this.min.x);
    const h = Math.max(0, this.max.y - this.min.y);
    return 2.0 * (w + h);
  }

  static combineArea(a, b) {
    const minX = Math.min(a.min.x, b.min.x);
    const minY = Math.min(a.min.y, b.min.y);
    const maxX = Math.max(a.max.x, b.max.x);
    const maxY = Math.max(a.max.y, b.max.y);
    const w = Math.max(0, maxX - minX);
    const h = Math.max(0, maxY - minY);
    return w * h;
  }

  /**
   * Fast Raycast gegen AABB (Slab-Methode)
   * Gibt { hit: boolean, fraction: number, normal: Vec2 } zurück
   */
  raycast(origin, dir, maxFraction = 1.0) {
    let tmin = 0.0;
    let tmax = maxFraction;
    let normalX = 0;
    let normalY = 0;

    // X-Achse
    if (Math.abs(dir.x) < 1e-12) {
      if (origin.x < this.min.x || origin.x > this.max.x) {
        return { hit: false, fraction: 0, normal: Vec2.zero() };
      }
    } else {
      const invD = 1.0 / dir.x;
      let t1 = (this.min.x - origin.x) * invD;
      let t2 = (this.max.x - origin.x) * invD;
      let sign = -1.0;
      if (t1 > t2) {
        const tmp = t1; t1 = t2; t2 = tmp;
        sign = 1.0;
      }
      if (t1 > tmin) {
        tmin = t1;
        normalX = sign;
        normalY = 0;
      }
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return { hit: false, fraction: 0, normal: Vec2.zero() };
    }

    // Y-Achse
    if (Math.abs(dir.y) < 1e-12) {
      if (origin.y < this.min.y || origin.y > this.max.y) {
        return { hit: false, fraction: 0, normal: Vec2.zero() };
      }
    } else {
      const invD = 1.0 / dir.y;
      let t1 = (this.min.y - origin.y) * invD;
      let t2 = (this.max.y - origin.y) * invD;
      let sign = -1.0;
      if (t1 > t2) {
        const tmp = t1; t1 = t2; t2 = tmp;
        sign = 1.0;
      }
      if (t1 > tmin) {
        tmin = t1;
        normalX = 0;
        normalY = sign;
      }
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return { hit: false, fraction: 0, normal: Vec2.zero() };
    }

    return {
      hit: true,
      fraction: tmin,
      point: new Vec2(origin.x + dir.x * tmin, origin.y + dir.y * tmin),
      normal: new Vec2(normalX, normalY)
    };
  }
}
