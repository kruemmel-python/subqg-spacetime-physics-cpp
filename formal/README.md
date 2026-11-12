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
| `bumpGlue` / `smoothGlitchBump` | `SubQGExactGlitchEngine.computeGlitchCoupling` | Konstruktion via Mathlibs `expNegInvGlue`: bewiesene $C^\infty$-Glattheit (`ContDiff ℝ n`) über ganz $\mathbb{R}$ |
| `compactGlitchBump` / `bridge_closed_outside` | `SubQGExactGlitchEngine.computeGlitchCoupling` | Glattes Fenster mit exakt kompaktem Träger und exakt geschlossener Brücke außerhalb des Zeitfensters |
| `overlapWeight` / `tunnelCoupling` | `wAB`, `gTunnel` | Quadratischer Überlapp `sin²(ε)` und reelle Tunnelkopplung `J_tunnel w_AB` |
| `symmetric_coupling_preserves_total_norm_rate` | `_computeBlockRhs` | Algebraische Aufhebung der symmetrischen A↔B-Kopplung in der Gesamtnormrate |
| `blockCouplingEnergy_parameter_change` | `computeBlockHamiltonianEnergies`, `tunnelPower` | Exakte partielle Energieänderung `ΔE_cross=2 Δg Re⟨A|B⟩` bei festgehaltenem Zustand |
| `jointBlockEnergy` / `joint_energy_variation_with_metric_feedback` | `computeBlockHamiltonianEnergies`, `glitchPower` | Vollständige gemeinsame Energiebilanz $\mathcal{H}_{\mathrm{joint}} = E_{\Psi,A} + E_{\Psi,B} + E_{\mathrm{cross}} + S_{\mathrm{edge}}[x_A] + S_{\mathrm{edge}}[x_B]$ inklusive metrischer Rückkopplung |

## Formal bewiesene Aussagen

Lean 4 prüft insbesondere:

1. Die exakte algebraische Entwicklung `S(x+t h)` der Kantenwirkung.
2. Die schwache Stationaritätsgleichung für jede Variation `h`.
3. Jede stationäre Lösung ist bei `μ≥0`, `κ≥0` und nichtnegativen Paargewichten ein globales Minimum der Wirkung.
4. Die Stationaritätsgleichung liefert eine exakte Energiebilanz zwischen Anker-, Glättungs- und Quellterm.
5. Ist der diskrete Potentialgradient über dem Objektpaket konstant und die Paketnorm ungleich null, kürzt sich die Norm aus Kraft durch Trägheit heraus. Die Beschleunigung ist dann unabhängig von der Paketnorm.
6. Unter derselben Konstantfeldannahme ist die benötigte Haltekraft proportional zur Paketnorm beziehungsweise zur im Modell so definierten trägen Masse.
7. Der diskrete Bewegungsschritt verwendet genau die formal hergeleitete Beschleunigung.
8. Die Glitch-Bump-Funktion ist über Mathlibs `expNegInvGlue` formal als unendlich oft differenzierbar ($C^\infty$, `ContDiff ℝ n` für beliebige $n \le \infty$) auf ganz $\mathbb{R}$ bewiesen.
9. Außerhalb `|(t-t_mid)/tau|<1` sind Bump, Winkel, Überlapp, Tunnelkopplung und metrische Kreuzquelle exakt null; in der Fenstermitte gilt exakt `w_AB=sin²(epsilonMax)`.
10. Die reelle Off-Diagonal-Kopplung ist zwischen A und B symmetrisch. Ihre Beiträge zur momentanen Ableitung von `N_A+N_B` heben sich exakt auf. Erhalten auch die beiden ungekoppelten Sektoren jeweils ihre Norm, ist die Gesamtnormrate exakt null.
11. Für eine simultane Änderung von Tunnelkopplung `g → g+Δg` und metrischem Quellgewicht `w_AB → w_AB+Δw_AB` bei festgehaltenem Zustand gilt formal exakt:
   $$\Delta \mathcal{H}_{\mathrm{joint}} = 2 \Delta g \operatorname{Re}\langle \Psi_A | \Psi_B \rangle + \Delta w_{AB} \cdot \beta \sum_e w_e \rho_{B,e} x_{A,e}.$$
   Dies ist die exakte algebraische Grundlage der im Programm umgesetzten vollständigen Leistungs- und Arbeitsbilanz des Glitches.

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

Ebenso formalisiert diese Stufe die Schwerpunktbewegung als diskretes Kraftgesetz und den exakten Glitch auf Ebene der zugrunde liegenden Differentialgleichung. RK4 ist ein numerisches Integrationsverfahren und im Allgemeinen nicht exakt unitär. Deshalb behauptet Lean **keine exakte Normerhaltung jedes endlichen RK4-Schritts**. Der JavaScript-Test prüft stattdessen den tatsächlich auftretenden numerischen Normdrift gegen `10⁻⁶`. Eine vollständige Fehlerabschätzung für den nichtlinearen RK4-Lauf wäre ein eigener Beweisbaustein.

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
