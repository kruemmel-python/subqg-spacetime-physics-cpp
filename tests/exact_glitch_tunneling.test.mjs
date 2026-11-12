/**
 * Unit-Tests für den exakten SubQG Glitch- und Tunneling-Mechanismus
 *
 * Verifiziert:
 * 1. Verschwindende Ausgangskopplung: w_AB(t) = sin^2(epsilon(t)) = 0 für epsilon = 0.
 * 2. Glitch-Puls mit strikt kompaktem Träger: w_AB(t) = 0 für |t - t_mid| >= tau.
 * 3. Selbstadjungierter 2x2 Block-Hamiltonian:
 *    - Strikte Erhaltung der Gesamtnorm N_total = N_A + N_B = const (Drift < 1e-6).
 *    - Realer Normtransfer von Sektor B nach Sektor A während des Glitches.
 * 4. Automatische Schließung der Brücke nach Ablauf des Zeitfensters.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { SubQGExactGlitchEngine } from '../src/modules/subqg_exact_glitch_tunneling.mjs';

test('SubQG Exact Glitch: Verschwindende Ausgangskopplung und kompakter Träger', () => {
  const engine = new SubQGExactGlitchEngine({ glitchTimeMid: 2.0, glitchHalfWidth: 0.5 });

  // 1. Weit vor dem Glitch: Exakt 0
  const cBefore = engine.computeGlitchCoupling(1.0);
  assert.equal(cBefore.isGlitchActive, false);
  assert.equal(cBefore.wAB, 0.0);
  assert.equal(cBefore.epsilon, 0.0);
  assert.equal(cBefore.gTunnel, 0.0);

  // 2. Unmittelbar am Trägerrand (t = t_mid - tau = 1.5): Exakt 0
  const cEdge = engine.computeGlitchCoupling(1.5);
  assert.equal(cEdge.isGlitchActive, false);
  assert.equal(cEdge.wAB, 0.0);

  // 3. Im Glitch-Peak (t = 2.0): Quadratischer Überlapp w_AB = sin^2(epsilon)
  const cPeak = engine.computeGlitchCoupling(2.0);
  assert.equal(cPeak.isGlitchActive, true);
  assert.ok(cPeak.wAB > 0.15, `w_AB im Peak: ${cPeak.wAB}`);
  const expectedWAB = Math.pow(Math.sin(engine.epsilonMax), 2);
  assert.ok(Math.abs(cPeak.wAB - expectedWAB) < 1e-9, 'w_AB entspricht exakt sin^2(epsilon_max)');

  // 4. Nach dem Glitch (t = 2.6 > 2.5): Brücke vollständig geschlossen
  const cAfter = engine.computeGlitchCoupling(2.6);
  assert.equal(cAfter.isGlitchActive, false);
  assert.equal(cAfter.wAB, 0.0);
  assert.equal(cAfter.gTunnel, 0.0);
});

test('SubQG Exact Glitch: Selbstadjungierter Block-Hamiltonian erhält Gesamtnorm', () => {
  const engine = new SubQGExactGlitchEngine({
    glitchTimeMid: 2.0,
    glitchHalfWidth: 0.5,
    epsilonMax: 0.45,
    jTunnel: 0.75
  });

  const res = engine.simulateGlitchCrossing({ steps: 250, dt: 0.02 });

  // 1. Gesamtnorm-Erhaltung über alle 250 RK4-Schritte
  assert.equal(res.isTotalNormConserved, true);
  assert.ok(res.totalNormDriftRel < 1e-6, `Relativer Normdrift < 1e-6: ${res.totalNormDriftRel}`);

  // 2. Realer Normtransfer von B nach A
  assert.equal(res.glitchProducedTunneling, true);
  assert.ok(res.finalNormInA > 0.01, `Übertragene Norm in A: ${res.finalNormInA}`);

  // 3. Schwerkraft-Kreuzimpuls auf Welt A während des Glitches
  assert.ok(res.peakCrossForce > 0.001, `Transiente Kreuzbeschleunigung: ${res.peakCrossForce}`);
});

test('SubQG Exact Glitch: Vollständige Arbeits- und Leistungsbilanz (Tunnel + Metrik)', () => {
  const engine = new SubQGExactGlitchEngine({
    glitchTimeMid: 2.0,
    glitchHalfWidth: 0.5,
    epsilonMax: 0.45,
    jTunnel: 0.75
  });

  const res = engine.simulateGlitchCrossing({ steps: 250, dt: 0.02 });

  // 1. Integrierte Glitch-Arbeit besteht aus Tunnel- und Metrikanteil
  assert.ok(res.integratedTunnelPower > 0, `Tunnelarbeit positiv: ${res.integratedTunnelPower}`);
  assert.ok(res.integratedMetricPower > 0, `Metrik-Verzerrungsarbeit positiv: ${res.integratedMetricPower}`);
  assert.ok(
    Math.abs(res.integratedGlitchPower - (res.integratedTunnelPower + res.integratedMetricPower)) < 1e-12,
    'Gesamtarbeit entspricht exakt der Summe aus Tunnel- und Metrikarbeit'
  );

  // 2. Vor dem Glitch (t < 1.5) und nach dem Glitch (t > 2.5) wird absolut keine Arbeit eingespeist
  const preGlitchSteps = res.history.filter((h) => h.t < 1.5);
  for (const h of preGlitchSteps) {
    assert.equal(Math.abs(h.glitchPower), 0.0, `Leistung vor Glitch bei t=${h.t} exakt 0`);
    assert.equal(Math.abs(h.integratedGlitchPower), 0.0, `Integrierte Arbeit vor Glitch bei t=${h.t} exakt 0`);
  }

  const postGlitchSteps = res.history.filter((h) => h.t > 2.5);
  const finalWork = res.integratedGlitchPower;
  for (const h of postGlitchSteps) {
    assert.equal(Math.abs(h.glitchPower), 0.0, `Leistung nach Glitch bei t=${h.t} exakt 0`);
    assert.ok(
      Math.abs(h.integratedGlitchPower - finalWork) < 1e-12,
      `Integrierte Arbeit nach Glitch bleibt exakt konstant bei ${finalWork}`
    );
  }

  // 3. Exakte Energie-Arbeits-Bilanz (Hartree-bereinigt und Actio=Reactio)
  assert.equal(res.isEnergyWorkBalanced, true, 'isEnergyWorkBalanced muss strikt true sein');
  assert.ok(res.energyWorkDiscrepancy < 0.005, `Energie-Arbeits-Diskrepanz < 0.005: ${res.energyWorkDiscrepancy}`);
});
