import test from 'node:test';
import assert from 'node:assert/strict';
import { MicroActionWorld } from '../src/modules/subqg_microaction.mjs';
import { extractCausalManifoldSector } from '../src/modules/subqg_collective_spin2_hessian.mjs';
import {
  orientedRegularTetrahedronCoordinates,
  sharedFaceFrameTransport,
  spinTwoFrameTransport,
  canonicalSimplexParallelTransportAudit
} from '../src/modules/subqg_simplex_parallel_transport.mjs';

function canonicalWorld() {
  const world = new MicroActionWorld({ seed: 42 });
  world.run(400);
  return world;
}

test('oriented regular tetrahedron coordinates preserve all unit edges', () => {
  for (const orientation of [1, -1]) {
    const points = orientedRegularTetrahedronCoordinates(orientation);
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
      assert(Math.abs(Math.hypot(...points[i].map((value, k) => value - points[j][k])) - 1) < 1e-12);
    }
  }
});

test('shared-face transport is orientation-preserving and metric-compatible', () => {
  const sector = extractCausalManifoldSector(canonicalWorld());
  const bond = sector.dualBonds[0];
  const transport = sharedFaceFrameTransport(
    sector.cells[bond.i], sector.orientations[bond.i],
    sector.cells[bond.j], sector.orientations[bond.j], bond.face);
  assert(Math.abs(transport.determinant - 1) < 1e-12);
  assert(transport.orthogonalityResidual < 1e-12);
  assert(transport.faceMatchResidual < 1e-12);
});

test('induced plus-cross transport preserves polarization norm and orientation', () => {
  const sector = extractCausalManifoldSector(canonicalWorld());
  const bond = sector.dualBonds[0];
  const frame = sharedFaceFrameTransport(
    sector.cells[bond.i], sector.orientations[bond.i],
    sector.cells[bond.j], sector.orientations[bond.j], bond.face);
  const spinTwo = spinTwoFrameTransport(frame.rotationBToA);
  assert(Math.abs(spinTwo.mixingDeterminant - 1) < 1e-12);
  assert(spinTwo.mixingOrthogonalityResidual < 1e-12);
});

test('all causal-sector shared faces pass the parallel-transport audit', () => {
  const audit = canonicalSimplexParallelTransportAudit(canonicalWorld());
  assert.equal(audit.selectedCells, 116);
  assert.equal(audit.sharedFacesTested, 199);
  assert.equal(audit.localFrameTransportClosed, true);
  assert.equal(audit.spinTwoNormPreservingTransportClosed, true);
  assert.equal(audit.curvatureHolonomyAndPathIndependenceDerived, false);
});

test('parallel transport rejects malformed cells and orientations', () => {
  assert.throws(() => orientedRegularTetrahedronCoordinates(0), RangeError);
  assert.throws(() => sharedFaceFrameTransport([0, 1], 1, [0, 1, 2, 3], 1, [0, 1, 2]), RangeError);
});
