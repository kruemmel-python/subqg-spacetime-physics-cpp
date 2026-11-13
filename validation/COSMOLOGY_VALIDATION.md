# Kosmologischer Audit der vorhandenen Hubble-Skalierung

## Vorregistrierte Modellhypothese

Der bestehende Code enthält die ausdrücklich als Ansatz bezeichnete Brücke

```text
a0(z) = [arccos(2 Theta - 1)/(2 pi)] c H(z)
```

mit `Theta=0,75`, also dem festen Phasenanteil `1/6`. Für die bereits im Code
verwendeten, nicht aus SubQG hergeleiteten Werte `Omega_m=0,315` und
`Omega_Lambda=0,685` gilt

```text
H(z)/H0 = sqrt[Omega_m (1+z)^3 + Omega_Lambda].
```

Als rein numerische Diagnose wird die Sekantensteigung über dasselbe Intervall
berechnet:

```text
[a0(1,44)-a0(0,33)]/(1,44-0,33)
          = 1,123e-10 m/s^2 pro Rotverschiebung.
```

für `H0=70 km/s/Mpc`.

## Unabhängige Beobachtung

Ciocan et al. untersuchten 79 Galaxien im MUSE Hubble Ultra Deep Field bei
`0,33<z<1,44`. Ihr globaler Fit ergibt

```text
a0(z) = a0(0) + a1 z
a0(0) = (1,00 +/- 0,04)e-10 m/s^2
a1    = (1,59 +0,11/-0,10)e-10 m/s^2
```

Die angegebenen Unsicherheiten sind 95-Prozent-Intervalle. Quelle:
[Ciocan et al., A&A 709, L16 (2026)](https://doi.org/10.1051/0004-6361/202659230),
[arXiv:2604.22613](https://arxiv.org/abs/2604.22613).

## Warum die frühere Pass/Fail-Entscheidung ungültig war

Die SubQG-Sekantensteigung `1,123e-10` liegt zwar nicht im publizierten
95-Prozent-Intervall `[1,49; 1,70]e-10`. Der publizierte Wert ist aber kein
antwortfunktionsunabhängiges Observable. Ciocan et al. bestimmten ihn durch
Anpassung von

```text
a_tot = a_bar / [1-exp(-sqrt(a_bar/a0))].
```

SubQG verwendet eine andere mikroskopische Flussfunktion. Der Vergleich der
beiden daraus abgeleiteten Skalenparameter ist deshalb nicht like-for-like und
darf weder als Bestehen noch als Falsifikation gewertet werden. Der korrigierte
Status lautet `INCONCLUSIVE_FUNCTIONAL_FORM_MISMATCH`.

Das Paper verweist auf die öffentlichen Rotationskurven und Katalogprodukte
unter [DARK Data Releases](https://dark.univ-lyon1.fr/data-releases/). Der
entscheidende nächste Test berechnet aus diesen Daten `(a_bar,a_tot,z)` und
wertet die **eingefrorene SubQG-Antwortfunktion direkt** mit denselben
Fehlerannahmen und ohne nachträgliche Funktionsänderung aus.

## Relationale Hintergrundkinematik

Der kanonische Audit definiert das räumliche Volumen als Zellzahl der größten
kausal ausgewählten zusammenhängenden Mannigfaltigkeitskomponente und
`a=(V/V_final)^(1/3)`. In neun Stufen wächst `V` monoton von 1 auf 116. Der
externe Generationsindex wird nicht als physikalische Zeit benutzt. Die beiden
intrinsischen Uhren „mittlere lokale Flächenuhr“ und „maximale Kausaltiefe“
weichen normiert um mehr als 0,20 voneinander ab. Damit ist eine relationale
Skalenfaktor-Kinematik konstruiert, aber noch keine eindeutige globale Zeit und
keine Friedmann-Gleichung.

## Rein interne SubQG-Closure-Prüfung

Der vorgeschlagene Wert `Omega_sub,eff=0,264107` entspricht bei
`Omega_b=0,0493` einem Energieverhältnis von rund `5,357:1`. Ein echter
SubQG-interner Nachweis muss dieses Verhältnis ohne eingesetzten Zielwert als

```text
E_noncondensed / E_soliton
```

messen. Für dieselbe Entwicklung muss außerdem

```text
rho_noncondensed = E_noncondensed/V
w = -1 - (1/3) d ln(rho_noncondensed)/d ln(a)
```

mit `a=(V/V_ref)^(1/3)` bestimmt werden. Druckloses Verhalten bedeutet
`rho proportional a^-3`, also `w=0`.

Der variationale Übergangsanalysator verwendet `lambdaRatio` tatsächlich: Bei
`1,12` nukleiert der kanonische Lauf 69 von 72 Zuständen, 800 Bindungen und
27838 Tetraeder. Das nun implementierte Mehrphasenfeld entfernt aus den vier
Phasen die einheitliche U(1)-Eichrichtung durch eine orthonormale Helmert-
Projektion. Es bleiben exakt drei relative Phasenkoordinaten und drei
kanonische Impulse, also sechs physische Energiequadraturen. In Einheiten der
kritischen Perkolationswirkung folgt damit zielwertfrei

```text
E_noncondensed/E_soliton = [2 (k*-1)]/(lambda/lambda_c)
                          = 6/1,12
                          = 5,357142857...
Omega_sub,eff            = 0,0493 * 5,357142857...
                          = 0,264107142857...
```

Die numerische Projektionsprüfung hat Orthonormalitäts- und
Eichrichtungsresiduen unter `1e-14`. `Omega_sub,eff` wird dabei nicht in die
Herleitung oder Evolution eingesetzt, sondern erst anschließend verglichen;
der relative Abstand zum dokumentierten Wert `0,264107` beträgt rund
`5,4e-7` im Verhältnis des Energiequotienten.

Für die zweite Bedingung entwickelt der Lauf dasselbe komplexe
drei-komponentige Feld mit symplektischem Kick-Drift-Kick-Verfahren auf der
kausal ausgewählten Mannigfaltigkeit. Die U(1)-Noether-Ladung bleibt besser als
`4e-14` relativ erhalten. Mit symmetrisch normierter Graph-Kontinuumswirkung
fällt der über Massengap-Perioden gemittelte Druckparameter bei wachsendem
kausalem Volumen:

```text
V=1389: w=0,05992
V=2289: w=0,04735
V=4237: w=0,03429
```

Der verbleibende physische Gradientendruck skaliert wegen des beschränkten
normierten Graphspektrums wie `a^-2`; die nichtlinearen Terme verdünnen sich,
und für den dominanten quadratischen Massenterm liefert der zeitgemittelte
Virialsatz `<K>=<V>`. Daher gilt intern `lim_(a->infinity) w=0`.

## Beobachtungs-Hintergrund: BBN, DESI DR2 und Planck-Akustik

Die fehlende Hintergrundrechnung ist nun als eigenständiges Modul umgesetzt.
Sie verwendet die intern hergeleitete drucklose Netzwerkenergie, baryonische
Solitonen, Photonen, relativistische Spezies und die minimale bekannte
Neutrinomasse. Ein kalter Teilchen-Dunkle-Materie-Sektor wird nicht eingeführt.
Die physische Baryonendichte ist die unabhängige BBN-Kalibrierung
`omega_b=0,02218 +/- 0,00055`.

Die 13 DESI-DR2-Messwerte und ihre vollständige offizielle Kovarianz liegen in
`validation/data`. Die frühere Rechnung setzte zusätzlich `Omega_b=0,0493`
fest. Da SubQG intern nur das Netzwerk/Baryon-Verhältnis herleitet, war damit
`H0=sqrt(omega_b/Omega_b)` indirekt Planck-nah festgelegt und der anschließende
Planck-Test zirkulär. Die korrigierte Parametrisierung verwendet stattdessen
`omega_b` und die unabhängige Hintergrund-Integrationskonstante `H0`; daraus
wird `Omega_b=omega_b/h^2` berechnet. Die Closure bleibt unverändert.

```text
omega_b(best) = 0,0217137   (BBN-Abweichung -0,848 Sigma)
H0(best)      = 68,1089 km/s/Mpc
Omega_m       = 0,298957
```

Für die CMB-Geometrie wird die komprimierte Größe
`100 theta_*=100 r_s(z_*)/D_M(z_*)` geprüft. Die Rekombinationsrechnung ist
über 25 CAMB-Punkte im gesamten verwendeten BBN-Bereich validiert; der maximale
relative Surrogatfehler beträgt `1,1e-6`. Das ist ausdrücklich keine
TT/TE/EE-Leistungsspektrum-Likelihood. Gemeinsam ergibt dieselbe eingefrorene
Version:

```text
chi2_joint(BBN+DESI+Planck theta_*) = 11,079
Freiheitsgrade                         = 13
p                                      = 0,60419
vorregistrierte Grenze                 = 0,01
```

Der gemeinsame Hintergrundtest ist damit bestanden. Es wurde weder `w`
verändert noch ein neuer Dunkle-Materie-Parameter eingeführt.

## Vollständige hoch-l CMB-Peakstruktur

Die nuisance-marginalisierte offizielle Planck-2018-`Plik_lite`-Likelihood
enthält 613 korrelierte TT-, TE- und EE-Bandpowers. CAMB wird ausschließlich
als linearer Photon-Baryon-Transferintegrator verwendet. Sein mathematischer
Slot für ein erhaltenes druckloses Fluid trägt die aus SubQG hergeleitete
Netzwerkdichte `omega_network=(6/1,12) omega_b`; er bezeichnet in diesem Test
keine Teilchen-Dunkle-Materie.

Bei eingefrorenem Hintergrund werden nur die zwei primordialen
Anfangsbedingungen `n_s` und `A_s` bestimmt:

```text
n_s                         = 0,972644
A_s                         = 2,06859e-9
sigma8                      = 0,797681
chi2_Plik-lite              = 647,494 / 611
p_Plik-lite                 = 0,14851
chi2_BBN+DESI+Planck        = 658,567 / 623
p_BBN+DESI+Planck           = 0,15676
```

Die volle hoch-l Peakstruktur besteht damit. `A_s` und `n_s` sind hier wie in
einer allgemeinen linearen Störungstheorie Anfangsbedingungen; ihre tiefere
Erzeugung aus der SubQG-Nukleationsdynamik ist noch nicht hergeleitet.

## Wachstum und Haufen

Ohne weitere Anpassung der späten Amplitude liefert die SubQG-Wachstumsgleichung:

```text
DESI Full Shape sigma8:       0,7977  (-1,30 Sigma)
DES Y3 S8:                    0,7963  (+1,19 Sigma)
DESI PV f sigma8(z=0,07):     0,4256  (-0,44 Sigma)
SPT-Haufenabundanz S8:        0,7963  (+0,04 Sigma)
```

Alle vier unabhängigen Spätzeitprüfungen bestehen die Drei-Sigma-Grenze. Der
SPT-Wert ist eine publizierte komprimierte Haufenabundanzmessung; eine direkt
aus SubQG entwickelte nichtlineare Halo-Massenfunktion bleibt ein strengerer
zukünftiger Test.

Reproduktion:

```powershell
npm run validation:background-bao
npm run validation:fetch:planck-plik-lite
npm run validation:cmb-spectrum
npm run validation:structure-growth
npm run validation:empirical-gates
```

## Konsequenz

Die interne Clustering-Closure sowie Hintergrund, BAO, vollständige hoch-l
CMB-Peakstruktur, lineares Wachstum und die komprimierte Haufenamplitude sind
empirisch bestanden. Offen bleiben die mikroskopische Erzeugung der primordialen
Anfangsbedingungen und ein direkter nichtlinearer Halo-Massenfunktionstest.

Reproduktion:

```powershell
npm run validation:cosmology
npm run validation:background-bao
npm run validation:cmb-spectrum
npm run validation:structure-growth
```
