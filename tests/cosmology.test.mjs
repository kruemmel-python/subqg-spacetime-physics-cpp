import test from 'node:test';
import assert from 'node:assert/strict';
import {
  subqgHubbleScaledAcceleration,
  museDarkIIIHScalingAudit,
  canonicalRelationalBackgroundAudit,
  deriveSubstrateClusteringClosure
} from '../src/modules/subqg_cosmology.mjs';

test('existing threshold bridge gives the exact one-sixth horizon phase fraction', () => {
  const model = subqgHubbleScaledAcceleration(0);
  assert(Math.abs(model.horizonPhaseFraction - 1 / 6) < 1e-15);
  assert(model.a0AtZero > 1.13e-10 && model.a0AtZero < 1.14e-10);
});

test('canonical causal cell volume defines a monotonic relational scale factor', () => {
  const audit = canonicalRelationalBackgroundAudit();
  assert.equal(audit.sampleCount, 9);
  assert.equal(audit.finalSpatialCellVolume, 116);
  assert.equal(audit.monotonicCellVolume, true);
  assert.equal(audit.monotonicScaleFactor, true);
  assert.equal(audit.backgroundScaleFactorKinematicsConstructed, true);
  assert.equal(audit.externalGenerationIndexUsedAsPhysicalTime, false);
  assert.equal(audit.samples.at(-1).scaleFactor, 1);
});

test('existing intrinsic clocks do not yet determine a unique global Hubble history', () => {
  const audit = canonicalRelationalBackgroundAudit();
  assert(audit.maximumNormalizedClockDisagreement > 0.2);
  assert.equal(audit.uniqueGlobalRelationalTimeDerived, false);
  assert.equal(audit.friedmannEquationDerived, false);
});

test('gauge-reduced substrate closure derives the energy ratio and dust limit internally', () => {
  const audit = deriveSubstrateClusteringClosure();
  assert(audit.proposedEnergyRatio > 5.35 && audit.proposedEnergyRatio < 5.37);
  assert.equal(audit.currentImplementationAudit.variationalTransitionAnalyzerUsesLambdaRatio, true);
  assert.equal(audit.currentImplementationAudit.variationalTransitionAtRequestedRatio.spacetimeNucleated, true);
  assert.equal(audit.currentImplementationAudit.variationalTransitionAtRequestedRatio.actualizedNodes, 69);
  assert.equal(audit.currentImplementationAudit.lambdaRatioEntersGenesisNucleationCondition, true);
  assert.equal(audit.currentImplementationAudit.energyAndCausalVolumeMeasuredInSameEvolution, true);
  assert.equal(audit.measurement.algorithmUsesProposedTargetValues, false);
  assert(Math.abs(audit.measurement.measuredEnergyRatio - 6 / 1.12) < 1e-14);
  assert(audit.measurement.ratioRelativeError < 1e-6);
  assert.equal(audit.measurement.phaseSpaceClosure.canonicalPhaseSpaceQuadratures, 6);
  assert.equal(audit.measurement.ratioEmergesWithoutTargetInput, true);
  assert.equal(audit.measurement.pressureMagnitudeDecreasesWithVolume, true);
  assert(Math.abs(audit.measurement.measuredEquationOfStateW) < 0.05);
  assert.equal(audit.measurement.pressurelessBehaviorDerived, true);
  assert.equal(audit.verdict.substrateClusteringClosureDerived, true);
  assert.equal(audit.verdict.status, 'SUBQG_INTERNAL_CLOSURE_DERIVED');
});

test('MUSE-DARK III summary slope cannot decide a different SubQG response law', () => {
  const audit = museDarkIIIHScalingAudit();
  assert.equal(audit.comparison.predictedSlopeInsidePublished95Interval, false);
  assert.equal(audit.comparison.summaryParameterComparisonOnly, true);
  assert.equal(audit.comparison.likeForLikeSubQGResponseTest, false);
  assert.equal(audit.comparison.validDirectFalsification, false);
  assert.equal(audit.comparison.rawAccelerationDataRequired, true);
  assert.equal(audit.verdict.existingHubbleScalingHypothesisPasses, null);
  assert.equal(audit.verdict.status, 'INCONCLUSIVE_FUNCTIONAL_FORM_MISMATCH');
  assert.equal(audit.verdict.cosmologyGatePassed, false);
  assert.equal(audit.verdict.fullSubQGGravityModelDisprovedByThisTest, false);
});

test('cosmology bridge rejects non-flat or nonphysical inputs', () => {
  assert.throws(() => subqgHubbleScaledAcceleration(-1), RangeError);
  assert.throws(() => subqgHubbleScaledAcceleration(0, { omegaM: 0.3, omegaLambda: 0.6 }), RangeError);
  assert.throws(() => subqgHubbleScaledAcceleration(0, { threshold: 2 }), RangeError);
  assert.throws(() => canonicalRelationalBackgroundAudit({ steps: 0 }), RangeError);
  assert.throws(() => deriveSubstrateClusteringClosure({ lambdaRatio: 0 }), RangeError);
});
