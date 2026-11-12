import { Vec2 } from './Vec2.mjs';

/**
 * Mat22: 2x2 Matrix für Rotationen, effektive Massen und Trägheitstransformationen.
 * Spaltenbasiert: [c1.x c2.x]
 *                 [c1.y c2.y]
 */
export class Mat22 {
  constructor(c1 = new Vec2(1, 0), c2 = new Vec2(0, 1)) {
    this.c1 = c1.clone();
    this.c2 = c2.clone();
  }

  set(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    this.c1.x = c;  this.c2.x = -s;
    this.c1.y = s;  this.c2.y = c;
    return this;
  }

  setElements(m00, m01, m10, m11) {
    this.c1.x = m00; this.c2.x = m01;
    this.c1.y = m10; this.c2.y = m11;
    return this;
  }

  copy(m) {
    this.c1.copy(m.c1);
    this.c2.copy(m.c2);
    return this;
  }

  mulVec(v) {
    return new Vec2(
      this.c1.x * v.x + this.c2.x * v.y,
      this.c1.y * v.x + this.c2.y * v.y
    );
  }

  mulMat(m) {
    return new Mat22(
      this.mulVec(m.c1),
      this.mulVec(m.c2)
    );
  }

  transpose() {
    const tmp = this.c1.y;
    this.c1.y = this.c2.x;
    this.c2.x = tmp;
    return this;
  }

  invert() {
    const a = this.c1.x, b = this.c2.x;
    const c = this.c1.y, d = this.c2.y;
    let det = a * d - b * c;
    if (Math.abs(det) < 1e-12) {
      det = 1e-12;
    }
    const invDet = 1.0 / det;
    this.c1.x =  d * invDet;
    this.c2.x = -b * invDet;
    this.c1.y = -c * invDet;
    this.c2.y =  a * invDet;
    return this;
  }

  /**
   * Löst lineares Gleichungssystem M * x = b
   */
  solve(b) {
    const a = this.c1.x, c = this.c2.x;
    const d = this.c1.y, e = this.c2.y;
    let det = a * e - c * d;
    if (Math.abs(det) < 1e-12) {
      det = 1e-12;
    }
    const invDet = 1.0 / det;
    return new Vec2(
      (e * b.x - c * b.y) * invDet,
      (a * b.y - d * b.x) * invDet
    );
  }

  static fromAngle(angle) {
    return new Mat22().set(angle);
  }
}
