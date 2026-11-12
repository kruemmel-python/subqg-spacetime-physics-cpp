/**
 * Unit-Tests für das SubQG Glitch- und Tunneling-Modul
 * Prüft die exakte Einhaltung der Modellregeln vor, während und nach dem transienten Glitch.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { SubQGGlitchTunnelEngine } from '../src/modules/subqg_glitch_tunneling.mjs';

test('SubQG Glitch Engine: Exakte Entkopplung vor dem Glitch (t < t_start)', () => {
  const engine = new SubQGGlitchTunnelEngine({ glitchTimeMid: 2.0, glitchDuration: 0.3 });
  const preCoupling = engine.computeGlitchCoupling(0.5);

  assert.equal(preCoupling.isGlitchActive, false);
  assert.equal(preCoupling.wAB, 0.0);
  assert.equal(preCoupling.epsilon, 0.0);
});

test('SubQG Glitch Engine: Transientes Durchtunneln und Gravitationsschock im Glitch-Fenster', () => {
  const engine = new SubQGGlitchTunnelEngine({
    glitchTimeMid: 2.0,
    glitchDuration: 0.4,
    epsilonMax: 0.45
  });
  const res = engine.simulateGlitchCrossing({ steps: 200, dt: 0.02 });

  // 1. Vor dem Glitch: Null Energieübertritt
  assert.equal(res.preGlitchNorm, 0.0);

  // 2. Während des Glitches: Positives Tunneln und Kreuzkraft
  assert.ok(res.glitchProducedTunneling, 'Licht/Energie tunnelt in Welt A');
  assert.ok(res.glitchProducedGravityShock, 'Kreuzgravitation wird transient messbar');
  assert.ok(res.peakTransferredEnergy > 0.05, `Übertragene Norm > 0.05: ${res.peakTransferredEnergy}`);
  assert.ok(res.peakCrossForce > 0.001, `Gravitationskraftstoß > 0.001: ${res.peakCrossForce}`);

  // 3. Nach dem Glitch: Glitch schließt sich wieder
  const postCoupling = engine.computeGlitchCoupling(4.0);
  assert.equal(postCoupling.isGlitchActive, false);
  assert.equal(postCoupling.wAB, 0.0);
  assert.ok(res.finalRetainedNormInA > 0.0, 'Injizierte Welle breitet sich in Welt A aus');
});
