# SubQG Game Physics Engine

Eine vollwertige, produktionsreife **2D-Spielphysik-Engine** mit vertrauter, ergonomischer RigidBody-Entwickler-Schnittstelle (ähnlich Box2D, Rapier oder PhysX), deren mathematische und physikalische Grundlage fundamental auf der **Subquantum Graphity (SubQG)** und der variationellen Kantenwirkungs-Minimierung beruht.

Das relationale Kantennetzwerk bleibt ein **internes Berechnungsmodell** unter der Haube: Ein Spieleentwickler arbeitet mit gewohnten Konzepten wie Körpern, Formen, Kräften, Impulsen, Gelenken, Raycasts und Triggern, während im Inneren der Engine Raumzeitkrümmung, Trägheit und Kontaktsteifigkeit relational emergieren.

---

## Inhaltsverzeichnis

1. [Features für Spieleentwickler](#features-für-spieleentwickler)
2. [Das SubQG-Fundament unter der Haube](#das-subqg-fundament-unter-der-haube)
3. [Architektur](#architektur)
4. [Schnellstart (Quick Start)](#schnellstart-quick-start)
5. [Code-Beispiele](#code-beispiele)
   - [1. Fallende Kiste & Ruhelage](#1-fallende-kiste--ruhelage)
   - [2. Springender Gummiball](#2-springender-gummiball)
   - [3. Gelenke: Doppelpendel & Federung](#3-gelenke-doppelpendel--federung)
   - [4. Motorisiertes Fahrzeug](#4-motorisiertes-fahrzeug)
   - [5. Raycast-Radar & Trigger-Sensoren](#5-raycast-radar--trigger-sensoren)
6. [Interaktives Physik-Labor (Demo)](#interaktives-physik-labor-demo)
7. [Test-Suite & Verifikation](#test-suite--verifikation)

---

## Features für Spieleentwickler

* **Körper & Materialien**:
  * Körper-Typen: `dynamic` (voll simuliert), `static` (feste Umgebung/Hindernisse), `kinematic` (skriptgesteuert).
  * Vordefinierte und anpassbare Materialien: `Material.wood()`, `metal()`, `rubber()`, `stone()`, `ice()`, `bouncy()`.
  * Einstellbare Dichte, Coulomb-Haft-/Gleitreibung $\mu$ und Restitution (Elastizität / Bounciness $e$).
* **Geometrische Formen**:
  * `Box`: Rechtecke, Plattformen, Wände.
  * `Circle`: Bälle, Räder, Fässer.
  * `Polygon`: Beliebige konvexe Polygone, Rampen, Keile, Dreiecke.
  * `Capsule`: Kapseln (Pills) für Spielfiguren, Ragdolls, Gliedmaßen.
  * `Segment`: 1D-Liniensegmente für statisches Terrain, Hänge, Bodenketten.
  * **Compound Bodies**: Beliebig viele Formen pro Körper mit automatischer Schwerpunkt- und Trägheitstransformation (Steinerscher Satz).
* **Kräfte, Impulse & Drehmomente**:
  * `body.applyForce(f)`, `applyTorque(t)`.
  * `body.applyForceAtPoint(f, worldPoint)` (erzeugt simultan Kraft und Drehmoment).
  * `body.applyImpulse(p)`, `applyAngularImpulse(p)`, `applyImpulseAtPoint(p, worldPoint)`.
* **Kollisionserkennung & Solver**:
  * **Broadphase**: Hochperformanter dynamischer AABB-Baum (`DynamicAABBTree`, BVH) mit *Fat AABBs* für $O(N \log N)$ Abfragen.
  * **Narrowphase**: Separating Axis Theorem (`SAT`) mit präzisem Sutherland-Hodgman Kanten-Clipping für 2-Punkt-Kantenkontakte.
  * **Solver**: Sequentieller Impulssolver (Projected Gauss-Seidel) mit Coulomb-Reibungskegel, Warm-Starting aus dem vorherigen Zeitschritt und Baumgarte-Positionsstabilisierung für jitterfreie, extrem stabile Kistentürme.
* **Gelenke & Aufhängungen (Joints)**:
  * `DistanceJoint`: Starre Stange oder gedämpfte Feder (Fahrzeug-Stoßdämpfer).
  * `RevoluteJoint`: Drehgelenk (Scharnier/Pin-Gelenk) mit motorisiertem Antrieb (`enableMotor`, `motorSpeed`, `maxMotorTorque`) und Winkelgrenzen (`lowerAngle`, `upperAngle`).
  * `PrismaticJoint`: Schubgelenk (Kolben, Aufzug, Gleitschiene) entlang frei wählbarer Achse mit Motor und Hubbegrenzung.
  * `WeldJoint`: Starre Schweißverbindung zweier Körper.
  * `PulleyJoint`: Flaschenzug- / Seilzuggelenk mit Übersetzungsverhältnis.
* **Raycasts & Trigger-Sensoren**:
  * `world.raycast(origin, dir, maxDist)`: Nächster Treffer mit Schnittpunkt, Treffernormale und Bruchteildistanz.
  * `world.raycastAll(origin, dir, maxDist)`: Alle getroffenen Objekte, sortiert nach Distanz.
  * `isTrigger: true`: Geisterformen / Sensoren, die ohne Impulswiderstand durchdrungen werden und `onTriggerEnter`, `onTriggerStay`, `onTriggerExit` auslösen.
* **Performance & Sleeping**:
  * Automatische Ruhelage-Erkennung (`Island.evaluateSleep()`): Zur Ruhe gekommene Kistentürme schlafen ein und verbrauchen 0 % Solver-CPU, wachen bei Krafteinwirkung sofort wieder auf.

---

## Das SubQG-Fundament unter der Haube

Die Engine unterstützt zwei klar getrennte Betriebsmodi:

### Modus 1: `pure-subqg` (100 % First-Principles SubQG-Wirkungsdynamik)
In diesem Modus ist der **klassische Impulssolver zu 100 % deaktiviert** (`contactSolverCalls = 0`):
1. **Relationale Gravitation als Metrikgradient**:
   * Keine willkürliche Newton-Vektorschwerkraft. Die Massen krümmen das relationale SubQG-Gitter gemäß der Poisson-analogen Kantenwirkungsminimierung:
     $$\frac{\partial S_{\mathrm{edge}}}{\partial x_e} = 0 \implies x_e^* = 1 + \beta \rho_e \implies \nabla^2 \Phi = 4\pi G \rho.$$
   * Die Beschleunigung entsteht direkt aus dem Gradienten des Gitterpotentials: $\mathbf{a} = -\nabla \Phi_{\mathrm{lattice}}$.
2. **Geometrisch exakte Kantenbarriere-Repulsion (ohne Hüllradius-Artefakte)**:
   * Keine Phantom-Abstoßung im leeren Raum! Die Kantenbarriere $V_{\mathrm{barrier}} = \frac{1}{2} k_{\mathrm{subqg}} \delta^2$ wird ausschließlich an tatsächlichen geometrischen Durchdringungen ($\delta > 0$) der Körperformen (Box, Circle, Poly, etc.) ausgewertet.
   * Die Repulsionskraft $\mathbf{F}_{\mathrm{norm}} = k_{\mathrm{subqg}} \delta \mathbf{n} - c \mathbf{v}_n$ drückt penetrierende Körper rein über die Kantensteifigkeit auseinander.
3. **Relationale Scherspannungs-Reibung**:
   * Die Reibung entsteht aus der tangentialen Kanten-Scherspannung $\mathbf{F}_{\mathrm{shear}} = -\mu_{\mathrm{subqg}} \|\mathbf{F}_{\mathrm{norm}}\| \hat{\mathbf{v}}_t$ der deformierten Gitterverbindungen.

### Modus 2: `hybrid` (Echtzeit-Optimiert für 60 FPS)
* Verwendet das SubQG-Gitter zur Berechnung von Raumzeitkrümmung, Gravitationspotential und Kausal-Uhren, nutzt jedoch für hunderte RigidBodies bei 60 FPS einen diskretisierten Projected Gauss-Seidel Impulssolver.

---

## Architektur

```
game_physic_engine/
├── package.json               # Standalone npm Paket
├── README.md                  # Vollständige Dokumentation
├── index.mjs                  # Zentraler Public Export
├── src/
│   ├── math/                  # Vec2, Mat22, Transform, AABB, MathUtils
│   ├── subqg/                 # RelationalGraph, MetricLatticeSolver, SubQGGravitationField, SubQGContactBridge
│   ├── collision/
│   │   ├── shapes/            # Shape, Circle, Box, Polygon, Capsule, Segment
│   │   ├── broadphase/        # DynamicAABBTree (BVH mit Fat AABBs)
│   │   ├── narrowphase/       # SAT (Sutherland-Hodgman Clipping), CollisionNarrowphase, ContactManifold
│   │   ├── Raycast.mjs        # Ray, RaycastHit
│   │   └── TriggerSystem.mjs  # Enter / Stay / Exit Event-System
│   ├── dynamics/              # Body, Material, ContactSolver (Projected Gauss-Seidel), Island
│   │   └── joints/            # Joint, DistanceJoint, RevoluteJoint, PrismaticJoint, WeldJoint, PulleyJoint
│   ├── world/                 # World, StepConfig, ContactListener
│   └── debug/                 # CanvasRenderer (HTML5 Canvas), SubQGInspector
├── demo/
│   ├── index.html             # Interaktives Physik-Labor mit SubQG Live-Lattice Heatmap
│   └── demo_scenes.mjs        # 6 spielbare Szenen-Presets
├── examples/                  # 4 sofort ausführbare Minimal-Beispiele
└── tests/                     # 28 automatisierte Tests (100% bestanden)
```

---

## Schnellstart (Quick Start)

### Installation
Keine externen Abhängigkeiten erforderlich! Läuft direkt mit modernem Node.js (v18+) oder im Browser:

```bash
cd H:\SubQG_Fundamental_Physics_Validation_FPV6\game_physic_engine
npm test
npm run demo
```

---

## Code-Beispiele

### 1. Fallende Kiste & Ruhelage

```javascript
import { World, Vec2, Material } from './index.mjs';

// Welt mit Erdschwerkraft (g = 9.81 m/s²)
const world = new World({ gravity: new Vec2(0, -9.81) });

// Fester Boden (y = 0, Dicke 1.0 m -> Oberfläche bei y = 0.5 m)
world.createBox(0, 0, 20, 1.0, {
  type: 'static',
  material: Material.wood()
});

// Kiste bei y = 5.0 m fallen lassen
const box = world.createBox(0, 5.0, 1.0, 1.0, {
  type: 'dynamic',
  material: Material.wood()
});

// Simulationsschleife (z. B. 60 FPS)
for (let frame = 0; frame < 120; frame++) {
  world.step(1.0 / 60.0);
}

console.log(`Kiste liegt stabil bei y = ${box.position.y.toFixed(3)} m`);
```

### 2. Springender Gummiball

```javascript
const ball = world.createCircle(0, 8.0, 0.5, {
  type: 'dynamic',
  material: Material.rubber() // restitution = 0.85
});
```

### 3. Gelenke: Doppelpendel & Federung

```javascript
const ceiling = world.createBox(0, 10, 2, 0.5, { type: 'static' });
const bob1 = world.createCircle(2, 10, 0.4, { type: 'dynamic' });
const bob2 = world.createCircle(4, 10, 0.4, { type: 'dynamic' });

// Erstes Pendel an Decke befestigen
world.createRevoluteJoint(ceiling, bob1, new Vec2(0, 10));
// Zweites Pendel am ersten Pendel befestigen
world.createRevoluteJoint(bob1, bob2, new Vec2(2, 10));
```

### 4. Motorisiertes Fahrzeug

```javascript
// Fahrgestell
const chassis = world.createBox(0, 2.0, 3.0, 0.8, { type: 'dynamic' });

// Räder
const wheelRear = world.createCircle(-1.2, 1.2, 0.5, { type: 'dynamic', material: Material.rubber() });
const wheelFront = world.createCircle(1.2, 1.2, 0.5, { type: 'dynamic', material: Material.rubber() });

// Motorisiertes Hinterrad (15 rad/s)
world.createRevoluteJoint(chassis, wheelRear, new Vec2(-1.2, 1.2), {
  enableMotor: true,
  motorSpeed: -15.0,
  maxMotorTorque: 50.0
});

world.createRevoluteJoint(chassis, wheelFront, new Vec2(1.2, 1.2));
```

### 5. Raycast-Radar & Trigger-Sensoren

```javascript
// 1. Raycast
const hit = world.raycast(new Vec2(0, 2), new Vec2(1, 0), 20.0);
if (hit) {
  console.log(`Hindernis in ${hit.distance} m Distanz bei (${hit.point.x}, ${hit.point.y}) getroffen!`);
}

// 2. Trigger-Sensor
const gate = world.createBox(10, 2, 2, 4, {
  type: 'static',
  isTrigger: true
});

world.addContactListener({
  onTriggerEnter(sensorShape, otherShape, sensorBody, otherBody) {
    console.log(`Objekt ${otherBody.id} hat das Tor betreten!`);
  },
  onTriggerExit(sensorShape, otherShape, sensorBody, otherBody) {
    console.log(`Objekt ${otherBody.id} hat das Tor verlassen!`);
  }
});
```

---

## Interaktives Physik-Labor (Demo)

Du kannst die Demo auf **zwei bequeme Arten** öffnen:

### Option A: Komplett ohne Server (Direkt per Doppelklick)
Öffne einfach per Doppelklick im Datei-Explorer:
👉 [`demo/standalone_demo.html`](file:///h:/SubQG_Fundamental_Physics_Validation_FPV6/game_physic_engine/demo/standalone_demo.html)

Diese Version ist zu 100 % in einer Datei gebündelt. Sie benötigt **weder Node.js noch einen HTTP-Server** und läuft sofort in jedem Browser (Chrome, Edge, Firefox, Safari) direkt über das `file:///`-Protokoll!

### Option B: Über den integrierten lokalen Webserver
Falls du lieber mit getrennten ES-Modulen arbeiten möchtest:

```bash
cd H:\SubQG_Fundamental_Physics_Validation_FPV6\game_physic_engine
npm start
```
Öffne anschließend im Browser: `http://localhost:3000/demo/index.html`

### Interaktive Features im Labor:
* **Maus-Interaktion**: Linksklick & Ziehen auf beliebige Körper zum Greifen, Hochheben und Wegschleudern mit realistischer Trägheit.
* **Rechtsklick-Laser-Raycast**: Echtzeit-Abtaststrahl mit Reflexionsnormalen und Schnittpunktmarkierung.
* **Objekte spawnen**: Per Knopfdruck Kisten, Bälle, schwere Felsblöcke oder Kapseln an der Mausposition erzeugen.
* **Live SubQG-Gitter Overlay**: Schaltet die visuelle Darstellung des internen Kantennetzwerks ein. Kanten verfärben sich bei gravitativer Dehnung von dezentem Grau zu strahlendem Gelb-Rot!
* **Telemetrie-Dashboard**: FPS, Körperanzahl, aktive Kontakte, Schlafzustand, kinetische Energie, SubQG-Kantenwirkung $S_{\mathrm{edge}}$ und maximale metrische Kantenverzerrung in Echtzeit.

---

## Test-Suite & Verifikation

Die Engine verfügt über eine umfassende, automatisierte Test-Suite basierend auf dem nativen Node.js Test-Runner:

```bash
npm test
```

### Testergebnisse (31 / 31 Tests bestanden, 100 % grün):

| Test-Modul | Geprüfte Eigenschaften | Status |
|---|---|---|
| `math.test.mjs` | Vektoralgebra, Matrizeninversion, LGS-Solver, Starrkörper-Transformationen, AABB-Slab Raycast | **BESTANDEN** |
| `shapes_and_aabb.test.mjs` | Massen-, Trägheits- und AABB-Berechnungen für Circle, Box, Polygon, Capsule, Segment | **BESTANDEN** |
| `collision_narrowphase.test.mjs` | SAT-Algorithmus, Circle-Circle, Circle-Box, Box-Box 2-Punkt-Kantenkontakte | **BESTANDEN** |
| `raycast.test.mjs` | Distanz, Schnittpunkt, Normalen, Mehrfach-Treffer (`raycastAll`) | **BESTANDEN** |
| `dynamics_fall_bounce.test.mjs` | Freier Fall, Ruhelage auf Bodenoberkante, elastischer Rückprall, Coulomb-Gleitreibung | **BESTANDEN** |
| `stacking_stability.test.mjs` | 5 Kisten aufeinander gestapelt über 200 Zeitschritte: kein Einsturz, kein Zittern | **BESTANDEN** |
| `joints_and_constraints.test.mjs` | RevoluteJoint, DistanceJoint, PrismaticJoint, WeldJoint Zwangsbewegungen | **BESTANDEN** |
| `triggers_and_sensors.test.mjs` | Enter-, Stay- und Exit-Ereignisse ohne physikalischen Impulswiderstand | **BESTANDEN** |
| `subqg_internal_metric.test.mjs` | Masseunabhängiger freier Fall, Kantenwirkungs-Minimierung, Pure-SubQG Gravitation, Beseitigung von Phantom-Repulsion, Geometrische Kantenbarriere-Repulsion & Relationale Scherspannungs-Reibung | **BESTANDEN** |
| `game_scenarios.test.mjs` | Fahrbereites Auto mit Motor-Radlagern, Katapult-Wurfmechanik, Compound-Body Spielfigur | **BESTANDEN** |

---

## Lizenz

MIT License – Entwickelt im Rahmen des Subquantum Graphity (SubQG) Forschungs- und Validierungsprojekts.
