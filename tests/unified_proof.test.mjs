import test from 'node:test';
import assert from 'node:assert/strict';
import { SubQGUnifiedProofEngine } from '../src/modules/subqg_unified_proof_engine.mjs';

test('CRITERION 1: Fundamental SubQG Mechanism - State and Overlap Consistency', () => {
  const engine = new SubQGUnifiedProofEngine({
    supportRadius: 1.5,
    threshold: 0.45,
    rho0: 0.6,
    boxSize: 20.0
  });

  // Verify parameters
  assert.equal(engine.supportRadius, 1.5);
  assert.equal(engine.threshold, 0.45);
  assert.equal(engine.a0, 1.0 / 10.0); // 1 / (boxSize / 2)

  // Verify overlap: pure geometric + phase interference
  const posA = [0, 0, 0], posB = [1.0, 0, 0];
  const overlapInPhase = engine.computeOverlap(posA, 0.0, posB, 0.0);
  assert(overlapInPhase > 0, 'In-phase overlap within reach must be positive');

  const overlapOppositePhase = engine.computeOverlap(posA, 0.0, posB, Math.PI);
  assert(Math.abs(overlapOppositePhase) < 1e-12, 'Opposite phase must destructively cancel overlap');

  // Initialize microstructure without classical spacetime
  const stats = engine.initializeMicrostructure({ centralMass: 15.0 });
  assert(stats.nodes > 0, 'Nodes must be generated');
  assert(stats.edges > 0, 'Relational edges must form when overlap > threshold');
  assert(stats.faces > 0, 'Micro-faces must form from mutually overlapping triplets');
  assert(stats.events > 0, 'Face-creation events must be recorded');
});

test('CRITERION 2: Emergence of Space & Time - Relational Geometry and Causal Poset', () => {
  const engine = new SubQGUnifiedProofEngine({ supportRadius: 2.0, threshold: 0.4 });
  engine.initializeMicrostructure({ centralMass: 10.0 });

  // Spatial distance is reconstructed intrinsically via graph paths
  // Test nodes from the central cluster
  const distSame = engine.reconstructSpatialDistance(0, 0);
  assert.equal(distSame, 0);

  // If connected, distance is finite and strictly positive
  const dist1 = engine.reconstructSpatialDistance(0, 1);
  assert(Number.isFinite(dist1) && dist1 >= 0);

  // Causal poset: event depths increase monotonically along parent-child relations
  assert(engine.events.length > 0);
  for (const ev of engine.events) {
    if (ev.parents.length > 0) {
      for (const p of ev.parents) {
        assert(engine.events[p].depth < ev.depth, 'Parent depth must be strictly less than child depth');
      }
    }
  }

  // Internal relational time is well-defined between events without external clock
  if (engine.events.length >= 2) {
    const dt = engine.internalRelationalTime(0, engine.events.length - 1);
    assert(Number.isInteger(dt) && dt >= 0);
  }
});

test('CRITERION 3: Emergence of Gravitational Dynamics - Newton to MOND Crossover', () => {
  const engine = new SubQGUnifiedProofEngine({ G: 1.0, boxSize: 20.0 });
  const M = 20.0;

  // Inner zone: high acceleration (g_N >> a0) -> pure Newtonian 1/r^2 (alpha ~ 2.0)
  const inner = engine.effectiveGravitationalAcceleration(M, 0.4);
  assert(inner.gN > 100.0);
  assert(Math.abs(inner.localExponent - 2.0) < 0.01, `Inner alpha must be ~ 2.0, got ${inner.localExponent}`);

  // Outer zone: ultra-low acceleration (g_N << a0) -> pure MOND 1/r (alpha ~ 1.0)
  const outer = engine.effectiveGravitationalAcceleration(M, 200.0);
  assert(outer.gN < 0.001);
  assert(Math.abs(outer.localExponent - 1.0) < 0.05, `Outer alpha must be ~ 1.0, got ${outer.localExponent}`);

  // Monotonic transition of local exponent from 2 to 1
  const mid = engine.effectiveGravitationalAcceleration(M, 15.0);
  assert(mid.localExponent < inner.localExponent && mid.localExponent > outer.localExponent);
});

test('CRITERION 4: Mathematical & Numerical Validation - Flat Rotation Curves & Tully-Fisher', () => {
  const engine = new SubQGUnifiedProofEngine({ G: 1.0, boxSize: 20.0 });
  const M = 25.0;

  // 1. Rotation curve calculation
  const curveResult = engine.computeGalacticCurve(M, { rMin: 1.0, rMax: 80.0, steps: 35 });
  assert.equal(curveResult.curve.length, 35);
  // Velocity in outer region must be flat (less than 5% variation)
  assert(curveResult.isFlat, `Rotation curve must be flat in outer region, variation: ${curveResult.flatnessVariation}`);

  // 2. Tully-Fisher relation scaling: v_flat ~ M^(0.25)
  const tfResult = engine.validateTullyFisherScaling([5.0, 20.0, 80.0, 320.0]);
  assert(tfResult.matchesTheoretical025, `Tully-Fisher exponent must be 0.25, got ${tfResult.meanExponent}`);
  assert(Math.abs(tfResult.meanExponent - 0.25) < 0.005);
});
