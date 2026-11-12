/**
 * Vec2: Hochperformante 2D Vektorklasse für SubQG Game Physics.
 */
export class Vec2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  copy(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  clone() {
    return new Vec2(this.x, this.y);
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  scale(s) {
    this.x *= s;
    this.y *= s;
    return this;
  }

  addScaled(v, s) {
    this.x += v.x * s;
    this.y += v.y * s;
    return this;
  }

  subScaled(v, s) {
    this.x -= v.x * s;
    this.y -= v.y * s;
    return this;
  }

  negate() {
    this.x = -this.x;
    this.y = -this.y;
    return this;
  }

  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  /**
   * 2D Kreuzprodukt mit anderem Vektor ergibt Skalar (z-Komponente): a.x * b.y - a.y * b.x
   */
  cross(v) {
    return this.x * v.y - this.y * v.x;
  }

  /**
   * Kreuzprodukt aus Skalar und Vektor: s x v = (-s * v.y, s * v.x)
   */
  crossScalar(s) {
    return new Vec2(-s * this.y, s * this.x);
  }

  lengthSq() {
    return this.x * this.x + this.y * this.y;
  }

  length() {
    return Math.hypot(this.x, this.y);
  }

  normalize() {
    const len = this.length();
    if (len > 1e-12) {
      const inv = 1.0 / len;
      this.x *= inv;
      this.y *= inv;
    } else {
      this.x = 0;
      this.y = 0;
    }
    return this;
  }

  perp() {
    // 90 Grad links herum
    return new Vec2(-this.y, this.x);
  }

  distanceToSq(v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return dx * dx + dy * dy;
  }

  distanceTo(v) {
    return Math.hypot(this.x - v.x, this.y - v.y);
  }

  rotate(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const x = this.x * c - this.y * s;
    const y = this.x * s + this.y * c;
    this.x = x;
    this.y = y;
    return this;
  }

  // Statische Utility-Methoden
  static zero() {
    return new Vec2(0, 0);
  }

  static add(a, b) {
    return new Vec2(a.x + b.x, a.y + b.y);
  }

  static sub(a, b) {
    return new Vec2(a.x - b.x, a.y - b.y);
  }

  static scale(v, s) {
    return new Vec2(v.x * s, v.y * s);
  }

  static dot(a, b) {
    return a.x * b.x + a.y * b.y;
  }

  static cross(a, b) {
    return a.x * b.y - a.y * b.x;
  }

  static crossScalarVec(s, v) {
    return new Vec2(-s * v.y, s * v.x);
  }

  static crossVecScalar(v, s) {
    return new Vec2(s * v.y, -s * v.x);
  }

  static distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  static distanceSq(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  }

  static lerp(a, b, t) {
    return new Vec2(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
  }
}
