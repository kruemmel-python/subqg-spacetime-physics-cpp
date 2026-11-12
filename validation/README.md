# Empirische SubQG-Validierung

Dieses Verzeichnis prüft, ob die intern hergeleitete SubQG-Modellgravitation
reale, zuvor nicht zur Herleitung verwendete Messdaten beschreibt. Ein
bestandener Softwaretest ist dabei **kein** empirischer Beweis. Jede Prüfung
muss reale Daten, Unsicherheiten, ein eingefrorenes Modell, Vergleichsmodelle
und eine echte Holdout-Menge enthalten.

## Beweisstandard

Ein empirischer Gesamtnachweis wird erst beansprucht, wenn alle folgenden
Bereiche mit einem gemeinsamen, vorab festgelegten Parametersatz bestanden
sind:

1. Galaxien-Rotationskurven außerhalb der Kalibrationsmenge;
2. starke und schwache Gravitationslinsen;
3. Äquivalenzprinzip und Laborgravitation;
4. Sonnensystem und binäre Pulsare;
5. Erzeugung und Ausbreitung von Gravitationswellen;
6. Galaxienhaufen, Strukturbildung und kosmologische Hintergrunddaten;
7. Robustheit gegen Datenwahl, systematische Unsicherheiten und Nullmodelle.

Ein Fehlschlag wird dokumentiert und darf nicht durch nachträgliches Ändern des
Testkriteriums entfernt werden. Neue Modellversionen erhalten neue
Ergebnisdateien und müssen erneut auf einem unangetasteten Holdout geprüft
werden.

## Test 1: SPARC-Rotationskurven

Die erste Pipeline verwendet die offiziellen Newtonschen Massenmodelle der 175
SPARC-Galaxien. Ganze Galaxien werden deterministisch in 80 % Training und
20 % Holdout geteilt. Dadurch gelangen keine Radien derselben Galaxie in beide
Mengen.

Festgelegte Annahmen:

- Scheiben-Masse-zu-Licht-Verhältnis: `0.5`;
- Bulge-Masse-zu-Licht-Verhältnis: `0.7`;
- genau ein globaler Fitparameter `a0`;
- SubQG-Vorhersage: `g = sqrt(gbar^2 + gbar*a0)`;
- Fit nur auf Trainingsgalaxien;
- Holdout-Auswertung ohne Nachfitten;
- Newtonsche und empirische RAR-Referenz als Vergleich.

Die festen Masse-zu-Licht-Verhältnisse sind eine erste strenge Baseline. Eine
spätere Unsicherheitsanalyse muss Distanz, Inklination und stellare
Masse-zu-Licht-Verhältnisse hierarchisch marginalisieren, ohne die
Holdout-Trennung zu verletzen.

### Ausführung

```powershell
npm run validation:fetch:sparc
npm run validation:sparc
```

Das Resultat wird nach `validation/results/sparc_rotation_validation.json`
geschrieben. Die Rohdaten werden wegen ihrer externen Herkunft nicht im
Repository dupliziert; Download-URL und SHA-256 sind festgeschrieben.

## Status

Der SPARC-Test ist ein erster empirischer Außenvergleich. Er allein kann die
Identität der SubQG-Modellgravitation mit der realen Gravitation weder beweisen
noch widerlegen. Er kann jedoch die konkrete galaktische Beschleunigungsform
quantitativ falsifizieren und zeigt, welche unabhängigen Tests als Nächstes
notwendig sind.

### Baseline-Ergebnis vom 12. November 2026

Datensatz und Split:

- 175 Galaxien und 3.389 verwertbare radiale Messpunkte;
- 138 vollständige Galaxien im Training;
- 37 vollständige Galaxien im Holdout;
- keine galaxienspezifischen Fits.

Holdout-RMS in logarithmischer Beschleunigung:

| Modell | Holdout-RMS |
|---|---:|
| Newton nur mit Baryonen | 0,55044 dex |
| SubQG mikroskopische Fluxgleichung, ohne Katalogfit | 0,20352 dex |
| SubQG Dual-Strain, ein globales `a0` aus dem Training | 0,17659 dex |
| Empirische RAR-Referenz, ein globales `a0` aus dem Training | 0,17232 dex |

Für Dual-Strain wurde ausschließlich auf der Trainingsmenge
`a0 = 1,465548e-10 m/s²` ermittelt. Ein gepaarter Bootstrap über ganze
Holdout-Galaxien bestätigt eine klare Verbesserung gegenüber Newton. Gegen die
empirische RAR ist Dual-Strain in diesem Split dagegen leicht und systematisch
schlechter. Die mikroskopische Fluxgleichung ist gegenüber RAR auf Ebene der
37 Galaxien noch nicht statistisch unterscheidbar, besitzt aber einen
negativen mittleren Bias und eine höhere Punktstreuung.

Dieses Ergebnis ist **kein empirischer Gesamtnachweis**. Es lokalisiert die
nächste Aufgabe: Die physikalische Skalierung und Form der mikroskopischen
Fluxgleichung müssen aus der SubQG-Wirkung geschlossen abgeleitet und danach
auf einem neuen, bisher unbenutzten Galaxiensurvey geprüft werden.

## Test 2: LITTLE THINGS ohne Nachfitten

Der zweite Galaxientest verwendet den unabhängigen LITTLE-THINGS-Katalog von
Oh et al. (2015). Aus den publizierten Gesamt- und DM-Rotationskurven wird an
identischen Radien

```text
V_bar² = V_total² - V_DM²
```

rekonstruiert. Das ist möglich, weil die Autoren die DM-Kurve durch Abzug des
baryonischen Massenmodells von der Gesamtkinematik bestimmen. Die Rekonstruktion
ist deshalb nicht statistisch unabhängig vom baryonischen Modell; die
vollständige Kovarianz wird vom Katalog nicht mitgeliefert.

Entscheidend für den Holdout-Charakter:

- keine Gleichung und kein Parameter wird an LITTLE THINGS angepasst;
- Dual-Strain übernimmt `a0 = 1,465548e-10 m/s²` aus dem SPARC-Training;
- auch die RAR-Referenz übernimmt ausschließlich ihren SPARC-Trainingswert;
- die mikroskopische Fluxgleichung verwendet nur ihre vorhandenen Konstanten;
- Vergleiche und Bootstrap resampeln ganze Galaxien, nicht einzelne Radien.

### Ausführung

```powershell
npm run validation:fetch:little-things
npm run validation:little-things
```

Das deterministische Resultat steht in
`validation/results/little_things_validation.json`. Sein SHA-256 lautet
`2ADC9E57CC1EB6294446B9C761E3D75DAB960E6C784420D659DD744442DF833F`.

### Ergebnis vom 12. November 2026

Von 742 exakt zugeordneten Messradien verbleiben nach Ausschluss von 40
Punkten mit nichtpositivem rekonstruiertem `V_bar²` 702 Punkte in 22
Galaxien. Es wurde kein LITTLE-THINGS-Parameter gefittet.

| Eingefrorenes Modell | RMS |
|---|---:|
| Newton nur mit rekonstruierten Baryonen | 0,77630 dex |
| SubQG Dual-Strain | 0,36960 dex |
| empirische RAR-Referenz | 0,36082 dex |
| SubQG mikroskopische Fluxgleichung | 0,34614 dex |

Der gepaarte Bootstrap mit 20.000 Wiederholungen über 22 ganze Galaxien zeigt
Dual-Strain und mikroskopische Fluxgleichung eindeutig besser als Newton; die
jeweiligen 95-%-Intervalle der mittleren MSE-Differenz liegen vollständig
unter null. Gegen die empirische RAR ist noch kein eindeutiger Unterschied
nachgewiesen: Beide 95-%-Intervalle enthalten null. Die Fluxgleichung hat den
kleinsten Punkt-RMS und gewinnt in 71,33 % der Bootstrap-Stichproben gegen die
RAR, was als vielversprechende Replikation, nicht als Signifikanznachweis
berichtet wird.

Die reduzierten Chi-Quadrat-Werte bleiben deutlich größer als eins. Das weist
auf noch nicht vollständig modellierte Mess- und Massenmodell-Systematiken
und/oder verbleibende Modellabweichungen hin. Der unabhängige Survey bestätigt
somit robust die Verbesserung gegenüber baryonischem Newton, schließt aber die
übrigen Evidenz-Gates noch nicht.

## Test 3: Starke Linsen und relativistische Closure

Rotationskurven bestimmen nur das dynamische Potential. Die Lichtablenkung
hängt zusätzlich vom räumlichen metrischen Potential und damit vom
PPN-Parameter `gamma` ab. Die vollständige Herleitung und ihr offener
Beweisschritt stehen in `RELATIVISTIC_CLOSURE.md`.

```powershell
npm run validation:lensing
```

Der Test vergleicht drei vorab bestimmte metrische Closures mit der
veröffentlichten Messung aus 80 starken Galaxienlinsen:

| Closure | `gamma` | Abstand vom Messzentrum |
|---|---:|---:|
| SubQG gemeinsames Potential ohne Slip | 1 | +0,135 Sigma |
| zeitartiges Potential bei räumlich flacher Metrik | 0 | -21,170 Sigma |
| No-Lensing-Grenze | -1 | -42,447 Sigma |

Die masselose Spin-2-No-Slip-Closure besteht den empirischen
Kompatibilitätstest. Ihre interne Ableitung von `gamma=1` ist inzwischen in
Lean formal verifiziert. Das Linsen-Gate bleibt trotzdem offen, weil das
Matching der kanonischen skalaren Kantenwirkung auf den Spin-2-IR-Sektor noch
nicht hergeleitet ist.
Die deterministische Ergebnisdatei
`validation/results/lensing_ppn_validation.json` hat SHA-256
`AD37238F45AC021B0817E815EED82E69461AFBECC2FB77B66F77778FD116A893`.

### Spin-2-Brückenaudit

```powershell
npm run validation:spin2-bridge
```

Der Audit prüft die vorhandene Mikrowirkung und den konstruierten
Fierz-Pauli-IR-Sektor:

- Mikrowirkung: skalare Kantenvariable, Spektrallücke mindestens `1`, kein
  masseloser Spin-2-Modus;
- IR-Kandidat: zwei TT-Polarisationen, masselose Dispersion und reine
  Eichrichtungen im Nullraum;
- mikro-zu-IR-Matching: noch nicht hergeleitet.

Die deterministische Ergebnisdatei `spin2_bridge_audit.json` hat SHA-256
`31152E7A3190A99217F861857CC04385562D3ED077CF3E533CC2839FA1DA859D`.

## Test 4: Sonnensystem-Perihelien

Die vollständige Herleitung, Tabellen und Modelltrennung stehen in
`SOLAR_SYSTEM.md`.

```powershell
npm run validation:solar-system
```

Das aus dem SPARC-Training eingefrorene Dual-Strain-Surrogat wird durch die
INPOP10a-Perihelgrenzen eindeutig ausgeschlossen; der größte Widerspruch
beträgt beim Mars `13.120,63 Sigma`. Die mikroskopische Fluxgleichung erreicht
dagegen bereits am Aphel jedes geprüften Planeten die numerische
Hochfeldklemme `C_SubQG=1`; die zusätzlich gespeicherte analytische
Defizitgrenze liegt weit unter jeder Ephemeridengenauigkeit. Sie sagt daher
keine numerisch auflösbare zusätzliche Perihelpräzession voraus und liegt für alle sechs
Planeten innerhalb `0,98 Sigma` der INPOP10a-Werte. Gegen die unabhängigen
EPM2011-Werte beträgt der größte Abstand `2,074 Sigma`. Es wurde kein lokaler
Parameter gefittet.

Die deterministische Ergebnisdatei
`validation/results/solar_system_perihelion_validation.json` hat SHA-256
`36383224F3F5C9E4B65C2B6D4EB93D3A14277C7930753C41A5716DF3C89D6647`.

## Test 5: Lokale Gravitation

Die formale SubQG-Paketdynamik sagt für beliebige zwei nichtleere
Dichteprofile im selben konstanten Feld exakt `eta=0` voraus. Gegen das finale
MICROSCOPE-Ergebnis für Ti/Pt liegt diese parameterfreie Vorhersage
`0,546 Sigma` vom Messzentrum entfernt. Im terrestrischen Hintergrundfeld ist
die mikroskopische Leitfähigkeit exponentiell ununterscheidbar von eins und
damit mit dem Eöt-Wash-Test des inversen Quadratgesetzes zwischen `52 µm` und
`3 mm` kompatibel.

```powershell
npm run validation:local-gravity
```

Herleitung, Geltungsbereich und offene Materiekopplung stehen in
`LOCAL_GRAVITY.md`. G4 bleibt bedingt, bis die chemische Zusammensetzung aus
der zugrunde liegenden SubQG-Mikrophysik abgeleitet und die vollständige
Torsionswaagengeometrie direkt ausgewertet ist.

Die deterministische Ergebnisdatei
`validation/results/local_gravity_validation.json` hat SHA-256
`9F47969315E2F5804BEDE0AB7E90F215021BC2B1F20E619EA8EE72BA288F946D`.

## Test 6: Doppelpulsar und Quadrupolstrahlung

Aus den publizierten Massen, der Umlaufzeit und Exzentrizität von
PSR J0737-3039A/B reproduziert die führende Spin-2-Quadrupolformel den
veröffentlichten 2,5PN-Wert auf `3,03e-7` relativ. Gegen die gemessene
GW-Bahnabnahme liegt die Vorhersage `0,359 Sigma` entfernt; die bedingte
vollständige relativistische Closure liegt `0,587 Sigma` vom publizierten
Quotienten entfernt.

```powershell
npm run validation:binary-pulsar
```

Die vollständige Herleitung und die weiterhin offene Mikro-zu-Spin-2-Brücke
stehen in `BINARY_PULSAR.md`.

Die deterministische Ergebnisdatei
`validation/results/binary_pulsar_validation.json` hat SHA-256
`431C037B76085CE83E323DF60DAA313989533B2F0F60F975241DCBF267258F41`.

## Test 7: Direkte Gravitationswellen

Der parameterfreie masselose Spin-2-IR-Sektor sagt `v_g=c`, `m_g=0` und
genau zwei Tensor-TT-Polarisationen voraus. Diese Vorhersagen liegen innerhalb
der GW170817-Geschwindigkeitsgrenze und der GWTC-3/4-Dispersionsgrenzen; die
Tensorpolarisation stimmt mit GW170814 und dem GWTC-4.0-Nullbefund für
nichttensorielle Moden überein.

```powershell
npm run validation:gravitational-waves
```

Messwerte, Einschränkungen der Polarisationstests und die weiterhin offene
Mikro-zu-Spin-2-Herleitung stehen in `GRAVITATIONAL_WAVES.md`.

Die deterministische Ergebnisdatei
`validation/results/gravitational_wave_validation.json` hat SHA-256
`1A41C4E5FCC5EBF17D19384DFAE7C1685EE239027BF934971592E8E5EBDD0789`.

## Test 8: Relationale Simplex-Tensor-Brücke

Sechs vorhandene skalare Kantenlängen jeder tetraedrischen Zelle bestimmen
über ihre Gram-Matrix exakt sechs unabhängige Komponenten einer lokalen
symmetrischen räumlichen Metrik. Im kanonischen Lauf existieren 1.003 solcher
Zellen. Damit ist die Tensor-Kinematik ohne neue fundamentale Freiheitsgrade
hergeleitet; die masselose Lorentz- und Eichdynamik bleibt der nächste Schritt.

```powershell
npm run validation:simplex-tensor-bridge
```

Der ergänzende Eichrundlauf zeigt, dass die daraus konstruierten Plus- und
Kreuzmoden reine räumliche Eichstörungen entfernen und den masselosen
Fierz-Pauli-Vakuumoperator erfüllen. Herleitung und Beweisgrenze stehen in
`SIMPLEX_TENSOR_BRIDGE.md`.

Die deterministische Ergebnisdatei `simplex_tensor_bridge.json` hat SHA-256
`D0E954A19F34D4A94BA8694D3BC105DFB954E76B16A87CF20D4C1926B8EF08CD`.

## Test 9: Globaler Simplex-Komplex und TT-Hessian

Der vollständige `K4`-Komplex wird ausdrücklich als nicht mannigfaltig
erkannt. Die parameterfreie kanonische Link-Entstehungsordnung wählt daraus
einen verbundenen orientierbaren Raumsektor mit 116 Tetraedern und höchstens
zwei Zellen pro Dreiecksfläche. Sein dualer FPV-Hessian besitzt für Plus und
Kreuz zwei exakte ankerfreie Nullmoden. Der lokale `SO(3)`-Rahmentransport und
die induzierte normerhaltende Plus-/Kreuz-Abbildung bestehen auf allen 199
inneren Flächen. Der Dualgraph besitzt 84 unabhängige Fundamentalschleifen.
Ihre SO(3)-Holonomien sind mathematisch geschlossen und sämtlich nichttrivial;
die Verbindung trägt damit diskrete Krümmung. Das dimensionsbehaftete Matching
auf lokale Regge-/Einstein-Krümmung bleibt offen.

```powershell
npm run validation:collective-spin2-hessian
```

Der negative Vollkomplexbefund, die Orientierungsprüfung und die offene
dynamische Auswahlregel stehen in `SIMPLICIAL_HESSIAN_BRIDGE.md`.

Die deterministische Ergebnisdatei `collective_spin2_hessian.json` hat
SHA-256 `0773F2938CC391B850A9282379333359FDF54B665DCEF71CC21E08E0A03F8F53`.
