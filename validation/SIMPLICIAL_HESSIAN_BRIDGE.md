# Globaler Simplex-Komplex und kollektiver Spin-2-Hessian

## Globaler Konsistenztest

Die lokale Tetraeder-Rekonstruktion allein garantiert noch keinen globalen
Raum. Deshalb wurde der vollständige `K4`-Clique-Komplex des kanonischen Laufs
auf die Inzidenz jeder Dreiecksfläche geprüft.

Der unveränderte Lauf `seed=42`, 400 Schritte besitzt 1.003 Tetraeder und 744
verschiedene Dreiecksflächen. Der vollständige Clique-Komplex ist jedoch kein
3-Mannigfaltigkeitskomplex:

- nur 37 Flächen gehören zu genau zwei Tetraedern;
- 707 Flächen gehören zu drei bis zwölf Tetraedern;
- maximale Flächeninzidenz: 12.

Dieser negative Befund wird ausdrücklich erhalten. Die 1.003 Cliquen dürfen
nicht ungeprüft als räumliches Gitter behandelt werden.

## Orientierbare Mannigfaltigkeits-Unterkomplexe

Eine reine Existenzsuche extrahiert aus demselben Graphen einen verbundenen
und konsistent orientierbaren tetraedrischen Pseudomannigfaltigkeits-
Unterkomplex mit Rand:

- 186 Tetraeder;
- 41 ursprüngliche SubQG-Knoten;
- 324 innere Dreiecksflächen, die jeweils genau zwei Zellen verbinden;
- 96 Randflächen mit genau einer Zelle;
- keine Fläche mit Inzidenz größer als zwei.

Beim Hinzufügen jeder Zelle werden sowohl die Inzidenzschranke als auch die
entgegengesetzte induzierte Orientierung an jeder gemeinsamen Fläche geprüft.
Der Unterkomplex ist durch gemeinsame Dreiecksflächen verbunden.

Diese Existenzsuche verwendet jedoch einen Suchseed und ist deshalb nicht die
physikalische Auswahlregel. Der aktive Audit verarbeitet stattdessen jede
Zelle beim ersten kanonischen Tick, an dem alle sechs Links existieren.
Gleichzeitige Zellen werden ausschließlich lexikografisch geordnet. Eine
Zelle wird genau dann aufgenommen, wenn Flächeninzidenz und bereits induzierte
Orientierungen konsistent bleiben. Es gibt keine Schwelle, keinen Fit und
keinen Zufallsseed.

Die kausale Regel akzeptiert 264 Zellen in mehreren Komponenten. Der größte
durch gemeinsame Flächen verbundene Raumsektor besitzt:

- 116 Tetraeder;
- 28 ursprüngliche SubQG-Knoten;
- 199 innere Dreiecksflächen;
- 66 Randflächen;
- maximale Flächeninzidenz zwei.

## Kollektiver TT-Hessian

Auf dem Dualgraphen der 116 kausal ausgewählten Zellen werden die bereits aus Kanten konstruierten
TT-Amplituden `q_C^+` und `q_C^x` in die kanonische FPV-Dirichlet-Form
eingesetzt:

```text
S_TT = sum_A [m/2 sum_C (dq_C^A/dt)^2
              - k/2 sum_<CD> w_CD (q_C^A-q_D^A)^2],
A in {plus,cross}.
```

Der räumliche Hessian ist der gewichtete Dualgraph-Laplacian. Deshalb gilt
exakt

```text
H 1 = 0,
1^T H 1 / 2 = 0,
q^T H q / 2 = k/2 sum_<CD> w_CD(q_C-q_D)^2 >= 0.
```

Für Plus und Kreuz existieren damit genau zwei voneinander unabhängige
ankerfreie uniforme Nullmoden. Ein nichtkonstanter deterministischer
Prüfvektor besitzt strikt positive Wirkung. Das ist der endliche
graphentheoretische Masselosigkeitsnachweis des eingeschränkten TT-Sektors.

## Lokaler Rahmen- und Spin-2-Paralleltransport

Jede gemeinsame Dreiecksfläche definiert in beiden regulären Tetraedern einen
orthonormalen Flächenrahmen. Deren Abbildung liefert ohne äußere Koordinaten
eine eindeutige orientierungserhaltende `SO(3)`-Rotation vom lokalen Rahmen
der Nachbarzelle in den aktuellen Rahmen. Auf allen 199 inneren Flächen gilt
bis unter `1e-12`:

- `R R^T = I`;
- `det(R) = +1`;
- die beiden gemeinsamen Kantenvektoren werden identisch abgebildet.

Die induzierte Abbildung der Plus-/Kreuz-Basis ist eine orientierungs- und
normerhaltende `SO(2)`-Matrix. Damit können die beiden TT-Amplituden über den
gesamten kausalen Sektor kovariant verglichen werden.

## Noch offene Auswahl- und Holonomiebrücke

Die verwendete Dirichlet-Form ist dieselbe quadratische FPV-Wellenwirkung, die
bereits im kanonischen Projekt vorhanden ist. Die Auswahl ist nun
parameterfrei an die vorhandene kausale Entstehungsordnung gebunden und der
lokale Paralleltransport ist konstruiert. Noch nicht bewiesen ist, dass die
Zulassungsregel selbst als Euler-Lagrange-Bedingung der fundamentalen Wirkung
folgt. Außerdem muss die Holonomie um geschlossene Dualschleifen ausgewertet
und mit der diskreten Krümmung identifiziert werden.

## Reproduktion

```powershell
npm run validation:collective-spin2-hessian
```

Ergebnisdatei: `validation/results/collective_spin2_hessian.json`.

SHA-256: `5AC02453572258E200B3BF134A42623906EF6EAE8D789BAC7E2264D8C88F9226`.
Zwei unmittelbar aufeinanderfolgende Läufe erzeugten byteidentische Dateien.
