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
 * Candidate relativistic closure for the already validated scalar dynamics.
 * gamma=1 follows if, and only if, the two weak-field scalar potentials have
 * no gravitational slip. The present SubQG microaction has not yet supplied
 * that proof, so the returned status is deliberately conditional.
 */
export function singleMetricNoSlipClosure() {
  return Object.freeze({
    gamma: 1,
    status: 'conditional',
    equation: 'Psi = Phi, hence gamma = Psi/Phi = 1',
    requiredProof: [
      'continuum Lorentzian metric from the SubQG graph action',
      'universal minimal coupling of massive and massless excitations',
      'vanishing weak-field gravitational slip for a static spherical source'
    ]
  });
}
