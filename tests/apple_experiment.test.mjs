/**
 * Unit-Tests für das SubQG Apfel-Experiment
 * Prüft alle 6 Blueprint-Gates, Modus 1 & Modus 2, den Handkraftversuch (F_max)
 * sowie alle 10 Kontrollläufe (C1 bis C10) gemäß SubQG_Apfel_Experiment_Blueprint.md.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SubQGAppleWorld,
  SubQGAppleExperiment,
  executeAppleExperimentSuite,
  DEFAULT_APPLE_OBJECTS
} from '../src/modules/subqg_apple_experiment.mjs';

test('SubQG Apfel-Experiment: Komplette Suite besteht alle 6 Gates und 10 Kontrollen', () => {
  const suite = executeAppleExperimentSuite();

  // 1. Übergeordnetes Gate-Urteil
  assert.equal(suite.allGatesPassed, true, 'Alle 6 Blueprint-Gates müssen bestanden werden');
  assert.equal(suite.gates.gate1_measurementContract, true);
  assert.equal(suite.gates.gate2_inertialCalibration, true);
  assert.equal(suite.gates.gate3_variationalSourceMetric, true);
  assert.equal(suite.gates.gate4_freeFallAndHoldingEquivalence, true);
  assert.equal(suite.gates.gate5_handForceSaturation, true);
  assert.equal(suite.gates.gate6_controlSuite, true);

  // 2. Gate 2: Unabhängige Trägheitskalibrierung im flachen Graphen (Abschnitt 5.2 & 8.1)
  assert.equal(suite.calibration.objects.length, 4, 'Vier Resonanzobjekte geprüft');
  assert.ok(
    suite.calibration.massSpanRatio >= 8.5,
    `Massenspanne >= 3x gefordert, erreicht: ${suite.calibration.massSpanRatio.toFixed(2)}x`
  );
  assert.ok(
    suite.calibration.maxLinearityError <= 0.05,
    `Impuls-Linearitätsfehler <= 5% gefordert, erreicht: ${(suite.calibration.maxLinearityError * 100).toFixed(3)}%`
  );
  for (const obj of suite.calibration.objects) {
    assert.ok(obj.workEnergyDiscrepancy < 1e-6, `Energie-Arbeits-Bilanz für ${obj.id} exakt`);
    assert.ok(obj.normDriftRel < 1e-9, `Unitäre Normerhaltung für ${obj.id}`);
  }

  // 3. Gate 3 & 4 (Modus 1: Stationärer berechneter SubQG-Metrikhintergrund)
  const st = suite.stationaryMode;
  assert.ok(
    st.maxEta <= 0.05,
    `Universalität des freien Falls (eta <= 5%), erreicht: ${(st.maxEta * 100).toFixed(4)}%`
  );
  assert.ok(
    st.weightRegression.rSquared >= 0.999,
    `Lineare Regression F_Halten ~ m_inert R^2 >= 0.999, erreicht: ${st.weightRegression.rSquared.toFixed(6)}`
  );
  assert.ok(
    st.weightRegression.maxRelResidual <= 0.05,
    `Relative Residuen der Gewichtskraft <= 5%, erreicht: ${(st.weightRegression.maxRelResidual * 100).toFixed(3)}%`
  );
  assert.ok(
    st.maxEquivalenceError <= 0.05,
    `Konsistenz F_Halten / m_inert ≈ |a_frei| innerhalb 5%, erreicht: ${(st.maxEquivalenceError * 100).toFixed(3)}%`
  );

  // 4. Modus 2: Gekoppelter Lauf (Quelle, Paket und Metrik ko-evolvieren)
  const cp = suite.coupledMode;
  assert.ok(
    cp.maxEta <= 0.05,
    `Gekoppelter Lauf freier Fall Universalität <= 5%, erreicht: ${(cp.maxEta * 100).toFixed(3)}%`
  );
  assert.ok(
    cp.maxEquivalenceError <= 0.05,
    `Gekoppelter Lauf Äquivalenzkonsistenz <= 5%, erreicht: ${(cp.maxEquivalenceError * 100).toFixed(3)}%`
  );

  // 5. Gate 5: Handkraftversuch ("Apfel auf der Hand", feste Maximalkraft F_max)
  const hf = suite.handForceExperiment;
  assert.equal(hf.passedGate, true);
  assert.equal(hf.objects[0].isHeld, true, 'Apfel wird von F_max gehalten');
  assert.equal(hf.objects[1].isHeld, true, 'Stein wird von F_max gehalten');
  assert.equal(hf.objects[2].isHeld, false, 'Felsblock überschreitet F_max und sinkt ab');
  assert.equal(hf.objects[3].isHeld, false, 'Metalltonne überschreitet F_max und sinkt stärker ab');
  assert.ok(
    hf.objects[3].finalDisplacement < hf.objects[2].finalDisplacement,
    'Metalltonne sinkt tiefer ab als Felsblock'
  );

  // 6. Gate 6: Alle 10 Kontrollläufe (C1 bis C10)
  assert.equal(suite.controlSuite.allControlsPassed, true);
  assert.equal(suite.controlSuite.controls.length, 10);
  for (const ctrl of suite.controlSuite.controls) {
    assert.equal(ctrl.passed, true, `Kontrolllauf ${ctrl.id} (${ctrl.name}) muss bestehen`);
  }
});

test('SubQGAppleWorld: Variationeller Metrik-Solver erfüllt Stationarität ∂S/∂x_e = 0', () => {
  const world = new SubQGAppleWorld({ N: 80, seed: 42 });
  const src = world.computeSourceState();
  const rhoSrc = world.computeEdgeDensity(src.psiRe, src.psiIm);
  const sol = world.solveVariationalMetric({ rhoSourceEdge: rhoSrc });

  assert.ok(sol.maxResidual < 1e-10, `Maximaler Gradientenrest < 1e-10, erhalten: ${sol.maxResidual}`);
  assert.ok(sol.xEdge[8] < -0.1, 'Negative log-Metrik x_e < 0 (Kantenkontraktion) am Quellzentrum');
  assert.ok(sol.edgeLength[8] < 0.9, 'Effektive Kantenlänge L_e = exp(x_e) < 1 am Quellzentrum');
  assert.equal(DEFAULT_APPLE_OBJECTS.length, 4);
});
