const C_METERS_PER_SECOND = 299792458;

function finite(name, value) {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be finite`);
}

/**
 * Weak-field, static isotropic metric written with positive Newtonian
 * potential U:
 *   ds² = -(1 - 2U/c²)c²dt² + (1 + 2γU/c²)dℓ².
 *
 * This utility does not derive gamma. It makes the missing relativistic
 * closure explicit so that dynamics and light bending cannot be conflated.
 */
export function weakFieldMetricComponents({ potential, gamma, c = C_METERS_PER_SECOND }) {
  finite('potential', potential);
  finite('gamma', gamma);
  finite('c', c);
  if (potential < 0 || c <= 0) throw new RangeError('potential must be nonnegative and c positive');
  const epsilon = potential / (c * c);
  if (2 * epsilon >= 1) throw new RangeError('weak-field approximation violated');
  return {
    g00: -(1 - 2 * epsilon),
    spatialDiagonal: 1 + 2 * gamma * epsilon,
    epsilon,
    gamma
  };
}

/** Lensing mass/deflection strength relative to the gamma=1 metric. */
export function lensingStrengthRelativeToGammaOne(gamma) {
  finite('gamma', gamma);
  if (gamma < -1) throw new RangeError('gamma below -1 gives negative weak-field lensing strength');
  return (1 + gamma) / 2;
}

/** Einstein-radius multiplier relative to the gamma=1 prediction. */
export function einsteinRadiusRelativeToGammaOne(gamma) {
  return Math.sqrt(lensingStrengthRelativeToGammaOne(gamma));
}

/**
 * Algebraic static-dust solution of the linearized Fierz-Pauli equations.
 * `potentialOverC2` is U/c². Trace reversal then yields
 * bar(h)_00=4U/c², bar(h)_ij=0 and h_00=h_ii=2U/c².
 * This proves no-slip inside the spin-2 effective theory; it does not by
 * itself prove that the microscopic graph action flows to that theory.
 */
export function linearizedSpinTwoStaticDustClosure(potentialOverC2) {
  finite('potentialOverC2', potentialOverC2);
  if (potentialOverC2 <= 0 || 2 * potentialOverC2 >= 1) {
    throw new RangeError('potentialOverC2 must be positive and weak');
  }
  const traceReversed00 = 4 * potentialOverC2;
  const traceReversedSpatial = 0;
  const trace = -traceReversed00;
  const h00 = traceReversed00 + 0.5 * trace;
  const hSpatial = traceReversedSpatial - 0.5 * trace;
  return {
    effectiveEquation: 'box(bar(h)_mu_nu) = -16*pi*G*T_mu_nu/c^4',
    sourceSector: 'static pressureless matter: T00=rho*c^2, Tij=0',
    traceReversed00,
    traceReversedSpatial,
    trace,
    h00,
    hSpatial,
    gamma: hSpatial / h00,
    noSlip: hSpatial === h00
  };
}

/** Exact current status of the microscopic-to-relativistic bridge. */
export function microToSpinTwoBridgeAudit() {
  return Object.freeze({
    staticDustNoSlipInsideFierzPauli: true,
    leanTheorem: 'SubQG.linearized_spin_two_static_dust_no_slip',
    masslessSpinTwoSpectrumFromCanonicalMicroaction: false,
    continuumLorentzInvarianceFromCanonicalMicroaction: false,
    universalPhotonAndMatterMetricCouplingFromCanonicalMicroaction: false,
    bridgeComplete: false
  });
}

/**
 * Candidate relativistic closure for the already validated scalar dynamics.
 * gamma=1 follows if, and only if, the two weak-field scalar potentials have
 * no gravitational slip. The present SubQG microaction has not yet supplied
 * that proof, so the returned status is deliberately conditional.
 */
export function singleMetricNoSlipClosure() {
  const spinTwo = linearizedSpinTwoStaticDustClosure(1e-9);
  return Object.freeze({
    gamma: spinTwo.gamma,
    status: 'conditional',
    equation: 'Fierz-Pauli static dust: bar(h)00=4U/c^2, bar(h)ij=0; trace reversal gives h00=hij=2U/c^2 and gamma=1',
    formallyVerifiedTheorem: 'SubQG.linearized_spin_two_static_dust_gamma_one',
    requiredProof: [
      'massless spin-2 continuum spectrum from the SubQG graph action',
      'continuum Lorentz invariance from the SubQG graph action',
      'universal minimal coupling of massive and massless excitations'
    ]
  });
}
