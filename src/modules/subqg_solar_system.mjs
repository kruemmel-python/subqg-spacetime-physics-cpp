const SECONDS_PER_JULIAN_CENTURY = 36525 * 86400;
const MILLARCSECONDS_PER_RADIAN = 206264806.24709636;

function positive(name, value) {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError(`${name} must be finite and positive`);
}

/** Stable exact excess of sqrt(gN^2+a0*gN) over gN. */
export function dualStrainAnomalousAcceleration(gNewton, a0) {
  positive('gNewton', gNewton);
  positive('a0', a0);
  const ratio = a0 / gNewton;
  return a0 / (Math.sqrt(1 + ratio) + 1);
}

/** Leading high-acceleration excess: a0/2. */
export function dualStrainHighAccelerationLimit(a0) {
  positive('a0', a0);
  return a0 / 2;
}

/**
 * Orbit-averaged Gauss equation for a radial anomalous acceleration.
 * `anomalousInwardAcceleration(gN,r)` returns a positive inward magnitude.
 * The returned sign follows longitude of perihelion: a constant extra inward
 * acceleration produces a retrograde (negative) precession.
 */
export function secularPerihelionPrecession({
  semiMajorAxis,
  eccentricity,
  centralMu,
  anomalousInwardAcceleration,
  samples = 65536
}) {
  positive('semiMajorAxis', semiMajorAxis);
  positive('centralMu', centralMu);
  if (!Number.isFinite(eccentricity) || eccentricity <= 0 || eccentricity >= 1) {
    throw new RangeError('eccentricity must lie in (0,1)');
  }
  if (typeof anomalousInwardAcceleration !== 'function') throw new TypeError('acceleration function required');
  if (!Number.isInteger(samples) || samples < 1024) throw new RangeError('samples must be an integer >= 1024');

  const n = Math.sqrt(centralMu / semiMajorAxis ** 3);
  const root = Math.sqrt(1 - eccentricity ** 2);
  const step = 2 * Math.PI / samples;
  let weightedRateIntegral = 0;
  let minAnomaly = Infinity;
  let maxAnomaly = 0;
  for (let index = 0; index < samples; index++) {
    const trueAnomaly = (index + 0.5) * step;
    const cosine = Math.cos(trueAnomaly);
    const onePlusECos = 1 + eccentricity * cosine;
    const radius = semiMajorAxis * (1 - eccentricity ** 2) / onePlusECos;
    const gNewton = centralMu / (radius * radius);
    const anomaly = anomalousInwardAcceleration(gNewton, radius);
    if (!Number.isFinite(anomaly) || anomaly < 0) throw new RangeError('anomalous acceleration must be finite and nonnegative');
    minAnomaly = Math.min(minAnomaly, anomaly);
    maxAnomaly = Math.max(maxAnomaly, anomaly);
    const radialOutward = -anomaly;
    const instantaneousRate = -root / (n * semiMajorAxis * eccentricity) * radialOutward * cosine;
    const timeWeight = root ** 3 / (onePlusECos ** 2);
    weightedRateIntegral += instantaneousRate * timeWeight;
  }
  const radiansPerSecond = weightedRateIntegral / samples;
  return {
    radiansPerSecond,
    milliarcsecondsPerCentury:
      radiansPerSecond * SECONDS_PER_JULIAN_CENTURY * MILLARCSECONDS_PER_RADIAN,
    meanMotionRadiansPerSecond: n,
    orbitalPeriodSeconds: 2 * Math.PI / n,
    minAnomalousAcceleration: minAnomaly,
    maxAnomalousAcceleration: maxAnomaly,
    samples
  };
}

/** Exact orbit average for a constant inward radial perturbation. */
export function constantRadialAccelerationPrecession({ semiMajorAxis, eccentricity, centralMu, acceleration }) {
  positive('semiMajorAxis', semiMajorAxis);
  positive('centralMu', centralMu);
  positive('acceleration', acceleration);
  if (!Number.isFinite(eccentricity) || eccentricity < 0 || eccentricity >= 1) {
    throw new RangeError('eccentricity must lie in [0,1)');
  }
  const n = Math.sqrt(centralMu / semiMajorAxis ** 3);
  const radiansPerSecond = -acceleration * Math.sqrt(1 - eccentricity ** 2) / (n * semiMajorAxis);
  return {
    radiansPerSecond,
    milliarcsecondsPerCentury:
      radiansPerSecond * SECONDS_PER_JULIAN_CENTURY * MILLARCSECONDS_PER_RADIAN
  };
}
