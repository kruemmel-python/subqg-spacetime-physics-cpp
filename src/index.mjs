/**
 * Subquantum Graphity (SubQG 1.0)
 * =====================================================================
 * A first-principles framework for emergent quantum gravity, relational
 * spacetime, and dark-matter-free cosmological dynamics.
 *
 * Core Concept:
 * - Fundamental Pre-Geometric State: Subquantum oscillators & phase fields
 * - Spacetime Emergence: Relational percolation above critical threshold (Λ_c)
 * - Relational Time: Page-Wootters constraint & causal poset order
 * - Gravitational Dynamics: Non-linear graph conductivity yielding Newton-to-MOND crossover
 *
 * @version 1.0.0
 * @license MIT
 */

// Core Foundation Worlds
export { ActionWorld } from './modules/subqg_action.mjs';
export { CausalWorld } from './modules/subqg_causal.mjs';
export { GeodesicWorld } from './modules/subqg_geodesic.mjs';
export { FeedbackWorld } from './modules/subqg_feedback.mjs';
export { GravityWorld } from './modules/subqg_gravity.mjs';
export { WaveWorld } from './modules/subqg_waves.mjs';
export { CausalWaveWorld, compareRefinement } from './modules/subqg_causal_waves.mjs';
export { EmergenceWorld } from './modules/subqg_emergence.mjs';

// Relational Geometry, Clocks & Causal Order
export { estimateDimension, adjacency, graphDistances } from './modules/subqg_dimension.mjs';
export { makeClock, advanceClock, compareClocks } from './modules/subqg_clock_consistency.mjs';
export { clockSector, probe } from './modules/subqg_emergent_clock.mjs';
export { buildBonds, overlap, force, energy, integrate, analyticTwoNode } from './modules/subqg_fpv.mjs';
export { initialConstraint, gaugeStep } from './modules/subqg_relational_clock.mjs';
export { clockAngle, unwrapAngle } from './modules/subqg_internal_clock.mjs';

// Advanced Physics Engines (SubQG 1.0)
export { SubQGUnifiedProofEngine } from './modules/subqg_unified_proof_engine.mjs';
export { subqgDualStrainAcceleration } from './modules/subqg_dual_strain_gravity.mjs';
export {
  weakFieldMetricComponents,
  lensingStrengthRelativeToGammaOne,
  einsteinRadiusRelativeToGammaOne,
  linearizedSpinTwoStaticDustClosure,
  microToSpinTwoBridgeAudit,
  singleMetricNoSlipClosure
} from './modules/subqg_weak_field_metric.mjs';
export { SubQGGenesisEngine, executeMasterGenesisExperiment } from './modules/subqg_genesis.mjs';
export { SubQGMultiversePhaseEngine } from './modules/subqg_multiverse_phases.mjs';
export { SubQGGraphCoupledEngine } from './modules/subqg_graph_coupled_gravity.mjs';
export { SubQGEmergentGravity } from './modules/subqg_emergent_gravity_darkmatter.mjs';
export { SubQGFirstPrinciplesEngine } from './modules/subqg_first_principles_gravity.mjs';
export {
  minkowskiNormSquared,
  linearizedEinsteinTensorFourier,
  pureGaugePerturbation,
  transverseTracelessPlaneWave,
  spinTwoInfraredAudit
} from './modules/subqg_spin2_ir.mjs';
export {
  dualStrainAnomalousAcceleration,
  dualStrainHighAccelerationLimit,
  secularPerihelionPrecession,
  constantRadialAccelerationPrecession
} from './modules/subqg_solar_system.mjs';
export {
  eotvosParameter,
  universalFreeFallPrediction,
  combinedIndependentUncertainty,
  standardizedResidual
} from './modules/subqg_local_gravity.mjs';
export {
  SubQGAppleWorld,
  SubQGAppleExperiment,
  executeAppleExperimentSuite,
  DEFAULT_APPLE_OBJECTS
} from './modules/subqg_apple_experiment.mjs';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

// CLI Entrypoint
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirectRun) {
  console.log(`
========================================================================
       SUBQUANTUM GRAPHITY (SubQG 1.0) - DEVELOPER CORE RUNNER          
========================================================================
First-Principles Relational Quantum Gravity & Spacetime Emergence Engine
Version: 1.0.0 | Environment: Node.js ${process.version}
`);

  const args = process.argv.slice(2);
  const isAudit = args.includes('--audit');
  const isApple = args.includes('--apple');
  const isDemo = args.includes('--demo') || (!isAudit && !isApple);

  if (isApple) {
    console.log('[*] Executing SubQG Apple Experiment (Inertia, Weight & Universal Free Fall)...');
    import('./modules/subqg_apple_experiment.mjs').then(({ executeAppleExperimentSuite }) => {
      const res = executeAppleExperimentSuite();
      console.log(`[+] All 6 Blueprint Gates Passed: ${res.allGatesPassed}`);
      console.log(`[+] Inertial Mass Span: ${res.calibration.massSpanRatio.toFixed(2)}x (Linearity Error: ${(res.calibration.maxLinearityError * 100).toFixed(3)}%)`);
      console.log(`[+] Free-Fall Universality Spread (eta): ${(res.stationaryMode.maxEta * 100).toFixed(4)}%`);
      console.log(`[+] Weight vs Mass Regression R^2: ${res.stationaryMode.weightRegression.rSquared.toFixed(6)}`);
      console.log(`[+] Equivalence Consistency |F_hold/m - a_free|/|a_free|: ${(res.stationaryMode.maxEquivalenceError * 100).toFixed(3)}%`);
      console.log(`[+] All 10 Control Runs (C1-C10) Passed: ${res.controlSuite.allControlsPassed}`);
      console.log('========================================================================\n');
    });
  } else if (isAudit) {
    console.log('[*] Running SubQG 1.0 Unified Proof Engine Verification...');
    import('./modules/subqg_unified_proof_engine.mjs').then(({ SubQGUnifiedProofEngine }) => {
      const engine = new SubQGUnifiedProofEngine({ G: 1.0, boxSize: 20.0 });
      const stats = engine.initializeMicrostructure({ centralMass: 20.0 });
      const inner = engine.effectiveGravitationalAcceleration(20.0, 0.4);
      const outer = engine.effectiveGravitationalAcceleration(20.0, 200.0);
      const curve = engine.computeGalacticCurve(25.0, { rMin: 1.0, rMax: 80.0, steps: 35 });
      const tf = engine.validateTullyFisherScaling([5.0, 20.0, 80.0, 320.0]);

      console.log(`[+] Pre-geometric Microstructure: ${stats.nodes} nodes, ${stats.edges} edges, ${stats.faces} faces, ${stats.events} causal events`);
      console.log(`[+] Crossover Validation:`);
      console.log(`    - Near-field (Newtonian): exponent alpha = ${inner.localExponent.toFixed(4)} (expected 2.0)`);
      console.log(`    - Far-field (MONDian):   exponent alpha = ${outer.localExponent.toFixed(4)} (expected 1.0)`);
      console.log(`    - Rotation curve flat:    ${curve.isFlat} (variation: ${(curve.flatnessVariation * 100).toFixed(2)}%)`);
      console.log(`    - Tully-Fisher exponent:  ${tf.meanExponent.toFixed(4)} (theoretical: 0.2500)`);
      console.log(`    - a0 Cosmological scale:  ${engine.a0} [c^2 / L_horizon]`);
      console.log('========================================================================\n');
    });
  } else if (isDemo) {
    console.log('[*] Executing SubQG Genesis Master Simulation...');
    import('./modules/subqg_genesis.mjs').then(({ executeMasterGenesisExperiment }) => {
      const res = executeMasterGenesisExperiment();
      const u1 = res.universe1_Continuum;
      const u2 = res.universe2_Fractal;
      console.log('\n========================================================================');
      console.log(`[+] Genesis Master Experiment Complete:`);
      console.log(`    - Universe 1 (Ordered 3D): d = ${u1.emergentDimensionD.toFixed(2)}, c = ${u1.emergentSpeedLimitC.toFixed(3)}, particle stable: ${u1.solitonParticleStable}, gravity attraction: ${u1.inwardAttractionProven}`);
      console.log(`    - Universe 2 (Fractal):    d = ${u2.emergentDimensionD.toFixed(2)}, c = ${u2.emergentSpeedLimitC.toFixed(3)}, particle stable: ${u2.solitonParticleStable}, gravity attraction: ${u2.inwardAttractionProven}`);
      console.log(`    - Laws Differ Emergent:    d_diff = ${res.comparativeLawsOfNature.differentEmergentDimensions}, c_diff = ${res.comparativeLawsOfNature.differentEmergentSpeedLimits}`);
      console.log('========================================================================\n');
      console.log('Tip: Run `npm test` to verify all 270 unit tests.');
      console.log('Tip: Open `viewer/index.html` in your browser for the 3D cinematic documentary.');
    });
  }
}
