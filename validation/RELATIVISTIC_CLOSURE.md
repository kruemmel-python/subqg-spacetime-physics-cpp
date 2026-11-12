# Relativistische Closure: Dynamik und Lichtablenkung

## Warum die Rotationskurve allein nicht genügt

Die nichtrelativistische Bewegung massiver Testkörper bestimmt im schwachen,
statischen Feld nur ein Potential `Phi`:

```text
d²x/dt² = -grad(Phi)
```

Lichtablenkung misst dagegen die Summe der beiden skalaren metrischen
Potentiale `Phi + Psi`. In isotropen Koordinaten kann die schwache Metrik als

```text
ds² = -(1 - 2U/c²)c²dt² + (1 + 2 gamma U/c²) dl²
gamma = Psi/Phi
```

geschrieben werden. Rotationskurven legen `U` fest, aber nicht automatisch
`gamma`. Ein Beweis der SubQG-Gravitation benötigt deshalb zusätzlich eine
Ableitung des räumlichen metrischen Potentials aus derselben Mikrowirkung.

## Beobachtbare Konsequenz

Für eine feste dynamische Masse skaliert die Linsenstärke relativ zu
`gamma = 1` mit

```text
S_lens(gamma) / S_lens(1) = (1 + gamma)/2
theta_E(gamma) / theta_E(1) = sqrt((1 + gamma)/2)
```

Damit liefern drei wichtige Fälle:

| Closure | `gamma` | relative Linsenstärke | relativer Einsteinradius |
|---|---:|---:|---:|
| gemeinsames Potential ohne Slip | 1 | 1 | 1 |
| zeitartiges Potential, räumlich flach | 0 | 0,5 | 0,7071 |
| konforme No-Lensing-Grenze | -1 | 0 | 0 |

## Aktueller SubQG-Status

Die Funktion `singleMetricNoSlipClosure()` bildet die notwendige
SubQG-Kandidatenclosure `Psi = Phi` und damit `gamma = 1` ab. Sie ist bewusst
als `conditional` markiert. Folgende drei Aussagen müssen noch aus der
kanonischen Mikrowirkung bewiesen werden:

1. Ein Lorentzsches Kontinuumsmetrikfeld entsteht aus der Graphwirkung.
2. Massive und masselose Anregungen koppeln minimal an dieselbe Metrik.
3. Eine statische kugelsymmetrische Quelle erzeugt im schwachen Feld keinen
   gravitativen Slip, also `Psi - Phi = 0`.

Die vorhandene `ActionWorld`-Dokumentation bezeichnet ihre diskrete
Kantenwirkung selbst als Forschungsansatz. `WaveWorld` weist außerdem darauf
hin, dass sein Integrationsparameter keine emergente physikalische Zeit und
sein Modell kein Lorentz-Nachweis ist. Diese beiden ehrlichen Einschränkungen
dürfen nicht durch eine nachträglich eingesetzte Einstein-Formel übersprungen
werden.

## Empirischer Zielwert

Cao et al. bestimmten aus 80 beobachteten starken Galaxienlinsen aus SLACS,
BELLS, LSD und SL2S

```text
gamma = 0,995 +0,037 / -0,047  (68 %, fiduziale Strukturparameter)
```

Die Autoren beziffern verbleibende Systematiken aus Massendichteprofil,
Geschwindigkeitsanisotropie und Lichtprofil auf ungefähr 25 %. Der
SubQG-No-Slip-Kandidat ist mit dem statistischen Intervall kompatibel. Eine
räumlich flache Newton-Closure ist in der verwendeten asymmetrischen
Gaussian-Näherung mehr als 21 Standardabweichungen entfernt.

Die Übereinstimmung ist ein notwendiger und bestandener **konditionaler**
Test. Das Evidenz-Gate G3 bleibt dennoch offen, bis `gamma = 1` aus der
SubQG-Mikrowirkung folgt und eine radienaufgelöste Linsenprobe ohne
galaxienspezifische Gravitationsparameter reproduziert wurde.

Primärquelle: Cao et al., *ApJ* 835, 92 (2017),
[arXiv:1701.00357](https://arxiv.org/abs/1701.00357),
DOI `10.3847/1538-4357/835/1/92`.
