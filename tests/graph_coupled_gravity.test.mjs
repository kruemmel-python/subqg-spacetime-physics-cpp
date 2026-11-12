import test from 'node:test';
import assert from 'node:assert/strict';
import { SubQGGraphCoupledEngine } from '../src/modules/subqg_graph_coupled_gravity.mjs';

test('CRITERION 1: Ontological Phase Transition (SubQG Possibility State -> Micro-Universe + Spacetime) & Valence Selection (k* = 4 => d = 3)', () => {
  const engine = new SubQGGraphCoupledEngine({
    oscillatorCount: 48,
    threshold: 0.75
  });

  // 1. Verify the Ontological Phase Transition:
  //    SubQG (No Space, No Time) --[Overlap / Resonance >= Theta_crit]--> Micro-Universe + Spacetime
  const trans = engine.analyzeSubQGToMicroUniverseTransition();
  const subcritical = trans.transitionSweep.filter(s => s.lambdaRatio <= 1.0);
  const supercritical = trans.transitionSweep.filter(s => s.lambdaRatio >= 1.2);

  assert(subcritical.length >= 4);
  assert(supercritical.length >= 2);

  // In the pure SubQG Possibility State (Lambda <= Lambda_c), NEITHER space NOR time exists:
  for (const pt of subcritical) {
    assert.equal(pt.ontologicalStage, 'SUBQG_POSSIBILITY_STATE');
    assert(pt.curvatureAtOrigin >= -1e-14, 'Spaceless origin Delta=0 must be stable for Lambda <= Lambda_c');
    assert.equal(pt.orderParameterDelta, 0.0, 'Order parameter Delta* must be 0 in pure SubQG state');
    assert.equal(pt.actualizedNodes, 0, 'No Micro-Universe nodes may exist below threshold');
    assert.equal(pt.actualizedBonds, 0, 'No spatial bonds may exist in pure SubQG state');
    assert.equal(pt.actualizedTriangles, 0, 'No 2-simplices may exist in pure SubQG state');
    assert.equal(pt.hasSpatialGeometry, false, 'Space must NOT exist in pure SubQG state');
    assert.equal(pt.metricAxiomsSatisfied, false, 'No spatial metric may exist in pure SubQG state');
    assert.equal(pt.meanFiniteDistance, Infinity, 'Spatial distance must be undefined (Infinity) in SubQG');
    assert.equal(pt.hasPhysicalTime, false, 'Physical time must NOT exist in pure SubQG state');
    assert.equal(pt.clockFrequency, 0.0, 'Clock frequency must vanish in pure SubQG state');
    assert.equal(pt.causalEventsCount, 0, 'No causal events may exist in pure SubQG state');
  }

  // Above the resonance threshold (Lambda > Lambda_c), a Micro-Universe + Spacetime nucleates:
  for (const pt of supercritical) {
    assert.equal(pt.ontologicalStage, 'MICROUNIVERSE_SPACETIME_NUCLEATED');
    assert(pt.curvatureAtOrigin < 0.0, 'Spaceless origin Delta=0 must become unstable for Lambda > Lambda_c');
    assert(pt.orderParameterDelta > 0.0, 'Spacetime condensate Delta* > 0 must spontaneously form');
    assert(pt.nucleationPotentialMin < 0.0, 'Nucleated Micro-Universe must lower variational action V_trans');
    assert(pt.stationarityResidual < 1e-14, 'Order parameter Delta* must satisfy exact stationarity dV/dDelta = 0');
    assert(pt.actualizedNodes >= 4, 'Micro-Universe must actualize resonant nodes');
    assert(pt.actualizedBonds >= 6, 'Spatial bonds (1-simplices) must form at the transition');
    assert(pt.actualizedTriangles >= 4, 'Spatial faces (2-simplices) must form at the transition');
    assert(pt.actualizedTetrahedra >= 1, 'Tetrahedral 3-simplices must nucleate in the Micro-Universe');
    assert.equal(pt.hasSpatialGeometry, true, 'Spatial geometry must emerge in the Micro-Universe');
    assert.equal(pt.metricAxiomsSatisfied, true, 'Emergent graph distance must satisfy all metric space axioms');
    assert(Number.isFinite(pt.meanFiniteDistance) && pt.meanFiniteDistance >= 1.0);
    assert.equal(pt.hasPhysicalTime, true, 'Physical time must emerge in the Micro-Universe');
    assert(pt.clockFrequency > 0.0, 'Page-Wootters clock frequency must become positive');
    assert(pt.causalEventsCount > 0 && pt.maxCausalDepth >= 1, 'Causal event order must emerge');
  }

  // 2. Verify Simplicial Valence Selection from S_simplex(k) (k* = 4 => d = 3):
  const val = engine.valenceDerivation;
  assert.equal(val.optimalK, 4);
  assert.equal(val.minValenceAction, 0);
  assert.equal(val.u1GaugeZeroModes, 1);
  assert.equal(val.emergentIntrinsicDimension, 3);

  // 3. Verify timeless stationary phase substrate dS_phase / dtheta_i = 0:
  assert(engine.stationaryMaxGradient < 1e-12);

  // 4. Verify First-Principles U(1) Cosine-Curvature Stiffness Proof:
  //    Why k_unlocked = 0 (unactualized SubQG state) and k_locked = 1 (actualized bond)
  //    follow directly from d^2/d(dPhi)^2 [-(1 + cos(theta - dPhi))] over [-pi, pi):
  const stiff = engine.cosineStiffnessDerivation;
  assert(
    stiff.unlockedZeroError < 1e-15,
    `Unactualized U(1) phase integral must yield k_unlocked = 0 to <1e-15, got ${stiff.kUnlockedDerived}`
  );
  assert(
    stiff.lockedUnitError < 1e-9,
    `Phase-locked cosine curvature must yield k_locked = 1 to <1e-9, got ${stiff.kLockedDerived}`
  );
  for (let i = 1; i < stiff.kappaSymmetryBreakingCurve.length; i++) {
    assert(
      stiff.kappaSymmetryBreakingCurve[i].derivedHarmonicStiffness >
      stiff.kappaSymmetryBreakingCurve[i - 1].derivedHarmonicStiffness,
      'Harmonic stiffness must emerge monotonically with U(1) symmetry breaking kappa'
    );
  }
});

test('CRITERION 2: Action Hessian Clock Derivation (d^2S/dtheta^2 -> H_C, V_int) & Pure FPV-1 Scalar Phase Graph (d_eff ~ 3.0)', () => {
  const engine = new SubQGGraphCoupledEngine({ stateCount: 6500, threshold: 0.75 });
  const stats = engine.generatePreGeometricUniverse({ centralMass: 200.0 });

  const bonded = stats.timelessClockAudit.bondedSector;
  const unbonded = stats.timelessClockAudit.unbondedSector;

  assert(Math.abs(bonded.hessianDerivation.lambdaGaugeZeroMode) < 1e-14, 'Hessian must possess U(1) gauge zero-mode lambda_0 = 0');
  assert(bonded.hessianDerivation.hessianFrequencyError < 1e-9, 'Clock frequency omega_C must match sqrt(lambda_rel) of action Hessian');
  assert(bonded.hessianDerivation.hessianCouplingError < 1e-9, 'Inter-clock coupling V_int must match off-diagonal action Hessian -d^2S/dtheta_B dtheta_C');

  assert(bonded.wheelerDeWittResidual < 1e-14);
  assert(unbonded.wheelerDeWittResidual < 1e-14);
  assert.equal(unbonded.timeEmergent, false);
  assert.equal(bonded.timeEmergent, true);

  const omegaS = 2.0 * bonded.clockFrequency;
  for (const pt of bonded.trajectory) {
    assert(Math.abs(pt.sigmaX - Math.cos(omegaS * pt.clockReadingTau)) < 1e-14);
    assert(Math.abs(pt.sigmaY - Math.sin(omegaS * pt.clockReadingTau)) < 1e-14);
  }

  for (let i = 0; i < engine.N; i++) {
    const phi = engine.phaseStates[i];
    assert.equal(phi.length, 4);
    assert(Math.abs(phi[0] + phi[1] + phi[2] + phi[3]) < 1e-14);
  }

  assert(Math.abs(stats.emergentDimension - 3.0) < 0.08);
});

test('CRITERION 3: Euler-Lagrange Equivalence (dS_grav/dPhi_u = 0) & Gravity Caused by the SubQG -> Spacetime Transition', () => {
  const engine = new SubQGGraphCoupledEngine({ stateCount: 6500, threshold: 0.75 });
  engine.generatePreGeometricUniverse({ centralMass: 200.0 });

  const conv = engine.solveGraphPotentials({ centralMass: 200.0, tolerance: 1e-8 });

  assert(conv.linearSolver.converged && conv.linearSolver.maxResidual < 1e-8);
  assert(conv.subqgSolver.converged && conv.subqgSolver.maxResidual < 1e-8);

  const el = conv.subqgSolver.eulerLagrangeAudit;
  assert(el.maxOperatorVsVariationalDiff < 1e-8);
  assert(el.maxStationaryActionGradient < 1e-7);
  assert.equal(el.actionStrictlyMinimized, true);

  // Verify the exact variational derivation connecting the Nucleation Order Parameter Delta*(g)
  // and the Gravitational Conductivity C_SubQG(g) from the SAME SubQG action functional:
  //   1. Microscopic mode stationarity: dF_micro / d(delta_m) = 0  (< 1e-14)
  //   2. Envelope / Legendre identity: Delta_raw*(g) == -dF_micro*(1, g)/dg  (< 1e-9)
  //   3. Macroscopic bond potential stationarity: dV_bond(Delta; g)/dDelta = 0 => Delta*(g) === C_SubQG(g) (< 1e-11)
  const deltaCIdentity = engine.deriveOrderParameterConductivityIdentity();
  assert.equal(
    deltaCIdentity.identityProven,
    true,
    'Exact variational identity Delta*(g) === C_SubQG(g) must hold across all gradients'
  );
  assert(deltaCIdentity.maxMicroModeGrad < 1e-14, `Expected |dF/d(delta_m)| < 1e-14, got ${deltaCIdentity.maxMicroModeGrad}`);
  assert(
    deltaCIdentity.maxEnvelopeVsConductivityDiff < 1e-9,
    `Expected |-dF*/dg_norm - C(g)| < 1e-9, got ${deltaCIdentity.maxEnvelopeVsConductivityDiff}`
  );
  assert(
    deltaCIdentity.maxMacroPotentialVsConductivityDiff < 1e-11,
    `Expected |Delta_macro*(g) - C(g)| < 1e-11, got ${deltaCIdentity.maxMacroPotentialVsConductivityDiff}`
  );
  assert(
    deltaCIdentity.maxMacroStationarityResidual < 1e-11,
    `Expected |dV_bond/dDelta(Delta*)| < 1e-11, got ${deltaCIdentity.maxMacroStationarityResidual}`
  );

  // Verify that the "Dark Matter" gravitational anomaly is caused specifically by the
  // ongoing SubQG -> Micro-Universe + Spacetime transition in the outer halo:
  const dmAudit = engine.verifyTransitionInducedGravityVsDarkMatter({ rMin: 2, rMax: 8 });
  assert.equal(
    dmAudit.darkMatterExplainedBySpacetimeTransition,
    true,
    'Additional gravity must arise from the SubQG -> Spacetime transition without Dark Matter'
  );
  assert(dmAudit.coreSpacetimeFraction > 0.95, 'Inner core must be fully transitioned spacetime');
  assert(dmAudit.outerHaloUncondensedSubQGFraction > 0.65, 'Outer halo must lie in the active SubQG <-> Spacetime transition zone');
  assert(dmAudit.outerHaloApparentDarkMatterRatio > 3.0, 'Transition boundary must generate >300% apparent Dark Matter boost at r=8');
  assert(dmAudit.staticSpacetimeVelocityDropFraction > 0.50, 'Without the SubQG -> Spacetime transition, orbital velocity must drop Keplerian-style');
});

test('CRITERION 4: Asymptotically Flat Rotation Curve (~1% Variation) & Emergent Tully-Fisher Exponent (~0.25)', () => {
  const engine = new SubQGGraphCoupledEngine({ stateCount: 6500, threshold: 0.75 });
  engine.generatePreGeometricUniverse({ centralMass: 200.0 });
  engine.solveGraphPotentials({ centralMass: 200.0, tolerance: 1e-8 });

  const profile = engine.measureRadialGraphProfiles({ rMin: 2, rMax: 8 });
  const outerShells = profile.filter(p => p.r >= 5 && p.r <= 8);
  const vValues = outerShells.map(p => p.vSubQG);
  const vMin = Math.min(...vValues);
  const vMax = Math.max(...vValues);
  const relVariation = (vMax - vMin) / vMin;

  assert(relVariation < 0.015, `Expected flat outer rotation curve (<1.5% variation), got ${relVariation}`);

  const tf = engine.measureTullyFisherFromGraphSolver([80.0, 120.0, 180.0, 270.0], [6, 7, 8]);
  for (const run of tf.massRuns) {
    assert(run.maxResidual < 1e-8);
  }
  assert(
    Math.abs(tf.meanExponent - 0.25) < 0.006,
    `Emergent Tully-Fisher exponent from graph solver must be ~0.25, got ${tf.meanExponent}`
  );

  // Verify Preliminary Phenomenological Benchmark (6 SPARC Reference Galaxies solved via
  // 64-step bisection on the microscopic SubQG variational functional without MOND formulas):
  const sparc = engine.validateCosmologicalScaleAndSPARCGalaxies();
  assert.equal(sparc.freeDarkMatterParametersUsed, 0);
  assert.equal(sparc.methodologicalClassification.usesExplicitMONDInterpolationFormula, false);
  assert.equal(sparc.methodologicalClassification.sparcComparisonStatus, 'PRELIMINARY_PHENOMENOLOGICAL_BENCHMARK_6_GALAXIES');
  assert(sparc.maxFluxBisectionResidual < 1e-12, `Expected flux bisection residual < 1e-12, got ${sparc.maxFluxBisectionResidual}`);
  assert(Math.abs(sparc.horizonPhaseFraction - 1.0 / 6.0) < 1e-15);
  assert(sparc.a0RelativeAgreementPercent > 94.0, `Expected >94% agreement for cosmological ansatz a_0, got ${sparc.a0RelativeAgreementPercent}%`);
  assert(sparc.meanNewtonRelativeErrorPercent > 55.0, 'Baryonic Newton without Dark Matter must fail by >55% on SPARC benchmark galaxies');
  assert(sparc.meanSubQGRelativeErrorPercent < 4.5, `SubQG variational flux bisection must match 6 SPARC benchmark galaxies within <4.5%, got ${sparc.meanSubQGRelativeErrorPercent}%`);
});
