import test from 'node:test';
import assert from 'node:assert/strict';
import {
  weakFieldMetricComponents,
  lensingStrengthRelativeToGammaOne,
  einsteinRadiusRelativeToGammaOne,
  linearizedSpinTwoStaticDustClosure,
  microToSpinTwoBridgeAudit,
  singleMetricNoSlipClosure
} from '../src/modules/subqg_weak_field_metric.mjs';

test('weak-field metric reduces to flat spacetime at zero potential', () => {
  assert.deepEqual(
    weakFieldMetricComponents({ potential: 0, gamma: 1 }),
    { g00: -1, spatialDiagonal: 1, epsilon: 0, gamma: 1 }
  );
});

test('gamma one gives the full metric light-deflection strength', () => {
  assert.equal(lensingStrengthRelativeToGammaOne(1), 1);
  assert.equal(einsteinRadiusRelativeToGammaOne(1), 1);
});

test('flat spatial metric predicts half strength and smaller Einstein radius', () => {
  assert.equal(lensingStrengthRelativeToGammaOne(0), 0.5);
  assert.equal(einsteinRadiusRelativeToGammaOne(0), Math.SQRT1_2);
});

test('gamma minus one is the no-lensing limit', () => {
  assert.equal(lensingStrengthRelativeToGammaOne(-1), 0);
  assert.equal(einsteinRadiusRelativeToGammaOne(-1), 0);
});

test('no-slip closure remains explicitly conditional', () => {
  const closure = singleMetricNoSlipClosure();
  assert.equal(closure.gamma, 1);
  assert.equal(closure.status, 'conditional');
  assert.equal(closure.requiredProof.length, 3);
});

test('linearized spin-two static dust has equal metric potentials', () => {
  const solution = linearizedSpinTwoStaticDustClosure(2e-8);
  assert.equal(solution.traceReversed00, 8e-8);
  assert.equal(solution.traceReversedSpatial, 0);
  assert.equal(solution.h00, 4e-8);
  assert.equal(solution.hSpatial, 4e-8);
  assert.equal(solution.gamma, 1);
  assert.equal(solution.noSlip, true);
});

test('micro-to-spin-two audit does not overstate the open bridge', () => {
  const audit = microToSpinTwoBridgeAudit();
  assert.equal(audit.staticDustNoSlipInsideFierzPauli, true);
  assert.equal(audit.masslessSpinTwoSpectrumFromCanonicalMicroaction, false);
  assert.equal(audit.continuumLorentzInvarianceFromCanonicalMicroaction, false);
  assert.equal(audit.universalPhotonAndMatterMetricCouplingFromCanonicalMicroaction, false);
  assert.equal(audit.bridgeComplete, false);
});

test('weak-field metric rejects invalid regimes', () => {
  assert.throws(() => weakFieldMetricComponents({ potential: -1, gamma: 1 }), RangeError);
  assert.throws(() => weakFieldMetricComponents({ potential: 1, gamma: Number.NaN }), RangeError);
  assert.throws(() => lensingStrengthRelativeToGammaOne(-1.01), RangeError);
  assert.throws(() => linearizedSpinTwoStaticDustClosure(0), RangeError);
});
