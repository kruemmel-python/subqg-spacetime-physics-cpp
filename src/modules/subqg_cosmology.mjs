import { MicroActionWorld } from './subqg_microaction.mjs';
import { extractCausalManifoldSector } from './subqg_collective_spin2_hessian.mjs';
import { SubQGGraphCoupledEngine } from './subqg_graph_coupled_gravity.mjs';
import {
  deriveGaugeReducedPhaseSpaceClosure,
  measureGaugeReducedClusteringDynamics
} from './subqg_substrate_clustering.mjs';

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
 * Diagnostic comparison with the summary parameters published by MUSE-DARK III.
 * Their a0(z) is conditional on a fitted RAR interpolation law. SubQG uses a
 * different microscopic response, so the summary parameters alone are not a
 * like-for-like likelihood test of the frozen SubQG response function.
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
  // Retain this numerical comparison as a diagnostic only. It compares
  // parameters belonging to different response laws and cannot decide whether
  // the SubQG response passes or fails the underlying acceleration data.
  const predictedSlope = (modelAtSampleHigh.a0AtRedshift - modelAtSampleLow.a0AtRedshift) /
    (sampleZHigh - sampleZLow);
  const slopeCompatible95 = predictedSlope >= observed.fittedLinearSlope95Low &&
    predictedSlope <= observed.fittedLinearSlope95High;
  const approximateOneSigma = ((observed.fittedLinearSlope95High - observed.fittedLinearSlope95Low) / 2) / 1.96;
  const nominalSlopeResidualSigma = Math.abs(predictedSlope - observed.fittedLinearSlope) / approximateOneSigma;
  return {
    schemaVersion: 2,
    testedHypothesis: 'a0(z) = [arccos(2*Theta-1)/(2*pi)] * c * H(z)',
    source: {
      title: 'MUSE-DARK III: The evolution of the radial acceleration relation at intermediate redshifts',
      authors: 'Ciocan et al.',
      journal: 'Astronomy & Astrophysics 709, L16 (2026)',
      doi: '10.1051/0004-6361/202659230',
      arxiv: '2604.22613',
      publicDataRelease: 'https://dark.univ-lyon1.fr/data-releases/',
      sourceValuesAre95PercentIntervals: true,
      publishedRARResponseLaw:
        'a_tot = a_bar / (1-exp(-sqrt(a_bar/a0)))'
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
      summaryParameterComparisonOnly: true,
      likeForLikeSubQGResponseTest: false,
      validDirectFalsification: false,
      rawAccelerationDataRequired: true,
      reason:
        'The published a0 slope is conditional on a different fitted RAR response law; it is not an observable independent of that law.'
    },
    verdict: {
      existingHubbleScalingHypothesisPasses: null,
      status: 'INCONCLUSIVE_FUNCTIONAL_FORM_MISMATCH',
      cosmologyGatePassed: false,
      fullSubQGGravityModelDisprovedByThisTest: false,
      interpretation:
        'The summary-fit slope neither validates nor falsifies the frozen SubQG response. Re-evaluate the public radial acceleration data with the actual SubQG likelihood.',
      requiredNextTheory:
        'Fit the frozen SubQG response directly to public (a_bar,a_tot,z) data, then derive H(z), acceleration-scale evolution, and perturbation growth from SubQG dynamics before any CMB/BAO claim.'
    }
  };
}

export function museDarkIIIHScalingAuditDefault() {
  return museDarkIIIHScalingAudit();
}

/**
 * Coordinate-free background kinematics from already defined observables:
 * spatial volume = number of cells in the largest causal manifold sector,
 * a = (V/V_final)^(1/3), and two intrinsic clock candidates.  External
 * generation ticks are never interpreted as physical time.
 */
export function canonicalRelationalBackgroundAudit({ seed = 42, steps = 400 } = {}) {
  if (!Number.isInteger(seed) || !Number.isInteger(steps) || steps < 1) {
    throw new RangeError('seed and positive integer steps are required');
  }
  const world = new MicroActionWorld({ seed });
  const raw = [];
  let previousVolume = 0;
  for (let generation = 0; generation < steps; generation++) {
    const row = world.step();
    if (row.created === null) continue;
    const sector = extractCausalManifoldSector(world);
    const volume = sector.cells.length;
    if (volume <= previousVolume) continue;
    const localClocks = [...world.eventClocks.values()];
    const meanLocalFaceClock = localClocks.length > 0
      ? localClocks.reduce((sum, value) => sum + value, 0) / localClocks.length : 0;
    const maximumCausalDepth = Math.max(0, ...world.events.map(event => event.depth));
    raw.push({
      generationIndexDiagnosticOnly: generation,
      nodes: world.nodes.length,
      causalEvents: world.events.length,
      spatialCellVolume: volume,
      acceptedCellsAllComponents: sector.acceptedAcrossAllComponents,
      meanLocalFaceClock,
      maximumCausalDepth
    });
    previousVolume = volume;
  }
  const final = raw.at(-1);
  if (!final) return {
    seed, steps, samples: [], monotonicCellVolume: false,
    backgroundScaleFactorKinematicsConstructed: false,
    uniqueGlobalRelationalTimeDerived: false,
    friedmannEquationDerived: false
  };
  const samples = raw.map(sample => {
    const scaleFactor = (sample.spatialCellVolume / final.spatialCellVolume) ** (1 / 3);
    return {
      ...sample,
      scaleFactor,
      redshiftFromCellVolume: 1 / scaleFactor - 1,
      normalizedMeanLocalFaceClock: sample.meanLocalFaceClock / final.meanLocalFaceClock,
      normalizedMaximumCausalDepth: sample.maximumCausalDepth / final.maximumCausalDepth
    };
  });
  const maximumNormalizedClockDisagreement = Math.max(...samples.map(sample =>
    Math.abs(sample.normalizedMeanLocalFaceClock - sample.normalizedMaximumCausalDepth)));
  const monotonicCellVolume = samples.every((sample, index) =>
    index === 0 || sample.spatialCellVolume > samples[index - 1].spatialCellVolume);
  const monotonicScaleFactor = samples.every((sample, index) =>
    index === 0 || sample.scaleFactor > samples[index - 1].scaleFactor);
  return {
    seed,
    steps,
    spatialVolumeDefinition: 'number of tetrahedra in largest causally selected connected manifold sector',
    scaleFactorDefinition: 'a=(V/V_final)^(1/3)',
    externalGenerationIndexUsedAsPhysicalTime: false,
    intrinsicClockCandidates: ['mean local face clock', 'maximum causal depth'],
    sampleCount: samples.length,
    finalSpatialCellVolume: final.spatialCellVolume,
    monotonicCellVolume,
    monotonicScaleFactor,
    maximumNormalizedClockDisagreement,
    backgroundScaleFactorKinematicsConstructed:
      samples.length >= 3 && monotonicCellVolume && monotonicScaleFactor,
    uniqueGlobalRelationalTimeDerived: maximumNormalizedClockDisagreement < 1e-2,
    friedmannEquationDerived: false,
    reasonFriedmannOpen:
      'The cell-volume scale factor is intrinsic, but existing clock observables do not define one unique global lapse or H(z).',
    samples
  };
}

export function canonicalRelationalBackgroundAuditDefault() {
  return canonicalRelationalBackgroundAudit();
}

/**
 * Derives and audits the substrate clustering closure from the gauge-reduced
 * phase-space count and the covariantly expanding network-field dynamics.
 */
export function deriveSubstrateClusteringClosure({
  omegaB = 0.0493,
  proposedOmegaSubEffective = 0.264107,
  kStar = 4,
  lambdaRatio = 1.12
} = {}) {
  for (const [name, value] of Object.entries({
    omegaB, proposedOmegaSubEffective, kStar, lambdaRatio
  })) {
    if (!Number.isFinite(value) || value <= 0) {
      throw new RangeError(`${name} must be positive and finite`);
    }
  }
  if (kStar !== 4) throw new RangeError('the derived SubQG closure requires kStar=4');
  const proposedEnergyRatio = proposedOmegaSubEffective / omegaB;
  const transitionEngine = new SubQGGraphCoupledEngine();
  const transition = transitionEngine.analyzeSubQGToMicroUniverseTransition({
    possibilityCount: 72,
    lambdaRatios: [lambdaRatio]
  }).transitionSweep[0];
  const phaseSpaceClosure = deriveGaugeReducedPhaseSpaceClosure({ lambdaRatio });
  const dynamicalMeasurements = [64, 80, 96].map(possibilityCount =>
    measureGaugeReducedClusteringDynamics({
      lambdaRatio,
      possibilityCount,
      geometryEvolution: 'covariantExpansion',
      fieldStepsPerCell: 2,
      dt: 0.01,
      averagingPeriods: 2,
      equilibrationPeriods: 2
    }));
  const dynamicalMeasurement = dynamicalMeasurements.at(-1);
  const measuredEnergyRatio = phaseSpaceClosure.networkExcitationEnergyRatio;
  const ratioRelativeError = Math.abs(measuredEnergyRatio - proposedEnergyRatio) /
    proposedEnergyRatio;
  const ratioDerived = ratioRelativeError <= 1e-4 &&
    phaseSpaceClosure.orthonormalityResidual < 1e-14 &&
    phaseSpaceClosure.gaugeProjectionResidual < 1e-14;
  const finiteVolumeW = dynamicalMeasurements.map(measurement => ({
    possibilityCount: measurement.possibilityCount,
    causalCellVolume: measurement.samples.at(-1).relationalCellVolume,
    w: measurement.timeAveragedNonCondensedEquationOfState,
    maximumRelativeChargeDrift: measurement.maximumAveragingChargeDrift
  }));
  const pressureMagnitudeDecreases = finiteVolumeW.every((point, index) =>
    index === 0 || Math.abs(point.w) < Math.abs(finiteVolumeW[index - 1].w));
  const pressurelessDerived = finiteVolumeW.every(point =>
    point.maximumRelativeChargeDrift < 1e-10) && pressureMagnitudeDecreases &&
    Math.abs(finiteVolumeW.at(-1).w) < 0.05;
  return {
    schemaVersion: 2,
    inputs: { omegaB, proposedOmegaSubEffective, kStar, lambdaRatio },
    proposedEnergyRatio,
    requiredInternalObservables: {
      condensedBaryonicSolitonEnergy: 'E_soliton',
      nonCondensedNetworkModeEnergy: 'E_noncondensed',
      measuredRatio: 'E_noncondensed/E_soliton',
      relationalVolume: 'V = causal manifold cell count',
      scaleFactor: 'a=(V/V_reference)^(1/3)',
      density: 'rho_noncondensed=E_noncondensed/V',
      equationOfState: 'w=-1-(1/3)*d ln(rho_noncondensed)/d ln(a)'
    },
    dustCriterion:
      'E_noncondensed remains constant while V grows, equivalently rho_noncondensed proportional to a^-3 and w=0',
    currentImplementationAudit: {
      variationalTransitionAnalyzerUsesLambdaRatio: true,
      variationalTransitionAtRequestedRatio: {
        spacetimeNucleated: transition.spacetimeNucleated,
        orderParameterDelta: transition.orderParameterDelta,
        actualizedNodes: transition.actualizedNodes,
        actualizedBonds: transition.actualizedBonds,
        actualizedTetrahedra: transition.actualizedTetrahedra,
        giantComponentFraction: transition.giantComponentFraction,
        maxCausalDepth: transition.maxCausalDepth
      },
      lambdaRatioStoredByGenesis: true,
      lambdaRatioEntersGenesisNucleationCondition: true,
      genesisNucleationCondition:
        'lambda*multiPhaseOverlap > lambdaCritical*maximumAffinity',
      lambdaRatioEntersGenesisFieldEvolution: true,
      solitonEnergyImplemented: true,
      nonCondensedEnergySectorSeparated: true,
      causalCellVolumeImplementedSeparately: true,
      energyAndCausalVolumeMeasuredInSameEvolution: true
    },
    measurement: {
      algorithmUsesProposedTargetValues: dynamicalMeasurement.targetValuesUsedByEvolution,
      measuredEnergyRatio,
      targetEnergyRatioForComparisonOnly: proposedEnergyRatio,
      ratioRelativeError,
      measuredEquationOfStateW: dynamicalMeasurement.timeAveragedNonCondensedEquationOfState,
      densityScalingExponent: dynamicalMeasurement.densityScalingExponent,
      phaseSpaceClosure,
      finiteVolumeDustSequence: finiteVolumeW,
      pressureMagnitudeDecreasesWithVolume: pressureMagnitudeDecreases,
      asymptoticDustDerivation:
        'the normalized graph spectrum is bounded, so physical gradient energy is O(a^-2); charge conservation dilutes nonlinear terms, the quadratic mass term dominates, and its time-averaged virial relation gives <K>=<V>, hence lim_(a->infinity) w=0',
      numericalTrajectory: dynamicalMeasurement,
      ratioEmergesWithoutTargetInput: ratioDerived,
      pressurelessBehaviorDerived: pressurelessDerived
    },
    verdict: {
      substrateClusteringClosureDerived: ratioDerived && pressurelessDerived,
      cmbBaoAgreementIsIndependentPrediction: false,
      status: ratioDerived && pressurelessDerived
        ? 'SUBQG_INTERNAL_CLOSURE_DERIVED'
        : 'DYNAMICAL_MEASUREMENT_IMPLEMENTED_CLOSURE_NOT_YET_REPRODUCED',
      reason: ratioDerived && pressurelessDerived
        ? 'The six gauge-reduced canonical phase-space quadratures give 6/lambda without a cosmological target, while the charge-conserving covariant finite-volume sequence approaches the analytically pressureless massive-field limit.'
        : 'At least one target-free phase-space or covariant dust criterion remains unresolved.',
      requiredNextImplementation:
        ratioDerived && pressurelessDerived
          ? 'Propagate the derived closure through the perturbation transfer functions and compare the resulting CMB, BAO, and growth observables.'
          : 'Increase the gauge-reduced finite-volume sequence and resolve whichever internal closure criterion remains open.'
    }
  };
}

export function deriveSubstrateClusteringClosureDefault() {
  return deriveSubstrateClusteringClosure();
}
