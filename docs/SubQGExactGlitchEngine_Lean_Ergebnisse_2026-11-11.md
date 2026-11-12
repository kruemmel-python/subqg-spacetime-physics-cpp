# CodeDump for Project: `SubQGExactGlitchEngine_Lean_Ergebnisse_2026-11-11.zip`

_Generated on 2026-11-11T17:28:59.719Z_

No LLM call was made. Token/cost values are offline estimates only.

LLM Code Review Mode is enabled: generated/vendor/report/lockfile noise is filtered across languages.

## Repository Map

```text
.
└── SubQGExactGlitchEngine_Lean_Ergebnisse_2026-11-11/
    ├── formal/
    │   ├── README.md
    │   ├── SubQGDerivation.lean
    │   ├── VERIFICATION_RESULT.md
    │   └── verify.ps1
    ├── src/
    │   └── modules/
    │       └── subqg_exact_glitch_tunneling.mjs
    ├── tests/
    │   └── exact_glitch_tunneling.test.mjs
    └── package.json
```

## File: `SubQGExactGlitchEngine_Lean_Ergebnisse_2026-11-11/formal/README.md`  
- Path: `SubQGExactGlitchEngine_Lean_Ergebnisse_2026-11-11/formal/README.md`  
- Size: 6020 Bytes  
- Modified: 2026-11-11 18:26:14 UTC

```markdown
# Formale SubQG-Herleitung in Lean 4

Diese Formalisierung bildet den mathematischen Kern der vorhandenen JavaScript-Implementierung ab. Sie ist keine nachträgliche Behauptung, dass die Modellannahmen Naturgesetze seien. Lean prüft, welche Folgerungen **unter den ausdrücklich genannten Voraussetzungen** aus dem Modellansatz entstehen.

## Bezug zum implementierten Modell

Die formale Datei [`SubQGDerivation.lean`](./SubQGDerivation.lean) entspricht folgenden Projektteilen:

| Lean-Komponente | JavaScript-Quelle | Bedeutung |
|---|---|---|
| `FiniteWeightedGraph` | `subqg_microaction.mjs`, `subqg_apple_experiment.mjs` | Endliche Knoten, gewichtete Kanten und Nachbarschaften im Kantengraphen |
| `edgeAction` | `SubQGAppleWorld.solveVariationalMetric` | Quadratische Kantenwirkung mit Anker-, Glättungs- und Materiekopplung |
| `firstVariation` / `IsStationary` | Residuum in `solveVariationalMetric` | Euler–Lagrange-Gleichung `(μI+κL_edge)x=-β(w⊙ρ)` |
| `nodeMetricPotential` | `phiMetric` | `Φ_metric(u)=β/2 ∑_{e∋u} w_e x_e` |
| `metricForce` | Ehrenfest-/Schwerpunktinterpretation | Normgewichtete Kraft aus dem diskreten Potentialgradienten |
| `motionStep` | Trajektorienentwicklung | Expliziter diskreter Bewegungsschritt des Paketzentrums |
| `compactGlitchBump` / `bridge_closed_outside` | `SubQGExactGlitchEngine.computeGlitchCoupling` | Glattes Fenster mit exakt kompaktem Träger und exakt geschlossener Brücke außerhalb des Zeitfensters |
| `overlapWeight` / `tunnelCoupling` | `wAB`, `gTunnel` | Quadratischer Überlapp `sin2(ε)` und reelle Tunnelkopplung `J_tunnel w_AB` |
| `symmetric_coupling_preserves_total_norm_rate` | `_computeBlockRhs` | Algebraische Aufhebung der symmetrischen A↔B-Kopplung in der Gesamtnormrate |
| `blockCouplingEnergy_parameter_change` | `computeBlockHamiltonianEnergies`, `glitchPower` | Exakte partielle Energieänderung `ΔE_cross=2 Δg Re⟨A|B⟩` bei festgehaltenem Zustand |

## Formal bewiesene Aussagen

Lean 4 prüft insbesondere:

1. Die exakte algebraische Entwicklung `S(x+t h)` der Kantenwirkung.
2. Die schwache Stationaritätsgleichung für jede Variation `h`.
3. Jede stationäre Lösung ist bei `μ≥0`, `κ≥0` und nichtnegativen Paargewichten ein globales Minimum der Wirkung.
4. Die Stationaritätsgleichung liefert eine exakte Energiebilanz zwischen Anker-, Glättungs- und Quellterm.
5. Ist der diskrete Potentialgradient über dem Objektpaket konstant und die Paketnorm ungleich null, kürzt sich die Norm aus Kraft durch Trägheit heraus. Die Beschleunigung ist dann unabhängig von der Paketnorm.
6. Unter derselben Konstantfeldannahme ist die benötigte Haltekraft proportional zur Paketnorm beziehungsweise zur im Modell so definierten trägen Masse.
7. Der diskrete Bewegungsschritt verwendet genau die formal hergeleitete Beschleunigung.
8. Außerhalb `|(t-t_mid)/tau|<1` sind Bump, Winkel, Überlapp, Tunnelkopplung und metrische Kreuzquelle exakt null; in der Fenstermitte gilt exakt `w_AB=sin2(epsilonMax)`.
9. Die reelle Off-Diagonal-Kopplung ist zwischen A und B symmetrisch. Ihre Beiträge zur momentanen Ableitung von `N_A+N_B` heben sich exakt auf. Erhalten auch die beiden ungekoppelten Sektoren jeweils ihre Norm, ist die Gesamtnormrate exakt null.
10. Für eine Parameteränderung `g → g+Δg` bei festgehaltenem Zustand gilt exakt `ΔE_cross=2 Δg Re⟨Ψ_A|Ψ_B⟩`. Dies ist die algebraische Grundlage des im Programm verwendeten Leistungsterms.

## Sichtbare Voraussetzungen

Die zentralen Voraussetzungen werden nicht versteckt:

- Graph, Kanten- und Interaktionsmengen sind endlich.
- Kanten- und Paargewichte sind nichtnegativ.
- Für den Minimalsatz gelten `μ≥0` und `κ≥0`.
- Die Kantenwirkung ist der im Projekt ausdrücklich postulierte Modellansatz.
- Für die Universalität des freien Falls ist der Potentialgradient über dem Träger des Pakets konstant.
- Die Paketnorm ist ungleich null und wird als träge Masse des normierten Modells verwendet.
- Die Glitch-Halbbreite `tau` ist strikt positiv.
- Der Normerhaltungssatz setzt voraus, dass die ungekoppelten Sektoren ihre jeweilige Norm erhalten; Lean beweist dann die exakte Aufhebung aller zusätzlich eingeführten symmetrischen Kreuzterme.

Ein lokales negatives `x_e` für jede einzelne quellnahe Kante folgt ohne zusätzliche Voraussetzungen noch nicht allein aus positiver Definitheit. Dafür wäre beispielsweise ein Positivitäts-/M-Matrix-Satz für den konkreten eindimensionalen Operator nötig. Die JavaScript-Simulation beobachtet die Kontraktion numerisch; diese Lean-Datei behauptet sie nicht ohne den noch fehlenden Operatorbeweis.

Ebenso formalisiert diese Stufe die Schwerpunktbewegung als diskretes Kraftgesetz und den exakten Glitch auf Ebene der zugrunde liegenden Differentialgleichung. RK4 ist ein numerisches Integrationsverfahren und im Allgemeinen nicht exakt unitär. Deshalb behauptet Lean **keine exakte Normerhaltung jedes endlichen RK4-Schritts**. Der JavaScript-Test prüft stattdessen den tatsächlich auftretenden numerischen Normdrift gegen `10−6`. Eine vollständige Fehlerabschätzung für den nichtlinearen RK4-Lauf wäre ein eigener Beweisbaustein.

Der Satz zur Glitch-Arbeit beweist die partielle Energieänderung durch den expliziten Kopplungsparameter bei festgehaltenem Zustand. Die vollständige zeitabhängige Bilanz entlang einer Lösung benötigt zusätzlich die Schrödinger-Dynamik, Differenzierbarkeit und Selbstadjungiertheit der intrinsischen Hamiltonoperatoren. Diese Voraussetzungen werden in der Engine konstruktiv verwendet und numerisch geprüft, sind hier aber noch nicht als vollständiger Analysis-Satz formalisiert.

## Verifikation

Im Verzeichnis `developer` ausführen:

```powershell
npm run verify:lean
```

Der Lauf ist nur erfolgreich, wenn:

- `lean.exe` mit Exitcode 0 endet,
- keine Compilerfehler auftreten,
- kein `sorry`, `admit` oder `sorryAx` gemeldet wird.

`#print axioms` dokumentiert für die zentralen Sätze die verwendete Vertrauensbasis.

```

## File: `SubQGExactGlitchEngine_Lean_Ergebnisse_2026-11-11/package.json`  
- Path: `SubQGExactGlitchEngine_Lean_Ergebnisse_2026-11-11/package.json`  
- Size: 848 Bytes  
- Modified: 2026-11-11 18:13:50 UTC

```json
{
  "name": "subqg-core",
  "version": "1.0.0",
  "description": "Subquantum Graphity (SubQG 1.0) - First-principles relational quantum gravity, emergent spacetime & dark-matter-free cosmological dynamics",
  "type": "module",
  "main": "src/index.mjs",
  "types": "src/index.d.ts",
  "scripts": {
    "start": "node src/index.mjs",
    "demo": "node src/index.mjs --demo",
    "audit": "node src/index.mjs --audit",
    "test": "node --test tests/*.test.mjs",
    "verify:lean": "powershell -ExecutionPolicy Bypass -File formal/verify.ps1"
  },
  "keywords": [
    "quantum-gravity",
    "subqg",
    "emergent-spacetime",
    "relational-quantum-mechanics",
    "mond",
    "page-wootters",
    "causal-sets",
    "first-principles"
  ],
  "author": "SubQG Research Collaboration",
  "license": "MIT",
  "engines": {
    "node": ">=20.0.0"
  }
}

```

## File: `SubQGExactGlitchEngine_Lean_Ergebnisse_2026-11-11/src/modules/subqg_exact_glitch_tunneling.mjs`  
- Path: `SubQGExactGlitchEngine_Lean_Ergebnisse_2026-11-11/src/modules/subqg_exact_glitch_tunneling.mjs`  
- Size: 13360 Bytes  
- Modified: 2026-11-11 18:16:44 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript


import { SubQGAppleWorld, createApplePRNG } from './subqg_apple_experiment.mjs';

export class SubQGExactGlitchEngine {

  constructor(config = {}) {
    this.N = config.N ?? 80;
    this.seed = config.seed ?? 42;
    this.J0 = config.J0 ?? 1.0;
    this.gNL = config.gNL ?? 0.015;
    this.mu = config.mu ?? 0.08;
    this.kappa = config.kappa ?? 12.0;
    this.beta = config.beta ?? 0.85;

    this.glitchTimeMid = config.glitchTimeMid ?? 2.0;
    this.glitchHalfWidth = config.glitchHalfWidth ?? 0.5;
    this.epsilonMax = config.epsilonMax ?? 0.45;
    this.jTunnel = config.jTunnel ?? 0.75;

    this.worldA = new SubQGAppleWorld({ ...config, N: this.N, seed: this.seed });
    this.worldB = new SubQGAppleWorld({ ...config, N: this.N, seed: this.seed + 100 });
  }

  computeGlitchCoupling(t) {
    const tau = this.glitchHalfWidth;
    const dtGlitch = t - this.glitchTimeMid;
    const s = dtGlitch / tau;

    if (Math.abs(s) >= 1.0) {
      return { epsilon: 0.0, wAB: 0.0, gTunnel: 0.0, dGdt: 0.0, isGlitchActive: false };
    }

    const oneMinusS2 = 1.0 - s * s;
    const bump = Math.exp(1.0 - 1.0 / oneMinusS2);
    const dBump_ds = bump * (-2.0 * s / (oneMinusS2 * oneMinusS2));
    const dBump_dt = dBump_ds / tau;

    const epsilon = this.epsilonMax * bump;
    const dEps_dt = this.epsilonMax * dBump_dt;

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
      isGlitchActive: true
    };
  }

  computeBlockHamiltonianEnergies(psiARe, psiAIm, psiBRe, psiBIm, phiMetricA, phiMetricB, gTunnel) {
    const obsA = this.worldA.measureObservables(psiARe, psiAIm, phiMetricA);
    const obsB = this.worldB.measureObservables(psiBRe, psiBIm, phiMetricB);

    let crossOverlapRe = 0.0;
    for (let u = 0; u < this.N; u++) {
      crossOverlapRe += psiARe[u] * psiBRe[u] + psiAIm[u] * psiBIm[u];
    }
    const eCross = 2.0 * gTunnel * crossOverlapRe;
    const eTotal = obsA.eWaveIntrinsic + obsB.eWaveIntrinsic + eCross;
    const nTotal = obsA.norm + obsB.norm;

    return {
      normA: obsA.norm,
      normB: obsB.norm,
      nTotal,
      eA: obsA.eWaveIntrinsic,
      eB: obsB.eWaveIntrinsic,
      eCross,
      eTotal,
      crossOverlapRe
    };
  }

  simulateGlitchCrossing(opts = {}) {
    const steps = opts.steps ?? 300;
    const dt = opts.dt ?? 0.02;

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
    const rhoB0 = this.worldB.computeEdgeDensity(psiBRe, psiBIm);
    const metB0 = this.worldB.solveVariationalMetric({ rhoSourceEdge: rhoB0 });
    const metA0 = this.worldA.solveVariationalMetric({ betaOverride: 0.0 });

    const initH = this.computeBlockHamiltonianEnergies(
      psiARe, psiAIm, psiBRe, psiBIm,
      metA0.phiMetric, metB0.phiMetric, initGlitch.gTunnel
    );

    const initialTotalNorm = initH.nTotal;
    const initialTotalEnergy = initH.eTotal;

    let integratedGlitchPower = 0.0;
    let peakTunnelCoupling = 0.0;
    let peakCrossForce = 0.0;

    const history = [];

    for (let step = 0; step <= steps; step++) {
      const t = step * dt;
      const glitch = this.computeGlitchCoupling(t);
      if (glitch.wAB > peakTunnelCoupling) peakTunnelCoupling = glitch.wAB;

      const rhoA = this.worldA.computeEdgeDensity(psiARe, psiAIm);
      const rhoB = this.worldB.computeEdgeDensity(psiBRe, psiBIm);

      const effectiveRhoSourceForA = new Float64Array(this.N - 1);
      for (let e = 0; e < this.N - 1; e++) {
        effectiveRhoSourceForA[e] = glitch.wAB * rhoB[e];
      }
      const metA = this.worldA.solveVariationalMetric({
        rhoSourceEdge: effectiveRhoSourceForA,
        rhoPacketEdge: rhoA
      });
      const metB = this.worldB.solveVariationalMetric({ rhoSourceEdge: rhoB });

      const hStats = this.computeBlockHamiltonianEnergies(
        psiARe, psiAIm, psiBRe, psiBIm,
        metA.phiMetric, metB.phiMetric, glitch.gTunnel
      );

      const glitchPower = 2.0 * glitch.dGdt * hStats.crossOverlapRe;

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
        isGlitchActive: glitch.isGlitchActive,
        normA: hStats.normA,
        normB: hStats.normB,
        nTotal: hStats.nTotal,
        eA: hStats.eA,
        eB: hStats.eB,
        eCross: hStats.eCross,
        eTotal: hStats.eTotal,
        glitchPower,
        integratedGlitchPower,
        crossAcc
      });

      if (step < steps) {

        const nextState = this._stepBlockRK4(
          psiARe, psiAIm, psiBRe, psiBIm,
          metA.phiMetric, metB.phiMetric,
          glitch.gTunnel, dt
        );
        psiARe = nextState.psiARe;
        psiAIm = nextState.psiAIm;
        psiBRe = nextState.psiBRe;
        psiBIm = nextState.psiBIm;

        integratedGlitchPower += glitchPower * dt;
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
      energyWorkDiscrepancy,
      isEnergyWorkBalanced: energyWorkDiscrepancy < 0.05,

      peakTunnelCoupling,
      peakCrossForce,
      finalNormInA: finalH.normA,
      glitchProducedTunneling: finalH.normA > 1e-4,
      history
    };
  }

  _computeBlockRhs(psiARe, psiAIm, psiBRe, psiBIm, phiA, phiB, gTunnel, outDARe, outDAIm, outDBRe, outDBIm) {
    const N = this.N;
    const J0 = this.J0;
    const gNL = this.gNL;

    for (let u = 0; u < N; u++) {

      let lapARe = 0.0, lapAIm = 0.0;
      if (u > 0) { lapARe += psiARe[u] - psiARe[u - 1]; lapAIm += psiAIm[u] - psiAIm[u - 1]; }
      if (u + 1 < N) { lapARe += psiARe[u] - psiARe[u + 1]; lapAIm += psiAIm[u] - psiAIm[u + 1]; }
      const rhoA = psiARe[u] * psiARe[u] + psiAIm[u] * psiAIm[u];
      const vEffA = -gNL * rhoA + phiA[u];

      const hARe = J0 * lapARe + vEffA * psiARe[u] + gTunnel * psiBRe[u];
      const hAIm = J0 * lapAIm + vEffA * psiAIm[u] + gTunnel * psiBIm[u];
      outDARe[u] = hAIm;
      outDAIm[u] = -hARe;

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

  _stepBlockRK4(psiARe, psiAIm, psiBRe, psiBIm, phiA, phiB, gTunnel, dt) {
    const N = this.N;
    const k1ARe = new Float64Array(N), k1AIm = new Float64Array(N);
    const k1BRe = new Float64Array(N), k1BIm = new Float64Array(N);
    const k2ARe = new Float64Array(N), k2AIm = new Float64Array(N);
    const k2BRe = new Float64Array(N), k2BIm = new Float64Array(N);
    const k3ARe = new Float64Array(N), k3AIm = new Float64Array(N);
    const k3BRe = new Float64Array(N), k3BIm = new Float64Array(N);
    const k4ARe = new Float64Array(N), k4AIm = new Float64Array(N);
    const k4BRe = new Float64Array(N), k4BIm = new Float64Array(N);

    const tmpARe = new Float64Array(N), tmpAIm = new Float64Array(N);
    const tmpBRe = new Float64Array(N), tmpBIm = new Float64Array(N);

    this._computeBlockRhs(psiARe, psiAIm, psiBRe, psiBIm, phiA, phiB, gTunnel, k1ARe, k1AIm, k1BRe, k1BIm);

    for (let u = 0; u < N; u++) {
      tmpARe[u] = psiARe[u] + 0.5 * dt * k1ARe[u];
      tmpAIm[u] = psiAIm[u] + 0.5 * dt * k1AIm[u];
      tmpBRe[u] = psiBRe[u] + 0.5 * dt * k1BRe[u];
      tmpBIm[u] = psiBIm[u] + 0.5 * dt * k1BIm[u];
    }
    this._computeBlockRhs(tmpARe, tmpAIm, tmpBRe, tmpBIm, phiA, phiB, gTunnel, k2ARe, k2AIm, k2BRe, k2BIm);

    for (let u = 0; u < N; u++) {
      tmpARe[u] = psiARe[u] + 0.5 * dt * k2ARe[u];
      tmpAIm[u] = psiAIm[u] + 0.5 * dt * k2AIm[u];
      tmpBRe[u] = psiBRe[u] + 0.5 * dt * k2BRe[u];
      tmpBIm[u] = psiBIm[u] + 0.5 * dt * k2BIm[u];
    }
    this._computeBlockRhs(tmpARe, tmpAIm, tmpBRe, tmpBIm, phiA, phiB, gTunnel, k3ARe, k3AIm, k3BRe, k3BIm);

    for (let u = 0; u < N; u++) {
      tmpARe[u] = psiARe[u] + dt * k3ARe[u];
      tmpAIm[u] = psiAIm[u] + dt * k3AIm[u];
      tmpBRe[u] = psiBRe[u] + dt * k3BRe[u];
      tmpBIm[u] = psiBIm[u] + dt * k3BIm[u];
    }
    this._computeBlockRhs(tmpARe, tmpAIm, tmpBRe, tmpBIm, phiA, phiB, gTunnel, k4ARe, k4AIm, k4BRe, k4BIm);

    const nextARe = new Float64Array(N), nextAIm = new Float64Array(N);
    const nextBRe = new Float64Array(N), nextBIm = new Float64Array(N);
    const c = dt / 6.0;

    for (let u = 0; u < N; u++) {
      nextARe[u] = psiARe[u] + c * (k1ARe[u] + 2.0 * k2ARe[u] + 2.0 * k3ARe[u] + k4ARe[u]);
      nextAIm[u] = psiAIm[u] + c * (k1AIm[u] + 2.0 * k2AIm[u] + 2.0 * k3AIm[u] + k4AIm[u]);
      nextBRe[u] = psiBRe[u] + c * (k1BRe[u] + 2.0 * k2BRe[u] + 2.0 * k3BRe[u] + k4BRe[u]);
      nextBIm[u] = psiBIm[u] + c * (k1BIm[u] + 2.0 * k2BIm[u] + 2.0 * k3BIm[u] + k4BIm[u]);
    }

    return { psiARe: nextARe, psiAIm: nextAIm, psiBRe: nextBRe, psiBIm: nextBIm };
  }
}

```

## File: `SubQGExactGlitchEngine_Lean_Ergebnisse_2026-11-11/tests/exact_glitch_tunneling.test.mjs`  
- Path: `SubQGExactGlitchEngine_Lean_Ergebnisse_2026-11-11/tests/exact_glitch_tunneling.test.mjs`  
- Size: 2850 Bytes  
- Modified: 2026-11-11 18:17:04 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript


import test from 'node:test';
import assert from 'node:assert/strict';
import { SubQGExactGlitchEngine } from '../src/modules/subqg_exact_glitch_tunneling.mjs';

test('SubQG Exact Glitch: Verschwindende Ausgangskopplung und kompakter Träger', () => {
  const engine = new SubQGExactGlitchEngine({ glitchTimeMid: 2.0, glitchHalfWidth: 0.5 });

  const cBefore = engine.computeGlitchCoupling(1.0);
  assert.equal(cBefore.isGlitchActive, false);
  assert.equal(cBefore.wAB, 0.0);
  assert.equal(cBefore.epsilon, 0.0);
  assert.equal(cBefore.gTunnel, 0.0);

  const cEdge = engine.computeGlitchCoupling(1.5);
  assert.equal(cEdge.isGlitchActive, false);
  assert.equal(cEdge.wAB, 0.0);

  const cPeak = engine.computeGlitchCoupling(2.0);
  assert.equal(cPeak.isGlitchActive, true);
  assert.ok(cPeak.wAB > 0.15, `w_AB im Peak: ${cPeak.wAB}`);
  const expectedWAB = Math.pow(Math.sin(engine.epsilonMax), 2);
  assert.ok(Math.abs(cPeak.wAB - expectedWAB) < 1e-9, 'w_AB entspricht exakt sin^2(epsilon_max)');

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

  assert.equal(res.isTotalNormConserved, true);
  assert.ok(res.totalNormDriftRel < 1e-6, `Relativer Normdrift < 1e-6: ${res.totalNormDriftRel}`);

  assert.equal(res.glitchProducedTunneling, true);
  assert.ok(res.finalNormInA > 0.01, `Übertragene Norm in A: ${res.finalNormInA}`);

  assert.ok(res.peakCrossForce > 0.001, `Transiente Kreuzbeschleunigung: ${res.peakCrossForce}`);
});

```

## File: `SubQGExactGlitchEngine_Lean_Ergebnisse_2026-11-11/formal/SubQGDerivation.lean`  
- Path: `SubQGExactGlitchEngine_Lean_Ergebnisse_2026-11-11/formal/SubQGDerivation.lean`  
- Size: 17358 Bytes  
- Modified: 2026-11-11 18:26:50 UTC

```
import Mathlib.Basic.Real.Basic
import Mathlib.Algebra.BigOperators.Ring.Finset
import Mathlib.Analysis.SpecialFunctions.Exp
import Mathlib.Analysis.SpecialFunctions.Trigonometric.Basic
import Mathlib.Tactic.FieldSimp
import Mathlib.Tactic.Linarith
import Mathlib.Tactic.NormNum
import Mathlib.Tactic.Positivity
import Mathlib.Tactic.Ring

/-!
# Formal SubQG edge-action derivation

This file formalizes the mathematical core used by
`src/modules/subqg_microaction.mjs` and
`src/modules/subqg_apple_experiment.mjs`:

1. a finite weighted graph;
2. the quadratic edge action;
3. its weak stationarity equation;
4. the stationary-minimum consequence;
5. the node metric potential;
6. norm-weighted object force and discrete motion;
7. the exact compact-support glitch window and symmetric two-sector coupling.

The action is an explicit model ansatz.  Lean proves consequences of the
stated ansatz and assumptions; it does not assert that the ansatz is a law of
nature.
-/

set_option autoImplicit false

open scoped BigOperators

namespace SubQG

noncomputable section

/--
A finite graph with weighted edges and a finite list of interacting edge
pairs.  `Pair` represents the line-graph adjacency used by the JavaScript
metric solver.  Each pair occurs once, matching the implementation's
`e ~ f` sum.
-/
structure FiniteWeightedGraph
    (Vertex Edge Pair : Type)
    [Fintype Vertex] [Fintype Edge] [Fintype Pair] where
  edgeSrc : Edge → Vertex
  edgeDst : Edge → Vertex
  edgeWeight : Edge → R
  edgeWeight_nonneg : ∀ e, 0 ≤ edgeWeight e
  pairLeft : Pair → Edge
  pairRight : Pair → Edge
  pairWeight : Pair → R
  pairWeight_nonneg : ∀ p, 0 ≤ pairWeight p

section EdgeAction

variable
  {Vertex Edge Pair : Type}
  [Fintype Vertex] [Fintype Edge] [Fintype Pair]
  (G : FiniteWeightedGraph Vertex Edge Pair)

/--
The implemented edge action

`S(x) = μ/2 ∑ xe2 + κ/2 ∑ cp(x_left(p)-x_right(p))2
        + β ∑ we ρe xe`.
-/
def edgeAction
    (μ κ β : R) (ρ x : Edge → R) : R :=
  (∑ e : Edge, ((μ / 2) * (x e)^2 + β * G.edgeWeight e * ρ e * x e)) +
  ∑ p : Pair, (κ / 2) * G.pairWeight p *
    (x (G.pairLeft p) - x (G.pairRight p))^2

/-- Coefficient of `t` in `S(x+t h)-S(x)`. -/
def firstVariation
    (μ κ β : R) (ρ x h : Edge → R) : R :=
  (∑ e : Edge, (μ * x e * h e + β * G.edgeWeight e * ρ e * h e)) +
  ∑ p : Pair, κ * G.pairWeight p *
    (x (G.pairLeft p) - x (G.pairRight p)) *
    (h (G.pairLeft p) - h (G.pairRight p))

/-- Quadratic remainder in the variation of the action. -/
def quadraticRemainder
    (μ κ : R) (h : Edge → R) : R :=
  (∑ e : Edge, (μ / 2) * (h e)^2) +
  ∑ p : Pair, (κ / 2) * G.pairWeight p *
    (h (G.pairLeft p) - h (G.pairRight p))^2

/--
Exact finite-dimensional expansion of the action along an arbitrary
variation.  This is the algebraic replacement for an informal derivative.
-/
theorem edgeAction_along_variation
    (μ κ β t : R) (ρ x h : Edge → R) :
    edgeAction G μ κ β ρ (fun e => x e + t * h e) =
      edgeAction G μ κ β ρ x +
      t * firstVariation G μ κ β ρ x h +
      t^2 * quadraticRemainder G μ κ h := by
  classical
  have hedge :
      (∑ e : Edge,
        ((μ / 2) * (x e + t * h e)^2 +
          β * G.edgeWeight e * ρ e * (x e + t * h e))) =
        (∑ e : Edge, ((μ / 2) * (x e)^2 + β * G.edgeWeight e * ρ e * x e)) +
        t * (∑ e : Edge, (μ * x e * h e + β * G.edgeWeight e * ρ e * h e)) +
        t^2 * (∑ e : Edge, (μ / 2) * (h e)^2) := by
    rw [Finset.mul_sum, Finset.mul_sum]
    rw [← Finset.sum_add_distrib, ← Finset.sum_add_distrib]
    apply Finset.sum_congr rfl
    intro e _
    ring
  have hpairs :
      (∑ p : Pair, (κ / 2) * G.pairWeight p *
        ((x (G.pairLeft p) + t * h (G.pairLeft p)) -
          (x (G.pairRight p) + t * h (G.pairRight p)))^2) =
        (∑ p : Pair, (κ / 2) * G.pairWeight p *
          (x (G.pairLeft p) - x (G.pairRight p))^2) +
        t * (∑ p : Pair, κ * G.pairWeight p *
          (x (G.pairLeft p) - x (G.pairRight p)) *
          (h (G.pairLeft p) - h (G.pairRight p))) +
        t^2 * (∑ p : Pair, (κ / 2) * G.pairWeight p *
          (h (G.pairLeft p) - h (G.pairRight p))^2) := by
    rw [Finset.mul_sum, Finset.mul_sum]
    rw [← Finset.sum_add_distrib, ← Finset.sum_add_distrib]
    apply Finset.sum_congr rfl
    intro p _
    ring
  simp only [edgeAction, firstVariation, quadraticRemainder]
  rw [hedge, hpairs]
  ring

/--
Weak Euler--Lagrange equation.  In matrix notation this is exactly

`(μ I + κ L_edge) x = -β (w ⊙ ρ)`.

Using all test variations avoids hiding a coordinate or differentiability
assumption.
-/
def IsStationary
    (μ κ β : R) (ρ x : Edge → R) : Prop :=
  ∀ h : Edge → R, firstVariation G μ κ β ρ x h = 0

theorem stationary_action_expansion
    {μ κ β : R} {ρ x : Edge → R}
    (hx : IsStationary G μ κ β ρ x)
    (h : Edge → R) :
    edgeAction G μ κ β ρ (fun e => x e + h e) =
      edgeAction G μ κ β ρ x + quadraticRemainder G μ κ h := by
  have hv := edgeAction_along_variation G μ κ β 1 ρ x h
  rw [hx h] at hv
  simpa using hv

theorem quadraticRemainder_nonneg
    {μ κ : R} (hμ : 0 ≤ μ) (hκ : 0 ≤ κ)
    (h : Edge → R) :
    0 ≤ quadraticRemainder G μ κ h := by
  classical
  apply add_nonneg
  · apply Finset.sum_nonneg
    intro e _
    exact mul_nonneg (div_nonneg hμ (by norm_num)) (sq_nonneg (h e))
  · apply Finset.sum_nonneg
    intro p _
    exact mul_nonneg
      (mul_nonneg (div_nonneg hκ (by norm_num)) (G.pairWeight_nonneg p))
      (sq_nonneg (h (G.pairLeft p) - h (G.pairRight p)))

/-- Every stationary configuration is a global action minimizer. -/
theorem stationary_is_global_minimum
    {μ κ β : R} {ρ x : Edge → R}
    (hμ : 0 ≤ μ) (hκ : 0 ≤ κ)
    (hx : IsStationary G μ κ β ρ x)
    (y : Edge → R) :
    edgeAction G μ κ β ρ x ≤ edgeAction G μ κ β ρ y := by
  let h : Edge → R := fun e => y e - x e
  have hexpand := stationary_action_expansion G hx h
  have hnonneg := quadraticRemainder_nonneg G hμ hκ h
  have hpoint : (fun e => x e + h e) = y := by
    funext e
    simp [h]
  rw [hpoint] at hexpand
  linarith

/-- The stationarity equation evaluated in the direction `h=x`. -/
theorem stationary_energy_balance
    {μ κ β : R} {ρ x : Edge → R}
    (hx : IsStationary G μ κ β ρ x) :
    (∑ e : Edge, (μ * x e * x e + β * G.edgeWeight e * ρ e * x e)) +
      ∑ p : Pair, κ * G.pairWeight p *
        (x (G.pairLeft p) - x (G.pairRight p)) *
        (x (G.pairLeft p) - x (G.pairRight p)) = 0 := by
  simpa only [firstVariation] using hx x

end EdgeAction

section PotentialAndMotion

variable
  {Vertex Edge Pair : Type}
  [Fintype Vertex]
  [Fintype Edge] [Fintype Pair]
  (G : FiniteWeightedGraph Vertex Edge Pair)

section NodePotential

variable [DecidableEq Vertex]

/-- `Φ_metric(u) = β/2 ∑_{e∋u} we xe`, matching the JS model. -/
def nodeMetricPotential (β : R) (x : Edge → R) (u : Vertex) : R :=
  (β / 2) * ∑ e : Edge,
    if G.edgeSrc e = u ∨ G.edgeDst e = u
    then G.edgeWeight e * x e
    else 0

end NodePotential

/-- Total excitation norm `N_Ψ = ∑u ρu`. -/
def objectNorm (density : Vertex → R) : R :=
  ∑ u, density u

/--
Force obtained from a discrete directional derivative of the metric
potential: `F = -∑u ρu ∇Φ(u)`.
-/
def metricForce
    (density potentialGradient : Vertex → R) : R :=
  -∑ u, density u * potentialGradient u

/-- In the normalized model, inertial mass is the packet norm. -/
def inertialMass (density : Vertex → R) : R :=
  objectNorm density

/-- Acceleration of the packet center under the norm-weighted force. -/
def objectAcceleration
    (density potentialGradient : Vertex → R) : R :=
  metricForce density potentialGradient / inertialMass density

/-- A simple discrete state for the packet center. -/
structure MotionState where
  position : R
  velocity : R

/-- Symplectic-Euler center update used as a formal movement abstraction. -/
def motionStep (dt acceleration : R) (s : MotionState) : MotionState :=
  let nextVelocity := s.velocity + dt * acceleration
  { position := s.position + dt * nextVelocity
    velocity := nextVelocity }

theorem metricForce_constant_gradient
    (density : Vertex → R) (g : R) :
    metricForce density (fun _ => -g) = objectNorm density * g := by
  classical
  simp [metricForce, objectNorm, Finset.sum_mul]

/--
Formal free-fall universality theorem.

Assumption: the directional metric-potential gradient is constant (`-g`)
over the packet support and the packet norm is nonzero.  Under exactly these
conditions the norm cancels and the center acceleration is independent of the
object norm.
-/
theorem constant_metric_gradient_gives_universal_acceleration
    (density : Vertex → R) (g : R)
    (hnorm : objectNorm density ≠ 0) :
    objectAcceleration density (fun _ => -g) = g := by
  rw [objectAcceleration, metricForce_constant_gradient]
  simp [inertialMass, hnorm]

/-- Holding force is proportional to the packet norm in the same field. -/
theorem holding_force_is_mass_proportional
    (density : Vertex → R) (g : R) :
    -metricForce density (fun _ => -g) = -(inertialMass density * g) := by
  rw [metricForce_constant_gradient]
  rfl

theorem motionStep_velocity
    (dt acceleration : R) (s : MotionState) :
    (motionStep dt acceleration s).velocity =
      s.velocity + dt * acceleration := by
  rfl

theorem motionStep_position
    (dt acceleration : R) (s : MotionState) :
    (motionStep dt acceleration s).position =
      s.position + dt * (s.velocity + dt * acceleration) := by
  rfl

/-- One formally verified movement step in a constant metric field. -/
theorem universal_free_fall_step
    (density : Vertex → R) (g dt : R)
    (hnorm : objectNorm density ≠ 0)
    (s : MotionState) :
    motionStep dt (objectAcceleration density (fun _ => -g)) s =
      motionStep dt g s := by
  rw [constant_metric_gradient_gives_universal_acceleration density g hnorm]

end PotentialAndMotion

section ExactGlitch

/-!
## Exact compact-support glitch and symmetric sector coupling

This section mirrors the mathematical core of
`src/modules/subqg_exact_glitch_tunneling.mjs`.  Complex vectors are written
as real and imaginary components so that the cancellation behind norm
conservation remains completely explicit.
-/

/-- Valid parameters for the compactly supported glitch window. -/
structure ExactGlitchParameters where
  timeMid : R
  halfWidth : R
  halfWidth_pos : 0 < halfWidth
  epsilonMax : R
  tunnelStrength : R

/-- Dimensionless time coordinate `s = (t - t_mid) / tau`. -/
def normalizedGlitchTime (p : ExactGlitchParameters) (t : R) : R :=
  (t - p.timeMid) / p.halfWidth

/--
The exact piecewise bump used by `computeGlitchCoupling`.  The explicit
outside branch is what makes the bridge identically zero rather than merely
small outside the open interval `|s| < 1`.
-/
def compactGlitchBump (p : ExactGlitchParameters) (t : R) : R :=
  let s := normalizedGlitchTime p t
  if |s| < 1 then Real.exp (1 - 1 / (1 - s^2)) else 0

def glitchEpsilon (p : ExactGlitchParameters) (t : R) : R :=
  p.epsilonMax * compactGlitchBump p t

/-- `w_AB(t) = sin2(epsilon(t))` from the exact engine. -/
def overlapWeight (p : ExactGlitchParameters) (t : R) : R :=
  (Real.sin (glitchEpsilon p t))^2

/-- `g(t) = J_tunnel * w_AB(t)`. -/
def tunnelCoupling (p : ExactGlitchParameters) (t : R) : R :=
  p.tunnelStrength * overlapWeight p t

theorem compactGlitchBump_outside
    (p : ExactGlitchParameters) (t : R)
    (hout : ¬ |normalizedGlitchTime p t| < 1) :
    compactGlitchBump p t = 0 := by
  simp [compactGlitchBump, hout]

/-- At the center of a valid glitch window the normalized bump is exactly 1. -/
theorem compactGlitchBump_at_center (p : ExactGlitchParameters) :
    compactGlitchBump p p.timeMid = 1 := by
  simp [compactGlitchBump, normalizedGlitchTime]

theorem overlapWeight_nonneg (p : ExactGlitchParameters) (t : R) :
    0 ≤ overlapWeight p t := by
  exact sq_nonneg _

/-- The implemented peak value is exactly `sin2(epsilonMax)`. -/
theorem overlapWeight_at_center (p : ExactGlitchParameters) :
    overlapWeight p p.timeMid = (Real.sin p.epsilonMax)^2 := by
  simp [overlapWeight, glitchEpsilon, compactGlitchBump_at_center]

/-- Outside the compact support every bridge quantity is identically zero. -/
theorem bridge_closed_outside
    (p : ExactGlitchParameters) (t : R)
    (hout : ¬ |normalizedGlitchTime p t| < 1) :
    glitchEpsilon p t = 0 ∧
      overlapWeight p t = 0 ∧
      tunnelCoupling p t = 0 := by
  have hbump := compactGlitchBump_outside p t hout
  simp [glitchEpsilon, overlapWeight, tunnelCoupling, hbump]

/-- Edge source injected from sector B into A by the exact engine. -/
def crossMetricSource
    {Edge : Type} (p : ExactGlitchParameters) (t : R)
    (rhoB : Edge → R) (e : Edge) : R :=
  overlapWeight p t * rhoB e

theorem crossMetricSource_outside
    {Edge : Type} (p : ExactGlitchParameters) (t : R)
    (rhoB : Edge → R)
    (hout : ¬ |normalizedGlitchTime p t| < 1) :
    crossMetricSource p t rhoB = fun _ => 0 := by
  funext e
  have hclosed := (bridge_closed_outside p t hout).2.1
  simp [crossMetricSource, hclosed]

section TwoSector

variable {Site : Type} [Fintype Site]

/-- Real part of the complex inner product used by the block energy. -/
def realOverlap
    (aRe aIm bRe bIm : Site → R) : R :=
  ∑ u : Site, (aRe u * bRe u + aIm u * bIm u)

/-- Squared complex norm of one sector. -/
def sectorNorm (re im : Site → R) : R :=
  ∑ u : Site, ((re u)^2 + (im u)^2)

def totalSectorNorm
    (aRe aIm bRe bIm : Site → R) : R :=
  sectorNorm aRe aIm + sectorNorm bRe bIm

/-- Directional rate of a squared complex norm. -/
def sectorNormRate
    (re im dRe dIm : Site → R) : R :=
  ∑ u : Site, 2 * (re u * dRe u + im u * dIm u)

/-- `E_cross = 2 g Re(<Psi_A|Psi_B>)`. -/
def blockCouplingEnergy
    (g : R) (aRe aIm bRe bIm : Site → R) : R :=
  2 * g * realOverlap aRe aIm bRe bIm

/-- The real pairing of the two off-diagonal blocks is symmetric. -/
theorem realOverlap_symmetric
    (aRe aIm bRe bIm : Site → R) :
    realOverlap aRe aIm bRe bIm =
      realOverlap bRe bIm aRe aIm := by
  classical
  apply Finset.sum_congr rfl
  intro u _
  ring

/--
The symmetric coupling terms in the two Schrödinger equations cancel
exactly in the rate of `N_A + N_B`.  `dA0` and `dB0` are the uncoupled
sector derivatives; the four added terms are precisely those implemented in
`_computeBlockRhs`.
-/
theorem symmetric_coupling_preserves_total_norm_rate
    (g : R)
    (aRe aIm bRe bIm dA0Re dA0Im dB0Re dB0Im : Site → R) :
    sectorNormRate aRe aIm
        (fun u => dA0Re u + g * bIm u)
        (fun u => dA0Im u - g * bRe u) +
      sectorNormRate bRe bIm
        (fun u => dB0Re u + g * aIm u)
        (fun u => dB0Im u - g * aRe u) =
      sectorNormRate aRe aIm dA0Re dA0Im +
        sectorNormRate bRe bIm dB0Re dB0Im := by
  classical
  simp only [sectorNormRate]
  rw [← Finset.sum_add_distrib, ← Finset.sum_add_distrib]
  apply Finset.sum_congr rfl
  intro u _
  ring

/-- If both uncoupled self-adjoint sectors preserve norm, so does their
symmetric real coupling at the differential-equation level. -/
theorem total_norm_rate_zero_of_symmetric_coupling
    (g : R)
    (aRe aIm bRe bIm dA0Re dA0Im dB0Re dB0Im : Site → R)
    (hA : sectorNormRate aRe aIm dA0Re dA0Im = 0)
    (hB : sectorNormRate bRe bIm dB0Re dB0Im = 0) :
    sectorNormRate aRe aIm
        (fun u => dA0Re u + g * bIm u)
        (fun u => dA0Im u - g * bRe u) +
      sectorNormRate bRe bIm
        (fun u => dB0Re u + g * aIm u)
        (fun u => dB0Im u - g * aRe u) = 0 := by
  rw [symmetric_coupling_preserves_total_norm_rate]
  rw [hA, hB]
  norm_num

/--
Exact partial energy/work identity for a coupling change while the state is
held fixed.  Dividing by a time increment gives the implemented power term
`2 * g'(t) * Re(<Psi_A|Psi_B>)` in the differential limit.
-/
theorem blockCouplingEnergy_parameter_change
    (g deltaG : R) (aRe aIm bRe bIm : Site → R) :
    blockCouplingEnergy (g + deltaG) aRe aIm bRe bIm -
      blockCouplingEnergy g aRe aIm bRe bIm =
      2 * deltaG * realOverlap aRe aIm bRe bIm := by
  simp [blockCouplingEnergy]
  ring

end TwoSector

end ExactGlitch

#print axioms edgeAction_along_variation
#print axioms stationary_action_expansion
#print axioms quadraticRemainder_nonneg
#print axioms stationary_is_global_minimum
#print axioms stationary_energy_balance
#print axioms metricForce_constant_gradient
#print axioms constant_metric_gradient_gives_universal_acceleration
#print axioms holding_force_is_mass_proportional
#print axioms universal_free_fall_step
#print axioms compactGlitchBump_outside
#print axioms compactGlitchBump_at_center
#print axioms overlapWeight_at_center
#print axioms bridge_closed_outside
#print axioms crossMetricSource_outside
#print axioms symmetric_coupling_preserves_total_norm_rate
#print axioms total_norm_rate_zero_of_symmetric_coupling
#print axioms blockCouplingEnergy_parameter_change

end

end SubQG

```

## File: `SubQGExactGlitchEngine_Lean_Ergebnisse_2026-11-11/formal/VERIFICATION_RESULT.md`  
- Path: `SubQGExactGlitchEngine_Lean_Ergebnisse_2026-11-11/formal/VERIFICATION_RESULT.md`  
- Size: 2149 Bytes  
- Modified: 2026-11-11 18:27:56 UTC  
- Warning: 1 secret-like value(s) redacted  
- Condensed: comments and repeated blank lines reduced

> Condensed: comments and repeated blank lines reduced

## File: `SubQGExactGlitchEngine_Lean_Ergebnisse_2026-11-11/formal/verify.ps1`  
- Path: `SubQGExactGlitchEngine_Lean_Ergebnisse_2026-11-11/formal/verify.ps1`  
- Size: 2195 Bytes  
- Modified: 2026-11-11 18:14:04 UTC

```powershell
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$leanExe = Join-Path $env:USERPROFILE '.elan\bin\lean.exe'
if (-not (Test-Path -LiteralPath $leanExe)) {
  throw "Lean executable not found: $leanExe"
}

$leanRoots = @(
  'F:\MathResearchDB_v0_4\lean_cache\oai_workspace',
  'F:\MathResearchDB_v0_4\lean_cache\packages\Cli\.lake\build\lib\lean',
  'F:\MathResearchDB_v0_4\lean_cache\packages\batteries\.lake\build\lib\lean',
  'F:\MathResearchDB_v0_4\lean_cache\packages\Qq\.lake\build\lib\lean',
  'F:\MathResearchDB_v0_4\lean_cache\packages\aesop\.lake\build\lib\lean',
  'F:\MathResearchDB_v0_4\lean_cache\packages\proofwidgets\.lake\build\lib\lean',
  'F:\MathResearchDB_v0_4\lean_cache\packages\importGraph\.lake\build\lib\lean',
  'F:\MathResearchDB_v0_4\lean_cache\packages\LeanSearchClient\.lake\build\lib\lean',
  'F:\MathResearchDB_v0_4\lean_cache\packages\plausible\.lake\build\lib\lean',
  'F:\MathResearchDB_v0_4\lean_cache\mathlib\.lake\build\lib\lean',
  (Join-Path $env:USERPROFILE '.elan\toolchains\leanprover--lean4---v4.34.1\lib\lean')
)

$missingRoots = @($leanRoots | Where-Object { -not (Test-Path -LiteralPath $_) })
$requiredRoots = @(
  'F:\MathResearchDB_v0_4\lean_cache\mathlib\.lake\build\lib\lean',
  (Join-Path $env:USERPROFILE '.elan\toolchains\leanprover--lean4---v4.34.1\lib\lean')
)
$missingRequiredRoots = @($requiredRoots | Where-Object { -not (Test-Path -LiteralPath $_) })
if ($missingRequiredRoots.Count -gt 0) {
  throw "Required Lean roots are missing:`n$($missingRequiredRoots -join "`n")"
}

$existingRoots = @($leanRoots | Where-Object { Test-Path -LiteralPath $_ })
$env:LEAN_PATH = $existingRoots -join ';'
$formalFile = Join-Path $PSScriptRoot 'SubQGDerivation.lean'

$compilerOutput = & $leanExe $formalFile 2>&1
$exitCode = $LASTEXITCODE
$compilerOutput | ForEach-Object { Write-Output $_ }

if ($exitCode -ne 0) {
  throw "Lean verification failed with exit code $exitCode"
}

$joinedOutput = $compilerOutput -join "`n"
if ($joinedOutput -match 'sorryAx|declaration uses.*sorry|declaration uses.*admit') {
  throw 'Lean reported a forbidden proof shortcut (sorry/admit/sorryAx)'
}

Write-Output 'SubQG formal verification: PASSED'

```

