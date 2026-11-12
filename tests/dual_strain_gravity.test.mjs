import test from 'node:test';
import assert from 'node:assert/strict';
import { subqgDualStrainAcceleration } from '../src/modules/subqg_dual_strain_gravity.mjs';

test('dual-strain law matches its canonical equation', () => {
  const gbar = 2.5e-11;
  const a0 = 1.2e-10;
  assert.equal(
    subqgDualStrainAcceleration(gbar, a0),
    Math.sqrt(gbar * gbar + gbar * a0)
  );
});

test('dual-strain law approaches Newton at high acceleration', () => {
  const gbar = 1;
  const predicted = subqgDualStrainAcceleration(gbar, 1e-12);
  assert(Math.abs(predicted / gbar - 1) < 1e-11);
});

test('dual-strain law approaches square-root regime at low acceleration', () => {
  const gbar = 1e-16;
  const a0 = 1e-10;
  const asymptotic = Math.sqrt(gbar * a0);
  assert(Math.abs(subqgDualStrainAcceleration(gbar, a0) / asymptotic - 1) < 1e-6);
});

test('dual-strain law rejects nonphysical inputs', () => {
  assert.throws(() => subqgDualStrainAcceleration(0, 1), RangeError);
  assert.throws(() => subqgDualStrainAcceleration(1, 0), RangeError);
  assert.throws(() => subqgDualStrainAcceleration(Number.NaN, 1), RangeError);
});

