import test from 'node:test';
import assert from 'node:assert/strict';
import {
  petersMathewsPeriodDerivative,
  binaryRadiationClosureAudit
} from '../src/modules/subqg_binary_pulsar.mjs';

const doublePulsar = {
  massASolar: 1.338185,
  massBSolar: 1.248868,
  orbitalPeriodSeconds: 0.1022515592973 * 86400,
  eccentricity: 0.087777023
};

test('leading quadrupole formula reproduces published Double Pulsar 2.5PN value', () => {
  const prediction = petersMathewsPeriodDerivative(doublePulsar);
  const published = -1.247810e-12;
  assert(Math.abs(prediction.periodDerivative / published - 1) < 5e-7);
});

test('leading quadrupole prediction agrees with measured GW damping', () => {
  const predicted = petersMathewsPeriodDerivative(doublePulsar).periodDerivative;
  const observed = -1.247782e-12;
  const sigma = 7.9e-17;
  assert(Math.abs((predicted - observed) / sigma) < 1);
});

test('binary radiation audit preserves the open microscopic bridge', () => {
  const audit = binaryRadiationClosureAudit();
  assert.equal(audit.independentPhysicalPolarizations, 2);
  assert.equal(audit.masslessDispersion, true);
  assert.equal(audit.leadingQuadrupoleFormulaAvailable, true);
  assert.equal(audit.universalSourceNormalizationFromCanonicalMicroaction, false);
  assert.equal(audit.nonlinearStrongFieldCompletionFromCanonicalMicroaction, false);
});

test('binary quadrupole function rejects nonphysical inputs', () => {
  assert.throws(() => petersMathewsPeriodDerivative({ ...doublePulsar, massASolar: 0 }), RangeError);
  assert.throws(() => petersMathewsPeriodDerivative({ ...doublePulsar, eccentricity: 1 }), RangeError);
});
