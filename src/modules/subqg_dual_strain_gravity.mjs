/**
 * Canonical SubQG dual-strain acceleration law.
 *
 * g_bar is the baryonic Newtonian acceleration and a0 is the single global
 * substrate acceleration scale. Both values must use the same units.
 *
 * This function is the frozen prediction consumed by internal simulations and
 * external empirical validation. Keeping one implementation prevents the
 * validation pipeline from silently testing a different equation.
 */
export function subqgDualStrainAcceleration(gbar, a0) {
  if (!Number.isFinite(gbar) || gbar <= 0) {
    throw new RangeError('gbar must be finite and positive');
  }
  if (!Number.isFinite(a0) || a0 <= 0) {
    throw new RangeError('a0 must be finite and positive');
  }
  return Math.sqrt(gbar * gbar + gbar * a0);
}

