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

## Orientierbarer Mannigfaltigkeits-Unterkomplex

Eine deterministische Suche mit festem Suchseed extrahiert aus demselben
Graphen einen verbundenen und konsistent orientierbaren tetraedrischen
Pseudomannigfaltigkeits-Unterkomplex mit Rand:

- 186 Tetraeder;
- 41 ursprüngliche SubQG-Knoten;
- 324 innere Dreiecksflächen, die jeweils genau zwei Zellen verbinden;
- 96 Randflächen mit genau einer Zelle;
- keine Fläche mit Inzidenz größer als zwei.

Beim Hinzufügen jeder Zelle werden sowohl die Inzidenzschranke als auch die
entgegengesetzte induzierte Orientierung an jeder gemeinsamen Fläche geprüft.
Der Unterkomplex ist durch gemeinsame Dreiecksflächen verbunden.

## Kollektiver TT-Hessian

Auf dem Dualgraphen der 186 Zellen werden die bereits aus Kanten konstruierten
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

## Noch offene Auswahlbrücke

Die verwendete Dirichlet-Form ist dieselbe quadratische FPV-Wellenwirkung, die
bereits im kanonischen Projekt vorhanden ist. Nicht hergeleitet ist bislang,
warum die fundamentale Dynamik genau den gefundenen orientierbaren
Unterkomplex auswählt und wie lokale TT-Rahmen über gemeinsame Flächen
parallel transportiert werden. Der Audit beweist die Existenz eines
konsistenten masselosen Sektors im kanonischen Graphen, nicht schon seine
dynamische Eindeutigkeit.

## Reproduktion

```powershell
npm run validation:collective-spin2-hessian
```

Ergebnisdatei: `validation/results/collective_spin2_hessian.json`.

SHA-256: `4073A5FCE3EB5D1079736E2281B5D92BEBE94BD985517FB053F9CADB1838FB12`.
Zwei unmittelbar aufeinanderfolgende Läufe erzeugten byteidentische Dateien.
