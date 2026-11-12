import { Vec2 } from './Vec2.mjs';

/**
 * Transform: Starre Koordinatentransformation (Position + Rotation)
 * Cacht cos und sin für maximale Performance ohne redundante Trigonometrie.
 */
export class Transform {
  constructor(position = new Vec2(0, 0), angle = 0) {
    this.position = position.clone();
    this.angle = angle;
    this.c = Math.cos(angle);
    this.s = Math.sin(angle);
  }

  set(pos, angle) {
    this.position.copy(pos);
    this.angle = angle;
    this.c = Math.cos(angle);
    this.s = Math.sin(angle);
    return this;
  }

  copy(t) {
    this.position.copy(t.position);
    this.angle = t.angle;
    this.c = t.c;
    this.s = t.s;
    return this;
  }

  clone() {
    return new Transform(this.position, this.angle);
  }

  setAngle(angle) {
    this.angle = angle;
    this.c = Math.cos(angle);
    this.s = Math.sin(angle);
    return this;
  }

  /**
   * Lokal zu Weltpunkt: T * p = R * p + position
   */
  transformPoint(p) {
    return new Vec2(
      this.position.x + (this.c * p.x - this.s * p.y),
      this.position.y + (this.s * p.x + this.c * p.y)
    );
  }

  /**
   * Lokal zu Weltvektor (nur Rotation): R * v
   */
  transformVector(v) {
    return new Vec2(
      this.c * v.x - this.s * v.y,
      this.s * v.x + this.c * v.y
    );
  }

  /**
   * Welt- zu Lokalpunkt: R^T * (p - position)
   */
  inverseTransformPoint(p) {
    const dx = p.x - this.position.x;
    const dy = p.y - this.position.y;
    return new Vec2(
      this.c * dx + this.s * dy,
      -this.s * dx + this.c * dy
    );
  }

  /**
   * Welt- zu Lokalvektor: R^T * v
   */
  inverseTransformVector(v) {
    return new Vec2(
      this.c * v.x + this.s * v.y,
      -this.s * v.x + this.c * v.y
    );
  }
}
