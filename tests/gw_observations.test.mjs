import test from 'node:test';
import assert from 'node:assert/strict';
import {
  masslessSpinTwoObservables,
  closedIntervalCompatibility,
  upperLimitCompatibility,
  directGravitationalWaveAudit
} from '../src/modules/subqg_gw_observations.mjs';

test('massless spin-two prediction has light speed and two TT modes', () => {
  const prediction = masslessSpinTwoObservables();
  assert.equal(prediction.gravitationalWaveSpeedMetersPerSecond, 299792458);
  assert.equal(prediction.fractionalSpeedDifferenceFromLight, 0);
  assert.equal(prediction.gravitonMassEvPerC2, 0);
  assert.deepEqual(prediction.polarizationModes, ['plus', 'cross']);
});

test('SubQG wave speed lies inside GW170817 multimessenger interval', () => {
  const compatibility = closedIntervalCompatibility(0, -3e-15, 7e-16);
  assert.equal(compatibility.compatible, true);
  assert.equal(compatibility.distanceToNearestBoundary, 7e-16);
});

test('massless prediction satisfies GWTC graviton-mass limits', () => {
  assert.equal(upperLimitCompatibility(0, 1.27e-23).compatible, true);
  assert.equal(upperLimitCompatibility(0, 1.92e-23).compatible, true);
});

test('direct observation audit passes but preserves microscopic caveat', () => {
  const audit = directGravitationalWaveAudit();
  assert.equal(audit.allDirectObservablesCompatible, true);
  assert.equal(audit.polarizationConstraints.compatible, true);
  assert.equal(audit.fullMicroscopicDerivationClosed, false);
});

test('GW observation helpers reject malformed constraints', () => {
  assert.throws(() => masslessSpinTwoObservables({ speedOfLightMetersPerSecond: 0 }), RangeError);
  assert.throws(() => closedIntervalCompatibility(0, 1, -1), RangeError);
  assert.throws(() => upperLimitCompatibility(-1, 1), RangeError);
  assert.throws(() => directGravitationalWaveAudit({ tensorVsVectorBayesFactorLower: -1 }), RangeError);
});
