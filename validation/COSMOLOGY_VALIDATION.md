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
27838 Tetraeder in einer zusammenhängenden Raumzeitkomponente. Der getrennte
Genesis-Code speichert `lambdaRatio=1,12` dagegen nur; seine Nukleation wird
über einen festen `linkThreshold` entschieden und `lambdaRatio` geht nicht in
die Feldentwicklung ein.

Deshalb enthält der neue Closure-Lauf nun eine gemeinsame, zielwertfreie
Entwicklung: Er übernimmt den lambda-gesteuerten Graphen, wählt mit der bereits
bewiesenen kausalen Regel eine orientierbare Mannigfaltigkeit, entwickelt das
bestehende nichtlineare Genesis-Feld auf der wachsenden Zellstruktur und
trennt Soliton- und freie Energie an der direkt aus `dV/dpsi=0` folgenden
Potentialseparatrix. Die intrinsische Volumenfolge endet bei 1924 Zellen und
ist unter symplektischer Zeitschrittverfeinerung stabil. Der aktuelle
Ein-Komponenten-Lauf misst jedoch nur ein Endverhältnis von rund `1,397:1` und
`w=-0,358`; er reproduziert die beiden Closure-Bedingungen also noch nicht.
Die nächste Implementationsstufe ist das vollständige gauge-reduzierte
Mehrphasenfeld mit exakt erhaltener Solitonenladung. Bis dieses denselben
zielblinden Test besteht, bleibt der CMB/BAO-Treffer ein Ansatz und keine
unabhängige Vorhersage.

## Konsequenz

Gate G7 ist **offen**. Der MUSE-Zusammenfassungsparameter entscheidet es nicht.
Vor Aussagen zu CMB, BAO oder Strukturbildung müssen der direkte
Beschleunigungsdatentest sowie `H(z)`, `a0(z)` und das Wachstum kosmologischer
Störungen aus einer SubQG-Hintergrund- und Störungsgleichung hergeleitet werden.
Eingesetzte Lambda-CDM-Parameter sind keine SubQG-Vorhersage.

Reproduktion:

```powershell
npm run validation:cosmology
```
