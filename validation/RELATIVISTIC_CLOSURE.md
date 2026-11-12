# Relativistische Closure: Dynamik und Lichtablenkung

## Warum Rotationskurven allein nicht genügen

Die nichtrelativistische Bewegung massiver Testkörper bestimmt im schwachen,
statischen Feld nur `Phi`:

```text
d²x/dt² = -grad(Phi)
```

Lichtablenkung misst dagegen `Phi + Psi`. In isotropen Koordinaten lautet die
schwache Metrik

```text
ds² = -(1 - 2U/c²)c²dt² + (1 + 2 gamma U/c²) dl²
gamma = Psi/Phi
```

Rotationskurven legen `U`, aber nicht automatisch `gamma` fest.

## Beobachtbare Konsequenz

Für eine feste dynamische Masse gilt

```text
S_lens(gamma) / S_lens(1) = (1 + gamma)/2
theta_E(gamma) / theta_E(1) = sqrt((1 + gamma)/2)
```

| Closure | `gamma` | relative Linsenstärke | relativer Einsteinradius |
|---|---:|---:|---:|
| gemeinsames Potential ohne Slip | 1 | 1 | 1 |
| zeitartiges Potential, räumlich flach | 0 | 0,5 | 0,7071 |
| konforme No-Lensing-Grenze | -1 | 0 | 0 |

## Formale Spin-2-Ableitung

Für die masselose linearisierte Spin-2-Gleichung

```text
box(bar(h)_mu_nu) = -16 pi G T_mu_nu / c^4
```

gilt bei statischer druckloser Materie `T00 = rho c²`, `Tij = 0`. Daher ist
`bar(h)00 = 4U/c²`, `bar(h)ij = 0` und `bar(h) = -4U/c²`. Die Spurumkehr gibt

```text
h00 = bar(h)00 - 1/2 eta00 bar(h) = 2U/c²
hij = bar(h)ij - 1/2 etaij bar(h) = 2U/c² delta_ij
```

also `Psi = Phi` und exakt `gamma = 1`. Lean verifiziert diese Algebra ohne
`sorry` oder `admit` durch:

- `linearized_spin_two_static_dust_no_slip`;
- `linearized_spin_two_static_dust_gamma_one`;
- `gamma_one_full_lensing_strength`.

Der kanonische IR-Prüfsektor implementiert den linearen Einstein-Operator der
masselosen Fierz-Pauli-Wirkung und bestätigt numerisch:

- zwei unabhängige transversale, spurlose Polarisationen `+` und `x`;
- masselose Dispersion `omega² = c² k²`;
- verschwindende Vakuumfeldgleichung für beide on-shell Wellen;
- reine Eichstörungen als exakte Nullrichtungen des Operators.

## Audit der ursprünglichen Mikrowirkung

Die vorhandene skalare Kantenwirkung besitzt die Hesse-Matrix

```text
H = anchor I + L_w
v^T H v = anchor ||v||² + sum w_ij (v_i-v_j)²
```

Alle Gewichte sind nichtnegativ und `anchor = 1`. Daher ist jeder Modus
mindestens um `1` gegappt. Im deterministischen Audit von 320 Kanten und 3.421
Kopplungspaaren beträgt der uniforme Eigenwert `1,0000000000000058` bei einem
Residuum von `5,83e-15`. Jede Kante hat außerdem nur eine skalare
Längenvariable. Die vorhandene Wirkung kann somit allein weder einen
masselosen Modus noch ein symmetrisches Spin-2-Tensorfeld liefern.

Lean formalisiert auch diesen Befund:

- `anchored_metric_hessian_lower_bound`;
- `positive_anchor_excludes_zero_metric_mode`.

Damit ist die Beweisgrenze exakt: Die Spin-2-No-Slip-Closure selbst ist
hergeleitet; offen ist das mikroskopische Matching der ursprünglichen
Graphdynamik auf diesen IR-Fixpunkt. Dafür müssen noch gezeigt werden:

1. Entstehung eines kollektiven symmetrischen Tensorsektors;
2. Verschwinden seines Ankerterms durch echte Eichsymmetrie im IR;
3. Lorentz-invariante masselose Dispersion;
4. universelle Kopplung massiver und masseloser Anregungen.

## Empirischer Zielwert

Cao et al. bestimmten aus 80 beobachteten starken Galaxienlinsen aus SLACS,
BELLS, LSD und SL2S

```text
gamma = 0,995 +0,037 / -0,047  (68 %, fiduziale Strukturparameter)
```

Die Autoren beziffern verbleibende Struktur-Systematiken auf ungefähr 25 %.
Die formal hergeleitete Spin-2-No-Slip-Closure ist kompatibel; eine räumlich
flache Newton-Closure liegt in der verwendeten asymmetrischen
Gaussian-Näherung mehr als 21 Standardabweichungen entfernt.

Das Evidenz-Gate G3 bleibt offen, bis das mikro-zu-IR-Matching bewiesen und
eine radienaufgelöste Linsenprobe ohne galaxienspezifische
Gravitationsparameter reproduziert wurde.

Primärquelle: Cao et al., *ApJ* 835, 92 (2017),
[arXiv:1701.00357](https://arxiv.org/abs/1701.00357),
DOI `10.3847/1538-4357/835/1/92`.
