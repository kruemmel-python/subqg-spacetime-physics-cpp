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
