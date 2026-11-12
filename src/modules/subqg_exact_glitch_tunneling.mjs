/**
 * @fileoverview SubQG Exakter Glitch- und Tunneling-Mechanismus
 *
 * Behebt die 3 mathematischen Kritikpunkte:
 * 1. Verschwindende Ausgangskopplung via quadratischem Überlapp:
 *    w_AB(t) = |<A|B>|^2 = cos^2(Delta_theta(t)) = sin^2(epsilon(t)).
 *    Bei epsilon = 0 gilt exakt w_AB = 0.
 *
 * 2. Glitch-Puls mit strikt kompaktem Träger C_c^infinity (Glattes Bump-Fenster):
 *    Für |t - t_mid| < tau:
 *      f_bump(t) = exp(1 - 1 / (1 - ((t - t_mid)/tau)^2))
 *    Für |t - t_mid| >= tau:
 *      f_bump(t) = 0.0 (exakt!)
 *    epsilon(t) = epsilon_max * f_bump(t).
 *    Damit ist w_AB(t) vor t_start und nach t_end identisch und absolut 0.
 *
 * 3. Selbstadjungierter 2x2 Block-Hamiltonian:
 *    H(t) = [ H_A         g(t) * C   ]
 *           [ g(t) * C^dagger    H_B ]
 *    mit g(t) = J_tunnel * w_AB(t) in R und symmetrischer/hermitescher Kopplung C = C^dagger = I.
 *
 *    Exakte Folgerungen:
 *    a) Strikte Erhaltung der Gesamtnorm:
 *       N_total(t) = N_A(t) + N_B(t) = const. (d N_total / dt = 0).
 *    b) Exakte Energie-Arbeits-Bilanz des Glitches:
 *       d <H(t)> / dt = < partial_t H(t) > = 2 * (d g / dt) * Re( <Psi_A | Psi_B> ).
 *       Delta E_total = \int_0^T [ 2 * g'(t) * Re( <Psi_A(t) | Psi_B(t)> ) ] dt.
 */

import { SubQGAppleWorld, createApplePRNG } from './subqg_apple_experiment.mjs';

export class SubQGExactGlitchEngine {
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

    // Glitch-Zeitfenster mit kompaktem Träger
    this.glitchTimeMid = config.glitchTimeMid ?? 2.0;
    this.glitchHalfWidth = config.glitchHalfWidth ?? 0.5; // tau: Träger ist [t_mid - tau, t_mid + tau]
    this.epsilonMax = config.epsilonMax ?? 0.45;
    this.jTunnel = config.jTunnel ?? 0.75;

    // Fundamentale emergente Kopplung ohne phänomenologischen Skalierungs-Eingriff:
    // Im echten geschlossenen Zwei-Welten-System gilt exakt Actio = Reactio (backreactionScale = 1.0)
    this.worldA = new SubQGAppleWorld({ ...config, N: this.N, seed: this.seed, backreactionScale: 1.0 });
    this.worldB = new SubQGAppleWorld({ ...config, N: this.N, seed: this.seed + 100, backreactionScale: 1.0 });
  }

  /**
   * Berechnet den Glitch-Puls mit strikt kompaktem Träger (glatte Bump-Funktion).
   * @param {number} t
   * @returns {{ epsilon: number, wAB: number, gTunnel: number, dGdt: number, dWdt: number, isGlitchActive: boolean }}
   */
  computeGlitchCoupling(t) {
    const tau = this.glitchHalfWidth;
    const dtGlitch = t - this.glitchTimeMid;
    const s = dtGlitch / tau;

    // Außerhalb des Intervalls [-tau, tau] ist die Kopplung EXAKT 0 (keine asymptotischen Gauß-Ausläufer!)
    if (Math.abs(s) >= 1.0) {
      return { epsilon: 0.0, wAB: 0.0, gTunnel: 0.0, dGdt: 0.0, dWdt: 0.0, isGlitchActive: false };
    }

    // Bump-Funktion f(s) = exp(1 - 1 / (1 - s^2)) in (0, 1]
    const oneMinusS2 = 1.0 - s * s;
    const bump = Math.exp(1.0 - 1.0 / oneMinusS2);
    const dBump_ds = bump * (-2.0 * s / (oneMinusS2 * oneMinusS2));
    const dBump_dt = dBump_ds / tau;

    const epsilon = this.epsilonMax * bump;
    const dEps_dt = this.epsilonMax * dBump_dt;

    // Quadratischer Überlapp: w_AB(t) = sin^2(epsilon(t))
    const sinEps = Math.sin(epsilon);
    const cosEps = Math.cos(epsilon);
    const wAB = sinEps * sinEps;
    const dW_dt = 2.0 * sinEps * cosEps * dEps_dt;

    const gTunnel = this.jTunnel * wAB;
    const dGdt = this.jTunnel * dW_dt;

    return {
      epsilon,
      wAB,
      gTunnel,
      dGdt,
      dWdt: dW_dt,
      isGlitchActive: true
    };
  }

  /**
   * Berechnet das reale Skalarprodukt Re(<Psi_A | Psi_B>).
   */
  _overlapRe(psiARe, psiAIm, psiBRe, psiBIm) {
    let sum = 0.0;
    for (let u = 0; u < this.N; u++) {
      sum += psiARe[u] * psiBRe[u] + psiAIm[u] * psiBIm[u];
    }
    return sum;
  }

  /**
   * Berechnet das metrische Kreuz-Wechselwirkungsintegral sum_e w_e * rho_B,e * x_A,e
   * für die variationelle Arbeitsleistung partial S_edge,A / partial t.
   */
  _metricCrossInt(rhoB, xEdgeA) {
    let sum = 0.0;
    const M = this.N - 1;
    for (let e = 0; e < M; e++) {
      sum += this.worldA.weights[e] * rhoB[e] * xEdgeA[e];
    }
    return sum;
  }

  /**
   * Löst die gekoppelten Metrikzustände für beide Sektoren konsistent zum momentanen Zustand
   * und der Glitch-Kopplung w_AB.
   */
  _evaluateMetricState(psiARe, psiAIm, psiBRe, psiBIm, wAB, prevMetA = null, prevMetB = null) {
    const rhoA = this.worldA.computeEdgeDensity(psiARe, psiAIm);
    const rhoB = this.worldB.computeEdgeDensity(psiBRe, psiBIm);

    const effectiveRhoSourceForA = new Float64Array(this.N - 1);
    for (let e = 0; e < this.N - 1; e++) {
      effectiveRhoSourceForA[e] = wAB * rhoB[e];
    }

    const metA = this.worldA.solveVariationalMetric({
      rhoSourceEdge: effectiveRhoSourceForA,
      rhoPacketEdge: rhoA,
      initialX: prevMetA ? prevMetA.xEdge : null,
      maxIter: prevMetA ? 350 : 4500
    });

    const metB = this.worldB.solveVariationalMetric({
      rhoSourceEdge: rhoB,
      initialX: prevMetB ? prevMetB.xEdge : null,
      maxIter: prevMetB ? 350 : 4500
    });

    return { metA, metB, rhoA, rhoB };
  }

  /**
   * Berechnet die Erwartungswerte des selbstadjungierten 2x2 Block-Hamiltonians inklusive
   * mathematisch konsistenter Hartree-Newton Feldenergie (ohne Selbstinteraktions-Doppelzählung):
   * H_joint(t) = (E_wave,A - S_edge[x_A]) + (E_wave,B - S_edge[x_B]) + E_cross(t)
   *            = (E_kin,A + E_NL,A + S_edge[x_A]) + (E_kin,B + E_NL,B + S_edge[x_B]) + E_cross(t)
   */
  computeBlockHamiltonianEnergies(psiARe, psiAIm, psiBRe, psiBIm, metA, metB, gTunnel) {
    const phiMetricA = metA.phiMetric;
    const phiMetricB = metB.phiMetric;
    const sEdgeA = metA.edgeAction || 0.0;
    const sEdgeB = metB.edgeAction || 0.0;

    const obsA = this.worldA.measureObservables(psiARe, psiAIm, phiMetricA, sEdgeA);
    const obsB = this.worldB.measureObservables(psiBRe, psiBIm, phiMetricB, sEdgeB);

    // Kreuz-Kopplungsenergie E_cross = 2 * g(t) * Re( <Psi_A | Psi_B> )
    const crossOverlapRe = this._overlapRe(psiARe, psiAIm, psiBRe, psiBIm);
    const eCross = 2.0 * gTunnel * crossOverlapRe;

    // Physikalische Hartree-Newton Energie:
    // obs.eWaveIntrinsic = E_kin + E_NL + E_metricInt = E_kin + E_NL + 2 * S_edge.
    // Durch Subtraktion von S_edge erhalten wir exakt E_kin + E_NL + S_edge = E_kin + E_NL + 0.5 * E_metricInt,
    // was die fundamentale Zweikörper-Selbstenergiedoppelzählung der Hartree-Theorie exakt bereinigt.
    const hPhysA = obsA.eWaveIntrinsic - sEdgeA;
    const hPhysB = obsB.eWaveIntrinsic - sEdgeB;
    const eJointTotal = hPhysA + hPhysB + eCross;
    const nTotal = obsA.norm + obsB.norm;

    return {
      normA: obsA.norm,
      normB: obsB.norm,
      nTotal,
      eA: obsA.eWaveIntrinsic,
      eB: obsB.eWaveIntrinsic,
      hPhysA,
      hPhysB,
      sEdgeA,
      sEdgeB,
      eCross,
      eWaveTotal: obsA.eWaveIntrinsic + obsB.eWaveIntrinsic + eCross,
      eTotal: eJointTotal,
      crossOverlapRe
    };
  }

  /**
   * Führt die unitäre gekoppelte RK4-Integration der beiden Sektoren aus,
   * wobei alle Zwischenstufen k1..k4 die zeitabhängige Glitch-Kopplung g(t) und
   * die rückgekoppelte variationelle Metrik konsistent auswerten.
   */
  simulateGlitchCrossing(opts = {}) {
    const steps = opts.steps ?? 300;
    const dt = opts.dt ?? 0.02;

    // Welt A: Startet leer (nur Vakuum, Norm = 0)
    // Welt B: Beherbergt ein massereiches Resonanzpaket bei x = 28
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

    const initGlitch = this.computeGlitchCoupling(0.0);
    let currentMetrics = this._evaluateMetricState(psiARe, psiAIm, psiBRe, psiBIm, initGlitch.wAB);

    const initH = this.computeBlockHamiltonianEnergies(
      psiARe, psiAIm, psiBRe, psiBIm,
      currentMetrics.metA, currentMetrics.metB, initGlitch.gTunnel
    );

    const initialTotalNorm = initH.nTotal;
    const initialTotalEnergy = initH.eTotal;

    let integratedGlitchPower = 0.0;
    let integratedTunnelPower = 0.0;
    let integratedMetricPower = 0.0;
    let peakTunnelCoupling = 0.0;
    let peakCrossForce = 0.0;

    const history = [];

    for (let step = 0; step <= steps; step++) {
      const t = step * dt;
      const glitch = this.computeGlitchCoupling(t);
      if (glitch.wAB > peakTunnelCoupling) peakTunnelCoupling = glitch.wAB;

      currentMetrics = this._evaluateMetricState(
        psiARe, psiAIm, psiBRe, psiBIm, glitch.wAB,
        currentMetrics.metA, currentMetrics.metB
      );
      const metA = currentMetrics.metA;
      const metB = currentMetrics.metB;

      const hStats = this.computeBlockHamiltonianEnergies(
        psiARe, psiAIm, psiBRe, psiBIm,
        metA, metB, glitch.gTunnel
      );

      // Vollständige Momentanleistung des Glitches:
      // P_total = P_tunnel + P_metric
      // P_tunnel = 2 * (dg/dt) * Re(<Psi_A|Psi_B>)
      // P_metric = (dw_AB/dt) * beta * sum_e w_e * rho_B,e * x_A,e
      const metricCrossInt = this._metricCrossInt(currentMetrics.rhoB, metA.xEdge);
      const tunnelPower = 2.0 * glitch.dGdt * hStats.crossOverlapRe;
      const metricPower = glitch.dWdt * this.beta * metricCrossInt;
      const glitchPower = tunnelPower + metricPower;

      // Kreuzkraft auf Welt A
      const centerNode = Math.round(centerB);
      const gradPhiA = (metA.phiMetric[centerNode + 1] - metA.phiMetric[centerNode - 1]) / 2.0;
      const crossAcc = -2.0 * this.J0 * gradPhiA;
      if (Math.abs(crossAcc) > peakCrossForce) peakCrossForce = Math.abs(crossAcc);

      history.push({
        step,
        t: Number(t.toFixed(4)),
        glitchEpsilon: glitch.epsilon,
        wAB: glitch.wAB,
        gTunnel: glitch.gTunnel,
        dGdt: glitch.dGdt,
        dWdt: glitch.dWdt,
        isGlitchActive: glitch.isGlitchActive,
        normA: hStats.normA,
        normB: hStats.normB,
        nTotal: hStats.nTotal,
        eA: hStats.eA,
        eB: hStats.eB,
        sEdgeA: hStats.sEdgeA,
        sEdgeB: hStats.sEdgeB,
        eCross: hStats.eCross,
        eWaveTotal: hStats.eWaveTotal,
        eTotal: hStats.eTotal,
        tunnelPower,
        metricPower,
        glitchPower,
        integratedGlitchPower,
        crossAcc
      });

      if (step < steps) {
        // Konsistenter 4-Stufen RK4-Schritt mit zeit- und zustandsabhängiger Metrik- und Kopplungsauswertung
        const rkResult = this._stepBlockRK4(
          psiARe, psiAIm, psiBRe, psiBIm,
          t, dt, metA, metB
        );
        psiARe = rkResult.psiARe;
        psiAIm = rkResult.psiAIm;
        psiBRe = rkResult.psiBRe;
        psiBIm = rkResult.psiBIm;
        currentMetrics.metA = rkResult.metA;
        currentMetrics.metB = rkResult.metB;

        // 4th-Order Quadratur (Simpson / RK-Gewichte) für die geleistete Glitch-Arbeit
        const sp = rkResult.stagePowers;
        const stepTunnelWork = (dt / 6.0) * (sp.pTunnel1 + 2.0 * sp.pTunnel2 + 2.0 * sp.pTunnel3 + sp.pTunnel4);
        const stepMetricWork = (dt / 6.0) * (sp.pMetric1 + 2.0 * sp.pMetric2 + 2.0 * sp.pMetric3 + sp.pMetric4);
        const stepTotalWork = stepTunnelWork + stepMetricWork;

        integratedTunnelPower += stepTunnelWork;
        integratedMetricPower += stepMetricWork;
        integratedGlitchPower += stepTotalWork;
      }
    }

    const finalH = history[history.length - 1];
    const totalNormDriftRel = Math.abs(finalH.nTotal - initialTotalNorm) / Math.max(1e-18, initialTotalNorm);
    const deltaTotalEnergy = finalH.eTotal - initialTotalEnergy;
    const energyWorkDiscrepancy = Math.abs(deltaTotalEnergy - integratedGlitchPower);

    return {
      initialTotalNorm,
      finalTotalNorm: finalH.nTotal,
      totalNormDriftRel,
      isTotalNormConserved: totalNormDriftRel < 1e-6,

      initialTotalEnergy,
      finalTotalEnergy: finalH.eTotal,
      deltaTotalEnergy,
      integratedGlitchPower,
      integratedTunnelPower,
      integratedMetricPower,
      energyWorkDiscrepancy,
      isEnergyWorkBalanced: energyWorkDiscrepancy < 0.05,

      peakTunnelCoupling,
      peakCrossForce,
      finalNormInA: finalH.normA,
      glitchProducedTunneling: finalH.normA > 1e-4,
      history
    };
  }

  /**
   * Hermitescher Zeitschritt des 2x2 Block-Hamiltonians:
   * i dPsi_A/dt = H_A Psi_A + g(t) Psi_B
   * i dPsi_B/dt = g(t) Psi_A + H_B Psi_B
   */
  _computeBlockRhs(psiARe, psiAIm, psiBRe, psiBIm, phiA, phiB, gTunnel, outDARe, outDAIm, outDBRe, outDBIm) {
    const N = this.N;
    const J0 = this.J0;
    const gNL = this.gNL;

    for (let u = 0; u < N; u++) {
      // Sektor A
      let lapARe = 0.0, lapAIm = 0.0;
      if (u > 0) { lapARe += psiARe[u] - psiARe[u - 1]; lapAIm += psiAIm[u] - psiAIm[u - 1]; }
      if (u + 1 < N) { lapARe += psiARe[u] - psiARe[u + 1]; lapAIm += psiAIm[u] - psiAIm[u + 1]; }
      const rhoA = psiARe[u] * psiARe[u] + psiAIm[u] * psiAIm[u];
      const vEffA = -gNL * rhoA + phiA[u];

      const hARe = J0 * lapARe + vEffA * psiARe[u] + gTunnel * psiBRe[u];
      const hAIm = J0 * lapAIm + vEffA * psiAIm[u] + gTunnel * psiBIm[u];
      outDARe[u] = hAIm;
      outDAIm[u] = -hARe;

      // Sektor B (exakt symmetrischer hermitescher Kreuzterm g(t) * Psi_A!)
      let lapBRe = 0.0, lapBIm = 0.0;
      if (u > 0) { lapBRe += psiBRe[u] - psiBRe[u - 1]; lapBIm += psiBIm[u] - psiBIm[u - 1]; }
      if (u + 1 < N) { lapBRe += psiBRe[u] - psiBRe[u + 1]; lapBIm += psiBIm[u] - psiBIm[u + 1]; }
      const rhoB = psiBRe[u] * psiBRe[u] + psiBIm[u] * psiBIm[u];
      const vEffB = -gNL * rhoB + phiB[u];

      const hBRe = J0 * lapBRe + vEffB * psiBRe[u] + gTunnel * psiARe[u];
      const hBIm = J0 * lapBIm + vEffB * psiBIm[u] + gTunnel * psiAIm[u];
      outDBRe[u] = hBIm;
      outDBIm[u] = -hBRe;
    }
  }

  /**
   * 4-stufiger Runge-Kutta Integrator für das zeitabhängige gekoppelte 2-Sektoren-System.
   * Bewertet g(t) an den Stufen t, t + dt/2, t + dt und aktualisiert die variationelle Metrik.
   */
  _stepBlockRK4(psiARe, psiAIm, psiBRe, psiBIm, t, dt, prevMetA, prevMetB) {
    const N = this.N;
    const halfDt = 0.5 * dt;

    // Stufe 1: t
    const g1 = this.computeGlitchCoupling(t);
    const m1 = this._evaluateMetricState(psiARe, psiAIm, psiBRe, psiBIm, g1.wAB, prevMetA, prevMetB);
    const k1ARe = new Float64Array(N), k1AIm = new Float64Array(N);
    const k1BRe = new Float64Array(N), k1BIm = new Float64Array(N);
    this._computeBlockRhs(psiARe, psiAIm, psiBRe, psiBIm, m1.metA.phiMetric, m1.metB.phiMetric, g1.gTunnel, k1ARe, k1AIm, k1BRe, k1BIm);

    const ov1 = this._overlapRe(psiARe, psiAIm, psiBRe, psiBIm);
    const pTunnel1 = 2.0 * g1.dGdt * ov1;
    const pMetric1 = g1.dWdt * this.beta * this._metricCrossInt(m1.rhoB, m1.metA.xEdge);

    // Stufe 2: t + dt/2 mit k1
    const t2 = t + halfDt;
    const g2 = this.computeGlitchCoupling(t2);
    const tmp2ARe = new Float64Array(N), tmp2AIm = new Float64Array(N);
    const tmp2BRe = new Float64Array(N), tmp2BIm = new Float64Array(N);
    for (let u = 0; u < N; u++) {
      tmp2ARe[u] = psiARe[u] + halfDt * k1ARe[u];
      tmp2AIm[u] = psiAIm[u] + halfDt * k1AIm[u];
      tmp2BRe[u] = psiBRe[u] + halfDt * k1BRe[u];
      tmp2BIm[u] = psiBIm[u] + halfDt * k1BIm[u];
    }
    const m2 = this._evaluateMetricState(tmp2ARe, tmp2AIm, tmp2BRe, tmp2BIm, g2.wAB, m1.metA, m1.metB);
    const k2ARe = new Float64Array(N), k2AIm = new Float64Array(N);
    const k2BRe = new Float64Array(N), k2BIm = new Float64Array(N);
    this._computeBlockRhs(tmp2ARe, tmp2AIm, tmp2BRe, tmp2BIm, m2.metA.phiMetric, m2.metB.phiMetric, g2.gTunnel, k2ARe, k2AIm, k2BRe, k2BIm);

    const ov2 = this._overlapRe(tmp2ARe, tmp2AIm, tmp2BRe, tmp2BIm);
    const pTunnel2 = 2.0 * g2.dGdt * ov2;
    const pMetric2 = g2.dWdt * this.beta * this._metricCrossInt(m2.rhoB, m2.metA.xEdge);

    // Stufe 3: t + dt/2 mit k2
    const tmp3ARe = new Float64Array(N), tmp3AIm = new Float64Array(N);
    const tmp3BRe = new Float64Array(N), tmp3BIm = new Float64Array(N);
    for (let u = 0; u < N; u++) {
      tmp3ARe[u] = psiARe[u] + halfDt * k2ARe[u];
      tmp3AIm[u] = psiAIm[u] + halfDt * k2AIm[u];
      tmp3BRe[u] = psiBRe[u] + halfDt * k2BRe[u];
      tmp3BIm[u] = psiBIm[u] + halfDt * k2BIm[u];
    }
    const m3 = this._evaluateMetricState(tmp3ARe, tmp3AIm, tmp3BRe, tmp3BIm, g2.wAB, m2.metA, m2.metB);
    const k3ARe = new Float64Array(N), k3AIm = new Float64Array(N);
    const k3BRe = new Float64Array(N), k3BIm = new Float64Array(N);
    this._computeBlockRhs(tmp3ARe, tmp3AIm, tmp3BRe, tmp3BIm, m3.metA.phiMetric, m3.metB.phiMetric, g2.gTunnel, k3ARe, k3AIm, k3BRe, k3BIm);

    const ov3 = this._overlapRe(tmp3ARe, tmp3AIm, tmp3BRe, tmp3BIm);
    const pTunnel3 = 2.0 * g2.dGdt * ov3;
    const pMetric3 = g2.dWdt * this.beta * this._metricCrossInt(m3.rhoB, m3.metA.xEdge);

    // Stufe 4: t + dt mit k3
    const t4 = t + dt;
    const g4 = this.computeGlitchCoupling(t4);
    const tmp4ARe = new Float64Array(N), tmp4AIm = new Float64Array(N);
    const tmp4BRe = new Float64Array(N), tmp4BIm = new Float64Array(N);
    for (let u = 0; u < N; u++) {
      tmp4ARe[u] = psiARe[u] + dt * k3ARe[u];
      tmp4AIm[u] = psiAIm[u] + dt * k3AIm[u];
      tmp4BRe[u] = psiBRe[u] + dt * k3BRe[u];
      tmp4BIm[u] = psiBIm[u] + dt * k3BIm[u];
    }
    const m4 = this._evaluateMetricState(tmp4ARe, tmp4AIm, tmp4BRe, tmp4BIm, g4.wAB, m3.metA, m3.metB);
    const k4ARe = new Float64Array(N), k4AIm = new Float64Array(N);
    const k4BRe = new Float64Array(N), k4BIm = new Float64Array(N);
    this._computeBlockRhs(tmp4ARe, tmp4AIm, tmp4BRe, tmp4BIm, m4.metA.phiMetric, m4.metB.phiMetric, g4.gTunnel, k4ARe, k4AIm, k4BRe, k4BIm);

    const ov4 = this._overlapRe(tmp4ARe, tmp4AIm, tmp4BRe, tmp4BIm);
    const pTunnel4 = 2.0 * g4.dGdt * ov4;
    const pMetric4 = g4.dWdt * this.beta * this._metricCrossInt(m4.rhoB, m4.metA.xEdge);

    const nextARe = new Float64Array(N), nextAIm = new Float64Array(N);
    const nextBRe = new Float64Array(N), nextBIm = new Float64Array(N);
    const c = dt / 6.0;

    for (let u = 0; u < N; u++) {
      nextARe[u] = psiARe[u] + c * (k1ARe[u] + 2.0 * k2ARe[u] + 2.0 * k3ARe[u] + k4ARe[u]);
      nextAIm[u] = psiAIm[u] + c * (k1AIm[u] + 2.0 * k2AIm[u] + 2.0 * k3AIm[u] + k4AIm[u]);
      nextBRe[u] = psiBRe[u] + c * (k1BRe[u] + 2.0 * k2BRe[u] + 2.0 * k3BRe[u] + k4BRe[u]);
      nextBIm[u] = psiBIm[u] + c * (k1BIm[u] + 2.0 * k2BIm[u] + 2.0 * k3BIm[u] + k4BIm[u]);
    }

    return {
      psiARe: nextARe,
      psiAIm: nextAIm,
      psiBRe: nextBRe,
      psiBIm: nextBIm,
      metA: m4.metA,
      metB: m4.metB,
      stagePowers: {
        pTunnel1, pTunnel2, pTunnel3, pTunnel4,
        pMetric1, pMetric2, pMetric3, pMetric4
      }
    };
  }
}
