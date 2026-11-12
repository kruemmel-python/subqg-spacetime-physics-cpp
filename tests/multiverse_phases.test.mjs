// tests/multiverse_phases.test.mjs
// Verifies the SubQG Multiverse Phase Diagram, the 6 emergent universe classes,
// and the generalized gravitational scaling law alpha = (d - 1)/(p + 1).

import test from 'node:test';
import assert from 'node:assert/strict';
import { SubQGMultiversePhaseEngine } from '../src/modules/subqg_multiverse_phases.mjs';

test('MULTIVERSE CRITERION 1: SubQG Possibility State (Lambda < Lambda_c) vs. Critical Fluctuations (Universum F)', () => {
  const engine = new SubQGMultiversePhaseEngine({ stateCount: 200, threshold: 0.75 });

  // 1. Below critical threshold (Lambda / Lambda_c = 0.999): pure possibility substrate
  const subqg = engine.evaluateLandauOrderParameter(0.999 * engine.lambdaCritical);
  assert.equal(subqg.deltaStar, 0.0, 'Order parameter must vanish identically below Lambda_c');
  const netSubQG = engine.nucleateSpacetimeNetwork(0.999 * engine.lambdaCritical);
  assert.equal(netSubQG.bondsCount, 0, 'No physical bonds may condense below Lambda_c');
  assert.equal(netSubQG.activeNodesCount, 0, 'No actualized nodes below Lambda_c');

  // 2. Just above critical threshold (Universum F, Lambda / Lambda_c = 1.0005):
  const univF_Landau = engine.evaluateLandauOrderParameter(1.0005 * engine.lambdaCritical);
  assert(univF_Landau.deltaStar > 0.0, 'Order parameter must nucleate above threshold');
  assert(univF_Landau.barrierDepth < 1e-6, 'Nucleation barrier must be extremely shallow near Lambda_c');
  assert.equal(univF_Landau.isStableAgainstFluctuations, false, 'Universum F must be unstable against thermal fluctuations');
});

test('MULTIVERSE CRITERION 2: Spacetime Islands (Universum A) - Fragmented Clusters & Infinite Inter-Island Distance', () => {
  const engine = new SubQGMultiversePhaseEngine({ stateCount: 240, threshold: 0.75 });
  const netA = engine.nucleateSpacetimeNetwork(1.010 * engine.lambdaCritical);

  assert(netA.componentsCount >= 3, `Expected at least 3 disconnected islands, got ${netA.componentsCount}`);
  assert(netA.giantFraction < 0.35, `Giant component must not dominate in island universe, got ${(netA.giantFraction * 100).toFixed(1)}%`);
  assert(netA.bondsCount > 0, 'Islands must contain internal actualized bonds');
});

test('MULTIVERSE CRITERION 3: Fractal Spacetime (Universum B) - Non-Integer Dimension d_eff != 3 at Percolation', () => {
  const engine = new SubQGMultiversePhaseEngine({ stateCount: 240, threshold: 0.75 });
  const netB = engine.nucleateSpacetimeNetwork(1.025 * engine.lambdaCritical);

  assert(netB.emergentDimension > 1.5 && netB.emergentDimension < 2.6, `Expected non-integer fractal dimension, got ${netB.emergentDimension}`);
  assert(netB.giantFraction > 0.20, 'Percolation cluster must have formed');
});

test('MULTIVERSE CRITERION 4: Generalized Gravitational Scaling Law alpha = (d - 1)/(p + 1) Verified', () => {
  const engine = new SubQGMultiversePhaseEngine({ stateCount: 180, threshold: 0.75 });
  const audit = engine.verifyGeneralizedGravitationalScalingLaw();

  assert.equal(audit.length, 5);

  // 1. Newton in 3D: p = 0, d = 3 => alpha = (3 - 1)/(0 + 1) = 2.0 (1/r^2 falloff)
  const newton = audit.find(c => c.name.includes('Newton'));
  assert(Math.abs(newton.measuredAlpha - 2.0) < 1e-6);
  assert.equal(newton.hasFlatRotationCurve, false);

  // 2. SubQG MOND in 3D: p = 1, d = 3 => alpha = (3 - 1)/(1 + 1) = 1.0 (1/r falloff, flat rotation curve)
  const mond = audit.find(c => c.name.includes('SubQG MOND'));
  assert(Math.abs(mond.measuredAlpha - 1.0) < 1e-6);
  assert.equal(mond.hasFlatRotationCurve, true);
  assert(mond.velocityVariationPercent < 1e-6, 'Flat rotation curve must have ~0% variation');

  // 3. Fractal Space: p = 1, d = 2.4 => alpha = (2.4 - 1)/(1 + 1) = 0.70 (1/r^0.7 falloff)
  const fractal = audit.find(c => c.name.includes('Fractal'));
  assert(Math.abs(fractal.measuredAlpha - 0.7) < 1e-6);

  // 4. 4D Spacetime: p = 1, d = 4 => alpha = (4 - 1)/(1 + 1) = 1.50 (1/r^1.5 falloff)
  const fourD = audit.find(c => c.name.includes('4D'));
  assert(Math.abs(fourD.measuredAlpha - 1.5) < 1e-6);

  // 5. Hyper-Connected 5D: p = 1, d = 5 => alpha = (5 - 1)/(1 + 1) = 2.00
  const fiveD = audit.find(c => c.name.includes('5D'));
  assert(Math.abs(fiveD.measuredAlpha - 2.0) < 1e-6);
});
