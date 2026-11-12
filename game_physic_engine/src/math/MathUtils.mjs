/**
 * Mathematische Hilfsfunktionen und physikalische Konstanten
 */
export const EPSILON = 1e-9;
export const DEG2RAD = Math.PI / 180.0;
export const RAD2DEG = 180.0 / Math.PI;

export function clamp(val, min, max) {
  if (val < min) return min;
  if (val > max) return max;
  return val;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function sign(x) {
  return x >= 0 ? 1 : -1;
}

export function normalizeAngle(angle) {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
}

export function isApproxZero(val, eps = 1e-6) {
  return Math.abs(val) <= eps;
}
