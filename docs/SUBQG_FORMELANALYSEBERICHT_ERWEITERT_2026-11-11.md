# Erweiterter SubQG-Formelanalysebericht

**Prüfdatum:** 11. November 2026  
**Prüfbestand:** `H:\Math_re\KR_BUILD\subqg`  
**Prüfprogramm:** `H:\Math_re\KR_BUILD\Release\math_research_v03.exe`  
**Dateiformat:** `.mreformula`  
**Geprüfte Dateien:** 28

## 1. Gesamtergebnis

Alle 28 im Ordner vorhandenen Formeldateien wurden einzeln mit der kompilierten MathResearchEngine ausgeführt.

| Bereich | Dateien | Identitäten bestanden | Erwartete Gegenbeispiele erkannt | Unerwartete Fehler |
|---|---:|---:|---:|---:|
| Kanonische Reihe 01–19 | 19 | 16 | 3 | 0 |
| Zusätzliche/ältere Dateien | 9 | 7 | 2 | 0 |
| **Gesamt** | **28** | **23** | **5** | **0** |

Zusätzlich zur numerischen Formelprüfung wurde eine formale Lean-4-Verifikation durchgeführt:

| Formale Prüfung | Ergebnis |
|---|---:|
| Lean-Version | 4.34.1 |
| Kanonische Lean-Deklarationen 01–19 | 19 von 19 akzeptiert |
| Weitere nicht identische Zusatzformeln | 3 von 3 akzeptiert |
| Lean-Exitcode | 0 |
| Lean-Warnungen / Lean-Fehler | 0 / 0 |
| `sorry`, `admit` oder `sorryAx` | nicht verwendet |
| Interne Engine-Selbstprüfung | 18 von 18 bestanden |

Die drei kanonischen Negativtests sind:

- Nr. 12: reine Newton-Behauptung ohne zusätzlichen Term,
- Nr. 13: allgemein behauptete lineare Leitfähigkeit,
- Nr. 19: unentkoppelte Multiversum-Kreuzkraft.

Alle drei wurden bereits am ersten Rasterpunkt durch ein konkretes Gegenbeispiel widerlegt. Das ist das jeweils vorgesehene und mathematisch richtige Ergebnis.

## 2. Bedeutung der Ergebnisse

Für die 16 positiven kanonischen Fälle gilt mehr als nur „kein numerisches Gegenbeispiel gefunden“: Es handelt sich um algebraische Identitäten, die sich durch Ausmultiplizieren, Faktorisieren oder zulässiges Kürzen direkt herleiten lassen. Die numerischen Läufe bestätigen zusätzlich, dass die kompilierte Engine diese Formeln im geprüften Wertebereich korrekt verarbeitet.

Bei Formeln mit Division gilt die Identität ausschließlich innerhalb ihres Definitionsbereichs. Die Engine überspringt nicht definierte Rasterpunkte. Deshalb erreichen diese Dateien 140 oder 150 statt 161 gültige Prüfpunkte.

### 2.1 Welches Projekt die Analyse ausführt

Die Analyse wird nicht durch eine vorbereitete Textausgabe erzeugt. Sie wird vom kompilierten C++-Programm `math_research_v03.exe` ausgeführt. Der Befehl `formula-check` lädt eine angegebene `.mreformula`-Datei, prüft deren Struktur, trennt die Gleichung in linke und rechte Seite und übergibt beide Ausdrücke an den numerischen Evaluator.

Der Ablauf ist im Projektquellcode nachvollziehbar:

- [`formula_analysis.cpp`](H:/Math_re/src/formula_analysis.cpp) lädt und validiert die Formeldatei, verlangt genau ein Gleichheitszeichen und startet die Auswertung.
- [`numeric_evaluator.cpp`](H:/Math_re/src/numeric_evaluator.cpp) enthält den Ausdrucksparser, die Rechenregeln, das Prüfraster, die Zufallsstichproben und den numerischen Vergleich.
- [`selftest.cpp`](H:/Math_re/src/selftest.cpp) prüft den Evaluator mit bekannten richtigen und falschen Gleichungen.
- [`main.cpp`](H:/Math_re/src/main.cpp) verbindet den öffentlichen CLI-Befehl `formula-check` mit dieser Analysefunktion.

Die ausgegebene Analyse wird daher bei jedem Aufruf aus dem tatsächlichen Inhalt der ausgewählten Datei neu berechnet. Dateiname, Formel, Seed, Punktzahl, Seitenwerte und Gegenbeispiel stammen aus dem jeweiligen Programmlauf.

Wichtige Abgrenzung: Der konkrete Befehl `formula-check` ruft in der aktuellen Fassung den `NumericEvaluator` auf und nicht automatisch Lean. Lean ist im Gesamtprojekt über den formalen Verifier, die Export-/Verify-Befehle und die Lean-Selbsttests integriert. Für diesen Bericht wurde der formale Lean-Schritt deshalb zusätzlich und ausdrücklich über die begleitende Datei [`SubQG_Formal_Verification_2026-11-11.lean`](H:/Math_re/formula_analysis/SubQG_Formal_Verification_2026-11-11.lean) ausgeführt. Numerische und formale Ergebnisse werden nicht miteinander verwechselt.

### 2.2 Dateiprüfung vor der Mathematik

Bevor gerechnet wird, kontrolliert das Programm unter anderem:

1. Die Datei muss existieren, lesbar und höchstens 1 MiB groß sein.
2. Die erste Zeile muss `MRE_FORMULA_1` lauten.
3. Erlaubt sind ausschließlich die Felder `name`, `formula`, `domain` und `seed`.
4. Jedes Feld darf nur einmal vorkommen.
5. `formula` ist verpflichtend und muss genau eine Gleichung `LHS = RHS` enthalten.
6. Derzeit wird ausschließlich `domain: real` akzeptiert.
7. Der Seed muss eine nichtnegative Ganzzahl sein.

Damit wird verhindert, dass unvollständige oder mehrdeutige Eingaben stillschweigend als mathematisches Ergebnis behandelt werden.

### 2.3 Wie Ausdrücke tatsächlich berechnet werden

Der Evaluator besitzt einen eigenen rekursiven Ausdrucksparser. Er verarbeitet:

- die reellen Variablen `x` und `y`,
- Dezimalzahlen,
- Addition und Subtraktion,
- Multiplikation und Division,
- Potenzen,
- Vorzeichen und Klammern.

Die üblichen Prioritäten werden schrittweise umgesetzt: Klammern und Primärausdrücke, danach Potenzen, anschließend Multiplikation und Division und zuletzt Addition und Subtraktion. Linke und rechte Seite werden unabhängig geparst und am selben Wertepaar ausgewertet.

Ungültige Operationen werden nicht als gültiger Gleichheitspunkt gezählt. Dazu gehören insbesondere:

- Division durch einen Betrag kleiner als `1e-12`,
- negative Basis mit nicht ganzzahligem Exponenten,
- Überlauf oder `NaN` bei Potenzen,
- fehlerhafte Klammern oder nicht unterstützte Zeichen.

### 2.4 Prüfpunkte und Reproduzierbarkeit

Zuerst wird das kartesische 11×11-Raster aus folgenden Werten geprüft:

```text
-10, -5, -2, -1, -0.5, 0, 0.5, 1, 2, 5, 10
```

Das ergibt höchstens 121 feste Wertepaarungen. Danach erzeugt der Mersenne-Twister `std::mt19937_64` aus dem in der Datei angegebenen Seed weitere 40 Wertepaare im Intervall `[-50, 50]`. Ohne Definitionslücken werden damit insgesamt 161 Punkte geprüft.

Da alle Dateien `seed: 42` verwenden, sind die Zufallspunkte reproduzierbar. Ein unabhängiger Aufruf derselben Programmversion mit derselben Datei erzeugt denselben Lauf und dasselbe erste Gegenbeispiel.

### 2.5 Numerische Gleichheitsentscheidung

Für jeden gültigen Punkt berechnet das Programm:

```text
Differenz = |LHS - RHS|
```

Ist die Differenz größer als `1e-9`, beendet die Engine den Lauf mit dem Status „WIDERLEGT DURCH GEGENBEISPIEL“ und nennt `x`, `y`, den linken Wert und den rechten Wert. Andernfalls wird der nächste Punkt geprüft.

Diese Toleranz berücksichtigt unvermeidbare Rundungseffekte binärer `double`-Arithmetik. Formel 03 wurde deshalb in eine numerisch stabilere, aber algebraisch äquivalente Darstellung gebracht.

### 2.6 Warum ein Gegenbeispiel ein mathematischer Beweis der Falschheit ist

Eine allgemeine Gleichung behauptet, dass sie für **alle** Werte ihres Definitionsbereichs gilt. Wird ein einziger zulässiger Wert gefunden, für den linke und rechte Seite verschieden sind, ist die allgemeine Behauptung logisch widerlegt.

Beispiel Nr. 19:

```text
Behauptung: (x+y)^2 = x^2+y^2
x=-10, y=-10
LHS=400, RHS=200
```

Da `400 != 200`, ist dies ein vollständiger mathematischer Gegenbeweis gegen die allgemeine Behauptung. Weitere Stichproben sind für die Widerlegung nicht erforderlich.

### 2.7 Warum bestandene Stichproben allein noch kein Beweis sind

Endlich viele numerische Punkte können nicht allein beweisen, dass eine Gleichung für unendlich viele reelle Werte gilt. Das Programm kennzeichnet ein positives numerisches Ergebnis deshalb ausdrücklich mit „NOT a formal proof“ beziehungsweise „Das ist kein formaler mathematischer Beweis“.

Der Nachweis der positiven Formeln in diesem Bericht stützt sich deshalb auf **zwei getrennte Ebenen**:

1. **Algebraischer Beweis:** Die Gleichungen werden mit allgemeingültigen Rechengesetzen umgeformt – etwa Distributivgesetz, binomische Formeln, Potenzgesetze und zulässiges Kürzen unter expliziten Nennerbedingungen. Diese Herleitungen gelten symbolisch für alle Werte des jeweiligen Definitionsbereichs.
2. **Ausführungsnachweis:** Die kompilierte Engine liest genau dieselben Formeln, berechnet beide Seiten unabhängig und bestätigt an reproduzierbaren Werten, dass Parser, Operatoren und Implementierung mit der algebraischen Herleitung übereinstimmen.

Diese Kombination beantwortet zwei unterschiedliche Fragen:

- **Ist die mathematische Identität allgemein richtig?** – Das zeigen die algebraischen Herleitungen.
- **Führt das Projekt diese Mathematik tatsächlich richtig aus?** – Das zeigen die Programmläufe, Punktzahlen, Gegenbeispiele und Kontrolltests.

### 2.8 Algebraische Beweisprinzipien der positiven Formeln

Die positiven Formeln lassen sich in folgende Beweisklassen einordnen:

| Beweisprinzip | Betroffene Formeln | Mathematische Grundlage |
|---|---|---|
| Gemeinsamer Nenner und Faktorisierung | 01, 02 | Bruchrechnung unter Ausschluss der Nennernullstellen |
| Differenz von Quadraten/Potenzgesetze | 03, 04, 06 | `(x+y)(x-y)=x^2-y^2`, `(x*y)^n=x^n*y^n` |
| Distributivgesetz | 05 | `x*(a+b)=x*a+x*b` |
| Binomische Formeln | 07, 10, 14 | Ausmultiplizieren und Zusammenfassen gleicher Terme |
| Multiplikative Inverse/Kürzung | 08, 15, 16, 17 | `z/z=1` beziehungsweise `(z*w)/z=w` für `z!=0` |
| Additive Gegenelemente | 09 | `a+(-a)=0` |
| Parallelogrammidentität | 11, 18 | Aufhebung der Kreuzterme `+2*x*y` und `-2*x*y` |

Damit beruhen die positiven Urteile nicht auf optischer Ähnlichkeit, vorbereiteten Ergebnistexten oder einer bloßen Simulation. Sie beruhen auf elementaren algebraischen Gesetzen und werden durch eine reale Programmausführung kontrolliert.

### 2.9 Eingebaute Positiv- und Negativkontrollen

Der Projekteigene Selbsttest prüft den Evaluator bewusst mit beiden Ergebnisarten:

- `x+1=x` muss als falsch erkannt werden,
- `x*y=x+y` muss ein Gegenbeispiel liefern,
- `x+y=y+x` muss die numerischen Prüfungen bestehen.

Die SubQG-Sammlung erweitert dieses Kontrollprinzip durch die bewusst falschen Formeln 12, 13 und 19. Dass die Engine diese Dateien ablehnt, während die algebraisch richtigen Dateien bestehen, zeigt, dass nicht pauschal jedes Eingabedokument als korrekt ausgegeben wird.

### 2.10 Präzise wissenschaftliche Aussage

Für Leser sollte das Ergebnis folgendermaßen formuliert werden:

> Die positiven SubQG-Formeln sind durch allgemeine algebraische Umformungen in ihren angegebenen Definitionsbereichen bewiesen. Die MathResearchEngine dient zusätzlich als reproduzierbarer Ausführungs- und Gegenbeispielprüfer: Sie berechnet beide Seiten unabhängig an festen und seed-gesteuerten Punkten. Die Negativformeln werden durch konkrete Gegenbeispiele mathematisch widerlegt. Die Softwareprüfung ersetzt nicht den symbolischen Beweis, sondern bestätigt, dass das Projekt die bewiesenen Beziehungen tatsächlich korrekt numerisch ausführt.

### 2.11 Formale Maschinenverifikation mit Lean 4

Für den vorliegenden Bericht wurde die algebraische Argumentation zusätzlich in Lean 4 formalisiert. Die Datei enthält:

- 16 universell quantifizierte Theoreme für die positiven kanonischen Formeln,
- explizite Nichtnullannahmen für jeden Nenner,
- drei Existenztheoreme für die kanonischen Gegenbeispiele 12, 13 und 19,
- drei weitere Theoreme für zusätzliche, nicht bereits textgleich duplizierte Formeln,
- `#print axioms` für jede formale Deklaration.

Beispiel einer positiven formalen Aussage:

```lean
theorem formula15_ehrenfest_cancellation
    (x y : ℝ) (hx : x ≠ 0) :
    (x * y) / x = y := by
  field_simp [hx]
```

Hier ist die notwendige Bedingung `x ≠ 0` Bestandteil des Theorems. Lean akzeptiert den Beweis daher nicht an einer mathematisch unzulässigen Nennerstelle.

Beispiel eines formalen Gegenbeweises:

```lean
theorem formula19_cross_force_counterexample :
    ∃ x y : ℝ, (x + y)^2 ≠ x^2 + y^2 := by
  refine ⟨-10, -10, ?_⟩
  norm_num
```

Der Lean-Compiler wurde mit der im Projekt vorgesehenen Version 4.34.1 ausgeführt. Der abschließende Lauf ergab:

```text
Exitcode: 0
Warnungen: 0
Fehler: 0
Verbotene Beweisabkürzungen: keine
Geprüfte Axiomenberichte: 22
```

Die Axiomenausgabe nennt ausschließlich die von der Projektmethodik zugelassenen Standardaxiome `propext`, `Classical.choice` und `Quot.sound`. Weder `sorry`, `admit` noch `sorryAx` kommen im erfolgreichen Lauf vor.

Die sechs exakten Zusatzdubletten benötigen keine getrennten mathematischen Beweise, weil sie wortgleich dieselbe Gleichung wie ihre jeweilige kanonische Datei enthalten. Ihre Aussage ist durch das entsprechende kanonische Lean-Theorem abgedeckt. Nr. 18 wurde trotz algebraischer Nähe zu Nr. 11 separat formalisiert.

Damit liegen drei voneinander unterscheidbare Nachweisebenen vor:

1. **Menschlich nachvollziehbare Algebra** im Bericht,
2. **reproduzierbare numerische Ausführung** durch `formula-check`,
3. **maschinengeprüfte formale Beweise und Gegenbeweise** durch Lean 4.

### 2.12 Validierung des Analyseprojekts selbst

Die kompilierte MathResearchEngine wurde zusätzlich mit ihrer vollständigen internen 18-Punkte-Selbstprüfung ausgeführt. Alle 18 Tests bestanden. Darunter befinden sich insbesondere:

- semantische Lean-Extraktion,
- Zurückweisung typinkompatibler Kombinationen,
- Auflösung und Kennzeichnung von Voraussetzungen,
- Erkennung numerischer Gegenbeispiele,
- ein von Lean akzeptierter formaler Beweis ohne `sorry`,
- Zurückweisung falscher, unbeweisbarer oder mit `sorry` abgekürzter Aussagen,
- korrektes Verhalten bei fehlenden Lean-Imports,
- deterministische Wiederholbarkeit,
- ein Ende-zu-Ende-Forschungszyklus, der numerisch überlebende Kandidaten nicht fälschlich als formal bewiesen meldet.

Diese Selbstprüfung belegt nicht die SubQG-Physik, aber sie prüft genau die technische Vertrauenskette, auf der die Analyse beruht: Parser, Numerik, Gegenbeispielerkennung, Lean-Aufruf, Beweisstatus und saubere Trennung der Ergebnisarten.

## 3. Ergebnisse der kanonischen Reihe 01–19

| Nr. | Formel | Resultat | Punkte/Gegenbeispiel |
|---:|---|---|---|
| 01 | `x^2/(x+y) + x*y/(x+y) = x` | Bestanden | 150 Punkte; `x+y != 0` |
| 02 | `x/(1+x/y) = x*y/(x+y)` | Bestanden | 140 Punkte; `y != 0`, `x+y != 0` |
| 03 | `((x+y)*(x-y))^2 = (x^2-y^2)^2` | Bestanden | 161 Punkte |
| 04 | `(x^2)^2 = x^4` | Bestanden | 161 Punkte |
| 05 | `x*(1-y) = x-x*y` | Bestanden | 161 Punkte |
| 06 | `(x*y)^2 = x^2*y^2` | Bestanden | 161 Punkte |
| 07 | `(x+y)^2-2*x*y = x^2+y^2` | Bestanden | 161 Punkte |
| 08 | `(x^2/y)*y = x^2` | Bestanden | 150 Punkte; `y != 0` |
| 09 | `(x-y)+(y-x) = 0` | Bestanden | 161 Punkte |
| 10 | `(x+y)^3 = x^3+3*x^2*y+3*x*y^2+y^3` | Bestanden | 161 Punkte |
| 11 | `(x+y)^2+(x-y)^2 = 2*x^2+2*y^2` | Bestanden | 161 Punkte |
| 12 | `x^2+x*y = x^2` | Erwartet widerlegt | `x=-10`, `y=-10`: `200 != 100` |
| 13 | `x/(x+y) = 1` | Erwartet widerlegt | `x=-10`, `y=-10`: `0.5 != 1` |
| 14 | `(x+y)^2-x^2-y^2 = 2*x*y` | Bestanden | 161 Punkte |
| 15 | `(x*y)/x = y` | Bestanden | 150 Punkte; `x != 0` |
| 16 | `(x*y)/y = x` | Bestanden | 150 Punkte; `y != 0` |
| 17 | `(1/(1-y))*(1-y) = 1` | Bestanden | 150 Punkte; `y != 1` |
| 18 | `(x+y)^2+(x-y)^2-2*(x^2+y^2) = 0` | Bestanden | 161 Punkte |
| 19 | `(x+y)^2 = x^2+y^2` | Erwartet widerlegt | `x=-10`, `y=-10`: `400 != 200` |

## 4. Analyse der neu hinzugekommenen Formeln 14–19

### 4.1 Nr. 14 – Kanten-Screening-Identität

Geprüft wurde:

```text
(x+y)^2 - x^2 - y^2 = 2*x*y
```

Aus der ersten binomischen Formel folgt:

```text
x^2 + 2*x*y + y^2 - x^2 - y^2 = 2*x*y
```

Nach Kürzung von `x^2` und `y^2` bleiben auf beiden Seiten exakt `2*x*y`. Die Gleichung ist für alle reellen `x` und `y` definiert und algebraisch korrekt. Alle 161 Prüfpunkte bestanden.

### 4.2 Nr. 15 – Ehrenfest-Kürzung des freien Falls

Geprüft wurde:

```text
(x*y)/x = y
```

Für `x != 0` darf der Faktor `x` gekürzt werden. Damit ist die Gleichung exakt richtig. Bei `x=0` ist die linke Seite `0/0` und nicht definiert; deshalb ist dieser Wert ausdrücklich nicht Teil des Definitionsbereichs der Identität. Die Engine wertete 150 definierte Punkte erfolgreich aus.

Mathematisch bestätigt wird die Kürzungsstruktur. Die Aussage, dass eine physikalische Kraft und eine träge Masse tatsächlich denselben proportionalen Faktor `x` besitzen, ist die zugrunde gelegte Modellannahme und nicht das Ergebnis der Kürzung selbst.

### 4.3 Nr. 16 – stationäres Gewicht gegenüber träger Masse

Geprüft wurde:

```text
(x*y)/y = x
```

Für `y != 0` kürzt sich `y` exakt heraus. Bei `y=0` ist die linke Seite nicht definiert. Alle 150 gültigen Prüfpunkte bestanden. Die mathematische Rückgewinnung von `x` aus einem Produkt `x*y` und dem bekannten, von null verschiedenen Faktor `y` ist damit korrekt.

Der Kommentar der Datei erwähnt zusätzlich ein Regressionsergebnis `R^2 > 0.99999`. Dieses statistische Ergebnis ist nicht Bestandteil der skalaren `.mreformula`-Gleichung und wurde durch diesen Formellauf daher nicht separat neu berechnet.

### 4.4 Nr. 17 – Brechungsindex und Kantenkontraktion

Geprüft wurde:

```text
(1/(1-y))*(1-y) = 1
```

Setzt man `z=1-y`, ergibt sich `(1/z)*z=1`. Dies ist exakt richtig, solange `z != 0`, also `y != 1`. Bei `y=1` wäre eine Division durch null enthalten. Die Engine prüfte 150 definierte Punkte ohne Gegenbeispiel.

Die Variable `x` kommt in dieser konkreten Gleichung nicht vor. Das ist mathematisch unproblematisch, sollte aber bei der Interpretation der Datei berücksichtigt werden: Getestet wird ausschließlich die multiplikative Invarianz in Abhängigkeit von `y`.

### 4.5 Nr. 18 – orthogonale Multiversum-Entkopplung

Geprüft wurde:

```text
(x+y)^2 + (x-y)^2 - 2*(x^2+y^2) = 0
```

Nach Ausmultiplizieren gilt:

```text
(x^2+2*x*y+y^2) + (x^2-2*x*y+y^2)
- 2*x^2 - 2*y^2 = 0
```

Die Kreuzterme `+2*x*y` und `-2*x*y` heben sich auf; auch alle quadratischen Terme kürzen sich. Die Gleichung ist für alle reellen Werte exakt null und bestand 161 Punkte.

Diese Identität ist algebraisch dieselbe Parallelogrammstruktur wie Nr. 11, nur vollständig auf die Nullseite gebracht. Sie bestätigt die korrekte Kreuztermaufhebung in der gewählten Darstellung. Die physikalische Bezeichnung „Multiversum-Entkopplung“ ist eine Interpretation dieser algebraischen Struktur.

### 4.6 Nr. 19 – Gegenbeispiel einer unentkoppelten Kreuzkraft

Die absichtlich falsche Behauptung lautet:

```text
(x+y)^2 = x^2+y^2
```

Tatsächlich ist:

```text
(x+y)^2 = x^2 + 2*x*y + y^2
```

Die behauptete Gleichheit würde daher nur in Sonderfällen mit `x*y=0` gelten. Sie ist keine Identität über den reellen Zahlen. Die Engine fand bereits am ersten Punkt:

```text
x = -10
y = -10
LHS = 400
RHS = 200
```

Der Negativtest wurde damit korrekt bestanden. Zusammen mit Nr. 18 demonstriert er, dass die Engine zwischen der vollständigen Kreuztermaufhebung und einer unzulässigen Weglassung des Terms `2*x*y` unterscheidet.

## 5. Ergebnisse der neun zusätzlichen Dateien

| Datei | Formel | Ergebnis |
|---|---|---|
| `binomische_formel.mreformula` | `(x+y)^2 = x^2+2*x*y+y^2` | Bestanden, 161 Punkte |
| `gegenbeispiel.mreformula` | `(x+y)^2 = x^2+y^2` | Erwartet widerlegt: `400 != 200` |
| `subqg_gegenbeispiel_rein_newton.mreformula` | `x^2+x*y = x^2` | Erwartet widerlegt: `200 != 100` |
| `subqg_graph_dispersion.mreformula` | `(x+y)*(x-y) = x^2-y^2` | Bestanden, 161 Punkte |
| `subqg_landau_order_parameter.mreformula` | `(x+y)^2-2*x*y = x^2+y^2` | Bestanden, 161 Punkte |
| `subqg_lieb_robinson_speed.mreformula` | `(x*y)^2 = x^2*y^2` | Bestanden, 161 Punkte |
| `subqg_metric_contraction.mreformula` | `x*(1-y) = x-x*y` | Bestanden, 161 Punkte |
| `subqg_mond_crossover.mreformula` | `x*(x/(x+y)) = x^2/(x+y)` | Bestanden, 150 Punkte |
| `subqg_tully_fisher.mreformula` | `(x^2)^2 = x^4` | Bestanden, 161 Punkte |

## 6. Inhaltliche Dubletten

Im vollständigen 28-Dateien-Bestand kommen sechs Gleichungen doppelt vor:

| Kanonische Datei | Zusätzliche Datei |
|---|---|
| `04_subqg_tully_fisher_skalierung.mreformula` | `subqg_tully_fisher.mreformula` |
| `05_subqg_metrische_kontraktion.mreformula` | `subqg_metric_contraction.mreformula` |
| `06_subqg_lieb_robinson_grenzgeschwindigkeit.mreformula` | `subqg_lieb_robinson_speed.mreformula` |
| `07_subqg_landau_ordnungsparameter_quadrat.mreformula` | `subqg_landau_order_parameter.mreformula` |
| `12_subqg_gegenbeispiel_rein_newton.mreformula` | `subqg_gegenbeispiel_rein_newton.mreformula` |
| `19_subqg_gegenbeispiel_unentkoppeltes_multiversum.mreformula` | `gegenbeispiel.mreformula` |

Diese Dubletten sind kein mathematischer Fehler. Für eine eindeutige kanonische Testsuite sollte jedoch die nummerierte Reihe 01–19 als maßgeblicher Bestand verwendet werden. Dadurch werden Ergebnisse nicht doppelt gezählt.

Nr. 18 und Nr. 11 sind nicht textgleich, aber algebraisch äquivalent: Nr. 18 ist die Parallelogrammidentität aus Nr. 11 nach Subtraktion der rechten Seite.

## 7. Bewertung der Definitionsbereiche

Alle Dateien deklarieren derzeit pauschal `domain: real`. Für die polynomialen Identitäten ist das vollständig korrekt. Bei rationalen Ausdrücken muss die Bezeichnung gedanklich um die Nullstellen der Nenner ergänzt werden:

- Nr. 01: `x+y != 0`
- Nr. 02: `y != 0` und `x+y != 0`
- Nr. 08: `y != 0`
- Nr. 13: `x+y != 0`
- Nr. 15: `x != 0`
- Nr. 16: `y != 0`
- Nr. 17: `y != 1`
- `subqg_mond_crossover.mreformula`: `x+y != 0`

Die Engine behandelt diese Stellen numerisch korrekt als nicht auswertbar. Für eine noch präzisere Dokumentation wäre eine spätere Erweiterung des Dateiformats um explizite Bedingungen wie `exclude: x+y=0` oder `assume: x>0,y>0` sinnvoll. Für die aktuelle Prüfung ist daraus kein falsches Ergebnis entstanden.

## 8. Schlussfolgerung

Der erweiterte Formelbestand arbeitet mit der kompilierten MathResearchEngine erwartungsgemäß und ohne unerwartete Fehler:

- Alle 16 positiven kanonischen Formeln 01–19 sind algebraisch korrekt.
- Alle drei kanonischen Gegenbeispiele werden korrekt widerlegt.
- Die neu hinzugekommenen Identitäten 14–18 sind mathematisch richtig, jeweils unter den angegebenen Definitionsbedingungen.
- Der neue Negativtest 19 erkennt die fehlende Kreuztermbehandlung korrekt.
- Auch die neun zusätzlichen Dateien liefern ausschließlich die vorgesehenen Ergebnisse.
- Die Engine akzeptiert falsche Gleichungen nicht pauschal, sondern gibt konkrete Gegenbeispiele mit beiden Seitenwerten aus.
- Lean 4 akzeptiert alle 19 kanonischen formalen Deklarationen und drei zusätzlichen eindeutigen Theoreme ohne Fehler, Warnung oder Beweisabkürzung.
- Die interne 18-Punkte-Validierung der MathResearchEngine besteht vollständig.

Damit ist die mathematische Funktionsfähigkeit des gesamten neuen Ordnerbestands auf drei Ebenen bestätigt: nachvollziehbare algebraische Herleitung, reale numerische Programmausführung und formale Maschinenverifikation mit Lean 4. Diese Feststellung betrifft die mathematischen Beziehungen und ihre korrekte Ausführung im Projekt. Die weitergehende physikalische Interpretation bleibt davon unabhängig diskutierbar.
