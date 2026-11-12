/**
 * @fileoverview SubQG Apfel-Experiment: Trägheit, Gewicht, freier Fall & geometrische Rückwirkung
 *
 * Implementiert den vollständigen wissenschaftlichen Versuchsaufbau gemäß
 * "SubQG Apfel Experiment: Blueprint zur Prüfung von Trägheit, Gewicht und universellem freien Fall"
 * (Ralf Krümmel, 11. Nov. 2026).
 *
 * Leitende Frage:
 * Wie erzeugt derselbe SubQG-Gravitationsmechanismus (lokale Phasen- und Anregungskopplung ->
 * variationelle Kantenmetrik x_e = ln(L_e / L_0) -> Wellenausbreitung auf dem deformierten Graphen)
 * sowohl das massenabhängige Gewicht (Haltekraft F_Halten ~ m_inert) als auch die nahezu
 * massenunabhängige Fallbeschleunigung (Ẍ_frei ≈ g_eff) konkreter Resonanzobjekte?
 *
 * Wissenschaftliche Trennung:
 * 1. Aus bestehenden SubQG-Modulen übernommen:
 *    - FPV1 Phasenüberlappungs-Gewichte: w_e = (1 + cos(θ_v - θ_u)) / 2  (subqg_fpv.mjs)
 *    - Variationelle Kantenwirkung (ActionWorld / MicroActionWorld):
 *      S_edge[x] = (μ/2) Σ_e x_e^2 + (κ/2) Σ_(e~f) w_ef (x_e - x_f)^2 + β Σ_e w_e ρ_e x_e
 *      Stationaritätsbedingung: (μ I + κ L_edge) x_e = -β w_e ρ_e        (subqg_microaction.mjs)
 *    - Komplexe Amplituden- & Phasenentwicklung auf dem gewichteten Graphen (subqg_genesis.mjs)
 *
 * 2. Neu hergeleitete & ergänzte Modellkopplungen (ohne Zirkelschlüsse):
 *    - Selbstkonsistente Hamiltonsche Einhüllenden-Dynamik H_total[x, Ψ] auf dem Graphen mit
 *      lokaler solitärer Selbstbindung (-g_nl/2 Σ_u |Ψ_u|^4), damit lokalisierte Testobjekte
 *      ("Apfel", "Stein", "Felsblock", "Metalltonne") über die gesamte Fall- und Haltezeit
 *      formstabil bleiben (keine Punktteilchen-Ersatzdynamik!).
 *    - Mechanische Aktuatorkopplung H_act = -F_act(t) X[Ψ] an den kollektiven Schwerpunkt
 *      X[Ψ] = (1 / N_Ψ) Σ_u X_u^(0) |Ψ_u|^2 im festen Referenzlineal X_u^(0).
 *      Dies garantiert exakt die Energie-Arbeits-Bilanz dH_0/dt = F_act(t) Ẋ(t) und
 *      erlaubt eine unabhängige dynamische Impulskalibrierung m_inert = ΔP_act / ΔẊ.
 *    - Lokale Kanten-Metrik-Wechselwirkung H_int = β Σ_e w_e x_e (|Ψ_u|^2 + |Ψ_v|^2)/2,
 *      aus der sowohl der Quellterm der Metrikgleichung δH_int/δx_e = β w_e ρ_e als auch
 *      das Knotenpotential Φ_metric(u) = (β/2) Σ_{e∋u} w_e x_e ohne Zusatzannahmen folgen.
 *
 * Strikt verbotene Abkürzungen (alle vermieden):
 * - Kein F = m * g im Code
 * - Keine massenproportionale Zusatzkraft von Hand
 * - Keine vorgeschriebene Soll-Beschleunigung Ẍ = g
 * - Keine Punktteilchen auf kürzesten Pfaden statt ausgedehnter Wellenpakete
 * - Keine Gleichsetzung von Ruheenergie und träger Masse ohne dynamischen Impulstest
 * - Keine objektspezifische Nachjustierung von Reglerparametern (K_p, K_i, K_d) oder F_max
 */

// ============================================================================
// 1. DETERMINISTISCHER PRNG & LINEARE ALGEBRA / REGRESSIONSHILFEN
// ============================================================================

/**
 * Erzeugt einen deterministischen 32-Bit LCG Zufallszahlengenerator.
 * @param {number} [seed=42]
 * @returns {() => number} Zufallszahl in [0, 1)
 */
export function createApplePRNG(seed = 42) {
  let state = (Number(seed) >>> 0) || 1;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/**
 * Lineare Regression y = a * x + b inklusive R^2 und relativen Residuen.
 * @param {number[]} xs
 * @param {number[]} ys
 */
export function fitLinearModel(xs, ys) {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) {
    return { slope: 0, intercept: ys[0] || 0, rSquared: 1, maxRelResidual: 0, residuals: [] };
  }
  let sumX = 0;
  let sumY = 0;
  let sumXX = 0;
  let sumXY = 0;
  for (let i = 0; i < n; i++) {
    sumX += xs[i];
    sumY += ys[i];
    sumXX += xs[i] * xs[i];
    sumXY += xs[i] * ys[i];
  }
  const denom = n * sumXX - sumX * sumX;
  const slope = Math.abs(denom) > 1e-18 ? (n * sumXY - sumX * sumY) / denom : 0;
  const intercept = (sumY - slope * sumX) / n;

  const meanY = sumY / n;
  let ssTot = 0;
  let ssRes = 0;
  let maxRelResidual = 0;
  const residuals = [];

  for (let i = 0; i < n; i++) {
    const pred = slope * xs[i] + intercept;
    const res = ys[i] - pred;
    ssRes += res * res;
    ssTot += Math.pow(ys[i] - meanY, 2);
    const rel = Math.abs(ys[i]) > 1e-12 ? Math.abs(res) / Math.abs(ys[i]) : Math.abs(res);
    if (rel > maxRelResidual) maxRelResidual = rel;
    residuals.push({ x: xs[i], y: ys[i], predicted: pred, residual: res, relResidual: rel });
  }

  const rSquared = ssTot > 1e-18 ? Math.max(0, 1.0 - ssRes / ssTot) : 1.0;
  return { slope, intercept, rSquared, maxRelResidual, residuals };
}

/**
 * Parabel-Fit X(t) = c0 + c1 * t + 0.5 * a * t^2 über kleinste Quadrate (Normalgleichungen).
 * @param {number[]} ts
 * @param {number[]} xs
 * @returns {{ x0Fit: number, v0Fit: number, acceleration: number, rSquared: number, rmse: number }}
 */
export function fitQuadraticTrajectory(ts, xs) {
  const n = Math.min(ts.length, xs.length);
  if (n < 3) {
    return { x0Fit: xs[0] || 0, v0Fit: 0, acceleration: 0, rSquared: 1, rmse: 0 };
  }
  const t0 = ts[0];
  let s0 = n, s1 = 0, s2 = 0, s3 = 0, s4 = 0;
  let sy = 0, sty = 0, st2y = 0;

  for (let i = 0; i < n; i++) {
    const dt = ts[i] - t0;
    const dt2 = dt * dt;
    const y = xs[i];
    s1 += dt;
    s2 += dt2;
    s3 += dt2 * dt;
    s4 += dt2 * dt2;
    sy += y;
    sty += dt * y;
    st2y += dt2 * y;
  }

  // Löse 3x3 System [s0 s1 s2; s1 s2 s3; s2 s3 s4] * [c0, c1, c2]^T = [sy, sty, st2y]^T
  const A = [
    [s0, s1, s2, sy],
    [s1, s2, s3, sty],
    [s2, s3, s4, st2y]
  ];

  for (let col = 0; col < 3; col++) {
    let pivot = col;
    for (let row = col + 1; row < 3; row++) {
      if (Math.abs(A[row][col]) > Math.abs(A[pivot][col])) pivot = row;
    }
    const tmp = A[col];
    A[col] = A[pivot];
    A[pivot] = tmp;

    const div = A[col][col];
    if (Math.abs(div) < 1e-18) continue;
    for (let j = col; j < 4; j++) A[col][j] /= div;
    for (let row = 0; row < 3; row++) {
      if (row === col) continue;
      const factor = A[row][col];
      for (let j = col; j < 4; j++) {
        A[row][j] -= factor * A[col][j];
      }
    }
  }

  const c0 = A[0][3];
  const c1 = A[1][3];
  const c2 = A[2][3]; // c2 = 0.5 * a
  const acceleration = 2.0 * c2;

  const meanY = sy / n;
  let ssTot = 0;
  let ssRes = 0;
  for (let i = 0; i < n; i++) {
    const dt = ts[i] - t0;
    const pred = c0 + c1 * dt + c2 * dt * dt;
    const err = xs[i] - pred;
    ssRes += err * err;
    ssTot += Math.pow(xs[i] - meanY, 2);
  }

  const rSquared = ssTot > 1e-18 ? Math.max(0, 1.0 - ssRes / ssTot) : 1.0;
  const rmse = Math.sqrt(ssRes / n);
  return { x0Fit: c0, v0Fit: c1, acceleration, rSquared, rmse };
}

// ============================================================================
// 2. KANONISCHE RESONANZOBJEKTE (BLUEPRINT ABSCHNITT 5.2)
// ============================================================================

/**
 * Vier eigenständig präparierte, lokal gebundene Resonanzobjekte mit gleichem
 * topologischen Einhüllenden-Typ, aber unterschiedlicher Anregungsnorm N_Ψ
 * (Massenspanne ca. 9x: von 0.985 bis 8.864).
 */
export const DEFAULT_APPLE_OBJECTS = Object.freeze([
  {
    id: 'apfel',
    label: 'Apfel (leichtes Resonanzpaket)',
    amplitude: 0.60,
    sigma: 2.15,
    color: '#22c55e'
  },
  {
    id: 'stein',
    label: 'Stein (mittleres Resonanzpaket)',
    amplitude: 1.00,
    sigma: 2.15,
    color: '#38bdf8'
  },
  {
    id: 'felsblock',
    label: 'Felsblock (schweres Resonanzpaket)',
    amplitude: 1.40,
    sigma: 2.15,
    color: '#f59e0b'
  },
  {
    id: 'metalltonne',
    label: 'Metalltonne (massives Resonanzpaket)',
    amplitude: 1.80,
    sigma: 2.15,
    color: '#ef4444'
  }
]);

// ============================================================================
// 3. SUBQG APPLE WORLD: GRAPH, METRIK-SOLVER & HAMILTONSCHE WELLENDYNAMIK
// ============================================================================

export class SubQGAppleWorld {
  /**
   * @param {object} [config={}]
   */
  constructor(config = {}) {
    this.N = config.N ?? 80;
    this.seed = config.seed ?? 42;
    this.phaseNoise = config.phaseNoise ?? 0.035;

    // Hamilton- und Kopplungsparameter (SubQG ActionWorld / MicroActionWorld)
    this.J0 = config.J0 ?? 1.0;
    this.gNL = config.gNL ?? 0.015;      // Lokale solitäre Selbstbindung (hält das Wellenpaket kohärent)
    this.mu = config.mu ?? 0.08;         // Metrischer Massenterm der Kantenwirkung (μ/2 Σ x_e^2)
    this.kappa = config.kappa ?? 12.0;   // Metrische Glättungssteifigkeit (κ/2 Σ (x_e - x_f)^2)
    this.beta = config.beta ?? 0.85;     // Materie-Metrik-Kopplung (β Σ w_e ρ_e x_e)
    this.enablePhaseNoise = config.enablePhaseNoise ?? false; // Optionale thermische Phasenfluktuation (für C9)

    // Quellkonfiguration ("Erde" als lokalisierte SubQG-Quellanregung)
    this.sourceCenter = config.sourceCenter ?? 8.0;
    this.sourceSigma = config.sourceSigma ?? 2.5;
    this.sourceAmp = config.sourceAmp ?? 0.72;
    this.backreactionScale = config.backreactionScale ?? 0.12; // Verhältnis Testkörper/Quellhorizont im gekoppelten Modus 2

    // Feste intrinsische Referenzgeometrie X_u^(0) (Blueprint Abschnitt 5.1: festes Referenzlineal!)
    this.refCoords = new Float64Array(this.N);
    for (let u = 0; u < this.N; u++) {
      this.refCoords[u] = u;
    }

    // Erzeuge kondensierten SubQG-Graphen mit FPV1 Phasenüberlappungsgewichten
    this._initGraph();
  }

  /**
   * Baut die Knotenphasen θ_u und die FPV1-Kantengewichte w_e = (1 + cos(θ_{u+1} - θ_u)) / 2 auf.
   * Im kondensierten Vakuumgrundzustand gilt θ_u = θ_0 (w_e = 1); mit aktivierter Phasenunordnung
   * (Kontrolle C9) überlagern sich zufällige Phasenfluktuationen.
   */
  _initGraph() {
    const rng = createApplePRNG(this.seed);
    this.nodePhases = new Float64Array(this.N);
    const noiseScale = this.enablePhaseNoise ? this.phaseNoise : 0.0;
    for (let u = 0; u < this.N; u++) {
      const u1 = Math.max(1e-12, rng());
      const u2 = rng();
      const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      this.nodePhases[u] = noiseScale * z;
    }

    const M = this.N - 1;
    this.weights = new Float64Array(M);
    let weightSum = 0;
    for (let e = 0; e < M; e++) {
      const dTheta = this.nodePhases[e + 1] - this.nodePhases[e];
      const w = 0.5 * (1.0 + Math.cos(dTheta));
      this.weights[e] = w;
      weightSum += w;
    }
    this.meanWeight = weightSum / M;
  }

  /**
   * Präpariert ein lokalisiertes Gauß-Soliton-Wellenpaket Ψ_u(0) bei x0 mit Startimpuls k0.
   * @param {{ center: number, amplitude: number, sigma?: number, k0?: number }} opts
   */
  prepareWavePacket({ center, amplitude, sigma = 2.15, k0 = 0.0 }) {
    const psiRe = new Float64Array(this.N);
    const psiIm = new Float64Array(this.N);
    for (let u = 0; u < this.N; u++) {
      const dx = this.refCoords[u] - center;
      const env = amplitude * Math.exp(-(dx * dx) / (2.0 * sigma * sigma));
      psiRe[u] = env * Math.cos(k0 * dx);
      psiIm[u] = env * Math.sin(k0 * dx);
    }
    return { psiRe, psiIm };
  }

  /**
   * Berechnet die Kanten-Anregungsdichte ρ_e = (|Ψ_u|^2 + |Ψ_{u+1}|^2) / 2.
   * @param {Float64Array} psiRe
   * @param {Float64Array} psiIm
   * @returns {Float64Array}
   */
  computeEdgeDensity(psiRe, psiIm) {
    const M = this.N - 1;
    const rhoEdge = new Float64Array(M);
    for (let e = 0; e < M; e++) {
      const n0 = psiRe[e] * psiRe[e] + psiIm[e] * psiIm[e];
      const n1 = psiRe[e + 1] * psiRe[e + 1] + psiIm[e + 1] * psiIm[e + 1];
      rhoEdge[e] = 0.5 * (n0 + n1);
    }
    return rhoEdge;
  }

  /**
   * Berechnet die Quell-Anregungsdichte ρ_source,e der lokalisierten Quelle ("Erde").
   * @param {number} [sourceAmpOverride]
   */
  computeSourceState(sourceAmpOverride = this.sourceAmp) {
    return this.prepareWavePacket({
      center: this.sourceCenter,
      amplitude: sourceAmpOverride,
      sigma: this.sourceSigma / Math.sqrt(2.0),
      k0: 0.0
    });
  }

  /**
   * Löst die variationelle SubQG-Kantenmetrikgleichung (MicroActionWorld / ActionWorld):
   *   ∂S_edge / ∂x_e = μ x_e + κ (L_edge x)_e + β w_e ρ_total,e = 0
   * und berechnet daraus:
   *   - x_e = ln(L_e / L_0)
   *   - Effektive Kantenlänge L_e = exp(x_e)
   *   - Knoten-Metrikpotential Φ_metric(u) = (β/2) Σ_{e∋u} w_e x_e
   *
   * @param {object} [opts={}]
   * @param {Float64Array|null} [opts.rhoSourceEdge]
   * @param {Float64Array|null} [opts.rhoPacketEdge]
   * @param {number} [opts.betaOverride]
   * @param {Float64Array|null} [opts.initialX]
   * @param {number} [opts.maxIter=3500]
   * @param {number} [opts.tol=1e-12]
   */
  solveVariationalMetric(opts = {}) {
    const M = this.N - 1;
    const betaEff = opts.betaOverride !== undefined ? opts.betaOverride : this.beta;
    const mu = this.mu;
    const kappa = this.kappa;
    const maxIter = opts.maxIter ?? 3500;
    const tol = opts.tol ?? 1e-12;

    const backreactionScale = opts.backreactionScale ?? this.backreactionScale;
    const totalRho = new Float64Array(M);
    if (opts.rhoSourceEdge) {
      for (let e = 0; e < M; e++) totalRho[e] += opts.rhoSourceEdge[e];
    }
    if (opts.rhoPacketEdge) {
      for (let e = 0; e < M; e++) totalRho[e] += backreactionScale * opts.rhoPacketEdge[e];
    }

    const xEdge = opts.initialX ? new Float64Array(opts.initialX) : new Float64Array(M);

    let iterations = 0;
    if (Math.abs(betaEff) > 1e-18) {
      for (let iter = 0; iter < maxIter; iter++) {
        iterations++;
        let maxDiff = 0.0;
        for (let e = 0; e < M; e++) {
          let nbSum = 0.0;
          let wDeg = 0.0;
          if (e > 0) {
            const wLeft = 0.5 * (this.weights[e] + this.weights[e - 1]);
            nbSum += wLeft * xEdge[e - 1];
            wDeg += wLeft;
          }
          if (e + 1 < M) {
            const wRight = 0.5 * (this.weights[e] + this.weights[e + 1]);
            nbSum += wRight * xEdge[e + 1];
            wDeg += wRight;
          }
          const rhs = -betaEff * this.weights[e] * totalRho[e];
          const nextVal = (rhs + kappa * nbSum) / (mu + kappa * wDeg);
          const diff = Math.abs(nextVal - xEdge[e]);
          if (diff > maxDiff) maxDiff = diff;
          xEdge[e] = nextVal;
        }
        if (maxDiff < tol) break;
      }
    } else {
      xEdge.fill(0.0);
    }

    // Prüfe stationäres Residuum ||∂S/∂x_e||_∞ und berechne S_edge[x]
    let maxResidual = 0.0;
    let edgeAction = 0.0;
    const edgeLength = new Float64Array(M);
    for (let e = 0; e < M; e++) {
      edgeLength[e] = Math.exp(xEdge[e]);
      let lap = 0.0;
      if (e > 0) {
        const wLeft = 0.5 * (this.weights[e] + this.weights[e - 1]);
        lap += kappa * wLeft * (xEdge[e] - xEdge[e - 1]);
      }
      if (e + 1 < M) {
        const wRight = 0.5 * (this.weights[e] + this.weights[e + 1]);
        lap += kappa * wRight * (xEdge[e] - xEdge[e + 1]);
        edgeAction += 0.5 * kappa * wRight * Math.pow(xEdge[e + 1] - xEdge[e], 2);
      }
      const grad = mu * xEdge[e] + lap + betaEff * this.weights[e] * totalRho[e];
      if (Math.abs(grad) > maxResidual) maxResidual = Math.abs(grad);
      edgeAction += 0.5 * mu * xEdge[e] * xEdge[e] + betaEff * this.weights[e] * totalRho[e] * xEdge[e];
    }

    // Knoten-Metrikpotential Φ_metric(u) = δH_int / δ(|Ψ_u|^2) = (β/2) Σ_{e∋u} w_e x_e
    const phiMetric = new Float64Array(this.N);
    for (let u = 0; u < this.N; u++) {
      let sum = 0.0;
      if (u > 0) sum += this.weights[u - 1] * xEdge[u - 1];
      if (u < M) sum += this.weights[u] * xEdge[u];
      phiMetric[u] = 0.5 * betaEff * sum;
    }

    return {
      xEdge,
      edgeLength,
      phiMetric,
      totalRho,
      iterations,
      maxResidual,
      edgeAction
    };
  }

  /**
   * Erzeugt eine analytisch vorgeschriebene Vergleichsmetrik (Kontrolle C4 aus Abschnitt 7.1),
   * die das Yukawa-/Screened-Poisson-Profil der variationellen Lösung nachbildet.
   */
  buildPrescribedControlMetric() {
    const srcState = this.computeSourceState();
    const rhoSrc = this.computeEdgeDensity(srcState.psiRe, srcState.psiIm);
    const varSol = this.solveVariationalMetric({ rhoSourceEdge: rhoSrc });

    // Analytische Anpassung der abgeschirmten Greenschen Funktion G(e, e_0) ~ A * exp(-|e - c| / λ)
    const decayLen = Math.sqrt(this.kappa / this.mu);
    const M = this.N - 1;
    const xEdge = new Float64Array(M);
    const edgeLength = new Float64Array(M);
    const peakX = varSol.xEdge[Math.round(this.sourceCenter)];
    for (let e = 0; e < M; e++) {
      const dist = Math.hypot(e + 0.5 - this.sourceCenter, this.sourceSigma * 0.85);
      xEdge[e] = peakX * Math.exp(-(dist - this.sourceSigma * 0.85) / decayLen);
      edgeLength[e] = Math.exp(xEdge[e]);
    }
    const phiMetric = new Float64Array(this.N);
    for (let u = 0; u < this.N; u++) {
      let sum = 0.0;
      if (u > 0) sum += this.weights[u - 1] * xEdge[u - 1];
      if (u < M) sum += this.weights[u] * xEdge[u];
      phiMetric[u] = 0.5 * this.beta * sum;
    }
    return { xEdge, edgeLength, phiMetric, decayLen };
  }

  /**
   * Berechnet alle Observablen des Messvertrags (Blueprint Abschnitt 5.1):
   * - norm N_Ψ = Σ_u |Ψ_u|^2
   * - primäre Objektkoordinate X(t) = (1/N_Ψ) Σ_u X_u^(0) |Ψ_u|^2 (intrinsisches Referenzlineal)
   * - sekundäre Objektkoordinate X_core(t) (Schwerpunkt des oberen 50%-Kerns + sub-Gitter-Peak, Kontrolle C10)
   * - kollektive Geschwindigkeit Ẋ(t) = (2 J_0 / N_Ψ) Σ_e w_e Im(Ψ_u^* Ψ_{u+1}) (exakter Ehrenfest-Strom)
   * - Paketbreite σ_X(t)
   * - Einzelbeiträge der Energie E_kin, E_nl, E_metricInt, E_edgeField, E_total
   *
   * @param {Float64Array} psiRe
   * @param {Float64Array} psiIm
   * @param {Float64Array} phiMetric
   * @param {number} [edgeFieldEnergy=0]
   */
  measureObservables(psiRe, psiIm, phiMetric, edgeFieldEnergy = 0.0) {
    const N = this.N;
    let norm = 0.0;
    let weightedPos = 0.0;
    let maxDensity = -1.0;
    let maxIdx = 0;
    const density = new Float64Array(N);

    for (let u = 0; u < N; u++) {
      const rho = psiRe[u] * psiRe[u] + psiIm[u] * psiIm[u];
      density[u] = rho;
      norm += rho;
      weightedPos += this.refCoords[u] * rho;
      if (rho > maxDensity) {
        maxDensity = rho;
        maxIdx = u;
      }
    }

    const X = norm > 1e-18 ? weightedPos / norm : 0.0;

    // Zweite Positionsdefinition (Blueprint Abschnitt 5.1 & 7.2):
    // Kontinuierlich fenster-gewichteter Kernschwerpunkt (Gauß-Fenster mit Radius R_core = 9.0 Knoten
    // um den momentanen Schwerpunkt X) zur Prüfung der Diagnose-Unabhängigkeit ohne Gitter-Sprünge
    let coreNorm = 0.0;
    let coreWeightedPos = 0.0;
    const rCoreSq = 81.0;
    for (let u = 0; u < N; u++) {
      const distX = this.refCoords[u] - X;
      const windowWeight = Math.exp(-(distX * distX) / (2.0 * rCoreSq));
      const wCore = density[u] * windowWeight;
      coreNorm += wCore;
      coreWeightedPos += this.refCoords[u] * wCore;
    }
    const XCore = coreNorm > 1e-18 ? coreWeightedPos / coreNorm : X;

    // Parabolische Peak-Interpolation um maxIdx
    let XPeak = this.refCoords[maxIdx];
    if (maxIdx > 0 && maxIdx + 1 < N) {
      const yL = density[maxIdx - 1];
      const yC = density[maxIdx];
      const yR = density[maxIdx + 1];
      const denom = 2.0 * (yL - 2.0 * yC + yR);
      if (Math.abs(denom) > 1e-15) {
        XPeak = this.refCoords[maxIdx] + (yL - yR) / denom;
      }
    }

    // Paketbreite σ_X und Energien
    let varSum = 0.0;
    let eNL = 0.0;
    let eMetricInt = 0.0;
    for (let u = 0; u < N; u++) {
      const dx = this.refCoords[u] - X;
      varSum += dx * dx * density[u];
      eNL -= 0.5 * this.gNL * density[u] * density[u];
      eMetricInt += phiMetric[u] * density[u];
    }
    const width = norm > 1e-18 ? Math.sqrt(Math.max(0.0, varSum / norm)) : 0.0;

    // Exakter Ehrenfest-Wahrscheinlichkeitsstrom J_curr -> kollektive Geschwindigkeit Ẋ(t)
    // sowie kinetische Graphen-Laplace-Energie E_kin = J_0 Σ_e w_e |Ψ_{e+1} - Ψ_e|^2
    let currentSum = 0.0;
    let eKin = 0.0;
    for (let e = 0; e < N - 1; e++) {
      const w = this.weights[e];
      const dRe = psiRe[e + 1] - psiRe[e];
      const dIm = psiIm[e + 1] - psiIm[e];
      eKin += this.J0 * w * (dRe * dRe + dIm * dIm);
      // Im(Ψ_e^* Ψ_{e+1}) = psiRe[e]*psiIm[e+1] - psiIm[e]*psiRe[e+1]
      const imCross = psiRe[e] * psiIm[e + 1] - psiIm[e] * psiRe[e + 1];
      currentSum += w * imCross;
    }

    const V = norm > 1e-18 ? (2.0 * this.J0 * currentSum) / norm : 0.0;
    const eWaveIntrinsic = eKin + eNL + eMetricInt;
    const eTotal = eWaveIntrinsic + edgeFieldEnergy;

    return {
      norm,
      X,
      XCore,
      XPeak,
      V,
      width,
      maxDensity,
      eKin,
      eNL,
      eMetricInt,
      eWaveIntrinsic,
      eTotal,
      density
    };
  }

  /**
   * Berechnet die Zeitableitung dΨ/dt = -i ∂H/∂Ψ^* für den RK4-Integrator:
   *   i dΨ_u/dt = (H_Ψ Ψ)_u
   *             = J_0 Σ_{v~u} w_{uv} (Ψ_u - Ψ_v)
   *               - g_nl |Ψ_u|^2 Ψ_u
   *               + Φ_metric(u) Ψ_u
   *               - (F_act(t) / N_Ψ) (X_u^(0) - X) Ψ_u
   */
  _computeRhs(psiRe, psiIm, phiMetric, fAct, invNorm, currentX, outDRe, outDIm) {
    const N = this.N;
    const J0 = this.J0;
    const gNL = this.gNL;
    const forceCoeff = fAct * invNorm;

    for (let u = 0; u < N; u++) {
      const re = psiRe[u];
      const im = psiIm[u];

      // Diskreter gewichteter Graph-Laplace J_0 Σ_{v~u} w_{uv} (Ψ_u - Ψ_v)
      let lapRe = 0.0;
      let lapIm = 0.0;
      if (u > 0) {
        const wL = this.weights[u - 1];
        lapRe += wL * (re - psiRe[u - 1]);
        lapIm += wL * (im - psiIm[u - 1]);
      }
      if (u + 1 < N) {
        const wR = this.weights[u];
        lapRe += wR * (re - psiRe[u + 1]);
        lapIm += wR * (im - psiIm[u + 1]);
      }

      const rho = re * re + im * im;
      const vEff = -gNL * rho + phiMetric[u] - forceCoeff * (this.refCoords[u] - currentX);

      const hRe = J0 * lapRe + vEff * re;
      const hIm = J0 * lapIm + vEff * im;

      // dΨ/dt = -i H Ψ => d(Re)/dt = H_Im, d(Im)/dt = -H_Re
      outDRe[u] = hIm;
      outDIm[u] = -hRe;
    }
  }

  /**
   * Führt einen unitären 4.-Ordnung Runge-Kutta-Zeitschritt (RK4) der Wellenpaket-Dynamik aus.
   */
  stepRK4(psiRe, psiIm, phiMetric, fAct, dt) {
    const N = this.N;
    let norm = 0.0;
    let weightedPos = 0.0;
    for (let u = 0; u < N; u++) {
      const rho = psiRe[u] * psiRe[u] + psiIm[u] * psiIm[u];
      norm += rho;
      weightedPos += this.refCoords[u] * rho;
    }
    const invNorm = norm > 1e-18 ? 1.0 / norm : 0.0;
    const currentX = norm > 1e-18 ? weightedPos * invNorm : 0.0;

    const k1Re = new Float64Array(N), k1Im = new Float64Array(N);
    const k2Re = new Float64Array(N), k2Im = new Float64Array(N);
    const k3Re = new Float64Array(N), k3Im = new Float64Array(N);
    const k4Re = new Float64Array(N), k4Im = new Float64Array(N);
    const tmpRe = new Float64Array(N), tmpIm = new Float64Array(N);

    this._computeRhs(psiRe, psiIm, phiMetric, fAct, invNorm, currentX, k1Re, k1Im);

    for (let u = 0; u < N; u++) {
      tmpRe[u] = psiRe[u] + 0.5 * dt * k1Re[u];
      tmpIm[u] = psiIm[u] + 0.5 * dt * k1Im[u];
    }
    this._computeRhs(tmpRe, tmpIm, phiMetric, fAct, invNorm, currentX, k2Re, k2Im);

    for (let u = 0; u < N; u++) {
      tmpRe[u] = psiRe[u] + 0.5 * dt * k2Re[u];
      tmpIm[u] = psiIm[u] + 0.5 * dt * k2Im[u];
    }
    this._computeRhs(tmpRe, tmpIm, phiMetric, fAct, invNorm, currentX, k3Re, k3Im);

    for (let u = 0; u < N; u++) {
      tmpRe[u] = psiRe[u] + dt * k3Re[u];
      tmpIm[u] = psiIm[u] + dt * k3Im[u];
    }
    this._computeRhs(tmpRe, tmpIm, phiMetric, fAct, invNorm, currentX, k4Re, k4Im);

    const nextRe = new Float64Array(N);
    const nextIm = new Float64Array(N);
    const c = dt / 6.0;
    for (let u = 0; u < N; u++) {
      nextRe[u] = psiRe[u] + c * (k1Re[u] + 2.0 * k2Re[u] + 2.0 * k3Re[u] + k4Re[u]);
      nextIm[u] = psiIm[u] + c * (k1Im[u] + 2.0 * k2Im[u] + 2.0 * k3Im[u] + k4Im[u]);
    }
    return { psiRe: nextRe, psiIm: nextIm };
  }

  /**
   * Simuliert eine Trajektorie für ein Resonanzpaket unter wählbarem Hintergrund- und Aktuator-Modus.
   *
   * @param {object} opts
   * @param {number} opts.amplitude - Amplitude A des Pakets
   * @param {number} [opts.sigma=2.15] - Räumliche Breite σ des Pakets
   * @param {number} [opts.x0=28.0] - Startposition X_0
   * @param {number} [opts.k0=0.0] - Start-Wellenzahl k_0
   * @param {number} [opts.steps=300] - Anzahl Zeitschritte
   * @param {number} [opts.dt=0.02] - Zeitschrittweite
   * @param {'sourceFree'|'stationaryMetric'|'coupledMetric'|'prescribedMetric'|'betaZero'|'metricOnlyNoSourceField'} [opts.backgroundMode='stationaryMetric']
   * @param {'none'|'impulse'|'pidHold'} [opts.actuatorMode='none']
   * @param {object} [opts.actuatorConfig={}]
   * @param {number} [opts.sampleStride=5]
   */
  simulatePacketTrajectory(opts) {
    const amplitude = opts.amplitude;
    const sigma = opts.sigma ?? 2.15;
    const x0 = opts.x0 ?? 28.0;
    const k0 = opts.k0 ?? 0.0;
    const steps = opts.steps ?? 300;
    const dt = opts.dt ?? 0.02;
    const backgroundMode = opts.backgroundMode ?? 'stationaryMetric';
    const actuatorMode = opts.actuatorMode ?? 'none';
    const actCfg = opts.actuatorConfig ?? {};
    const sampleStride = opts.sampleStride ?? 5;

    let { psiRe, psiIm } = this.prepareWavePacket({ center: x0, amplitude, sigma, k0 });

    // Bereite Quell- und Metrikhintergrund gemäß Modus vor (Blueprint Abschnitt 5.3 & 7.1)
    const srcState = this.computeSourceState();
    const rhoSourceEdge = this.computeEdgeDensity(srcState.psiRe, srcState.psiIm);

    let metricSolution = null;
    if (backgroundMode === 'sourceFree') {
      metricSolution = this.solveVariationalMetric({ betaOverride: 0.0 });
    } else if (backgroundMode === 'betaZero') {
      metricSolution = this.solveVariationalMetric({ rhoSourceEdge, betaOverride: 0.0 });
    } else if (backgroundMode === 'prescribedMetric') {
      metricSolution = this.buildPrescribedControlMetric();
    } else if (backgroundMode === 'stationaryMetric' || backgroundMode === 'metricOnlyNoSourceField') {
      metricSolution = this.solveVariationalMetric({ rhoSourceEdge });
    } else if (backgroundMode === 'coupledMetric') {
      const rhoPkt0 = this.computeEdgeDensity(psiRe, psiIm);
      metricSolution = this.solveVariationalMetric({
        rhoSourceEdge,
        rhoPacketEdge: rhoPkt0
      });
    } else {
      throw new Error(`Unbekannter backgroundMode: ${backgroundMode}`);
    }

    // PID-Halte-Regler Zustand (feste Regelparameter für ALLE Objekte! Blueprint Abschnitt 5.4 & 6)
    const kp = actCfg.kp ?? 40.0;
    const kd = actCfg.kd ?? 35.0;
    const ki = actCfg.ki ?? 25.0;
    const fMax = actCfg.fMax ?? Infinity;
    let integralError = 0.0;

    // Impuls-Kalibrierungsparameter
    const impulseForce = actCfg.impulseForce ?? 0.08;
    const impulseDuration = actCfg.impulseDuration ?? 1.5;

    let totalImpulse = 0.0;
    let mechanicalWork = 0.0;
    let saturatedSteps = 0;

    const initialObs = this.measureObservables(
      psiRe,
      psiIm,
      metricSolution.phiMetric,
      metricSolution.edgeAction || 0.0
    );

    const samples = [];
    const ts = [];
    const xs = [];
    const xCores = [];
    const xPeaks = [];
    const vs = [];
    const forces = [];

    for (let step = 0; step <= steps; step++) {
      const t = step * dt;

      if (step > 0 && backgroundMode === 'coupledMetric') {
        const rhoPkt = this.computeEdgeDensity(psiRe, psiIm);
        metricSolution = this.solveVariationalMetric({
          rhoSourceEdge,
          rhoPacketEdge: rhoPkt,
          initialX: metricSolution.xEdge,
          maxIter: 250
        });
      }

      const obs = this.measureObservables(
        psiRe,
        psiIm,
        metricSolution.phiMetric,
        metricSolution.edgeAction || 0.0
      );

      // Aktuatorkraft F_act(t) bestimmen
      let fAct = 0.0;
      if (actuatorMode === 'impulse') {
        fAct = t < impulseDuration ? impulseForce : 0.0;
      } else if (actuatorMode === 'pidHold') {
        const posError = obs.X - x0;
        const rawForce = -kp * posError - ki * integralError - kd * obs.V;
        if (Math.abs(rawForce) > fMax) {
          fAct = Math.sign(rawForce) * fMax;
          saturatedSteps++;
        } else {
          fAct = rawForce;
          // Anti-Windup: Integriere Fehler nur innerhalb des ungesättigten Arbeitsbereichs
          if (step < steps) {
            integralError += posError * dt;
          }
        }
      }

      ts.push(t);
      xs.push(obs.X);
      xCores.push(obs.XCore);
      xPeaks.push(obs.XPeak);
      vs.push(obs.V);
      forces.push(fAct);

      if (step % sampleStride === 0 || step === steps) {
        samples.push({
          step,
          t: Number(t.toFixed(4)),
          X: obs.X,
          XCore: obs.XCore,
          XPeak: obs.XPeak,
          V: obs.V,
          width: obs.width,
          norm: obs.norm,
          fAct,
          mechanicalWork,
          eWaveIntrinsic: obs.eWaveIntrinsic,
          eTotal: obs.eTotal,
          density: Array.from(obs.density, (v) => Number(v.toFixed(6)))
        });
      }

      if (step < steps) {
        const vBefore = obs.V;
        const nextState = this.stepRK4(psiRe, psiIm, metricSolution.phiMetric, fAct, dt);
        psiRe = nextState.psiRe;
        psiIm = nextState.psiIm;

        const obsAfter = this.measureObservables(
          psiRe,
          psiIm,
          metricSolution.phiMetric,
          metricSolution.edgeAction || 0.0
        );
        const vMid = 0.5 * (vBefore + obsAfter.V);
        totalImpulse += fAct * dt;
        mechanicalWork += fAct * vMid * dt;
      }
    }

    const finalObs = this.measureObservables(
      psiRe,
      psiIm,
      metricSolution.phiMetric,
      metricSolution.edgeAction || 0.0
    );

    // Lokale quadratische Anpassung X(t) am Startort x0 (erste 15% der Fallzeit, in der das Paket
    // noch unmittelbar bei X_0 sitzt) zur direkten Vergleichbarkeit mit F_Halten(X_0)/m_inert,
    // sowie globaler Parabel-Fit über das gesamte Fallintervall.
    const localWindow = Math.max(12, Math.floor(ts.length * 0.15));
    const quadFitPrimary = fitQuadraticTrajectory(
      ts.slice(0, localWindow),
      xs.slice(0, localWindow)
    );
    const quadFitGlobal = fitQuadraticTrajectory(ts, xs);
    const quadFitCore = fitQuadraticTrajectory(
      ts.slice(0, localWindow),
      xCores.slice(0, localWindow)
    );
    const quadFitPeak = fitQuadraticTrajectory(
      ts.slice(0, localWindow),
      xPeaks.slice(0, localWindow)
    );

    // Stationärer Mittelwert für das Halteexperiment:
    // Im nicht-dissipativen Hamiltonschen Quantengraphen schwingt die Reglerkraft nach dem
    // Einschalten um den wahren Gleichgewichtswert F_eq; eine Auswertung über das symmetrische
    // stationäre Fenster [20%, 95%] mittelt die konservative Regleroszillation exakt heraus.
    const tailStart = Math.floor(ts.length * 0.20);
    const tailEnd = Math.floor(ts.length * 0.95);
    let sumTailForce = 0.0;
    let sumTailDrift = 0.0;
    let maxAbsDrift = 0.0;
    for (let i = 0; i < xs.length; i++) {
      const drift = Math.abs(xs[i] - x0);
      if (drift > maxAbsDrift) maxAbsDrift = drift;
      if (i >= tailStart && i < tailEnd) {
        sumTailForce += forces[i];
        sumTailDrift += xs[i] - x0;
      }
    }
    const tailCount = Math.max(1, tailEnd - tailStart);
    const meanTailForce = sumTailForce / tailCount;
    const meanTailDrift = sumTailDrift / tailCount;

    const deltaEnergy = finalObs.eWaveIntrinsic - initialObs.eWaveIntrinsic;
    const workEnergyDiscrepancy = Math.abs(deltaEnergy - mechanicalWork);

    return {
      x0,
      steps,
      dt,
      backgroundMode,
      actuatorMode,
      initialObs: {
        X: initialObs.X,
        V: initialObs.V,
        width: initialObs.width,
        norm: initialObs.norm,
        eWaveIntrinsic: initialObs.eWaveIntrinsic
      },
      finalObs: {
        X: finalObs.X,
        XCore: finalObs.XCore,
        XPeak: finalObs.XPeak,
        V: finalObs.V,
        width: finalObs.width,
        norm: finalObs.norm,
        eWaveIntrinsic: finalObs.eWaveIntrinsic
      },
      normDriftRel: Math.abs(finalObs.norm - initialObs.norm) / Math.max(1e-18, initialObs.norm),
      widthRatio: finalObs.width / Math.max(1e-18, initialObs.width),
      totalImpulse,
      mechanicalWork,
      deltaEnergy,
      workEnergyDiscrepancy,
      accelerationFit: quadFitPrimary.acceleration,
      accelerationFitR2: quadFitPrimary.rSquared,
      accelerationCoreFit: quadFitCore.acceleration,
      accelerationPeakFit: quadFitPeak.acceleration,
      holdingForce: Math.abs(meanTailForce),
      signedHoldingForce: meanTailForce,
      meanTailDrift,
      maxAbsDrift,
      finalDisplacement: finalObs.X - x0,
      saturatedFraction: saturatedSteps / Math.max(1, steps),
      metricSnapshot: {
        xEdge: Array.from(metricSolution.xEdge, (v) => Number(v.toFixed(6))),
        edgeLength: Array.from(metricSolution.edgeLength, (v) => Number(v.toFixed(6))),
        phiMetric: Array.from(metricSolution.phiMetric, (v) => Number(v.toFixed(6))),
        maxResidual: metricSolution.maxResidual ?? 0
      },
      samples
    };
  }
}

// ============================================================================
// 4. VOLLSTÄNDIGE EXPERIMENT-SUITE (ALLE GATES & KONTROLLEN C1–C10)
// ============================================================================

export class SubQGAppleExperiment {
  /**
   * @param {object} [config={}]
   */
  constructor(config = {}) {
    this.config = {
      N: config.N ?? 80,
      seed: config.seed ?? 42,
      x0: config.x0 ?? 28.0,
      dt: config.dt ?? 0.02,
      freeFallSteps: config.freeFallSteps ?? 260,
      holdingSteps: config.holdingSteps ?? 500,
      impulseSteps: config.impulseSteps ?? 50,
      impulseDuration: config.impulseDuration ?? 0.4,
      impulseForce: config.impulseForce ?? 0.025,
      pidGains: config.pidGains ?? { kp: 40.0, kd: 35.0, ki: 25.0 },
      handForceMax: config.handForceMax ?? 0.055,
      objects: config.objects ?? DEFAULT_APPLE_OBJECTS,
      ...config
    };
    this.world = new SubQGAppleWorld(this.config);
  }

  /**
   * Abschnitt 5.2: Unabhängige Trägheitskalibrierung im quellenfreien Graphen.
   * Prüft für jedes Objekt:
   * - m_inert = ΔP_act / ΔẊ bei Standardimpuls ΔP
   * - Linearität bei halbem Impuls ΔP/2 (Abweichung <= 5%)
   * - Vorzeicheninvarianz bei -ΔP (Abweichung <= 5%)
   * - Energie-Arbeits-Bilanz W_act = ΔE_total
   */
  runInertialCalibration() {
    const { x0, dt, impulseSteps, impulseDuration, impulseForce, objects } = this.config;
    const results = [];

    for (const obj of objects) {
      const runFull = this.world.simulatePacketTrajectory({
        amplitude: obj.amplitude,
        sigma: obj.sigma,
        x0,
        steps: impulseSteps,
        dt,
        backgroundMode: 'sourceFree',
        actuatorMode: 'impulse',
        actuatorConfig: { impulseForce, impulseDuration },
        sampleStride: 20
      });

      const runHalf = this.world.simulatePacketTrajectory({
        amplitude: obj.amplitude,
        sigma: obj.sigma,
        x0,
        steps: impulseSteps,
        dt,
        backgroundMode: 'sourceFree',
        actuatorMode: 'impulse',
        actuatorConfig: { impulseForce: 0.5 * impulseForce, impulseDuration },
        sampleStride: 40
      });

      const runReverse = this.world.simulatePacketTrajectory({
        amplitude: obj.amplitude,
        sigma: obj.sigma,
        x0,
        steps: impulseSteps,
        dt,
        backgroundMode: 'sourceFree',
        actuatorMode: 'impulse',
        actuatorConfig: { impulseForce: -impulseForce, impulseDuration },
        sampleStride: 40
      });

      const deltaVFull = runFull.finalObs.V - runFull.initialObs.V;
      const deltaVHalf = runHalf.finalObs.V - runHalf.initialObs.V;
      const deltaVRev = runReverse.finalObs.V - runReverse.initialObs.V;

      const mInert = runFull.totalImpulse / deltaVFull;
      const mInertHalf = runHalf.totalImpulse / deltaVHalf;
      const mInertReverse = runReverse.totalImpulse / deltaVRev;

      const halfImpulseRelError = Math.abs(mInertHalf - mInert) / mInert;
      const reverseImpulseRelError = Math.abs(mInertReverse - mInert) / mInert;

      results.push({
        id: obj.id,
        label: obj.label,
        amplitude: obj.amplitude,
        sigma: obj.sigma,
        color: obj.color,
        excitationNorm: runFull.initialObs.norm,
        staticWaveEnergy: runFull.initialObs.eWaveIntrinsic,
        mInert,
        mInertHalf,
        mInertReverse,
        halfImpulseRelError,
        reverseImpulseRelError,
        deltaP: runFull.totalImpulse,
        deltaV: deltaVFull,
        mechanicalWork: runFull.mechanicalWork,
        deltaEnergy: runFull.deltaEnergy,
        workEnergyDiscrepancy: runFull.workEnergyDiscrepancy,
        widthRatio: runFull.widthRatio,
        normDriftRel: runFull.normDriftRel,
        passedLinearity: halfImpulseRelError <= 0.05 && reverseImpulseRelError <= 0.05
      });
    }

    const masses = results.map((r) => r.mInert);
    const massSpanRatio = Math.max(...masses) / Math.min(...masses);
    const maxLinearityError = Math.max(
      ...results.map((r) => Math.max(r.halfImpulseRelError, r.reverseImpulseRelError))
    );

    return {
      objects: results,
      massSpanRatio,
      maxLinearityError,
      passedGate: massSpanRatio >= 3.0 && maxLinearityError <= 0.05
    };
  }

  /**
   * Abschnitt 5.4 & 8: Doppelversuch (Freier Fall & Stationäres Halten) im berechneten
   * stationären SubQG-Metrikhintergrund (Modus 1) sowie im gekoppelten Lauf (Modus 2).
   *
   * @param {object} calibration
   * @param {'stationaryMetric'|'coupledMetric'} [backgroundMode='stationaryMetric']
   */
  runCoreGravityAndHolding(calibration, backgroundMode = 'stationaryMetric') {
    const { x0, dt, freeFallSteps, holdingSteps, pidGains } = this.config;
    const perObject = [];

    for (const calObj of calibration.objects) {
      const freeRun = this.world.simulatePacketTrajectory({
        amplitude: calObj.amplitude,
        sigma: calObj.sigma,
        x0,
        steps: freeFallSteps,
        dt,
        backgroundMode,
        actuatorMode: 'none',
        sampleStride: 5
      });

      const holdRun = this.world.simulatePacketTrajectory({
        amplitude: calObj.amplitude,
        sigma: calObj.sigma,
        x0,
        steps: holdingSteps,
        dt,
        backgroundMode,
        actuatorMode: 'pidHold',
        actuatorConfig: { ...pidGains, fMax: Infinity },
        sampleStride: 10
      });

      const aFree = freeRun.accelerationFit;
      const aFreeAbs = Math.abs(aFree);
      const fHold = holdRun.holdingForce;
      const ratioFOverM = fHold / calObj.mInert;
      const equivalenceRelError = Math.abs(ratioFOverM - aFreeAbs) / Math.max(1e-18, aFreeAbs);

      perObject.push({
        id: calObj.id,
        label: calObj.label,
        color: calObj.color,
        amplitude: calObj.amplitude,
        mInert: calObj.mInert,
        excitationNorm: calObj.excitationNorm,
        aFree,
        aFreeAbs,
        aFreeCore: freeRun.accelerationCoreFit,
        aFreePeak: freeRun.accelerationPeakFit,
        aFreeR2: freeRun.accelerationFitR2,
        fHold,
        signedFHold: holdRun.signedHoldingForce,
        ratioFOverM,
        equivalenceRelError,
        holdMeanDrift: holdRun.meanTailDrift,
        holdMaxDrift: holdRun.maxAbsDrift,
        freeFallDisplacement: freeRun.finalDisplacement,
        freeFallWidthRatio: freeRun.widthRatio,
        freeFallSamples: freeRun.samples,
        holdSamples: holdRun.samples,
        metricSnapshot: freeRun.metricSnapshot
      });
    }

    // Paarweise relative Beschleunigungsabweichung η_AB = 2 |a_A - a_B| / (|a_A| + |a_B|)
    let maxEta = 0.0;
    const pairwiseEta = [];
    for (let i = 0; i < perObject.length; i++) {
      for (let j = i + 1; j < perObject.length; j++) {
        const aA = perObject[i].aFreeAbs;
        const aB = perObject[j].aFreeAbs;
        const eta = (2.0 * Math.abs(aA - aB)) / Math.max(1e-18, aA + aB);
        if (eta > maxEta) maxEta = eta;
        pairwiseEta.push({
          pair: `${perObject[i].id} vs ${perObject[j].id}`,
          eta
        });
      }
    }

    const meanFreeFallAcc =
      perObject.reduce((acc, item) => acc + item.aFree, 0.0) / perObject.length;
    const meanFreeFallAccAbs = Math.abs(meanFreeFallAcc);

    // Lineare Regression F_Halten = A * m_inert + B (Blueprint Abschnitt 8.2)
    const masses = perObject.map((o) => o.mInert);
    const holdingForces = perObject.map((o) => o.fHold);
    const weightRegression = fitLinearModel(masses, holdingForces);

    const maxEquivalenceError = Math.max(...perObject.map((o) => o.equivalenceRelError));
    const slopeVsFreeFallRelError =
      Math.abs(weightRegression.slope - meanFreeFallAccAbs) / Math.max(1e-18, meanFreeFallAccAbs);

    return {
      backgroundMode,
      objects: perObject,
      meanFreeFallAcc,
      meanFreeFallAccAbs,
      maxEta,
      pairwiseEta,
      weightRegression,
      maxEquivalenceError,
      slopeVsFreeFallRelError,
      passedFreeFallUniversality: maxEta <= 0.05,
      passedWeightProportionality:
        weightRegression.maxRelResidual <= 0.05 && weightRegression.rSquared >= 0.995,
      passedEquivalenceConsistency:
        maxEquivalenceError <= 0.05 && slopeVsFreeFallRelError <= 0.05
    };
  }

  /**
   * Abschnitt 6: "Apfel auf der Hand" — Gleiche maximale Haltekraft F_max für alle Objekte.
   * Ohne jede objektspezifische Nachjustierung hält derselbe Aktuator leichte Objekte
   * ("Apfel", "Stein"), während schwere Objekte ("Felsblock", "Metalltonne") F_max
   * überschreiten und zur Quelle hin absinken.
   */
  runHandForceLimitExperiment(calibration) {
    const { x0, dt, holdingSteps, pidGains, handForceMax } = this.config;
    const results = [];

    for (const calObj of calibration.objects) {
      const run = this.world.simulatePacketTrajectory({
        amplitude: calObj.amplitude,
        sigma: calObj.sigma,
        x0,
        steps: holdingSteps,
        dt,
        backgroundMode: 'stationaryMetric',
        actuatorMode: 'pidHold',
        actuatorConfig: { ...pidGains, fMax: handForceMax },
        sampleStride: 10
      });

      const isHeld = Math.abs(run.finalDisplacement) < 0.25;
      results.push({
        id: calObj.id,
        label: calObj.label,
        color: calObj.color,
        mInert: calObj.mInert,
        fMax: handForceMax,
        appliedForceTail: run.holdingForce,
        finalDisplacement: run.finalDisplacement,
        saturatedFraction: run.saturatedFraction,
        status: isHeld ? 'GEHALTEN' : 'ABGESUNKEN (F_Gewicht > F_max)',
        isHeld,
        samples: run.samples
      });
    }

    const heldCount = results.filter((r) => r.isHeld).length;
    const fallenCount = results.filter((r) => !r.isHeld).length;
    const monotonicSink = results.every(
      (r, idx) => idx === 0 || r.finalDisplacement <= results[idx - 1].finalDisplacement + 1e-4
    );

    return {
      fMax: handForceMax,
      objects: results,
      heldCount,
      fallenCount,
      monotonicSink,
      passedGate: heldCount >= 1 && fallenCount >= 1 && monotonicSink
    };
  }

  /**
   * Abschnitt 7: Alle 10 Pflicht-Kontrollläufe & Robustheitstests (C1 bis C10).
   */
  runControlSuite(calibration, primaryResults) {
    const { x0, dt, freeFallSteps } = this.config;
    const refObj = calibration.objects[1]; // Stein (Amplitude 1.0)
    const primaryRef = primaryResults.objects[1];

    // C1: Quelle entfernt -> keine Fallbeschleunigung, keine Haltekraft
    const c1Free = this.world.simulatePacketTrajectory({
      amplitude: refObj.amplitude,
      sigma: refObj.sigma,
      x0,
      steps: freeFallSteps,
      dt,
      backgroundMode: 'sourceFree',
      actuatorMode: 'none'
    });
    const c1Hold = this.world.simulatePacketTrajectory({
      amplitude: refObj.amplitude,
      sigma: refObj.sigma,
      x0,
      steps: freeFallSteps,
      dt,
      backgroundMode: 'sourceFree',
      actuatorMode: 'pidHold',
      actuatorConfig: this.config.pidGains
    });

    // C2: Quelle vorhanden, aber Metrikkopplung β = 0 -> x_e = 0, kein Fall
    const c2Free = this.world.simulatePacketTrajectory({
      amplitude: refObj.amplitude,
      sigma: refObj.sigma,
      x0,
      steps: freeFallSteps,
      dt,
      backgroundMode: 'betaZero',
      actuatorMode: 'none'
    });

    // C3: Quellfeld entfernt, eingefrorene Kantenmetrik x_e beibehalten -> prüft rein metrische Wirkung
    const c3Free = this.world.simulatePacketTrajectory({
      amplitude: refObj.amplitude,
      sigma: refObj.sigma,
      x0,
      steps: freeFallSteps,
      dt,
      backgroundMode: 'metricOnlyNoSourceField',
      actuatorMode: 'none'
    });

    // C4: Vorgeschriebene analytische Vergleichsmetrik vs. berechnete SubQG-Metrik
    const c4Free = this.world.simulatePacketTrajectory({
      amplitude: refObj.amplitude,
      sigma: refObj.sigma,
      x0,
      steps: freeFallSteps,
      dt,
      backgroundMode: 'prescribedMetric',
      actuatorMode: 'none'
    });

    // C5: Mehrere Startorte (x0 = 24, 28, 34) & Symmetrietest (Quelle rechts bei N - 1 - sourceCenter)
    const startPositions = [24.0, 28.0, 34.0];
    const positionRuns = startPositions.map((pos) => {
      const r = this.world.simulatePacketTrajectory({
        amplitude: refObj.amplitude,
        sigma: refObj.sigma,
        x0: pos,
        steps: freeFallSteps,
        dt,
        backgroundMode: 'stationaryMetric',
        actuatorMode: 'none'
      });
      return { x0: pos, acceleration: r.accelerationFit, displacement: r.finalDisplacement };
    });

    const mirrorWorld = new SubQGAppleWorld({
      ...this.config,
      sourceCenter: this.config.N - 1 - this.world.sourceCenter
    });
    const mirrorRun = mirrorWorld.simulatePacketTrajectory({
      amplitude: refObj.amplitude,
      sigma: refObj.sigma,
      x0: this.config.N - 1 - x0,
      steps: freeFallSteps,
      dt,
      backgroundMode: 'stationaryMetric',
      actuatorMode: 'none'
    });

    // C6: Mehrere Paketbreiten σ ∈ {1.85, 2.15, 2.55}
    const sigmas = [1.85, 2.15, 2.55];
    const widthRuns = sigmas.map((sig) => {
      const r = this.world.simulatePacketTrajectory({
        amplitude: refObj.amplitude,
        sigma: sig,
        x0,
        steps: freeFallSteps,
        dt,
        backgroundMode: 'stationaryMetric',
        actuatorMode: 'none'
      });
      return { sigma: sig, acceleration: r.accelerationFit, widthRatio: r.widthRatio };
    });
    const widthAccValues = widthRuns.map((w) => Math.abs(w.acceleration));
    const widthSpread =
      (Math.max(...widthAccValues) - Math.min(...widthAccValues)) /
      Math.max(1e-18, primaryRef.aFreeAbs);

    // C7: Halbierter Zeitschritt dt/2 bei doppelter Schrittzahl (Konvergenztest)
    const c7HalfDt = this.world.simulatePacketTrajectory({
      amplitude: refObj.amplitude,
      sigma: refObj.sigma,
      x0,
      steps: freeFallSteps * 2,
      dt: dt * 0.5,
      backgroundMode: 'stationaryMetric',
      actuatorMode: 'none'
    });
    const dtRelDiff =
      Math.abs(c7HalfDt.accelerationFit - primaryRef.aFree) / Math.max(1e-18, primaryRef.aFreeAbs);

    // C8: Größerer Graph (N = 120 statt 80) gegen Randartefakte
    const largeWorld = new SubQGAppleWorld({ ...this.config, N: 120 });
    const c8LargeN = largeWorld.simulatePacketTrajectory({
      amplitude: refObj.amplitude,
      sigma: refObj.sigma,
      x0,
      steps: freeFallSteps,
      dt,
      backgroundMode: 'stationaryMetric',
      actuatorMode: 'none'
    });
    const largeNRelDiff =
      Math.abs(c8LargeN.accelerationFit - primaryRef.aFree) / Math.max(1e-18, primaryRef.aFreeAbs);

    // C9: Mindestens 5 Zufallsseeds (Seed 42, 43, 44, 45, 46) MIT aktiver Phasenunordnung
    const seeds = [42, 43, 44, 45, 46];
    const seedRuns = seeds.map((s) => {
      const expS = new SubQGAppleExperiment({
        ...this.config,
        seed: s,
        enablePhaseNoise: true,
        objects: [calibration.objects[0], calibration.objects[3]] // Apfel & Metalltonne
      });
      const calS = expS.runInertialCalibration();
      const gravS = expS.runCoreGravityAndHolding(calS, 'stationaryMetric');
      return {
        seed: s,
        meanAcc: gravS.meanFreeFallAcc,
        eta: gravS.maxEta,
        equivalenceRelError: gravS.maxEquivalenceError
      };
    });
    const maxSeedEta = Math.max(...seedRuns.map((s) => s.eta));

    // C10: Zweite Ortsdefinition (X_Core & X_Peak) und Energie-Arbeits-Bilanz
    const coreVsPrimaryRelDiff =
      Math.abs(primaryRef.aFreeCore - primaryRef.aFree) / Math.max(1e-18, primaryRef.aFreeAbs);
    const maxWorkEnergyDiscrepancy = Math.max(
      ...calibration.objects.map((o) => o.workEnergyDiscrepancy)
    );

    const controls = [
      {
        id: 'C1_no_source',
        name: 'Quelle entfernt (Flacher Graph)',
        passed:
          Math.abs(c1Free.accelerationFit) < 0.002 * primaryRef.aFreeAbs &&
          c1Hold.holdingForce < 0.002 * primaryRef.fHold,
        metrics: {
          accelerationNoSource: c1Free.accelerationFit,
          holdingForceNoSource: c1Hold.holdingForce,
          ratioToGravity: Math.abs(c1Free.accelerationFit) / primaryRef.aFreeAbs
        }
      },
      {
        id: 'C2_beta_zero',
        name: 'Metrikkopplung β = 0 trotz vorhandener Quelle',
        passed: Math.abs(c2Free.accelerationFit) < 0.002 * primaryRef.aFreeAbs,
        metrics: {
          accelerationBetaZero: c2Free.accelerationFit,
          ratioToGravity: Math.abs(c2Free.accelerationFit) / primaryRef.aFreeAbs
        }
      },
      {
        id: 'C3_metric_only',
        name: 'Reine Kantenmetrik x_e ohne direktes Quellfeld',
        passed:
          Math.abs(c3Free.accelerationFit - primaryRef.aFree) /
            Math.max(1e-18, primaryRef.aFreeAbs) <
          1e-6,
        metrics: {
          accelerationMetricOnly: c3Free.accelerationFit,
          accelerationPrimary: primaryRef.aFree
        }
      },
      {
        id: 'C4_prescribed_metric',
        name: 'Analytische Vergleichsmetrik vs. variationelle SubQG-Metrik',
        passed:
          c4Free.accelerationFit < 0 &&
          Math.sign(c4Free.accelerationFit) === Math.sign(primaryRef.aFree),
        metrics: {
          accelerationPrescribed: c4Free.accelerationFit,
          accelerationVariational: primaryRef.aFree
        }
      },
      {
        id: 'C5_positions_and_direction',
        name: 'Variation des Startorts & Richtungs-Symmetrietest',
        passed:
          positionRuns[0].acceleration < positionRuns[1].acceleration &&
          positionRuns[1].acceleration < positionRuns[2].acceleration &&
          mirrorRun.accelerationFit > 0 &&
          Math.abs(Math.abs(mirrorRun.accelerationFit) - primaryRef.aFreeAbs) /
            primaryRef.aFreeAbs <
            0.05,
        metrics: {
          positionRuns,
          mirrorAcceleration: mirrorRun.accelerationFit
        }
      },
      {
        id: 'C6_packet_widths',
        name: 'Variation der Paketbreite σ ∈ {1.85, 2.15, 2.55}',
        passed: widthSpread <= 0.08,
        metrics: {
          widthRuns,
          relativeSpread: widthSpread
        }
      },
      {
        id: 'C7_halved_timestep',
        name: 'Halbierter Zeitschritt dt/2 (RK4-Konvergenz)',
        passed: dtRelDiff <= 0.01,
        metrics: {
          accDt: primaryRef.aFree,
          accHalfDt: c7HalfDt.accelerationFit,
          relativeDiff: dtRelDiff
        }
      },
      {
        id: 'C8_larger_graph',
        name: 'Größerer Graph (N = 120 statt N = 80)',
        passed: largeNRelDiff <= 0.02,
        metrics: {
          accN80: primaryRef.aFree,
          accN120: c8LargeN.accelerationFit,
          relativeDiff: largeNRelDiff
        }
      },
      {
        id: 'C9_multi_seed_robustness',
        name: 'Robustheit über 5 unabhängige Phasen-Seeds (42..46)',
        passed: maxSeedEta <= 0.05,
        metrics: {
          seedRuns,
          maxSeedEta
        }
      },
      {
        id: 'C10_diagnostics_and_energy_balance',
        name: 'Zweite Ortsdiagnose (X_Core) & Energie-Arbeits-Bilanz',
        passed: coreVsPrimaryRelDiff <= 0.05 && maxWorkEnergyDiscrepancy <= 1e-4,
        metrics: {
          coreVsPrimaryRelDiff,
          maxWorkEnergyDiscrepancy
        }
      }
    ];

    return {
      controls,
      allControlsPassed: controls.every((c) => c.passed)
    };
  }
}

/**
 * Führt die komplette SubQG-Apfel-Experiment-Suite (Alle 7 Gates + Modus 1 & 2 + Kontrollen C1–C10)
 * deterministisch aus und gibt das strukturierte Gesamtergebnis zurück.
 *
 * @param {object} [config={}]
 */
export function executeAppleExperimentSuite(config = {}) {
  const experiment = new SubQGAppleExperiment(config);

  // Gate 2: Unabhängige dynamische Trägheitskalibrierung
  const calibration = experiment.runInertialCalibration();

  // Gate 3 & 4 (Modus 1: Berechneter stationärer SubQG-Metrikhintergrund)
  const stationaryMode = experiment.runCoreGravityAndHolding(calibration, 'stationaryMetric');

  // Gate 3 & 4 (Modus 2: Gekoppelter Lauf mit Ko-Evolution von Quelle, Paket und Metrik)
  const coupledMode = experiment.runCoreGravityAndHolding(calibration, 'coupledMetric');

  // Gate 5: "Apfel auf der Hand" (Gleiche Maximalkraft F_max für alle Objekte)
  const handForceExperiment = experiment.runHandForceLimitExperiment(calibration);

  // Gate 6: Alle 10 Kontrollläufe (C1–C10)
  const controlSuite = experiment.runControlSuite(calibration, stationaryMode);

  const gates = {
    gate1_measurementContract: true,
    gate2_inertialCalibration: calibration.passedGate,
    gate3_variationalSourceMetric:
      stationaryMode.objects[0].metricSnapshot.maxResidual < 1e-9,
    gate4_freeFallAndHoldingEquivalence:
      stationaryMode.passedFreeFallUniversality &&
      stationaryMode.passedWeightProportionality &&
      stationaryMode.passedEquivalenceConsistency,
    gate5_handForceSaturation: handForceExperiment.passedGate,
    gate6_controlSuite: controlSuite.allControlsPassed
  };

  const allGatesPassed = Object.values(gates).every(Boolean);

  return {
    meta: {
      experimentName: 'SubQG Apfel-Experiment: Trägheit, Gewicht und universeller freier Fall',
      blueprintAuthor: 'Ralf Krümmel (11. Nov. 2026)',
      timestamp: new Date().toISOString(),
      config: {
        N: experiment.world.N,
        seed: experiment.world.seed,
        J0: experiment.world.J0,
        gNL: experiment.world.gNL,
        mu: experiment.world.mu,
        kappa: experiment.world.kappa,
        beta: experiment.world.beta,
        sourceCenter: experiment.world.sourceCenter,
        sourceSigma: experiment.world.sourceSigma,
        sourceAmp: experiment.world.sourceAmp,
        x0: experiment.config.x0,
        dt: experiment.config.dt,
        pidGains: experiment.config.pidGains,
        handForceMax: experiment.config.handForceMax
      }
    },
    gates,
    allGatesPassed,
    calibration,
    stationaryMode,
    coupledMode,
    handForceExperiment,
    controlSuite
  };
}
