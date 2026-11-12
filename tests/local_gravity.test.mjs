import test from 'node:test';
import assert from 'node:assert/strict';
import { SubQGGraphCoupledEngine } from '../src/modules/subqg_graph_coupled_gravity.mjs';
import {
  eotvosParameter,
  universalFreeFallPrediction,
  combinedIndependentUncertainty,
  standardizedResidual
} from '../src/modules/subqg_local_gravity.mjs';

test('universal metric coupling predicts exactly zero Eotvos ratio', () => {
  const prediction = universalFreeFallPrediction(7.9, [0.300939, 0.401706, 1.359813]);
  assert.equal(prediction.maxAbsoluteEta, 0);
  assert(prediction.objects.every(object => object.acceleration === 7.9));
  assert.equal(eotvosParameter(7.9, 7.9), 0);
});

test('MICROSCOPE null prediction lies within one combined sigma', () => {
  const sigma = combinedIndependentUncertainty(2.3e-15, 1.5e-15);
  assert(Math.abs(standardizedResidual(0, -1.5e-15, sigma)) < 1);
});

test('analytic microscopic deficit bound remains representable in logarithmic form', () => {
  const engine = new SubQGGraphCoupledEngine();
  const physical = engine.predictPhysicalAccelerationFromBaryonic(7.9);
  const bound = engine.boundMicroChannelDeficit(physical.gSubQGDimless);
  assert.equal(physical.conductivity, 1);
  assert(bound.log10UpperBound < -1e10);
  assert.equal(bound.upperBound, 0);
});

test('local-gravity helpers reject undefined physical cases', () => {
  assert.throws(() => eotvosParameter(1, -1), RangeError);
  assert.throws(() => universalFreeFallPrediction(0, [1, 2]), RangeError);
  assert.throws(() => universalFreeFallPrediction(1, [1, 0]), RangeError);
  assert.throws(() => combinedIndependentUncertainty(-1, 1), RangeError);
  assert.throws(() => standardizedResidual(0, 0, 0), RangeError);
});
