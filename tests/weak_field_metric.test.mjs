import test from 'node:test';
import assert from 'node:assert/strict';
import {
  weakFieldMetricComponents,
  lensingStrengthRelativeToGammaOne,
  einsteinRadiusRelativeToGammaOne,
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

test('weak-field metric rejects invalid regimes', () => {
  assert.throws(() => weakFieldMetricComponents({ potential: -1, gamma: 1 }), RangeError);
  assert.throws(() => weakFieldMetricComponents({ potential: 1, gamma: Number.NaN }), RangeError);
  assert.throws(() => lensingStrengthRelativeToGammaOne(-1.01), RangeError);
});
