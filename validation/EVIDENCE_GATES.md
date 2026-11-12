# Evidenz-Gates für einen empirischen SubQG-Nachweis

Die Aussage „SubQG beschreibt die Gravitation unseres Universums“ gilt in
diesem Projekt erst dann als empirisch gestützt, wenn nicht nur interne
Gleichungen, sondern unabhängige Messklassen mit demselben Modell erklärt
werden. Kein einzelnes Gate reicht allein aus.

| Gate | Mindestanforderung | Aktueller Status |
|---|---|---|
| G1 Interne Mathematik | Formale Konsistenz der verwendeten Gleichungen | bestanden, Lean- und Numeriknachweise vorhanden |
| G2 Galaxien | Eingefrorene globale Gleichung auf ganzen Holdout-Galaxien | SPARC-Holdout und LITTLE-THINGS-Außentest ausgeführt: klar besser als Newton; gegenüber RAR statistisch noch nicht eindeutig; externe Reproduktion offen |
| G3 Linsenwirkung | Dieselbe Metrik erklärt Dynamik und Linsen ohne getrennte Anpassung | Spin-2-No-Slip `gamma=1` formal bewiesen und mit 80 starken Linsen kompatibel; lokale Tensor-Kinematik, parameterfreie 116-Zellen-Auswahl samt exakter Indikator- und endlicher Strafwirkung, masseloser TT-Hessian, Spin-2-Transport und 84 Holonomien hergeleitet; ein No-Go-Audit zeigt, dass die aktuelle festtopologische Kantenquadratik die fehlenden Zellvariablen nicht erzeugt – deren tiefere Herleitung, Regge-/Einstein-Matching und Rohdatentest bleiben offen |
| G4 Lokale Gravitation | Labor, Äquivalenzprinzip und inverse-square-Grenzen | bedingt bestanden: formale Vorhersage `eta=0` liegt 0,546 Sigma vom finalen MICROSCOPE-Wert; Eöt-Wash-Nullbefund im gesättigten terrestrischen Regime kompatibel; Standardmodell-zu-SubQG-Materiekopplung und direkter Apparatefit offen |
| G5 Sonnensystem/Pulsare | Post-Newtonsche Observablen und Timing | INPOP10a/EPM2011 bestanden; führende parameterfreie Doppelpulsar-Quadrupolvorhersage 0,359 Sigma vom Messwert; vollständige starke-Feld-Mikro-Closure offen |
| G6 Gravitationswellen | Ausbreitung, Dispersion und Polarisation | direkte Vorhersagen `v_g=c`, `m_g=0` und zwei Tensor-TT-Moden bestehen GW170817, GWTC-3/4 und GW170814; Plus/Kreuz sind als Simplex-Kantenstörungen rekonstruiert, Fierz-Pauli-on-shell und über geschlossene Schleifen als Spin-2-Doppelwinkel transportiert; vollständiges Wirkungs-Matching und universelle Quellenkopplung bleiben offen |
| G7 Kosmologie | CMB, BAO, Strukturbildung und Haufen | nicht bestanden: der erste unabhängige Hochrotverschiebungstest falsifiziert die bisherige Ansatzskalierung `a0(z) proportional H(z)` am publizierten 95-%-Intervall von MUSE-DARK III; eine eigene SubQG-Friedmann- und Störungsgleichung fehlt |
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

## Eingefrorenes Galaxien-Surrogat v1

```text
g_SubQG(g_bar; a0) = sqrt(g_bar^2 + g_bar*a0)
```

Freie globale Parameter: genau einer (`a0`). Der Sonnensystemtest zeigt, dass
diese algebraische Form kein universelles lokales Gesetz ist. Die kanonische
Fundamentalvorhersage für weitere Skalen ist daher die mikroskopische
Fluxgleichung `C_SubQG(g) g = g_bar`, nicht eine Extrapolation des Surrogats.

Die erste SPARC-Auswertung dient als Entwicklungs- und Baseline-Test. Da das
Protokoll innerhalb desselben Projekts entwickelt und ausgeführt wurde, zählt
sie nicht als unabhängige Replikation. Der anschließende LITTLE-THINGS-Test
verwendet einen externen, zuvor nicht zur Entwicklung verwendeten Survey und
übernimmt das Modell ohne Form- oder Parameteränderung. Er bestätigt die klare
Verbesserung gegenüber Newton. Eine Reproduktion durch eine unabhängige
Forschungsgruppe und die nichtgalaktischen Gates bleiben offen.
