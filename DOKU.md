# Funktionsumfang der SubQG-Physik-DLL

Die SubQG-Physik-DLL stellt eine vollständige 2D-Physiksimulation für
C++-Anwendungen und Game Engines bereit. Zusätzlich enthält sie die
Schnittstelle zum vollständigen kanonischen SubQG-FPV6-Kern mit den entwickelten
Raumzeit- und Gravitationsmodellen.

## 1. Klassische Spielphysik

Die DLL unterstützt:

- dynamische, statische und kinematische Körper;
- Position, Geschwindigkeit und Rotation;
- Kräfte, Drehmomente und Impulse;
- Masse, Trägheitsmoment und Dämpfung;
- Reibung und Rückprall;
- Schlafmodus für ruhende Körper;
- feste Rotation und individuelle Gravitationsskalierung.

Verfügbare Kollisionsformen:

- Kreis;
- Rechteck;
- konvexes Polygon;
- Kapsel;
- Segment beziehungsweise Bodenlinie;
- zusammengesetzte Körper mit mehreren Formen.

Damit lassen sich beispielsweise Fahrzeuge, Spielfiguren, Projektile, Kisten,
Maschinen, Pendel oder zerstörbare Objekte simulieren.

## 2. Kollisionen und Sensoren

Die DLL kann:

- Kollisionen erkennen und auflösen;
- Kontaktpunkte, Normalen und Eindringtiefe liefern;
- Reibung und Rückprall berechnen;
- Trigger und Sensorzonen verwalten;
- Ereignisse für `Enter`, `Stay` und `Exit` auslösen;
- einzelne oder alle Körper entlang eines Strahls finden;
- Bounding-Box-Abfragen ausführen.

Damit sind unter anderem Bodenerkennung, Sichtlinien, Lasersensoren,
Treffererkennung und unsichtbare Ereignisbereiche möglich.

## 3. Gelenke und mechanische Systeme

Unterstützt werden:

- Abstandsgelenke;
- Drehgelenke;
- Schiebegelenke;
- Schweißverbindungen;
- Flaschenzugverbindungen;
- Gelenkgrenzen;
- Motoren für Dreh- und Schiebegelenke.

Damit lassen sich Pendel, Türen, Aufzüge, Kolben, Kräne, Seilmechanismen und
einfache Fahrzeugaufhängungen bauen.

## 4. SubQG-Physikmodi

Eine Welt kann in zwei Modi betrieben werden:

```cpp
subqg::World hybrid({0, -9.81}, subqg::PhysicsMode::Hybrid);
subqg::World pure({0, -9.81}, subqg::PhysicsMode::PureSubQG);
```

`Hybrid` verbindet die gewöhnliche Kontaktauflösung mit der SubQG-Struktur.

`PureSubQG` verwendet die relationale SubQG-Dynamik für:

- Gravitation;
- Kontaktkräfte;
- Gelenkkräfte;
- relationale Raumstruktur;
- metrische Verformung;
- lokale Kantenwirkung.

Im reinen Modus lässt sich über `contactSolverCalls == 0` kontrollieren, dass
der klassische Kontaktlöser nicht verwendet wurde.

## 5. SubQG-Raumzeit und Gravitation

Die native DLL besitzt direkt:

- einen relationalen Graphen;
- relationale Knoten und Kanten;
- Masseneinlagerung in den Graphen;
- metrische Gitterrelaxation;
- Raumzeit- beziehungsweise Metrikverformung;
- Gradientenauswertung an beliebigen Positionen;
- SubQG-Gravitationsfelder;
- optionale gegenseitige Anziehung dynamischer Körper;
- Pure-SubQG-Kraftauswertung;
- Kantenwirkung und metrische Spannungsdiagnostik.

Dadurch lässt sich untersuchen, wie Körper auf eine dynamisch erzeugte
relationale Raumstruktur reagieren.

## 6. Vollständiger kanonischer FPV6-Kern

Über `CanonicalRuntime` kann C++ auf alle Exporte der vollständigen
SubQG-FPV6-Module zugreifen.

Dazu gehören unter anderem:

- emergente Raumzeit;
- relationale und interne Uhren;
- Kausalordnung;
- Graphwellen und kausale Wellen;
- Genesis- und Kosmologiesimulationen;
- emergente Gravitation;
- MOND-ähnliches Verhalten;
- Dunkle-Materie-Modelle;
- Geodäten;
- spektrale Analysen;
- Multiversumsphasen;
- Glitch- und Tunnelmodelle;
- Unified-Proof-Engine;
- First-Principles-Gravitationsmodelle;
- Apfel-Experiment;
- Skalierungs-, Geschwindigkeits- und Topologieprüfungen.

Die Schnittstelle kann:

- freie Funktionen aufrufen;
- Klasseninstanzen erzeugen;
- Methoden aufrufen;
- Eigenschaften auslesen;
- mehrere zustandsbehaftete Instanzen verwalten;
- sämtliche Parameter und Ergebnisse als JSON übertragen;
- mit `inventory()` alle verfügbaren Module und Exporte auflisten.

Beispiel:

```cpp
#include <subqg/canonical_runtime.hpp>

auto runtime =
    subqg::CanonicalRuntime::bundled("Pfad/zum/Release");

auto engine = runtime.construct(
    "subqg_unified_proof_engine",
    "SubQGUnifiedProofEngine",
    "[{\"G\":1,\"boxSize\":20}]"
);

std::string result = runtime.call(
    engine,
    "effectiveGravitationalAcceleration",
    "[20,0.4]"
);
```

## 7. Zerstörung

Die DLL enthält ein Zerstörungssystem, mit dem Körper ab einer einstellbaren
Belastung zerlegt werden können:

- Bruchschwelle;
- minimale Fragmentfläche;
- maximale Fragmentanzahl;
- Einschlagpunkt und Einschlagimpuls.

## 8. Diagnose und wissenschaftliche Auswertung

Während der Simulation können folgende Werte ausgelesen werden:

- Anzahl aktiver Kontakte;
- Zahl der relationalen Knoten und Kanten;
- gesamte Kantenwirkung;
- maximale metrische Verformung;
- Dauer eines Simulationsschritts;
- Aufrufe des klassischen Kontaktlösers.

Das eignet sich sowohl für Spiele als auch für SubQG-Experimente und
Visualisierungen.

### Gauge-reduzierte kosmologische Clustering-Closure

Der Forschungskern enthält nun außerdem eine zielwertfreie interne
Clustering-Prüfung. Aus `k*=4` werden durch Entfernen der einheitlichen
U(1)-Eichrichtung drei relative Phasen und drei konjugierte Impulse. Bei
`lambda/lambda_c=1,12` ergibt das
`E_noncondensed/E_soliton=6/1,12=5,357142857`. Die kovariant expandierende
Mehrphasendynamik erhält die Noether-Ladung numerisch bis unter `4e-14` und
zeigt mit wachsendem kausalem Volumen den Übergang zu `w->0`. Aufrufbar sind
insbesondere `deriveGaugeReducedPhaseSpaceClosure()`,
`measureGaugeReducedClusteringDynamics()` und
`deriveSubstrateClusteringClosure()`.

Diese interne Closure ersetzt keine kosmologische Beobachtungsprüfung. Eine
vollständige Vorhersage von CMB, BAO und Störungswachstum ist weiterhin ein
separater offener Implementierungsschritt.

## Technische Grenzen

Aktuell gilt:

- Die native Game-Physik ist zweidimensional.
- Die fertige DLL ist für Windows x64 gebaut.
- Die öffentliche Schnittstelle ist eine C++17-API, keine reine C-API.
- Für die vollständige kanonische FPV6-Ausführung werden neben der DLL auch
  der mitgelieferte Ordner `share/subqg` und die gebündelte Node-Laufzeit
  benötigt.
- Nur die native Spielphysik läuft vollständig direkt innerhalb der DLL. Der
  vollständige FPV6-Forschungskern wird über einen privaten Prozess ausgeführt,
  damit die Originalgleichungen unverändert bleiben.
- Eine fertige Unity-, Unreal- oder C#-Schnittstelle ist noch nicht Bestandteil
  der DLL.
- Es handelt sich um ein Forschungsmodell. Bestandene Softwaretests sind kein
  experimenteller Beweis der physikalischen Theorie.

## Öffentliche Header

Die native Physik-API befindet sich in:

```text
cpp/include/subqg/physics.hpp
```

Die Schnittstelle zum kanonischen FPV6-Kern befindet sich in:

```text
cpp/include/subqg/canonical_runtime.hpp
```
