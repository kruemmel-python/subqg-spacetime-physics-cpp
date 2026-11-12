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
