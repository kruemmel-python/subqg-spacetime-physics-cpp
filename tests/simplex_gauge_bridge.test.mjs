import test from 'node:test';
import assert from 'node:assert/strict';
import {
  transverseTracelessProjector,
  spatialGaugePerturbation,
  tensorPolarizationBasis,
  simplexRadiativeGaugeAudit
} from '../src/modules/subqg_simplex_gauge_bridge.mjs';

const maxAbs = matrix => Math.max(...matrix.flat().map(Math.abs));

test('TT projector annihilates a spatial gauge perturbation', () => {
  const k = [0.3, -0.4, 0.5];
  const gauge = spatialGaugePerturbation(k, [0.2, 0.1, -0.3]);
  assert(maxAbs(transverseTracelessProjector(gauge, k)) < 1e-12);
});

test('polarization basis supplies independent plus and cross tensors', () => {
  const basis = tensorPolarizationBasis([0.3, -0.4, 0.5]);
  const inner = basis.plus.flat().reduce((sum, value, i) => sum + value * basis.cross.flat()[i], 0);
  assert(Math.abs(inner) < 1e-12);
  assert(maxAbs(basis.plus) > 0);
  assert(maxAbs(basis.cross) > 0);
});

test('edge-derived radiative modes solve massless Fierz-Pauli exactly', () => {
  const audit = simplexRadiativeGaugeAudit();
  assert.equal(audit.physicalPolarizations, 2);
  assert.equal(audit.radiativeEdgeToSpinTwoBridgeClosed, true);
  assert(audit.fierzPauliVacuumResidual < 1e-12);
  assert(audit.pureSpatialGaugeProjectionResidual < 1e-12);
});

test('radiative bridge preserves the remaining action caveat', () => {
  assert.equal(simplexRadiativeGaugeAudit().canonicalAnchoredActionDerivationClosed, false);
});

test('gauge bridge rejects zero wave vectors and malformed tensors', () => {
  assert.throws(() => simplexRadiativeGaugeAudit({ waveVector: [0, 0, 0] }), RangeError);
  assert.throws(() => transverseTracelessProjector([[1]], [1, 0, 0]), RangeError);
});
