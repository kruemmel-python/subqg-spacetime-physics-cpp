import test from 'node:test';
import assert from 'node:assert/strict';
import { MicroActionWorld } from '../src/modules/subqg_microaction.mjs';
import {
  tetrahedronGramFromSquaredLengths,
  tetrahedronSquaredLengthsFromGram,
  metricPerturbationFromSquaredLengthPerturbations,
  squaredLengthPerturbationsFromMetric,
  tetrahedralCliques,
  simplexTensorKinematicsAudit
} from '../src/modules/subqg_simplex_tensor_bridge.mjs';

test('six tetrahedron edge lengths reconstruct the local Gram metric exactly', () => {
  const squared = { d01: 1, d02: 1, d03: 1, d12: 1, d13: 1, d23: 1 };
  const gram = tetrahedronGramFromSquaredLengths(squared);
  assert.deepEqual(gram, [[1, 0.5, 0.5], [0.5, 1, 0.5], [0.5, 0.5, 1]]);
  assert.deepEqual(tetrahedronSquaredLengthsFromGram(gram), squared);
});

test('arbitrary symmetric metric perturbations have an exact edge encoding', () => {
  const h = [[0.2, 0.07, -0.03], [0.07, -0.08, 0.04], [-0.03, 0.04, -0.12]];
  const reconstructed = metricPerturbationFromSquaredLengthPerturbations(
    squaredLengthPerturbationsFromMetric(h));
  assert.ok(Math.max(...h.flatMap((row, i) => row.map((value, j) =>
    Math.abs(value - reconstructed[i][j])))) < 1e-15);
});

test('canonical seeded graph contains relational tetrahedral cells', () => {
  const world = new MicroActionWorld({ seed: 42 });
  world.run(400);
  const cells = tetrahedralCliques(world);
  assert.equal(cells.count, 1003);
});

test('simplex audit closes tensor kinematics without claiming massless dynamics', () => {
  const world = new MicroActionWorld({ seed: 42 });
  world.run(400);
  const audit = simplexTensorKinematicsAudit(world);
  assert.equal(audit.localSymmetricTensorKinematicsDerived, true);
  assert.equal(audit.newFundamentalDegreesOfFreedomAdded, false);
  assert.equal(audit.masslessGaugeDynamicsDerived, false);
  assert.equal(audit.spacetimeSpinTwoMatchingComplete, false);
});

test('simplex bridge rejects malformed geometric data', () => {
  assert.throws(() => tetrahedronGramFromSquaredLengths({ d01: 1 }), RangeError);
  assert.throws(() => tetrahedronSquaredLengthsFromGram([[1, 0], [0, 1]]), RangeError);
  assert.throws(() => tetrahedralCliques({}), TypeError);
});
