import test from 'node:test';
import assert from 'node:assert/strict';
import { measureSubstrateClusteringDynamics } from '../src/modules/subqg_substrate_clustering.mjs';

test('lambda-driven clustering evolves energy and causal volume without target values', () => {
  const result = measureSubstrateClusteringDynamics();
  assert.equal(result.targetValuesUsedByEvolution, false);
  assert.equal(result.lambdaRatio, 1.12);
  assert(result.sampleCount >= 10);
  assert(result.samples.every((sample, index) =>
    index === 0 || sample.relationalCellVolume > result.samples[index - 1].relationalCellVolume));
  assert.equal(result.samples.at(-1).relationalCellVolume, 1924);
});

test('substrate clustering result converges under symplectic substepping', () => {
  const coarse = measureSubstrateClusteringDynamics({ fieldStepsPerCell: 1, dt: 0.02 });
  const refined = measureSubstrateClusteringDynamics({ fieldStepsPerCell: 2, dt: 0.01 });
  assert(Math.abs(coarse.finalMeasuredEnergyRatio - refined.finalMeasuredEnergyRatio) < 1e-4);
  assert(Math.abs(coarse.measuredEquationOfStateW - refined.measuredEquationOfStateW) < 2e-5);
});

test('substrate clustering controls reject nonphysical inputs', () => {
  assert.throws(() => measureSubstrateClusteringDynamics({ lambdaRatio: 1 }), RangeError);
  assert.throws(() => measureSubstrateClusteringDynamics({ possibilityCount: 4 }), RangeError);
  assert.throws(() => measureSubstrateClusteringDynamics({ fieldStepsPerCell: 0 }), RangeError);
});
