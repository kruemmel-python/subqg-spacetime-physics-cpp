# Mikro-zu-Spin-2-Brücke: Tensor-Kinematik aus Kantenlängen

## Ergebnis

Der bisherige Audit behandelte jede skalare Kantenlänge isoliert und konnte
daher keine Tensorstruktur erkennen. Relational ist jedoch eine ganze
3-Simplex-Zelle die lokale geometrische Einheit. Ein Tetraeder besitzt sechs
Kantenlängen — genau so viele unabhängige Komponenten wie eine symmetrische
räumliche `3 x 3`-Metrik.

Wähle innerhalb des Simplex einen Knoten `0` als lokalen Ursprung und die
drei Kanten zu `1,2,3` als lokale Basis. Ohne äußere Koordinaten gilt durch
den Kosinussatz für die Gram-Matrix

```text
G_ii = d_0i
G_ij = (d_0i + d_0j - d_ij)/2
```

mit den quadrierten relationalen Kantenlängen `d_ij`. Die inverse Abbildung
ist

```text
d_0i = G_ii
d_ij = G_ii + G_jj - 2 G_ij.
```

Die lineare Abbildung der sechs Kantenstörungen auf die sechs unabhängigen
Metrikkomponenten hat Determinante `-1/8` und ist daher exakt invertierbar.
Damit können die vorhandenen skalaren Kantenfreiheitsgrade kollektiv jede
lokale symmetrische räumliche Tensorstörung darstellen. Es wurde kein neues
fundamentales Tensorfeld hinzugefügt.

## Prüfung am kanonischen Graphen

Für den bereits festgelegten Lauf `seed=42`, 400 Evolutionsschritte entstehen

- 60 Knoten,
- 320 Kanten,
- 745 Dreiecksflächen,
- 1.003 vollständige tetraedrische `K4`-Zellen.

Der deterministische Rundlauf

```text
delta G -> sechs delta d_ij -> rekonstruiertes delta G
```

hat für eine allgemeine symmetrische Teststörung Residuum null innerhalb der
Gleitkommaarithmetik.

## Was damit geschlossen ist

Geschlossen ist der erste bislang offene Brückenschritt: Die Entstehung einer
lokalen symmetrischen räumlichen Tensor-Kinematik aus den bereits vorhandenen
SubQG-Kantenvariablen. Die frühere Aussage „eine skalare Variable pro Kante
kann keinen Tensor liefern“ gilt nur für eine isolierte Kante und ist für die
vollständige Simplex-Zelle zu stark.

Noch nicht geschlossen ist die Dynamik. Der positive Ankerterm der aktuellen
statischen Kantenwirkung erzeugt weiterhin eine Spektrallücke. Als Nächstes
muss auf überlappenden Tetraedern gezeigt werden, dass die kollektive
Lorentz-Dynamik reine diskrete Diffeomorphismen als Nullrichtungen besitzt
und im langwelligen Grenzfall den Fierz-Pauli-Operator liefert.

## Reproduktion

```powershell
npm run validation:simplex-tensor-bridge
```

Ergebnisdatei: `validation/results/simplex_tensor_bridge.json`.

SHA-256: `7E53B3D336DD15345BA8D90716B90C52EC14C73BB8462340C81C1142A8FC3770`.
Zwei unmittelbar aufeinanderfolgende Läufe erzeugten byteidentische Dateien.
