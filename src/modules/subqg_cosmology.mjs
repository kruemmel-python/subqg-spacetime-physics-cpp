const C_METERS_PER_SECOND = 2.99792458e8;
const MPC_METERS = 3.085677581491367e22;

export function subqgHubbleScaledAcceleration(z, {
  threshold = 0.75,
  h0KmPerSecMpc = 70,
  omegaM = 0.315,
  omegaLambda = 0.685
} = {}) {
  for (const [name, value] of Object.entries({ z, threshold, h0KmPerSecMpc, omegaM, omegaLambda })) {
    if (!Number.isFinite(value)) throw new RangeError(`${name} must be finite`);
  }
  if (z < 0 || threshold < 0 || threshold > 1 || h0KmPerSecMpc <= 0 ||
      omegaM < 0 || omegaLambda < 0 || Math.abs(omegaM + omegaLambda - 1) > 1e-12) {
    throw new RangeError('invalid flat matter-Lambda cosmology inputs');
  }
  const criticalPhaseAngleRad = Math.acos(2 * threshold - 1);
  const horizonPhaseFraction = criticalPhaseAngleRad / (2 * Math.PI);
  const h0SI = h0KmPerSecMpc * 1000 / MPC_METERS;
  const a0AtZero = horizonPhaseFraction * C_METERS_PER_SECOND * h0SI;
  const hubbleRatio = Math.sqrt(omegaM * (1 + z) ** 3 + omegaLambda);
  return {
    z,
    criticalPhaseAngleRad,
    horizonPhaseFraction,
    h0SI,
    a0AtZero,
    hubbleRatio,
    a0AtRedshift: a0AtZero * hubbleRatio,
    derivativeAtZero: a0AtZero * 1.5 * omegaM
  };
}

/**
 * Direct out-of-sample test of the already published code hypothesis a0(z) ∝ H(z).
 * MUSE-DARK III reports 95% confidence intervals.  The nominal sigma is only
 * a readable diagnostic; pass/fail uses the published 95% interval directly.
 */
export function museDarkIIIHScalingAudit(options = {}) {
  const model = subqgHubbleScaledAcceleration(1, options);
  const sampleZLow = 0.33;
  const sampleZHigh = 1.44;
  const modelAtSampleLow = subqgHubbleScaledAcceleration(sampleZLow, options);
  const modelAtSampleHigh = subqgHubbleScaledAcceleration(sampleZHigh, options);
  const observed = {
    sample: '79 MUSE HUDF star-forming galaxies, 0.33 < z < 1.44',
    a0AtRepresentativeZ: 2.38e-10,
    a0AtRepresentativeZ95Low: 2.28e-10,
    a0AtRepresentativeZ95High: 2.50e-10,
    fittedIntercept: 1.00e-10,
    fittedIntercept95HalfWidth: 0.04e-10,
    fittedLinearSlope: 1.59e-10,
    fittedLinearSlope95Low: 1.49e-10,
    fittedLinearSlope95High: 1.70e-10,
    confidenceLevel: 0.95
  };
  // Compare like with like: the observation fits one linear slope across the
  // actual sample interval, so use the model secant across that same interval.
  const predictedSlope = (modelAtSampleHigh.a0AtRedshift - modelAtSampleLow.a0AtRedshift) /
    (sampleZHigh - sampleZLow);
  const slopeCompatible95 = predictedSlope >= observed.fittedLinearSlope95Low &&
    predictedSlope <= observed.fittedLinearSlope95High;
  const approximateOneSigma = ((observed.fittedLinearSlope95High - observed.fittedLinearSlope95Low) / 2) / 1.96;
  const nominalSlopeResidualSigma = Math.abs(predictedSlope - observed.fittedLinearSlope) / approximateOneSigma;
  return {
    schemaVersion: 1,
    testedHypothesis: 'a0(z) = [arccos(2*Theta-1)/(2*pi)] * c * H(z)',
    source: {
      title: 'MUSE-DARK III: The evolution of the radial acceleration relation at intermediate redshifts',
      authors: 'Ciocan et al.',
      journal: 'Astronomy & Astrophysics 709, L16 (2026)',
      doi: '10.1051/0004-6361/202659230',
      arxiv: '2604.22613',
      sourceValuesAre95PercentIntervals: true
    },
    modelInputs: {
      threshold: options.threshold ?? 0.75,
      h0KmPerSecMpc: options.h0KmPerSecMpc ?? 70,
      omegaM: options.omegaM ?? 0.315,
      omegaLambda: options.omegaLambda ?? 0.685,
      omegaParametersDerivedFromSubQG: false
    },
    prediction: {
      a0AtZero: model.a0AtZero,
      derivativeAtZero: model.derivativeAtZero,
      sampleRedshiftInterval: [sampleZLow, sampleZHigh],
      secantSlopeAcrossObservedInterval: predictedSlope,
      a0AtZ1: model.a0AtRedshift,
      hubbleRatioAtZ1: model.hubbleRatio
    },
    observation: observed,
    comparison: {
      predictedSlopeInsidePublished95Interval: slopeCompatible95,
      nominalSecantSlopeResidualSigma: nominalSlopeResidualSigma,
      primaryTestUsesPublishedIntervalNotNominalSigma: true
    },
    verdict: {
      existingHubbleScalingHypothesisPasses: slopeCompatible95,
      status: slopeCompatible95 ? 'COMPATIBLE' : 'FALSIFIED_BY_PUBLISHED_95_PERCENT_INTERVAL',
      cosmologyGatePassed: false,
      fullSubQGGravityModelDisprovedByThisTest: false,
      interpretation: slopeCompatible95
        ? 'The existing scaling survives this test, but no SubQG Friedmann equation is derived.'
        : 'The existing a0 proportional to H(z) bridge evolves too slowly; it must not be used as a validated SubQG cosmology.',
      requiredNextTheory:
        'Derive H(z), the acceleration-scale evolution, and perturbation growth from SubQG dynamics before any CMB/BAO claim.'
    }
  };
}

export function museDarkIIIHScalingAuditDefault() {
  return museDarkIIIHScalingAudit();
}
