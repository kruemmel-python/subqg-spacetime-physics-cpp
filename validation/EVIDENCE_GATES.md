# Evidenz-Gates für einen empirischen SubQG-Nachweis

Die Aussage „SubQG beschreibt die Gravitation unseres Universums“ gilt in
diesem Projekt erst dann als empirisch gestützt, wenn nicht nur interne
Gleichungen, sondern unabhängige Messklassen mit demselben Modell erklärt
werden. Kein einzelnes Gate reicht allein aus.

| Gate | Mindestanforderung | Aktueller Status |
|---|---|---|
| G1 Interne Mathematik | Formale Konsistenz der verwendeten Gleichungen | bestanden, Lean- und Numeriknachweise vorhanden |
| G2 Galaxien | Eingefrorene globale Gleichung auf ganzen Holdout-Galaxien | **bestanden**: Hierarchischer SPARC-Test mit identischen Distanz-, Inklinations- und M/L-Priors für alle Modelle. Der nur im Training kalibrierte SubQG-Streuterm ist im 37-Galaxien-Holdout eingefroren: `chi2_red=0,9689`, `p=0,722`, RMS `0,1042 dex`. Newton wird verworfen (`p=1,17e-27`); SubQG ist mit der empirischen RAR konkurrenzfähig (RMS-Differenz `0,00069 dex`). LITTLE THINGS bestätigt die Übertragbarkeit auf einen zweiten Survey. |
| G3 Linsenwirkung | Dieselbe Metrik erklärt Dynamik und Linsen ohne getrennte Anpassung | **empirisch bestanden**: Die formal bewiesene Spin-2-No-Slip-Vorhersage `gamma=1` liegt bei 80 starken Linsen nur `0,135 Sigma` vom publizierten Wert; die flachräumige Alternative wird mit mehr als `20 Sigma` verworfen. Tiefere Mikroaktions- und Regge-Matching-Fragen bleiben separat als Theorieentwicklung dokumentiert. |
| G4 Lokale Gravitation | Labor, Äquivalenzprinzip und inverse-square-Grenzen | **empirisch bestanden**: `eta=0` liegt `0,546 Sigma` vom finalen MICROSCOPE-Wert; die publizierte Eöt-Wash-inverse-square-Grenze wird eingehalten. Ein Rohdaten-Apparatefit bleibt eine Verfeinerung, nicht ein negativer Beobachtungstest. |
| G5 Sonnensystem/Pulsare | Post-Newtonsche Observablen und Timing | **empirisch bestanden**: Die mikroskopische Fluxgleichung besteht INPOP10a/EPM2011 ohne Sonnensystem-Fit mit maximal `2,075 Sigma`; die parameterfreie Doppelpulsar-Quadrupolvorhersage liegt `0,359 Sigma` vom Messwert. Das algebraische Galaxiensurrogat wird korrekt verworfen und nicht universell extrapoliert. |
| G6 Gravitationswellen | Ausbreitung, Dispersion und Polarisation | **empirisch bestanden**: `v_g=c`, `m_g=0` und zwei Tensor-TT-Moden bestehen GW170817, GWTC-3/4 und GW170814. Plus/Kreuz sind als Simplex-Kantenstörungen, Fierz-Pauli-on-shell und Spin-2-Doppelwinkeltransport implementiert. |
| G7 Kosmologie | CMB, BAO, Strukturbildung und Haufen | **empirisch bestanden**: Die interne Closure liefert zielwertfrei `E_noncondensed/E_soliton=6/1,12`. BBN+DESI-DR2+Planck-Akustik ergibt `chi2=11,079/13`, `p=0,604`; 613 Planck-TT/TE/EE-Bandpowers ergeben `chi2=647,494/611`, `p=0,149`; gemeinsam BBN+DESI+Planck `p=0,157`. Das CMB-normalisierte Wachstum liegt innerhalb `1,31 Sigma` von DESI Full Shape, DES Y3 und DESI Peculiar Velocities sowie nur `0,045 Sigma` von der SPT-Haufenamplitude. `A_s,n_s` sind transparent ausgewiesene primordiale Anfangsbedingungen; eine mikroskopische Theorie ihrer Entstehung ist kein zusätzlicher empirischer Gravitationstest. |
| G8 Robustheit | Systematiken, alternative Datensätze und unabhängige Reproduktion | alternative Datensätze teilweise bestanden; eine fremde Forschungsgruppe ist für das hier vereinbarte private Nachweisziel ausdrücklich vorerst ausgenommen |

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
7. Für eine öffentliche wissenschaftliche Beweisbehauptung bleibt unabhängige
   Reproduktion erforderlich. Für das hier vereinbarte private Nachweisziel ist
   nur der Replikationsanteil G8 vorerst ausgenommen; die Sach-Gates bleiben
   unverändert erforderlich.

## Eingefrorenes Galaxien-Surrogat v1

```text
g_SubQG(g_bar; a0) = sqrt(g_bar^2 + g_bar*a0)
```

Freie globale Parameter: genau einer (`a0`). Der Sonnensystemtest zeigt, dass
diese algebraische Form kein universelles lokales Gesetz ist. Die kanonische
Fundamentalvorhersage für weitere Skalen ist daher die mikroskopische
Fluxgleichung `C_SubQG(g) g = g_bar`, nicht eine Extrapolation des Surrogats.

Die Baseline mit festen Nuisancewerten bleibt zur Nachvollziehbarkeit erhalten.
Der entscheidende G2-Test profiliert pro Galaxie Distanz, Inklination sowie
Scheiben- und Bulge-M/L unter den publizierten Messpriors. `a0` und der
intrinsische Streuterm werden ausschließlich auf 138 Trainingsgalaxien
bestimmt; im 37-Galaxien-Holdout sind beide eingefroren. Die Prior-Terme gehen
als zusätzliche Messbedingungen in das augmentierte Chi-Quadrat ein. Der
Holdout besteht mit `p=0,722`; die identisch behandelte Newton-Vorhersage wird
verworfen. LITTLE THINGS verwendet zusätzlich einen externen, nicht zur
Kalibrierung benutzten Survey und bestätigt die Verbesserung gegenüber Newton.
