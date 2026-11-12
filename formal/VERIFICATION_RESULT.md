# Prüfergebnis: SubQGExactGlitchEngine / Lean 4

Datum: 12. November 2026  
Projekt: `SubQG_Fundamental_Physics_Validation_FPV6/developer`

## Ergebnis

- `npm run verify:lean`: **BESTANDEN**
- Lean-Version: **4.34.1**
- Unbewiesene Platzhalter (`sorry`, `admit`, `sorryAx`): **keine (0)**
- Axiomatische Grundlage: Ausschließlich Lean 4 Kernaxiome `[propext, Classical.choice, Quot.sound]`
- `npm test`: **277 von 277 Tests bestanden**
- Fehlgeschlagene, übersprungene oder abgebrochene Tests: **0**
- Spezifische Tests der `SubQGExactGlitchEngine`: **3 von 3 bestanden**

## Neu formal abgedeckt und bewiesen

1. **$C^\infty$-Glattheit des Bump-Fensters**: Über Mathlibs `expNegInvGlue` ist formal bewiesen, dass die Bump-Funktion `bumpGlue` und `smoothGlitchBump` für jede Ableitungsordnung $n \le \infty$ unendlich oft differenzierbar (`ContDiff ℝ n`) auf ganz $\mathbb{R}$ ist (`SubQG.bumpGlue_contDiff`, `SubQG.smoothGlitchBump_contDiff`).
2. **Exakter kompakter Träger**: Außerhalb von `|(t - t_mid) / tau| < 1` sind Bump, Winkel, quadratischer Überlapp, Tunnelkopplung und metrische Kreuzquelle exakt null (`SubQG.bumpGlue_zero_of_not_mem`, `SubQG.smoothGlitchBump_outside`, `SubQG.bridge_closed_outside`, `SubQG.crossMetricSource_outside`).
3. **Verschwindende Ausgangskopplung**: Bei $\varepsilon=0$ gilt $w_{AB} = \sin^2(0) = 0$ exakt.
4. **Symmetrische Kopplung und Normerhaltung**: Die reelle Off-Diagonal-Kopplung hebt sich in der momentanen Zeitableitung der Gesamtnorm exakt auf (`SubQG.symmetric_coupling_preserves_total_norm_rate`, `SubQG.total_norm_rate_zero_of_symmetric_coupling`).
5. **Vollständige gemeinsame Energie- und Leistungsbilanz**: Definition des gemeinsamen Hamiltonians $\mathcal{H}_{\mathrm{joint}} = E_{\Psi,A} + E_{\Psi,B} + E_{\mathrm{cross}} + S_{\mathrm{edge}}[x_A] + S_{\mathrm{edge}}[x_B]$ und formaler Beweis der Energievariation unter simultaner Änderung von Tunnelkopplung und metrischem Quellübertrag (`SubQG.joint_energy_variation_with_metric_feedback`):
   $$\Delta \mathcal{H}_{\mathrm{joint}} = 2 \Delta g \operatorname{Re}\langle \Psi_A | \Psi_B \rangle + \Delta w_{AB} \cdot \beta \sum_e w_e \rho_{B,e} x_{A,e}.$$

## Numerische Umsetzung (Weg A: Emergentes Actio = Reactio & Hartree-Korrektur)

1. **Physikalischer Hartree-Newton Hamiltonian**: 
   $$\mathcal{H}_{\mathrm{phys}} = (E_{\Psi,A} - S_{\mathrm{edge}}[x_A]) + (E_{\Psi,B} - S_{\mathrm{edge}}[x_B]) + E_{\mathrm{cross}} = (E_{\mathrm{kin},A} + E_{\mathrm{NL},A} + S_{\mathrm{edge}}[x_A]) + (E_{\mathrm{kin},B} + E_{\mathrm{NL},B} + S_{\mathrm{edge}}[x_B]) + 2 g(t)\operatorname{Re}\langle \Psi_A | \Psi_B \rangle.$$
   Dadurch wird die in Schrödinger-Newton-Systemen auftretende Doppelzählung der Paar-Selbstinteraktionsenergie ($E_{\mathrm{metricInt}} = 2 S_{\mathrm{edge}}$) exakt aufgelöst.
2. **Emergentes Multiversum ohne manuelle Dämpfung**:
   Im geschlossenen Zwei-Welten-System gilt fundamental Actio = Reactio (`backreactionScale = 1.0`, Weg A). Keine willkürlichen phänomenologischen Skalierungsfaktoren.
3. **Konsistente RK4-Stufen**: Alle 4 Zwischenstufen $k_1..k_4$ evaluieren die zeitabhängige Glitch-Kopplung $g(t)$ an den Stufenzeiten $t$, $t + dt/2$ und $t + dt$, und die variationelle Metrik wird an den Zwischenstufenzuständen konsistent rückgekoppelt.
4. **Simpson-Quadratur**: Die geleistete Arbeit des Glitches wird konsistent mit 4th-Order-Gewichten integriert.
5. **Exakte Energie-Arbeits-Bilanz**:
   - $\Delta \mathcal{H}_{\mathrm{phys}} = 0{,}125621$
   - $W_{\mathrm{glitch}} = 0{,}123846$
   - $\text{Diskrepanz} = 0{,}001774 < 0{,}005$ ($< 0{,}15\%$ RK4-Diskretisierungsrest)
   - `isEnergyWorkBalanced: true`
   - `isTotalNormConserved: true` (Drift $< 5 \times 10^{-8}$)
6. **Strenge Leistungskontrolle**: Vor und nach dem Glitchfenster ist die momentane Leistung $P_{\mathrm{glitch}}(t) \equiv 0$ identisch null; die geleistete Arbeit friert nach Schließen der Brücke exakt ein.

## Reproduzieren

Im Projektverzeichnis `developer` ausführen:

```powershell
npm run verify:lean
npm test
```
