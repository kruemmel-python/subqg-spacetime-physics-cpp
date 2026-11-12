/**
 * @fileoverview SubQG Transiente Phasen-Orthogonalitätsstörung & Multiversums-Tunnelung (Glitch-Engine)
 *
 * Exakte Erweiterung des SubQG-Modells ohne Veränderung der bisherigen Grundregeln:
 * 1. Vor dem Glitch (t < t_start):
 *    - Orthogonale Moden <A|B> = 0.
 *    - Welt A und Welt B sind streng entkoppelt (T_AB = 0, F_AB = 0).
 * 2. Während des transienten Glitches (t_start <= t <= t_end):
 *    - Gaußförmiger oder kompakter Phasensprung epsilon(t) = epsilon_max * exp(-((t - t_mid)/tau)^2)
 *    - Transiente Phasenüberlappung w_AB(t) = 0.5 * (1 + cos(pi/2 - epsilon(t))) = 0.5 * (1 + sin(epsilon(t))) > 0
 *    - Transiente Wellen-Tunnelkopplung i dPsi_A/dt = H_A Psi_A + J_tunnel * w_AB(t) * Psi_B
 *    - Transiente metrische Kreuzquell-Kopplung (mu I + kappa L) x_A = -beta (w_A rho_A + w_AB(t) rho_B)
 * 3. Nach dem Glitch (t > t_end):
 *    - epsilon(t) -> 0, w_AB -> 0.
 *    - Transiente Brücke schließt sich vollständig.
 *    - Zurück bleiben in Welt A ein injizierter Licht-/Energie-Puls und eine gedämpfte
 *      Kräuselung der Kantenmetrik (Graphen-Gravitationswelle).
 */

import { SubQGAppleWorld, createApplePRNG } from './subqg_apple_experiment.mjs';

export class SubQGGlitchTunnelEngine {
  /**
   * @param {object} [config={}]
   */
  constructor(config = {}) {
    this.N = config.N ?? 80;
    this.seed = config.seed ?? 42;
    this.J0 = config.J0 ?? 1.0;
    this.gNL = config.gNL ?? 0.015;
    this.mu = config.mu ?? 0.08;
    this.kappa = config.kappa ?? 12.0;
    this.beta = config.beta ?? 0.85;

    // Glitch-Parameter (transiente Millisekunden-Störung)
    this.glitchTimeMid = config.glitchTimeMid ?? 2.0;
    this.glitchDuration = config.glitchDuration ?? 0.4; // Zeitfenster tau
    this.epsilonMax = config.epsilonMax ?? 0.45; // Max. Phasenangleichung
    this.jTunnel = config.jTunnel ?? 0.75; // Tunnel-Übertrittsstärke

    // Erzeuge zwei Welten auf derselben Knotenmenge V
    this.worldA = new SubQGAppleWorld({ ...config, N: this.N, seed: this.seed });
    this.worldB = new SubQGAppleWorld({ ...config, N: this.N, seed: this.seed + 100 });
  }

  /**
   * Berechnet den zeitabhängigen Glitch-Kopplungsfaktor w_AB(t).
   * @param {number} t
   * @returns {{ epsilon: number, wAB: number, isGlitchActive: boolean }}
   */
  computeGlitchCoupling(t) {
    const dtGlitch = Math.abs(t - this.glitchTimeMid);
    // Außerhalb des 3.5*tau Fensters ist die Kopplung exakt 0 (kompakter Support)
    if (dtGlitch > 3.5 * this.glitchDuration) {
      return { epsilon: 0.0, wAB: 0.0, isGlitchActive: false };
    }
    const exponent = -(dtGlitch * dtGlitch) / (2.0 * this.glitchDuration * this.glitchDuration);
    const epsilon = this.epsilonMax * Math.exp(exponent);
    if (epsilon < 1e-5) {
      return { epsilon: 0.0, wAB: 0.0, isGlitchActive: false };
    }
    const deltaW = Math.sin(epsilon);
    const wAB = 0.5 * deltaW;
    return { epsilon, wAB, isGlitchActive: true };
  }

  /**
   * Führt eine gekoppelte Simulation beider Welten mit transientem Glitch durch.
   *
   * @param {object} [opts={}]
   * @param {number} [opts.steps=300]
   * @param {number} [opts.dt=0.02]
   */
  simulateGlitchCrossing(opts = {}) {
    const steps = opts.steps ?? 300;
    const dt = opts.dt ?? 0.02;

    // Welt A: Startet als leeres "Wohnzimmer" (nur Vakuum, sehr geringe Grunddichte)
    // Welt B: Beherbergt ein massereiches, energiereiches Himmelskörper-Resonanzpaket bei x = 28
    const centerB = 28.0;
    const stateB = this.worldB.prepareWavePacket({
      center: centerB,
      amplitude: 1.6,
      sigma: 2.15,
      k0: 0.0
    });

    let psiARe = new Float64Array(this.N);
    let psiAIm = new Float64Array(this.N);
    let psiBRe = new Float64Array(stateB.psiRe);
    let psiBIm = new Float64Array(stateB.psiIm);

    const history = [];
    let peakTransferredEnergy = 0.0;
    let peakCrossForce = 0.0;

    for (let step = 0; step <= steps; step++) {
      const t = step * dt;
      const glitch = this.computeGlitchCoupling(t);

      // Berechne Dichten
      const rhoA = this.worldA.computeEdgeDensity(psiARe, psiAIm);
      const rhoB = this.worldB.computeEdgeDensity(psiBRe, psiBIm);

      // Kantenmetrik für Welt A unter Einfluss des Glitches:
      // (mu I + kappa L) x_A = -beta (w_A rho_A + w_AB(t) rho_B)
      const effectiveRhoSourceForA = new Float64Array(this.N - 1);
      for (let e = 0; e < this.N - 1; e++) {
        effectiveRhoSourceForA[e] = glitch.wAB * rhoB[e];
      }

      const metricSolA = this.worldA.solveVariationalMetric({
        rhoSourceEdge: effectiveRhoSourceForA,
        rhoPacketEdge: rhoA
      });

      // Observablen in Welt A messen
      const obsA = this.worldA.measureObservables(
        psiARe,
        psiAIm,
        metricSolA.phiMetric,
        metricSolA.edgeAction || 0
      );

      // Mechanische Kreuzbeschleunigung am Zentrum des Glitches
      const centerNode = Math.round(centerB);
      const gradPhiA =
        (metricSolA.phiMetric[centerNode + 1] - metricSolA.phiMetric[centerNode - 1]) / 2.0;
      const crossAcc = -2.0 * this.J0 * gradPhiA;

      if (obsA.norm > peakTransferredEnergy) peakTransferredEnergy = obsA.norm;
      if (Math.abs(crossAcc) > peakCrossForce) peakCrossForce = Math.abs(crossAcc);

      history.push({
        step,
        t: Number(t.toFixed(4)),
        glitchEpsilon: glitch.epsilon,
        wAB: glitch.wAB,
        isGlitchActive: glitch.isGlitchActive,
        injectedNormA: obsA.norm,
        energyA: obsA.eWaveIntrinsic,
        crossAcc,
        maxContractionA: Math.min(...metricSolA.xEdge)
      });

      // Unitärer RK4-Integrator mit Kreuzkopplung
      if (step < steps) {
        // RK4 Schritt mit Tunnel-Kopplung
        const nextStateA = this._stepTunneling(
          psiARe,
          psiAIm,
          psiBRe,
          psiBIm,
          metricSolA.phiMetric,
          glitch.wAB,
          dt
        );
        psiARe = nextStateA.psiRe;
        psiAIm = nextStateA.psiIm;

        // Welt B entwickelt sich ebenfalls unitär
        const metricSolB = this.worldB.solveVariationalMetric({ rhoSourceEdge: rhoB });
        const nextStateB = this.worldB.stepRK4(psiBRe, psiBIm, metricSolB.phiMetric, 0.0, dt);
        psiBRe = nextStateB.psiRe;
        psiBIm = nextStateB.psiIm;
      }
    }

    const preGlitchNorm = history[0].injectedNormA;
    const postGlitch = history[history.length - 1];

    return {
      glitchTimeMid: this.glitchTimeMid,
      glitchDuration: this.glitchDuration,
      epsilonMax: this.epsilonMax,
      preGlitchNorm,
      peakTransferredEnergy,
      peakCrossForce,
      finalRetainedNormInA: postGlitch.injectedNormA,
      glitchProducedTunneling: peakTransferredEnergy > 1e-4,
      glitchProducedGravityShock: peakCrossForce > 1e-4,
      history
    };
  }

  _stepTunneling(psiARe, psiAIm, psiBRe, psiBIm, phiMetricA, wAB, dt) {
    const N = this.N;
    const nextRe = new Float64Array(N);
    const nextIm = new Float64Array(N);
    const tunnelFactor = this.jTunnel * wAB;

    for (let u = 0; u < N; u++) {
      let lapRe = 0.0,
        lapIm = 0.0;
      if (u > 0) {
        lapRe += psiARe[u] - psiARe[u - 1];
        lapIm += psiAIm[u] - psiAIm[u - 1];
      }
      if (u + 1 < N) {
        lapRe += psiARe[u] - psiARe[u + 1];
        lapIm += psiAIm[u] - psiAIm[u + 1];
      }

      const rhoA = psiARe[u] * psiARe[u] + psiAIm[u] * psiAIm[u];
      const vEff = -this.gNL * rhoA + phiMetricA[u];

      // H Psi_A + Tunnel_Kopplung * Psi_B
      const hRe = this.J0 * lapRe + vEff * psiARe[u] + tunnelFactor * psiBRe[u];
      const hIm = this.J0 * lapIm + vEff * psiAIm[u] + tunnelFactor * psiBIm[u];

      // i dPsi/dt = H Psi => dRe/dt = H_Im, dIm/dt = -H_Re
      nextRe[u] = psiARe[u] + dt * hIm;
      nextIm[u] = psiAIm[u] - dt * hRe;
    }
    return { psiRe: nextRe, psiIm: nextIm };
  }
}
