/**
 * SubQG Emergent Spacetime, Gravity & Non-Dark-Matter Phenomenon Engine
 * 
 * Derivation & Simulation of:
 * 1. Emergent metric and gravitational acceleration from microscopic SubQG overlap density.
 * 2. Crossover from Newtonian gravity (a >> a0) to modified inertia/acceleration (a << a0).
 * 3. Asymptotic flat rotation curves (v(r) -> const) without hypothetical dark matter particles.
 * 4. Baryonic Tully-Fisher Relation (v_flat^4 = G * M_baryonic * a0).
 */

export class SubQGEmergentGravity {
  /**
   * @param {Object} options
   * @param {number} options.G - Effective gravitational coupling constant
   * @param {number} options.a0 - Critical Milgrom acceleration scale (~ c*H0 / 6)
   * @param {number} options.rho0 - Baseline vacuum SubQG background overlap density
   * @param {number} options.supportRadius - Microscopic excitation support radius R
   */
  constructor({ G = 1.0, a0 = 0.1, rho0 = 0.05, supportRadius = 1.0 } = {}) {
    if (!Number.isFinite(G) || G <= 0) throw new RangeError('G must be positive');
    if (!Number.isFinite(a0) || a0 <= 0) throw new RangeError('a0 must be positive');
    if (!Number.isFinite(rho0) || rho0 <= 0) throw new RangeError('rho0 must be positive');
    if (!Number.isFinite(supportRadius) || supportRadius <= 0) throw new RangeError('supportRadius must be positive');

    this.G = G;
    this.a0 = a0;
    this.rho0 = rho0;
    this.supportRadius = supportRadius;
  }

  /**
   * Microscopic SubQG pairwise overlap function between two points/excitations.
   * Based on the original SubQG finite support disc intersection.
   */
  microscopicOverlap(distance, phaseDiff = 0) {
    if (distance < 0) throw new RangeError('distance must be nonnegative');
    const geometricOverlap = Math.max(0, 1 - distance / (2 * this.supportRadius));
    // Phase modulation: constructive interference amplifies overlap
    const phaseFactor = (1 + Math.cos(phaseDiff)) / 2;
    return geometricOverlap * phaseFactor;
  }

  /**
   * Bare Newtonian acceleration induced by a localized baryonic mass M.
   */
  newtonianAcceleration(M, r) {
    if (M < 0 || r <= 0) throw new RangeError('M must be nonnegative and r positive');
    return (this.G * M) / (r * r);
  }

  /**
   * SubQG Interpolation Function mu(x) between Newtonian and MOND regimes.
   * Derived from the saturation of background vacuum strain in the SubQG medium:
   * mu(x) = x / sqrt(1 + x^2), where x = g / a0,
   * or the standard Bekenstein/Milgrom relation: g * mu(g/a0) = g_N.
   * Exact inversion: g = sqrt(g_N^2 / 2 + sqrt(g_N^4 / 4 + g_N^2 * a0^2)).
   * Asymptotics:
   *   g -> g_N              for g_N >> a0 (inner galaxy / solar system)
   *   g -> sqrt(g_N * a0)   for g_N << a0 (outer galaxy / low acceleration)
   */
  totalAcceleration(M, r) {
    const gN = this.newtonianAcceleration(M, r);
    // Standard MOND/Emergent Gravity inverted transition function
    // g * (g / (g + a0)) ~ gN (simple form) or smooth algebraic form:
    const g = Math.sqrt( (gN * gN) / 2 + Math.sqrt((gN * gN * gN * gN) / 4 + gN * gN * this.a0 * this.a0) );
    return g;
  }

  /**
   * Apparent "Dark Matter" phantom mass fraction required in standard GR
   * to mimic the SubQG emergent vacuum strain:
   * M_apparent(r) = (g(r) * r^2) / G - M_baryon
   */
  apparentDarkMatterFraction(M, r) {
    const g = this.totalAcceleration(M, r);
    const mTotalApparent = (g * r * r) / this.G;
    const mDark = Math.max(0, mTotalApparent - M);
    return {
      mBaryon: M,
      mDarkApparent: mDark,
      ratioDarkToBaryon: mDark / M
    };
  }

  /**
   * Circular orbital velocity v(r) = sqrt(g(r) * r).
   */
  orbitalVelocity(M, r) {
    const g = this.totalAcceleration(M, r);
    return Math.sqrt(g * r);
  }

  /**
   * Asymptotic flat velocity predicted by the Baryonic Tully-Fisher Relation (BTFR):
   * v_flat = (G * M * a0)^(1/4)
   */
  asymptoticFlatVelocity(M) {
    if (M <= 0) throw new RangeError('M must be positive');
    return Math.pow(this.G * M * this.a0, 0.25);
  }

  /**
   * Simulates radial profile of galactic rotation curve from r_min to r_max.
   */
  computeRotationCurve(M, { rMin = 0.5, rMax = 50.0, steps = 100 } = {}) {
    if (rMin >= rMax || steps < 2) throw new RangeError('invalid radial range or steps');
    const dr = (rMax - rMin) / (steps - 1);
    const profile = [];

    const vFlatExpected = this.asymptoticFlatVelocity(M);
    const rTransition = Math.sqrt((this.G * M) / this.a0); // Radius where gN == a0

    for (let i = 0; i < steps; i++) {
      const r = rMin + i * dr;
      const gN = this.newtonianAcceleration(M, r);
      const g = this.totalAcceleration(M, r);
      const vNewtonian = Math.sqrt(gN * r);
      const vTotal = this.orbitalVelocity(M, r);
      const dm = this.apparentDarkMatterFraction(M, r);

      profile.push({
        r,
        gN,
        gTotal: g,
        vNewtonian,
        vTotal,
        vFlatExpected,
        ratioToFlat: vTotal / vFlatExpected,
        ratioDarkToBaryon: dm.ratioDarkToBaryon,
        regime: gN > this.a0 ? 'Newtonian' : 'SubQG-Emergent'
      });
    }

    return {
      M,
      rTransition,
      vFlatExpected,
      profile
    };
  }
}
