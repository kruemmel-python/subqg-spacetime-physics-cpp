# Sonnensystem: parameterfreier Periheltest

## Vorab festgelegte Modelle

Der Test verändert weder die galaktische Kalibration noch die Gleichungen.
Er prüft zwei bereits vorhandene SubQG-Pfade getrennt:

1. algebraisches Dual-Strain-Surrogat
   `g = sqrt(g_N² + a0 g_N)` mit dem ausschließlich auf dem SPARC-Training
   bestimmten `a0 = 1,465548e-10 m/s²`;
2. mikroskopische Fluxgleichung `C_SubQG(g) g = g_N` mit den unveränderten
   Graphkonstanten und ohne Katalogfit.

## Analytische Hochfeldgrenze

Für Dual-Strain gilt exakt

```text
delta_g = sqrt(g_N² + a0 g_N) - g_N
        = a0 / (sqrt(1 + a0/g_N) + 1)
        -> a0/2
```

Damit verbleibt im Sonnensystem eine nahezu konstante zusätzliche
Beschleunigung von `7,32774e-11 m/s²` zur Sonne. Für eine konstante radiale
Zusatzbeschleunigung `A` lautet die orbitgemittelte Gauss-Gleichung

```text
<dot(varpi)> = -A sqrt(1-e²)/(n a)
```

Die Pipeline integriert für Dual-Strain die vollständige radiusabhängige
Beschleunigung numerisch über 65.536 Punkte je Umlauf. Der Test reproduziert
die analytische Konstantbeschleunigungsformel auf besser als `1e-12` relativ.

Die mikroskopische Leitfähigkeit ist dagegen schon beim jeweils kleinsten
Newtonfeld am Aphel aller sechs Planeten exakt `C_SubQG = 1`. Da die
mikroskopische Besetzungsfunktion monoton mit dem Feld wächst und bei `1`
gekappt ist, gilt dies auf dem gesamten Umlauf. Die Fluxgleichung reduziert
sich dort exakt auf `g = g_N`.

## Beobachtungen

Verwendet werden die zusätzlichen Perihelraten aus INPOP10a Tabelle 5. Diese
Intervalle wurden mit gleichzeitiger Neuanpassung der planetaren
Anfangsbedingungen, des solaren `GM` und der Asteroidenmassen bestimmt und
entsprechen weniger als fünf Prozent Verschlechterung der Postfit-Residuen.

Die J2000-Bahnelemente stammen aus der offiziellen JPL-Tabelle für 1800–2050.
Kein Sonnensystemparameter wird an SubQG angepasst.

Als unabhängige Replikation dient EPM2011 Tabelle 4, gewonnen aus ungefähr
678.000 Positionsbeobachtungen von Planeten und Raumfahrzeugen. Die dort in
`mas/Jahr` angegebenen Werte werden exakt mit Faktor 100 in `mas/Jahrhundert`
umgerechnet.

## Ergebnis

| Planet | INPOP10a [mas/cy] | Dual-Strain [mas/cy] | Dual-Strain-Abstand | Mikro-Flux [mas/cy] |
|---|---:|---:|---:|---:|
| Merkur | `0,4 ± 0,6` | -975,07 | -1.625,78 Sigma | 0 |
| Venus | `0,2 ± 1,5` | -1.361,97 | -908,11 Sigma | 0 |
| Erde-Mond-Baryzentrum | `-0,2 ± 0,9` | -1.601,20 | -1.778,89 Sigma | 0 |
| Mars | `-0,04 ± 0,15` | -1.968,13 | -13.120,63 Sigma | 0 |
| Jupiter | `-41 ± 42` | -3.648,54 | -85,89 Sigma | 0 |
| Saturn | `0,15 ± 0,65` | -4.938,25 | -7.597,54 Sigma | 0 |

Folgerung:

- Das algebraische Dual-Strain-Surrogat ist als universelles lokales
  Gravitationsgesetz eindeutig falsifiziert. Es bleibt ausschließlich eine
  galaktische Vergleichs-/Näherungsform.
- Die vorbestehende mikroskopische Fluxgleichung besteht beide Ephemeriden-
  Tests ohne neue Parameter; ihr größter Abstand beträgt `2,074 Sigma`
  (EPM2011-Jupiter), bei INPOP10a `0,9762 Sigma`.
- Dies ist ein bestandener Sonnensystem-Periheltest der Fluxgleichung, aber
  noch kein vollständiges G5: binäre Pulsare und weitere post-Newtonsche
  Observablen bleiben offen.

## Reproduktion

```powershell
npm run validation:solar-system
```

Ergebnisdatei: `validation/results/solar_system_perihelion_validation.json`
SHA-256: `BD2C99EB3D1B930EB3C0C5918E0596CF85F3F1AFE13AA073F03560F8ED8B5B7A`.
Zwei unmittelbar aufeinanderfolgende Läufe erzeugten byteidentische Dateien.

Quellen:

- Fienga et al., *Celestial Mechanics and Dynamical Astronomy* 111 (2011),
  [arXiv:1108.5546](https://arxiv.org/abs/1108.5546),
  DOI `10.1007/s10569-011-9377-8`.
- Pitjeva & Pitjev, *Astronomy Letters* 39 (2013),
  [arXiv:1306.3043](https://arxiv.org/abs/1306.3043).
- [JPL Solar System Dynamics: Approximate Positions of the Planets](https://ssd.jpl.nasa.gov/planets/approx_pos.html).
