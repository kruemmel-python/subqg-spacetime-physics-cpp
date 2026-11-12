import test from 'node:test';
import assert from 'node:assert/strict';
import {
  minkowskiNormSquared,
  linearizedEinsteinTensorFourier,
  pureGaugePerturbation,
  transverseTracelessPlaneWave,
  spinTwoInfraredAudit
} from '../src/modules/subqg_spin2_ir.mjs';

test('null wave vector has massless dispersion', () => {
  assert(Math.abs(minkowskiNormSquared([2, 0, 0, 2])) < 1e-15);
});

test('plus and cross tensor modes solve the vacuum field equation', () => {
  for (const polarization of [{ plus: 1, cross: 0 }, { plus: 0, cross: 1 }]) {
    const wave = transverseTracelessPlaneWave({ waveNumber: 0.4, ...polarization });
    assert.equal(wave.transverse, true);
    assert.equal(wave.traceless, true);
    assert(Math.abs(wave.dispersion.massSquared) < 1e-15);
    assert(wave.fieldEquation.maxResidual < 1e-12);
  }
});

test('linearized Einstein operator annihilates a pure gauge direction', () => {
  const k = [1.3, 0.2, -0.4, 0.7];
  const gauge = pureGaugePerturbation(k, [0.3, -0.5, 0.8, 0.1]);
  assert(linearizedEinsteinTensorFourier(gauge, k).maxResidual < 1e-12);
});

test('off-shell transverse tensor mode has nonzero field residual', () => {
  const h = transverseTracelessPlaneWave({ waveNumber: 0.4 }).hCovariant;
  assert(linearizedEinsteinTensorFourier(h, [0.6, 0, 0, 0.4]).maxResidual > 1e-3);
});

test('infrared audit passes internally but preserves microscopic caveat', () => {
  const audit = spinTwoInfraredAudit();
  assert.equal(audit.independentPhysicalPolarizations, 2);
  assert.equal(audit.infraredClosureSelfConsistent, true);
  assert.match(audit.microscopicMatchingStatus, /not yet derived/);
});

test('spin-two utilities reject malformed inputs', () => {
  assert.throws(() => minkowskiNormSquared([1, 2]), RangeError);
  assert.throws(() => transverseTracelessPlaneWave({ waveNumber: 0 }), RangeError);
});
