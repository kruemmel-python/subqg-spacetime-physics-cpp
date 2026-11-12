# Lokale Gravitation: Äquivalenzprinzip und inverses Quadratgesetz

## Parameterfreie SubQG-Vorhersage

Im kanonischen Paketmodell werden dieselbe Objektdichte und ihre Norm sowohl
für die metrische Kraft als auch für die Trägheitsmasse verwendet:

```text
F_metric = M_object * g
M_inertial = M_object
a = F_metric / M_inertial = g
```

Für zwei beliebige nichtleere Dichteprofile `A` und `B` im selben konstanten
Feld folgt daher

```text
eta_AB = 2(a_A-a_B)/(a_A+a_B) = 0.
```

Der Satz ist als `SubQG.universal_free_fall_eotvos_zero` in Lean bewiesen.
Er ist exakter als die endliche Auflösung des früheren numerischen
Apfelversuchs.

## MICROSCOPE

Die finale MICROSCOPE-Auswertung vergleicht Körper aus Ti/Al/V und Pt/Rh und
misst

```text
eta(Ti,Pt) = [-1,5 ± 2,3 (stat) ± 1,5 (syst)] * 10^-15.
```

Quadratische Kombination der unabhängigen Unsicherheiten ergibt
`sigma = 2,7459e-15`. Die SubQG-Vorhersage `eta=0` liegt damit nur
`0,546 Sigma` vom Messzentrum entfernt. Es wird kein Parameter angepasst.

Aus der publizierten mittleren Umlauffrequenz `0,16818 mHz` folgt ein
Erdfeld von ungefähr `7,90 m/s²` am Satelliten. Die mikroskopische
Fluxgleichung befindet sich dort extrem tief im Hochfeldbereich. Der
analytische Logarithmus der oberen Schranke für `1-C_SubQG` wird in der
Ergebnisdatei festgehalten, statt einen numerischen Unterlauf einfach als
physikalische Null auszugeben.

## Inverses Quadratgesetz

Lee et al. prüften Newtons Gesetz zwischen `52 µm` und `3,0 mm`. Newtonsche
Gravitation beschreibt die Daten gut; eine Yukawa-Wechselwirkung mit
Gravitationsstärke muss bei 95 % Konfidenz eine Reichweite unter `38,6 µm`
haben.

Im terrestrischen Gesamtfeld ist `C_SubQG` einschließlich seiner
Feldableitung exponentiell ununterscheidbar von eins. Unter der kanonischen
Totalgradienten-Closure gehorchen kleine zusätzliche Laborfelder deshalb
exakt der linearisierten Newton-Antwort; SubQG fügt keinen Yukawa-Term hinzu.
Der publizierte Nullbefund ist damit kompatibel.

## Wissenschaftliche Grenze dieses Gates

Das Ergebnis ist ein **bedingter lokaler Kompatibilitätsnachweis**, noch kein
vollständig geschlossenes G4:

- Lean beweist Universalität für beliebige SubQG-Dichteprofile.
- Noch nicht aus Standardmodell-Mikrophysik hergeleitet ist, dass chemisch
  verschiedene Ti- und Pt-Zustände ausschließlich über genau diese eine
  universelle Dichte koppeln.
- Die vollständige dreidimensionale Geometrie und Rohdaten-Likelihood der
  Eöt-Wash-Torsionswaage wurden noch nicht rekonstruiert.

Diese offenen Punkte werden nicht durch einen nachträglichen Parameterfit
verdeckt.

## Reproduktion

```powershell
npm run validation:local-gravity
npm run verify:lean
```

Ergebnisdatei: `validation/results/local_gravity_validation.json`

SHA-256: `9F47969315E2F5804BEDE0AB7E90F215021BC2B1F20E619EA8EE72BA288F946D`.
Zwei unmittelbar aufeinanderfolgende Läufe erzeugten byteidentische Dateien.

Quellen:

- Touboul et al., [arXiv:2209.15487](https://arxiv.org/abs/2209.15487).
- Lee et al., [arXiv:2002.11761](https://arxiv.org/abs/2002.11761).
- [IERS Conventions, numerische Standards](https://iers-conventions.obspm.fr/conventions/content/tn36.pdf).
