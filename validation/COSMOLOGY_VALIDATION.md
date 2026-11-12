# Kosmologischer Außentest der vorhandenen Hubble-Skalierung

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

Da die Beobachtung eine einzige lineare Steigung über `0,33<z<1,44` fitten,
wird als gleichartige Modellgröße die Sekantensteigung über exakt dasselbe
Intervall verwendet:

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

## Ergebnis

Die SubQG-Sekantensteigung `1,123e-10` liegt nicht im publizierten
95-Prozent-Intervall `[1,49; 1,70]e-10`. Der nominelle Abstand beträgt rund
9 Standardabweichungen, wobei diese Zahl weder Parameterkovarianzen noch eine zusätzliche Modellunsicherheit
enthält; die verbindliche Entscheidung verwendet deshalb nur das direkt
publizierte 95-Prozent-Intervall.

Damit ist **die bisherige Hypothese `a0 proportional H(z)` falsifiziert**.
Dies widerlegt nicht automatisch alle lokalen SubQG-Gravitationsresultate,
aber die Brücke darf nicht mehr als bestätigte kosmologische Vorhersage
verwendet werden.

## Konsequenz

Gate G7 ist nicht bestanden. Vor Aussagen zu CMB, BAO oder Strukturbildung
müssen `H(z)`, `a0(z)` und das Wachstum kosmologischer Störungen aus einer
SubQG-Hintergrund- und Störungsgleichung hergeleitet werden. Eingesetzte
Lambda-CDM-Parameter sind keine SubQG-Vorhersage.

Reproduktion:

```powershell
npm run validation:cosmology
```
