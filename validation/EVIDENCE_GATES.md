# Evidenz-Gates für einen empirischen SubQG-Nachweis

Die Aussage „SubQG beschreibt die Gravitation unseres Universums“ gilt in
diesem Projekt erst dann als empirisch gestützt, wenn nicht nur interne
Gleichungen, sondern unabhängige Messklassen mit demselben Modell erklärt
werden. Kein einzelnes Gate reicht allein aus.

| Gate | Mindestanforderung | Aktueller Status |
|---|---|---|
| G1 Interne Mathematik | Formale Konsistenz der verwendeten Gleichungen | bestanden, Lean- und Numeriknachweise vorhanden |
| G2 Galaxien | Eingefrorene globale Gleichung auf ganzen Holdout-Galaxien | SPARC-Holdout und LITTLE-THINGS-Außentest ausgeführt: klar besser als Newton; gegenüber RAR statistisch noch nicht eindeutig; externe Reproduktion offen |
| G3 Linsenwirkung | Dieselbe Metrik erklärt Dynamik und Linsen ohne getrennte Anpassung | Spin-2-No-Slip `gamma=1` formal bewiesen und mit 80 starken Linsen kompatibel; skalare Mikrowirkung ist gegappt, mikro-zu-Spin-2-Matching und Rohdatentest offen |
| G4 Lokale Gravitation | Labor, Äquivalenzprinzip und inverse-square-Grenzen | offen |
| G5 Sonnensystem/Pulsare | Post-Newtonsche Observablen und Timing | offen |
| G6 Gravitationswellen | Ausbreitung, Dispersion und Polarisation | offen |
| G7 Kosmologie | CMB, BAO, Strukturbildung und Haufen | offen |
| G8 Robustheit | Systematiken, alternative Datensätze und unabhängige Reproduktion | offen |

## Verbindliche Regeln

1. Ein Parameter wird ausschließlich auf einer ausdrücklich bezeichneten
   Kalibrationsmenge bestimmt.
2. Holdout-Daten werden nicht zur Modelländerung oder Parameterauswahl benutzt.
3. Jede Änderung der Gleichung erzeugt eine neue Modellversion; alte
   Fehlschläge bleiben erhalten.
4. Vergleichsmodelle erhalten dieselben Daten, Fehlerannahmen und
   Freiheitsgrade.
5. Berichtet werden auch Bias, Streuung, reduzierte Chi-Quadrat-Werte,
   Ausreißer und negative Resultate.
6. Ein astrophysikalischer Fit ersetzt keine lokale oder relativistische
   Prüfung.
7. „Empirisch bewiesen“ wird erst nach unabhängiger Reproduktion und dem
   Bestehen aller relevanten Gates verwendet.

## Eingefrorenes Galaxienmodell v1

```text
g_SubQG(g_bar; a0) = sqrt(g_bar^2 + g_bar*a0)
```

Freie globale Parameter: genau einer (`a0`).

Die erste SPARC-Auswertung dient als Entwicklungs- und Baseline-Test. Da das
Protokoll innerhalb desselben Projekts entwickelt und ausgeführt wurde, zählt
sie nicht als unabhängige Replikation. Der anschließende LITTLE-THINGS-Test
verwendet einen externen, zuvor nicht zur Entwicklung verwendeten Survey und
übernimmt das Modell ohne Form- oder Parameteränderung. Er bestätigt die klare
Verbesserung gegenüber Newton. Eine Reproduktion durch eine unabhängige
Forschungsgruppe und die nichtgalaktischen Gates bleiben offen.
