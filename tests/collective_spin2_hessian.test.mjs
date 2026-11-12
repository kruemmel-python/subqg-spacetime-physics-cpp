import test from 'node:test';
import assert from 'node:assert/strict';
import { MicroActionWorld } from '../src/modules/subqg_microaction.mjs';
import {
  tetrahedralIncidenceAudit,
  extractOrientableManifoldSubcomplex,
  extractCausalManifoldSector,
  causalSelectionVariationalAudit,
  applyDualGraphHessian,
  dualGraphQuadraticAction,
  collectiveSpinTwoHessianAudit
} from '../src/modules/subqg_collective_spin2_hessian.mjs';

function canonicalWorld() {
  const world = new MicroActionWorld({ seed: 42 });
  world.run(400);
  return world;
}

test('full canonical clique complex exposes its non-manifold faces', () => {
  const audit = tetrahedralIncidenceAudit(canonicalWorld());
  assert.equal(audit.tetrahedralCells, 1003);
  assert.equal(audit.nonManifoldFaces, 707);
  assert.equal(audit.fullCliqueComplexIsFaceManifold, false);
});

test('causal selection is the exact minimum of a parameter-free incremental action', () => {
  const audit = causalSelectionVariationalAudit(canonicalWorld());
  assert.equal(audit.tetrahedralCellsConsidered, 1003);
  assert.equal(audit.acceptedCells, 264);
  assert.equal(audit.rejectedCells, 739);
  assert.equal(audit.everyDecisionMinimizesIncrementalAction, true);
  assert.equal(audit.selectionMatchesCausalExtractor, true);
  assert.equal(audit.variationalCharacterizationClosed, true);
  assert.equal(audit.derivedFromOriginalContinuousMicroaction, false);
  assert.equal(audit.cumulativeIncrementalAction, -264);
});

test('deterministic extraction finds a connected orientable face-manifold', () => {
  const manifold = extractOrientableManifoldSubcomplex(canonicalWorld());
  assert.equal(manifold.cells.length, 186);
  assert.equal(manifold.vertices, 41);
  assert.equal(manifold.dualBonds.length, 324);
  assert.equal(manifold.maximumFaceIncidence, 2);
  assert.equal(manifold.connected, true);
  assert.equal(manifold.orientable, true);
});

test('canonical birth order selects a parameter-free connected manifold sector', () => {
  const manifold = extractCausalManifoldSector(canonicalWorld());
  assert.equal(manifold.cells.length, 116);
  assert.equal(manifold.vertices, 28);
  assert.equal(manifold.dualBonds.length, 199);
  assert.equal(manifold.maximumFaceIncidence, 2);
  assert.equal(manifold.connected, true);
  assert.equal(manifold.orientable, true);
  assert.equal(manifold.fittedParameters, 0);
  assert.equal(manifold.selectionRandomSeedUsed, false);
});

test('causally selected dual TT Hessian has an exact massless uniform mode', () => {
  const manifold = extractCausalManifoldSector(canonicalWorld());
  const uniform = Array(manifold.cells.length).fill(1);
  assert.deepEqual(applyDualGraphHessian(uniform, manifold.dualBonds), Array(uniform.length).fill(0));
  assert.equal(dualGraphQuadraticAction(uniform, manifold.dualBonds), 0);
});

test('collective audit reports two modes and preserves selection caveat', () => {
  const audit = collectiveSpinTwoHessianAudit(canonicalWorld());
  assert.equal(audit.twoIndependentMasslessUniformModes, 2);
  assert.equal(audit.manifoldSupportedMasslessTTSector, true);
  assert(audit.nonconstantProbeAction > 0);
  assert.equal(audit.causalParameterFreeSelectionImplemented, true);
  assert.equal(audit.selectionRuleHasExactIncrementalVariationalForm, true);
  assert.equal(audit.selectionRuleDerivedFromOriginalContinuousMicroaction, false);
  assert.equal(audit.fullCanonicalHessianMatchingClosed, false);
});

test('dual Hessian rejects malformed data', () => {
  assert.throws(() => applyDualGraphHessian([0, 1], [{ i: 0, j: 2, w: 1 }]), RangeError);
  assert.throws(() => dualGraphQuadraticAction([0], [], 0), RangeError);
  assert.throws(() => extractOrientableManifoldSubcomplex(canonicalWorld(), { trials: 0 }), RangeError);
});
