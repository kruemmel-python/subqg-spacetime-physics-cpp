import test from 'node:test';
import assert from 'node:assert/strict';
import { SubQGEmergentGravity } from '../src/modules/subqg_emergent_gravity_darkmatter.mjs';

test('SubQGEmergentGravity - parameter validation', () => {
  assert.doesNotThrow(() => new SubQGEmergentGravity());
  assert.throws(() => new SubQGEmergentGravity({ G: -1 }), RangeError);
  assert.throws(() => new SubQGEmergentGravity({ a0: 0 }), RangeError);
  assert.throws(() => new SubQGEmergentGravity({ rho0: -0.1 }), RangeError);
  assert.throws(() => new SubQGEmergentGravity({ supportRadius: 0 }), RangeError);
});

test('SubQG microscopic overlap reflects geometric and phase interference', () => {
  const engine = new SubQGEmergentGravity({ supportRadius: 1.0 });

  // Full overlap at zero distance with matching phase
  const maxOverlap = engine.microscopicOverlap(0, 0);
  assert.equal(maxOverlap, 1.0);

  // Partial overlap at distance 1.0 (2 * supportRadius = 2.0)
  const halfOverlap = engine.microscopicOverlap(1.0, 0);
  assert.equal(halfOverlap, 0.5);

  // Zero overlap beyond 2*R
  const zeroOverlap = engine.microscopicOverlap(2.5, 0);
  assert.equal(zeroOverlap, 0.0);

  // Destructive phase interference reduces overlap to 0 even at d=0
  const destructiveOverlap = engine.microscopicOverlap(0, Math.PI);
  assert(Math.abs(destructiveOverlap) < 1e-12);
});

test('High-acceleration regime matches Newtonian gravity (a >> a0)', () => {
  const engine = new SubQGEmergentGravity({ G: 1.0, a0: 0.01 });
  const M = 100.0;
  const r = 0.5; // Very close: gN = 100 / 0.25 = 400 >> 0.01

  const gN = engine.newtonianAcceleration(M, r);
  const gTotal = engine.totalAcceleration(M, r);

  // Relative deviation between emergent total acceleration and bare Newtonian must be microscopic
  const relativeDiff = Math.abs(gTotal - gN) / gN;
  assert(relativeDiff < 0.001, `Expected Newtonian convergence, got relative error: ${relativeDiff}`);
});

test('Ultra-low acceleration regime reproduces Milgrom/MOND relation (a << a0)', () => {
  const engine = new SubQGEmergentGravity({ G: 1.0, a0: 1.0 });
  const M = 1.0;
  const r = 1000.0; // Very far: gN = 1 / 1,000,000 = 1e-6 << 1.0

  const gN = engine.newtonianAcceleration(M, r);
  const gTotal = engine.totalAcceleration(M, r);
  const gMondExpected = Math.sqrt(gN * engine.a0);

  const relativeDiff = Math.abs(gTotal - gMondExpected) / gMondExpected;
  assert(relativeDiff < 0.001, `Expected MOND convergence, got relative error: ${relativeDiff}`);
});

test('Outer galactic orbital velocity becomes asymptotically flat without Dark Matter particles', () => {
  const engine = new SubQGEmergentGravity({ G: 1.0, a0: 0.1 });
  const M = 10.0;
  const vFlat = engine.asymptoticFlatVelocity(M);

  const rFar1 = 200.0;
  const rFar2 = 500.0;
  const v1 = engine.orbitalVelocity(M, rFar1);
  const v2 = engine.orbitalVelocity(M, rFar2);

  // Both should be extremely close to vFlat and to each other (flat rotation curve)
  assert(Math.abs(v1 - vFlat) / vFlat < 0.01);
  assert(Math.abs(v2 - vFlat) / vFlat < 0.005);
  assert(Math.abs(v1 - v2) / v1 < 0.01, 'Velocity must stay flat across radial span');
});

test('Exact Baryonic Tully-Fisher scaling v_flat^4 = G * M * a0 (exponent 1/4)', () => {
  const engine = new SubQGEmergentGravity({ G: 1.0, a0: 0.05 });
  const M1 = 5.0;
  const M2 = 80.0; // 16x mass ratio -> exactly 2x velocity ratio since 16^(1/4) = 2

  const vFlat1 = engine.asymptoticFlatVelocity(M1);
  const vFlat2 = engine.asymptoticFlatVelocity(M2);

  const massRatio = M2 / M1;
  const velocityRatio = vFlat2 / vFlat1;
  const measuredExponent = Math.log(velocityRatio) / Math.log(massRatio);

  assert(Math.abs(measuredExponent - 0.25) < 1e-12, `Tully-Fisher exponent must be exactly 0.25, got ${measuredExponent}`);
  assert(Math.abs(velocityRatio - 2.0) < 1e-12, '16x mass increase must double the flat orbital speed');
});

test('Apparent "Dark Matter" halo emerges purely as an artifact of the SubQG vacuum elasticity', () => {
  const engine = new SubQGEmergentGravity({ G: 1.0, a0: 0.1 });
  const M = 10.0;

  // At small radius, apparent dark matter is negligible
  const inner = engine.apparentDarkMatterFraction(M, 1.0);
  assert(inner.ratioDarkToBaryon < 0.05, 'Dark matter artifact should be negligible in inner core');

  // At large radius, apparent dark matter dominates, mimicking a halo
  const outer = engine.apparentDarkMatterFraction(M, 100.0);
  assert(outer.ratioDarkToBaryon > 2.0, 'Apparent dark matter fraction must grow to match observed halo effect');
});

test('Rotation curve profile generation is consistent and continuous', () => {
  const engine = new SubQGEmergentGravity({ G: 1.0, a0: 0.1 });
  const res = engine.computeRotationCurve(20.0, { rMin: 1.0, rMax: 100.0, steps: 50 });

  assert.equal(res.profile.length, 50);
  assert.equal(res.profile[0].regime, 'Newtonian');
  assert.equal(res.profile[res.profile.length - 1].regime, 'SubQG-Emergent');

  // Check monotonic transition of apparent dark matter ratio
  for (let i = 1; i < res.profile.length; i++) {
    assert(res.profile[i].ratioDarkToBaryon >= res.profile[i - 1].ratioDarkToBaryon);
  }
});
