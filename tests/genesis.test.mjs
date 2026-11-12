// tests/genesis.test.mjs
// Verifies SubQG Genesis: Self-Organization of Physical Laws in Micro-Universes
// Tests universal speed limit, particle soliton stability, emergent attractive gravity,
// and comparative physics across universes without pre-programmed physical formulas.

import test from 'node:test';
import assert from 'node:assert/strict';
import { SubQGGenesisEngine, executeMasterGenesisExperiment } from '../src/modules/subqg_genesis.mjs';

test('GENESIS CRITERION 1: Emergent Universal Speed Limit without Postulating c', () => {
  const engine = new SubQGGenesisEngine({ stateCount: 160, universeMode: 'CONTINUUM_3D' });
  const speed = engine.measureEmergentSpeedLimit();

  assert(speed.meanSpeedLimitC > 0.5, `Expected finite emergent speed limit, got ${speed.meanSpeedLimitC}`);
  assert(speed.speedSpreadPercent < 15.0, `Speed limit must be universal across sources (spread < 15%), got ${speed.speedSpreadPercent}%`);
  assert.equal(speed.isSpeedUniversal, true);
});

test('GENESIS CRITERION 2: Emergence and Stability of Soliton Quasiparticles', () => {
  const engine = new SubQGGenesisEngine({ stateCount: 160, universeMode: 'CONTINUUM_3D' });
  const soliton = engine.measureParticleSolitonStability({ evolutionSteps: 80 });

  assert(soliton.finalCoreRetention > 0.40, `Soliton must retain >40% energy in core, got ${(soliton.finalCoreRetention * 100).toFixed(1)}%`);
  assert.equal(soliton.isParticleStable, true);
});

test('GENESIS CRITERION 3: Emergent Attractive Gravity from Energy-Metric Feedback (Wheeler Principle)', () => {
  const engine = new SubQGGenesisEngine({ stateCount: 160, universeMode: 'CONTINUUM_3D' });
  const gravity = engine.measureEmergentGravitationalAttraction();

  assert(gravity.meanMetricContractionPercent > 15.0, `Energy must contract metric (>15%), got ${gravity.meanMetricContractionPercent}%`);
  assert(gravity.gravitationalFocusingRatio > 2.0, `Contracted metric must attract/focus excitation energy (>2x), got ${gravity.gravitationalFocusingRatio.toFixed(2)}x`);
  assert.equal(gravity.attractionProven, true);
});

test('GENESIS CRITERION 4: Comparative Genesis of Distinct Physical Laws from Identical SubQG Rules', () => {
  const results = executeMasterGenesisExperiment();

  assert.equal(results.comparativeLawsOfNature.natureLawsEmergeWithoutFormulas, true);
  assert.equal(results.comparativeLawsOfNature.bothShowParticleStability, true);
  assert.equal(results.comparativeLawsOfNature.bothShowAttractiveGravity, true);
  assert(results.universe1_Continuum.giantFraction > results.universe2_Fractal.giantFraction);
  assert(results.universe1_Continuum.emergentDimensionD !== results.universe2_Fractal.emergentDimensionD);
});
