/**
 * SubQG dual-strain galactic surrogate.
 *
 * g_bar is the baryonic Newtonian acceleration and a0 is the single global
 * substrate acceleration scale. Both values must use the same units.
 *
 * This function is the frozen one-parameter comparison consumed by galactic
 * simulations and validation. The INPOP10a validation falsifies its direct
 * high-acceleration extrapolation as a universal local law. The microscopic
 * flux equation, which saturates to C_SubQG=1, is the surviving fundamental
 * cross-scale prediction. Keeping this implementation preserves the negative
 * result and prevents the galactic validation from silently changing models.
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
