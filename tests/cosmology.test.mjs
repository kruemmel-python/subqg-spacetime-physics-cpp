import test from 'node:test';
import assert from 'node:assert/strict';
import {
  subqgHubbleScaledAcceleration,
  museDarkIIIHScalingAudit
} from '../src/modules/subqg_cosmology.mjs';

test('existing threshold bridge gives the exact one-sixth horizon phase fraction', () => {
  const model = subqgHubbleScaledAcceleration(0);
  assert(Math.abs(model.horizonPhaseFraction - 1 / 6) < 1e-15);
  assert(model.a0AtZero > 1.13e-10 && model.a0AtZero < 1.14e-10);
});

test('MUSE-DARK III falsifies the existing a0 proportional H slope at 95 percent', () => {
  const audit = museDarkIIIHScalingAudit();
  assert.equal(audit.comparison.predictedSlopeInsidePublished95Interval, false);
  assert.equal(audit.verdict.existingHubbleScalingHypothesisPasses, false);
  assert.equal(audit.verdict.status, 'FALSIFIED_BY_PUBLISHED_95_PERCENT_INTERVAL');
  assert.equal(audit.verdict.cosmologyGatePassed, false);
  assert.equal(audit.verdict.fullSubQGGravityModelDisprovedByThisTest, false);
  assert(audit.comparison.nominalSecantSlopeResidualSigma > 5);
});

test('cosmology bridge rejects non-flat or nonphysical inputs', () => {
  assert.throws(() => subqgHubbleScaledAcceleration(-1), RangeError);
  assert.throws(() => subqgHubbleScaledAcceleration(0, { omegaM: 0.3, omegaLambda: 0.6 }), RangeError);
  assert.throws(() => subqgHubbleScaledAcceleration(0, { threshold: 2 }), RangeError);
});
