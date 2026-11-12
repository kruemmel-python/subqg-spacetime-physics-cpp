import test from 'node:test';
import assert from 'node:assert/strict';
import { SubQGMicroDerivationAudit } from '../src/modules/subqg_micro_derivation_audit.mjs';

test('SubQGMicroDerivationAudit parameter validation', () => {
  const audit = new SubQGMicroDerivationAudit();
  assert.equal(audit.G, 1.0);
  assert.equal(audit.a0, 0.1);
  assert.equal(audit.rho0, 0.5);

  assert.equal(audit.discOverlap(0), 1.0);
  assert.equal(audit.discOverlap(3.0), 0.0);
  assert.throws(() => audit.discOverlap(-1), RangeError);
});

test('Pure 3D discrete lattice relaxation yields Newtonian exponent alpha ~ 2', () => {
  const audit = new SubQGMicroDerivationAudit();
  const profile = audit.solvePureMicroscopicLattice(6, 10.0);

  // Check intermediate radii (away from inner singularity and outer boundary)
  const validExponents = profile.filter(p => p.alpha !== undefined && Number.isFinite(p.alpha));
  assert(validExponents.length >= 2, 'Must yield measurable exponents');

  // The mean exponent on the 3D lattice must be close to 2 (Newtonian 1/r^2)
  const midExp = validExponents[Math.floor(validExponents.length / 2)].alpha;
  assert(midExp > 1.5 && midExp < 2.5, `3D lattice must yield alpha near 2.0, got ${midExp}`);
});

test('SubQG vacuum elasticity: inner regime exhibits Newtonian scaling alpha ~ 2', () => {
  const audit = new SubQGMicroDerivationAudit({ G: 1.0, a0: 0.1 });
  const mass = 100.0;
  // At r = 1.0: gN = 100.0 >> 0.1
  const p1 = audit.evaluateVacuumElasticity(mass, 0.5);
  const p2 = audit.evaluateVacuumElasticity(mass, 1.0);

  const logG = Math.log(p2.gEmergent / p1.gEmergent);
  const logR = Math.log(1.0 / 0.5);
  const alphaInner = -logG / logR;

  // Must be very close to 2.0
  assert(Math.abs(alphaInner - 2.0) < 0.01, `Inner regime must have alpha ~ 2.0, got ${alphaInner}`);
  assert(p2.apparentDarkMatterRatio < 0.01, 'Dark matter artifact must be negligible in the inner core');
});

test('SubQG vacuum elasticity: outer regime asymptotically approaches alpha ~ 1 (1/r)', () => {
  const audit = new SubQGMicroDerivationAudit({ G: 1.0, a0: 0.1 });
  const mass = 1.0;
  // Far out: r = 500 to 1000, gN = 1e-6 << 0.1
  const p1 = audit.evaluateVacuumElasticity(mass, 500.0);
  const p2 = audit.evaluateVacuumElasticity(mass, 1000.0);

  const logG = Math.log(p2.gEmergent / p1.gEmergent);
  const logR = Math.log(1000.0 / 500.0);
  const alphaOuter = -logG / logR;

  // Must approach 1.0 (1/r force law)
  assert(Math.abs(alphaOuter - 1.0) < 0.05, `Outer regime must have alpha approaching 1.0, got ${alphaOuter}`);
  assert(p2.apparentDarkMatterRatio > 10.0, 'Outer regime must exhibit dominant apparent dark matter ratio');
});

test('Comparative audit produces smooth monotonic transition from alpha ~ 2 to alpha ~ 1', () => {
  const audit = new SubQGMicroDerivationAudit({ G: 1.0, a0: 0.1 });
  const results = audit.runComparativeAudit(25.0, { rMin: 1.0, rMax: 50.0, steps: 20 });

  assert.equal(results.length, 20);
  // Alpha starts near 2 and decreases monotonically towards 1
  const measuredAlphas = results.filter(r => r.alpha !== undefined).map(r => r.alpha);
  assert(measuredAlphas[0] > 1.8, `First alpha should be > 1.8, got ${measuredAlphas[0]}`);
  assert(measuredAlphas.at(-1) < 1.3, `Last alpha should be < 1.3, got ${measuredAlphas.at(-1)}`);

  for (let i = 1; i < measuredAlphas.length; i++) {
    assert(measuredAlphas[i] <= measuredAlphas[i - 1] + 0.05, 'Alpha must decrease or plateau towards 1.0');
  }
});
