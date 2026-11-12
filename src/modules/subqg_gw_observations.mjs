import { spinTwoInfraredAudit } from './subqg_spin2_ir.mjs';

function finite(name, value) {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be finite`);
}

export function masslessSpinTwoObservables({ speedOfLightMetersPerSecond = 299792458 } = {}) {
  if (!Number.isFinite(speedOfLightMetersPerSecond) || speedOfLightMetersPerSecond <= 0) {
    throw new RangeError('speedOfLightMetersPerSecond must be finite and positive');
  }
  const infrared = spinTwoInfraredAudit();
  return {
    gravitationalWaveSpeedMetersPerSecond: speedOfLightMetersPerSecond,
    fractionalSpeedDifferenceFromLight: 0,
    gravitonMassEvPerC2: 0,
    dispersionRelation: 'omega^2 = c^2 |k|^2',
    polarizationModes: ['plus', 'cross'],
    polarizationClass: 'pure tensor transverse-traceless',
    infraredClosureSelfConsistent: infrared.infraredClosureSelfConsistent,
    microscopicMatchingStatus: infrared.microscopicMatchingStatus
  };
}

export function closedIntervalCompatibility(prediction, lower, upper) {
  finite('prediction', prediction);
  finite('lower', lower);
  finite('upper', upper);
  if (lower > upper) throw new RangeError('lower must not exceed upper');
  return {
    compatible: prediction >= lower && prediction <= upper,
    distanceToNearestBoundary: Math.min(prediction - lower, upper - prediction)
  };
}

export function upperLimitCompatibility(prediction, upperLimit) {
  finite('prediction', prediction);
  finite('upperLimit', upperLimit);
  if (prediction < 0 || upperLimit < 0) throw new RangeError('mass and upper limit must be nonnegative');
  return { compatible: prediction <= upperLimit, margin: upperLimit - prediction };
}

export function directGravitationalWaveAudit({
  speedLower = -3e-15,
  speedUpper = 7e-16,
  gwtc3GravitonMassUpperEv = 1.27e-23,
  gwtc4GravitonMassUpperEv = 1.92e-23,
  tensorVsVectorBayesFactorLower = 200,
  tensorVsScalarBayesFactorLower = 1000
} = {}) {
  finite('tensorVsVectorBayesFactorLower', tensorVsVectorBayesFactorLower);
  finite('tensorVsScalarBayesFactorLower', tensorVsScalarBayesFactorLower);
  if (tensorVsVectorBayesFactorLower < 0 || tensorVsScalarBayesFactorLower < 0) {
    throw new RangeError('Bayes-factor lower bounds must be nonnegative');
  }
  const prediction = masslessSpinTwoObservables();
  const speed = closedIntervalCompatibility(prediction.fractionalSpeedDifferenceFromLight, speedLower, speedUpper);
  const gwtc3Mass = upperLimitCompatibility(prediction.gravitonMassEvPerC2, gwtc3GravitonMassUpperEv);
  const gwtc4Mass = upperLimitCompatibility(prediction.gravitonMassEvPerC2, gwtc4GravitonMassUpperEv);
  const polarizationCompatible = prediction.polarizationClass === 'pure tensor transverse-traceless' &&
    prediction.polarizationModes.length === 2 &&
    prediction.polarizationModes.includes('plus') && prediction.polarizationModes.includes('cross');
  return {
    prediction,
    speedConstraint: { lower: speedLower, upper: speedUpper, ...speed },
    dispersionConstraints: {
      gwtc3: { upperEvPerC2: gwtc3GravitonMassUpperEv, ...gwtc3Mass },
      gwtc4: { upperEvPerC2: gwtc4GravitonMassUpperEv, ...gwtc4Mass }
    },
    polarizationConstraints: {
      gw170814TensorVsVectorBayesFactorLower: tensorVsVectorBayesFactorLower,
      gw170814TensorVsScalarBayesFactorLower: tensorVsScalarBayesFactorLower,
      gwtc4NonTensorEvidence: false,
      compatible: polarizationCompatible
    },
    allDirectObservablesCompatible: speed.compatible && gwtc3Mass.compatible &&
      gwtc4Mass.compatible && polarizationCompatible,
    fullMicroscopicDerivationClosed: false
  };
}
