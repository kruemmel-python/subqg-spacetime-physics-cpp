# CodeDump for Project: `game_physic_engine.zip`

_Generated on 2026-11-12T14:50:58.865Z_

No LLM call was made. Token/cost values are offline estimates only.

LLM Code Review Mode is enabled: generated/vendor/report/lockfile noise is filtered across languages.

## Repository Map

```text
.
├── demo/
│   ├── demo_scenes.mjs
│   ├── index.html
│   └── standalone_demo.html
├── docs/
│   └── API_INTEGRATION_GUIDE.md
├── examples/
│   ├── 01_falling_box.mjs
│   ├── 02_bouncing_ball.mjs
│   ├── 03_joint_pendulum.mjs
│   └── 04_raycast_sensor.mjs
├── integrations/
│   ├── blender/
│   │   └── subqg_blender_bridge.py
│   ├── custom_engine/
│   │   ├── subqg_client.py
│   │   └── SubQGClient.hpp
│   └── unreal/
│       ├── SubQGUnrealBridge.cpp
│       └── SubQGUnrealBridge.h
├── src/
│   ├── api/
│   │   └── SubQGServer.mjs
│   ├── collision/
│   │   ├── broadphase/
│   │   │   └── DynamicAABBTree.mjs
│   │   ├── narrowphase/
│   │   │   ├── CollisionNarrowphase.mjs
│   │   │   ├── ContactManifold.mjs
│   │   │   └── SAT.mjs
│   │   ├── shapes/
│   │   │   ├── Box.mjs
│   │   │   ├── Capsule.mjs
│   │   │   ├── Circle.mjs
│   │   │   ├── Polygon.mjs
│   │   │   ├── Segment.mjs
│   │   │   └── Shape.mjs
│   │   ├── Raycast.mjs
│   │   └── TriggerSystem.mjs
│   ├── debug/
│   │   ├── CanvasRenderer.mjs
│   │   └── SubQGInspector.mjs
│   ├── destruction/
│   │   └── SubQGDestructionSystem.mjs
│   ├── dynamics/
│   │   ├── joints/
│   │   │   ├── DistanceJoint.mjs
│   │   │   ├── Joint.mjs
│   │   │   ├── PrismaticJoint.mjs
│   │   │   ├── PulleyJoint.mjs
│   │   │   ├── RevoluteJoint.mjs
│   │   │   └── WeldJoint.mjs
│   │   ├── Body.mjs
│   │   ├── ContactSolver.mjs
│   │   ├── Island.mjs
│   │   └── Material.mjs
│   ├── math/
│   │   ├── AABB.mjs
│   │   ├── Mat22.mjs
│   │   ├── MathUtils.mjs
│   │   ├── Transform.mjs
│   │   └── Vec2.mjs
│   ├── subqg/
│   │   ├── MetricLatticeSolver.mjs
│   │   ├── RelationalGraph.mjs
│   │   ├── SubQGContactBridge.mjs
│   │   ├── SubQGGravitationField.mjs
│   │   └── SubQGPureDynamics.mjs
│   └── world/
│       ├── ContactListener.mjs
│       ├── StepConfig.mjs
│       └── World.mjs
├── tests/
│   ├── api_server.test.mjs
│   ├── collision_narrowphase.test.mjs
│   ├── dynamics_fall_bounce.test.mjs
│   ├── game_scenarios.test.mjs
│   ├── joints_and_constraints.test.mjs
│   ├── math.test.mjs
│   ├── raycast.test.mjs
│   ├── shapes_and_aabb.test.mjs
│   ├── stacking_stability.test.mjs
│   ├── subqg_internal_metric.test.mjs
│   └── triggers_and_sensors.test.mjs
├── tools/
│   ├── build_standalone_demo.mjs
│   ├── serve.mjs
│   └── start_physics_server.mjs
├── index.mjs
├── package.json
└── README.md
```

## File: `README.md`  
- Path: `README.md`  
- Size: 14065 Bytes  
- Modified: 2026-11-12 01:53:26 UTC  
- Condensed: comments and repeated blank lines reduced

```markdown
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

// Welt mit Erdschwerkraft (g = 9.81 m/s2)
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
👉 [`demo/standalone_demo.html`](file:

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

```

## File: `package.json`  
- Path: `package.json`  
- Size: 883 Bytes  
- Modified: 2026-11-12 15:48:18 UTC

```json
{
  "name": "subqg-game-physic-engine",
  "version": "1.0.0",
  "description": "Production-ready, ergonomic 2D/3D Game Physics Engine powered by underlying Subquantum Graphity (SubQG) relational metric lattice & action dynamics.",
  "type": "module",
  "main": "index.mjs",
  "scripts": {
    "start": "node tools/serve.mjs",
    "server": "node tools/start_physics_server.mjs",
    "build": "node tools/build_standalone_demo.mjs",
    "test": "node --test tests/*.test.mjs",
    "test:watch": "node --test --watch tests/*.test.mjs",
    "demo": "node examples/01_falling_box.mjs"
  },
  "keywords": [
    "physics",
    "physics-engine",
    "game-physics",
    "subqg",
    "subquantum-graphity",
    "rigidbody",
    "collision-detection",
    "sat",
    "joints",
    "raycast",
    "relational-gravity"
  ],
  "author": "SubQG Research & Engineering Team",
  "license": "MIT"
}

```

## File: `src/api/SubQGServer.mjs`  
- Path: `src/api/SubQGServer.mjs`  
- Size: 14522 Bytes  
- Modified: 2026-11-12 15:46:08 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import net from 'node:net';
import http from 'node:http';
import { World } from '../world/World.mjs';
import { Vec2 } from '../math/Vec2.mjs';
import { Material } from '../dynamics/Material.mjs';
import { DemoScenes } from '../../demo/demo_scenes.mjs';

export class SubQGServer {
  constructor(options = {}) {
    this.tcpPort = options.tcpPort ?? 3001;
    this.httpPort = options.httpPort ?? 3002;
    this.world = new World({
      engineMode: options.engineMode ?? 'pure-subqg',
      gravity: new Vec2(0, -9.81),
      enableSubQGLattice: true
    });

    this.namedBodies = new Map();
    this.namedJoints = new Map();
    this.autoIncrementId = 1;

    this.tcpServer = null;
    this.httpServer = null;
    this.activeSubscriptions = new Set();
    this.tickerInterval = null;
  }

  start() {
    return new Promise((resolve, reject) => {

      this.tcpServer = net.createServer((socket) => {
        let buffer = '';

        socket.on('data', (chunk) => {
          buffer += chunk.toString('utf-8');
          let newlineIdx;
          while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
            const line = buffer.slice(0, newlineIdx).trim();
            buffer = buffer.slice(newlineIdx + 1);
            if (line.length > 0) {
              try {
                const req = JSON.parse(line);
                const res = this.handleCommand(req);
                socket.write(JSON.stringify(res) + '\n');
              } catch (err) {
                socket.write(JSON.stringify({ error: err.message, id: null }) + '\n');
              }
            }
          }
        });

        socket.on('error', (err) => {
          this.activeSubscriptions.delete(socket);
        });

        socket.on('close', () => {
          this.activeSubscriptions.delete(socket);
        });
      });

      this.tcpServer.on('error', (err) => {
        console.error(`[SubQG TCP Server Error] ${err.message}`);
      });

      this.httpServer = http.createServer((req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.writeHead(204);
          res.end();
          return;
        }

        if (req.url === '/api/state' && req.method === 'GET') {
          const state = this.getStateSnapshot();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(state));
          return;
        }

        if (req.url === '/api/rpc' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', () => {
            try {
              const rpc = JSON.parse(body);
              const result = this.handleCommand(rpc);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(result));
            } catch (err) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
      });

      this.tcpServer.listen(this.tcpPort, () => {
        this.httpServer.listen(this.httpPort, () => {
          console.log(`[SubQG Server] Running! TCP Bridge: port ${this.tcpPort} | HTTP RPC: port ${this.httpPort}`);
          resolve({ tcpPort: this.tcpPort, httpPort: this.httpPort });
        });
      });
    });
  }

  stop() {
    if (this.tickerInterval) clearInterval(this.tickerInterval);
    if (this.tcpServer) this.tcpServer.close();
    if (this.httpServer) this.httpServer.close();
  }

  handleCommand(req) {
    const id = req.id ?? null;
    const method = req.method;
    const params = req.params || {};

    try {
      switch (method) {
        case 'create_world': {
          this.world = new World({
            engineMode: params.engineMode ?? 'pure-subqg',
            gravity: params.gravity ? new Vec2(params.gravity[0], params.gravity[1]) : new Vec2(0, -9.81),
            enableSubQGLattice: params.enableSubQGLattice ?? true,
            velocityIterations: params.velocityIterations ?? 10
          });
          this.namedBodies.clear();
          this.namedJoints.clear();
          this.autoIncrementId = 1;
          return { id, result: { status: 'ok', engineMode: this.world.engineMode } };
        }

        case 'load_scene': {
          const sceneName = params.scene;
          if (DemoScenes[sceneName]) {
            this.world = new World({
              engineMode: params.engineMode ?? 'pure-subqg',
              gravity: new Vec2(0, -9.81),
              enableSubQGLattice: true
            });
            this.namedBodies.clear();
            this.namedJoints.clear();
            DemoScenes[sceneName](this.world);
            return { id, result: { status: 'ok', scene: sceneName, bodies: this.world.bodies.length } };
          }
          throw new Error(`Scene not found: ${sceneName}`);
        }

        case 'create_box': {
          const bodyId = params.id || `box_${this.autoIncrementId++}`;
          const mat = new Material({
            density: params.density ?? 1.0,
            friction: params.friction ?? 0.5,
            restitution: params.restitution ?? 0.1
          });
          const body = this.world.createBox(params.x ?? 0, params.y ?? 0, params.width ?? 1.0, params.height ?? 1.0, {
            type: params.type ?? 'dynamic',
            angle: params.angle ?? 0,
            linearDamping: params.linearDamping ?? 0.05,
            angularDamping: params.angularDamping ?? 0.1,
            isDestructible: params.isDestructible ?? false,
            fractureForce: params.fractureForce ?? 1500.0,
            material: mat,
            userData: bodyId
          });
          body.apiId = bodyId;
          this.namedBodies.set(bodyId, body);
          return { id, result: { bodyId, x: body.position.x, y: body.position.y } };
        }

        case 'create_circle': {
          const bodyId = params.id || `circle_${this.autoIncrementId++}`;
          const mat = new Material({
            density: params.density ?? 1.0,
            friction: params.friction ?? 0.5,
            restitution: params.restitution ?? 0.1
          });
          const body = this.world.createCircle(params.x ?? 0, params.y ?? 0, params.radius ?? 0.5, {
            type: params.type ?? 'dynamic',
            angle: params.angle ?? 0,
            linearDamping: params.linearDamping ?? 0.05,
            angularDamping: params.angularDamping ?? 0.1,
            isDestructible: params.isDestructible ?? false,
            fractureForce: params.fractureForce ?? 1500.0,
            material: mat,
            userData: bodyId
          });
          body.apiId = bodyId;
          this.namedBodies.set(bodyId, body);
          return { id, result: { bodyId, x: body.position.x, y: body.position.y } };
        }

        case 'create_capsule': {
          const bodyId = params.id || `capsule_${this.autoIncrementId++}`;
          const mat = new Material({
            density: params.density ?? 1.0,
            friction: params.friction ?? 0.5,
            restitution: params.restitution ?? 0.1
          });
          const body = this.world.createCapsule(params.x ?? 0, params.y ?? 0, params.length ?? 1.0, params.radius ?? 0.3, {
            type: params.type ?? 'dynamic',
            angle: params.angle ?? 0,
            linearDamping: params.linearDamping ?? 0.05,
            angularDamping: params.angularDamping ?? 0.1,
            isDestructible: params.isDestructible ?? false,
            fractureForce: params.fractureForce ?? 1500.0,
            material: mat,
            userData: bodyId
          });
          body.apiId = bodyId;
          this.namedBodies.set(bodyId, body);
          return { id, result: { bodyId, x: body.position.x, y: body.position.y } };
        }

        case 'create_segment': {
          const bodyId = params.id || `segment_${this.autoIncrementId++}`;
          const mat = new Material({ friction: params.friction ?? 0.8 });
          const body = this.world.createSegment(params.x1, params.y1, params.x2, params.y2, {
            type: 'static',
            material: mat,
            userData: bodyId
          });
          body.apiId = bodyId;
          this.namedBodies.set(bodyId, body);
          return { id, result: { bodyId } };
        }

        case 'create_joint': {
          const jointId = params.id || `joint_${this.autoIncrementId++}`;
          const bA = this.namedBodies.get(params.bodyA);
          const bB = this.namedBodies.get(params.bodyB);
          if (!bA || !bB) throw new Error(`Joint bodies not found: ${params.bodyA}, ${params.bodyB}`);

          let joint;
          if (params.type === 'revolute') {
            const anchor = new Vec2(params.anchorX ?? bA.position.x, params.anchorY ?? bA.position.y);
            joint = this.world.createRevoluteJoint(bA, bB, anchor, {
              breakingForce: params.breakingForce,
              enableMotor: params.enableMotor,
              motorSpeed: params.motorSpeed,
              maxMotorTorque: params.maxMotorTorque,
              enableLimit: params.enableLimit,
              lowerAngle: params.lowerAngle,
              upperAngle: params.upperAngle
            });
          } else if (params.type === 'distance') {
            const aA = new Vec2(params.localAnchorAx ?? 0, params.localAnchorAy ?? 0);
            const aB = new Vec2(params.localAnchorBx ?? 0, params.localAnchorBy ?? 0);
            joint = this.world.createDistanceJoint(bA, bB, aA, aB, {
              length: params.length,
              frequencyHz: params.frequencyHz,
              dampingRatio: params.dampingRatio,
              breakingForce: params.breakingForce
            });
          } else if (params.type === 'weld') {
            const anchor = new Vec2(params.anchorX ?? bA.position.x, params.anchorY ?? bA.position.y);
            joint = this.world.createWeldJoint(bA, bB, anchor, {
              breakingForce: params.breakingForce
            });
          }
          this.namedJoints.set(jointId, joint);
          return { id, result: { jointId } };
        }

        case 'step': {
          const dt = params.dt ?? (1.0 / 60.0);
          this.world.step(dt);
          return { id, result: this.getStateSnapshot() };
        }

        case 'get_state': {
          return { id, result: this.getStateSnapshot() };
        }

        case 'apply_force': {
          const b = this.namedBodies.get(params.id);
          if (b) {
            const f = new Vec2(params.fx, params.fy);
            if (params.px !== undefined && params.py !== undefined) {
              b.applyForceAtPoint(f, new Vec2(params.px, params.py));
            } else {
              b.applyForce(f);
            }
          }
          return { id, result: { status: 'ok' } };
        }

        case 'apply_impulse': {
          const b = this.namedBodies.get(params.id);
          if (b) {
            const imp = new Vec2(params.ix, params.iy);
            if (params.px !== undefined && params.py !== undefined) {
              b.applyImpulseAtPoint(imp, new Vec2(params.px, params.py));
            } else {
              b.applyImpulse(imp);
            }
          }
          return { id, result: { status: 'ok' } };
        }

        case 'raycast': {
          const origin = new Vec2(params.origin[0], params.origin[1]);
          const direction = new Vec2(params.direction[0], params.direction[1]);
          const maxDist = params.maxDistance ?? Infinity;
          const hit = this.world.raycast(origin, direction, maxDist);
          if (hit) {
            return {
              id,
              result: {
                hit: true,
                bodyId: hit.body.apiId || hit.body.userData,
                point: [hit.point.x, hit.point.y],
                normal: [hit.normal.x, hit.normal.y],
                fraction: hit.fraction
              }
            };
          }
          return { id, result: { hit: false } };
        }

        case 'bake': {
          const steps = params.steps ?? 240;
          const dt = params.dt ?? (1.0 / 60.0);
          const frames = [];

          for (let f = 0; f < steps; f++) {
            this.world.step(dt);
            frames.push({
              frame: f,
              time: f * dt,
              snapshot: this.getStateSnapshot()
            });
          }

          return { id, result: { totalFrames: steps, frames } };
        }

        default:
          throw new Error(`Unknown method: ${method}`);
      }
    } catch (err) {
      return { id, error: err.message };
    }
  }

  getStateSnapshot() {
    const bodies = [];
    for (const b of this.world.bodies) {
      bodies.push({
        id: b.apiId || b.userData || `b_${b.id}`,
        type: b.type,
        x: Number(b.position.x.toFixed(4)),
        y: Number(b.position.y.toFixed(4)),
        angle: Number(b.angle.toFixed(4)),
        angleDeg: Number((b.angle * 180.0 / Math.PI).toFixed(2)),
        vx: Number(b.velocity.x.toFixed(3)),
        vy: Number(b.velocity.y.toFixed(3)),
        w: Number(b.angularVelocity.toFixed(3)),
        isSleeping: b.isSleeping,
        shape: b.shapes[0]?.type || 'box'
      });
    }

    const events = [...this.world.destructionSystem.fractureEvents];

    this.world.destructionSystem.fractureEvents = [];

    return {
      time: performance.now(),
      bodyCount: this.world.bodies.length,
      jointCount: this.world.joints.length,
      brokenJoints: this.world.brokenJointsCount,
      bodies,
      events,
      subqg: {
        totalEdgeAction: this.world.subqgDiagnostics.totalEdgeAction,
        maxStrain: this.world.subqgDiagnostics.maxStrain,
        edgeCount: this.world.subqgDiagnostics.edgeCount
      }
    };
  }
}

```

## File: `src/collision/broadphase/DynamicAABBTree.mjs`  
- Path: `src/collision/broadphase/DynamicAABBTree.mjs`  
- Size: 9597 Bytes  
- Modified: 2026-11-12 01:27:46 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import { Vec2 } from '../../math/Vec2.mjs';
import { AABB } from '../../math/AABB.mjs';

class TreeNode {
  constructor(id) {
    this.id = id;
    this.aabb = new AABB();
    this.userData = null;
    this.parent = null;
    this.left = null;
    this.right = null;
    this.height = 0;
  }

  isLeaf() {
    return this.left === null;
  }
}

export class DynamicAABBTree {
  constructor(fatPadding = 0.1) {
    this.fatPadding = fatPadding;
    this.root = null;
    this.nodePool = [];
    this.nodeCount = 0;
    this.nextNodeId = 1;
  }

  _allocateNode(userData, aabb) {
    const node = new TreeNode(this.nextNodeId++);
    node.userData = userData;

    node.aabb.copy(aabb).expand(this.fatPadding);
    node.height = 0;
    return node;
  }

  insertLeaf(userData, aabb) {
    const leaf = this._allocateNode(userData, aabb);
    this.nodeCount++;

    if (!this.root) {
      this.root = leaf;
      return leaf;
    }

    let best = this.root;
    let bestCost = AABB.combineArea(this.root.aabb, leaf.aabb);
    const queue = [{ node: this.root, inheritedCost: 0 }];

    while (queue.length > 0) {
      const { node, inheritedCost } = queue.shift();
      const combined = new AABB().copy(node.aabb).combine(leaf.aabb);
      const directCost = combined.getArea();
      const totalCost = directCost + inheritedCost;

      if (totalCost < bestCost) {
        bestCost = totalCost;
        best = node;
      }

      const newInheritedCost = inheritedCost + (directCost - node.aabb.getArea());
      const lowerBound = leaf.aabb.getArea() + newInheritedCost;

      if (lowerBound < bestCost && !node.isLeaf()) {
        queue.push({ node: node.left, inheritedCost: newInheritedCost });
        queue.push({ node: node.right, inheritedCost: newInheritedCost });
      }
    }

    const oldParent = best.parent;
    const newParent = new TreeNode(this.nextNodeId++);
    newParent.parent = oldParent;
    newParent.aabb.copy(best.aabb).combine(leaf.aabb);
    newParent.height = best.height + 1;

    if (oldParent) {
      if (oldParent.left === best) oldParent.left = newParent;
      else oldParent.right = newParent;
    } else {
      this.root = newParent;
    }

    newParent.left = best;
    newParent.right = leaf;
    best.parent = newParent;
    leaf.parent = newParent;

    this._refitHierarchy(leaf.parent);

    return leaf;
  }

  removeLeaf(leaf) {
    if (!leaf) return;
    this.nodeCount--;

    if (leaf === this.root) {
      this.root = null;
      return;
    }

    const parent = leaf.parent;
    const grandParent = parent.parent;
    const sibling = parent.left === leaf ? parent.right : parent.left;

    if (grandParent) {
      if (grandParent.left === parent) grandParent.left = sibling;
      else grandParent.right = sibling;
      sibling.parent = grandParent;
      this._refitHierarchy(grandParent);
    } else {
      this.root = sibling;
      sibling.parent = null;
    }
  }

  updateLeaf(leaf, aabb, displacement = null) {

    if (leaf.aabb.containsAABB(aabb)) {
      return false;
    }

    this.removeLeaf(leaf);

    leaf.aabb.copy(aabb).expand(this.fatPadding);
    if (displacement) {
      const pred = Vec2.scale(displacement, 2.0);
      leaf.aabb.expandByVec(pred);
    }

    if (!this.root) {
      this.root = leaf;
      leaf.parent = null;
      this.nodeCount++;
      return true;
    }

    const best = this.root;
    const oldParent = best.parent;
    const newParent = new TreeNode(this.nextNodeId++);
    newParent.parent = oldParent;
    newParent.aabb.copy(best.aabb).combine(leaf.aabb);
    newParent.height = best.height + 1;

    if (oldParent) {
      if (oldParent.left === best) oldParent.left = newParent;
      else oldParent.right = newParent;
    } else {
      this.root = newParent;
    }

    newParent.left = best;
    newParent.right = leaf;
    best.parent = newParent;
    leaf.parent = newParent;

    this.nodeCount++;
    this._refitHierarchy(leaf.parent);
    return true;
  }

  _refitHierarchy(node) {
    let curr = node;
    while (curr) {
      curr = this._balance(curr);
      const left = curr.left;
      const right = curr.right;
      curr.height = 1 + Math.max(left.height, right.height);
      curr.aabb.copy(left.aabb).combine(right.aabb);
      curr = curr.parent;
    }
  }

  _balance(node) {
    if (node.isLeaf() || node.height < 2) return node;

    const left = node.left;
    const right = node.right;
    const balance = right.height - left.height;

    if (balance > 1) {
      const rLeft = right.left;
      const rRight = right.right;

      right.left = node;
      right.parent = node.parent;
      node.parent = right;

      if (right.parent) {
        if (right.parent.left === node) right.parent.left = right;
        else right.parent.right = right;
      } else {
        this.root = right;
      }

      if (rLeft.height > rRight.height) {
        right.right = rLeft;
        node.right = rRight;
        rRight.parent = node;
        node.aabb.copy(left.aabb).combine(rRight.aabb);
        right.aabb.copy(node.aabb).combine(rLeft.aabb);
        node.height = 1 + Math.max(left.height, rRight.height);
        right.height = 1 + Math.max(node.height, rLeft.height);
      } else {
        right.right = rRight;
        node.right = rLeft;
        rLeft.parent = node;
        node.aabb.copy(left.aabb).combine(rLeft.aabb);
        right.aabb.copy(node.aabb).combine(rRight.aabb);
        node.height = 1 + Math.max(left.height, rLeft.height);
        right.height = 1 + Math.max(node.height, rRight.height);
      }
      return right;
    }

    if (balance < -1) {
      const lLeft = left.left;
      const lRight = left.right;

      left.left = node;
      left.parent = node.parent;
      node.parent = left;

      if (left.parent) {
        if (left.parent.left === node) left.parent.left = left;
        else left.parent.right = left;
      } else {
        this.root = left;
      }

      if (lLeft.height > lRight.height) {
        left.right = lLeft;
        node.left = lRight;
        lRight.parent = node;
        node.aabb.copy(right.aabb).combine(lRight.aabb);
        left.aabb.copy(node.aabb).combine(lLeft.aabb);
        node.height = 1 + Math.max(right.height, lRight.height);
        left.height = 1 + Math.max(node.height, lLeft.height);
      } else {
        left.right = lRight;
        node.left = lLeft;
        lLeft.parent = node;
        node.aabb.copy(right.aabb).combine(lLeft.aabb);
        left.aabb.copy(node.aabb).combine(lRight.aabb);
        node.height = 1 + Math.max(right.height, lLeft.height);
        left.height = 1 + Math.max(node.height, lRight.height);
      }
      return left;
    }

    return node;
  }

  queryPairs(callback) {
    if (!this.root || this.root.isLeaf()) return;

    const stack = [this.root];
    while (stack.length > 0) {
      const node = stack.pop();
      if (node.isLeaf()) continue;

      this._queryCrossNodes(node.left, node.right, callback);
      stack.push(node.left);
      stack.push(node.right);
    }
  }

  _queryCrossNodes(nodeA, nodeB, callback) {
    if (!nodeA.aabb.intersects(nodeB.aabb)) return;

    if (nodeA.isLeaf() && nodeB.isLeaf()) {
      callback(nodeA.userData, nodeB.userData);
      return;
    }

    if (nodeA.isLeaf()) {
      this._queryCrossNodes(nodeA, nodeB.left, callback);
      this._queryCrossNodes(nodeA, nodeB.right, callback);
    } else if (nodeB.isLeaf()) {
      this._queryCrossNodes(nodeA.left, nodeB, callback);
      this._queryCrossNodes(nodeA.right, nodeB, callback);
    } else {
      if (nodeA.aabb.getArea() > nodeB.aabb.getArea()) {
        this._queryCrossNodes(nodeA.left, nodeB, callback);
        this._queryCrossNodes(nodeA.right, nodeB, callback);
      } else {
        this._queryCrossNodes(nodeA, nodeB.left, callback);
        this._queryCrossNodes(nodeA, nodeB.right, callback);
      }
    }
  }

  queryAABB(aabb, callback) {
    if (!this.root) return;
    const stack = [this.root];
    while (stack.length > 0) {
      const node = stack.pop();
      if (node.aabb.intersects(aabb)) {
        if (node.isLeaf()) {
          const proceed = callback(node.userData);
          if (proceed === false) return;
        } else {
          stack.push(node.left);
          stack.push(node.right);
        }
      }
    }
  }

  raycast(origin, dir, maxDist, callback) {
    if (!this.root) return;
    const stack = [this.root];
    while (stack.length > 0) {
      const node = stack.pop();
      const hit = node.aabb.raycast(origin, dir, maxDist);
      if (hit.hit) {
        if (node.isLeaf()) {
          const proceed = callback(node.userData);
          if (proceed === false) return;
        } else {
          stack.push(node.left);
          stack.push(node.right);
        }
      }
    }
  }
}

```

## File: `src/collision/narrowphase/CollisionNarrowphase.mjs`  
- Path: `src/collision/narrowphase/CollisionNarrowphase.mjs`  
- Size: 18344 Bytes  
- Modified: 2026-11-12 01:28:54 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import { Vec2 } from '../../math/Vec2.mjs';
import { ContactManifold } from './ContactManifold.mjs';
import { SAT } from './SAT.mjs';

export class CollisionNarrowphase {
  constructor(bridge) {
    this.bridge = bridge;
  }

  collide(bodyA, bodyB, shapeA, shapeB) {
    const typeA = shapeA.type;
    const typeB = shapeB.type;

    if (typeA === 'circle' && typeB === 'circle') {
      return this.collideCircleCircle(bodyA, bodyB, shapeA, shapeB);
    }
    if (typeA === 'circle' && typeB === 'box') {
      return this.collideCircleBox(bodyA, bodyB, shapeA, shapeB);
    }
    if (typeA === 'box' && typeB === 'circle') {
      return this.collideCircleBox(bodyB, bodyA, shapeB, shapeA, true);
    }
    if (typeA === 'circle' && typeB === 'polygon') {
      return this.collideCirclePolygon(bodyA, bodyB, shapeA, shapeB);
    }
    if (typeA === 'polygon' && typeB === 'circle') {
      return this.collideCirclePolygon(bodyB, bodyA, shapeB, shapeA, true);
    }
    if (typeA === 'circle' && typeB === 'segment') {
      return this.collideCircleSegment(bodyA, bodyB, shapeA, shapeB);
    }
    if (typeA === 'segment' && typeB === 'circle') {
      return this.collideCircleSegment(bodyB, bodyA, shapeB, shapeA, true);
    }
    if (typeA === 'circle' && typeB === 'capsule') {
      return this.collideCircleCapsule(bodyA, bodyB, shapeA, shapeB);
    }
    if (typeA === 'capsule' && typeB === 'circle') {
      return this.collideCircleCapsule(bodyB, bodyA, shapeB, shapeA, true);
    }

    if ((typeA === 'box' || typeA === 'polygon') && (typeB === 'box' || typeB === 'polygon')) {
      return this.collidePolyPoly(bodyA, bodyB, shapeA, shapeB);
    }

    if (typeA === 'segment' && (typeB === 'box' || typeB === 'polygon')) {
      return this.collideSegmentPoly(bodyA, bodyB, shapeA, shapeB);
    }
    if ((typeA === 'box' || typeA === 'polygon') && typeB === 'segment') {
      return this.collideSegmentPoly(bodyB, bodyA, shapeB, shapeA, true);
    }

    if (typeA === 'capsule' && (typeB === 'box' || typeB === 'polygon')) {
      return this.collideCapsulePoly(bodyA, bodyB, shapeA, shapeB);
    }
    if ((typeA === 'box' || typeA === 'polygon') && typeB === 'capsule') {
      return this.collideCapsulePoly(bodyB, bodyA, shapeB, shapeA, true);
    }
    if (typeA === 'capsule' && typeB === 'capsule') {
      return this.collideCapsuleCapsule(bodyA, bodyB, shapeA, shapeB);
    }
    if (typeA === 'capsule' && typeB === 'segment') {
      return this.collideCapsuleSegment(bodyA, bodyB, shapeA, shapeB);
    }
    if (typeA === 'segment' && typeB === 'capsule') {
      return this.collideCapsuleSegment(bodyB, bodyA, shapeB, shapeA, true);
    }

    return null;
  }

  _initManifold(bodyA, bodyB, shapeA, shapeB, flip = false) {
    const m = flip
      ? new ContactManifold(bodyB, bodyA, shapeB, shapeA)
      : new ContactManifold(bodyA, bodyB, shapeA, shapeB);

    const comb = this.bridge.combineMaterials(shapeA.material, shapeB.material);
    m.friction = comb.friction;
    m.restitution = comb.restitution;
    return m;
  }

  collideCircleCircle(bodyA, bodyB, circleA, circleB, flip = false) {
    const centerA = bodyA.transform.transformPoint(circleA.offset);
    const centerB = bodyB.transform.transformPoint(circleB.offset);

    const delta = Vec2.sub(centerB, centerA);
    const distSq = delta.lengthSq();
    const rSum = circleA.radius + circleB.radius;

    if (distSq >= rSum * rSum) return null;

    const dist = Math.sqrt(distSq);
    let normal;
    if (dist > 1e-9) {
      normal = Vec2.scale(delta, 1.0 / dist);
    } else {
      normal = new Vec2(0, 1);
    }

    const penetration = rSum - dist;
    const contactPoint = Vec2.add(centerA, Vec2.scale(normal, circleA.radius - penetration * 0.5));

    const manifold = this._initManifold(bodyA, bodyB, circleA, circleB, flip);
    manifold.normal = flip ? normal.clone().negate() : normal;
    manifold.tangent = manifold.normal.perp();
    manifold.addPoint(contactPoint, penetration);

    return manifold;
  }

  collideCircleBox(bodyA, bodyB, circleA, boxB, flip = false) {
    const centerA = bodyA.transform.transformPoint(circleA.offset);

    const localCenter = bodyB.transform.inverseTransformPoint(centerA);
    const boxOffset = boxB.offset;

    const cx = Math.max(boxOffset.x - boxB.hx, Math.min(boxOffset.x + boxB.hx, localCenter.x));
    const cy = Math.max(boxOffset.y - boxB.hy, Math.min(boxOffset.y + boxB.hy, localCenter.y));
    const closestLocal = new Vec2(cx, cy);

    let localDelta = Vec2.sub(localCenter, closestLocal);
    let distSq = localDelta.lengthSq();
    let inside = false;

    if (distSq < 1e-12) {
      inside = true;
      const dx1 = (boxOffset.x + boxB.hx) - localCenter.x;
      const dx2 = localCenter.x - (boxOffset.x - boxB.hx);
      const dy1 = (boxOffset.y + boxB.hy) - localCenter.y;
      const dy2 = localCenter.y - (boxOffset.y - boxB.hy);
      const minVal = Math.min(dx1, dx2, dy1, dy2);

      if (minVal === dx1) closestLocal.x = boxOffset.x + boxB.hx;
      else if (minVal === dx2) closestLocal.x = boxOffset.x - boxB.hx;
      else if (minVal === dy1) closestLocal.y = boxOffset.y + boxB.hy;
      else closestLocal.y = boxOffset.y - boxB.hy;

      localDelta = Vec2.sub(localCenter, closestLocal);
      distSq = localDelta.lengthSq();
    }

    if (!inside && distSq > circleA.radius * circleA.radius) {
      return null;
    }

    const dist = Math.sqrt(distSq);
    const worldClosest = bodyB.transform.transformPoint(closestLocal);

    let normal;
    let penetration;
    if (inside) {

      const localNorm = localDelta.normalize().negate();
      normal = bodyB.transform.transformVector(localNorm);
      penetration = circleA.radius + dist;
    } else {
      const localNorm = localDelta.normalize();

      normal = bodyB.transform.transformVector(localNorm).negate();
      penetration = circleA.radius - dist;
    }

    const manifold = this._initManifold(bodyA, bodyB, circleA, boxB, flip);
    manifold.normal = flip ? normal.clone().negate() : normal;
    manifold.tangent = manifold.normal.perp();
    manifold.addPoint(worldClosest, penetration);

    return manifold;
  }

  collideCirclePolygon(bodyA, bodyB, circleA, polyB, flip = false) {
    const centerA = bodyA.transform.transformPoint(circleA.offset);
    const verts = polyB.getWorldVertices(bodyB.transform);
    const normals = polyB.getWorldNormals(bodyB.transform);
    const n = verts.length;

    let maxSep = -Infinity;
    let bestEdge = 0;

    for (let i = 0; i < n; i++) {
      const v = verts[i];
      const norm = normals[i];
      const sep = norm.dot(Vec2.sub(centerA, v));
      if (sep > circleA.radius) {
        return null;
      }
      if (sep > maxSep) {
        maxSep = sep;
        bestEdge = i;
      }
    }

    const v1 = verts[bestEdge];
    const v2 = verts[(bestEdge + 1) % n];
    const edge = Vec2.sub(v2, v1);
    const edgeLenSq = edge.lengthSq();
    const toCenter = Vec2.sub(centerA, v1);
    const u = Math.max(0, Math.min(1, toCenter.dot(edge) / edgeLenSq));
    const closest = Vec2.add(v1, Vec2.scale(edge, u));

    const delta = Vec2.sub(closest, centerA);
    const distSq = delta.lengthSq();
    if (distSq > circleA.radius * circleA.radius) return null;

    const dist = Math.sqrt(distSq);
    const normal = dist > 1e-9 ? Vec2.scale(delta, 1.0 / dist) : normals[bestEdge].clone();
    const penetration = circleA.radius - dist;

    const manifold = this._initManifold(bodyA, bodyB, circleA, polyB, flip);
    manifold.normal = flip ? normal.clone().negate() : normal;
    manifold.tangent = manifold.normal.perp();
    manifold.addPoint(closest, penetration);

    return manifold;
  }

  collideCircleSegment(bodyA, bodyB, circleA, segB, flip = false) {
    const centerA = bodyA.transform.transformPoint(circleA.offset);
    const [w1, w2] = segB.getWorldEndpoints(bodyB.transform);
    const edge = Vec2.sub(w2, w1);
    const edgeLenSq = edge.lengthSq();

    const toCenter = Vec2.sub(centerA, w1);
    const t = Math.max(0, Math.min(1, toCenter.dot(edge) / edgeLenSq));
    const closest = Vec2.add(w1, Vec2.scale(edge, t));

    const delta = Vec2.sub(closest, centerA);
    const distSq = delta.lengthSq();
    const rSum = circleA.radius + segB.thickness;

    if (distSq >= rSum * rSum) return null;

    const dist = Math.sqrt(distSq);
    const normal = dist > 1e-9 ? Vec2.scale(delta, 1.0 / dist) : new Vec2(0, 1);
    const penetration = rSum - dist;

    const manifold = this._initManifold(bodyA, bodyB, circleA, segB, flip);
    manifold.normal = flip ? normal.clone().negate() : normal;
    manifold.tangent = manifold.normal.perp();
    manifold.addPoint(closest, penetration);

    return manifold;
  }

  collideCircleCapsule(bodyA, bodyB, circleA, capB, flip = false) {
    const centerA = bodyA.transform.transformPoint(circleA.offset);
    const [p1, p2] = capB.getWorldEndpoints(bodyB.transform);
    const seg = Vec2.sub(p2, p1);
    const lenSq = seg.lengthSq();

    const t = Math.max(0, Math.min(1, Vec2.sub(centerA, p1).dot(seg) / lenSq));
    const closest = Vec2.add(p1, Vec2.scale(seg, t));

    const delta = Vec2.sub(closest, centerA);
    const distSq = delta.lengthSq();
    const rSum = circleA.radius + capB.radius;

    if (distSq >= rSum * rSum) return null;

    const dist = Math.sqrt(distSq);
    const normal = dist > 1e-9 ? Vec2.scale(delta, 1.0 / dist) : new Vec2(0, 1);
    const penetration = rSum - dist;
    const contactPt = Vec2.add(centerA, Vec2.scale(normal, circleA.radius - penetration * 0.5));

    const manifold = this._initManifold(bodyA, bodyB, circleA, capB, flip);
    manifold.normal = flip ? normal.clone().negate() : normal;
    manifold.tangent = manifold.normal.perp();
    manifold.addPoint(contactPt, penetration);

    return manifold;
  }

  collidePolyPoly(bodyA, bodyB, shapeA, shapeB, flip = false) {
    const vertsA = shapeA.getWorldVertices(bodyA.transform);
    const normalsA = shapeA.getWorldNormals(bodyA.transform);
    const vertsB = shapeB.getWorldVertices(bodyB.transform);
    const normalsB = shapeB.getWorldNormals(bodyB.transform);

    const satResult = SAT.collidePolygons(
      vertsA, normalsA, bodyA.position,
      vertsB, normalsB, bodyB.position
    );

    if (!satResult.collision) return null;

    const manifold = this._initManifold(bodyA, bodyB, shapeA, shapeB, flip);
    manifold.normal = flip ? satResult.normal.clone().negate() : satResult.normal;
    manifold.tangent = manifold.normal.perp();

    for (const pt of satResult.points) {
      manifold.addPoint(pt.point, pt.depth);
    }

    return manifold;
  }

  collideSegmentPoly(bodyA, bodyB, segA, polyB, flip = false) {

    const [w1, w2] = segA.getWorldEndpoints(bodyA.transform);
    const edge = Vec2.sub(w2, w1);
    const norm = new Vec2(edge.y, -edge.x).normalize();
    const halfThick = segA.thickness * 0.5;

    const segVerts = [
      Vec2.add(w1, Vec2.scale(norm, halfThick)),
      Vec2.add(w2, Vec2.scale(norm, halfThick)),
      Vec2.sub(w2, Vec2.scale(norm, halfThick)),
      Vec2.sub(w1, Vec2.scale(norm, halfThick))
    ];
    const segNorms = [
      norm.clone(),
      edge.clone().normalize(),
      norm.clone().negate(),
      edge.clone().normalize().negate()
    ];

    const vertsB = polyB.getWorldVertices(bodyB.transform);
    const normalsB = polyB.getWorldNormals(bodyB.transform);

    const satResult = SAT.collidePolygons(
      segVerts, segNorms, bodyA.position,
      vertsB, normalsB, bodyB.position
    );

    if (!satResult.collision) return null;

    const manifold = this._initManifold(bodyA, bodyB, segA, polyB, flip);
    manifold.normal = flip ? satResult.normal.clone().negate() : satResult.normal;
    manifold.tangent = manifold.normal.perp();

    for (const pt of satResult.points) {
      manifold.addPoint(pt.point, pt.depth);
    }

    return manifold;
  }

  collideCapsulePoly(bodyA, bodyB, capA, polyB, flip = false) {

    const [p1, p2] = capA.getWorldEndpoints(bodyA.transform);
    const seg = Vec2.sub(p2, p1);
    const vertsB = polyB.getWorldVertices(bodyB.transform);
    const normalsB = polyB.getWorldNormals(bodyB.transform);

    let bestSep = -Infinity;
    let bestNorm = null;

    for (let i = 0; i < normalsB.length; i++) {
      const n = normalsB[i];
      const d1 = n.dot(Vec2.sub(p1, vertsB[i]));
      const d2 = n.dot(Vec2.sub(p2, vertsB[i]));
      const minD = Math.min(d1, d2);
      if (minD > capA.radius) {
        return null;
      }
      if (minD > bestSep) {
        bestSep = minD;
        bestNorm = n;
      }
    }

    const manifold = this._initManifold(bodyA, bodyB, capA, polyB, flip);
    const normal = bestNorm ? bestNorm.clone().negate() : new Vec2(0, -1);
    manifold.normal = flip ? normal.clone().negate() : normal;
    manifold.tangent = manifold.normal.perp();

    for (const p of [p1, p2]) {
      let inside = true;
      let minPen = Infinity;
      let closestPt = null;

      for (let i = 0; i < vertsB.length; i++) {
        const v1 = vertsB[i];
        const v2 = vertsB[(i + 1) % vertsB.length];
        const edge = Vec2.sub(v2, v1);
        const norm = normalsB[i];
        const dist = norm.dot(Vec2.sub(p, v1));
        if (dist > capA.radius) {
          inside = false;
          break;
        }
        const pen = capA.radius - dist;
        if (pen < minPen) {
          minPen = pen;
          closestPt = Vec2.add(p, Vec2.scale(norm, -dist));
        }
      }

      if (inside && closestPt) {
        manifold.addPoint(closestPt, minPen);
      }
    }

    if (manifold.points.length === 0) {
      const mid = Vec2.lerp(p1, p2, 0.5);
      manifold.addPoint(mid, capA.radius - bestSep);
    }

    return manifold;
  }

  collideCapsuleCapsule(bodyA, bodyB, capA, capB, flip = false) {
    const [a1, a2] = capA.getWorldEndpoints(bodyA.transform);
    const [b1, b2] = capB.getWorldEndpoints(bodyB.transform);

    const segA = Vec2.sub(a2, a1);
    const segB = Vec2.sub(b2, b1);
    const r = Vec2.sub(a1, b1);

    const a = segA.dot(segA);
    const e = segB.dot(segB);
    const f = segB.dot(r);

    let s = 0.0;
    let t = 0.0;

    const c = segA.dot(r);
    const b = segA.dot(segB);
    const denom = a * e - b * b;

    if (denom !== 0.0) {
      s = Math.max(0.0, Math.min(1.0, (b * f - c * e) / denom));
    }

    t = (b * s + f) / e;
    if (t < 0.0) {
      t = 0.0;
      s = Math.max(0.0, Math.min(1.0, -c / a));
    } else if (t > 1.0) {
      t = 1.0;
      s = Math.max(0.0, Math.min(1.0, (b - c) / a));
    }

    const closestA = Vec2.add(a1, Vec2.scale(segA, s));
    const closestB = Vec2.add(b1, Vec2.scale(segB, t));

    const delta = Vec2.sub(closestB, closestA);
    const distSq = delta.lengthSq();
    const rSum = capA.radius + capB.radius;

    if (distSq >= rSum * rSum) return null;

    const dist = Math.sqrt(distSq);
    const normal = dist > 1e-9 ? Vec2.scale(delta, 1.0 / dist) : new Vec2(0, 1);
    const penetration = rSum - dist;
    const pt = Vec2.add(closestA, Vec2.scale(normal, capA.radius - penetration * 0.5));

    const manifold = this._initManifold(bodyA, bodyB, capA, capB, flip);
    manifold.normal = flip ? normal.clone().negate() : normal;
    manifold.tangent = manifold.normal.perp();
    manifold.addPoint(pt, penetration);

    return manifold;
  }

  collideCapsuleSegment(bodyA, bodyB, capA, segB, flip = false) {

    const [a1, a2] = capA.getWorldEndpoints(bodyA.transform);
    const [b1, b2] = segB.getWorldEndpoints(bodyB.transform);

    const segA = Vec2.sub(a2, a1);
    const segB_vec = Vec2.sub(b2, b1);
    const r = Vec2.sub(a1, b1);

    const a = segA.dot(segA);
    const e = segB_vec.dot(segB_vec);
    const f = segB_vec.dot(r);

    let s = 0.0, t = 0.0;
    const c = segA.dot(r);
    const b = segA.dot(segB_vec);
    const denom = a * e - b * b;

    if (denom !== 0.0) s = Math.max(0.0, Math.min(1.0, (b * f - c * e) / denom));
    t = (b * s + f) / e;
    if (t < 0.0) { t = 0.0; s = Math.max(0.0, Math.min(1.0, -c / a)); }
    else if (t > 1.0) { t = 1.0; s = Math.max(0.0, Math.min(1.0, (b - c) / a)); }

    const closestA = Vec2.add(a1, Vec2.scale(segA, s));
    const closestB = Vec2.add(b1, Vec2.scale(segB_vec, t));

    const delta = Vec2.sub(closestB, closestA);
    const distSq = delta.lengthSq();
    const rSum = capA.radius + segB.thickness;

    if (distSq >= rSum * rSum) return null;

    const dist = Math.sqrt(distSq);
    const normal = dist > 1e-9 ? Vec2.scale(delta, 1.0 / dist) : new Vec2(0, 1);
    const penetration = rSum - dist;

    const manifold = this._initManifold(bodyA, bodyB, capA, segB, flip);
    manifold.normal = flip ? normal.clone().negate() : normal;
    manifold.tangent = manifold.normal.perp();
    manifold.addPoint(closestB, penetration);

    return manifold;
  }
}

```

## File: `src/collision/narrowphase/ContactManifold.mjs`  
- Path: `src/collision/narrowphase/ContactManifold.mjs`  
- Size: 1881 Bytes  
- Modified: 2026-11-12 01:27:58 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import { Vec2 } from '../../math/Vec2.mjs';

export class ContactPoint {
  constructor(point = new Vec2(0, 0), penetration = 0) {
    this.point = point.clone();
    this.penetration = penetration;
    this.normalImpulse = 0.0;
    this.tangentImpulse = 0.0;
    this.rA = new Vec2(0, 0);
    this.rB = new Vec2(0, 0);
    this.normalMass = 0.0;
    this.tangentMass = 0.0;
    this.bias = 0.0;
  }
}

export class ContactManifold {
  constructor(bodyA, bodyB, shapeA, shapeB) {
    this.bodyA = bodyA;
    this.bodyB = bodyB;
    this.shapeA = shapeA;
    this.shapeB = shapeB;
    this.normal = new Vec2(0, 1);
    this.tangent = new Vec2(-1, 0);
    this.points = [];
    this.friction = 0.3;
    this.restitution = 0.0;
    this.isTrigger = shapeA.isTrigger || shapeB.isTrigger;
  }

  addPoint(point, penetration) {
    this.points.push(new ContactPoint(point, penetration));
  }

  get key() {
    const idA = this.bodyA.id;
    const idB = this.bodyB.id;
    return idA < idB ? `${idA}:${idB}` : `${idB}:${idA}`;
  }
}

```

## File: `src/collision/narrowphase/SAT.mjs`  
- Path: `src/collision/narrowphase/SAT.mjs`  
- Size: 6235 Bytes  
- Modified: 2026-11-12 01:28:14 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import { Vec2 } from '../../math/Vec2.mjs';

export class SAT {

  static projectPolygon(axis, vertices) {
    let min = axis.dot(vertices[0]);
    let max = min;
    for (let i = 1; i < vertices.length; i++) {
      const p = axis.dot(vertices[i]);
      if (p < min) min = p;
      if (p > max) max = p;
    }
    return [min, max];
  }

  static findMinOverlap(vertsA, normalsA, vertsB, normalsB) {
    let minOverlap = Infinity;
    let bestAxis = null;
    let bestIsA = true;

    for (let i = 0; i < normalsA.length; i++) {
      const axis = normalsA[i];
      const [minA, maxA] = SAT.projectPolygon(axis, vertsA);
      const [minB, maxB] = SAT.projectPolygon(axis, vertsB);

      if (maxA < minB || maxB < minA) {
        return { separating: true };
      }

      const overlap1 = maxA - minB;
      const overlap2 = maxB - minA;
      const overlap = Math.min(overlap1, overlap2);

      if (overlap < minOverlap) {
        minOverlap = overlap;
        bestAxis = axis;
        bestIsA = true;
      }
    }

    for (let i = 0; i < normalsB.length; i++) {
      const axis = normalsB[i];
      const [minA, maxA] = SAT.projectPolygon(axis, vertsA);
      const [minB, maxB] = SAT.projectPolygon(axis, vertsB);

      if (maxA < minB || maxB < minA) {
        return { separating: true };
      }

      const overlap1 = maxA - minB;
      const overlap2 = maxB - minA;
      const overlap = Math.min(overlap1, overlap2);

      if (overlap < minOverlap) {
        minOverlap = overlap;
        bestAxis = axis;
        bestIsA = false;
      }
    }

    return {
      separating: false,
      overlap: minOverlap,
      axis: bestAxis,
      isAxisFromA: bestIsA
    };
  }

  static clipSegmentToLine(vIn, normal, offset) {
    const vOut = [];
    const d0 = normal.dot(vIn[0]) - offset;
    const d1 = normal.dot(vIn[1]) - offset;

    if (d0 <= 0.0) vOut.push(vIn[0]);
    if (d1 <= 0.0) vOut.push(vIn[1]);

    if (d0 * d1 < 0.0) {
      const alpha = d0 / (d0 - d1);
      const interp = Vec2.add(vIn[0], Vec2.scale(Vec2.sub(vIn[1], vIn[0]), alpha));
      vOut.push(interp);
    }

    return vOut;
  }

  static findIncidentEdge(refNormal, verts) {
    let minDot = Infinity;
    let incidentIndex = 0;
    const n = verts.length;

    for (let i = 0; i < n; i++) {
      const p1 = verts[i];
      const p2 = verts[(i + 1) % n];
      const edge = Vec2.sub(p2, p1);
      const normal = new Vec2(edge.y, -edge.x).normalize();
      const dot = normal.dot(refNormal);
      if (dot < minDot) {
        minDot = dot;
        incidentIndex = i;
      }
    }

    const p1 = verts[incidentIndex];
    const p2 = verts[(incidentIndex + 1) % n];
    return [p1, p2];
  }

  static collidePolygons(vertsA, normalsA, posA, vertsB, normalsB, posB) {
    const result = SAT.findMinOverlap(vertsA, normalsA, vertsB, normalsB);
    if (result.separating) {
      return { collision: false };
    }

    let normal = result.axis.clone();

    const centerDir = Vec2.sub(posB, posA);
    if (normal.dot(centerDir) < 0) {
      normal.negate();
    }

    let refVerts, incVerts, refNormal;
    if (result.isAxisFromA) {
      refVerts = vertsA;
      incVerts = vertsB;
      refNormal = normal.clone();
    } else {
      refVerts = vertsB;
      incVerts = vertsA;
      refNormal = normal.clone().negate();
    }

    let maxDot = -Infinity;
    let refIndex = 0;
    const nRef = refVerts.length;
    for (let i = 0; i < nRef; i++) {
      const p1 = refVerts[i];
      const p2 = refVerts[(i + 1) % nRef];
      const edge = Vec2.sub(p2, p1);
      const edgeNorm = new Vec2(edge.y, -edge.x).normalize();
      const dot = edgeNorm.dot(refNormal);
      if (dot > maxDot) {
        maxDot = dot;
        refIndex = i;
      }
    }

    const refV1 = refVerts[refIndex];
    const refV2 = refVerts[(refIndex + 1) % nRef];
    const refEdge = Vec2.sub(refV2, refV1).normalize();
    const refTangent = refEdge.clone();

    let incident = SAT.findIncidentEdge(refNormal, incVerts);

    incident = SAT.clipSegmentToLine(incident, refTangent.clone().negate(), -refTangent.dot(refV1));
    if (incident.length < 2) return { collision: false };

    incident = SAT.clipSegmentToLine(incident, refTangent, refTangent.dot(refV2));
    if (incident.length < 2) return { collision: false };

    const frontOffset = refNormal.dot(refV1);
    const contactPoints = [];

    for (const pt of incident) {
      const sep = refNormal.dot(pt) - frontOffset;
      if (sep <= 0.0) {
        const depth = -sep;

        const contactPoint = result.isAxisFromA ? pt : Vec2.add(pt, Vec2.scale(normal, depth));
        contactPoints.push({
          point: contactPoint,
          depth: Math.max(depth, result.overlap)
        });
      }
    }

    if (contactPoints.length === 0) {

      const mid = Vec2.lerp(posA, posB, 0.5);
      contactPoints.push({
        point: mid,
        depth: result.overlap
      });
    }

    return {
      collision: true,
      normal,
      points: contactPoints
    };
  }
}

```

## File: `src/collision/Raycast.mjs`  
- Path: `src/collision/Raycast.mjs`  
- Size: 781 Bytes  
- Modified: 2026-11-12 01:29:00 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import { Vec2 } from '../math/Vec2.mjs';

export class Ray {
  constructor(origin = new Vec2(0, 0), direction = new Vec2(1, 0), maxDistance = Infinity) {
    this.origin = origin.clone();
    this.direction = direction.clone().normalize();
    this.maxDistance = maxDistance;
  }
}

export class RaycastHit {
  constructor(body = null, shape = null, point = new Vec2(0, 0), normal = new Vec2(0, 1), fraction = 0) {
    this.body = body;
    this.shape = shape;
    this.point = point.clone();
    this.normal = normal.clone();
    this.fraction = fraction;
    this.distance = fraction;
  }
}

```

## File: `src/collision/shapes/Box.mjs`  
- Path: `src/collision/shapes/Box.mjs`  
- Size: 3038 Bytes  
- Modified: 2026-11-12 01:26:50 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import { Shape } from './Shape.mjs';
import { Vec2 } from '../../math/Vec2.mjs';
import { AABB } from '../../math/AABB.mjs';

export class Box extends Shape {
  constructor(width = 1.0, height = 1.0, offset = new Vec2(0, 0)) {
    super('box');
    this.width = Math.max(1e-4, width);
    this.height = Math.max(1e-4, height);
    this.offset = offset.clone();
    this.hx = this.width * 0.5;
    this.hy = this.height * 0.5;
  }

  computeMassData(density) {
    const area = this.width * this.height;
    const mass = density * area;

    const dSq = this.offset.lengthSq();
    const inertia = (1.0 / 12.0) * mass * (this.width * this.width + this.height * this.height) + mass * dSq;
    return { mass, inertia, area };
  }

  getLocalVertices() {
    const ox = this.offset.x;
    const oy = this.offset.y;
    return [
      new Vec2(ox - this.hx, oy - this.hy),
      new Vec2(ox + this.hx, oy - this.hy),
      new Vec2(ox + this.hx, oy + this.hy),
      new Vec2(ox - this.hx, oy + this.hy)
    ];
  }

  getWorldVertices(transform) {
    const local = this.getLocalVertices();
    return local.map(v => transform.transformPoint(v));
  }

  getWorldNormals(transform) {

    const n1 = transform.transformVector(new Vec2(1, 0));
    const n2 = transform.transformVector(new Vec2(0, 1));
    return [n1, n2];
  }

  computeAABB(transform) {
    const verts = this.getWorldVertices(transform);
    const min = new Vec2(Infinity, Infinity);
    const max = new Vec2(-Infinity, -Infinity);

    for (const v of verts) {
      if (v.x < min.x) min.x = v.x;
      if (v.x > max.x) max.x = v.x;
      if (v.y < min.y) min.y = v.y;
      if (v.y > max.y) max.y = v.y;
    }

    return new AABB(min, max);
  }

  testPoint(point, transform) {

    const local = transform.inverseTransformPoint(point);
    const dx = local.x - this.offset.x;
    const dy = local.y - this.offset.y;
    return Math.abs(dx) <= this.hx && Math.abs(dy) <= this.hy;
  }

  raycast(ray, transform, maxDist = Infinity) {

    const localOrigin = transform.inverseTransformPoint(ray.origin);
    const localDir = transform.inverseTransformVector(ray.direction);

    const aabb = new AABB(
      new Vec2(this.offset.x - this.hx, this.offset.y - this.hy),
      new Vec2(this.offset.x + this.hx, this.offset.y + this.hy)
    );

    const hit = aabb.raycast(localOrigin, localDir, maxDist);
    if (!hit.hit) return { hit: false };

    const worldPoint = transform.transformPoint(hit.point);
    const worldNormal = transform.transformVector(hit.normal);

    return {
      hit: true,
      fraction: hit.fraction,
      point: worldPoint,
      normal: worldNormal
    };
  }
}

```

## File: `src/collision/shapes/Capsule.mjs`  
- Path: `src/collision/shapes/Capsule.mjs`  
- Size: 3945 Bytes  
- Modified: 2026-11-12 01:27:12 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import { Shape } from './Shape.mjs';
import { Vec2 } from '../../math/Vec2.mjs';
import { AABB } from '../../math/AABB.mjs';

export class Capsule extends Shape {
  constructor(length = 1.0, radius = 0.3, offset = new Vec2(0, 0)) {
    super('capsule');
    this.length = Math.max(1e-4, length);
    this.radius = Math.max(1e-4, radius);
    this.offset = offset.clone();
    this.hl = this.length * 0.5;
  }

  computeMassData(density) {

    const rectArea = this.length * (2.0 * this.radius);
    const circleArea = Math.PI * this.radius * this.radius;
    const area = rectArea + circleArea;
    const mass = density * area;

    const mRect = density * rectArea;
    const iRect = (1.0 / 12.0) * mRect * (this.length * this.length + 4.0 * this.radius * this.radius);

    const mCircle = density * circleArea;
    const iCircle = mCircle * (0.5 * this.radius * this.radius + this.hl * this.hl);

    const dSq = this.offset.lengthSq();
    const inertia = (iRect + iCircle) + mass * dSq;

    return { mass, inertia, area };
  }

  getLocalEndpoints() {
    const ox = this.offset.x;
    const oy = this.offset.y;

    return [
      new Vec2(ox, oy - this.hl),
      new Vec2(ox, oy + this.hl)
    ];
  }

  getWorldEndpoints(transform) {
    const [p1, p2] = this.getLocalEndpoints();
    return [
      transform.transformPoint(p1),
      transform.transformPoint(p2)
    ];
  }

  computeAABB(transform) {
    const [p1, p2] = this.getWorldEndpoints(transform);
    const r = this.radius;
    const min = new Vec2(
      Math.min(p1.x, p2.x) - r,
      Math.min(p1.y, p2.y) - r
    );
    const max = new Vec2(
      Math.max(p1.x, p2.x) + r,
      Math.max(p1.y, p2.y) + r
    );
    return new AABB(min, max);
  }

  testPoint(point, transform) {
    const [p1, p2] = this.getWorldEndpoints(transform);
    const seg = Vec2.sub(p2, p1);
    const lenSq = seg.lengthSq();
    if (lenSq < 1e-9) {
      return p1.distanceToSq(point) <= this.radius * this.radius;
    }
    const t = Math.max(0, Math.min(1, Vec2.sub(point, p1).dot(seg) / lenSq));
    const closest = Vec2.add(p1, Vec2.scale(seg, t));
    return closest.distanceToSq(point) <= this.radius * this.radius;
  }

  raycast(ray, transform, maxDist = Infinity) {

    const [p1, p2] = this.getWorldEndpoints(transform);

    const seg = Vec2.sub(p2, p1);
    const segLen = seg.length();

    const aabb = this.computeAABB(transform);
    const hitBox = aabb.raycast(ray.origin, ray.direction, maxDist);
    if (!hitBox.hit) return { hit: false };

    let bestHit = null;
    let minFraction = Infinity;

    for (const p of [p1, p2]) {
      const m = Vec2.sub(ray.origin, p);
      const b = m.dot(ray.direction);
      const c = m.dot(m) - this.radius * this.radius;
      if (!(c > 0 && b > 0)) {
        const discr = b * b - c;
        if (discr >= 0) {
          let t = -b - Math.sqrt(discr);
          if (t >= 0 && t < minFraction && t <= maxDist) {
            minFraction = t;
            const pt = Vec2.add(ray.origin, Vec2.scale(ray.direction, t));
            bestHit = {
              hit: true,
              fraction: t,
              point: pt,
              normal: Vec2.sub(pt, p).normalize()
            };
          }
        }
      }
    }

    if (bestHit) return bestHit;
    return hitBox;
  }
}

```

## File: `src/collision/shapes/Circle.mjs`  
- Path: `src/collision/shapes/Circle.mjs`  
- Size: 1964 Bytes  
- Modified: 2026-11-12 01:26:36 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import { Shape } from './Shape.mjs';
import { Vec2 } from '../../math/Vec2.mjs';
import { AABB } from '../../math/AABB.mjs';

export class Circle extends Shape {
  constructor(radius = 0.5, offset = new Vec2(0, 0)) {
    super('circle');
    this.radius = Math.max(1e-4, radius);
    this.offset = offset.clone();
  }

  computeMassData(density) {
    const area = Math.PI * this.radius * this.radius;
    const mass = density * area;

    const dSq = this.offset.lengthSq();
    const inertia = 0.5 * mass * this.radius * this.radius + mass * dSq;
    return { mass, inertia, area };
  }

  computeAABB(transform) {
    const center = transform.transformPoint(this.offset);
    const r = this.radius;
    return new AABB(
      new Vec2(center.x - r, center.y - r),
      new Vec2(center.x + r, center.y + r)
    );
  }

  testPoint(point, transform) {
    const center = transform.transformPoint(this.offset);
    return center.distanceToSq(point) <= this.radius * this.radius;
  }

  raycast(ray, transform, maxDist = Infinity) {
    const center = transform.transformPoint(this.offset);
    const m = Vec2.sub(ray.origin, center);
    const b = m.dot(ray.direction);
    const c = m.dot(m) - this.radius * this.radius;

    if (c > 0.0 && b > 0.0) return { hit: false };

    const discr = b * b - c;
    if (discr < 0.0) return { hit: false };

    let t = -b - Math.sqrt(discr);
    if (t < 0.0) t = 0.0;

    if (t > maxDist) return { hit: false };

    const hitPoint = Vec2.add(ray.origin, Vec2.scale(ray.direction, t));
    const normal = Vec2.sub(hitPoint, center).normalize();

    return {
      hit: true,
      fraction: t,
      point: hitPoint,
      normal
    };
  }
}

```

## File: `src/collision/shapes/Polygon.mjs`  
- Path: `src/collision/shapes/Polygon.mjs`  
- Size: 4726 Bytes  
- Modified: 2026-11-12 01:27:02 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import { Shape } from './Shape.mjs';
import { Vec2 } from '../../math/Vec2.mjs';
import { AABB } from '../../math/AABB.mjs';

export class Polygon extends Shape {
  constructor(vertices = [], offset = new Vec2(0, 0)) {
    super('polygon');
    if (vertices.length < 3) {
      throw new Error('Polygon requires at least 3 vertices');
    }
    this.offset = offset.clone();
    this.localVertices = vertices.map(v => v.clone());
    this._ensureCounterClockwise();
    this.localNormals = this._computeLocalNormals();
  }

  _ensureCounterClockwise() {
    let area2 = 0;
    const n = this.localVertices.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area2 += this.localVertices[i].cross(this.localVertices[j]);
    }

    if (area2 < 0) {
      this.localVertices.reverse();
    }
  }

  _computeLocalNormals() {
    const normals = [];
    const n = this.localVertices.length;
    for (let i = 0; i < n; i++) {
      const p1 = this.localVertices[i];
      const p2 = this.localVertices[(i + 1) % n];
      const edge = Vec2.sub(p2, p1);

      const normal = new Vec2(edge.y, -edge.x).normalize();
      normals.push(normal);
    }
    return normals;
  }

  computeMassData(density) {
    let area = 0.0;
    let cx = 0.0;
    let cy = 0.0;
    let inertia = 0.0;
    const n = this.localVertices.length;

    for (let i = 0; i < n; i++) {
      const p1 = this.localVertices[i];
      const p2 = this.localVertices[(i + 1) % n];
      const cross = p1.cross(p2);
      area += cross * 0.5;
      cx += (p1.x + p2.x) * cross;
      cy += (p1.y + p2.y) * cross;

      const intx2 = p1.x * p1.x + p1.x * p2.x + p2.x * p2.x;
      const inty2 = p1.y * p1.y + p1.y * p2.y + p2.y * p2.y;
      inertia += (0.25 * (1.0 / 3.0) * cross) * (intx2 + inty2);
    }

    area = Math.abs(area);
    const mass = density * area;
    inertia = Math.abs(inertia) * density;

    return { mass, inertia: Math.max(1e-4, inertia), area };
  }

  getWorldVertices(transform) {
    return this.localVertices.map(v => {
      const local = Vec2.add(v, this.offset);
      return transform.transformPoint(local);
    });
  }

  getWorldNormals(transform) {
    return this.localNormals.map(n => transform.transformVector(n));
  }

  computeAABB(transform) {
    const verts = this.getWorldVertices(transform);
    const min = new Vec2(Infinity, Infinity);
    const max = new Vec2(-Infinity, -Infinity);

    for (const v of verts) {
      if (v.x < min.x) min.x = v.x;
      if (v.x > max.x) max.x = v.x;
      if (v.y < min.y) min.y = v.y;
      if (v.y > max.y) max.y = v.y;
    }

    return new AABB(min, max);
  }

  testPoint(point, transform) {
    const verts = this.getWorldVertices(transform);
    const n = verts.length;
    for (let i = 0; i < n; i++) {
      const p1 = verts[i];
      const p2 = verts[(i + 1) % n];
      const edge = Vec2.sub(p2, p1);
      const toPoint = Vec2.sub(point, p1);
      if (edge.cross(toPoint) < 0) {
        return false;
      }
    }
    return true;
  }

  raycast(ray, transform, maxDist = Infinity) {
    const verts = this.getWorldVertices(transform);
    const normals = this.getWorldNormals(transform);
    let tmin = 0.0;
    let tmax = maxDist;
    let hitNormal = Vec2.zero();

    for (let i = 0; i < verts.length; i++) {
      const normal = normals[i];
      const v = verts[i];
      const denom = normal.dot(ray.direction);
      const numer = normal.dot(Vec2.sub(v, ray.origin));

      if (Math.abs(denom) < 1e-9) {

        if (numer < 0.0) return { hit: false };
      } else {
        const t = numer / denom;
        if (denom < 0.0) {

          if (t > tmin) {
            tmin = t;
            hitNormal = normal;
          }
        } else {

          if (t < tmax) {
            tmax = t;
          }
        }
      }
      if (tmin > tmax) return { hit: false };
    }

    return {
      hit: true,
      fraction: tmin,
      point: Vec2.add(ray.origin, Vec2.scale(ray.direction, tmin)),
      normal: hitNormal
    };
  }

  static createRegularPolygon(radius, sides = 5, offset = new Vec2(0, 0)) {
    const verts = [];
    const step = (Math.PI * 2.0) / sides;
    for (let i = 0; i < sides; i++) {
      const a = i * step;
      verts.push(new Vec2(Math.cos(a) * radius, Math.sin(a) * radius));
    }
    return new Polygon(verts, offset);
  }
}

```

## File: `src/collision/shapes/Segment.mjs`  
- Path: `src/collision/shapes/Segment.mjs`  
- Size: 2451 Bytes  
- Modified: 2026-11-12 01:27:20 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import { Shape } from './Shape.mjs';
import { Vec2 } from '../../math/Vec2.mjs';
import { AABB } from '../../math/AABB.mjs';

export class Segment extends Shape {
  constructor(p1 = new Vec2(-1, 0), p2 = new Vec2(1, 0)) {
    super('segment');
    this.p1 = p1.clone();
    this.p2 = p2.clone();
    this.thickness = 0.05;
  }

  computeMassData(density) {

    return { mass: 0, inertia: 0, area: 0 };
  }

  getWorldEndpoints(transform) {
    return [
      transform.transformPoint(this.p1),
      transform.transformPoint(this.p2)
    ];
  }

  computeAABB(transform) {
    const [w1, w2] = this.getWorldEndpoints(transform);
    const pad = this.thickness;
    return new AABB(
      new Vec2(Math.min(w1.x, w2.x) - pad, Math.min(w1.y, w2.y) - pad),
      new Vec2(Math.max(w1.x, w2.x) + pad, Math.max(w1.y, w2.y) + pad)
    );
  }

  testPoint(point, transform) {
    const [w1, w2] = this.getWorldEndpoints(transform);
    const seg = Vec2.sub(w2, w1);
    const lenSq = seg.lengthSq();
    if (lenSq < 1e-9) return w1.distanceToSq(point) <= this.thickness * this.thickness;
    const t = Math.max(0, Math.min(1, Vec2.sub(point, w1).dot(seg) / lenSq));
    const closest = Vec2.add(w1, Vec2.scale(seg, t));
    return closest.distanceToSq(point) <= this.thickness * this.thickness;
  }

  raycast(ray, transform, maxDist = Infinity) {
    const [w1, w2] = this.getWorldEndpoints(transform);
    const v1 = ray.origin;
    const v2 = Vec2.add(ray.origin, Vec2.scale(ray.direction, maxDist));

    const edge = Vec2.sub(w2, w1);
    const normal = new Vec2(edge.y, -edge.x).normalize();

    const d = ray.direction.cross(edge);
    if (Math.abs(d) < 1e-9) return { hit: false };

    const qp = Vec2.sub(w1, ray.origin);
    const t = qp.cross(edge) / d;
    const u = qp.cross(ray.direction) / d;

    if (t >= 0.0 && t <= maxDist && u >= 0.0 && u <= 1.0) {
      const hitPoint = Vec2.add(ray.origin, Vec2.scale(ray.direction, t));
      return {
        hit: true,
        fraction: t,
        point: hitPoint,
        normal: normal.dot(ray.direction) < 0 ? normal : normal.negate()
      };
    }

    return { hit: false };
  }
}

```

## File: `src/collision/shapes/Shape.mjs`  
- Path: `src/collision/shapes/Shape.mjs`  
- Size: 1646 Bytes  
- Modified: 2026-11-12 01:26:28 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import { Vec2 } from '../../math/Vec2.mjs';
import { AABB } from '../../math/AABB.mjs';
import { Material } from '../../dynamics/Material.mjs';

export class Shape {
  constructor(type = 'shape') {
    this.type = type;
    this.material = Material.default();
    this.isTrigger = false;
    this.body = null;
    this.offset = new Vec2(0, 0);
  }

  setMaterial(material) {
    this.material = material;
    if (this.body) this.body._recomputeMassData();
    return this;
  }

  setTrigger(isTrigger) {
    this.isTrigger = isTrigger;
    return this;
  }

  setOffset(x, y) {
    this.offset.set(x, y);
    if (this.body) this.body._recomputeMassData();
    return this;
  }

  computeMassData(density) {
    throw new Error('computeMassData() must be implemented by subclass');
  }

  computeAABB(transform) {
    throw new Error('computeAABB() must be implemented by subclass');
  }

  testPoint(point, transform) {
    throw new Error('testPoint() must be implemented by subclass');
  }

  raycast(ray, transform, maxDist) {
    throw new Error('raycast() must be implemented by subclass');
  }
}

```

## File: `src/collision/TriggerSystem.mjs`  
- Path: `src/collision/TriggerSystem.mjs`  
- Size: 2266 Bytes  
- Modified: 2026-11-12 01:29:06 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript


export class TriggerSystem {
  constructor() {
    this.currentPairs = new Set();
    this.previousPairs = new Set();
    this.listeners = [];
  }

  addListener(listener) {
    this.listeners.push(listener);
    return this;
  }

  removeListener(listener) {
    const idx = this.listeners.indexOf(listener);
    if (idx !== -1) this.listeners.splice(idx, 1);
  }

  _pairKey(shapeA, shapeB) {
    return shapeA.id < shapeB.id ? `${shapeA.id}:${shapeB.id}` : `${shapeB.id}:${shapeA.id}`;
  }

  registerOverlap(manifold) {
    if (!manifold.isTrigger) return;
    const key = this._pairKey(manifold.shapeA, manifold.shapeB);
    this.currentPairs.add({
      key,
      shapeA: manifold.shapeA,
      shapeB: manifold.shapeB,
      bodyA: manifold.bodyA,
      bodyB: manifold.bodyB
    });
  }

  flushEvents() {
    const prevMap = new Map();
    for (const p of this.previousPairs) {
      prevMap.set(p.key, p);
    }

    const currMap = new Map();
    for (const p of this.currentPairs) {
      currMap.set(p.key, p);
    }

    for (const p of this.currentPairs) {
      if (prevMap.has(p.key)) {

        this._emit('onTriggerStay', p);
      } else {

        this._emit('onTriggerEnter', p);
      }
    }

    for (const p of this.previousPairs) {
      if (!currMap.has(p.key)) {

        this._emit('onTriggerExit', p);
      }
    }

    this.previousPairs = this.currentPairs;
    this.currentPairs = new Set();
  }

  _emit(eventName, pair) {

    const triggerShape = pair.shapeA.isTrigger ? pair.shapeA : pair.shapeB;
    const otherShape = pair.shapeA.isTrigger ? pair.shapeB : pair.shapeA;
    const triggerBody = triggerShape === pair.shapeA ? pair.bodyA : pair.bodyB;
    const otherBody = triggerShape === pair.shapeA ? pair.bodyB : pair.bodyA;

    for (const listener of this.listeners) {
      if (typeof listener[eventName] === 'function') {
        listener[eventName](triggerShape, otherShape, triggerBody, otherBody);
      }
    }
  }
}

```

## File: `src/debug/CanvasRenderer.mjs`  
- Path: `src/debug/CanvasRenderer.mjs`  
- Size: 10433 Bytes  
- Modified: 2026-11-12 02:51:14 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import { Vec2 } from '../math/Vec2.mjs';

export class CanvasRenderer {
  constructor(canvas, world, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.world = world;

    this.scale = options.scale ?? 30.0;
    this.camera = options.camera ?? new Vec2(0, 5);

    this.showShapes = options.showShapes ?? true;
    this.showJoints = options.showJoints ?? true;
    this.showContacts = options.showContacts ?? true;
    this.showAABBs = options.showAABBs ?? false;
    this.showSubQGLattice = options.showSubQGLattice ?? false;
    this.showRaycasts = options.showRaycasts ?? true;

    this.activeRays = [];
  }

  worldToScreen(worldPos) {
    const cx = this.canvas.width * 0.5;
    const cy = this.canvas.height * 0.5;
    return {
      x: cx + (worldPos.x - this.camera.x) * this.scale,
      y: cy - (worldPos.y - this.camera.y) * this.scale
    };
  }

  screenToWorld(screenX, screenY) {
    const cx = this.canvas.width * 0.5;
    const cy = this.canvas.height * 0.5;
    return new Vec2(
      this.camera.x + (screenX - cx) / this.scale,
      this.camera.y - (screenY - cy) / this.scale
    );
  }

  addDebugRay(ray, hit) {
    this.activeRays.push({ ray, hit, time: 0.1 });
  }

  render(dt = 0.016) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.showSubQGLattice) {
      this._renderSubQGLattice();
    }

    if (this.showShapes) {
      this._renderBodies();
    }

    if (this.showJoints) {
      this._renderJoints();
    }

    if (this.showContacts) {
      this._renderContacts();
    }

    if (this.showRaycasts) {
      this._renderRays(dt);
    }

    this._renderDebris();
  }

  _renderSubQGLattice() {
    const ctx = this.ctx;
    const graph = this.world.subqgGraph;
    ctx.save();
    ctx.lineWidth = 1;

    for (const edge of graph.edges) {
      const uNode = graph.nodes.get(edge.u);
      const vNode = graph.nodes.get(edge.v);
      if (!uNode || !vNode) continue;

      const p1 = this.worldToScreen(uNode.pos);
      const p2 = this.worldToScreen(vNode.pos);

      const strain = Math.min(1.0, Math.abs(edge.x_e - 1.0) * 10.0);
      if (strain > 0.01) {
        ctx.strokeStyle = `rgba(255, ${Math.floor(255 * (1 - strain))}, 0, ${0.2 + 0.6 * strain})`;
      } else {
        ctx.strokeStyle = 'rgba(70, 90, 120, 0.15)';
      }

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  _renderBodies() {
    const ctx = this.ctx;

    for (const b of this.world.bodies) {
      ctx.save();
      const isSleeping = b.isSleeping;
      const isStatic = b.type === 'static';

      for (const shape of b.shapes) {
        if (shape.isTrigger) {
          ctx.fillStyle = 'rgba(255, 200, 0, 0.25)';
          ctx.strokeStyle = '#ffbb00';
        } else if (isStatic) {
          ctx.fillStyle = '#2c3e50';
          ctx.strokeStyle = '#7f8c8d';
        } else if (isSleeping) {
          ctx.fillStyle = '#4a5568';
          ctx.strokeStyle = '#a0aec0';
        } else {

          const rest = shape.material.restitution;
          if (rest > 0.6) {
            ctx.fillStyle = '#e74c3c';
            ctx.strokeStyle = '#c0392b';
          } else if (shape.material.density > 4.0) {
            ctx.fillStyle = '#95a5a6';
            ctx.strokeStyle = '#7f8c8d';
          } else {
            ctx.fillStyle = '#3498db';
            ctx.strokeStyle = '#2980b9';
          }
        }

        ctx.lineWidth = 1.5;

        if (shape.type === 'circle') {
          const center = b.transform.transformPoint(shape.offset);
          const sc = this.worldToScreen(center);
          const r = shape.radius * this.scale;

          ctx.beginPath();
          ctx.arc(sc.x, sc.y, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          const edgePt = b.transform.transformPoint(new Vec2(shape.offset.x + shape.radius, shape.offset.y));
          const scEdge = this.worldToScreen(edgePt);
          ctx.beginPath();
          ctx.moveTo(sc.x, sc.y);
          ctx.lineTo(scEdge.x, scEdge.y);
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();

        } else if (shape.type === 'box' || shape.type === 'polygon') {
          const verts = shape.getWorldVertices(b.transform);
          if (verts.length > 0) {
            ctx.beginPath();
            const start = this.worldToScreen(verts[0]);
            ctx.moveTo(start.x, start.y);
            for (let i = 1; i < verts.length; i++) {
              const sc = this.worldToScreen(verts[i]);
              ctx.lineTo(sc.x, sc.y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }

        } else if (shape.type === 'capsule') {
          const [p1, p2] = shape.getWorldEndpoints(b.transform);
          const sc1 = this.worldToScreen(p1);
          const sc2 = this.worldToScreen(p2);
          const r = shape.radius * this.scale;

          ctx.lineWidth = r * 2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(sc1.x, sc1.y);
          ctx.lineTo(sc2.x, sc2.y);
          ctx.stroke();

        } else if (shape.type === 'segment') {
          const [w1, w2] = shape.getWorldEndpoints(b.transform);
          const sc1 = this.worldToScreen(w1);
          const sc2 = this.worldToScreen(w2);

          ctx.strokeStyle = '#ecf0f1';
          ctx.lineWidth = Math.max(2, shape.thickness * this.scale);
          ctx.beginPath();
          ctx.moveTo(sc1.x, sc1.y);
          ctx.lineTo(sc2.x, sc2.y);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }

  _renderJoints() {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = '#2ecc71';
    ctx.fillStyle = '#2ecc71';
    ctx.lineWidth = 2;

    for (const j of this.world.joints) {
      if (j.type === 'distance') {
        const pA = j.bodyA.transform.transformPoint(j.localAnchorA);
        const pB = j.bodyB.transform.transformPoint(j.localAnchorB);
        const scA = this.worldToScreen(pA);
        const scB = this.worldToScreen(pB);

        ctx.beginPath();
        ctx.moveTo(scA.x, scA.y);
        ctx.lineTo(scB.x, scB.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(scA.x, scA.y, 4, 0, Math.PI * 2);
        ctx.arc(scB.x, scB.y, 4, 0, Math.PI * 2);
        ctx.fill();

      } else if (j.type === 'revolute') {
        const pA = j.bodyA.transform.transformPoint(j.localAnchorA);
        const scA = this.worldToScreen(pA);

        ctx.beginPath();
        ctx.arc(scA.x, scA.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#e67e22';
        ctx.fill();
        ctx.stroke();

      } else if (j.type === 'pulley') {
        const pA = j.bodyA.transform.transformPoint(j.localAnchorA);
        const pB = j.bodyB.transform.transformPoint(j.localAnchorB);
        const gA = j.groundAnchorA;
        const gB = j.groundAnchorB;

        const scA = this.worldToScreen(pA);
        const scB = this.worldToScreen(pB);
        const scGA = this.worldToScreen(gA);
        const scGB = this.worldToScreen(gB);

        ctx.strokeStyle = '#9b59b6';
        ctx.beginPath();
        ctx.moveTo(scA.x, scA.y);
        ctx.lineTo(scGA.x, scGA.y);
        ctx.lineTo(scGB.x, scGB.y);
        ctx.lineTo(scB.x, scB.y);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  _renderContacts() {
    const ctx = this.ctx;
    ctx.save();
    for (const m of this.world.contactManifolds.values()) {
      if (m.isTrigger) continue;
      for (const cp of m.points) {
        const sc = this.worldToScreen(cp.point);

        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(sc.x, sc.y, 3, 0, Math.PI * 2);
        ctx.fill();

        const normalEnd = Vec2.add(cp.point, Vec2.scale(m.normal, 0.3));
        const scNorm = this.worldToScreen(normalEnd);
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sc.x, sc.y);
        ctx.lineTo(scNorm.x, scNorm.y);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  _renderRays(dt) {
    const ctx = this.ctx;
    ctx.save();

    for (let i = this.activeRays.length - 1; i >= 0; i--) {
      const item = this.activeRays[i];
      item.time -= dt;
      if (item.time <= 0) {
        this.activeRays.splice(i, 1);
        continue;
      }

      const ray = item.ray;
      const hit = item.hit;
      const start = this.worldToScreen(ray.origin);
      const endPt = hit && hit.hit ? hit.point : Vec2.add(ray.origin, Vec2.scale(ray.direction, Math.min(20, ray.maxDistance)));
      const end = this.worldToScreen(endPt);

      ctx.strokeStyle = hit && hit.hit ? '#2ecc71' : '#e74c3c';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      ctx.setLineDash([]);

      if (hit && hit.hit) {
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath();
        ctx.arc(end.x, end.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  _renderDebris() {
    if (!this.world.destructionSystem) return;
    const particles = this.world.destructionSystem.debrisParticles;
    if (!particles || particles.length === 0) return;

    const ctx = this.ctx;
    ctx.save();
    for (const p of particles) {
      const sc = this.worldToScreen(new Vec2(p.x, p.y));
      const r = Math.max(1.5, p.size * this.scale);
      ctx.fillStyle = p.color || '#f6ad55';
      ctx.globalAlpha = Math.max(0.1, Math.min(1.0, p.life));
      ctx.beginPath();
      ctx.arc(sc.x, sc.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

```

## File: `src/debug/SubQGInspector.mjs`  
- Path: `src/debug/SubQGInspector.mjs`  
- Size: 2104 Bytes  
- Modified: 2026-11-12 01:32:04 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import { Vec2 } from '../math/Vec2.mjs';

export class SubQGInspector {
  constructor(world) {
    this.world = world;
  }

  computeFullEnergyAudit() {
    let kineticEnergy = 0.0;
    let rotationalEnergy = 0.0;
    let potentialEnergy = 0.0;
    const g = Math.abs(this.world.getGravity().y);

    for (const body of this.world.bodies) {
      if (body.type === 'dynamic' && body.mass > 0) {
        kineticEnergy += 0.5 * body.mass * body.velocity.lengthSq();
        rotationalEnergy += 0.5 * body.inertia * body.angularVelocity * body.angularVelocity;
        potentialEnergy += body.mass * g * Math.max(0, body.position.y);
      }
    }

    const mechanicalTotal = kineticEnergy + rotationalEnergy + potentialEnergy;
    const diag = this.world.getSubQGDiagnostics();

    return {
      kineticEnergy,
      rotationalEnergy,
      potentialEnergy,
      mechanicalTotal,
      subqgEdgeAction: diag.totalEdgeAction,
      maxMetricStrain: diag.maxStrain,
      activeEdges: diag.edgeCount,
      activeNodes: diag.nodeCount,
      stepTimeMs: diag.stepTimeMs
    };
  }

  extractMetricHeatmap(resolution = 32) {
    const graph = this.world.subqgGraph;
    const spanX = graph.extentX * 2;
    const spanY = graph.extentY * 2;
    const stepX = spanX / resolution;
    const stepY = spanY / resolution;

    const grid = [];
    for (let j = 0; j < resolution; j++) {
      const row = [];
      const y = -graph.extentY + j * stepY;
      for (let i = 0; i < resolution; i++) {
        const x = -graph.extentX + i * stepX;
        const phi = graph.samplePotential(new Vec2(x, y));
        row.push(phi);
      }
      grid.push(row);
    }

    return {
      resolution,
      spanX,
      spanY,
      grid
    };
  }
}

```

## File: `src/destruction/SubQGDestructionSystem.mjs`  
- Path: `src/destruction/SubQGDestructionSystem.mjs`  
- Size: 12109 Bytes  
- Modified: 2026-11-12 15:32:10 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import { Vec2 } from '../math/Vec2.mjs';
import { Material } from '../dynamics/Material.mjs';

export class SubQGDestructionSystem {
  constructor(world, config = {}) {
    this.world = world;
    this.enabled = config.enabled ?? true;
    this.debrisParticles = [];
    this.maxDebrisCount = config.maxDebrisCount ?? 150;
    this.fractureEvents = [];
  }

  evaluateJointFracture(dt) {
    if (!this.enabled) return;

    for (let i = this.world.joints.length - 1; i >= 0; i--) {
      const joint = this.world.joints[i];
      const rf = joint.getReactionForce(dt);
      const rt = joint.getReactionTorque(dt);

      if (rf > joint.breakingForce || rt > joint.breakingTorque) {
        joint.isBroken = true;
        this.world.brokenJointsCount++;

        const breakPt = joint.bodyA.transform.transformPoint(joint.localAnchorA || new Vec2(0, 0));
        const event = {
          type: 'joint_break',
          jointId: joint.id,
          jointType: joint.type,
          reactionForce: rf,
          breakingForce: joint.breakingForce,
          point: breakPt
        };

        this.fractureEvents.push(event);
        this.world.materialFractureEvents.push(event);
        for (const cb of this.world.jointBreakListeners) cb(event);

        this.spawnFractureSplinters(breakPt, 8, new Vec2(0, 2));

        this.world.removeJoint(joint);
      }
    }
  }

  evaluateBodyFracture(activeManifolds, dt) {
    if (!this.enabled) return;

    const bodiesToFracture = new Map();

    for (const m of activeManifolds) {
      if (m.isTrigger) continue;

      const isLaunchA = m.bodyA.userData === 'Katapult-Arm' || m.bodyA.userData === 'Katapult-Schale';
      const isLaunchB = m.bodyB.userData === 'Katapult-Arm' || m.bodyB.userData === 'Katapult-Schale';
      if (isLaunchA || isLaunchB) continue;

      for (const cp of m.points) {
        const impulse = cp.normalImpulse ?? 0;
        const impactForce = impulse / Math.max(dt, 1e-4);

        if (m.bodyA.type === 'dynamic' && m.bodyA.isDestructible && !m.bodyA.isBroken) {
          if (impactForce > (m.bodyA.fractureForce ?? 1500.0)) {
            bodiesToFracture.set(m.bodyA.id, { body: m.bodyA, impactPoint: cp.point, normal: m.normal });
          }
        }

        if (m.bodyB.type === 'dynamic' && m.bodyB.isDestructible && !m.bodyB.isBroken) {
          if (impactForce > (m.bodyB.fractureForce ?? 1500.0)) {
            bodiesToFracture.set(m.bodyB.id, { body: m.bodyB, impactPoint: cp.point, normal: m.normal });
          }
        }
      }
    }

    for (const item of bodiesToFracture.values()) {
      this.fractureBody(item.body, item.impactPoint, item.normal);
    }
  }

  fractureBody(body, impactPoint, normal) {
    if (!body || body.isBroken) return;
    body.isBroken = true;

    const shape = body.shapes[0];
    if (!shape) return;

    const parentPos = body.position;
    const parentVel = body.velocity.clone();
    const parentAngle = body.angle;
    const parentMat = shape.material || new Material({ density: 1.2 });
    const density = parentMat.density || 1.2;
    const friction = parentMat.friction || 0.6;
    const restitution = parentMat.restitution || 0.05;

    let colorType = 'wood';
    if (density >= 3.0 || (body.userData && String(body.userData).includes('Fels'))) {
      colorType = 'stone';
    } else if (restitution >= 0.4 || (body.userData && String(body.userData).includes('Ball'))) {
      colorType = 'rubber';
    }

    const pieces = [];
    const n = normal ? normal.clone().normalize() : new Vec2(0, 1);
    const tangent = new Vec2(-n.y, n.x);

    if (shape.type === 'box') {
      const isWider = shape.width >= shape.height;
      if (isWider) {
        const halfW = shape.width * 0.5;
        const pieceW = shape.width * 0.46;
        const pieceH = shape.height * 0.95;

        const offsetL = body.transform.transformVector(new Vec2(-halfW * 0.52, 0));
        const piece1 = this.world.createBox(parentPos.x + offsetL.x, parentPos.y + offsetL.y, pieceW, pieceH, {
          type: 'dynamic',
          angle: parentAngle + (Math.random() - 0.5) * 0.15,
          linearDamping: 0.15,
          angularDamping: 0.25,
          material: new Material({ density, friction, restitution })
        });
        piece1.setVelocity(parentVel.x * 0.3 - tangent.x * 1.0, parentVel.y * 0.3 - tangent.y * 1.0);
        piece1.angularVelocity = (Math.random() - 0.5) * 4.0;
        pieces.push(piece1);

        const offsetR = body.transform.transformVector(new Vec2(halfW * 0.52, 0));
        const piece2 = this.world.createBox(parentPos.x + offsetR.x, parentPos.y + offsetR.y, pieceW, pieceH, {
          type: 'dynamic',
          angle: parentAngle + (Math.random() - 0.5) * 0.15,
          linearDamping: 0.15,
          angularDamping: 0.25,
          material: new Material({ density, friction, restitution })
        });
        piece2.setVelocity(parentVel.x * 0.3 + tangent.x * 1.0, parentVel.y * 0.3 + tangent.y * 1.0);
        piece2.angularVelocity = (Math.random() - 0.5) * 4.0;
        pieces.push(piece2);
      } else {
        const halfH = shape.height * 0.5;
        const pieceW = shape.width * 0.95;
        const pieceH = shape.height * 0.46;

        const offset1 = body.transform.transformVector(new Vec2(0, -halfH * 0.52));
        const piece1 = this.world.createBox(parentPos.x + offset1.x, parentPos.y + offset1.y, pieceW, pieceH, {
          type: 'dynamic',
          angle: parentAngle + (Math.random() - 0.5) * 0.15,
          linearDamping: 0.15,
          angularDamping: 0.25,
          material: new Material({ density, friction, restitution })
        });
        piece1.setVelocity(parentVel.x * 0.3 - n.x * 0.8, parentVel.y * 0.3 - n.y * 0.8);
        piece1.angularVelocity = (Math.random() - 0.5) * 4.0;
        pieces.push(piece1);

        const offset2 = body.transform.transformVector(new Vec2(0, halfH * 0.52));
        const piece2 = this.world.createBox(parentPos.x + offset2.x, parentPos.y + offset2.y, pieceW, pieceH, {
          type: 'dynamic',
          angle: parentAngle + (Math.random() - 0.5) * 0.15,
          linearDamping: 0.15,
          angularDamping: 0.25,
          material: new Material({ density, friction, restitution })
        });
        piece2.setVelocity(parentVel.x * 0.3 + n.x * 0.8, parentVel.y * 0.3 + n.y * 0.8);
        piece2.angularVelocity = (Math.random() - 0.5) * 4.0;
        pieces.push(piece2);
      }
    } else if (shape.type === 'circle') {

      const r = shape.radius;
      const pieceR = r * 0.68;

      const offset1 = Vec2.scale(tangent, pieceR * 0.65);
      const piece1 = this.world.createCircle(parentPos.x + offset1.x, parentPos.y + offset1.y, pieceR, {
        type: 'dynamic',
        linearDamping: 0.15,
        angularDamping: 0.25,
        material: new Material({ density, friction, restitution })
      });
      piece1.setVelocity(parentVel.x * 0.4 - tangent.x * 1.5, parentVel.y * 0.4 - tangent.y * 1.5);
      piece1.angularVelocity = (Math.random() - 0.5) * 5.0;
      pieces.push(piece1);

      const offset2 = Vec2.scale(tangent, -pieceR * 0.65);
      const piece2 = this.world.createCircle(parentPos.x + offset2.x, parentPos.y + offset2.y, pieceR, {
        type: 'dynamic',
        linearDamping: 0.15,
        angularDamping: 0.25,
        material: new Material({ density, friction, restitution })
      });
      piece2.setVelocity(parentVel.x * 0.4 + tangent.x * 1.5, parentVel.y * 0.4 + tangent.y * 1.5);
      piece2.angularVelocity = (Math.random() - 0.5) * 5.0;
      pieces.push(piece2);
    } else if (shape.type === 'capsule') {

      const halfLen = Math.max(0.2, shape.length * 0.45);
      const r = shape.radius * 0.95;

      const offset1 = body.transform.transformVector(new Vec2(-shape.length * 0.28, 0));
      const piece1 = this.world.createCapsule(parentPos.x + offset1.x, parentPos.y + offset1.y, halfLen, r, {
        type: 'dynamic',
        angle: parentAngle + (Math.random() - 0.5) * 0.25,
        linearDamping: 0.15,
        angularDamping: 0.25,
        material: new Material({ density, friction, restitution })
      });
      piece1.setVelocity(parentVel.x * 0.3 - tangent.x * 1.0, parentVel.y * 0.3 - tangent.y * 1.0);
      piece1.angularVelocity = (Math.random() - 0.5) * 4.0;
      pieces.push(piece1);

      const offset2 = body.transform.transformVector(new Vec2(shape.length * 0.28, 0));
      const piece2 = this.world.createCapsule(parentPos.x + offset2.x, parentPos.y + offset2.y, halfLen, r, {
        type: 'dynamic',
        angle: parentAngle + (Math.random() - 0.5) * 0.25,
        linearDamping: 0.15,
        angularDamping: 0.25,
        material: new Material({ density, friction, restitution })
      });
      piece2.setVelocity(parentVel.x * 0.3 + tangent.x * 1.0, parentVel.y * 0.3 + tangent.y * 1.0);
      piece2.angularVelocity = (Math.random() - 0.5) * 4.0;
      pieces.push(piece2);
    }

    this.spawnFractureSplinters(impactPoint, 24, parentVel, colorType);

    this.world.removeBody(body);

    const shatterEvt = {
      type: 'body_shatter',
      bodyId: body.id,
      point: impactPoint,
      pieces: pieces.map(p => p.id)
    };
    this.fractureEvents.push(shatterEvt);
    this.world.materialFractureEvents.push(shatterEvt);
  }

  spawnFractureSplinters(pos, count = 16, baseVel = new Vec2(0, 0), colorType = 'wood') {
    let colors = ['#d97706', '#b45309', '#f59e0b', '#92400e', '#78350f'];
    if (colorType === 'stone') {
      colors = ['#94a3b8', '#64748b', '#475569', '#334155', '#cbd5e1', '#e2e8f0'];
    } else if (colorType === 'rubber') {
      colors = ['#ef4444', '#f97316', '#fbbf24', '#dc2626', '#b91c1c'];
    }

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.0 + Math.random() * 4.0;
      const vx = baseVel.x * 0.2 + Math.cos(angle) * speed;
      const vy = baseVel.y * 0.2 + Math.sin(angle) * speed + 1.2;
      this.debrisParticles.push({
        x: pos.x,
        y: pos.y,
        vx,
        vy,
        size: 0.05 + Math.random() * 0.09,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
        decay: 0.015 + Math.random() * 0.015
      });
    }

    if (this.debrisParticles.length > this.maxDebrisCount) {
      this.debrisParticles.splice(0, this.debrisParticles.length - this.maxDebrisCount);
    }
  }

  stepDebris(dt) {
    for (let i = this.debrisParticles.length - 1; i >= 0; i--) {
      const p = this.debrisParticles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy -= 9.81 * dt;
      p.life -= p.decay;
      if (p.life <= 0 || p.y < 0) {
        this.debrisParticles.splice(i, 1);
      }
    }
  }
}

```

## File: `src/dynamics/Body.mjs`  
- Path: `src/dynamics/Body.mjs`  
- Size: 7511 Bytes  
- Modified: 2026-11-12 03:00:24 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import { Vec2 } from '../math/Vec2.mjs';
import { Transform } from '../math/Transform.mjs';
import { AABB } from '../math/AABB.mjs';

let nextBodyId = 1;

export class Body {
  constructor(config = {}) {
    this.id = nextBodyId++;
    this.type = config.type ?? 'dynamic';

    this.position = config.position ? config.position.clone() : new Vec2(0, 0);
    this.velocity = config.velocity ? config.velocity.clone() : new Vec2(0, 0);
    this.angle = config.angle ?? 0.0;
    this.angularVelocity = config.angularVelocity ?? 0.0;

    this.transform = new Transform(this.position, this.angle);

    this.force = new Vec2(0, 0);
    this.torque = 0.0;

    this.linearDamping = config.linearDamping ?? 0.01;
    this.angularDamping = config.angularDamping ?? 0.02;
    this.gravityScale = config.gravityScale ?? 1.0;

    this.mass = 0.0;
    this.invMass = 0.0;
    this.inertia = 0.0;
    this.invInertia = 0.0;

    this.isDestructible = config.isDestructible ?? false;
    this.fractureForce = config.fractureForce ?? 1500.0;
    this.isBroken = false;

    this.shapes = [];
    this.aabb = new AABB();
    this.boundingRadius = 0.5;

    this.isSleeping = false;
    this.allowSleep = config.allowSleep ?? true;
    this.sleepTime = 0.0;

    this.userData = config.userData ?? null;

    this.treeLeaf = null;

    if (config.shape) {
      this.addShape(config.shape);
    }
  }

  addShape(shape) {
    shape.body = this;
    if (!shape.id) shape.id = nextBodyId++;
    this.shapes.push(shape);
    this._recomputeMassData();
    this.updateAABB();
    this.wakeUp();
    return this;
  }

  removeShape(shape) {
    const idx = this.shapes.indexOf(shape);
    if (idx !== -1) {
      this.shapes.splice(idx, 1);
      shape.body = null;
      this._recomputeMassData();
      this.updateAABB();
      this.wakeUp();
    }
    return this;
  }

  _recomputeMassData() {
    let totalMass = 0.0;
    let totalInertia = 0.0;
    let maxRadius = 0.1;

    for (const shape of this.shapes) {
      const data = shape.computeMassData(shape.material.density);
      totalMass += data.mass;
      totalInertia += data.inertia;

      const r = shape.radius || Math.hypot(shape.width || 0.5, shape.height || 0.5);
      if (r > maxRadius) maxRadius = r;
    }

    if (this.type === 'static') {

      this.mass = totalMass > 0 ? totalMass : 0.0;
      this.invMass = 0.0;
      this.inertia = totalInertia > 0 ? totalInertia : 0.0;
      this.invInertia = 0.0;
      this.boundingRadius = maxRadius;
      return;
    }

    if (totalMass > 0.0) {
      this.mass = totalMass;
      this.invMass = 1.0 / totalMass;
      this.inertia = Math.max(1e-4, totalInertia);
      this.invInertia = 1.0 / this.inertia;
    } else {
      this.mass = 1.0;
      this.invMass = 1.0;
      this.inertia = 1.0;
      this.invInertia = 1.0;
    }

    this.boundingRadius = maxRadius;
  }

  updateAABB() {
    this.transform.set(this.position, this.angle);
    this.aabb.reset();
    for (const shape of this.shapes) {
      const shapeAABB = shape.computeAABB(this.transform);
      this.aabb.combine(shapeAABB);
    }
    return this.aabb;
  }

  setPosition(x, y) {
    this.position.set(x, y);
    this.updateAABB();
    this.wakeUp();
    return this;
  }

  setAngle(angle) {
    this.angle = angle;
    this.updateAABB();
    this.wakeUp();
    return this;
  }

  setVelocity(vx, vy) {
    this.velocity.set(vx, vy);
    this.wakeUp();
    return this;
  }

  setAngularVelocity(w) {
    this.angularVelocity = w;
    this.wakeUp();
    return this;
  }

  applyForce(f) {
    if (this.type !== 'dynamic' || this.isSleeping) return;
    this.force.add(f);
    this.wakeUp();
  }

  applyTorque(t) {
    if (this.type !== 'dynamic' || this.isSleeping) return;
    this.torque += t;
    this.wakeUp();
  }

  applyForceAtPoint(f, worldPoint) {
    if (this.type !== 'dynamic' || this.isSleeping) return;
    this.force.add(f);
    const r = Vec2.sub(worldPoint, this.position);
    this.torque += r.cross(f);
    this.wakeUp();
  }

  applyImpulse(impulse) {
    if (this.type !== 'dynamic') return;
    this.velocity.addScaled(impulse, this.invMass);
    this.wakeUp();
  }

  applyAngularImpulse(impulse) {
    if (this.type !== 'dynamic') return;
    this.angularVelocity += impulse * this.invInertia;
    this.wakeUp();
  }

  applyImpulseAtPoint(impulse, worldPoint) {
    if (this.type !== 'dynamic') return;
    this.velocity.addScaled(impulse, this.invMass);
    const r = Vec2.sub(worldPoint, this.position);
    this.angularVelocity += r.cross(impulse) * this.invInertia;
    this.wakeUp();
  }

  getVelocityAtPoint(worldPoint) {
    const r = Vec2.sub(worldPoint, this.position);
    return new Vec2(
      this.velocity.x - this.angularVelocity * r.y,
      this.velocity.y + this.angularVelocity * r.x
    );
  }

  wakeUp() {
    this.isSleeping = false;
    this.sleepTime = 0.0;
  }

  putToSleep() {
    if (!this.allowSleep || this.type !== 'dynamic') return;
    this.isSleeping = true;
    this.velocity.set(0, 0);
    this.angularVelocity = 0.0;
    this.force.set(0, 0);
    this.torque = 0.0;
  }

  integrateForces(dt) {
    if (this.type !== 'dynamic' || this.isSleeping) return;

    this.velocity.addScaled(this.force, dt * this.invMass);
    this.angularVelocity += (this.torque * this.invInertia) * dt;

    const linDamp = Math.max(0.0, 1.0 - this.linearDamping * dt);
    const angDamp = Math.max(0.0, 1.0 - this.angularDamping * dt);
    this.velocity.scale(linDamp);
    this.angularVelocity *= angDamp;

    this.force.set(0, 0);
    this.torque = 0.0;
  }

  integrateVelocities(dt) {
    if (this.type === 'static' || this.isSleeping) return;

    const maxSpeed = 30.0;
    const speedSq = this.velocity.lengthSq();
    if (speedSq > maxSpeed * maxSpeed) {
      this.velocity.scale(maxSpeed / Math.sqrt(speedSq));
    }
    const maxAngSpeed = 35.0;
    if (Math.abs(this.angularVelocity) > maxAngSpeed) {
      this.angularVelocity = Math.sign(this.angularVelocity) * maxAngSpeed;
    }

    this.position.addScaled(this.velocity, dt);
    this.angle += this.angularVelocity * dt;

    this.updateAABB();
  }
}

```

## File: `src/dynamics/ContactSolver.mjs`  
- Path: `src/dynamics/ContactSolver.mjs`  
- Size: 4732 Bytes  
- Modified: 2026-11-12 01:29:44 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import { Vec2 } from '../math/Vec2.mjs';

export class ContactSolver {
  constructor(bridge) {
    this.bridge = bridge;
    this.restitutionThreshold = 0.5;
  }

  initVelocityConstraints(manifolds, dt) {
    for (const m of manifolds) {
      if (m.isTrigger) continue;

      const bA = m.bodyA;
      const bB = m.bodyB;
      const mA = bA.invMass;
      const mB = bB.invMass;
      const iA = bA.invInertia;
      const iB = bB.invInertia;
      const normal = m.normal;
      const tangent = m.tangent;

      for (const cp of m.points) {

        cp.rA = Vec2.sub(cp.point, bA.position);
        cp.rB = Vec2.sub(cp.point, bB.position);

        const rnA = cp.rA.cross(normal);
        const rnB = cp.rB.cross(normal);
        const kNormal = mA + mB + iA * rnA * rnA + iB * rnB * rnB;
        cp.normalMass = kNormal > 1e-12 ? 1.0 / kNormal : 0.0;

        const rtA = cp.rA.cross(tangent);
        const rtB = cp.rB.cross(tangent);
        const kTangent = mA + mB + iA * rtA * rtA + iB * rtB * rtB;
        cp.tangentMass = kTangent > 1e-12 ? 1.0 / kTangent : 0.0;

        const vA = bA.getVelocityAtPoint(cp.point);
        const vB = bB.getVelocityAtPoint(cp.point);
        const vRel = Vec2.sub(vB, vA);
        const vNormal = vRel.dot(normal);

        const penBias = this.bridge.computePenetrationBias(cp.penetration, dt);

        let restBias = 0.0;
        if (vNormal < -this.restitutionThreshold) {
          restBias = -m.restitution * vNormal;
        }

        cp.bias = penBias + restBias;

        const p = Vec2.add(
          Vec2.scale(normal, cp.normalImpulse),
          Vec2.scale(tangent, cp.tangentImpulse)
        );

        if (bA.type === 'dynamic') {
          bA.velocity.subScaled(p, mA);
          bA.angularVelocity -= iA * cp.rA.cross(p);
        }
        if (bB.type === 'dynamic') {
          bB.velocity.addScaled(p, mB);
          bB.angularVelocity += iB * cp.rB.cross(p);
        }
      }
    }
  }

  solveVelocityConstraints(manifolds) {
    for (const m of manifolds) {
      if (m.isTrigger) continue;

      const bA = m.bodyA;
      const bB = m.bodyB;
      const mA = bA.invMass;
      const mB = bB.invMass;
      const iA = bA.invInertia;
      const iB = bB.invInertia;
      const normal = m.normal;
      const tangent = m.tangent;
      const friction = m.friction;

      for (const cp of m.points) {

        const vA1 = bA.getVelocityAtPoint(cp.point);
        const vB1 = bB.getVelocityAtPoint(cp.point);
        const vRel1 = Vec2.sub(vB1, vA1);
        const vTangent = vRel1.dot(tangent);

        let lambdaT = -vTangent * cp.tangentMass;

        const maxFriction = friction * cp.normalImpulse;
        const oldTangentImpulse = cp.tangentImpulse;
        cp.tangentImpulse = Math.max(-maxFriction, Math.min(maxFriction, oldTangentImpulse + lambdaT));
        lambdaT = cp.tangentImpulse - oldTangentImpulse;

        const pT = Vec2.scale(tangent, lambdaT);
        if (bA.type === 'dynamic') {
          bA.velocity.subScaled(pT, mA);
          bA.angularVelocity -= iA * cp.rA.cross(pT);
        }
        if (bB.type === 'dynamic') {
          bB.velocity.addScaled(pT, mB);
          bB.angularVelocity += iB * cp.rB.cross(pT);
        }

        const vA2 = bA.getVelocityAtPoint(cp.point);
        const vB2 = bB.getVelocityAtPoint(cp.point);
        const vRel2 = Vec2.sub(vB2, vA2);
        const vNormal = vRel2.dot(normal);

        let lambdaN = -(vNormal - cp.bias) * cp.normalMass;
        const oldNormalImpulse = cp.normalImpulse;
        cp.normalImpulse = Math.max(0.0, oldNormalImpulse + lambdaN);
        lambdaN = cp.normalImpulse - oldNormalImpulse;

        const pN = Vec2.scale(normal, lambdaN);
        if (bA.type === 'dynamic') {
          bA.velocity.subScaled(pN, mA);
          bA.angularVelocity -= iA * cp.rA.cross(pN);
        }
        if (bB.type === 'dynamic') {
          bB.velocity.addScaled(pN, mB);
          bB.angularVelocity += iB * cp.rB.cross(pN);
        }
      }
    }
  }
}

```

## File: `src/dynamics/Island.mjs`  
- Path: `src/dynamics/Island.mjs`  
- Size: 1410 Bytes  
- Modified: 2026-11-12 01:31:06 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript


export class Island {
  constructor() {
    this.bodies = [];
    this.contacts = [];
    this.joints = [];
  }

  addBody(body) {
    this.bodies.push(body);
  }

  addContact(contact) {
    this.contacts.push(contact);
  }

  addJoint(joint) {
    this.joints.push(joint);
  }

  clear() {
    this.bodies.length = 0;
    this.contacts.length = 0;
    this.joints.length = 0;
  }

  evaluateSleep(dt, linTolSq = 0.005, angTolSq = 0.005, timeToSleep = 0.5) {
    let canSleep = true;

    for (const b of this.bodies) {
      if (b.type !== 'dynamic' || !b.allowSleep) {
        canSleep = false;
        break;
      }

      const linVelSq = b.velocity.lengthSq();
      const angVelSq = b.angularVelocity * b.angularVelocity;

      if (linVelSq > linTolSq || angVelSq > angTolSq) {
        b.sleepTime = 0.0;
        canSleep = false;
      } else {
        b.sleepTime += dt;
        if (b.sleepTime < timeToSleep) {
          canSleep = false;
        }
      }
    }

    if (canSleep) {
      for (const b of this.bodies) {
        b.putToSleep();
      }
    }
  }
}

```

## File: `src/dynamics/joints/DistanceJoint.mjs`  
- Path: `src/dynamics/joints/DistanceJoint.mjs`  
- Size: 3581 Bytes  
- Modified: 2026-11-12 15:39:44 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import { Joint } from './Joint.mjs';
import { Vec2 } from '../../math/Vec2.mjs';

export class DistanceJoint extends Joint {
  constructor(bodyA, bodyB, anchorA, anchorB, config = {}) {
    super(bodyA, bodyB, 'distance', config);
    this.localAnchorA = bodyA.transform.inverseTransformPoint(anchorA);
    this.localAnchorB = bodyB.transform.inverseTransformPoint(anchorB);

    const worldA = bodyA.transform.transformPoint(this.localAnchorA);
    const worldB = bodyB.transform.transformPoint(this.localAnchorB);
    this.length = config.length ?? worldA.distanceTo(worldB);

    this.frequencyHz = config.frequencyHz ?? 0.0;
    this.dampingRatio = config.dampingRatio ?? 0.0;

    this.u = new Vec2(0, 1);
    this.rA = new Vec2(0, 0);
    this.rB = new Vec2(0, 0);
    this.mass = 0.0;
    this.impulse = 0.0;
    this.bias = 0.0;
    this.gamma = 0.0;
  }

  initVelocityConstraints(dt) {
    const bA = this.bodyA;
    const bB = this.bodyB;

    this.rA = bA.transform.transformVector(this.localAnchorA);
    this.rB = bB.transform.transformVector(this.localAnchorB);

    const pA = Vec2.add(bA.position, this.rA);
    const pB = Vec2.add(bB.position, this.rB);
    const d = Vec2.sub(pB, pA);
    const currentLen = d.length();

    if (currentLen > 1e-6) {
      this.u = Vec2.scale(d, 1.0 / currentLen);
    } else {
      this.u.set(0, 0);
    }

    const crAu = this.rA.cross(this.u);
    const crBu = this.rB.cross(this.u);
    let invMass = bA.invMass + bB.invMass + bA.invInertia * crAu * crAu + bB.invInertia * crBu * crBu;

    if (this.frequencyHz > 0.0) {
      const C = currentLen - this.length;
      const omega = 2.0 * Math.PI * this.frequencyHz;
      const dCoeff = 2.0 * this.mass * this.dampingRatio * omega;
      const kCoeff = this.mass * omega * omega;

      this.gamma = dt * (dCoeff + dt * kCoeff);
      this.gamma = this.gamma !== 0.0 ? 1.0 / this.gamma : 0.0;
      this.bias = C * dt * kCoeff * this.gamma;

      invMass += this.gamma;
      this.mass = invMass !== 0.0 ? 1.0 / invMass : 0.0;
    } else {
      this.gamma = 0.0;
      const rawBias = 0.2 * Math.max(0, currentLen - this.length) / Math.max(dt, 1e-4);
      this.bias = Math.min(3.5, rawBias);
      this.mass = invMass !== 0.0 ? 1.0 / invMass : 0.0;
    }

    const p = Vec2.scale(this.u, this.impulse);
    bA.velocity.subScaled(p, bA.invMass);
    bA.angularVelocity -= bA.invInertia * this.rA.cross(p);
    bB.velocity.addScaled(p, bB.invMass);
    bB.angularVelocity += bB.invInertia * this.rB.cross(p);
  }

  solveVelocityConstraints() {
    const bA = this.bodyA;
    const bB = this.bodyB;

    const vA = Vec2.add(bA.velocity, Vec2.crossScalarVec(bA.angularVelocity, this.rA));
    const vB = Vec2.add(bB.velocity, Vec2.crossScalarVec(bB.angularVelocity, this.rB));
    const vRel = this.u.dot(Vec2.sub(vB, vA));

    let impulse = -this.mass * (vRel + this.bias + this.gamma * this.impulse);
    this.impulse += impulse;

    const p = Vec2.scale(this.u, impulse);
    bA.velocity.subScaled(p, bA.invMass);
    bA.angularVelocity -= bA.invInertia * this.rA.cross(p);
    bB.velocity.addScaled(p, bB.invMass);
    bB.angularVelocity += bB.invInertia * this.rB.cross(p);
  }

  getReactionForce(dt) {
    return Math.abs(this.impulse) / Math.max(dt, 1e-4);
  }
}

```

## File: `src/dynamics/joints/Joint.mjs`  
- Path: `src/dynamics/joints/Joint.mjs`  
- Size: 1004 Bytes  
- Modified: 2026-11-12 02:41:18 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
let nextJointId = 1;

export class Joint {
  constructor(bodyA, bodyB, type = 'joint', config = {}) {
    this.id = nextJointId++;
    this.type = type;
    this.bodyA = bodyA;
    this.bodyB = bodyB;
    this.collideConnected = config.collideConnected ?? false;
    this.breakingForce = config.breakingForce ?? Infinity;
    this.breakingTorque = config.breakingTorque ?? Infinity;
    this.isBroken = false;
  }

  getReactionForce(dt) {
    return 0.0;
  }

  getReactionTorque(dt) {
    return 0.0;
  }

  initVelocityConstraints(dt) {
    throw new Error('initVelocityConstraints() must be implemented');
  }

  solveVelocityConstraints() {
    throw new Error('solveVelocityConstraints() must be implemented');
  }
}

```

## File: `src/dynamics/joints/PrismaticJoint.mjs`  
- Path: `src/dynamics/joints/PrismaticJoint.mjs`  
- Size: 5312 Bytes  
- Modified: 2026-11-12 02:42:54 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import { Joint } from './Joint.mjs';
import { Vec2 } from '../../math/Vec2.mjs';

export class PrismaticJoint extends Joint {
  constructor(bodyA, bodyB, anchorWorld, axisWorld, config = {}) {
    super(bodyA, bodyB, 'prismatic', config);
    this.localAnchorA = bodyA.transform.inverseTransformPoint(anchorWorld);
    this.localAnchorB = bodyB.transform.inverseTransformPoint(anchorWorld);
    this.localXAxisA = bodyA.transform.inverseTransformVector(axisWorld).normalize();
    this.localYAxisA = this.localXAxisA.perp();
    this.referenceAngle = config.referenceAngle ?? (bodyB.angle - bodyA.angle);

    this.enableMotor = config.enableMotor ?? false;
    this.motorSpeed = config.motorSpeed ?? 0.0;
    this.maxMotorForce = config.maxMotorForce ?? 20.0;
    this.motorImpulse = 0.0;

    this.enableLimit = config.enableLimit ?? false;
    this.lowerTranslation = config.lowerTranslation ?? -1.0;
    this.upperTranslation = config.upperTranslation ?? 1.0;
    this.limitImpulse = 0.0;

    this.rA = new Vec2(0, 0);
    this.rB = new Vec2(0, 0);
    this.axis = new Vec2(1, 0);
    this.perp = new Vec2(0, 1);
    this.perpMass = 0.0;
    this.angularMass = 0.0;
    this.motorMass = 0.0;
    this.perpImpulse = 0.0;
    this.angularImpulse = 0.0;
    this.perpBias = 0.0;
    this.angularBias = 0.0;
  }

  getTranslation() {
    const pA = this.bodyA.transform.transformPoint(this.localAnchorA);
    const pB = this.bodyB.transform.transformPoint(this.localAnchorB);
    const d = Vec2.sub(pB, pA);
    const axis = this.bodyA.transform.transformVector(this.localXAxisA);
    return d.dot(axis);
  }

  initVelocityConstraints(dt) {
    const bA = this.bodyA;
    const bB = this.bodyB;

    this.rA = bA.transform.transformVector(this.localAnchorA);
    this.rB = bB.transform.transformVector(this.localAnchorB);
    this.axis = bA.transform.transformVector(this.localXAxisA);
    this.perp = this.axis.perp();

    const mA = bA.invMass;
    const mB = bB.invMass;
    const iA = bA.invInertia;
    const iB = bB.invInertia;

    const pA = Vec2.add(bA.position, this.rA);
    const pB = Vec2.add(bB.position, this.rB);
    const d = Vec2.sub(pB, pA);

    const s1 = Vec2.add(d, this.rA).cross(this.perp);
    const s2 = this.rB.cross(this.perp);
    const kPerp = mA + mB + iA * s1 * s1 + iB * s2 * s2;
    this.perpMass = kPerp > 1e-12 ? 1.0 / kPerp : 0.0;

    const kAng = iA + iB;
    this.angularMass = kAng > 1e-12 ? 1.0 / kAng : 0.0;

    const a1 = Vec2.add(d, this.rA).cross(this.axis);
    const a2 = this.rB.cross(this.axis);
    const kMotor = mA + mB + iA * a1 * a1 + iB * a2 * a2;
    this.motorMass = kMotor > 1e-12 ? 1.0 / kMotor : 0.0;

    this.perpBias = 0.3 * d.dot(this.perp) / Math.max(dt, 1e-4);
    this.angularBias = 0.3 * (bB.angle - bA.angle - this.referenceAngle) / Math.max(dt, 1e-4);

    const p = Vec2.scale(this.perp, this.perpImpulse);
    bA.velocity.subScaled(p, mA);
    bA.angularVelocity -= iA * (s1 * this.perpImpulse + this.angularImpulse);
    bB.velocity.addScaled(p, mB);
    bB.angularVelocity += iB * (s2 * this.perpImpulse + this.angularImpulse);
  }

  solveVelocityConstraints() {
    const bA = this.bodyA;
    const bB = this.bodyB;
    const mA = bA.invMass;
    const mB = bB.invMass;
    const iA = bA.invInertia;
    const iB = bB.invInertia;

    const vA = Vec2.add(bA.velocity, Vec2.crossScalarVec(bA.angularVelocity, this.rA));
    const vB = Vec2.add(bB.velocity, Vec2.crossScalarVec(bB.angularVelocity, this.rB));
    const cDotPerp = Vec2.sub(vB, vA).dot(this.perp) + this.perpBias;
    const perpImp = -this.perpMass * cDotPerp;
    this.perpImpulse += perpImp;

    const p = Vec2.scale(this.perp, perpImp);
    bA.velocity.subScaled(p, mA);
    bA.angularVelocity -= iA * (this.rA.cross(p));
    bB.velocity.addScaled(p, mB);
    bB.angularVelocity += iB * (this.rB.cross(p));

    const cDotAng = bB.angularVelocity - bA.angularVelocity + this.angularBias;
    const angImp = -this.angularMass * cDotAng;
    this.angularImpulse += angImp;

    bA.angularVelocity -= iA * angImp;
    bB.angularVelocity += iB * angImp;

    if (this.enableMotor) {
      const vRelAxis = Vec2.sub(vB, vA).dot(this.axis) - this.motorSpeed;
      let imp = -this.motorMass * vRelAxis;
      const oldImp = this.motorImpulse;
      const maxImp = this.maxMotorForce * 0.02;
      this.motorImpulse = Math.max(-maxImp, Math.min(maxImp, oldImp + imp));
      imp = this.motorImpulse - oldImp;

      const pAxis = Vec2.scale(this.axis, imp);
      bA.velocity.subScaled(pAxis, mA);
      bB.velocity.addScaled(pAxis, mB);
    }
  }

  getReactionForce(dt) {
    return Math.abs(this.linearImpulse) / Math.max(dt, 1e-4);
  }

  getReactionTorque(dt) {
    return Math.abs(this.angularImpulse) / Math.max(dt, 1e-4);
  }
}

```

## File: `src/dynamics/joints/PulleyJoint.mjs`  
- Path: `src/dynamics/joints/PulleyJoint.mjs`  
- Size: 3480 Bytes  
- Modified: 2026-11-12 02:43:12 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import { Joint } from './Joint.mjs';
import { Vec2 } from '../../math/Vec2.mjs';

export class PulleyJoint extends Joint {
  constructor(bodyA, bodyB, groundAnchorA, groundAnchorB, anchorA, anchorB, ratio = 1.0, config = {}) {
    super(bodyA, bodyB, 'pulley', config);
    this.groundAnchorA = groundAnchorA.clone();
    this.groundAnchorB = groundAnchorB.clone();
    this.localAnchorA = bodyA.transform.inverseTransformPoint(anchorA);
    this.localAnchorB = bodyB.transform.inverseTransformPoint(anchorB);
    this.ratio = ratio;

    const pA = bodyA.transform.transformPoint(this.localAnchorA);
    const pB = bodyB.transform.transformPoint(this.localAnchorB);
    this.lengthA = pA.distanceTo(this.groundAnchorA);
    this.lengthB = pB.distanceTo(this.groundAnchorB);
    this.constant = this.lengthA + this.ratio * this.lengthB;

    this.uA = new Vec2(0, 1);
    this.uB = new Vec2(0, 1);
    this.rA = new Vec2(0, 0);
    this.rB = new Vec2(0, 0);
    this.mass = 0.0;
    this.impulse = 0.0;
    this.bias = 0.0;
  }

  initVelocityConstraints(dt) {
    const bA = this.bodyA;
    const bB = this.bodyB;

    this.rA = bA.transform.transformVector(this.localAnchorA);
    this.rB = bB.transform.transformVector(this.localAnchorB);

    const pA = Vec2.add(bA.position, this.rA);
    const pB = Vec2.add(bB.position, this.rB);

    const sA = Vec2.sub(pA, this.groundAnchorA);
    const sB = Vec2.sub(pB, this.groundAnchorB);

    const lenA = sA.length();
    const lenB = sB.length();

    this.uA = lenA > 1e-6 ? Vec2.scale(sA, 1.0 / lenA) : new Vec2(0, 0);
    this.uB = lenB > 1e-6 ? Vec2.scale(sB, 1.0 / lenB) : new Vec2(0, 0);

    const crAu = this.rA.cross(this.uA);
    const crBu = this.rB.cross(this.uB);

    const mA = bA.invMass + bA.invInertia * crAu * crAu;
    const mB = bB.invMass + bB.invInertia * crBu * crBu;

    const k = mA + this.ratio * this.ratio * mB;
    this.mass = k > 1e-12 ? 1.0 / k : 0.0;

    const C = (lenA + this.ratio * lenB) - this.constant;
    this.bias = 0.2 * Math.max(0, C) / Math.max(dt, 1e-4);

    const p1 = Vec2.scale(this.uA, -this.impulse);
    const p2 = Vec2.scale(this.uB, -this.ratio * this.impulse);
    bA.velocity.addScaled(p1, bA.invMass);
    bA.angularVelocity += bA.invInertia * this.rA.cross(p1);
    bB.velocity.addScaled(p2, bB.invMass);
    bB.angularVelocity += bB.invInertia * this.rB.cross(p2);
  }

  solveVelocityConstraints() {
    const bA = this.bodyA;
    const bB = this.bodyB;

    const vA = Vec2.add(bA.velocity, Vec2.crossScalarVec(bA.angularVelocity, this.rA));
    const vB = Vec2.add(bB.velocity, Vec2.crossScalarVec(bB.angularVelocity, this.rB));

    const cDot = this.uA.dot(vA) + this.ratio * this.uB.dot(vB);
    let impulse = -this.mass * (cDot + this.bias);
    const oldImp = this.impulse;
    this.impulse = Math.max(0.0, oldImp + impulse);
    impulse = this.impulse - oldImp;

    const p1 = Vec2.scale(this.uA, -impulse);
    const p2 = Vec2.scale(this.uB, -this.ratio * impulse);
    bA.velocity.addScaled(p1, bA.invMass);
    bA.angularVelocity += bA.invInertia * this.rA.cross(p1);
    bB.velocity.addScaled(p2, bB.invMass);
    bB.angularVelocity += bB.invInertia * this.rB.cross(p2);
  }

  getReactionForce(dt) {
    return Math.abs(this.impulse) / Math.max(dt, 1e-4);
  }
}

```

## File: `src/dynamics/joints/RevoluteJoint.mjs`  
- Path: `src/dynamics/joints/RevoluteJoint.mjs`  
- Size: 5998 Bytes  
- Modified: 2026-11-12 15:39:38 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import { Joint } from './Joint.mjs';
import { Vec2 } from '../../math/Vec2.mjs';
import { Mat22 } from '../../math/Mat22.mjs';
import { normalizeAngle } from '../../math/MathUtils.mjs';

export class RevoluteJoint extends Joint {
  constructor(bodyA, bodyB, anchorWorld, config = {}) {
    super(bodyA, bodyB, 'revolute', config);
    this.localAnchorA = bodyA.transform.inverseTransformPoint(anchorWorld);
    this.localAnchorB = bodyB.transform.inverseTransformPoint(anchorWorld);
    this.referenceAngle = config.referenceAngle ?? (bodyB.angle - bodyA.angle);

    this.enableMotor = config.enableMotor ?? false;
    this.motorSpeed = config.motorSpeed ?? 0.0;
    this.maxMotorTorque = config.maxMotorTorque ?? 10.0;
    this.motorImpulse = 0.0;

    this.enableLimit = config.enableLimit ?? false;
    this.lowerAngle = config.lowerAngle ?? 0.0;
    this.upperAngle = config.upperAngle ?? 0.0;
    this.limitImpulse = 0.0;

    this.rA = new Vec2(0, 0);
    this.rB = new Vec2(0, 0);
    this.linearMass = new Mat22();
    this.linearImpulse = new Vec2(0, 0);
    this.linearBias = new Vec2(0, 0);
    this.motorMass = 0.0;
  }

  getJointAngle() {
    return normalizeAngle(this.bodyB.angle - this.bodyA.angle - this.referenceAngle);
  }

  getJointSpeed() {
    return this.bodyB.angularVelocity - this.bodyA.angularVelocity;
  }

  setMotorSpeed(speed) {
    this.motorSpeed = speed;
  }

  initVelocityConstraints(dt) {
    const bA = this.bodyA;
    const bB = this.bodyB;

    this.rA = bA.transform.transformVector(this.localAnchorA);
    this.rB = bB.transform.transformVector(this.localAnchorB);

    const mA = bA.invMass;
    const mB = bB.invMass;
    const iA = bA.invInertia;
    const iB = bB.invInertia;

    const k11 = mA + mB + iA * this.rA.y * this.rA.y + iB * this.rB.y * this.rB.y;
    const k12 = -iA * this.rA.x * this.rA.y - iB * this.rB.x * this.rB.y;
    const k21 = k12;
    const k22 = mA + mB + iA * this.rA.x * this.rA.x + iB * this.rB.x * this.rB.x;

    this.linearMass.setElements(k11, k12, k21, k22).invert();

    this.motorMass = iA + iB > 0.0 ? 1.0 / (iA + iB) : 0.0;

    const pA = Vec2.add(bA.position, this.rA);
    const pB = Vec2.add(bB.position, this.rB);
    const posError = Vec2.sub(pB, pA);
    const rawBias = Vec2.scale(posError, 0.2 / Math.max(dt, 1e-4));
    const maxBiasSpeed = 3.5;
    const biasLen = rawBias.length();
    this.linearBias = biasLen > maxBiasSpeed ? Vec2.scale(rawBias, maxBiasSpeed / biasLen) : rawBias;

    bA.velocity.subScaled(this.linearImpulse, mA);
    bA.angularVelocity -= iA * this.rA.cross(this.linearImpulse);
    bB.velocity.addScaled(this.linearImpulse, mB);
    bB.angularVelocity += iB * this.rB.cross(this.linearImpulse);

    if (this.enableMotor) {
      bA.angularVelocity -= iA * this.motorImpulse;
      bB.angularVelocity += iB * this.motorImpulse;
    }
  }

  solveVelocityConstraints() {
    const bA = this.bodyA;
    const bB = this.bodyB;
    const mA = bA.invMass;
    const mB = bB.invMass;
    const iA = bA.invInertia;
    const iB = bB.invInertia;

    if (this.enableMotor) {
      const cDot = bB.angularVelocity - bA.angularVelocity - this.motorSpeed;
      let impulse = -this.motorMass * cDot;
      const oldImpulse = this.motorImpulse;
      const maxImp = this.maxMotorTorque * 0.02;
      this.motorImpulse = Math.max(-maxImp, Math.min(maxImp, oldImpulse + impulse));
      impulse = this.motorImpulse - oldImpulse;

      bA.angularVelocity -= iA * impulse;
      bB.angularVelocity += iB * impulse;
    }

    if (this.enableLimit) {
      const jointAngle = this.getJointAngle();
      if (jointAngle < this.lowerAngle) {
        const cDot = bB.angularVelocity - bA.angularVelocity;
        let impulse = -this.motorMass * (cDot + 0.2 * (jointAngle - this.lowerAngle));
        const oldImp = this.limitImpulse;
        this.limitImpulse = Math.max(0.0, oldImp + impulse);
        impulse = this.limitImpulse - oldImp;
        bA.angularVelocity -= iA * impulse;
        bB.angularVelocity += iB * impulse;
      } else if (jointAngle > this.upperAngle) {
        const cDot = bB.angularVelocity - bA.angularVelocity;
        let impulse = -this.motorMass * (cDot + 0.2 * (jointAngle - this.upperAngle));
        const oldImp = this.limitImpulse;
        this.limitImpulse = Math.min(0.0, oldImp + impulse);
        impulse = this.limitImpulse - oldImp;
        bA.angularVelocity -= iA * impulse;
        bB.angularVelocity += iB * impulse;
      }
    }

    const vA = Vec2.add(bA.velocity, Vec2.crossScalarVec(bA.angularVelocity, this.rA));
    const vB = Vec2.add(bB.velocity, Vec2.crossScalarVec(bB.angularVelocity, this.rB));
    const vRel = Vec2.sub(vB, vA);

    const cDot = Vec2.add(vRel, this.linearBias);
    const impulse = this.linearMass.mulVec(cDot).negate();

    this.linearImpulse.add(impulse);

    bA.velocity.subScaled(impulse, mA);
    bA.angularVelocity -= iA * this.rA.cross(impulse);
    bB.velocity.addScaled(impulse, mB);
    bB.angularVelocity += iB * this.rB.cross(impulse);
  }

  getReactionForce(dt) {
    return this.linearImpulse.length() / Math.max(dt, 1e-4);
  }

  getReactionTorque(dt) {
    return Math.abs(this.motorImpulse + this.limitImpulse) / Math.max(dt, 1e-4);
  }
}

```

## File: `src/dynamics/joints/WeldJoint.mjs`  
- Path: `src/dynamics/joints/WeldJoint.mjs`  
- Size: 3587 Bytes  
- Modified: 2026-11-12 15:39:50 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import { Joint } from './Joint.mjs';
import { Vec2 } from '../../math/Vec2.mjs';
import { Mat22 } from '../../math/Mat22.mjs';

export class WeldJoint extends Joint {
  constructor(bodyA, bodyB, anchorWorld, config = {}) {
    super(bodyA, bodyB, 'weld', config);
    this.localAnchorA = bodyA.transform.inverseTransformPoint(anchorWorld);
    this.localAnchorB = bodyB.transform.inverseTransformPoint(anchorWorld);
    this.referenceAngle = config.referenceAngle ?? (bodyB.angle - bodyA.angle);

    this.rA = new Vec2(0, 0);
    this.rB = new Vec2(0, 0);
    this.linearMass = new Mat22();
    this.angularMass = 0.0;
    this.linearImpulse = new Vec2(0, 0);
    this.angularImpulse = 0.0;
    this.linearBias = new Vec2(0, 0);
    this.angularBias = 0.0;
  }

  initVelocityConstraints(dt) {
    const bA = this.bodyA;
    const bB = this.bodyB;

    this.rA = bA.transform.transformVector(this.localAnchorA);
    this.rB = bB.transform.transformVector(this.localAnchorB);

    const mA = bA.invMass;
    const mB = bB.invMass;
    const iA = bA.invInertia;
    const iB = bB.invInertia;

    const k11 = mA + mB + iA * this.rA.y * this.rA.y + iB * this.rB.y * this.rB.y;
    const k12 = -iA * this.rA.x * this.rA.y - iB * this.rB.x * this.rB.y;
    const k21 = k12;
    const k22 = mA + mB + iA * this.rA.x * this.rA.x + iB * this.rB.x * this.rB.x;
    this.linearMass.setElements(k11, k12, k21, k22).invert();

    this.angularMass = iA + iB > 0.0 ? 1.0 / (iA + iB) : 0.0;

    const pA = Vec2.add(bA.position, this.rA);
    const pB = Vec2.add(bB.position, this.rB);
    const rawLinBias = Vec2.scale(Vec2.sub(pB, pA), 0.2 / Math.max(dt, 1e-4));
    const biasLen = rawLinBias.length();
    this.linearBias = biasLen > 3.5 ? Vec2.scale(rawLinBias, 3.5 / biasLen) : rawLinBias;
    const rawAngBias = 0.2 * (bB.angle - bA.angle - this.referenceAngle) / Math.max(dt, 1e-4);
    this.angularBias = Math.max(-4.0, Math.min(4.0, rawAngBias));

    bA.velocity.subScaled(this.linearImpulse, mA);
    bA.angularVelocity -= iA * (this.rA.cross(this.linearImpulse) + this.angularImpulse);
    bB.velocity.addScaled(this.linearImpulse, mB);
    bB.angularVelocity += iB * (this.rB.cross(this.linearImpulse) + this.angularImpulse);
  }

  solveVelocityConstraints() {
    const bA = this.bodyA;
    const bB = this.bodyB;
    const mA = bA.invMass;
    const mB = bB.invMass;
    const iA = bA.invInertia;
    const iB = bB.invInertia;

    const vA = Vec2.add(bA.velocity, Vec2.crossScalarVec(bA.angularVelocity, this.rA));
    const vB = Vec2.add(bB.velocity, Vec2.crossScalarVec(bB.angularVelocity, this.rB));
    const cDotLinear = Vec2.add(Vec2.sub(vB, vA), this.linearBias);
    const linImp = this.linearMass.mulVec(cDotLinear).negate();
    this.linearImpulse.add(linImp);

    bA.velocity.subScaled(linImp, mA);
    bA.angularVelocity -= iA * this.rA.cross(linImp);
    bB.velocity.addScaled(linImp, mB);
    bB.angularVelocity += iB * this.rB.cross(linImp);

    const cDotAng = bB.angularVelocity - bA.angularVelocity + this.angularBias;
    const angImp = -this.angularMass * cDotAng;
    this.angularImpulse += angImp;

    bA.angularVelocity -= iA * angImp;
    bB.angularVelocity += iB * angImp;
  }

  getReactionForce(dt) {
    return this.linearImpulse.length() / Math.max(dt, 1e-4);
  }

  getReactionTorque(dt) {
    return Math.abs(this.angularImpulse) / Math.max(dt, 1e-4);
  }
}

```

## File: `src/dynamics/Material.mjs`  
- Path: `src/dynamics/Material.mjs`  
- Size: 1157 Bytes  
- Modified: 2026-11-12 01:26:24 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript


export class Material {
  constructor(config = {}) {
    this.density = config.density ?? 1.0;
    this.friction = config.friction ?? 0.3;
    this.restitution = config.restitution ?? 0.2;
  }

  static default() {
    return new Material({ density: 1.0, friction: 0.3, restitution: 0.2 });
  }

  static wood() {
    return new Material({ density: 0.7, friction: 0.4, restitution: 0.15 });
  }

  static metal() {
    return new Material({ density: 7.8, friction: 0.2, restitution: 0.1 });
  }

  static rubber() {
    return new Material({ density: 1.2, friction: 0.8, restitution: 0.85 });
  }

  static ice() {
    return new Material({ density: 0.9, friction: 0.05, restitution: 0.1 });
  }

  static bouncy() {
    return new Material({ density: 1.0, friction: 0.2, restitution: 0.95 });
  }

  static stone() {
    return new Material({ density: 2.5, friction: 0.6, restitution: 0.05 });
  }
}

```

## File: `src/math/AABB.mjs`  
- Path: `src/math/AABB.mjs`  
- Size: 4327 Bytes  
- Modified: 2026-11-12 01:27:50 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import { Vec2 } from './Vec2.mjs';

export class AABB {
  constructor(min = new Vec2(Infinity, Infinity), max = new Vec2(-Infinity, -Infinity)) {
    this.min = min.clone();
    this.max = max.clone();
  }

  set(min, max) {
    this.min.copy(min);
    this.max.copy(max);
    return this;
  }

  copy(aabb) {
    this.min.copy(aabb.min);
    this.max.copy(aabb.max);
    return this;
  }

  clone() {
    return new AABB(this.min, this.max);
  }

  reset() {
    this.min.set(Infinity, Infinity);
    this.max.set(-Infinity, -Infinity);
    return this;
  }

  expand(margin) {
    this.min.x -= margin;
    this.min.y -= margin;
    this.max.x += margin;
    this.max.y += margin;
    return this;
  }

  expandByVec(v) {
    if (v.x < 0) this.min.x += v.x;
    else this.max.x += v.x;
    if (v.y < 0) this.min.y += v.y;
    else this.max.y += v.y;
    return this;
  }

  combine(other) {
    this.min.x = Math.min(this.min.x, other.min.x);
    this.min.y = Math.min(this.min.y, other.min.y);
    this.max.x = Math.max(this.max.x, other.max.x);
    this.max.y = Math.max(this.max.y, other.max.y);
    return this;
  }

  containsPoint(p) {
    return (
      p.x >= this.min.x &&
      p.x <= this.max.x &&
      p.y >= this.min.y &&
      p.y <= this.max.y
    );
  }

  containsAABB(other) {
    return (
      this.min.x <= other.min.x &&
      this.min.y <= other.min.y &&
      this.max.x >= other.max.x &&
      this.max.y >= other.max.y
    );
  }

  intersects(other) {
    return !(
      this.max.x < other.min.x ||
      this.min.x > other.max.x ||
      this.max.y < other.min.y ||
      this.min.y > other.max.y
    );
  }

  getCenter() {
    return new Vec2(
      (this.min.x + this.max.x) * 0.5,
      (this.min.y + this.max.y) * 0.5
    );
  }

  getExtents() {
    return new Vec2(
      (this.max.x - this.min.x) * 0.5,
      (this.max.y - this.min.y) * 0.5
    );
  }

  getArea() {
    const w = Math.max(0, this.max.x - this.min.x);
    const h = Math.max(0, this.max.y - this.min.y);
    return w * h;
  }

  getPerimeter() {
    const w = Math.max(0, this.max.x - this.min.x);
    const h = Math.max(0, this.max.y - this.min.y);
    return 2.0 * (w + h);
  }

  static combineArea(a, b) {
    const minX = Math.min(a.min.x, b.min.x);
    const minY = Math.min(a.min.y, b.min.y);
    const maxX = Math.max(a.max.x, b.max.x);
    const maxY = Math.max(a.max.y, b.max.y);
    const w = Math.max(0, maxX - minX);
    const h = Math.max(0, maxY - minY);
    return w * h;
  }

  raycast(origin, dir, maxFraction = 1.0) {
    let tmin = 0.0;
    let tmax = maxFraction;
    let normalX = 0;
    let normalY = 0;

    if (Math.abs(dir.x) < 1e-12) {
      if (origin.x < this.min.x || origin.x > this.max.x) {
        return { hit: false, fraction: 0, normal: Vec2.zero() };
      }
    } else {
      const invD = 1.0 / dir.x;
      let t1 = (this.min.x - origin.x) * invD;
      let t2 = (this.max.x - origin.x) * invD;
      let sign = -1.0;
      if (t1 > t2) {
        const tmp = t1; t1 = t2; t2 = tmp;
        sign = 1.0;
      }
      if (t1 > tmin) {
        tmin = t1;
        normalX = sign;
        normalY = 0;
      }
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return { hit: false, fraction: 0, normal: Vec2.zero() };
    }

    if (Math.abs(dir.y) < 1e-12) {
      if (origin.y < this.min.y || origin.y > this.max.y) {
        return { hit: false, fraction: 0, normal: Vec2.zero() };
      }
    } else {
      const invD = 1.0 / dir.y;
      let t1 = (this.min.y - origin.y) * invD;
      let t2 = (this.max.y - origin.y) * invD;
      let sign = -1.0;
      if (t1 > t2) {
        const tmp = t1; t1 = t2; t2 = tmp;
        sign = 1.0;
      }
      if (t1 > tmin) {
        tmin = t1;
        normalX = 0;
        normalY = sign;
      }
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return { hit: false, fraction: 0, normal: Vec2.zero() };
    }

    return {
      hit: true,
      fraction: tmin,
      point: new Vec2(origin.x + dir.x * tmin, origin.y + dir.y * tmin),
      normal: new Vec2(normalX, normalY)
    };
  }
}

```

## File: `src/math/Mat22.mjs`  
- Path: `src/math/Mat22.mjs`  
- Size: 1843 Bytes  
- Modified: 2026-11-12 01:25:04 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import { Vec2 } from './Vec2.mjs';

export class Mat22 {
  constructor(c1 = new Vec2(1, 0), c2 = new Vec2(0, 1)) {
    this.c1 = c1.clone();
    this.c2 = c2.clone();
  }

  set(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    this.c1.x = c;  this.c2.x = -s;
    this.c1.y = s;  this.c2.y = c;
    return this;
  }

  setElements(m00, m01, m10, m11) {
    this.c1.x = m00; this.c2.x = m01;
    this.c1.y = m10; this.c2.y = m11;
    return this;
  }

  copy(m) {
    this.c1.copy(m.c1);
    this.c2.copy(m.c2);
    return this;
  }

  mulVec(v) {
    return new Vec2(
      this.c1.x * v.x + this.c2.x * v.y,
      this.c1.y * v.x + this.c2.y * v.y
    );
  }

  mulMat(m) {
    return new Mat22(
      this.mulVec(m.c1),
      this.mulVec(m.c2)
    );
  }

  transpose() {
    const tmp = this.c1.y;
    this.c1.y = this.c2.x;
    this.c2.x = tmp;
    return this;
  }

  invert() {
    const a = this.c1.x, b = this.c2.x;
    const c = this.c1.y, d = this.c2.y;
    let det = a * d - b * c;
    if (Math.abs(det) < 1e-12) {
      det = 1e-12;
    }
    const invDet = 1.0 / det;
    this.c1.x =  d * invDet;
    this.c2.x = -b * invDet;
    this.c1.y = -c * invDet;
    this.c2.y =  a * invDet;
    return this;
  }

  solve(b) {
    const a = this.c1.x, c = this.c2.x;
    const d = this.c1.y, e = this.c2.y;
    let det = a * e - c * d;
    if (Math.abs(det) < 1e-12) {
      det = 1e-12;
    }
    const invDet = 1.0 / det;
    return new Vec2(
      (e * b.x - c * b.y) * invDet,
      (a * b.y - d * b.x) * invDet
    );
  }

  static fromAngle(angle) {
    return new Mat22().set(angle);
  }
}

```

## File: `src/math/MathUtils.mjs`  
- Path: `src/math/MathUtils.mjs`  
- Size: 647 Bytes  
- Modified: 2026-11-12 01:25:28 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript


export const EPSILON = 1e-9;
export const DEG2RAD = Math.PI / 180.0;
export const RAD2DEG = 180.0 / Math.PI;

export function clamp(val, min, max) {
  if (val < min) return min;
  if (val > max) return max;
  return val;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function sign(x) {
  return x >= 0 ? 1 : -1;
}

export function normalizeAngle(angle) {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
}

export function isApproxZero(val, eps = 1e-6) {
  return Math.abs(val) <= eps;
}

```

## File: `src/math/Transform.mjs`  
- Path: `src/math/Transform.mjs`  
- Size: 1734 Bytes  
- Modified: 2026-11-12 01:25:10 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import { Vec2 } from './Vec2.mjs';

export class Transform {
  constructor(position = new Vec2(0, 0), angle = 0) {
    this.position = position.clone();
    this.angle = angle;
    this.c = Math.cos(angle);
    this.s = Math.sin(angle);
  }

  set(pos, angle) {
    this.position.copy(pos);
    this.angle = angle;
    this.c = Math.cos(angle);
    this.s = Math.sin(angle);
    return this;
  }

  copy(t) {
    this.position.copy(t.position);
    this.angle = t.angle;
    this.c = t.c;
    this.s = t.s;
    return this;
  }

  clone() {
    return new Transform(this.position, this.angle);
  }

  setAngle(angle) {
    this.angle = angle;
    this.c = Math.cos(angle);
    this.s = Math.sin(angle);
    return this;
  }

  transformPoint(p) {
    return new Vec2(
      this.position.x + (this.c * p.x - this.s * p.y),
      this.position.y + (this.s * p.x + this.c * p.y)
    );
  }

  transformVector(v) {
    return new Vec2(
      this.c * v.x - this.s * v.y,
      this.s * v.x + this.c * v.y
    );
  }

  inverseTransformPoint(p) {
    const dx = p.x - this.position.x;
    const dy = p.y - this.position.y;
    return new Vec2(
      this.c * dx + this.s * dy,
      -this.s * dx + this.c * dy
    );
  }

  inverseTransformVector(v) {
    return new Vec2(
      this.c * v.x + this.s * v.y,
      -this.s * v.x + this.c * v.y
    );
  }
}

```

## File: `src/math/Vec2.mjs`  
- Path: `src/math/Vec2.mjs`  
- Size: 2861 Bytes  
- Modified: 2026-11-12 01:24:56 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript


export class Vec2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  copy(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  clone() {
    return new Vec2(this.x, this.y);
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  scale(s) {
    this.x *= s;
    this.y *= s;
    return this;
  }

  addScaled(v, s) {
    this.x += v.x * s;
    this.y += v.y * s;
    return this;
  }

  subScaled(v, s) {
    this.x -= v.x * s;
    this.y -= v.y * s;
    return this;
  }

  negate() {
    this.x = -this.x;
    this.y = -this.y;
    return this;
  }

  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  cross(v) {
    return this.x * v.y - this.y * v.x;
  }

  crossScalar(s) {
    return new Vec2(-s * this.y, s * this.x);
  }

  lengthSq() {
    return this.x * this.x + this.y * this.y;
  }

  length() {
    return Math.hypot(this.x, this.y);
  }

  normalize() {
    const len = this.length();
    if (len > 1e-12) {
      const inv = 1.0 / len;
      this.x *= inv;
      this.y *= inv;
    } else {
      this.x = 0;
      this.y = 0;
    }
    return this;
  }

  perp() {

    return new Vec2(-this.y, this.x);
  }

  distanceToSq(v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return dx * dx + dy * dy;
  }

  distanceTo(v) {
    return Math.hypot(this.x - v.x, this.y - v.y);
  }

  rotate(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const x = this.x * c - this.y * s;
    const y = this.x * s + this.y * c;
    this.x = x;
    this.y = y;
    return this;
  }

  static zero() {
    return new Vec2(0, 0);
  }

  static add(a, b) {
    return new Vec2(a.x + b.x, a.y + b.y);
  }

  static sub(a, b) {
    return new Vec2(a.x - b.x, a.y - b.y);
  }

  static scale(v, s) {
    return new Vec2(v.x * s, v.y * s);
  }

  static dot(a, b) {
    return a.x * b.x + a.y * b.y;
  }

  static cross(a, b) {
    return a.x * b.y - a.y * b.x;
  }

  static crossScalarVec(s, v) {
    return new Vec2(-s * v.y, s * v.x);
  }

  static crossVecScalar(v, s) {
    return new Vec2(s * v.y, -s * v.x);
  }

  static distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  static distanceSq(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  }

  static lerp(a, b, t) {
    return new Vec2(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
  }
}

```

## File: `src/subqg/MetricLatticeSolver.mjs`  
- Path: `src/subqg/MetricLatticeSolver.mjs`  
- Size: 2421 Bytes  
- Modified: 2026-11-12 01:47:14 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript


export class MetricLatticeSolver {
  constructor(graph, config = {}) {
    this.graph = graph;
    this.kappa = config.kappa ?? 4.0;
    this.mu = config.mu ?? 0.2;
    this.iterations = config.iterations ?? 8;
  }

  solve() {
    const beta = this.graph.beta;
    const kappa = this.kappa;
    const mu = this.mu;

    let totalEdgeAction = 0.0;
    let maxStrain = 0.0;

    for (const edge of this.graph.edges) {
      const uNode = this.graph.nodes.get(edge.u);
      const vNode = this.graph.nodes.get(edge.v);
      if (!uNode || !vNode) continue;

      const rhoE = (uNode.rho + vNode.rho) * 0.5;
      const targetX = 1.0 + (beta * rhoE) / (mu + 0.1);
      edge.x_e = edge.x_e + 0.5 * (targetX - edge.x_e);

      const strain = Math.abs(edge.x_e - 1.0);
      if (strain > maxStrain) maxStrain = strain;

      const diff = edge.x_e - 1.0;
      totalEdgeAction += edge.weight * (0.5 * diff * diff - beta * rhoE * edge.x_e);
    }

    for (let it = 0; it < this.iterations; it++) {
      for (const node of this.graph.nodes.values()) {
        const gx = node.gx;
        const gy = node.gy;
        const nLeft = this.graph.nodes.get(this.graph._nodeKey(gx - 1, gy))?.phi ?? 0;
        const nRight = this.graph.nodes.get(this.graph._nodeKey(gx + 1, gy))?.phi ?? 0;
        const nDown = this.graph.nodes.get(this.graph._nodeKey(gx, gy - 1))?.phi ?? 0;
        const nUp = this.graph.nodes.get(this.graph._nodeKey(gx, gy + 1))?.phi ?? 0;

        const lap = 0.25 * (nLeft + nRight + nDown + nUp);

        node.phi = 0.75 * lap - 0.25 * (beta * node.rho);
      }
    }

    return {
      totalEdgeAction,
      maxStrain,
      edgeCount: this.graph.edges.length,
      nodeCount: this.graph.nodes.size
    };
  }
}

```

## File: `src/subqg/RelationalGraph.mjs`  
- Path: `src/subqg/RelationalGraph.mjs`  
- Size: 5239 Bytes  
- Modified: 2026-11-12 01:25:48 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import { Vec2 } from '../math/Vec2.mjs';

export class RelationalGraph {
  constructor(config = {}) {
    this.gridSpacing = config.gridSpacing ?? 1.0;
    this.beta = config.beta ?? 0.05;
    this.extentX = config.extentX ?? 40.0;
    this.extentY = config.extentY ?? 30.0;

    this.nodes = new Map();
    this.edges = [];

    this._initLattice();
  }

  _nodeKey(gx, gy) {
    return `${gx},${gy}`;
  }

  _initLattice() {
    const minGX = Math.floor(-this.extentX / this.gridSpacing);
    const maxGX = Math.ceil(this.extentX / this.gridSpacing);
    const minGY = Math.floor(-this.extentY / this.gridSpacing);
    const maxGY = Math.ceil(this.extentY / this.gridSpacing);

    for (let gx = minGX; gx <= maxGX; gx++) {
      for (let gy = minGY; gy <= maxGY; gy++) {
        const key = this._nodeKey(gx, gy);
        this.nodes.set(key, {
          gx,
          gy,
          pos: new Vec2(gx * this.gridSpacing, gy * this.gridSpacing),
          rho: 0.0,
          phi: 0.0,
          clock: 0
        });
      }
    }

    const deltas = [
      [1, 0], [0, 1], [1, 1], [1, -1]
    ];

    for (let gx = minGX; gx <= maxGX; gx++) {
      for (let gy = minGY; gy <= maxGY; gy++) {
        const uKey = this._nodeKey(gx, gy);
        for (const [dx, dy] of deltas) {
          const vKey = this._nodeKey(gx + dx, gy + dy);
          if (this.nodes.has(vKey)) {
            const diag = (dx !== 0 && dy !== 0);
            this.edges.push({
              u: uKey,
              v: vKey,
              x_e: 1.0,
              restLen: diag ? Math.SQRT2 : 1.0,
              weight: diag ? 0.5 : 1.0
            });
          }
        }
      }
    }
  }

  resetDensities() {
    for (const node of this.nodes.values()) {
      node.rho = 0.0;
      node.phi = 0.0;
    }
  }

  injectBodyMass(body) {
    const pos = body.position;
    const mass = body.mass;
    if (mass <= 0 || !Number.isFinite(mass)) return;

    const sigma = Math.max(this.gridSpacing * 0.8, body.boundingRadius * 0.5);
    const sigmaSq2 = 2.0 * sigma * sigma;
    const radiusCells = Math.ceil((sigma * 2.5) / this.gridSpacing);

    const centerGX = Math.round(pos.x / this.gridSpacing);
    const centerGY = Math.round(pos.y / this.gridSpacing);

    let weightSum = 0.0;
    const affectedNodes = [];

    for (let gx = centerGX - radiusCells; gx <= centerGX + radiusCells; gx++) {
      for (let gy = centerGY - radiusCells; gy <= centerGY + radiusCells; gy++) {
        const key = this._nodeKey(gx, gy);
        const node = this.nodes.get(key);
        if (node) {
          const distSq = node.pos.distanceToSq(pos);
          const w = Math.exp(-distSq / sigmaSq2);
          weightSum += w;
          affectedNodes.push({ node, w });
        }
      }
    }

    if (weightSum > 1e-9) {
      const normFactor = mass / weightSum;
      for (const { node, w } of affectedNodes) {
        node.rho += w * normFactor;
        node.clock += 1;
      }
    }
  }

  samplePotential(worldPos) {
    const gx = worldPos.x / this.gridSpacing;
    const gy = worldPos.y / this.gridSpacing;
    const i = Math.floor(gx);
    const j = Math.floor(gy);
    const fx = gx - i;
    const fy = gy - j;

    const n00 = this.nodes.get(this._nodeKey(i, j))?.phi ?? 0;
    const n10 = this.nodes.get(this._nodeKey(i + 1, j))?.phi ?? 0;
    const n01 = this.nodes.get(this._nodeKey(i, j + 1))?.phi ?? 0;
    const n11 = this.nodes.get(this._nodeKey(i + 1, j + 1))?.phi ?? 0;

    const top = n00 * (1 - fx) + n10 * fx;
    const bottom = n01 * (1 - fx) + n11 * fx;
    return top * (1 - fy) + bottom * fy;
  }

  sampleGradient(worldPos) {
    const eps = this.gridSpacing * 0.25;
    const phiX1 = this.samplePotential(new Vec2(worldPos.x + eps, worldPos.y));
    const phiX0 = this.samplePotential(new Vec2(worldPos.x - eps, worldPos.y));
    const phiY1 = this.samplePotential(new Vec2(worldPos.x, worldPos.y + eps));
    const phiY0 = this.samplePotential(new Vec2(worldPos.x, worldPos.y - eps));

    return new Vec2(
      (phiX1 - phiX0) / (2.0 * eps),
      (phiY1 - phiY0) / (2.0 * eps)
    );
  }
}

```

## File: `src/subqg/SubQGContactBridge.mjs`  
- Path: `src/subqg/SubQGContactBridge.mjs`  
- Size: 1573 Bytes  
- Modified: 2026-11-12 01:26:14 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript


export class SubQGContactBridge {
  constructor(config = {}) {
    this.edgeStiffness = config.edgeStiffness ?? 1e6;
    this.edgeDamping = config.edgeDamping ?? 1e3;
    this.baumgarteFactor = config.baumgarteFactor ?? 0.2;
    this.slop = config.slop ?? 0.005;
  }

  combineMaterials(matA, matB) {

    const friction = Math.sqrt(matA.friction * matB.friction);

    const restitution = Math.max(matA.restitution, matB.restitution);

    const density = (matA.density + matB.density) * 0.5;

    return { friction, restitution, density };
  }

  computePenetrationBias(penetration, dt) {
    if (penetration <= this.slop) return 0.0;
    return (this.baumgarteFactor / Math.max(dt, 1e-4)) * (penetration - this.slop);
  }
}

```

## File: `src/subqg/SubQGGravitationField.mjs`  
- Path: `src/subqg/SubQGGravitationField.mjs`  
- Size: 2458 Bytes  
- Modified: 2026-11-12 01:26:08 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import { Vec2 } from '../math/Vec2.mjs';

export class SubQGGravitationField {
  constructor(config = {}) {

    this.gravity = config.gravity ? config.gravity.clone() : new Vec2(0, -9.81);
    this.enableMutualAttraction = config.enableMutualAttraction ?? false;
    this.G = config.G ?? 1.0;
  }

  setGravity(gx, gy) {
    this.gravity.set(gx, gy);
  }

  applyGravity(bodies, graph = null) {
    for (const body of bodies) {
      if (body.type !== 'dynamic' || body.mass <= 0 || body.isSleeping) continue;

      const fGrav = Vec2.scale(this.gravity, body.mass * body.gravityScale);
      body.applyForce(fGrav);

      if (graph && this.enableMutualAttraction) {
        const grad = graph.sampleGradient(body.position);

        const fLattice = new Vec2(-body.mass * grad.x, -body.mass * grad.y);
        body.applyForce(fLattice);
      }
    }

    if (this.enableMutualAttraction && bodies.length > 1) {
      const n = bodies.length;
      for (let i = 0; i < n; i++) {
        const b1 = bodies[i];
        if (b1.type !== 'dynamic' || b1.mass <= 0) continue;

        for (let j = i + 1; j < n; j++) {
          const b2 = bodies[j];
          if (b2.mass <= 0) continue;

          const delta = Vec2.sub(b2.position, b1.position);
          const distSq = delta.lengthSq() + 0.04;
          const dist = Math.sqrt(distSq);
          const forceMagnitude = (this.G * b1.mass * b2.mass) / distSq;
          const force = Vec2.scale(delta, forceMagnitude / dist);

          b1.applyForce(force);
          if (b2.type === 'dynamic') {
            b2.applyForce(force.clone().negate());
          }
        }
      }
    }
  }
}

```

## File: `src/subqg/SubQGPureDynamics.mjs`  
- Path: `src/subqg/SubQGPureDynamics.mjs`  
- Size: 12136 Bytes  
- Modified: 2026-11-12 03:29:20 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import { Vec2 } from '../math/Vec2.mjs';
import { Mat22 } from '../math/Mat22.mjs';

export class SubQGPureDynamics {
  constructor(graph, config = {}) {
    this.graph = graph;
    this.kBarrier = config.kBarrier ?? 3.0e4;
    this.dampBarrier = config.dampBarrier ?? 180.0;
    this.muSubQG = config.muSubQG ?? 0.45;
    this.kJointLink = config.kJointLink ?? 8.0e4;
    this.dampJoint = config.dampJoint ?? 350.0;
  }

  evaluateGravitationalForces(bodies, backgroundGravity = null) {
    const hasBgGravity = backgroundGravity && (backgroundGravity.x !== 0 || backgroundGravity.y !== 0);

    for (const body of bodies) {
      if (body.type !== 'dynamic' || body.mass <= 0 || body.isSleeping) continue;

      if (hasBgGravity) {

        body.applyForce(Vec2.scale(backgroundGravity, body.mass * body.gravityScale));
      } else {

        const gradPhi = this.graph.sampleGradient(body.position);
        const fGrav = new Vec2(-body.mass * gradPhi.x * 50.0, -body.mass * gradPhi.y * 50.0);
        body.applyForce(fGrav);
      }
    }
  }

  applyPureContactForces(activeManifolds, dt) {
    for (const m of activeManifolds) {
      if (m.isTrigger) continue;

      const bA = m.bodyA;
      const bB = m.bodyB;
      const normal = m.normal;

      const isDynamicPair = bA.type === 'dynamic' && bB.type === 'dynamic';
      const jA = (isDynamicPair && bA.joints) ? bA.joints.length : 0;
      const jB = (isDynamicPair && bB.joints) ? bB.joints.length : 0;
      const jointScaleA = 1.0 + jA * 6.0;
      const jointScaleB = 1.0 + jB * 6.0;

      const invMA = bA.type === 'static' ? 0.0 : bA.invMass / jointScaleA;
      const invMB = bB.type === 'static' ? 0.0 : bB.invMass / jointScaleB;

      for (const cp of m.points) {
        const penetration = cp.penetration;
        if (penetration <= 0.0) continue;

        const rA = Vec2.sub(cp.point, bA.position);
        const rB = Vec2.sub(cp.point, bB.position);
        const rnA = rA.cross(normal);
        const rnB = rB.cross(normal);
        const invInertiaA = bA.invInertia / jointScaleA;
        const invInertiaB = bB.invInertia / jointScaleB;
        const invMassNorm = invMA + invMB + rnA * rnA * invInertiaA + rnB * rnB * invInertiaB;
        if (invMassNorm <= 0.0) continue;
        const normalMass = 1.0 / invMassNorm;

        const vA = bA.getVelocityAtPoint(cp.point);
        const vB = bB.getVelocityAtPoint(cp.point);
        const vRel = Vec2.sub(vB, vA);
        const vNormal = vRel.dot(normal);

        const omegaSq = 1200.0;
        const dampCoeff = 40.0;
        let fNormMag = normalMass * (omegaSq * penetration - dampCoeff * vNormal);

        const rest = m.restitution ?? 0.05;
        const maxImpulse = normalMass * (Math.max(0.0, -vNormal * (1.0 + rest)) + (penetration / dt) * 0.45);
        fNormMag = Math.max(0.0, Math.min(fNormMag, maxImpulse / dt));
        cp.normalImpulse = fNormMag * dt;

        const fNormal = Vec2.scale(normal, fNormMag);

        const tangent = m.tangent;
        const vTan = vRel.dot(tangent);
        let fShear = new Vec2(0, 0);

        if (Math.abs(vTan) > 1e-4) {
          const maxFriction = (m.friction ?? this.muSubQG) * fNormMag;
          const desiredShear = (normalMass * Math.abs(vTan)) / dt;
          const shearMag = Math.min(maxFriction, desiredShear);
          fShear = Vec2.scale(tangent, -Math.sign(vTan) * shearMag);
        }

        const fTotalOnB = Vec2.add(fNormal, fShear);

        const invEffA = bA.type === 'static' ? 0.0 : bA.invMass / jointScaleA;
        const invEffB = bB.type === 'static' ? 0.0 : bB.invMass / jointScaleB;
        const effReducedMass = (invEffA + invEffB > 0.0) ? 1.0 / (invEffA + invEffB) : 0.0;

        const maxAllowedImpulse = effReducedMass * (Math.max(0.0, -vNormal * (1.0 + rest)) + (penetration / dt) * 0.75 + 2.0);
        const maxForce = maxAllowedImpulse / dt;

        const mag = fTotalOnB.length();
        const fClampedB = (mag > maxForce && maxForce > 0) ? Vec2.scale(fTotalOnB, maxForce / mag) : fTotalOnB;
        const fClampedA = fClampedB.clone().negate();

        if (bB.type === 'dynamic') {
          bB.applyForceAtPoint(fClampedB, cp.point);
        }
        if (bA.type === 'dynamic') {
          bA.applyForceAtPoint(fClampedA, cp.point);
        }
      }
    }
  }

  applyPureJointForces(joints, dt) {
    for (const j of joints) {
      const bA = j.bodyA;
      const bB = j.bodyB;

      if (j.type === 'revolute') {
        const pA = bA.transform.transformPoint(j.localAnchorA);
        const pB = bB.transform.transformPoint(j.localAnchorB);
        const delta = Vec2.sub(pB, pA);

        const vA = bA.getVelocityAtPoint(pA);
        const vB = bB.getVelocityAtPoint(pB);
        const vRel = Vec2.sub(vB, vA);

        const rA = Vec2.sub(pA, bA.position);
        const rB = Vec2.sub(pB, bB.position);
        const invMass = bA.invMass + bB.invMass;
        if (invMass <= 0) continue;

        const k11 = invMass + rA.y * rA.y * bA.invInertia + rB.y * rB.y * bB.invInertia;
        const k12 = -rA.x * rA.y * bA.invInertia - rB.x * rB.y * bB.invInertia;
        const k21 = k12;
        const k22 = invMass + rA.x * rA.x * bA.invInertia + rB.x * rB.x * bB.invInertia;

        const K = new Mat22().setElements(k11, k12, k21, k22);
        const K_inv = K.invert();

        const targetA = Vec2.scale(delta, 180.0).add(Vec2.scale(vRel, 20.0));
        const fOnB = K_inv.mulVec(targetA).negate();
        const fOnA = fOnB.clone().negate();

        if (bB.type === 'dynamic') bB.applyForceAtPoint(fOnB, pB);
        if (bA.type === 'dynamic') bA.applyForceAtPoint(fOnA, pA);

        if (j.enableMotor) {
          const wRel = bB.angularVelocity - bA.angularVelocity - j.motorSpeed;
          const torque = -Math.max(-j.maxMotorTorque, Math.min(j.maxMotorTorque, wRel * 20.0));
          if (bB.type === 'dynamic') bB.applyTorque(torque);
          if (bA.type === 'dynamic') bA.applyTorque(-torque);
        }

      } else if (j.type === 'distance') {
        const pA = bA.transform.transformPoint(j.localAnchorA);
        const pB = bB.transform.transformPoint(j.localAnchorB);
        const d = Vec2.sub(pB, pA);
        const len = d.length();
        if (len > 1e-6) {
          const u = Vec2.scale(d, 1.0 / len);
          const diff = len - j.length;
          const vA = bA.getVelocityAtPoint(pA);
          const vB = bB.getVelocityAtPoint(pB);
          const vRel = Vec2.sub(vB, vA).dot(u);

          const rA = Vec2.sub(pA, bA.position);
          const rB = Vec2.sub(pB, bB.position);
          const rAcrossU = rA.cross(u);
          const rBcrossU = rB.cross(u);
          const invM = bA.invMass + bB.invMass + rAcrossU * rAcrossU * bA.invInertia + rBcrossU * rBcrossU * bB.invInertia;
          if (invM <= 0) continue;

          const fMag = -(180.0 * diff + 20.0 * vRel) / invM;
          const fOnB = Vec2.scale(u, fMag);
          const fOnA = fOnB.clone().negate();

          if (bB.type === 'dynamic') bB.applyForceAtPoint(fOnB, pB);
          if (bA.type === 'dynamic') bA.applyForceAtPoint(fOnA, pA);
        }

      } else if (j.type === 'weld') {
        const pA = bA.transform.transformPoint(j.localAnchorA);
        const pB = bB.transform.transformPoint(j.localAnchorB);
        const delta = Vec2.sub(pB, pA);
        const rA = Vec2.sub(pA, bA.position);
        const rB = Vec2.sub(pB, bB.position);
        const vA = bA.getVelocityAtPoint(pA);
        const vB = bB.getVelocityAtPoint(pB);
        const vRel = Vec2.sub(vB, vA);

        const invMass = bA.invMass + bB.invMass;
        if (invMass > 0) {
          const k11 = invMass + rA.y * rA.y * bA.invInertia + rB.y * rB.y * bB.invInertia;
          const k12 = -rA.x * rA.y * bA.invInertia - rB.x * rB.y * bB.invInertia;
          const k21 = k12;
          const k22 = invMass + rA.x * rA.x * bA.invInertia + rB.x * rB.x * bB.invInertia;

          const K = new Mat22().setElements(k11, k12, k21, k22);
          const K_inv = K.invert();

          const targetA = Vec2.scale(delta, 180.0).add(Vec2.scale(vRel, 20.0));
          const fOnB = K_inv.mulVec(targetA).negate();
          const fOnA = fOnB.clone().negate();

          if (bB.type === 'dynamic') bB.applyForceAtPoint(fOnB, pB);
          if (bA.type === 'dynamic') bA.applyForceAtPoint(fOnA, pA);
        }

        const dAngle = bB.angle - bA.angle - j.referenceAngle;
        const dOmega = bB.angularVelocity - bA.angularVelocity;
        const invI = bA.invInertia + bB.invInertia;
        if (invI > 0) {
          const torque = -(100.0 * dAngle + 15.0 * dOmega) / invI;
          if (bB.type === 'dynamic') bB.applyTorque(torque);
          if (bA.type === 'dynamic') bA.applyTorque(-torque);
        }
      }
    }
  }
}

```

## File: `src/world/ContactListener.mjs`  
- Path: `src/world/ContactListener.mjs`  
- Size: 261 Bytes  
- Modified: 2026-11-12 01:31:18 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript


export class ContactListener {
  onBeginContact(contact) {}
  onEndContact(contact) {}
  onPreSolve(contact) {}
  onPostSolve(contact, normalImpulses, tangentImpulses) {}
}

```

## File: `src/world/StepConfig.mjs`  
- Path: `src/world/StepConfig.mjs`  
- Size: 609 Bytes  
- Modified: 2026-11-12 01:31:14 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript


export class StepConfig {
  constructor(config = {}) {
    this.dt = config.dt ?? (1.0 / 60.0);
    this.velocityIterations = config.velocityIterations ?? 8;
    this.positionIterations = config.positionIterations ?? 3;
    this.enableSubQGLattice = config.enableSubQGLattice ?? true;
    this.enableWarmStarting = config.enableWarmStarting ?? true;
    this.enableSleeping = config.enableSleeping ?? true;
    this.timeToSleep = config.timeToSleep ?? 0.5;
  }
}

```

## File: `src/world/World.mjs`  
- Path: `src/world/World.mjs`  
- Size: 19197 Bytes  
- Modified: 2026-11-12 03:11:38 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import { Vec2 } from '../math/Vec2.mjs';
import { AABB } from '../math/AABB.mjs';
import { Body } from '../dynamics/Body.mjs';
import { Box } from '../collision/shapes/Box.mjs';
import { Circle } from '../collision/shapes/Circle.mjs';
import { Polygon } from '../collision/shapes/Polygon.mjs';
import { Capsule } from '../collision/shapes/Capsule.mjs';
import { Segment } from '../collision/shapes/Segment.mjs';
import { Material } from '../dynamics/Material.mjs';
import { DynamicAABBTree } from '../collision/broadphase/DynamicAABBTree.mjs';
import { CollisionNarrowphase } from '../collision/narrowphase/CollisionNarrowphase.mjs';
import { ContactSolver } from '../dynamics/ContactSolver.mjs';
import { TriggerSystem } from '../collision/TriggerSystem.mjs';
import { Ray, RaycastHit } from '../collision/Raycast.mjs';
import { StepConfig } from './StepConfig.mjs';
import { RelationalGraph } from '../subqg/RelationalGraph.mjs';
import { MetricLatticeSolver } from '../subqg/MetricLatticeSolver.mjs';
import { SubQGGravitationField } from '../subqg/SubQGGravitationField.mjs';
import { SubQGContactBridge } from '../subqg/SubQGContactBridge.mjs';
import { SubQGPureDynamics } from '../subqg/SubQGPureDynamics.mjs';
import { DistanceJoint } from '../dynamics/joints/DistanceJoint.mjs';
import { RevoluteJoint } from '../dynamics/joints/RevoluteJoint.mjs';
import { PrismaticJoint } from '../dynamics/joints/PrismaticJoint.mjs';
import { WeldJoint } from '../dynamics/joints/WeldJoint.mjs';
import { PulleyJoint } from '../dynamics/joints/PulleyJoint.mjs';
import { SubQGDestructionSystem } from '../destruction/SubQGDestructionSystem.mjs';

export class World {
  constructor(config = {}) {
    this.stepConfig = new StepConfig(config);
    this.engineMode = config.engineMode ?? 'hybrid';

    this.subqgGraph = new RelationalGraph(config.subqg || {});
    this.subqgSolver = new MetricLatticeSolver(this.subqgGraph);
    this.subqgBridge = new SubQGContactBridge(config.subqg || {});
    this.subqgPureDynamics = new SubQGPureDynamics(this.subqgGraph, config.subqg || {});
    this.subqgGravitation = new SubQGGravitationField({
      gravity: config.gravity ?? (this.engineMode === 'pure-subqg' ? new Vec2(0, 0) : new Vec2(0, -9.81)),
      enableMutualAttraction: config.enableMutualAttraction ?? (this.engineMode === 'pure-subqg')
    });

    this.broadPhase = new DynamicAABBTree(config.fatPadding ?? 0.05);
    this.narrowPhase = new CollisionNarrowphase(this.subqgBridge);
    this.contactSolver = new ContactSolver(this.subqgBridge);
    this.triggerSystem = new TriggerSystem();
    this.destructionSystem = new SubQGDestructionSystem(this, config.destruction || {});
    this.contactSolverCalls = 0;
    this.jointSolverCalls = 0;
    this.classicalSolverCalls = 0;
    this.brokenJointsCount = 0;
    this.materialFractureEvents = [];

    this.bodies = [];
    this.joints = [];
    this.contactManifolds = new Map();

    this.contactListeners = [];
    this.jointBreakListeners = [];

    this.subqgDiagnostics = {
      totalEdgeAction: 0,
      maxStrain: 0,
      edgeCount: 0,
      nodeCount: 0,
      stepTimeMs: 0
    };
  }

  setGravity(gx, gy) {
    this.subqgGravitation.setGravity(gx, gy);
  }

  getGravity() {
    return this.subqgGravitation.gravity.clone();
  }

  addContactListener(listener) {
    this.contactListeners.push(listener);
    this.triggerSystem.addListener(listener);
    return this;
  }

  addBody(body) {
    if (this.bodies.includes(body)) return body;
    this.bodies.push(body);
    body.updateAABB();
    body.treeLeaf = this.broadPhase.insertLeaf(body, body.aabb);
    return body;
  }

  removeBody(body) {
    const idx = this.bodies.indexOf(body);
    if (idx !== -1) {
      this.bodies.splice(idx, 1);
      if (body.treeLeaf) {
        this.broadPhase.removeLeaf(body.treeLeaf);
        body.treeLeaf = null;
      }

      for (let i = this.joints.length - 1; i >= 0; i--) {
        const j = this.joints[i];
        if (j.bodyA === body || j.bodyB === body) {
          this.removeJoint(j);
        }
      }
    }
    return this;
  }

  createBody(config = {}) {
    const body = new Body(config);
    return this.addBody(body);
  }

  createBox(x, y, width, height, options = {}) {
    const body = new Body({
      position: new Vec2(x, y),
      type: options.type ?? 'dynamic',
      angle: options.angle ?? 0,
      linearDamping: options.linearDamping,
      angularDamping: options.angularDamping,
      isDestructible: options.isDestructible ?? false,
      fractureForce: options.fractureForce ?? 1500.0,
      allowSleep: options.allowSleep ?? true,
      gravityScale: options.gravityScale ?? 1.0,
      userData: options.userData
    });

    const box = new Box(width, height, options.offset || new Vec2(0, 0));
    if (options.material) box.setMaterial(options.material);
    if (options.isTrigger) box.setTrigger(true);

    body.addShape(box);
    return this.addBody(body);
  }

  createCircle(x, y, radius, options = {}) {
    const body = new Body({
      position: new Vec2(x, y),
      type: options.type ?? 'dynamic',
      angle: options.angle ?? 0,
      linearDamping: options.linearDamping,
      angularDamping: options.angularDamping,
      isDestructible: options.isDestructible ?? false,
      fractureForce: options.fractureForce ?? 1500.0,
      allowSleep: options.allowSleep ?? true,
      gravityScale: options.gravityScale ?? 1.0,
      userData: options.userData
    });

    const circle = new Circle(radius, options.offset || new Vec2(0, 0));
    if (options.material) circle.setMaterial(options.material);
    if (options.isTrigger) circle.setTrigger(true);

    body.addShape(circle);
    return this.addBody(body);
  }

  createPolygon(x, y, vertices, options = {}) {
    const body = new Body({
      position: new Vec2(x, y),
      type: options.type ?? 'dynamic',
      angle: options.angle ?? 0,
      linearDamping: options.linearDamping,
      angularDamping: options.angularDamping,
      isDestructible: options.isDestructible ?? false,
      fractureForce: options.fractureForce ?? 1500.0,
      allowSleep: options.allowSleep ?? true,
      gravityScale: options.gravityScale ?? 1.0,
      userData: options.userData
    });

    const poly = new Polygon(vertices, options.offset || new Vec2(0, 0));
    if (options.material) poly.setMaterial(options.material);
    if (options.isTrigger) poly.setTrigger(true);

    body.addShape(poly);
    return this.addBody(body);
  }

  createCapsule(x, y, length, radius, options = {}) {
    const body = new Body({
      position: new Vec2(x, y),
      type: options.type ?? 'dynamic',
      angle: options.angle ?? 0,
      linearDamping: options.linearDamping,
      angularDamping: options.angularDamping,
      isDestructible: options.isDestructible ?? false,
      fractureForce: options.fractureForce ?? 1500.0,
      allowSleep: options.allowSleep ?? true,
      gravityScale: options.gravityScale ?? 1.0,
      userData: options.userData
    });

    const capsule = new Capsule(length, radius, options.offset || new Vec2(0, 0));
    if (options.material) capsule.setMaterial(options.material);
    if (options.isTrigger) capsule.setTrigger(true);

    body.addShape(capsule);
    return this.addBody(body);
  }

  createSegment(x1, y1, x2, y2, options = {}) {
    const body = new Body({
      position: new Vec2(0, 0),
      type: options.type ?? 'static',
      isDestructible: options.isDestructible ?? false,
      fractureForce: options.fractureForce ?? 1500.0,
      userData: options.userData
    });

    const seg = new Segment(new Vec2(x1, y1), new Vec2(x2, y2));
    if (options.material) seg.setMaterial(options.material);
    if (options.isTrigger) seg.setTrigger(true);

    body.addShape(seg);
    return this.addBody(body);
  }

  addJoint(joint) {
    if (this.joints.includes(joint)) return joint;
    this.joints.push(joint);
    if (!joint.bodyA.joints) joint.bodyA.joints = [];
    if (!joint.bodyB.joints) joint.bodyB.joints = [];
    if (!joint.bodyA.joints.includes(joint)) joint.bodyA.joints.push(joint);
    if (!joint.bodyB.joints.includes(joint)) joint.bodyB.joints.push(joint);
    joint.bodyA.wakeUp();
    joint.bodyB.wakeUp();
    return joint;
  }

  removeJoint(joint) {
    const idx = this.joints.indexOf(joint);
    if (idx !== -1) {
      this.joints.splice(idx, 1);
      if (joint.bodyA.joints) {
        const jIdxA = joint.bodyA.joints.indexOf(joint);
        if (jIdxA !== -1) joint.bodyA.joints.splice(jIdxA, 1);
      }
      if (joint.bodyB.joints) {
        const jIdxB = joint.bodyB.joints.indexOf(joint);
        if (jIdxB !== -1) joint.bodyB.joints.splice(jIdxB, 1);
      }
      joint.bodyA.wakeUp();
      joint.bodyB.wakeUp();
    }
    return this;
  }

  createDistanceJoint(bodyA, bodyB, anchorA, anchorB, config = {}) {
    const j = new DistanceJoint(bodyA, bodyB, anchorA, anchorB, config);
    return this.addJoint(j);
  }

  createRevoluteJoint(bodyA, bodyB, anchorWorld, config = {}) {
    const j = new RevoluteJoint(bodyA, bodyB, anchorWorld, config);
    return this.addJoint(j);
  }

  createPrismaticJoint(bodyA, bodyB, anchorWorld, axisWorld, config = {}) {
    const j = new PrismaticJoint(bodyA, bodyB, anchorWorld, axisWorld, config);
    return this.addJoint(j);
  }

  createWeldJoint(bodyA, bodyB, anchorWorld, config = {}) {
    const j = new WeldJoint(bodyA, bodyB, anchorWorld, config);
    return this.addJoint(j);
  }

  createPulleyJoint(bodyA, bodyB, groundA, groundB, anchorA, anchorB, ratio = 1.0, config = {}) {
    const j = new PulleyJoint(bodyA, bodyB, groundA, groundB, anchorA, anchorB, ratio, config);
    return this.addJoint(j);
  }

  onJointBreak(callback) {
    this.jointBreakListeners.push(callback);
    return this;
  }

  raycast(origin, direction, maxDistance = Infinity) {
    const ray = new Ray(origin, direction, maxDistance);
    let closestHit = null;

    this.broadPhase.raycast(origin, ray.direction, maxDistance, (body) => {
      for (const shape of body.shapes) {
        const hit = shape.raycast(ray, body.transform, maxDistance);
        if (hit.hit) {
          if (!closestHit || hit.fraction < closestHit.fraction) {
            closestHit = new RaycastHit(body, shape, hit.point, hit.normal, hit.fraction);
          }
        }
      }
    });

    return closestHit;
  }

  raycastAll(origin, direction, maxDistance = Infinity) {
    const ray = new Ray(origin, direction, maxDistance);
    const hits = [];

    this.broadPhase.raycast(origin, ray.direction, maxDistance, (body) => {
      for (const shape of body.shapes) {
        const hit = shape.raycast(ray, body.transform, maxDistance);
        if (hit.hit) {
          hits.push(new RaycastHit(body, shape, hit.point, hit.normal, hit.fraction));
        }
      }
    });

    hits.sort((a, b) => a.fraction - b.fraction);
    return hits;
  }

  queryAABB(aabb) {
    const results = [];
    this.broadPhase.queryAABB(aabb, (body) => {
      if (body.aabb.intersects(aabb)) {
        results.push(body);
      }
    });
    return results;
  }

  queryPoint(point) {
    const results = [];
    const ptAABB = new AABB(
      new Vec2(point.x - 0.01, point.y - 0.01),
      new Vec2(point.x + 0.01, point.y + 0.01)
    );

    this.broadPhase.queryAABB(ptAABB, (body) => {
      for (const shape of body.shapes) {
        if (shape.testPoint(point, body.transform)) {
          results.push({ body, shape });
        }
      }
    });

    return results;
  }

  step(customDt = null) {
    const startTime = performance.now();
    const dt = customDt ?? this.stepConfig.dt;
    if (dt <= 0.0) return;

    if (this.stepConfig.enableSubQGLattice) {
      this.subqgGraph.resetDensities();
      for (const body of this.bodies) {
        this.subqgGraph.injectBodyMass(body);
      }
      const solveRes = this.subqgSolver.solve();
      this.subqgDiagnostics.totalEdgeAction = solveRes.totalEdgeAction;
      this.subqgDiagnostics.maxStrain = solveRes.maxStrain;
      this.subqgDiagnostics.edgeCount = solveRes.edgeCount;
      this.subqgDiagnostics.nodeCount = solveRes.nodeCount;
    }

    if (this.engineMode === 'pure-subqg') {

      this.subqgPureDynamics.evaluateGravitationalForces(this.bodies, this.subqgGravitation.gravity);
    } else {
      this.subqgGravitation.applyGravity(this.bodies, this.stepConfig.enableSubQGLattice ? this.subqgGraph : null);
    }

    for (const body of this.bodies) {
      body.integrateForces(dt);
    }

    for (const body of this.bodies) {
      if (body.type !== 'static' && !body.isSleeping) {
        const disp = Vec2.scale(body.velocity, dt);
        this.broadPhase.updateLeaf(body.treeLeaf, body.aabb, disp);
      }
    }

    const activeManifolds = [];
    const checkedPairs = new Set();

    this.broadPhase.queryPairs((bodyA, bodyB) => {

      if (bodyA.type === 'static' && bodyB.type === 'static') return;

      if (bodyA.isSleeping && bodyB.isSleeping) return;

      const pKey = bodyA.id < bodyB.id ? `${bodyA.id}:${bodyB.id}` : `${bodyB.id}:${bodyA.id}`;
      if (checkedPairs.has(pKey)) return;
      checkedPairs.add(pKey);

      for (const joint of this.joints) {
        if (!joint.collideConnected) {
          if ((joint.bodyA === bodyA && joint.bodyB === bodyB) ||
              (joint.bodyA === bodyB && joint.bodyB === bodyA)) {
            return;
          }
        }
      }

      for (const sA of bodyA.shapes) {
        for (const sB of bodyB.shapes) {
          const manifold = this.narrowPhase.collide(bodyA, bodyB, sA, sB);
          if (manifold && manifold.points.length > 0) {
            if (manifold.isTrigger) {
              this.triggerSystem.registerOverlap(manifold);
            } else {

              const prev = this.contactManifolds.get(manifold.key);
              if (prev && this.stepConfig.enableWarmStarting) {
                for (let k = 0; k < Math.min(manifold.points.length, prev.points.length); k++) {
                  manifold.points[k].normalImpulse = prev.points[k].normalImpulse;
                  manifold.points[k].tangentImpulse = prev.points[k].tangentImpulse;
                }
              }
              activeManifolds.push(manifold);
            }
          }
        }
      }
    });

    this.contactManifolds.clear();
    for (const m of activeManifolds) {
      this.contactManifolds.set(m.key, m);
    }

    if (this.engineMode === 'pure-subqg') {

      this.subqgPureDynamics.applyPureContactForces(activeManifolds, dt);
      for (const body of this.bodies) {
        body.integrateForces(dt);
      }

      for (const joint of this.joints) {
        joint.initVelocityConstraints(dt);
      }
      for (let it = 0; it < this.stepConfig.velocityIterations; it++) {
        for (const joint of this.joints) {
          joint.solveVelocityConstraints();
          this.jointSolverCalls++;
        }
      }
    } else {

      for (const joint of this.joints) {
        joint.initVelocityConstraints(dt);
      }
      this.contactSolver.initVelocityConstraints(activeManifolds, dt);

      for (let it = 0; it < this.stepConfig.velocityIterations; it++) {
        for (const joint of this.joints) {
          joint.solveVelocityConstraints();
          this.jointSolverCalls++;
        }
        this.contactSolverCalls++;
        this.classicalSolverCalls++;
        this.contactSolver.solveVelocityConstraints(activeManifolds);
      }
    }

    this.destructionSystem.evaluateJointFracture(dt);
    this.destructionSystem.evaluateBodyFracture(activeManifolds, dt);
    this.destructionSystem.stepDebris(dt);

    for (const body of this.bodies) {
      body.integrateVelocities(dt);
    }

    if (this.stepConfig.enableSleeping) {
      this._evaluateSleeping(dt);
    }

    this.triggerSystem.flushEvents();

    this.subqgDiagnostics.stepTimeMs = performance.now() - startTime;
  }

  _evaluateSleeping(dt) {
    const linTolSq = 0.002;
    const angTolSq = 0.002;

    for (const b of this.bodies) {
      if (b.type !== 'dynamic' || !b.allowSleep) continue;

      const linSpeedSq = b.velocity.lengthSq();
      const angSpeedSq = b.angularVelocity * b.angularVelocity;

      if (linSpeedSq > linTolSq || angSpeedSq > angTolSq) {
        b.sleepTime = 0.0;
        b.isSleeping = false;
      } else {
        b.sleepTime += dt;
        if (b.sleepTime >= this.stepConfig.timeToSleep) {
          b.putToSleep();
        }
      }
    }
  }

  getSubQGDiagnostics() {
    return { ...this.subqgDiagnostics };
  }
}

```

## File: `tests/api_server.test.mjs`  
- Path: `tests/api_server.test.mjs`  
- Size: 2939 Bytes  
- Modified: 2026-11-12 15:46:34 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import { SubQGServer } from '../src/api/SubQGServer.mjs';

test('SubQG API Server: TCP Socket und JSON-RPC Kommunikation', async () => {
  const server = new SubQGServer({ tcpPort: 3101, httpPort: 3102 });
  await server.start();

  try {
    const client = net.createConnection({ port: 3101 }, () => {});

    function sendCommand(cmd) {
      return new Promise((resolve) => {
        client.once('data', (data) => {
          const res = JSON.parse(data.toString('utf-8').trim());
          resolve(res);
        });
        client.write(JSON.stringify(cmd) + '\n');
      });
    }

    const resBox = await sendCommand({
      id: 1,
      method: 'create_box',
      params: { id: 'test_plank', x: 0, y: 10, width: 2.0, height: 0.5, type: 'dynamic' }
    });
    assert.equal(resBox.id, 1);
    assert.equal(resBox.result.bodyId, 'test_plank');

    const resGround = await sendCommand({
      id: 2,
      method: 'create_segment',
      params: { id: 'ground', x1: -20, y1: 0, x2: 20, y2: 0 }
    });
    assert.equal(resGround.id, 2);

    for (let i = 0; i < 30; i++) {
      await sendCommand({ id: 100 + i, method: 'step', params: { dt: 1/60 } });
    }

    const resState = await sendCommand({ id: 3, method: 'get_state' });
    assert.equal(resState.id, 3);
    const plank = resState.result.bodies.find(b => b.id === 'test_plank');
    assert.ok(plank, 'Planke existiert im Snapshot');
    assert.ok(plank.y < 10.0, `Planke ist durch Gravitation gefallen: y=${plank.y} < 10`);

    client.end();
  } finally {
    server.stop();
  }
});

test('SubQG API Server: Batch Baking für Blender Animation Keyframes', async () => {
  const server = new SubQGServer({ tcpPort: 3201, httpPort: 3202 });
  await server.start();

  try {

    server.handleCommand({
      method: 'create_circle',
      params: { id: 'blender_sphere', x: 0, y: 5, radius: 0.5, type: 'dynamic' }
    });
    server.handleCommand({
      method: 'create_segment',
      params: { id: 'floor', x1: -10, y1: 0, x2: 10, y2: 0 }
    });

    const bakeRes = server.handleCommand({
      id: 42,
      method: 'bake',
      params: { steps: 60, dt: 1/60 }
    });

    assert.equal(bakeRes.id, 42);
    assert.equal(bakeRes.result.totalFrames, 60);
    assert.equal(bakeRes.result.frames.length, 60);

    const f0 = bakeRes.result.frames[0].snapshot.bodies.find(b => b.id === 'blender_sphere');
    const f59 = bakeRes.result.frames[59].snapshot.bodies.find(b => b.id === 'blender_sphere');

    assert.ok(f59.y < f0.y, `Ball ist in der gebackenen Animation gefallen: ${f59.y} < ${f0.y}`);
  } finally {
    server.stop();
  }
});

```

## File: `tests/collision_narrowphase.test.mjs`  
- Path: `tests/collision_narrowphase.test.mjs`  
- Size: 2716 Bytes  
- Modified: 2026-11-12 01:33:20 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { Body, Circle, Box, Polygon, Capsule, Segment, CollisionNarrowphase, SubQGContactBridge, Vec2 } from '../index.mjs';

const bridge = new SubQGContactBridge();
const narrow = new CollisionNarrowphase(bridge);

test('Narrowphase: Circle vs Circle Kollision und Distanz', () => {
  const b1 = new Body({ position: new Vec2(0, 0) });
  const c1 = new Circle(1.0);
  b1.addShape(c1);

  const b2 = new Body({ position: new Vec2(1.5, 0) });
  const c2 = new Circle(1.0);
  b2.addShape(c2);

  const manifold = narrow.collide(b1, b2, c1, c2);
  assert.ok(manifold !== null);
  assert.equal(manifold.points.length, 1);
  assert.ok(Math.abs(manifold.points[0].penetration - 0.5) < 1e-9);
  assert.ok(Math.abs(manifold.normal.x - 1.0) < 1e-9);
  assert.ok(Math.abs(manifold.normal.y - 0.0) < 1e-9);

  b2.setPosition(2.5, 0);
  assert.equal(narrow.collide(b1, b2, c1, c2), null);
});

test('Narrowphase: Circle vs Box Kollision', () => {
  const bBox = new Body({ position: new Vec2(0, 0), type: 'static' });
  const box = new Box(4.0, 2.0);
  bBox.addShape(box);

  const bCircle = new Body({ position: new Vec2(0, 1.8) });
  const circle = new Circle(1.0);
  bCircle.addShape(circle);

  const manifold = narrow.collide(bCircle, bBox, circle, box);
  assert.ok(manifold !== null);
  assert.equal(manifold.points.length, 1);
  assert.ok(Math.abs(manifold.points[0].penetration - 0.2) < 1e-3);

  assert.ok(manifold.normal.y < -0.9);
});

test('Narrowphase: Box vs Box SAT und 2 Kontaktpunkte', () => {
  const bFloor = new Body({ position: new Vec2(0, 0), type: 'static' });
  const floorBox = new Box(10.0, 1.0);
  bFloor.addShape(floorBox);

  const bCrate = new Body({ position: new Vec2(0, 1.4) });
  const crateBox = new Box(1.0, 1.0);
  bCrate.addShape(crateBox);

  bCrate.setPosition(0, 0.9);

  const manifold = narrow.collide(bFloor, bCrate, floorBox, crateBox);
  assert.ok(manifold !== null);

  assert.ok(manifold.points.length >= 1);
  assert.ok(Math.abs(manifold.normal.y - 1.0) < 1e-6);
  assert.ok(manifold.points[0].penetration > 0.05);
});

```

## File: `tests/dynamics_fall_bounce.test.mjs`  
- Path: `tests/dynamics_fall_bounce.test.mjs`  
- Size: 3151 Bytes  
- Modified: 2026-11-12 01:33:38 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { World, Vec2, Material } from '../index.mjs';

test('Dynamics: Fallende Kiste landet auf Boden und bleibt liegen (Ruhelage)', () => {
  const world = new World({ gravity: new Vec2(0, -9.81) });

  const floor = world.createBox(0, 0, 20, 1.0, {
    type: 'static',
    material: new Material({ friction: 0.5, restitution: 0.05 })
  });

  const box = world.createBox(0, 5.0, 1.0, 1.0, {
    type: 'dynamic',
    material: new Material({ friction: 0.5, restitution: 0.05 })
  });

  const initialY = box.position.y;
  assert.equal(initialY, 5.0);

  for (let i = 0; i < 120; i++) {
    world.step(1.0 / 60.0);
  }

  assert.ok(box.position.y < 1.05 && box.position.y >= 0.98, `Kistenposition y: ${box.position.y}`);

  assert.ok(Math.abs(box.velocity.y) < 0.05, `Kistengeschwindigkeit vy: ${box.velocity.y}`);
});

test('Dynamics: Elastischer Ball springt mehrfach vom Boden ab (Restitution)', () => {
  const world = new World({ gravity: new Vec2(0, -9.81) });

  world.createBox(0, 0, 20, 1.0, {
    type: 'static',
    material: new Material({ friction: 0.1, restitution: 0.85 })
  });

  const ball = world.createCircle(0, 4.0, 0.5, {
    type: 'dynamic',
    material: new Material({ friction: 0.1, restitution: 0.85 })
  });

  let hitCount = 0;
  let maxBounceHeight = 0;
  let prevVy = ball.velocity.y;

  for (let i = 0; i < 180; i++) {
    world.step(1.0 / 60.0);

    if (prevVy < -0.5 && ball.velocity.y > 0.5) {
      hitCount++;
    }
    prevVy = ball.velocity.y;
    if (ball.position.y > maxBounceHeight && hitCount >= 1) {
      maxBounceHeight = ball.position.y;
    }
  }

  assert.ok(hitCount >= 1, `Aufprall-Zähler: ${hitCount}`);
  assert.ok(maxBounceHeight > 1.5, `Rebound Höhe: ${maxBounceHeight}`);
});

test('Dynamics: Rollender Ball und Kastenreibung auf Ebene', () => {
  const world = new World({ gravity: new Vec2(0, -9.81) });

  world.createBox(0, 0, 30, 1.0, {
    type: 'static',
    material: new Material({ friction: 0.4, restitution: 0.0 })
  });

  const slidingBox = world.createBox(-5, 1.0, 1.0, 1.0, {
    type: 'dynamic',
    material: new Material({ friction: 0.4, restitution: 0.0 })
  });
  slidingBox.setVelocity(6.0, 0);

  for (let i = 0; i < 120; i++) {
    world.step(1.0 / 60.0);
  }

  assert.ok(slidingBox.velocity.x < 1.0, `Endgeschwindigkeit vx: ${slidingBox.velocity.x}`);
});

```

## File: `tests/game_scenarios.test.mjs`  
- Path: `tests/game_scenarios.test.mjs`  
- Size: 4050 Bytes  
- Modified: 2026-11-12 01:35:22 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { World, Vec2, Material, Box, Circle } from '../index.mjs';

test('Game Scenario: Fahrzeug mit 2 Rädern und Radlagern fährt über Boden', () => {
  const world = new World({ gravity: new Vec2(0, -9.81) });

  world.createBox(0, 0, 40, 1.0, {
    type: 'static',
    material: new Material({ friction: 0.8, restitution: 0.0 })
  });

  const chassis = world.createBox(0, 2.0, 3.0, 0.8, {
    type: 'dynamic',
    material: new Material({ density: 1.0, friction: 0.2 })
  });

  const wheelMaterial = new Material({ density: 2.0, friction: 0.9, restitution: 0.05 });
  const rearWheel = world.createCircle(-1.2, 1.2, 0.5, {
    type: 'dynamic',
    material: wheelMaterial
  });
  const frontWheel = world.createCircle(1.2, 1.2, 0.5, {
    type: 'dynamic',
    material: wheelMaterial
  });

  const rearAxle = world.createRevoluteJoint(chassis, rearWheel, new Vec2(-1.2, 1.2), {
    enableMotor: true,
    motorSpeed: -15.0,
    maxMotorTorque: 50.0
  });

  const frontAxle = world.createRevoluteJoint(chassis, frontWheel, new Vec2(1.2, 1.2), {
    enableMotor: false
  });

  const initialX = chassis.position.x;

  for (let i = 0; i < 120; i++) {
    world.step(1.0 / 60.0);
  }

  assert.ok(chassis.position.x > initialX + 2.0, `Fahrzeugposition x: ${chassis.position.x} (erwartet > ${initialX + 2.0})`);

  assert.ok(chassis.position.y > 1.0 && chassis.position.y < 3.0, `Chassis-Höhe y: ${chassis.position.y}`);
});

test('Game Scenario: Katapult schleudert Projektil mit Hebelarm', () => {
  const world = new World({ gravity: new Vec2(0, -9.81) });

  const base = world.createBox(0, 1.0, 2, 2, { type: 'static' });

  const arm = world.createBox(1.5, 2.0, 4.0, 0.2, {
    type: 'dynamic',
    material: new Material({ density: 0.5 })
  });

  world.createRevoluteJoint(base, arm, new Vec2(0, 2.0));

  const projectile = world.createCircle(3.5, 2.3, 0.3, {
    type: 'dynamic',
    material: new Material({ density: 2.0, friction: 0.2, restitution: 0.2 })
  });

  arm.applyAngularImpulse(80.0);

  for (let i = 0; i < 60; i++) {
    world.step(1.0 / 60.0);
  }

  assert.ok(projectile.position.y > 3.0, `Projektil-Flughöhe y: ${projectile.position.y}`);
  assert.ok(projectile.position.x > 3.5, `Projektil-Wurfweite x: ${projectile.position.x}`);
});

test('Game Scenario: Compound Body (Spielfigur aus Kopf-Kreis und Rumpf-Box)', () => {
  const world = new World({ gravity: new Vec2(0, -9.81) });

  const character = world.createBody({
    position: new Vec2(0, 5),
    type: 'dynamic'
  });

  const torso = new Box(1.0, 1.5, new Vec2(0, 0));

  const head = new Circle(0.4, new Vec2(0, 1.1));

  character.addShape(torso);
  character.addShape(head);

  assert.equal(character.shapes.length, 2);
  assert.ok(character.mass > 2.0);

  world.createBox(0, 0, 20, 1.0, { type: 'static' });

  for (let i = 0; i < 140; i++) {
    world.step(1.0 / 60.0);
  }

  assert.ok(character.position.y < 2.0 && character.position.y > 0.8, `Endhöhe Figur: ${character.position.y}`);
  assert.ok(character.velocity.length() < 0.15, `Restgeschwindigkeit: ${character.velocity.length()}`);
});

```

## File: `tests/joints_and_constraints.test.mjs`  
- Path: `tests/joints_and_constraints.test.mjs`  
- Size: 3345 Bytes  
- Modified: 2026-11-12 01:35:18 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { World, Vec2, Material } from '../index.mjs';

test('Joints: RevoluteJoint (Pendel) hält Drehpunkt exakt ein', () => {
  const world = new World({ gravity: new Vec2(0, -9.81) });

  const ceiling = world.createBox(0, 10, 2, 0.5, { type: 'static' });

  const bob = world.createCircle(3, 10, 0.5, { type: 'dynamic' });

  const joint = world.createRevoluteJoint(ceiling, bob, new Vec2(0, 10));

  for (let i = 0; i < 60; i++) {
    world.step(1.0 / 60.0);

    const pA = ceiling.transform.transformPoint(joint.localAnchorA);
    const pB = bob.transform.transformPoint(joint.localAnchorB);
    assert.ok(pA.distanceTo(pB) < 0.02, `Gelenk-Distanzfehler: ${pA.distanceTo(pB)}`);
  }

  assert.ok(bob.position.y < 10.0, `Bob y: ${bob.position.y}`);
});

test('Joints: DistanceJoint hält Abstand konstant', () => {
  const world = new World({ gravity: new Vec2(0, -9.81) });

  const anchor = world.createCircle(0, 10, 0.2, { type: 'static' });
  const bob = world.createCircle(2, 10, 0.5, { type: 'dynamic' });

  const distJoint = world.createDistanceJoint(anchor, bob, new Vec2(0, 10), new Vec2(2, 10), {
    length: 2.0
  });

  for (let i = 0; i < 60; i++) {
    world.step(1.0 / 60.0);
    const pA = anchor.transform.transformPoint(distJoint.localAnchorA);
    const pB = bob.transform.transformPoint(distJoint.localAnchorB);
    const currentDist = pA.distanceTo(pB);
    assert.ok(Math.abs(currentDist - 2.0) < 0.02, `Abweichung Stangenlänge: ${Math.abs(currentDist - 2.0)}`);
  }
});

test('Joints: PrismaticJoint führt Körper exakt entlang Schienenachse', () => {
  const world = new World({ gravity: new Vec2(0, -9.81) });

  const base = world.createBox(0, 5, 2, 2, { type: 'static' });

  const piston = world.createBox(0, 7, 1, 1, { type: 'dynamic' });

  world.createPrismaticJoint(base, piston, new Vec2(0, 5), new Vec2(0, 1));

  piston.applyForce(new Vec2(50.0, 0));

  for (let i = 0; i < 60; i++) {
    world.step(1.0 / 60.0);

    assert.ok(Math.abs(piston.position.x) < 0.02, `Piston x-Drift: ${piston.position.x}`);
  }

  assert.ok(piston.position.y < 7.0, `Piston y: ${piston.position.y}`);
});

test('Joints: WeldJoint verschweißt Körper starr', () => {
  const world = new World({ gravity: new Vec2(0, 0) });

  const b1 = world.createBox(0, 0, 1, 1, { type: 'dynamic' });
  const b2 = world.createBox(2, 0, 1, 1, { type: 'dynamic' });

  world.createWeldJoint(b1, b2, new Vec2(1, 0));

  b1.applyTorque(10.0);

  for (let i = 0; i < 30; i++) {
    world.step(1.0 / 60.0);
  }

  assert.ok(Math.abs(b1.angle - b2.angle) < 0.02, `Winkel-Differenz: ${Math.abs(b1.angle - b2.angle)}`);
  assert.ok(Math.abs(b1.angularVelocity - b2.angularVelocity) < 0.05);
});

```

## File: `tests/math.test.mjs`  
- Path: `tests/math.test.mjs`  
- Size: 2874 Bytes  
- Modified: 2026-11-12 01:33:00 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { Vec2, Mat22, Transform, AABB, clamp, lerp, normalizeAngle } from '../index.mjs';

test('Math: Vec2 Grundoperationen und Vektoralgebra', () => {
  const v1 = new Vec2(3, 4);
  assert.equal(v1.length(), 5);
  assert.equal(v1.lengthSq(), 25);

  const norm = v1.clone().normalize();
  assert.ok(Math.abs(norm.length() - 1.0) < 1e-12);
  assert.ok(Math.abs(norm.x - 0.6) < 1e-12);
  assert.ok(Math.abs(norm.y - 0.8) < 1e-12);

  const v2 = new Vec2(1, 2);
  const addRes = Vec2.add(v1, v2);
  assert.equal(addRes.x, 4);
  assert.equal(addRes.y, 6);

  const subRes = Vec2.sub(v1, v2);
  assert.equal(subRes.x, 2);
  assert.equal(subRes.y, 2);

  assert.equal(v1.dot(v2), 3 * 1 + 4 * 2);
  assert.equal(v1.cross(v2), 3 * 2 - 4 * 1);

  const perp = v1.perp();
  assert.equal(perp.x, -4);
  assert.equal(perp.y, 3);
  assert.equal(v1.dot(perp), 0);
});

test('Math: Mat22 Inversion und lineares Gleichungssystem', () => {
  const m = new Mat22();
  m.set(Math.PI / 2);
  const v = new Vec2(1, 0);
  const rotV = m.mulVec(v);
  assert.ok(Math.abs(rotV.x) < 1e-12);
  assert.ok(Math.abs(rotV.y - 1.0) < 1e-12);

  const M = new Mat22();
  M.setElements(2, 1, 1, 3);
  const b = new Vec2(5, 10);
  const x = M.solve(b);
  assert.ok(Math.abs(x.x - 1.0) < 1e-9);
  assert.ok(Math.abs(x.y - 3.0) < 1e-9);
});

test('Math: Transform Lokal- und Weltkoordinaten', () => {
  const t = new Transform(new Vec2(10, 20), Math.PI / 2);
  const localPt = new Vec2(2, 0);
  const worldPt = t.transformPoint(localPt);
  assert.ok(Math.abs(worldPt.x - 10.0) < 1e-12);
  assert.ok(Math.abs(worldPt.y - 22.0) < 1e-12);

  const backLocal = t.inverseTransformPoint(worldPt);
  assert.ok(Math.abs(backLocal.x - 2.0) < 1e-12);
  assert.ok(Math.abs(backLocal.y - 0.0) < 1e-12);
});

test('Math: AABB Geometrie, Überlappung und Raycast', () => {
  const aabb1 = new AABB(new Vec2(0, 0), new Vec2(10, 10));
  const aabb2 = new AABB(new Vec2(5, 5), new Vec2(15, 15));
  const aabb3 = new AABB(new Vec2(20, 20), new Vec2(30, 30));

  assert.equal(aabb1.intersects(aabb2), true);
  assert.equal(aabb1.intersects(aabb3), false);

  assert.equal(aabb1.containsPoint(new Vec2(5, 5)), true);
  assert.equal(aabb1.containsPoint(new Vec2(15, 5)), false);

  assert.equal(aabb1.getArea(), 100);
  assert.equal(aabb1.getPerimeter(), 40);

  const rayOrigin = new Vec2(-5, 5);
  const rayDir = new Vec2(1, 0);
  const hit = aabb1.raycast(rayOrigin, rayDir, 20);
  assert.equal(hit.hit, true);
  assert.equal(hit.fraction, 5);
  assert.equal(hit.point.x, 0);
  assert.equal(hit.point.y, 5);
  assert.equal(hit.normal.x, -1);
});

```

## File: `tests/raycast.test.mjs`  
- Path: `tests/raycast.test.mjs`  
- Size: 1745 Bytes  
- Modified: 2026-11-12 01:33:26 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { World, Vec2, Box, Circle, Polygon, Segment } from '../index.mjs';

test('Raycast: Präziser Treffertest gegen verschiedene Formen', () => {
  const world = new World();

  const crate = world.createBox(5, 0, 2, 2, { type: 'static' });

  const hit = world.raycast(new Vec2(0, 0), new Vec2(1, 0), 10);
  assert.ok(hit !== null);
  assert.equal(hit.body, crate);
  assert.ok(Math.abs(hit.point.x - 4.0) < 1e-4);
  assert.ok(Math.abs(hit.point.y - 0.0) < 1e-4);
  assert.ok(Math.abs(hit.normal.x - (-1.0)) < 1e-4);

  const miss = world.raycast(new Vec2(0, 5), new Vec2(1, 0), 10);
  assert.equal(miss, null);

  const ball = world.createCircle(0, 8, 1.0, { type: 'static' });
  const hitCircle = world.raycast(new Vec2(0, 0), new Vec2(0, 1), 10);
  assert.ok(hitCircle !== null);
  assert.equal(hitCircle.body, ball);
  assert.ok(Math.abs(hitCircle.point.y - 7.0) < 1e-4);
  assert.ok(Math.abs(hitCircle.normal.y - (-1.0)) < 1e-4);
});

test('RaycastAll: Sortierung nach Trefferdistanz', () => {
  const world = new World();
  const b1 = world.createBox(3, 0, 1, 1, { type: 'static' });
  const b2 = world.createBox(7, 0, 1, 1, { type: 'static' });

  const hits = world.raycastAll(new Vec2(0, 0), new Vec2(1, 0), 20);
  assert.equal(hits.length, 2);
  assert.equal(hits[0].body, b1);
  assert.equal(hits[1].body, b2);
  assert.ok(hits[0].fraction < hits[1].fraction);
});

```

## File: `tests/shapes_and_aabb.test.mjs`  
- Path: `tests/shapes_and_aabb.test.mjs`  
- Size: 2659 Bytes  
- Modified: 2026-11-12 01:33:10 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { Circle, Box, Polygon, Capsule, Segment, Transform, Vec2 } from '../index.mjs';

test('Shapes: Circle Masse und AABB', () => {
  const c = new Circle(1.0);
  const massData = c.computeMassData(2.0);
  const expectedArea = Math.PI * 1.0 * 1.0;
  assert.ok(Math.abs(massData.area - expectedArea) < 1e-9);
  assert.ok(Math.abs(massData.mass - 2.0 * expectedArea) < 1e-9);

  const t = new Transform(new Vec2(5, 5), 0);
  const aabb = c.computeAABB(t);
  assert.equal(aabb.min.x, 4);
  assert.equal(aabb.min.y, 4);
  assert.equal(aabb.max.x, 6);
  assert.equal(aabb.max.y, 6);

  assert.equal(c.testPoint(new Vec2(5.5, 5.5), t), true);
  assert.equal(c.testPoint(new Vec2(7, 5), t), false);
});

test('Shapes: Box Masse, Ecken und Rotationstransformation', () => {
  const b = new Box(2.0, 4.0);
  const massData = b.computeMassData(1.0);
  assert.equal(massData.area, 8.0);
  assert.equal(massData.mass, 8.0);

  assert.ok(Math.abs(massData.inertia - (8.0 / 12.0) * 20.0) < 1e-9);

  const t = new Transform(new Vec2(0, 0), Math.PI / 2);
  const aabb = b.computeAABB(t);

  assert.ok(Math.abs(aabb.min.x - (-2.0)) < 1e-9);
  assert.ok(Math.abs(aabb.max.x - 2.0) < 1e-9);
  assert.ok(Math.abs(aabb.min.y - (-1.0)) < 1e-9);
  assert.ok(Math.abs(aabb.max.y - 1.0) < 1e-9);
});

test('Shapes: Polygon konvexes Dreieck', () => {
  const poly = new Polygon([
    new Vec2(0, 0),
    new Vec2(4, 0),
    new Vec2(0, 3)
  ]);
  const massData = poly.computeMassData(1.0);
  assert.ok(Math.abs(massData.area - 6.0) < 1e-9);

  const t = new Transform(new Vec2(0, 0), 0);
  assert.equal(poly.testPoint(new Vec2(1, 1), t), true);
  assert.equal(poly.testPoint(new Vec2(3, 3), t), false);
});

test('Shapes: Capsule Endpunkte und Hüllkurve', () => {
  const cap = new Capsule(2.0, 0.5);
  const t = new Transform(new Vec2(10, 10), 0);
  const aabb = cap.computeAABB(t);

  assert.ok(Math.abs(aabb.min.x - 9.5) < 1e-9);
  assert.ok(Math.abs(aabb.max.x - 10.5) < 1e-9);
  assert.ok(Math.abs(aabb.min.y - 8.5) < 1e-9);
  assert.ok(Math.abs(aabb.max.y - 11.5) < 1e-9);
});

test('Shapes: Segment Endpunkte und AABB', () => {
  const seg = new Segment(new Vec2(-5, 0), new Vec2(5, 0));
  const t = new Transform(new Vec2(0, 0), 0);
  const aabb = seg.computeAABB(t);
  assert.ok(aabb.min.x <= -5);
  assert.ok(aabb.max.x >= 5);
});

```

## File: `tests/stacking_stability.test.mjs`  
- Path: `tests/stacking_stability.test.mjs`  
- Size: 1750 Bytes  
- Modified: 2026-11-12 01:33:46 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { World, Vec2, Material } from '../index.mjs';

test('Stacking: Stabiler Kistenturm (5 Kisten aufeinander) ohne Einsturz oder Zittern', () => {
  const world = new World({
    gravity: new Vec2(0, -9.81),
    velocityIterations: 10
  });

  world.createBox(0, 0, 20, 1.0, {
    type: 'static',
    material: new Material({ friction: 0.6, restitution: 0.0 })
  });

  const boxes = [];
  const boxHeight = 1.0;
  const numBoxes = 5;

  for (let i = 0; i < numBoxes; i++) {

    const yPos = 1.0 + i * boxHeight;
    const b = world.createBox(0, yPos, 1.0, boxHeight, {
      type: 'dynamic',
      material: new Material({ friction: 0.6, restitution: 0.0 }),
      linearDamping: 0.05,
      angularDamping: 0.05
    });
    boxes.push(b);
  }

  for (let step = 0; step < 200; step++) {
    world.step(1.0 / 60.0);
  }

  for (let i = 0; i < numBoxes; i++) {
    const b = boxes[i];

    assert.ok(Math.abs(b.position.x) < 0.1, `Kiste ${i} x-Drift: ${b.position.x}`);

    const expectedY = 1.0 + i * boxHeight;
    assert.ok(Math.abs(b.position.y - expectedY) < 0.15, `Kiste ${i} y-Höhe: ${b.position.y} (erwartet ~${expectedY})`);

    assert.ok(b.velocity.length() < 0.1, `Kiste ${i} Restgeschwindigkeit: ${b.velocity.length()}`);
  }
});

```

## File: `tests/subqg_internal_metric.test.mjs`  
- Path: `tests/subqg_internal_metric.test.mjs`  
- Size: 12412 Bytes  
- Modified: 2026-11-12 03:16:30 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { World, Vec2, SubQGInspector, Material } from '../index.mjs';
import { DemoScenes } from '../demo/demo_scenes.mjs';

test('SubQG: Masseunabhängiger freier Fall (Universal Free Fall)', () => {
  const world = new World({ gravity: new Vec2(0, -9.81) });

  const apple = world.createCircle(0, 10, 0.2, {
    material: new Material({ density: 1.0 })
  });

  const boulder = world.createBox(5, 10, 2.0, 2.0, {
    material: new Material({ density: 50.0 })
  });

  assert.ok(boulder.mass > 100 * apple.mass);

  for (let i = 0; i < 30; i++) {
    world.step(1.0 / 60.0);
  }

  const diffY = Math.abs(apple.position.y - boulder.position.y);
  const diffVy = Math.abs(apple.velocity.y - boulder.velocity.y);

  assert.ok(diffY < 1e-4, `Höhendifferenz nach freiem Fall: ${diffY}`);
  assert.ok(diffVy < 1e-4, `Geschwindigkeitsdifferenz: ${diffVy}`);
});

test('SubQG: Internes Metrikgitter, Wirkungsminimierung und Inspector-Audit', () => {
  const world = new World({
    gravity: new Vec2(0, -9.81),
    enableSubQGLattice: true
  });

  const planet = world.createCircle(0, 0, 2.0, {
    type: 'static',
    material: new Material({ density: 100.0 })
  });

  world.step(1.0 / 60.0);

  const inspector = new SubQGInspector(world);
  const diag = world.getSubQGDiagnostics();

  assert.ok(diag.edgeCount > 100, `Kantenanzahl: ${diag.edgeCount}`);
  assert.ok(diag.nodeCount > 50, `Knotenanzahl: ${diag.nodeCount}`);

  assert.ok(diag.maxStrain > 0.0, `Maximale Kantenverzerrung: ${diag.maxStrain}`);

  const audit = inspector.computeFullEnergyAudit();
  assert.ok(Number.isFinite(audit.subqgEdgeAction));
  assert.ok(audit.stepTimeMs >= 0);

  const heatmap = inspector.extractMetricHeatmap(16);
  assert.equal(heatmap.resolution, 16);
  assert.equal(heatmap.grid.length, 16);
  assert.equal(heatmap.grid[0].length, 16);

  const centerPhi = world.subqgGraph.samplePotential(new Vec2(0, 0));
  const farPhi = world.subqgGraph.samplePotential(new Vec2(25, 25));
  assert.ok(centerPhi < farPhi, `Zentrumspotential ${centerPhi} < Fernfeld ${farPhi}`);
});

test('SubQG: Pure-SubQG Modus berechnet Gravitation und Repulsion rein aus Wirkungsvariation', () => {
  const world = new World({
    engineMode: 'pure-subqg'
  });

  world.createCircle(0, 0, 2.0, {
    type: 'static',
    material: new Material({ density: 50.0 })
  });

  const body = world.createCircle(0, 5, 0.5, {
    type: 'dynamic',
    material: new Material({ density: 1.0 })
  });

  const initialY = body.position.y;

  for (let i = 0; i < 30; i++) {
    world.step(1.0 / 60.0);
  }

  assert.ok(body.position.y < initialY, `Reine SubQG-Bewegung: y=${body.position.y} < ${initialY}`);
  assert.ok(body.velocity.y < 0, `Negative Geschwindigkeit aus SubQG-Gradient: vy=${body.velocity.y}`);

  assert.equal(world.contactSolverCalls, 0, 'Klassischer Impulssolver wurde im Pure-Modus 0x aufgerufen');
});

test('SubQG Pure: Keine Phantom-Repulsion oberhalb flacher Box (Kritikpunkt 2 des Testers)', () => {
  const world = new World({
    engineMode: 'pure-subqg'
  });

  world.createBox(0, 0, 40, 1.0, { type: 'static' });

  const circle = world.createCircle(0, 3.0, 0.5, { type: 'dynamic' });

  world.step(1.0 / 600.0);

  assert.ok(Math.abs(circle.velocity.y) < 2.0, `Keine Phantom-Beschleunigung: vy = ${circle.velocity.y}`);
  assert.equal(world.contactSolverCalls, 0);
});

test('SubQG Pure: Echte geometrische Kantenbarriere-Repulsion und Relationale Scherdämpfung', () => {
  const world = new World({
    engineMode: 'pure-subqg'
  });

  world.createBox(0, 0, 20, 1.0, { type: 'static' });

  const crate = world.createBox(0, 0.95, 1.0, 1.0, { type: 'dynamic' });
  crate.setVelocity(4.0, 0.0);

  world.step(1.0 / 60.0);

  assert.ok(crate.velocity.y > 0.05, `Kantenbarriere stößt ab: vy = ${crate.velocity.y} > 0`);

  assert.ok(crate.velocity.x < 4.0, `Scherdämpfung bremst Gleiten: vx = ${crate.velocity.x} < 4.0`);

  assert.equal(world.contactSolverCalls, 0, 'Impulssolver-Aufrufe strikt 0');
});

test('SubQG Pure: Topologische Gelenke schwingen stabil (0 Kontakt-Solver-Aufrufe)', () => {
  const world = new World({
    engineMode: 'pure-subqg'
  });

  const anchor = world.createBox(0, 5, 1.0, 1.0, { type: 'static' });
  const bob = world.createCircle(1.5, 5, 0.4, { type: 'dynamic' });
  const joint = world.createRevoluteJoint(anchor, bob, new Vec2(0, 5));

  for (let i = 0; i < 60; i++) {
    bob.applyForce(new Vec2(0, -9.81 * bob.mass));
    world.step(1.0 / 60.0);
  }

  const dist = bob.position.distanceTo(new Vec2(0, 5));
  assert.ok(Math.abs(dist - 1.5) < 0.05, `Gelenkabstand stabil: dist = ${dist}`);

  assert.ok(bob.velocity.length() > 0.1, `Pendelbewegung aktiv: v = ${bob.velocity.length()}`);

  assert.equal(world.contactSolverCalls, 0, 'contactSolverCalls strikt 0');
});

test('SubQG: Tragfaehige Bruecke faengt schweren Felsen stabil ab (ohne Durchdringung)', () => {
  const world = new World({
    engineMode: 'pure-subqg',
    gravity: new Vec2(0, -9.81)
  });

  world.createBox(0, 0, 40, 1.0, { type: 'static' });

  const p1 = world.createBox(-8, 5, 1.5, 4, { type: 'static' });
  const p2 = world.createBox(8, 5, 1.5, 4, { type: 'static' });

  let prev = p1;
  for (let i = 0; i < 12; i++) {
    const x = -6.5 + i * 1.18;
    const y = 6.5;
    const plank = world.createBox(x, y, 1.1, 0.2, {
      type: 'dynamic',
      material: new Material({ density: 1.2, friction: 0.4 })
    });
    world.createRevoluteJoint(prev, plank, new Vec2(x - 0.55, y), { breakingForce: Infinity });
    prev = plank;
  }
  world.createRevoluteJoint(prev, p2, new Vec2(7.25, 6.8), { breakingForce: Infinity });

  const boulder = world.createCircle(0, 12, 0.8, {
    type: 'dynamic',
    material: new Material({ density: 4.0, friction: 0.5, restitution: 0.1 })
  });

  for (let i = 0; i < 160; i++) {
    world.step(1.0 / 60.0);
  }

  assert.equal(world.joints.length, 13, 'Alle 13 Gelenke der tragfähigen Brücke sind intakt');
  assert.equal(world.brokenJointsCount, 0, '0 Gelenkbrüche');

  assert.ok(boulder.position.y > 3.0, `Felsblock wurde abgefangen bei y=${boulder.position.y.toFixed(2)} > 3.0 m`);
  assert.equal(world.contactSolverCalls, 0, 'Pure SubQG Modus: Null Kontaktimpulssolver-Aufrufe');
});

test('SubQG Destruction Physics: Zerstoerbare Bruecke reisst bei Ueberlastung (> 250 N) mit echtem Materialbruch', () => {
  const world = new World({
    engineMode: 'pure-subqg',
    gravity: new Vec2(0, -9.81)
  });

  DemoScenes.ropeBridgeBreakable(world);
  const boulder = world.bodies.find(b => b.userData === 'Felsblock');

  let minBoulderY = Infinity;
  for (let i = 0; i < 160; i++) {
    world.step(1.0 / 60.0);
    if (boulder.position.y < minBoulderY) minBoulderY = boulder.position.y;
  }

  assert.ok(world.joints.length < 13, `Gelenke wurden durch Materialbruch getrennt: verbleibend ${world.joints.length} < 13`);
  assert.ok(world.brokenJointsCount > 0, `Gelenkbruch gezählt: ${world.brokenJointsCount} > 0`);
  assert.ok(world.destructionSystem.fractureEvents.length > 0, `Echte Bruch-Events registriert: ${world.destructionSystem.fractureEvents.length}`);

  assert.ok(minBoulderY < 2.0, `Felsen passiert die reale Bruchöffnung und landet am Boden: min y = ${minBoulderY.toFixed(2)}`);
  assert.equal(world.contactSolverCalls, 0, 'Pure SubQG Modus: Null Kontaktimpulssolver-Aufrufe');
});

test('SubQG Destruction Physics: Direkter Plankenbruch erzeugt bewegliche Bruchstuecke (body_shatter)', () => {
  const world = new World({ engineMode: 'pure-subqg' });
  const plank = world.createBox(0, 5, 2.0, 0.3, {
    type: 'dynamic',
    isDestructible: true,
    fractureForce: 300.0,
    material: new Material({ density: 1.2, friction: 0.5, restitution: 0.05 })
  });

  assert.equal(plank.isDestructible, true, 'isDestructible wurde erfolgreich von createBox an Body uebergeben');
  assert.equal(plank.fractureForce, 300.0, 'fractureForce wurde erfolgreich an Body uebergeben');

  const initialBodyCount = world.bodies.length;

  world.destructionSystem.fractureBody(plank, new Vec2(0, 5), new Vec2(0, 1));

  assert.ok(!world.bodies.includes(plank), 'Urspruengliche Planke wurde aus world.bodies entfernt');
  assert.equal(plank.isBroken, true, 'Planke als gebrochen markiert');

  assert.equal(world.bodies.length, initialBodyCount + 1, '2 neue Bruchstuecke in der Welt vorhanden');

  const shatterEvt = world.destructionSystem.fractureEvents.find(e => e.type === 'body_shatter');
  assert.ok(shatterEvt, 'Bruchereignis body_shatter vorhanden');
  assert.equal(shatterEvt.pieces.length, 2, '2 Bruchstueck-IDs im Event');

  assert.ok(world.destructionSystem.debrisParticles.length > 0, 'Holzsplitter-Partikel wurden erzeugt');
});

test('SubQG Pure: Gelaendefahrzeug landet gedaempft und faehrt stabil (kein Katapultieren)', () => {
  const world = new World({ engineMode: 'pure-subqg', gravity: new Vec2(0, -9.81) });
  DemoScenes.vehicleTerrain(world);
  const chassis = world.bodies.find(b => b.shapes[0] && b.shapes[0].type === 'box' && b.type === 'dynamic');

  for (let i = 0; i < 120; i++) {
    world.step(1.0 / 60.0);

    assert.ok(chassis.position.y < 6.0, `Fahrzeug bleibt bodennah: y=${chassis.position.y.toFixed(2)} < 6.0 m`);
    assert.ok(chassis.velocity.length() < 20.0, `Geschwindigkeit bleibt physikalisch stabil: v=${chassis.velocity.length().toFixed(2)} < 20 m/s`);
  }

  assert.ok(chassis.position.x > -5.0, `Fahrzeug faehrt vorwaerts entlang des Terrains: x=${chassis.position.x.toFixed(2)}`);
});

```

## File: `tests/triggers_and_sensors.test.mjs`  
- Path: `tests/triggers_and_sensors.test.mjs`  
- Size: 1755 Bytes  
- Modified: 2026-11-12 01:34:04 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { World, Vec2 } from '../index.mjs';

test('Triggers: Sensor detektiert Enter, Stay und Exit ohne Stoßwiderstand', () => {
  const world = new World({ gravity: new Vec2(0, 0) });

  const sensor = world.createBox(0, 0, 2, 2, {
    type: 'static',
    isTrigger: true
  });

  const projectile = world.createCircle(-3, 0, 0.5, { type: 'dynamic' });
  projectile.setVelocity(4.0, 0);

  let enterCount = 0;
  let stayCount = 0;
  let exitCount = 0;

  world.addContactListener({
    onTriggerEnter(trigShape, otherShape, trigBody, otherBody) {
      if (trigBody === sensor && otherBody === projectile) enterCount++;
    },
    onTriggerStay(trigShape, otherShape, trigBody, otherBody) {
      if (trigBody === sensor && otherBody === projectile) stayCount++;
    },
    onTriggerExit(trigShape, otherShape, trigBody, otherBody) {
      if (trigBody === sensor && otherBody === projectile) exitCount++;
    }
  });

  for (let i = 0; i < 90; i++) {
    world.step(1.0 / 60.0);
  }

  assert.equal(enterCount, 1, 'onTriggerEnter genau 1x aufgerufen');
  assert.ok(stayCount > 5, `onTriggerStay mehrfach aufgerufen (${stayCount})`);
  assert.equal(exitCount, 1, 'onTriggerExit genau 1x aufgerufen');

  assert.ok(projectile.velocity.x > 3.9, `Geschwindigkeit nach Durchquerung: ${projectile.velocity.x}`);
});

```

## File: `demo/demo_scenes.mjs`  
- Path: `demo/demo_scenes.mjs`  
- Size: 9950 Bytes  
- Modified: 2026-11-12 15:42:20 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import { Vec2, Material, Polygon } from '../index.mjs';

export const DemoScenes = {

  stackingTower(world) {

    world.createBox(0, 0, 40, 1.0, {
      type: 'static',
      material: new Material({ friction: 0.6, restitution: 0.0 })
    });

    for (let i = 0; i < 8; i++) {
      world.createBox(0, 1.0 + i * 1.05, 1.0, 1.0, {
        type: 'dynamic',
        material: new Material({ friction: 0.6, restitution: 0.05 }),
        linearDamping: 0.05,
        angularDamping: 0.05
      });
    }

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4 - row; col++) {
        const x = -8 + col * 1.1 + row * 0.55;
        const y = 1.0 + row * 1.05;
        world.createBox(x, y, 1.0, 1.0, {
          type: 'dynamic',
          material: new Material({ friction: 0.5, restitution: 0.1 })
        });
      }
    }
  },

  bouncingBalls(world) {

    world.createBox(-5, 8, 12, 0.4, {
      type: 'static',
      angle: -0.3,
      material: new Material({ friction: 0.05, restitution: 0.7 })
    });

    world.createBox(5, 5, 12, 0.4, {
      type: 'static',
      angle: 0.3,
      material: new Material({ friction: 0.05, restitution: 0.7 })
    });

    world.createBox(0, 0, 30, 1.0, {
      type: 'static',
      material: new Material({ friction: 0.2, restitution: 0.8 })
    });

    for (let i = 0; i < 12; i++) {
      const x = -9 + (i % 4) * 0.8 + Math.random() * 0.2;
      const y = 12 + Math.floor(i / 4) * 1.2;
      world.createCircle(x, y, 0.3 + Math.random() * 0.2, {
        type: 'dynamic',
        material: new Material({
          density: 1.0,
          friction: 0.1,
          restitution: 0.6 + Math.random() * 0.35
        })
      });
    }
  },

  ropeBridge(world, options = {}) {
    world.createBox(0, 0, 40, 1.0, { type: 'static' });

    const breakable = options.breakable ?? false;
    const breakingForce = breakable ? (options.breakingForce ?? 250) : Infinity;

    const p1 = world.createBox(-8, 5, 1.5, 4, { type: 'static' });
    const p2 = world.createBox(8, 5, 1.5, 4, { type: 'static' });

    const segments = [];
    let prev = p1;
    let prevAnchor = new Vec2(-7.25, 6.8);

    for (let i = 0; i < 12; i++) {
      const x = -6.5 + i * 1.18;
      const sag = 0.5 * (1.0 - (x / 7.0) * (x / 7.0));
      const y = 6.5 - Math.max(0, sag);
      const plank = world.createBox(x, y, 1.1, 0.2, {
        type: 'dynamic',
        isDestructible: breakable,
        fractureForce: 350.0,
        linearDamping: 0.2,
        angularDamping: 0.4,
        material: new Material({ density: 1.2, friction: 0.6, restitution: 0.05 })
      });
      segments.push(plank);

      const anchor = new Vec2(x - 0.55, y);
      world.createRevoluteJoint(prev, plank, anchor, { breakingForce });
      prev = plank;
      prevAnchor = new Vec2(x + 0.55, y);
    }

    world.createRevoluteJoint(prev, p2, new Vec2(7.25, 6.8), { breakingForce });

    world.createCircle(0, 12, 0.8, {
      type: 'dynamic',
      userData: 'Felsblock',
      material: new Material({ density: 4.0, friction: 0.5, restitution: 0.1 })
    });
  },

  ropeBridgeBreakable(world) {
    this.ropeBridge(world, { breakable: true, breakingForce: 250 });
  },

  vehicleTerrain(world) {

    const points = [
      [-20, 3], [-10, 0.5], [0, 0], [10, 1.5], [18, 0.5], [25, 3], [35, 0]
    ];
    for (let i = 0; i < points.length - 1; i++) {
      world.createSegment(points[i][0], points[i][1], points[i+1][0], points[i+1][1], {
        type: 'static',
        material: new Material({ friction: 0.9 })
      });
    }

    const slopeAngle = -0.245;
    const cosA = Math.cos(slopeAngle);
    const sinA = Math.sin(slopeAngle);

    const chassis = world.createBox(-13.0, 1.85, 3.8, 0.4, {
      type: 'dynamic',
      angle: slopeAngle,
      linearDamping: 0.1,
      angularDamping: 1.5,
      material: new Material({ density: 5.0, friction: 0.4 })
    });

    const wheelMat = new Material({ density: 1.5, friction: 1.0, restitution: 0.0 });
    const rearPos = new Vec2(-13.0 - 1.5 * cosA, 1.85 - 1.5 * sinA);
    const frontPos = new Vec2(-13.0 + 1.5 * cosA, 1.85 + 1.5 * sinA);
    const rear = world.createCircle(rearPos.x, rearPos.y, 0.55, { type: 'dynamic', material: wheelMat });
    const front = world.createCircle(frontPos.x, frontPos.y, 0.55, { type: 'dynamic', material: wheelMat });

    world.createRevoluteJoint(chassis, rear, rearPos, {
      enableMotor: true,
      motorSpeed: -12.0,
      maxMotorTorque: 6.0
    });
    world.createRevoluteJoint(chassis, front, frontPos, {
      enableMotor: true,
      motorSpeed: -12.0,
      maxMotorTorque: 28.0
    });
  },

  catapult(world) {
    world.createBox(0, 0, 80, 1.0, { type: 'static' });

    const base = world.createBox(-12.0, 1.6, 3.2, 2.0, {
      type: 'dynamic',
      linearDamping: 0.3,
      angularDamping: 1.0,
      userData: 'Katapult-Fahrgestell (Verschiebbar)',
      material: new Material({ density: 10.0, friction: 0.9 })
    });
    base.invInertia = 0;

    const arm = world.createBox(-14.5, 2.4, 5.0, 0.35, {
      type: 'dynamic',
      userData: 'Katapult-Arm',
      material: new Material({ density: 1.0, friction: 0.4 })
    });

    const cup = world.createBox(-16.9, 2.8, 0.4, 0.8, {
      type: 'dynamic',
      userData: 'Katapult-Schale',
      material: new Material({ density: 0.8, friction: 0.2 })
    });
    world.createWeldJoint(arm, cup, new Vec2(-16.9, 2.4));

    const catapultJoint = world.createRevoluteJoint(base, arm, new Vec2(-12.0, 2.4), {
      enableMotor: false,
      motorSpeed: -16.0,
      maxMotorTorque: 3500.0,
      enableLimit: true,
      lowerAngle: -Math.PI * 0.75,
      upperAngle: Math.PI * 0.1
    });

    world.createCircle(-16.3, 3.1, 0.45, {
      type: 'dynamic',
      isDestructible: true,
      fractureForce: 400.0,
      userData: 'Felsblock',
      material: new Material({ density: 4.5, friction: 0.2, restitution: 0.15 })
    });

    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 3; c++) {
        world.createBox(8.0 + c * 0.8, 0.9 + r * 0.8, 0.7, 0.7, {
          type: 'dynamic',
          isDestructible: true,
          fractureForce: 130.0,
          material: new Material({ density: 1.0, friction: 0.6, restitution: 0.05 })
        });
      }
    }

    world.catapultController = {
      joint: catapultJoint,
      arm: arm,
      base: base,
      cup: cup,
      isFired: false,
      fire() {
        catapultJoint.enableMotor = true;
        catapultJoint.motorSpeed = -16.0;
        catapultJoint.maxMotorTorque = 3500.0;
        this.isFired = true;
      },
      reload() {
        catapultJoint.enableMotor = true;
        catapultJoint.motorSpeed = 6.0;
        catapultJoint.maxMotorTorque = 600.0;
        setTimeout(() => {
          catapultJoint.enableMotor = false;
          this.isFired = false;

          world.createCircle(base.position.x - 4.3, base.position.y + 1.4, 0.45, {
            type: 'dynamic',
            isDestructible: true,
            fractureForce: 400.0,
            userData: 'Felsblock',
            material: new Material({ density: 4.5, friction: 0.2, restitution: 0.15 })
          });
        }, 600);
      }
    };
  },

  sensorsAndTrays(world) {
    world.createBox(0, 0, 40, 1.0, { type: 'static' });

    world.createBox(-2, 4, 1.5, 4, { type: 'static' });
    world.createBox(2, 4, 1.5, 4, { type: 'static' });

    const trigger = world.createBox(0, 4, 2.5, 4.0, {
      type: 'static',
      isTrigger: true,
      userData: { name: 'GateSensor' }
    });

    for (let i = 0; i < 5; i++) {
      const b = world.createCircle(-8 - i * 1.5, 2.0, 0.4, {
        type: 'dynamic',
        material: new Material({ friction: 0.1, restitution: 0.5 })
      });
      b.setVelocity(5.0, 0);
    }
  }
};

```

## File: `demo/index.html`  
- Path: `demo/index.html`  
- Size: 19878 Bytes  
- Modified: 2026-11-12 15:33:54 UTC

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SubQG Game Physics Engine - Interactive Sandbox & Laboratory</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0f141d;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    header {
      background: #1a2234;
      border-bottom: 1px solid #2d3748;
      padding: 10px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 10;
    }
    .title-group h1 {
      font-size: 1.15rem;
      font-weight: 700;
      color: #63b3ed;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .badge {
      background: #2b6cb0;
      color: #ebf8ff;
      font-size: 0.7rem;
      padding: 2px 8px;
      border-radius: 9999px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-subqg {
      background: #805ad5;
      color: #faf5ff;
    }
    .controls {
      display: flex;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
    }
    select, button {
      background: #2d3748;
      color: #edf2f7;
      border: 1px solid #4a5568;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.85rem;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
    }
    select:hover, button:hover {
      background: #4a5568;
      border-color: #63b3ed;
    }
    button.btn-primary {
      background: #3182ce;
      border-color: #4299e1;
    }
    button.btn-primary:hover {
      background: #2b6cb0;
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      cursor: pointer;
      user-select: none;
    }
    .checkbox-label input {
      cursor: pointer;
    }
    #main-container {
      display: flex;
      flex: 1;
      position: relative;
      overflow: hidden;
    }
    #canvas-wrap {
      flex: 1;
      position: relative;
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
      background: #090d16;
    }
    #overlay-hud {
      position: absolute;
      top: 15px;
      left: 15px;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 0.8rem;
      line-height: 1.5;
      pointer-events: none;
      min-width: 240px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    }
    .hud-title {
      font-weight: 700;
      color: #90cdf4;
      margin-bottom: 6px;
      border-bottom: 1px solid #334155;
      padding-bottom: 4px;
    }
    .hud-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }
    .hud-val {
      font-family: monospace;
      font-weight: 600;
      color: #68d391;
    }
    .hud-val-subqg {
      color: #d6bcfa;
    }
    #instructions {
      position: absolute;
      bottom: 15px;
      left: 15px;
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid #334155;
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 0.75rem;
      color: #a0aec0;
      pointer-events: none;
    }
    #tool-panel {
      position: absolute;
      top: 15px;
      right: 15px;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .tool-btn {
      width: 100%;
      text-align: left;
    }
  </style>
</head>
<body>

  <header>
    <div class="title-group">
      <h1>
        SubQG Game Physics Engine
        <span class="badge">Production 2D</span>
        <span class="badge badge-subqg">Emergent Subquantum Graphity</span>
      </h1>
    </div>

    <div class="controls">
      <label for="scene-select" style="font-size:0.85rem; color:#a0aec0;">Szene:</label>
      <select id="scene-select">
        <option value="stackingTower">1. Kistenturm & Stapel-Stabilität</option>
        <option value="bouncingBalls">2. Bälle, Rampen & Elastizität</option>
        <option value="ropeBridge">3. Hängebrücke (Tragfähig - Fängt Felsen ab)</option>
        <option value="ropeBridgeBreakable">3b. Hängebrücke (Zerstörbar - Reißt & Zersplittert bei 450 N)</option>
        <option value="vehicleTerrain">4. Motorisiertes Geländefahrzeug</option>
        <option value="catapult">5. Katapult & Trebuchet</option>
        <option value="sensorsAndTrays">6. Sensor-Radar & Triggers</option>
      </select>

      <label style="display:flex; align-items:center; gap:6px; font-size:0.85rem; font-weight:600; color:#cbd5e1;">
        <span>Physik-Modus:</span>
        <select id="engine-mode-select" style="background:#1e293b; color:#63b3ed; font-weight:700; border:1px solid #3182ce; border-radius:6px; padding:4px 8px;">
          <option value="hybrid" selected>⚡ Hybrid-Modus (SubQG Metrikgitter + Impulssolver - Empfohlen für Spiele)</option>
          <option value="pure-subqg">★ SubQG Pure (100% First-Principles - Kantenbarriere ohne Impulssolver)</option>
        </select>
      </label>

      <button id="btn-reset" class="btn-primary">Neu starten</button>
      <button id="btn-fire-catapult" style="display:none; background:#e53e3e; color:white; font-weight:700; padding:5px 12px; border-radius:6px; border:none; cursor:pointer; box-shadow:0 0 8px rgba(229,62,62,0.6);">🚀 Katapult abfeuern (Leertaste)</button>
      <button id="btn-reload-catapult" style="display:none; background:#4a5568; color:white; font-weight:700; padding:5px 10px; border-radius:6px; border:none; cursor:pointer;">🔄 Nachladen</button>

      <label class="checkbox-label" title="Aktiviert Materialbruch bei definierter Belastungsgrenze">
        <input type="checkbox" id="chk-breakable" checked>
        <span style="color:#f6ad55; font-weight:600;">Materialbruch</span>
      </label>

      <label class="checkbox-label" title="Schaltet die visuelle Anzeige des internen SubQG-Kantennetzwerks ein">
        <input type="checkbox" id="chk-subqg" checked>
        <span style="color:#d6bcfa; font-weight:600;">SubQG Gitter</span>
      </label>

      <label class="checkbox-label">
        <input type="checkbox" id="chk-gravity" checked>
        <span>Gravitation</span>
      </label>

      <label class="checkbox-label">
        <input type="checkbox" id="chk-contacts" checked>
        <span>Kontakte</span>
      </label>
    </div>
  </header>

  <div id="main-container">
    <div id="canvas-wrap">
      <canvas id="physics-canvas"></canvas>

      <div id="overlay-hud">
        <div class="hud-title">LIVE TELEMETRIE & SUBQG AUDIT</div>
        <div class="hud-row"><span>Physik-Modus:</span><span id="hud-mode" class="hud-val" style="color:#d6bcfa; font-weight:700;">PURE SUBQG (100%)</span></div>
        <div class="hud-row"><span>Kontakt-Solver:</span><span id="hud-contact-solver" class="hud-val" style="color:#68d391;">0 (Pure SubQG)</span></div>
        <div class="hud-row"><span>Gelenk-Solver:</span><span id="hud-joint-solver" class="hud-val" style="color:#63b3ed;">0 Aufrufe</span></div>
        <div class="hud-row"><span>FPS:</span><span id="hud-fps" class="hud-val">60</span></div>
        <div class="hud-row"><span>Körper (Bodies):</span><span id="hud-bodies" class="hud-val">0</span></div>
        <div class="hud-row"><span>Gelenke (Joints):</span><span id="hud-joints" class="hud-val">0 intakt</span></div>
        <div class="hud-row"><span>Material-Status:</span><span id="hud-material" class="hud-val" style="color:#68d391;">Intakt</span></div>
        <div class="hud-row"><span>Aktive Kontakte:</span><span id="hud-contacts" class="hud-val">0</span></div>
        <div class="hud-row"><span>Schlafend (Sleeping):</span><span id="hud-sleeping" class="hud-val">0</span></div>
        <div class="hud-row"><span>Kinetische Energie:</span><span id="hud-energy" class="hud-val">0 J</span></div>
        <div style="margin: 6px 0 4px; border-top: 1px dashed #4a5568;"></div>
        <div class="hud-row"><span style="color:#d6bcfa;">SubQG Kantenwirkung:</span><span id="hud-action" class="hud-val hud-val-subqg">0.00</span></div>
        <div class="hud-row"><span style="color:#d6bcfa;">Max. Kantenverzerrung:</span><span id="hud-strain" class="hud-val hud-val-subqg">0.00%</span></div>
        <div class="hud-row"><span style="color:#d6bcfa;">Relationale Kanten:</span><span id="hud-edges" class="hud-val hud-val-subqg">0</span></div>
      </div>

      <div id="tool-panel">
        <div style="font-size:0.75rem; color:#90cdf4; font-weight:700; margin-bottom:2px;">SPAWN OBJEKTE</div>
        <button class="tool-btn" id="btn-spawn-box">+ Kiste (Holz)</button>
        <button class="tool-btn" id="btn-spawn-ball">+ Ball (Gummi)</button>
        <button class="tool-btn" id="btn-spawn-boulder">+ Felsblock (Schwer)</button>
        <button class="tool-btn" id="btn-spawn-capsule">+ Kapsel</button>
      </div>

      <div id="instructions">
        <strong>Bedienung:</strong> Linksklick & Ziehen = Körper greifen & werfen | Rechtsklick & Ziehen = Laser-Raycast | Mausrad = Zoom
      </div>
    </div>
  </div>

  <script type="module">
    import { World, Vec2, Material, CanvasRenderer, SubQGInspector } from '../index.mjs';
    import { DemoScenes } from './demo_scenes.mjs';

    const canvas = document.getElementById('physics-canvas');
    let world, renderer, inspector;
    let dragBody = null;
    let dragLocalAnchor = new Vec2();
    let rightClickRayStart = null;
    let mousePosWorld = new Vec2();

    function resizeCanvas() {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function loadScene(sceneKey) {
      const mode = document.getElementById('engine-mode-select').value;
      world = new World({
        engineMode: mode,
        gravity: document.getElementById('chk-gravity').checked ? new Vec2(0, -9.81) : new Vec2(0, 0),
        enableSubQGLattice: true,
        velocityIterations: 10
      });

      renderer = new CanvasRenderer(canvas, world, {
        scale: 32.0,
        camera: new Vec2(0, 5),
        showSubQGLattice: document.getElementById('chk-subqg').checked,
        showContacts: document.getElementById('chk-contacts').checked
      });

      inspector = new SubQGInspector(world);

      const breakable = document.getElementById('chk-breakable').checked;
      if (sceneKey === 'ropeBridge') {
        DemoScenes.ropeBridge(world, { breakable: false });
      } else if (sceneKey === 'ropeBridgeBreakable') {
        DemoScenes.ropeBridge(world, { breakable: true, breakingForce: 450 });
      } else if (DemoScenes[sceneKey]) {
        DemoScenes[sceneKey](world);
      }

      // Zeige Katapult-Steuerung nur in Szene 5
      const isCatapult = sceneKey === 'catapult';
      document.getElementById('btn-fire-catapult').style.display = isCatapult ? 'inline-block' : 'none';
      document.getElementById('btn-reload-catapult').style.display = isCatapult ? 'inline-block' : 'none';
    }

    const sceneSelect = document.getElementById('scene-select');
    const modeSelect = document.getElementById('engine-mode-select');
    sceneSelect.addEventListener('change', () => loadScene(sceneSelect.value));
    modeSelect.addEventListener('change', () => loadScene(sceneSelect.value));
    document.getElementById('btn-reset').addEventListener('click', () => loadScene(sceneSelect.value));

    // Katapult Manuelle Steuerung
    document.getElementById('btn-fire-catapult').addEventListener('click', () => {
      if (world.catapultController) world.catapultController.fire();
    });
    document.getElementById('btn-reload-catapult').addEventListener('click', () => {
      if (world.catapultController) world.catapultController.reload();
    });
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && sceneSelect.value === 'catapult') {
        e.preventDefault();
        if (world.catapultController) world.catapultController.fire();
      }
    });

    document.getElementById('chk-breakable').addEventListener('change', () => {
      const curScene = sceneSelect.value;
      if (curScene === 'ropeBridge' || curScene === 'ropeBridgeBreakable') {
        loadScene(document.getElementById('chk-breakable').checked ? 'ropeBridgeBreakable' : 'ropeBridge');
      }
    });

    document.getElementById('chk-subqg').addEventListener('change', (e) => {
      renderer.showSubQGLattice = e.target.checked;
    });

    document.getElementById('chk-contacts').addEventListener('change', (e) => {
      renderer.showContacts = e.target.checked;
    });

    document.getElementById('chk-gravity').addEventListener('change', (e) => {
      world.setGravity(0, e.target.checked ? -9.81 : 0);
      for (const b of world.bodies) b.wakeUp();
    });

    // Spawning Buttons - Alle 4 Materialien besitzen vollaktive Destruction Physics!
    document.getElementById('btn-spawn-box').addEventListener('click', () => {
      world.createBox(renderer.camera.x + (Math.random() - 0.5) * 2, renderer.camera.y + 6, 1.0, 1.0, {
        isDestructible: true,
        fractureForce: 150.0,
        userData: 'Kiste (Holz)',
        material: Material.wood()
      });
    });

    document.getElementById('btn-spawn-ball').addEventListener('click', () => {
      world.createCircle(renderer.camera.x + (Math.random() - 0.5) * 2, renderer.camera.y + 6, 0.5, {
        isDestructible: true,
        fractureForce: 450.0,
        userData: 'Ball (Gummi)',
        material: Material.rubber()
      });
    });

    document.getElementById('btn-spawn-boulder').addEventListener('click', () => {
      world.createCircle(renderer.camera.x + (Math.random() - 0.5) * 2, renderer.camera.y + 6, 0.8, {
        isDestructible: true,
        fractureForce: 400.0,
        userData: 'Felsblock',
        material: new Material({ density: 8.0, friction: 0.6, restitution: 0.05 })
      });
    });

    document.getElementById('btn-spawn-capsule').addEventListener('click', () => {
      world.createCapsule(renderer.camera.x + (Math.random() - 0.5) * 2, renderer.camera.y + 6, 1.4, 0.35, {
        isDestructible: true,
        fractureForce: 180.0,
        userData: 'Kapsel',
        material: Material.wood()
      });
    });

    // Mouse Interactions (Pick & Drag / Laser Raycast)
    canvas.addEventListener('mousedown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const wPos = renderer.screenToWorld(sx, sy);

      if (e.button === 0) { // Linksklick: Drag
        const hits = world.queryPoint(wPos);
        if (hits.length > 0) {
          const hit = hits[hits.length - 1];
          if (hit.body.type === 'dynamic') {
            dragBody = hit.body;
            dragLocalAnchor = dragBody.transform.inverseTransformPoint(wPos);
            dragBody.wakeUp();
          }
        }
      } else if (e.button === 2) { // Rechtsklick: Raycast
        rightClickRayStart = wPos.clone();
      }
    });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      mousePosWorld = renderer.screenToWorld(sx, sy);
    });

    window.addEventListener('mouseup', () => {
      dragBody = null;
      rightClickRayStart = null;
    });

    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      renderer.scale = Math.max(10.0, Math.min(100.0, renderer.scale * zoomFactor));
    });

    // Initial Scene
    loadScene('stackingTower');

    // Main Game Loop
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTime = 0;

    function loop(time) {
      const dt = Math.min(0.033, (time - lastTime) / 1000.0);
      lastTime = time;

      // Maus-Drag-Federkraft anwenden
      if (dragBody) {
        const targetWorld = mousePosWorld;
        const currentWorld = dragBody.transform.transformPoint(dragLocalAnchor);
        const delta = Vec2.sub(targetWorld, currentWorld);
        const springK = 150.0;
        const dampingK = 20.0;
        const fSpring = Vec2.scale(delta, springK * dragBody.mass);
        const vAtPoint = dragBody.getVelocityAtPoint(currentWorld);
        const fDamping = Vec2.scale(vAtPoint, dampingK * dragBody.mass);
        const fTotal = Vec2.sub(fSpring, fDamping);

        dragBody.applyForceAtPoint(fTotal, currentWorld);
      }

      // Rechtsklick Laser-Raycast
      if (rightClickRayStart) {
        const dir = Vec2.sub(mousePosWorld, rightClickRayStart);
        const len = dir.length();
        if (len > 0.05) {
          const hit = world.raycast(rightClickRayStart, dir.clone().normalize(), len);
          renderer.addDebugRay({ origin: rightClickRayStart, direction: dir.normalize(), maxDistance: len }, hit);
        }
      }

      // Physikschritt
      world.step(1.0 / 60.0);

      // Rendern
      renderer.render(dt);

      // HUD Telemetrie aktualisieren
      frameCount++;
      fpsTime += dt;
      if (fpsTime >= 0.25) {
        const fps = Math.round(frameCount / fpsTime);
        document.getElementById('hud-fps').textContent = fps;
        frameCount = 0;
        fpsTime = 0;

        const isPure = world.engineMode === 'pure-subqg';
        const modeEl = document.getElementById('hud-mode');
        modeEl.textContent = isPure ? 'PURE SUBQG (100%)' : 'HYBRID';
        modeEl.style.color = isPure ? '#d6bcfa' : '#63b3ed';

        const contactCalls = isPure ? '0 (Pure SubQG)' : world.contactSolverCalls + ' Aufrufe';
        const contactEl = document.getElementById('hud-contact-solver');
        contactEl.textContent = contactCalls;
        contactEl.style.color = isPure ? '#68d391' : '#f6ad55';

        const jointEl = document.getElementById('hud-joint-solver');
        jointEl.textContent = world.jointSolverCalls + ' Aufrufe';

        const jointsEl = document.getElementById('hud-joints');
        jointsEl.textContent = world.joints.length + ' intakt';

        const matEl = document.getElementById('hud-material');
        if (world.brokenJointsCount > 0) {
          matEl.textContent = 'BRUCH (' + world.brokenJointsCount + ' gerissen)';
          matEl.style.color = '#fc8181';
        } else {
          matEl.textContent = 'Intakt';
          matEl.style.color = '#68d391';
        }

        let sleepingCount = 0;
        for (const b of world.bodies) if (b.isSleeping) sleepingCount++;

        const audit = inspector.computeFullEnergyAudit();
        document.getElementById('hud-bodies').textContent = world.bodies.length;
        document.getElementById('hud-contacts').textContent = world.contactManifolds.size;
        document.getElementById('hud-sleeping').textContent = sleepingCount;
        document.getElementById('hud-energy').textContent = audit.kineticEnergy.toFixed(1) + ' J';

        document.getElementById('hud-action').textContent = audit.subqgEdgeAction.toFixed(3);
        document.getElementById('hud-strain').textContent = (audit.maxMetricStrain * 100.0).toFixed(2) + '%';
        document.getElementById('hud-edges').textContent = audit.activeEdges;
      }

      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  </script>
</body>
</html>

```

## File: `demo/standalone_demo.html`  
- Path: `demo/standalone_demo.html`  
- Size: 189665 Bytes  
- Modified: 2026-11-12 15:42:52 UTC  
- Condensed: comments and repeated blank lines reduced

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SubQG Game Physics Engine - Interactive Sandbox & Laboratory</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0f141d;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    header {
      background: #1a2234;
      border-bottom: 1px solid #2d3748;
      padding: 10px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 10;
    }
    .title-group h1 {
      font-size: 1.15rem;
      font-weight: 700;
      color: #63b3ed;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .badge {
      background: #2b6cb0;
      color: #ebf8ff;
      font-size: 0.7rem;
      padding: 2px 8px;
      border-radius: 9999px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-subqg {
      background: #805ad5;
      color: #faf5ff;
    }
    .controls {
      display: flex;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
    }
    select, button {
      background: #2d3748;
      color: #edf2f7;
      border: 1px solid #4a5568;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.85rem;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
    }
    select:hover, button:hover {
      background: #4a5568;
      border-color: #63b3ed;
    }
    button.btn-primary {
      background: #3182ce;
      border-color: #4299e1;
    }
    button.btn-primary:hover {
      background: #2b6cb0;
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      cursor: pointer;
      user-select: none;
    }
    .checkbox-label input {
      cursor: pointer;
    }
    #main-container {
      display: flex;
      flex: 1;
      position: relative;
      overflow: hidden;
    }
    #canvas-wrap {
      flex: 1;
      position: relative;
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
      background: #090d16;
    }
    #overlay-hud {
      position: absolute;
      top: 15px;
      left: 15px;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 0.8rem;
      line-height: 1.5;
      pointer-events: none;
      min-width: 240px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    }
    .hud-title {
      font-weight: 700;
      color: #90cdf4;
      margin-bottom: 6px;
      border-bottom: 1px solid #334155;
      padding-bottom: 4px;
    }
    .hud-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }
    .hud-val {
      font-family: monospace;
      font-weight: 600;
      color: #68d391;
    }
    .hud-val-subqg {
      color: #d6bcfa;
    }
    #instructions {
      position: absolute;
      bottom: 15px;
      left: 15px;
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid #334155;
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 0.75rem;
      color: #a0aec0;
      pointer-events: none;
    }
    #tool-panel {
      position: absolute;
      top: 15px;
      right: 15px;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .tool-btn {
      width: 100%;
      text-align: left;
    }
  </style>
</head>
<body>

  <header>
    <div class="title-group">
      <h1>
        SubQG Game Physics Engine
        <span class="badge">Production 2D</span>
        <span class="badge badge-subqg">Emergent Subquantum Graphity</span>
      </h1>
    </div>

    <div class="controls">
      <label for="scene-select" style="font-size:0.85rem; color:#a0aec0;">Szene:</label>
      <select id="scene-select">
        <option value="stackingTower">1. Kistenturm & Stapel-Stabilität</option>
        <option value="bouncingBalls">2. Bälle, Rampen & Elastizität</option>
        <option value="ropeBridge">3. Hängebrücke (Tragfähig - Fängt Felsen ab)</option>
        <option value="ropeBridgeBreakable">3b. Hängebrücke (Zerstörbar - Reißt & Zersplittert bei 450 N)</option>
        <option value="vehicleTerrain">4. Motorisiertes Geländefahrzeug</option>
        <option value="catapult">5. Katapult & Trebuchet</option>
        <option value="sensorsAndTrays">6. Sensor-Radar & Triggers</option>
      </select>

      <label style="display:flex; align-items:center; gap:6px; font-size:0.85rem; font-weight:600; color:#cbd5e1;">
        <span>Physik-Modus:</span>
        <select id="engine-mode-select" style="background:#1e293b; color:#63b3ed; font-weight:700; border:1px solid #3182ce; border-radius:6px; padding:4px 8px;">
          <option value="hybrid" selected>⚡ Hybrid-Modus (SubQG Metrikgitter + Impulssolver - Empfohlen für Spiele)</option>
          <option value="pure-subqg">★ SubQG Pure (100% First-Principles - Kantenbarriere ohne Impulssolver)</option>
        </select>
      </label>

      <button id="btn-reset" class="btn-primary">Neu starten</button>
      <button id="btn-fire-catapult" style="display:none; background:#e53e3e; color:white; font-weight:700; padding:5px 12px; border-radius:6px; border:none; cursor:pointer; box-shadow:0 0 8px rgba(229,62,62,0.6);">🚀 Katapult abfeuern (Leertaste)</button>
      <button id="btn-reload-catapult" style="display:none; background:#4a5568; color:white; font-weight:700; padding:5px 10px; border-radius:6px; border:none; cursor:pointer;">🔄 Nachladen</button>

      <label class="checkbox-label" title="Aktiviert Materialbruch bei definierter Belastungsgrenze">
        <input type="checkbox" id="chk-breakable" checked>
        <span style="color:#f6ad55; font-weight:600;">Materialbruch</span>
      </label>

      <label class="checkbox-label" title="Schaltet die visuelle Anzeige des internen SubQG-Kantennetzwerks ein">
        <input type="checkbox" id="chk-subqg" checked>
        <span style="color:#d6bcfa; font-weight:600;">SubQG Gitter</span>
      </label>

      <label class="checkbox-label">
        <input type="checkbox" id="chk-gravity" checked>
        <span>Gravitation</span>
      </label>

      <label class="checkbox-label">
        <input type="checkbox" id="chk-contacts" checked>
        <span>Kontakte</span>
      </label>
    </div>
  </header>

  <div id="main-container">
    <div id="canvas-wrap">
      <canvas id="physics-canvas"></canvas>

      <div id="overlay-hud">
        <div class="hud-title">LIVE TELEMETRIE & SUBQG AUDIT</div>
        <div class="hud-row"><span>Physik-Modus:</span><span id="hud-mode" class="hud-val" style="color:#d6bcfa; font-weight:700;">PURE SUBQG (100%)</span></div>
        <div class="hud-row"><span>Kontakt-Solver:</span><span id="hud-contact-solver" class="hud-val" style="color:#68d391;">0 (Pure SubQG)</span></div>
        <div class="hud-row"><span>Gelenk-Solver:</span><span id="hud-joint-solver" class="hud-val" style="color:#63b3ed;">0 Aufrufe</span></div>
        <div class="hud-row"><span>FPS:</span><span id="hud-fps" class="hud-val">60</span></div>
        <div class="hud-row"><span>Körper (Bodies):</span><span id="hud-bodies" class="hud-val">0</span></div>
        <div class="hud-row"><span>Gelenke (Joints):</span><span id="hud-joints" class="hud-val">0 intakt</span></div>
        <div class="hud-row"><span>Material-Status:</span><span id="hud-material" class="hud-val" style="color:#68d391;">Intakt</span></div>
        <div class="hud-row"><span>Aktive Kontakte:</span><span id="hud-contacts" class="hud-val">0</span></div>
        <div class="hud-row"><span>Schlafend (Sleeping):</span><span id="hud-sleeping" class="hud-val">0</span></div>
        <div class="hud-row"><span>Kinetische Energie:</span><span id="hud-energy" class="hud-val">0 J</span></div>
        <div style="margin: 6px 0 4px; border-top: 1px dashed #4a5568;"></div>
        <div class="hud-row"><span style="color:#d6bcfa;">SubQG Kantenwirkung:</span><span id="hud-action" class="hud-val hud-val-subqg">0.00</span></div>
        <div class="hud-row"><span style="color:#d6bcfa;">Max. Kantenverzerrung:</span><span id="hud-strain" class="hud-val hud-val-subqg">0.00%</span></div>
        <div class="hud-row"><span style="color:#d6bcfa;">Relationale Kanten:</span><span id="hud-edges" class="hud-val hud-val-subqg">0</span></div>
      </div>

      <div id="tool-panel">
        <div style="font-size:0.75rem; color:#90cdf4; font-weight:700; margin-bottom:2px;">SPAWN OBJEKTE</div>
        <button class="tool-btn" id="btn-spawn-box">+ Kiste (Holz)</button>
        <button class="tool-btn" id="btn-spawn-ball">+ Ball (Gummi)</button>
        <button class="tool-btn" id="btn-spawn-boulder">+ Felsblock (Schwer)</button>
        <button class="tool-btn" id="btn-spawn-capsule">+ Kapsel</button>
      </div>

      <div id="instructions">
        <strong>Bedienung:</strong> Linksklick & Ziehen = Körper greifen & werfen | Rechtsklick & Ziehen = Laser-Raycast | Mausrad = Zoom
      </div>
    </div>
  </div>

<script>

// --- src/math/MathUtils.mjs ---
/**
 * Mathematische Hilfsfunktionen und physikalische Konstanten
 */
const EPSILON = 1e-9;
const DEG2RAD = Math.PI / 180.0;
const RAD2DEG = 180.0 / Math.PI;

function clamp(val, min, max) {
  if (val < min) return min;
  if (val > max) return max;
  return val;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function sign(x) {
  return x >= 0 ? 1 : -1;
}

function normalizeAngle(angle) {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
}

function isApproxZero(val, eps = 1e-6) {
  return Math.abs(val) <= eps;
}

// --- src/math/Vec2.mjs ---
/**
 * Vec2: Hochperformante 2D Vektorklasse für SubQG Game Physics.
 */
class Vec2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  copy(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  clone() {
    return new Vec2(this.x, this.y);
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  scale(s) {
    this.x *= s;
    this.y *= s;
    return this;
  }

  addScaled(v, s) {
    this.x += v.x * s;
    this.y += v.y * s;
    return this;
  }

  subScaled(v, s) {
    this.x -= v.x * s;
    this.y -= v.y * s;
    return this;
  }

  negate() {
    this.x = -this.x;
    this.y = -this.y;
    return this;
  }

  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  /**
   * 2D Kreuzprodukt mit anderem Vektor ergibt Skalar (z-Komponente): a.x * b.y - a.y * b.x
   */
  cross(v) {
    return this.x * v.y - this.y * v.x;
  }

  /**
   * Kreuzprodukt aus Skalar und Vektor: s x v = (-s * v.y, s * v.x)
   */
  crossScalar(s) {
    return new Vec2(-s * this.y, s * this.x);
  }

  lengthSq() {
    return this.x * this.x + this.y * this.y;
  }

  length() {
    return Math.hypot(this.x, this.y);
  }

  normalize() {
    const len = this.length();
    if (len > 1e-12) {
      const inv = 1.0 / len;
      this.x *= inv;
      this.y *= inv;
    } else {
      this.x = 0;
      this.y = 0;
    }
    return this;
  }

  perp() {
    // 90 Grad links herum
    return new Vec2(-this.y, this.x);
  }

  distanceToSq(v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return dx * dx + dy * dy;
  }

  distanceTo(v) {
    return Math.hypot(this.x - v.x, this.y - v.y);
  }

  rotate(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const x = this.x * c - this.y * s;
    const y = this.x * s + this.y * c;
    this.x = x;
    this.y = y;
    return this;
  }

  // Statische Utility-Methoden
  static zero() {
    return new Vec2(0, 0);
  }

  static add(a, b) {
    return new Vec2(a.x + b.x, a.y + b.y);
  }

  static sub(a, b) {
    return new Vec2(a.x - b.x, a.y - b.y);
  }

  static scale(v, s) {
    return new Vec2(v.x * s, v.y * s);
  }

  static dot(a, b) {
    return a.x * b.x + a.y * b.y;
  }

  static cross(a, b) {
    return a.x * b.y - a.y * b.x;
  }

  static crossScalarVec(s, v) {
    return new Vec2(-s * v.y, s * v.x);
  }

  static crossVecScalar(v, s) {
    return new Vec2(s * v.y, -s * v.x);
  }

  static distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  static distanceSq(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  }

  static lerp(a, b, t) {
    return new Vec2(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
  }
}

// --- src/math/Mat22.mjs ---

/**
 * Mat22: 2x2 Matrix für Rotationen, effektive Massen und Trägheitstransformationen.
 * Spaltenbasiert: [c1.x c2.x]
 *                 [c1.y c2.y]
 */
class Mat22 {
  constructor(c1 = new Vec2(1, 0), c2 = new Vec2(0, 1)) {
    this.c1 = c1.clone();
    this.c2 = c2.clone();
  }

  set(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    this.c1.x = c;  this.c2.x = -s;
    this.c1.y = s;  this.c2.y = c;
    return this;
  }

  setElements(m00, m01, m10, m11) {
    this.c1.x = m00; this.c2.x = m01;
    this.c1.y = m10; this.c2.y = m11;
    return this;
  }

  copy(m) {
    this.c1.copy(m.c1);
    this.c2.copy(m.c2);
    return this;
  }

  mulVec(v) {
    return new Vec2(
      this.c1.x * v.x + this.c2.x * v.y,
      this.c1.y * v.x + this.c2.y * v.y
    );
  }

  mulMat(m) {
    return new Mat22(
      this.mulVec(m.c1),
      this.mulVec(m.c2)
    );
  }

  transpose() {
    const tmp = this.c1.y;
    this.c1.y = this.c2.x;
    this.c2.x = tmp;
    return this;
  }

  invert() {
    const a = this.c1.x, b = this.c2.x;
    const c = this.c1.y, d = this.c2.y;
    let det = a * d - b * c;
    if (Math.abs(det) < 1e-12) {
      det = 1e-12;
    }
    const invDet = 1.0 / det;
    this.c1.x =  d * invDet;
    this.c2.x = -b * invDet;
    this.c1.y = -c * invDet;
    this.c2.y =  a * invDet;
    return this;
  }

  /**
   * Löst lineares Gleichungssystem M * x = b
   */
  solve(b) {
    const a = this.c1.x, c = this.c2.x;
    const d = this.c1.y, e = this.c2.y;
    let det = a * e - c * d;
    if (Math.abs(det) < 1e-12) {
      det = 1e-12;
    }
    const invDet = 1.0 / det;
    return new Vec2(
      (e * b.x - c * b.y) * invDet,
      (a * b.y - d * b.x) * invDet
    );
  }

  static fromAngle(angle) {
    return new Mat22().set(angle);
  }
}

// --- src/math/Transform.mjs ---

/**
 * Transform: Starre Koordinatentransformation (Position + Rotation)
 * Cacht cos und sin für maximale Performance ohne redundante Trigonometrie.
 */
class Transform {
  constructor(position = new Vec2(0, 0), angle = 0) {
    this.position = position.clone();
    this.angle = angle;
    this.c = Math.cos(angle);
    this.s = Math.sin(angle);
  }

  set(pos, angle) {
    this.position.copy(pos);
    this.angle = angle;
    this.c = Math.cos(angle);
    this.s = Math.sin(angle);
    return this;
  }

  copy(t) {
    this.position.copy(t.position);
    this.angle = t.angle;
    this.c = t.c;
    this.s = t.s;
    return this;
  }

  clone() {
    return new Transform(this.position, this.angle);
  }

  setAngle(angle) {
    this.angle = angle;
    this.c = Math.cos(angle);
    this.s = Math.sin(angle);
    return this;
  }

  /**
   * Lokal zu Weltpunkt: T * p = R * p + position
   */
  transformPoint(p) {
    return new Vec2(
      this.position.x + (this.c * p.x - this.s * p.y),
      this.position.y + (this.s * p.x + this.c * p.y)
    );
  }

  /**
   * Lokal zu Weltvektor (nur Rotation): R * v
   */
  transformVector(v) {
    return new Vec2(
      this.c * v.x - this.s * v.y,
      this.s * v.x + this.c * v.y
    );
  }

  /**
   * Welt- zu Lokalpunkt: R^T * (p - position)
   */
  inverseTransformPoint(p) {
    const dx = p.x - this.position.x;
    const dy = p.y - this.position.y;
    return new Vec2(
      this.c * dx + this.s * dy,
      -this.s * dx + this.c * dy
    );
  }

  /**
   * Welt- zu Lokalvektor: R^T * v
   */
  inverseTransformVector(v) {
    return new Vec2(
      this.c * v.x + this.s * v.y,
      -this.s * v.x + this.c * v.y
    );
  }
}

// --- src/math/AABB.mjs ---

/**
 * AABB: Achsenparallele Bounding Box für Broadphase-Prüfungen & Raycasts.
 */
class AABB {
  constructor(min = new Vec2(Infinity, Infinity), max = new Vec2(-Infinity, -Infinity)) {
    this.min = min.clone();
    this.max = max.clone();
  }

  set(min, max) {
    this.min.copy(min);
    this.max.copy(max);
    return this;
  }

  copy(aabb) {
    this.min.copy(aabb.min);
    this.max.copy(aabb.max);
    return this;
  }

  clone() {
    return new AABB(this.min, this.max);
  }

  reset() {
    this.min.set(Infinity, Infinity);
    this.max.set(-Infinity, -Infinity);
    return this;
  }

  expand(margin) {
    this.min.x -= margin;
    this.min.y -= margin;
    this.max.x += margin;
    this.max.y += margin;
    return this;
  }

  expandByVec(v) {
    if (v.x < 0) this.min.x += v.x;
    else this.max.x += v.x;
    if (v.y < 0) this.min.y += v.y;
    else this.max.y += v.y;
    return this;
  }

  combine(other) {
    this.min.x = Math.min(this.min.x, other.min.x);
    this.min.y = Math.min(this.min.y, other.min.y);
    this.max.x = Math.max(this.max.x, other.max.x);
    this.max.y = Math.max(this.max.y, other.max.y);
    return this;
  }

  containsPoint(p) {
    return (
      p.x >= this.min.x &&
      p.x <= this.max.x &&
      p.y >= this.min.y &&
      p.y <= this.max.y
    );
  }

  containsAABB(other) {
    return (
      this.min.x <= other.min.x &&
      this.min.y <= other.min.y &&
      this.max.x >= other.max.x &&
      this.max.y >= other.max.y
    );
  }

  intersects(other) {
    return !(
      this.max.x < other.min.x ||
      this.min.x > other.max.x ||
      this.max.y < other.min.y ||
      this.min.y > other.max.y
    );
  }

  getCenter() {
    return new Vec2(
      (this.min.x + this.max.x) * 0.5,
      (this.min.y + this.max.y) * 0.5
    );
  }

  getExtents() {
    return new Vec2(
      (this.max.x - this.min.x) * 0.5,
      (this.max.y - this.min.y) * 0.5
    );
  }

  getArea() {
    const w = Math.max(0, this.max.x - this.min.x);
    const h = Math.max(0, this.max.y - this.min.y);
    return w * h;
  }

  getPerimeter() {
    const w = Math.max(0, this.max.x - this.min.x);
    const h = Math.max(0, this.max.y - this.min.y);
    return 2.0 * (w + h);
  }

  static combineArea(a, b) {
    const minX = Math.min(a.min.x, b.min.x);
    const minY = Math.min(a.min.y, b.min.y);
    const maxX = Math.max(a.max.x, b.max.x);
    const maxY = Math.max(a.max.y, b.max.y);
    const w = Math.max(0, maxX - minX);
    const h = Math.max(0, maxY - minY);
    return w * h;
  }

  /**
   * Fast Raycast gegen AABB (Slab-Methode)
   * Gibt { hit: boolean, fraction: number, normal: Vec2 } zurück
   */
  raycast(origin, dir, maxFraction = 1.0) {
    let tmin = 0.0;
    let tmax = maxFraction;
    let normalX = 0;
    let normalY = 0;

    // X-Achse
    if (Math.abs(dir.x) < 1e-12) {
      if (origin.x < this.min.x || origin.x > this.max.x) {
        return { hit: false, fraction: 0, normal: Vec2.zero() };
      }
    } else {
      const invD = 1.0 / dir.x;
      let t1 = (this.min.x - origin.x) * invD;
      let t2 = (this.max.x - origin.x) * invD;
      let sign = -1.0;
      if (t1 > t2) {
        const tmp = t1; t1 = t2; t2 = tmp;
        sign = 1.0;
      }
      if (t1 > tmin) {
        tmin = t1;
        normalX = sign;
        normalY = 0;
      }
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return { hit: false, fraction: 0, normal: Vec2.zero() };
    }

    // Y-Achse
    if (Math.abs(dir.y) < 1e-12) {
      if (origin.y < this.min.y || origin.y > this.max.y) {
        return { hit: false, fraction: 0, normal: Vec2.zero() };
      }
    } else {
      const invD = 1.0 / dir.y;
      let t1 = (this.min.y - origin.y) * invD;
      let t2 = (this.max.y - origin.y) * invD;
      let sign = -1.0;
      if (t1 > t2) {
        const tmp = t1; t1 = t2; t2 = tmp;
        sign = 1.0;
      }
      if (t1 > tmin) {
        tmin = t1;
        normalX = 0;
        normalY = sign;
      }
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return { hit: false, fraction: 0, normal: Vec2.zero() };
    }

    return {
      hit: true,
      fraction: tmin,
      point: new Vec2(origin.x + dir.x * tmin, origin.y + dir.y * tmin),
      normal: new Vec2(normalX, normalY)
    };
  }
}

// --- src/dynamics/Material.mjs ---
/**
 * Material: Definiert physikalische Oberflächen- und Masseneigenschaften
 */
class Material {
  constructor(config = {}) {
    this.density = config.density ?? 1.0;       // Dichte in kg/m2 (für 2D)
    this.friction = config.friction ?? 0.3;     // Reibungskoeffizient mu (0.0 = reibungsfrei, 1.0 = hoch)
    this.restitution = config.restitution ?? 0.2; // Elastizität / Rückprall (0.0 = unelastisch, 1.0 = perfekt elastisch)
  }

  static default() {
    return new Material({ density: 1.0, friction: 0.3, restitution: 0.2 });
  }

  static wood() {
    return new Material({ density: 0.7, friction: 0.4, restitution: 0.15 });
  }

  static metal() {
    return new Material({ density: 7.8, friction: 0.2, restitution: 0.1 });
  }

  static rubber() {
    return new Material({ density: 1.2, friction: 0.8, restitution: 0.85 });
  }

  static ice() {
    return new Material({ density: 0.9, friction: 0.05, restitution: 0.1 });
  }

  static bouncy() {
    return new Material({ density: 1.0, friction: 0.2, restitution: 0.95 });
  }

  static stone() {
    return new Material({ density: 2.5, friction: 0.6, restitution: 0.05 });
  }
}

// --- src/collision/shapes/Shape.mjs ---

/**
 * Shape: Abstrakte Basisklasse für alle geometrischen Kollisionsformen.
 */
class Shape {
  constructor(type = 'shape') {
    this.type = type;
    this.material = Material.default();
    this.isTrigger = false; // Sensor / Trigger: detektiert Überlappungen ohne physischen Stoß
    this.body = null;       // Zugehöriger RigidBody
    this.offset = new Vec2(0, 0); // Lokaler Versatz zum Schwerpunkt
  }

  setMaterial(material) {
    this.material = material;
    if (this.body) this.body._recomputeMassData();
    return this;
  }

  setTrigger(isTrigger) {
    this.isTrigger = isTrigger;
    return this;
  }

  setOffset(x, y) {
    this.offset.set(x, y);
    if (this.body) this.body._recomputeMassData();
    return this;
  }

  /**
   * Berechnet Masse und Trägheitsmoment für die gegebene Dichte
   * Gibt { mass, inertia } zurück
   */
  computeMassData(density) {
    throw new Error('computeMassData() must be implemented by subclass');
  }

  /**
   * Berechnet die weltraumbezogene AABB der Form unter Transformation T
   */
  computeAABB(transform) {
    throw new Error('computeAABB() must be implemented by subclass');
  }

  /**
   * Prüft, ob ein Weltpunkt innerhalb der Form liegt
   */
  testPoint(point, transform) {
    throw new Error('testPoint() must be implemented by subclass');
  }

  /**
   * Führt einen Raycast gegen die Form durch
   */
  raycast(ray, transform, maxDist) {
    throw new Error('raycast() must be implemented by subclass');
  }
}

// --- src/collision/shapes/Circle.mjs ---

/**
 * Circle: Kreis-Kollisionsform (z. B. Bälle, Räder, Fässer).
 */
class Circle extends Shape {
  constructor(radius = 0.5, offset = new Vec2(0, 0)) {
    super('circle');
    this.radius = Math.max(1e-4, radius);
    this.offset = offset.clone();
  }

  computeMassData(density) {
    const area = Math.PI * this.radius * this.radius;
    const mass = density * area;
    // Trägheitsmoment um Zentrum: I_0 = 1/2 * m * r^2
    // Nach Steinerschem Satz bei Versatz d: I = I_0 + m * d^2
    const dSq = this.offset.lengthSq();
    const inertia = 0.5 * mass * this.radius * this.radius + mass * dSq;
    return { mass, inertia, area };
  }

  computeAABB(transform) {
    const center = transform.transformPoint(this.offset);
    const r = this.radius;
    return new AABB(
      new Vec2(center.x - r, center.y - r),
      new Vec2(center.x + r, center.y + r)
    );
  }

  testPoint(point, transform) {
    const center = transform.transformPoint(this.offset);
    return center.distanceToSq(point) <= this.radius * this.radius;
  }

  raycast(ray, transform, maxDist = Infinity) {
    const center = transform.transformPoint(this.offset);
    const m = Vec2.sub(ray.origin, center);
    const b = m.dot(ray.direction);
    const c = m.dot(m) - this.radius * this.radius;

    // Strahlursprung außerhalb und zielt vom Kreis weg
    if (c > 0.0 && b > 0.0) return { hit: false };

    const discr = b * b - c;
    if (discr < 0.0) return { hit: false };

    let t = -b - Math.sqrt(discr);
    if (t < 0.0) t = 0.0; // Strahl startete im Kreis

    if (t > maxDist) return { hit: false };

    const hitPoint = Vec2.add(ray.origin, Vec2.scale(ray.direction, t));
    const normal = Vec2.sub(hitPoint, center).normalize();

    return {
      hit: true,
      fraction: t,
      point: hitPoint,
      normal
    };
  }
}

// --- src/collision/shapes/Box.mjs ---

/**
 * Box: Rechteckige Kollisionsform (Kisten, Böden, Wände, Plattformen).
 */
class Box extends Shape {
  constructor(width = 1.0, height = 1.0, offset = new Vec2(0, 0)) {
    super('box');
    this.width = Math.max(1e-4, width);
    this.height = Math.max(1e-4, height);
    this.offset = offset.clone();
    this.hx = this.width * 0.5;
    this.hy = this.height * 0.5;
  }

  computeMassData(density) {
    const area = this.width * this.height;
    const mass = density * area;
    // Trägheitsmoment Kiste: I_0 = 1/12 * m * (w^2 + h^2)
    // Steiner: + m * d^2
    const dSq = this.offset.lengthSq();
    const inertia = (1.0 / 12.0) * mass * (this.width * this.width + this.height * this.height) + mass * dSq;
    return { mass, inertia, area };
  }

  getLocalVertices() {
    const ox = this.offset.x;
    const oy = this.offset.y;
    return [
      new Vec2(ox - this.hx, oy - this.hy),
      new Vec2(ox + this.hx, oy - this.hy),
      new Vec2(ox + this.hx, oy + this.hy),
      new Vec2(ox - this.hx, oy + this.hy)
    ];
  }

  getWorldVertices(transform) {
    const local = this.getLocalVertices();
    return local.map(v => transform.transformPoint(v));
  }

  getWorldNormals(transform) {
    // 2 orthogonale Einheitsnormalen reichen für Rechteck im SAT
    const n1 = transform.transformVector(new Vec2(1, 0));
    const n2 = transform.transformVector(new Vec2(0, 1));
    return [n1, n2];
  }

  computeAABB(transform) {
    const verts = this.getWorldVertices(transform);
    const min = new Vec2(Infinity, Infinity);
    const max = new Vec2(-Infinity, -Infinity);

    for (const v of verts) {
      if (v.x < min.x) min.x = v.x;
      if (v.x > max.x) max.x = v.x;
      if (v.y < min.y) min.y = v.y;
      if (v.y > max.y) max.y = v.y;
    }

    return new AABB(min, max);
  }

  testPoint(point, transform) {
    // Transformiere Weltpunkt in lokales Kistensystem
    const local = transform.inverseTransformPoint(point);
    const dx = local.x - this.offset.x;
    const dy = local.y - this.offset.y;
    return Math.abs(dx) <= this.hx && Math.abs(dy) <= this.hy;
  }

  raycast(ray, transform, maxDist = Infinity) {
    // Transformiere Strahl ins lokale System
    const localOrigin = transform.inverseTransformPoint(ray.origin);
    const localDir = transform.inverseTransformVector(ray.direction);

    const aabb = new AABB(
      new Vec2(this.offset.x - this.hx, this.offset.y - this.hy),
      new Vec2(this.offset.x + this.hx, this.offset.y + this.hy)
    );

    const hit = aabb.raycast(localOrigin, localDir, maxDist);
    if (!hit.hit) return { hit: false };

    // Zurück in Weltkoordinaten transformieren
    const worldPoint = transform.transformPoint(hit.point);
    const worldNormal = transform.transformVector(hit.normal);

    return {
      hit: true,
      fraction: hit.fraction,
      point: worldPoint,
      normal: worldNormal
    };
  }
}

// --- src/collision/shapes/Polygon.mjs ---

/**
 * Polygon: Konvexe Polygonform für Dreiecke, Sechsecke, Keile, Rampen etc.
 */
class Polygon extends Shape {
  constructor(vertices = [], offset = new Vec2(0, 0)) {
    super('polygon');
    if (vertices.length < 3) {
      throw new Error('Polygon requires at least 3 vertices');
    }
    this.offset = offset.clone();
    this.localVertices = vertices.map(v => v.clone());
    this._ensureCounterClockwise();
    this.localNormals = this._computeLocalNormals();
  }

  _ensureCounterClockwise() {
    let area2 = 0;
    const n = this.localVertices.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area2 += this.localVertices[i].cross(this.localVertices[j]);
    }
    // Wenn im Uhrzeigersinn definiert, umkehren
    if (area2 < 0) {
      this.localVertices.reverse();
    }
  }

  _computeLocalNormals() {
    const normals = [];
    const n = this.localVertices.length;
    for (let i = 0; i < n; i++) {
      const p1 = this.localVertices[i];
      const p2 = this.localVertices[(i + 1) % n];
      const edge = Vec2.sub(p2, p1);
      // Nach außen gerichtete Normale (bei CCW ist das edge.perp() bzw. (edge.y, -edge.x) invertiert)
      const normal = new Vec2(edge.y, -edge.x).normalize();
      normals.push(normal);
    }
    return normals;
  }

  computeMassData(density) {
    let area = 0.0;
    let cx = 0.0;
    let cy = 0.0;
    let inertia = 0.0;
    const n = this.localVertices.length;

    for (let i = 0; i < n; i++) {
      const p1 = this.localVertices[i];
      const p2 = this.localVertices[(i + 1) % n];
      const cross = p1.cross(p2);
      area += cross * 0.5;
      cx += (p1.x + p2.x) * cross;
      cy += (p1.y + p2.y) * cross;

      // Trägheitsintegral über Dreieck
      const intx2 = p1.x * p1.x + p1.x * p2.x + p2.x * p2.x;
      const inty2 = p1.y * p1.y + p1.y * p2.y + p2.y * p2.y;
      inertia += (0.25 * (1.0 / 3.0) * cross) * (intx2 + inty2);
    }

    area = Math.abs(area);
    const mass = density * area;
    inertia = Math.abs(inertia) * density;

    return { mass, inertia: Math.max(1e-4, inertia), area };
  }

  getWorldVertices(transform) {
    return this.localVertices.map(v => {
      const local = Vec2.add(v, this.offset);
      return transform.transformPoint(local);
    });
  }

  getWorldNormals(transform) {
    return this.localNormals.map(n => transform.transformVector(n));
  }

  computeAABB(transform) {
    const verts = this.getWorldVertices(transform);
    const min = new Vec2(Infinity, Infinity);
    const max = new Vec2(-Infinity, -Infinity);

    for (const v of verts) {
      if (v.x < min.x) min.x = v.x;
      if (v.x > max.x) max.x = v.x;
      if (v.y < min.y) min.y = v.y;
      if (v.y > max.y) max.y = v.y;
    }

    return new AABB(min, max);
  }

  testPoint(point, transform) {
    const verts = this.getWorldVertices(transform);
    const n = verts.length;
    for (let i = 0; i < n; i++) {
      const p1 = verts[i];
      const p2 = verts[(i + 1) % n];
      const edge = Vec2.sub(p2, p1);
      const toPoint = Vec2.sub(point, p1);
      if (edge.cross(toPoint) < 0) {
        return false;
      }
    }
    return true;
  }

  raycast(ray, transform, maxDist = Infinity) {
    const verts = this.getWorldVertices(transform);
    const normals = this.getWorldNormals(transform);
    let tmin = 0.0;
    let tmax = maxDist;
    let hitNormal = Vec2.zero();

    for (let i = 0; i < verts.length; i++) {
      const normal = normals[i];
      const v = verts[i];
      const denom = normal.dot(ray.direction);
      const numer = normal.dot(Vec2.sub(v, ray.origin));

      if (Math.abs(denom) < 1e-9) {
        // Parallel zur Kante
        if (numer < 0.0) return { hit: false };
      } else {
        const t = numer / denom;
        if (denom < 0.0) {
          // Strahl trifft von außen
          if (t > tmin) {
            tmin = t;
            hitNormal = normal;
          }
        } else {
          // Strahl verlässt Polygon
          if (t < tmax) {
            tmax = t;
          }
        }
      }
      if (tmin > tmax) return { hit: false };
    }

    return {
      hit: true,
      fraction: tmin,
      point: Vec2.add(ray.origin, Vec2.scale(ray.direction, tmin)),
      normal: hitNormal
    };
  }

  static createRegularPolygon(radius, sides = 5, offset = new Vec2(0, 0)) {
    const verts = [];
    const step = (Math.PI * 2.0) / sides;
    for (let i = 0; i < sides; i++) {
      const a = i * step;
      verts.push(new Vec2(Math.cos(a) * radius, Math.sin(a) * radius));
    }
    return new Polygon(verts, offset);
  }
}

// --- src/collision/shapes/Capsule.mjs ---

/**
 * Capsule: Kapselform (zwei Halbkreise verbunden durch ein Rechteck)
 * Ideal für Spielfiguren, Ragdolls, Gliedmaßen und Projektile.
 */
class Capsule extends Shape {
  constructor(length = 1.0, radius = 0.3, offset = new Vec2(0, 0)) {
    super('capsule');
    this.length = Math.max(1e-4, length);
    this.radius = Math.max(1e-4, radius);
    this.offset = offset.clone();
    this.hl = this.length * 0.5;
  }

  computeMassData(density) {
    // Rechteck (length * 2 * radius) + zwei Halbkreise = 1 Vollkreis (pi * radius^2)
    const rectArea = this.length * (2.0 * this.radius);
    const circleArea = Math.PI * this.radius * this.radius;
    const area = rectArea + circleArea;
    const mass = density * area;

    // Trägheitsmoment um Zentrum:
    // I_rect = 1/12 * m_rect * (length^2 + (2*radius)^2)
    const mRect = density * rectArea;
    const iRect = (1.0 / 12.0) * mRect * (this.length * this.length + 4.0 * this.radius * this.radius);

    // I_circle = m_circle * (1/2 * r^2 + hl^2)
    const mCircle = density * circleArea;
    const iCircle = mCircle * (0.5 * this.radius * this.radius + this.hl * this.hl);

    const dSq = this.offset.lengthSq();
    const inertia = (iRect + iCircle) + mass * dSq;

    return { mass, inertia, area };
  }

  getLocalEndpoints() {
    const ox = this.offset.x;
    const oy = this.offset.y;
    // Entlang Y-Achse ausgerichtet
    return [
      new Vec2(ox, oy - this.hl),
      new Vec2(ox, oy + this.hl)
    ];
  }

  getWorldEndpoints(transform) {
    const [p1, p2] = this.getLocalEndpoints();
    return [
      transform.transformPoint(p1),
      transform.transformPoint(p2)
    ];
  }

  computeAABB(transform) {
    const [p1, p2] = this.getWorldEndpoints(transform);
    const r = this.radius;
    const min = new Vec2(
      Math.min(p1.x, p2.x) - r,
      Math.min(p1.y, p2.y) - r
    );
    const max = new Vec2(
      Math.max(p1.x, p2.x) + r,
      Math.max(p1.y, p2.y) + r
    );
    return new AABB(min, max);
  }

  testPoint(point, transform) {
    const [p1, p2] = this.getWorldEndpoints(transform);
    const seg = Vec2.sub(p2, p1);
    const lenSq = seg.lengthSq();
    if (lenSq < 1e-9) {
      return p1.distanceToSq(point) <= this.radius * this.radius;
    }
    const t = Math.max(0, Math.min(1, Vec2.sub(point, p1).dot(seg) / lenSq));
    const closest = Vec2.add(p1, Vec2.scale(seg, t));
    return closest.distanceToSq(point) <= this.radius * this.radius;
  }

  raycast(ray, transform, maxDist = Infinity) {
    // Kapsel als Minkowski-Summe aus Liniensegment und Kreis
    const [p1, p2] = this.getWorldEndpoints(transform);
    // Näherungs-Raycast über Segmentabstand
    const seg = Vec2.sub(p2, p1);
    const segLen = seg.length();
    // Bounding Box Test zuerst
    const aabb = this.computeAABB(transform);
    const hitBox = aabb.raycast(ray.origin, ray.direction, maxDist);
    if (!hitBox.hit) return { hit: false };

    // Feinprüfung: Teste Kreis an p1, Kreis an p2 und Zylinder-Flanken
    let bestHit = null;
    let minFraction = Infinity;

    // Test Endkappen als Kreise
    for (const p of [p1, p2]) {
      const m = Vec2.sub(ray.origin, p);
      const b = m.dot(ray.direction);
      const c = m.dot(m) - this.radius * this.radius;
      if (!(c > 0 && b > 0)) {
        const discr = b * b - c;
        if (discr >= 0) {
          let t = -b - Math.sqrt(discr);
          if (t >= 0 && t < minFraction && t <= maxDist) {
            minFraction = t;
            const pt = Vec2.add(ray.origin, Vec2.scale(ray.direction, t));
            bestHit = {
              hit: true,
              fraction: t,
              point: pt,
              normal: Vec2.sub(pt, p).normalize()
            };
          }
        }
      }
    }

    if (bestHit) return bestHit;
    return hitBox;
  }
}

// --- src/collision/shapes/Segment.mjs ---

/**
 * Segment: 1D Liniensegment (Kante) für Böden, Wände, Rampen und Hänge.
 * Normalerweise für statische Körper (`body.type = 'static'`).
 */
class Segment extends Shape {
  constructor(p1 = new Vec2(-1, 0), p2 = new Vec2(1, 0)) {
    super('segment');
    this.p1 = p1.clone();
    this.p2 = p2.clone();
    this.thickness = 0.05; // Leichte Dicke zur Vermeidung von Tunneling
  }

  computeMassData(density) {
    // Statische Segmente haben standardmäßig unendliche Masse / 0 inverse Masse
    return { mass: 0, inertia: 0, area: 0 };
  }

  getWorldEndpoints(transform) {
    return [
      transform.transformPoint(this.p1),
      transform.transformPoint(this.p2)
    ];
  }

  computeAABB(transform) {
    const [w1, w2] = this.getWorldEndpoints(transform);
    const pad = this.thickness;
    return new AABB(
      new Vec2(Math.min(w1.x, w2.x) - pad, Math.min(w1.y, w2.y) - pad),
      new Vec2(Math.max(w1.x, w2.x) + pad, Math.max(w1.y, w2.y) + pad)
    );
  }

  testPoint(point, transform) {
    const [w1, w2] = this.getWorldEndpoints(transform);
    const seg = Vec2.sub(w2, w1);
    const lenSq = seg.lengthSq();
    if (lenSq < 1e-9) return w1.distanceToSq(point) <= this.thickness * this.thickness;
    const t = Math.max(0, Math.min(1, Vec2.sub(point, w1).dot(seg) / lenSq));
    const closest = Vec2.add(w1, Vec2.scale(seg, t));
    return closest.distanceToSq(point) <= this.thickness * this.thickness;
  }

  raycast(ray, transform, maxDist = Infinity) {
    const [w1, w2] = this.getWorldEndpoints(transform);
    const v1 = ray.origin;
    const v2 = Vec2.add(ray.origin, Vec2.scale(ray.direction, maxDist));

    const edge = Vec2.sub(w2, w1);
    const normal = new Vec2(edge.y, -edge.x).normalize();

    // 2D Linien-Schnittpunkt
    const d = ray.direction.cross(edge);
    if (Math.abs(d) < 1e-9) return { hit: false };

    const qp = Vec2.sub(w1, ray.origin);
    const t = qp.cross(edge) / d;
    const u = qp.cross(ray.direction) / d;

    if (t >= 0.0 && t <= maxDist && u >= 0.0 && u <= 1.0) {
      const hitPoint = Vec2.add(ray.origin, Vec2.scale(ray.direction, t));
      return {
        hit: true,
        fraction: t,
        point: hitPoint,
        normal: normal.dot(ray.direction) < 0 ? normal : normal.negate()
      };
    }

    return { hit: false };
  }
}

// --- src/collision/broadphase/DynamicAABBTree.mjs ---

/**
 * Node im dynamischen AABB-Baum
 */
class TreeNode {
  constructor(id) {
    this.id = id;
    this.aabb = new AABB();
    this.userData = null;
    this.parent = null;
    this.left = null;
    this.right = null;
    this.height = 0;
  }

  isLeaf() {
    return this.left === null;
  }
}

/**
 * DynamicAABBTree: Binarer Hüllkörperbaum (BVH) für O(N log N) Kollisionsabfragen.
 * Verwendet "Fat AABBs" mit Sicherheitsabstand (Padding), um teure Re-Insertions
 * bei kleinen Körperbewegungen zu eliminieren.
 */
class DynamicAABBTree {
  constructor(fatPadding = 0.1) {
    this.fatPadding = fatPadding;
    this.root = null;
    this.nodePool = [];
    this.nodeCount = 0;
    this.nextNodeId = 1;
  }

  _allocateNode(userData, aabb) {
    const node = new TreeNode(this.nextNodeId++);
    node.userData = userData;
    // Fat AABB berechnen
    node.aabb.copy(aabb).expand(this.fatPadding);
    node.height = 0;
    return node;
  }

  insertLeaf(userData, aabb) {
    const leaf = this._allocateNode(userData, aabb);
    this.nodeCount++;

    if (!this.root) {
      this.root = leaf;
      return leaf;
    }

    // Finde besten Geschwisterknoten (Surface Area Heuristic)
    let best = this.root;
    let bestCost = AABB.combineArea(this.root.aabb, leaf.aabb);
    const queue = [{ node: this.root, inheritedCost: 0 }];

    while (queue.length > 0) {
      const { node, inheritedCost } = queue.shift();
      const combined = new AABB().copy(node.aabb).combine(leaf.aabb);
      const directCost = combined.getArea();
      const totalCost = directCost + inheritedCost;

      if (totalCost < bestCost) {
        bestCost = totalCost;
        best = node;
      }

      const newInheritedCost = inheritedCost + (directCost - node.aabb.getArea());
      const lowerBound = leaf.aabb.getArea() + newInheritedCost;

      if (lowerBound < bestCost && !node.isLeaf()) {
        queue.push({ node: node.left, inheritedCost: newInheritedCost });
        queue.push({ node: node.right, inheritedCost: newInheritedCost });
      }
    }

    // Neuer Elternknoten
    const oldParent = best.parent;
    const newParent = new TreeNode(this.nextNodeId++);
    newParent.parent = oldParent;
    newParent.aabb.copy(best.aabb).combine(leaf.aabb);
    newParent.height = best.height + 1;

    if (oldParent) {
      if (oldParent.left === best) oldParent.left = newParent;
      else oldParent.right = newParent;
    } else {
      this.root = newParent;
    }

    newParent.left = best;
    newParent.right = leaf;
    best.parent = newParent;
    leaf.parent = newParent;

    // Balanciere Baum nach oben
    this._refitHierarchy(leaf.parent);

    return leaf;
  }

  removeLeaf(leaf) {
    if (!leaf) return;
    this.nodeCount--;

    if (leaf === this.root) {
      this.root = null;
      return;
    }

    const parent = leaf.parent;
    const grandParent = parent.parent;
    const sibling = parent.left === leaf ? parent.right : parent.left;

    if (grandParent) {
      if (grandParent.left === parent) grandParent.left = sibling;
      else grandParent.right = sibling;
      sibling.parent = grandParent;
      this._refitHierarchy(grandParent);
    } else {
      this.root = sibling;
      sibling.parent = null;
    }
  }

  updateLeaf(leaf, aabb, displacement = null) {
    // Wenn neue AABB noch in der Fat AABB liegt, nichts tun!
    if (leaf.aabb.containsAABB(aabb)) {
      return false;
    }

    this.removeLeaf(leaf);

    // Fat AABB mit Bewegungsprädiktion berechnen
    leaf.aabb.copy(aabb).expand(this.fatPadding);
    if (displacement) {
      const pred = Vec2.scale(displacement, 2.0);
      leaf.aabb.expandByVec(pred);
    }

    // Neu einfügen
    if (!this.root) {
      this.root = leaf;
      leaf.parent = null;
      this.nodeCount++;
      return true;
    }

    // Standard Einfügen
    const best = this.root;
    const oldParent = best.parent;
    const newParent = new TreeNode(this.nextNodeId++);
    newParent.parent = oldParent;
    newParent.aabb.copy(best.aabb).combine(leaf.aabb);
    newParent.height = best.height + 1;

    if (oldParent) {
      if (oldParent.left === best) oldParent.left = newParent;
      else oldParent.right = newParent;
    } else {
      this.root = newParent;
    }

    newParent.left = best;
    newParent.right = leaf;
    best.parent = newParent;
    leaf.parent = newParent;

    this.nodeCount++;
    this._refitHierarchy(leaf.parent);
    return true;
  }

  _refitHierarchy(node) {
    let curr = node;
    while (curr) {
      curr = this._balance(curr);
      const left = curr.left;
      const right = curr.right;
      curr.height = 1 + Math.max(left.height, right.height);
      curr.aabb.copy(left.aabb).combine(right.aabb);
      curr = curr.parent;
    }
  }

  _balance(node) {
    if (node.isLeaf() || node.height < 2) return node;

    const left = node.left;
    const right = node.right;
    const balance = right.height - left.height;

    // Rotiere right up
    if (balance > 1) {
      const rLeft = right.left;
      const rRight = right.right;

      right.left = node;
      right.parent = node.parent;
      node.parent = right;

      if (right.parent) {
        if (right.parent.left === node) right.parent.left = right;
        else right.parent.right = right;
      } else {
        this.root = right;
      }

      if (rLeft.height > rRight.height) {
        right.right = rLeft;
        node.right = rRight;
        rRight.parent = node;
        node.aabb.copy(left.aabb).combine(rRight.aabb);
        right.aabb.copy(node.aabb).combine(rLeft.aabb);
        node.height = 1 + Math.max(left.height, rRight.height);
        right.height = 1 + Math.max(node.height, rLeft.height);
      } else {
        right.right = rRight;
        node.right = rLeft;
        rLeft.parent = node;
        node.aabb.copy(left.aabb).combine(rLeft.aabb);
        right.aabb.copy(node.aabb).combine(rRight.aabb);
        node.height = 1 + Math.max(left.height, rLeft.height);
        right.height = 1 + Math.max(node.height, rRight.height);
      }
      return right;
    }

    // Rotiere left up
    if (balance < -1) {
      const lLeft = left.left;
      const lRight = left.right;

      left.left = node;
      left.parent = node.parent;
      node.parent = left;

      if (left.parent) {
        if (left.parent.left === node) left.parent.left = left;
        else left.parent.right = left;
      } else {
        this.root = left;
      }

      if (lLeft.height > lRight.height) {
        left.right = lLeft;
        node.left = lRight;
        lRight.parent = node;
        node.aabb.copy(right.aabb).combine(lRight.aabb);
        left.aabb.copy(node.aabb).combine(lLeft.aabb);
        node.height = 1 + Math.max(right.height, lRight.height);
        left.height = 1 + Math.max(node.height, lLeft.height);
      } else {
        left.right = lRight;
        node.left = lLeft;
        lLeft.parent = node;
        node.aabb.copy(right.aabb).combine(lLeft.aabb);
        left.aabb.copy(node.aabb).combine(lRight.aabb);
        node.height = 1 + Math.max(right.height, lLeft.height);
        left.height = 1 + Math.max(node.height, lRight.height);
      }
      return left;
    }

    return node;
  }

  /**
   * Findet alle potentiell kollidierenden Paare im Baum
   */
  queryPairs(callback) {
    if (!this.root || this.root.isLeaf()) return;

    const stack = [this.root];
    while (stack.length > 0) {
      const node = stack.pop();
      if (node.isLeaf()) continue;

      this._queryCrossNodes(node.left, node.right, callback);
      stack.push(node.left);
      stack.push(node.right);
    }
  }

  _queryCrossNodes(nodeA, nodeB, callback) {
    if (!nodeA.aabb.intersects(nodeB.aabb)) return;

    if (nodeA.isLeaf() && nodeB.isLeaf()) {
      callback(nodeA.userData, nodeB.userData);
      return;
    }

    if (nodeA.isLeaf()) {
      this._queryCrossNodes(nodeA, nodeB.left, callback);
      this._queryCrossNodes(nodeA, nodeB.right, callback);
    } else if (nodeB.isLeaf()) {
      this._queryCrossNodes(nodeA.left, nodeB, callback);
      this._queryCrossNodes(nodeA.right, nodeB, callback);
    } else {
      if (nodeA.aabb.getArea() > nodeB.aabb.getArea()) {
        this._queryCrossNodes(nodeA.left, nodeB, callback);
        this._queryCrossNodes(nodeA.right, nodeB, callback);
      } else {
        this._queryCrossNodes(nodeA, nodeB.left, callback);
        this._queryCrossNodes(nodeA, nodeB.right, callback);
      }
    }
  }

  /**
   * Sucht alle Objekte, die eine AABB überlappen
   */
  queryAABB(aabb, callback) {
    if (!this.root) return;
    const stack = [this.root];
    while (stack.length > 0) {
      const node = stack.pop();
      if (node.aabb.intersects(aabb)) {
        if (node.isLeaf()) {
          const proceed = callback(node.userData);
          if (proceed === false) return;
        } else {
          stack.push(node.left);
          stack.push(node.right);
        }
      }
    }
  }

  /**
   * Raycast-Abfrage gegen den Baum
   */
  raycast(origin, dir, maxDist, callback) {
    if (!this.root) return;
    const stack = [this.root];
    while (stack.length > 0) {
      const node = stack.pop();
      const hit = node.aabb.raycast(origin, dir, maxDist);
      if (hit.hit) {
        if (node.isLeaf()) {
          const proceed = callback(node.userData);
          if (proceed === false) return;
        } else {
          stack.push(node.left);
          stack.push(node.right);
        }
      }
    }
  }
}

// --- src/collision/narrowphase/ContactManifold.mjs ---

/**
 * ContactPoint: Einzelner Kontaktpunkt in der Kontakt-Manifold
 */
class ContactPoint {
  constructor(point = new Vec2(0, 0), penetration = 0) {
    this.point = point.clone();         // Weltposition des Kontakts
    this.penetration = penetration;     // Eindringtiefe (> 0 bei Überlappung)
    this.normalImpulse = 0.0;           // Akkumulierter Normal-Impuls für Warm-Starting
    this.tangentImpulse = 0.0;          // Akkumulierter Tangential-(Reibungs-)Impuls
    this.rA = new Vec2(0, 0);           // Hebelarm vom Schwerpunkt A: point - posA
    this.rB = new Vec2(0, 0);           // Hebelarm vom Schwerpunkt B: point - posB
    this.normalMass = 0.0;              // Effektive Masse in Normalenrichtung: 1 / (mA^-1 + mB^-1 + (rA x n)^2 / IA + (rB x n)^2 / IB)
    this.tangentMass = 0.0;             // Effektive Masse in Tangentenrichtung
    this.bias = 0.0;                    // Baumgarte-Geschwindigkeits-Bias + Restitutions-Bias
  }
}

/**
 * ContactManifold: Repräsentiert die Berührungsfläche / Kontaktpunkte zwischen zwei Körpern
 */
class ContactManifold {
  constructor(bodyA, bodyB, shapeA, shapeB) {
    this.bodyA = bodyA;
    this.bodyB = bodyB;
    this.shapeA = shapeA;
    this.shapeB = shapeB;
    this.normal = new Vec2(0, 1);       // Einheitsnormale von A nach B
    this.tangent = new Vec2(-1, 0);     // Tangente orthogonal zur Normale
    this.points = [];                   // Array von ContactPoint (1 oder 2 Punkte)
    this.friction = 0.3;
    this.restitution = 0.0;
    this.isTrigger = shapeA.isTrigger || shapeB.isTrigger;
  }

  addPoint(point, penetration) {
    this.points.push(new ContactPoint(point, penetration));
  }

  get key() {
    const idA = this.bodyA.id;
    const idB = this.bodyB.id;
    return idA < idB ? `${idA}:${idB}` : `${idB}:${idA}`;
  }
}

// --- src/collision/narrowphase/SAT.mjs ---

/**
 * SAT: Separating Axis Theorem (Satz von den trennenden Achsen)
 * für konvexe Polygone und Kisten inklusive Sutherland-Hodgman Kanten-Clipping.
 */
class SAT {
  /**
   * Projiziert ein Polygon auf eine Achse und gibt [min, max] zurück
   */
  static projectPolygon(axis, vertices) {
    let min = axis.dot(vertices[0]);
    let max = min;
    for (let i = 1; i < vertices.length; i++) {
      const p = axis.dot(vertices[i]);
      if (p < min) min = p;
      if (p > max) max = p;
    }
    return [min, max];
  }

  /**
   * Findet die Achse mit minimaler Überlappung
   */
  static findMinOverlap(vertsA, normalsA, vertsB, normalsB) {
    let minOverlap = Infinity;
    let bestAxis = null;
    let bestIsA = true;

    // Teste Normalen von A
    for (let i = 0; i < normalsA.length; i++) {
      const axis = normalsA[i];
      const [minA, maxA] = SAT.projectPolygon(axis, vertsA);
      const [minB, maxB] = SAT.projectPolygon(axis, vertsB);

      if (maxA < minB || maxB < minA) {
        return { separating: true }; // Trennende Achse gefunden -> keine Kollision!
      }

      const overlap1 = maxA - minB;
      const overlap2 = maxB - minA;
      const overlap = Math.min(overlap1, overlap2);

      if (overlap < minOverlap) {
        minOverlap = overlap;
        bestAxis = axis;
        bestIsA = true;
      }
    }

    // Teste Normalen von B
    for (let i = 0; i < normalsB.length; i++) {
      const axis = normalsB[i];
      const [minA, maxA] = SAT.projectPolygon(axis, vertsA);
      const [minB, maxB] = SAT.projectPolygon(axis, vertsB);

      if (maxA < minB || maxB < minA) {
        return { separating: true };
      }

      const overlap1 = maxA - minB;
      const overlap2 = maxB - minA;
      const overlap = Math.min(overlap1, overlap2);

      if (overlap < minOverlap) {
        minOverlap = overlap;
        bestAxis = axis;
        bestIsA = false;
      }
    }

    return {
      separating: false,
      overlap: minOverlap,
      axis: bestAxis,
      isAxisFromA: bestIsA
    };
  }

  /**
   * Clippt Kantenpunkte gegen eine Ebene
   */
  static clipSegmentToLine(vIn, normal, offset) {
    const vOut = [];
    const d0 = normal.dot(vIn[0]) - offset;
    const d1 = normal.dot(vIn[1]) - offset;

    if (d0 <= 0.0) vOut.push(vIn[0]);
    if (d1 <= 0.0) vOut.push(vIn[1]);

    if (d0 * d1 < 0.0) {
      const alpha = d0 / (d0 - d1);
      const interp = Vec2.add(vIn[0], Vec2.scale(Vec2.sub(vIn[1], vIn[0]), alpha));
      vOut.push(interp);
    }

    return vOut;
  }

  /**
   * Findet Incident Edge (die am meisten antiparallel zur Referenz-Normalen ist)
   */
  static findIncidentEdge(refNormal, verts) {
    let minDot = Infinity;
    let incidentIndex = 0;
    const n = verts.length;

    for (let i = 0; i < n; i++) {
      const p1 = verts[i];
      const p2 = verts[(i + 1) % n];
      const edge = Vec2.sub(p2, p1);
      const normal = new Vec2(edge.y, -edge.x).normalize();
      const dot = normal.dot(refNormal);
      if (dot < minDot) {
        minDot = dot;
        incidentIndex = i;
      }
    }

    const p1 = verts[incidentIndex];
    const p2 = verts[(incidentIndex + 1) % n];
    return [p1, p2];
  }

  /**
   * Kollisionstest zweier konvexer Polygone (oder Boxen)
   * Liefert { collision: boolean, normal: Vec2, points: Array<{ point: Vec2, depth: number }> }
   */
  static collidePolygons(vertsA, normalsA, posA, vertsB, normalsB, posB) {
    const result = SAT.findMinOverlap(vertsA, normalsA, vertsB, normalsB);
    if (result.separating) {
      return { collision: false };
    }

    let normal = result.axis.clone();
    // Stelle sicher, dass die Normale von A nach B zeigt
    const centerDir = Vec2.sub(posB, posA);
    if (normal.dot(centerDir) < 0) {
      normal.negate();
    }

    // Bestimme Referenz- und Incident-Polygon
    let refVerts, incVerts, refNormal;
    if (result.isAxisFromA) {
      refVerts = vertsA;
      incVerts = vertsB;
      refNormal = normal.clone();
    } else {
      refVerts = vertsB;
      incVerts = vertsA;
      refNormal = normal.clone().negate();
    }

    // Finde Referenzkante
    let maxDot = -Infinity;
    let refIndex = 0;
    const nRef = refVerts.length;
    for (let i = 0; i < nRef; i++) {
      const p1 = refVerts[i];
      const p2 = refVerts[(i + 1) % nRef];
      const edge = Vec2.sub(p2, p1);
      const edgeNorm = new Vec2(edge.y, -edge.x).normalize();
      const dot = edgeNorm.dot(refNormal);
      if (dot > maxDot) {
        maxDot = dot;
        refIndex = i;
      }
    }

    const refV1 = refVerts[refIndex];
    const refV2 = refVerts[(refIndex + 1) % nRef];
    const refEdge = Vec2.sub(refV2, refV1).normalize();
    const refTangent = refEdge.clone();

    // Incident Edge finden
    let incident = SAT.findIncidentEdge(refNormal, incVerts);

    // Klippe incident edge an den Seitenflächen der Referenzkante
    // 1. Klippe an refV1 entlang -refTangent
    incident = SAT.clipSegmentToLine(incident, refTangent.clone().negate(), -refTangent.dot(refV1));
    if (incident.length < 2) return { collision: false };

    // 2. Klippe an refV2 entlang refTangent
    incident = SAT.clipSegmentToLine(incident, refTangent, refTangent.dot(refV2));
    if (incident.length < 2) return { collision: false };

    // Behalte nur Punkte, die hinter der Referenzebene liegen
    const frontOffset = refNormal.dot(refV1);
    const contactPoints = [];

    for (const pt of incident) {
      const sep = refNormal.dot(pt) - frontOffset;
      if (sep <= 0.0) {
        const depth = -sep;
        // Punkt auf Referenzebene projizieren
        const contactPoint = result.isAxisFromA ? pt : Vec2.add(pt, Vec2.scale(normal, depth));
        contactPoints.push({
          point: contactPoint,
          depth: Math.max(depth, result.overlap)
        });
      }
    }

    if (contactPoints.length === 0) {
      // Fallback: mindestens 1 Kontaktpunkt mit minimaler Überlappung
      const mid = Vec2.lerp(posA, posB, 0.5);
      contactPoints.push({
        point: mid,
        depth: result.overlap
      });
    }

    return {
      collision: true,
      normal,
      points: contactPoints
    };
  }
}

// --- src/collision/Raycast.mjs ---

/**
 * Ray: Repräsentiert einen physikalischen Abtaststrahl
 */
class Ray {
  constructor(origin = new Vec2(0, 0), direction = new Vec2(1, 0), maxDistance = Infinity) {
    this.origin = origin.clone();
    this.direction = direction.clone().normalize();
    this.maxDistance = maxDistance;
  }
}

/**
 * RaycastHit: Detailliertes Treffer-Ergebnis eines Raycasts
 */
class RaycastHit {
  constructor(body = null, shape = null, point = new Vec2(0, 0), normal = new Vec2(0, 1), fraction = 0) {
    this.body = body;
    this.shape = shape;
    this.point = point.clone();
    this.normal = normal.clone();
    this.fraction = fraction;
    this.distance = fraction; // Bei normalisierter Richtung ist fraction = Distanz
  }
}

// --- src/collision/TriggerSystem.mjs ---
/**
 * TriggerSystem: Verwaltet Trigger/Sensor-Zustände und löst Enter/Stay/Exit-Ereignisse aus.
 */
class TriggerSystem {
  constructor() {
    this.currentPairs = new Set();
    this.previousPairs = new Set();
    this.listeners = [];
  }

  addListener(listener) {
    this.listeners.push(listener);
    return this;
  }

  removeListener(listener) {
    const idx = this.listeners.indexOf(listener);
    if (idx !== -1) this.listeners.splice(idx, 1);
  }

  _pairKey(shapeA, shapeB) {
    return shapeA.id < shapeB.id ? `${shapeA.id}:${shapeB.id}` : `${shapeB.id}:${shapeA.id}`;
  }

  registerOverlap(manifold) {
    if (!manifold.isTrigger) return;
    const key = this._pairKey(manifold.shapeA, manifold.shapeB);
    this.currentPairs.add({
      key,
      shapeA: manifold.shapeA,
      shapeB: manifold.shapeB,
      bodyA: manifold.bodyA,
      bodyB: manifold.bodyB
    });
  }

  flushEvents() {
    const prevMap = new Map();
    for (const p of this.previousPairs) {
      prevMap.set(p.key, p);
    }

    const currMap = new Map();
    for (const p of this.currentPairs) {
      currMap.set(p.key, p);
    }

    // 1. Enter and Stay events
    for (const p of this.currentPairs) {
      if (prevMap.has(p.key)) {
        // Stay
        this._emit('onTriggerStay', p);
      } else {
        // Enter
        this._emit('onTriggerEnter', p);
      }
    }

    // 2. Exit events
    for (const p of this.previousPairs) {
      if (!currMap.has(p.key)) {
        // Exit
        this._emit('onTriggerExit', p);
      }
    }

    // Swappe Paare für nächsten Frame
    this.previousPairs = this.currentPairs;
    this.currentPairs = new Set();
  }

  _emit(eventName, pair) {
    // Bestimme, welcher der Trigger ist (oder beide)
    const triggerShape = pair.shapeA.isTrigger ? pair.shapeA : pair.shapeB;
    const otherShape = pair.shapeA.isTrigger ? pair.shapeB : pair.shapeA;
    const triggerBody = triggerShape === pair.shapeA ? pair.bodyA : pair.bodyB;
    const otherBody = triggerShape === pair.shapeA ? pair.bodyB : pair.bodyA;

    for (const listener of this.listeners) {
      if (typeof listener[eventName] === 'function') {
        listener[eventName](triggerShape, otherShape, triggerBody, otherBody);
      }
    }
  }
}

// --- src/subqg/RelationalGraph.mjs ---

/**
 * RelationalGraph: Das interne diskrete Kantennetzwerk der Subquantum Graphity (SubQG).
 * Das Netzwerk dient als quantenmechanisches Hintergrundmodell, auf dem Raum und Metrik
 * relational emergieren.
 */
class RelationalGraph {
  constructor(config = {}) {
    this.gridSpacing = config.gridSpacing ?? 1.0; // Gitterabstand in Welteinheiten (Meter)
    this.beta = config.beta ?? 0.05;              // SubQG metrische Kopplungskonstante
    this.extentX = config.extentX ?? 40.0;        // Halbe Ausdehnung in X
    this.extentY = config.extentY ?? 30.0;        // Halbe Ausdehnung in Y

    this.nodes = new Map(); // id -> { pos: Vec2, rho: number, phi: number, clock: number }
    this.edges = [];        // Array von { u: string, v: string, x_e: number, restLen: 1.0, weight: 1.0 }

    this._initLattice();
  }

  _nodeKey(gx, gy) {
    return `${gx},${gy}`;
  }

  _initLattice() {
    const minGX = Math.floor(-this.extentX / this.gridSpacing);
    const maxGX = Math.ceil(this.extentX / this.gridSpacing);
    const minGY = Math.floor(-this.extentY / this.gridSpacing);
    const maxGY = Math.ceil(this.extentY / this.gridSpacing);

    // Erzeuge Knoten
    for (let gx = minGX; gx <= maxGX; gx++) {
      for (let gy = minGY; gy <= maxGY; gy++) {
        const key = this._nodeKey(gx, gy);
        this.nodes.set(key, {
          gx,
          gy,
          pos: new Vec2(gx * this.gridSpacing, gy * this.gridSpacing),
          rho: 0.0,
          phi: 0.0,
          clock: 0
        });
      }
    }

    // Erzeuge relationale Kanten (4-Nachbarschaft + Diagonalen)
    const deltas = [
      [1, 0], [0, 1], [1, 1], [1, -1]
    ];

    for (let gx = minGX; gx <= maxGX; gx++) {
      for (let gy = minGY; gy <= maxGY; gy++) {
        const uKey = this._nodeKey(gx, gy);
        for (const [dx, dy] of deltas) {
          const vKey = this._nodeKey(gx + dx, gy + dy);
          if (this.nodes.has(vKey)) {
            const diag = (dx !== 0 && dy !== 0);
            this.edges.push({
              u: uKey,
              v: vKey,
              x_e: 1.0, // Flache Hintergrundmetrik (x_e = 1.0)
              restLen: diag ? Math.SQRT2 : 1.0,
              weight: diag ? 0.5 : 1.0
            });
          }
        }
      }
    }
  }

  /**
   * Setzt die Dichten rho auf allen Knoten zurück
   */
  resetDensities() {
    for (const node of this.nodes.values()) {
      node.rho = 0.0;
      node.phi = 0.0;
    }
  }

  /**
   * Injiziert die Massendichte eines Körpers (als SubQG-Wellenpaket) in das Netzwerk
   */
  injectBodyMass(body) {
    const pos = body.position;
    const mass = body.mass;
    if (mass <= 0 || !Number.isFinite(mass)) return;

    // Kernel-Ausbreitung (charakteristische Wellenpaketbreite sigma)
    const sigma = Math.max(this.gridSpacing * 0.8, body.boundingRadius * 0.5);
    const sigmaSq2 = 2.0 * sigma * sigma;
    const radiusCells = Math.ceil((sigma * 2.5) / this.gridSpacing);

    const centerGX = Math.round(pos.x / this.gridSpacing);
    const centerGY = Math.round(pos.y / this.gridSpacing);

    let weightSum = 0.0;
    const affectedNodes = [];

    for (let gx = centerGX - radiusCells; gx <= centerGX + radiusCells; gx++) {
      for (let gy = centerGY - radiusCells; gy <= centerGY + radiusCells; gy++) {
        const key = this._nodeKey(gx, gy);
        const node = this.nodes.get(key);
        if (node) {
          const distSq = node.pos.distanceToSq(pos);
          const w = Math.exp(-distSq / sigmaSq2);
          weightSum += w;
          affectedNodes.push({ node, w });
        }
      }
    }

    if (weightSum > 1e-9) {
      const normFactor = mass / weightSum;
      for (const { node, w } of affectedNodes) {
        node.rho += w * normFactor;
        node.clock += 1; // Lokaler Kausal-Uhr-Schritt bei Materie-Ereignis
      }
    }
  }

  /**
   * Interpoliert das metrische Potential phi(x, y) an beliebigen Weltkoordinaten
   */
  samplePotential(worldPos) {
    const gx = worldPos.x / this.gridSpacing;
    const gy = worldPos.y / this.gridSpacing;
    const i = Math.floor(gx);
    const j = Math.floor(gy);
    const fx = gx - i;
    const fy = gy - j;

    const n00 = this.nodes.get(this._nodeKey(i, j))?.phi ?? 0;
    const n10 = this.nodes.get(this._nodeKey(i + 1, j))?.phi ?? 0;
    const n01 = this.nodes.get(this._nodeKey(i, j + 1))?.phi ?? 0;
    const n11 = this.nodes.get(this._nodeKey(i + 1, j + 1))?.phi ?? 0;

    // Bilineare Interpolation
    const top = n00 * (1 - fx) + n10 * fx;
    const bottom = n01 * (1 - fx) + n11 * fx;
    return top * (1 - fy) + bottom * fy;
  }

  /**
   * Berechnet den Gradienten des metrischen Potentials grad(phi) an beliebiger Stelle
   */
  sampleGradient(worldPos) {
    const eps = this.gridSpacing * 0.25;
    const phiX1 = this.samplePotential(new Vec2(worldPos.x + eps, worldPos.y));
    const phiX0 = this.samplePotential(new Vec2(worldPos.x - eps, worldPos.y));
    const phiY1 = this.samplePotential(new Vec2(worldPos.x, worldPos.y + eps));
    const phiY0 = this.samplePotential(new Vec2(worldPos.x, worldPos.y - eps));

    return new Vec2(
      (phiX1 - phiX0) / (2.0 * eps),
      (phiY1 - phiY0) / (2.0 * eps)
    );
  }
}

// --- src/subqg/MetricLatticeSolver.mjs ---
/**
 * MetricLatticeSolver: Minimiert die fundamentale SubQG Kantenwirkung S_edge[x]
 * inklusive Laplacian-Glättungsterm κ/2 Σ (x_e - x_f)^2 zur langreichweitigen
 * Ausbreitung des Gravitationspotentials über das gesamte relationale Netzwerk.
 */
class MetricLatticeSolver {
  constructor(graph, config = {}) {
    this.graph = graph;
    this.kappa = config.kappa ?? 4.0; // Metrische Ausbreitungssteifigkeit (Laplace-Kopplung)
    this.mu = config.mu ?? 0.2;       // Metrischer Massenterm
    this.iterations = config.iterations ?? 8; // Schnelle Gitter-Relaxationsschritte pro Frame
  }

  /**
   * Löst die stationäre Kantenmetrik und das Poisson-analoge Gravitationspotential
   */
  solve() {
    const beta = this.graph.beta;
    const kappa = this.kappa;
    const mu = this.mu;

    let totalEdgeAction = 0.0;
    let maxStrain = 0.0;

    // 1. Lokale Dichten und Kantenmetrik
    for (const edge of this.graph.edges) {
      const uNode = this.graph.nodes.get(edge.u);
      const vNode = this.graph.nodes.get(edge.v);
      if (!uNode || !vNode) continue;

      const rhoE = (uNode.rho + vNode.rho) * 0.5;
      const targetX = 1.0 + (beta * rhoE) / (mu + 0.1);
      edge.x_e = edge.x_e + 0.5 * (targetX - edge.x_e);

      const strain = Math.abs(edge.x_e - 1.0);
      if (strain > maxStrain) maxStrain = strain;

      const diff = edge.x_e - 1.0;
      totalEdgeAction += edge.weight * (0.5 * diff * diff - beta * rhoE * edge.x_e);
    }

    // 2. Diffusive Relaxation des Potentials über das relationale Netzwerk (Poisson-Lösung ∇2Phi = beta * rho)
    for (let it = 0; it < this.iterations; it++) {
      for (const node of this.graph.nodes.values()) {
        const gx = node.gx;
        const gy = node.gy;
        const nLeft = this.graph.nodes.get(this.graph._nodeKey(gx - 1, gy))?.phi ?? 0;
        const nRight = this.graph.nodes.get(this.graph._nodeKey(gx + 1, gy))?.phi ?? 0;
        const nDown = this.graph.nodes.get(this.graph._nodeKey(gx, gy - 1))?.phi ?? 0;
        const nUp = this.graph.nodes.get(this.graph._nodeKey(gx, gy + 1))?.phi ?? 0;

        const lap = 0.25 * (nLeft + nRight + nDown + nUp);
        // Poisson-Gleichung auf dem Graph
        node.phi = 0.75 * lap - 0.25 * (beta * node.rho);
      }
    }

    return {
      totalEdgeAction,
      maxStrain,
      edgeCount: this.graph.edges.length,
      nodeCount: this.graph.nodes.size
    };
  }
}

// --- src/subqg/SubQGGravitationField.mjs ---

/**
 * SubQGGravitationField: Berechnet die Gravitationskräfte auf Körper
 * basierend auf dem emergenten SubQG-Gradienten -grad(Phi).
 *
 * Formal in Lean 4 bewiesen:
 * 'SubQG.constant_metric_gradient_gives_universal_acceleration':
 * F_grav = -M * grad(Phi) => a = F_grav / M = -grad(Phi) = g (Masseunabhängig!)
 */
class SubQGGravitationField {
  constructor(config = {}) {
    // Standard Erdbeschleunigung g = (0, -9.81) m/s2
    this.gravity = config.gravity ? config.gravity.clone() : new Vec2(0, -9.81);
    this.enableMutualAttraction = config.enableMutualAttraction ?? false;
    this.G = config.G ?? 1.0; // SubQG Gravitationskonstante für n-Körper-Attraktion
  }

  setGravity(gx, gy) {
    this.gravity.set(gx, gy);
  }

  /**
   * Wendet die Gravitation auf alle dynamischen Körper an
   */
  applyGravity(bodies, graph = null) {
    for (const body of bodies) {
      if (body.type !== 'dynamic' || body.mass <= 0 || body.isSleeping) continue;

      // 1. Hintergrundbeschleunigung g (aus uniformem SubQG-Metrikgradienten)
      const fGrav = Vec2.scale(this.gravity, body.mass * body.gravityScale);
      body.applyForce(fGrav);

      // 2. Optional: Lokaler Gradient aus dem SubQG-Gitterpotential
      if (graph && this.enableMutualAttraction) {
        const grad = graph.sampleGradient(body.position);
        // F = -m * grad(Phi)
        const fLattice = new Vec2(-body.mass * grad.x, -body.mass * grad.y);
        body.applyForce(fLattice);
      }
    }

    // 3. Optional: Wechselseitige SubQG Punktkörper-Attraktion (N-Körper)
    if (this.enableMutualAttraction && bodies.length > 1) {
      const n = bodies.length;
      for (let i = 0; i < n; i++) {
        const b1 = bodies[i];
        if (b1.type !== 'dynamic' || b1.mass <= 0) continue;

        for (let j = i + 1; j < n; j++) {
          const b2 = bodies[j];
          if (b2.mass <= 0) continue;

          const delta = Vec2.sub(b2.position, b1.position);
          const distSq = delta.lengthSq() + 0.04; // Weicher Kern gegen Singularitäten (Plummer-Radius)
          const dist = Math.sqrt(distSq);
          const forceMagnitude = (this.G * b1.mass * b2.mass) / distSq;
          const force = Vec2.scale(delta, forceMagnitude / dist);

          b1.applyForce(force);
          if (b2.type === 'dynamic') {
            b2.applyForce(force.clone().negate());
          }
        }
      }
    }
  }
}

// --- src/subqg/SubQGContactBridge.mjs ---
/**
 * SubQGContactBridge: Verbindet die mikroskopische relationale Kantensteifigkeit
 * des SubQG-Gitters mit der makroskopischen Impulskollisions-Dynamik.
 *
 * Wenn zwei Körper kollidieren, bewirkt die Überlappung ihrer SubQG-Wellenfunktionen
 * eine drastische Zunahme der Kantenverzerrung, was mikroskopisch als steiles
 * elastisches Repulsionspotential V(delta) = 1/2 k * delta^2 in Erscheinung tritt.
 */
class SubQGContactBridge {
  constructor(config = {}) {
    this.edgeStiffness = config.edgeStiffness ?? 1e6; // N/m
    this.edgeDamping = config.edgeDamping ?? 1e3;     // Ns/m
    this.baumgarteFactor = config.baumgarteFactor ?? 0.2; // Positionskorrektur-Faktor
    this.slop = config.slop ?? 0.005; // 5 mm erlaubte Penetration ohne Drift
  }

  /**
   * Kombiniert Materialeigenschaften nach SubQG-Mittelungsregeln
   */
  combineMaterials(matA, matB) {
    // Reibung: geometrisches Mittel sqrt(mu_A * mu_B)
    const friction = Math.sqrt(matA.friction * matB.friction);
    // Bounciness / Restitution: maximaler oder geometrischer elastischer Stoßfaktor
    const restitution = Math.max(matA.restitution, matB.restitution);
    // Dichte: Durchschnitt
    const density = (matA.density + matB.density) * 0.5;

    return { friction, restitution, density };
  }

  /**
   * Berechnet den Baumgarte-Geschwindigkeits-Offset zur Korrektur von Überlappungen
   */
  computePenetrationBias(penetration, dt) {
    if (penetration <= this.slop) return 0.0;
    return (this.baumgarteFactor / Math.max(dt, 1e-4)) * (penetration - this.slop);
  }
}

// --- src/subqg/SubQGPureDynamics.mjs ---

/**
 * SubQGPureDynamics: 100% Reine SubQG-Wirkungsdynamik (First-Principles).
 *
 * Beseitigt ALLE klassischen Box2D/Game-Engine Impulssolver VOLLSTÄNDIG:
 * - Null Kontakt-Impulssolver
 * - Null Gelenk-Geschwindigkeitssolver
 *
 * Alle Bewegungen, Stöße, Reibungen und Gelenkbindungen entstehen ausschließlich
 * aus der kontinuierlichen Variation der fundamentalen SubQG-Wirkung S_SubQG:
 *
 * 1. Relationale Gravitation:
 *    F_grav = -M * ∇Phi_lattice(p) aus der stationären Kantenwirkung S_edge[x*]
 *
 * 2. Geometrische Kantenbarriere-Repulsion (Kontakt):
 *    V_barrier = 1/2 * k_subqg * δ^2  (nur bei echter geometrischer Durchdringung δ > 0)
 *    F_repulsion = -∇_p V_barrier = (k_subqg * δ - c_damp * v_normal) * n
 *
 * 3. Relationale Kanten-Scherreibung:
 *    F_shear = -mu_subqg * ||F_repulsion|| * v_tangent_dir
 *
 * 4. Topologische Gelenkbindungen (Joints):
 *    S_joint = 1/2 * k_link * ||p_B - p_A||^2
 *    F_joint = -∇ S_joint = -k_link * (p_B - p_A) - c_link * (v_B - v_A)
 */
class SubQGPureDynamics {
  constructor(graph, config = {}) {
    this.graph = graph;
    this.kBarrier = config.kBarrier ?? 3.0e4;     // Kantensteifigkeit gegen Gitter-Kompression
    this.dampBarrier = config.dampBarrier ?? 180.0; // Dissipative Gitter-Rückkopplung
    this.muSubQG = config.muSubQG ?? 0.45;        // Relationale Scherspannungs-Reibung
    this.kJointLink = config.kJointLink ?? 8.0e4; // Kantensteifigkeit topologischer Gelenkverbindungen
    this.dampJoint = config.dampJoint ?? 350.0;   // Gelenkdämpfung
  }

  /**
   * 1. Relationale Gravitation aus dem Gitterpotential-Gradienten
   * F_grav = -M * ∇Phi_lattice(p) + M * g_background
   */
  evaluateGravitationalForces(bodies, backgroundGravity = null) {
    const hasBgGravity = backgroundGravity && (backgroundGravity.x !== 0 || backgroundGravity.y !== 0);

    for (const body of bodies) {
      if (body.type !== 'dynamic' || body.mass <= 0 || body.isSleeping) continue;

      if (hasBgGravity) {
        // 1. Hintergrund-Metrikgradient (Erdbeschleunigung g):
        // Wie in Lean 4 formal bewiesen: a = -∇Phi_bg = g = const. (vollständig masseunabhängig)
        // Verhindert künstliche Gitter-Selbstbeschleunigungen oder Aufbäumen bei Fahrzeugen.
        body.applyForce(Vec2.scale(backgroundGravity, body.mass * body.gravityScale));
      } else {
        // 2. Im schwerelosen Raum / N-Körper-System: Relationaler SubQG-Gradient F = -M * ∇Phi
        const gradPhi = this.graph.sampleGradient(body.position);
        const fGrav = new Vec2(-body.mass * gradPhi.x * 50.0, -body.mass * gradPhi.y * 50.0);
        body.applyForce(fGrav);
      }
    }
  }

  /**
   * 2. Kontaktbarriere und Scherspannung aus Kantenkompression
   * Skaleninvariante SubQG-Kantenbarriere: Skaliert mit der effektiven Masse der Kontaktzone,
   * sodass leichte Körper (Planken, Kisten) und schwere Felsen dieselbe stabile
   * Kontaktfrequenz und Dämpfung erfahren und leichte Körper nicht weggeschleudert werden.
   */
  applyPureContactForces(activeManifolds, dt) {
    for (const m of activeManifolds) {
      if (m.isTrigger) continue;

      const bA = m.bodyA;
      const bB = m.bodyB;
      const normal = m.normal; // von A nach B

      // Relationale Graph-Trägheit: Nur wenn BEIDE Körper dynamisch sind (z.B. Fels auf Brückenplanke),
      // koppelt die Gelenkkette Stützmasse ein. Bei Kontakt mit statischem Boden/Terrain bleibt die echte Körpermasse wirksam.
      const isDynamicPair = bA.type === 'dynamic' && bB.type === 'dynamic';
      const jA = (isDynamicPair && bA.joints) ? bA.joints.length : 0;
      const jB = (isDynamicPair && bB.joints) ? bB.joints.length : 0;
      const jointScaleA = 1.0 + jA * 6.0;
      const jointScaleB = 1.0 + jB * 6.0;

      const invMA = bA.type === 'static' ? 0.0 : bA.invMass / jointScaleA;
      const invMB = bB.type === 'static' ? 0.0 : bB.invMass / jointScaleB;

      for (const cp of m.points) {
        const penetration = cp.penetration;
        if (penetration <= 0.0) continue;

        const rA = Vec2.sub(cp.point, bA.position);
        const rB = Vec2.sub(cp.point, bB.position);
        const rnA = rA.cross(normal);
        const rnB = rB.cross(normal);
        const invInertiaA = bA.invInertia / jointScaleA;
        const invInertiaB = bB.invInertia / jointScaleB;
        const invMassNorm = invMA + invMB + rnA * rnA * invInertiaA + rnB * rnB * invInertiaB;
        if (invMassNorm <= 0.0) continue;
        const normalMass = 1.0 / invMassNorm;

        const vA = bA.getVelocityAtPoint(cp.point);
        const vB = bB.getVelocityAtPoint(cp.point);
        const vRel = Vec2.sub(vB, vA);
        const vNormal = vRel.dot(normal);

        // Skaleninvariante SubQG Kantenreaktionskraft
        const omegaSq = 1200.0;
        const dampCoeff = 40.0;
        let fNormMag = normalMass * (omegaSq * penetration - dampCoeff * vNormal);

        // Physikalische Bündelung nach Material-Restitution: Verhindert unphysikalische Energieinjektion
        const rest = m.restitution ?? 0.05;
        const maxImpulse = normalMass * (Math.max(0.0, -vNormal * (1.0 + rest)) + (penetration / dt) * 0.45);
        fNormMag = Math.max(0.0, Math.min(fNormMag, maxImpulse / dt));
        cp.normalImpulse = fNormMag * dt;

        const fNormal = Vec2.scale(normal, fNormMag);

        // Relationale Scherspannung (Reibung)
        const tangent = m.tangent;
        const vTan = vRel.dot(tangent);
        let fShear = new Vec2(0, 0);

        if (Math.abs(vTan) > 1e-4) {
          const maxFriction = (m.friction ?? this.muSubQG) * fNormMag;
          const desiredShear = (normalMass * Math.abs(vTan)) / dt;
          const shearMag = Math.min(maxFriction, desiredShear);
          fShear = Vec2.scale(tangent, -Math.sign(vTan) * shearMag);
        }

        const fTotalOnB = Vec2.add(fNormal, fShear);

        // Stoßdynamik & Impulserhaltung über reduzierte effektive Masse:
        // mu = 1 / (invEffA + invEffB)
        // 1. Ein isoliertes Bruchstück (j=0, m=0.13 kg) hat mu <= 0.13 kg -> kann Felsen niemals wegschießen!
        // 2. Eine zusammenhängende Gelenkkette (j>0) koppelt Netzwerk-Trägheit ein.
        // 3. Statischer Boden/Terrain (invEff = 0) fängt beliebige Massen stabil ab.
        const invEffA = bA.type === 'static' ? 0.0 : bA.invMass / jointScaleA;
        const invEffB = bB.type === 'static' ? 0.0 : bB.invMass / jointScaleB;
        const effReducedMass = (invEffA + invEffB > 0.0) ? 1.0 / (invEffA + invEffB) : 0.0;

        const maxAllowedImpulse = effReducedMass * (Math.max(0.0, -vNormal * (1.0 + rest)) + (penetration / dt) * 0.75 + 2.0);
        const maxForce = maxAllowedImpulse / dt;

        const mag = fTotalOnB.length();
        const fClampedB = (mag > maxForce && maxForce > 0) ? Vec2.scale(fTotalOnB, maxForce / mag) : fTotalOnB;
        const fClampedA = fClampedB.clone().negate();

        if (bB.type === 'dynamic') {
          bB.applyForceAtPoint(fClampedB, cp.point);
        }
        if (bA.type === 'dynamic') {
          bA.applyForceAtPoint(fClampedA, cp.point);
        }
      }
    }
  }

  /**
   * 3. Topologische Gelenkbindungen aus Kantenwirkungs-Variation (ohne Impulssolver)
   * Berechnet kontinuierliche Rückstellkräfte aus der Variation der harmonischen Kantenbindung
   * S_joint = 1/2 * k_link * ||p_B - p_A||^2 skaliert über den effektiven Trägheitstensor.
   */
  applyPureJointForces(joints, dt) {
    for (const j of joints) {
      const bA = j.bodyA;
      const bB = j.bodyB;

      if (j.type === 'revolute') {
        const pA = bA.transform.transformPoint(j.localAnchorA);
        const pB = bB.transform.transformPoint(j.localAnchorB);
        const delta = Vec2.sub(pB, pA);

        const vA = bA.getVelocityAtPoint(pA);
        const vB = bB.getVelocityAtPoint(pB);
        const vRel = Vec2.sub(vB, vA);

        const rA = Vec2.sub(pA, bA.position);
        const rB = Vec2.sub(pB, bB.position);
        const invMass = bA.invMass + bB.invMass;
        if (invMass <= 0) continue;

        const k11 = invMass + rA.y * rA.y * bA.invInertia + rB.y * rB.y * bB.invInertia;
        const k12 = -rA.x * rA.y * bA.invInertia - rB.x * rB.y * bB.invInertia;
        const k21 = k12;
        const k22 = invMass + rA.x * rA.x * bA.invInertia + rB.x * rB.x * bB.invInertia;

        const K = new Mat22().setElements(k11, k12, k21, k22);
        const K_inv = K.invert();

        // Kontinuierliche Kantenwirkung ohne Impulssolver
        const targetA = Vec2.scale(delta, 180.0).add(Vec2.scale(vRel, 20.0));
        const fOnB = K_inv.mulVec(targetA).negate();
        const fOnA = fOnB.clone().negate();

        if (bB.type === 'dynamic') bB.applyForceAtPoint(fOnB, pB);
        if (bA.type === 'dynamic') bA.applyForceAtPoint(fOnA, pA);

        // Motor (falls aktiv) als kontinuierliches Drehmoment
        if (j.enableMotor) {
          const wRel = bB.angularVelocity - bA.angularVelocity - j.motorSpeed;
          const torque = -Math.max(-j.maxMotorTorque, Math.min(j.maxMotorTorque, wRel * 20.0));
          if (bB.type === 'dynamic') bB.applyTorque(torque);
          if (bA.type === 'dynamic') bA.applyTorque(-torque);
        }

      } else if (j.type === 'distance') {
        const pA = bA.transform.transformPoint(j.localAnchorA);
        const pB = bB.transform.transformPoint(j.localAnchorB);
        const d = Vec2.sub(pB, pA);
        const len = d.length();
        if (len > 1e-6) {
          const u = Vec2.scale(d, 1.0 / len);
          const diff = len - j.length;
          const vA = bA.getVelocityAtPoint(pA);
          const vB = bB.getVelocityAtPoint(pB);
          const vRel = Vec2.sub(vB, vA).dot(u);

          const rA = Vec2.sub(pA, bA.position);
          const rB = Vec2.sub(pB, bB.position);
          const rAcrossU = rA.cross(u);
          const rBcrossU = rB.cross(u);
          const invM = bA.invMass + bB.invMass + rAcrossU * rAcrossU * bA.invInertia + rBcrossU * rBcrossU * bB.invInertia;
          if (invM <= 0) continue;

          const fMag = -(180.0 * diff + 20.0 * vRel) / invM;
          const fOnB = Vec2.scale(u, fMag);
          const fOnA = fOnB.clone().negate();

          if (bB.type === 'dynamic') bB.applyForceAtPoint(fOnB, pB);
          if (bA.type === 'dynamic') bA.applyForceAtPoint(fOnA, pA);
        }

      } else if (j.type === 'weld') {
        const pA = bA.transform.transformPoint(j.localAnchorA);
        const pB = bB.transform.transformPoint(j.localAnchorB);
        const delta = Vec2.sub(pB, pA);
        const rA = Vec2.sub(pA, bA.position);
        const rB = Vec2.sub(pB, bB.position);
        const vA = bA.getVelocityAtPoint(pA);
        const vB = bB.getVelocityAtPoint(pB);
        const vRel = Vec2.sub(vB, vA);

        const invMass = bA.invMass + bB.invMass;
        if (invMass > 0) {
          const k11 = invMass + rA.y * rA.y * bA.invInertia + rB.y * rB.y * bB.invInertia;
          const k12 = -rA.x * rA.y * bA.invInertia - rB.x * rB.y * bB.invInertia;
          const k21 = k12;
          const k22 = invMass + rA.x * rA.x * bA.invInertia + rB.x * rB.x * bB.invInertia;

          const K = new Mat22().setElements(k11, k12, k21, k22);
          const K_inv = K.invert();

          const targetA = Vec2.scale(delta, 180.0).add(Vec2.scale(vRel, 20.0));
          const fOnB = K_inv.mulVec(targetA).negate();
          const fOnA = fOnB.clone().negate();

          if (bB.type === 'dynamic') bB.applyForceAtPoint(fOnB, pB);
          if (bA.type === 'dynamic') bA.applyForceAtPoint(fOnA, pA);
        }

        // Winkelbindung
        const dAngle = bB.angle - bA.angle - j.referenceAngle;
        const dOmega = bB.angularVelocity - bA.angularVelocity;
        const invI = bA.invInertia + bB.invInertia;
        if (invI > 0) {
          const torque = -(100.0 * dAngle + 15.0 * dOmega) / invI;
          if (bB.type === 'dynamic') bB.applyTorque(torque);
          if (bA.type === 'dynamic') bA.applyTorque(-torque);
        }
      }
    }
  }
}

// --- src/collision/narrowphase/CollisionNarrowphase.mjs ---

/**
 * CollisionNarrowphase: Präzise Kollisionserkennung und Manifold-Generierung
 * für alle Paarungen geometrischer Formen.
 */
class CollisionNarrowphase {
  constructor(bridge) {
    this.bridge = bridge;
  }

  /**
   * Prüft zwei Formen auf Kollision und liefert ContactManifold oder null
   */
  collide(bodyA, bodyB, shapeA, shapeB) {
    const typeA = shapeA.type;
    const typeB = shapeB.type;

    // Sortiere Paare für kanonische Handler
    if (typeA === 'circle' && typeB === 'circle') {
      return this.collideCircleCircle(bodyA, bodyB, shapeA, shapeB);
    }
    if (typeA === 'circle' && typeB === 'box') {
      return this.collideCircleBox(bodyA, bodyB, shapeA, shapeB);
    }
    if (typeA === 'box' && typeB === 'circle') {
      return this.collideCircleBox(bodyB, bodyA, shapeB, shapeA, true);
    }
    if (typeA === 'circle' && typeB === 'polygon') {
      return this.collideCirclePolygon(bodyA, bodyB, shapeA, shapeB);
    }
    if (typeA === 'polygon' && typeB === 'circle') {
      return this.collideCirclePolygon(bodyB, bodyA, shapeB, shapeA, true);
    }
    if (typeA === 'circle' && typeB === 'segment') {
      return this.collideCircleSegment(bodyA, bodyB, shapeA, shapeB);
    }
    if (typeA === 'segment' && typeB === 'circle') {
      return this.collideCircleSegment(bodyB, bodyA, shapeB, shapeA, true);
    }
    if (typeA === 'circle' && typeB === 'capsule') {
      return this.collideCircleCapsule(bodyA, bodyB, shapeA, shapeB);
    }
    if (typeA === 'capsule' && typeB === 'circle') {
      return this.collideCircleCapsule(bodyB, bodyA, shapeB, shapeA, true);
    }

    // Box & Polygon Kombinationen (über SAT)
    if ((typeA === 'box' || typeA === 'polygon') && (typeB === 'box' || typeB === 'polygon')) {
      return this.collidePolyPoly(bodyA, bodyB, shapeA, shapeB);
    }

    // Segment vs Box / Polygon
    if (typeA === 'segment' && (typeB === 'box' || typeB === 'polygon')) {
      return this.collideSegmentPoly(bodyA, bodyB, shapeA, shapeB);
    }
    if ((typeA === 'box' || typeA === 'polygon') && typeB === 'segment') {
      return this.collideSegmentPoly(bodyB, bodyA, shapeB, shapeA, true);
    }

    // Capsule vs Box / Polygon / Capsule / Segment
    if (typeA === 'capsule' && (typeB === 'box' || typeB === 'polygon')) {
      return this.collideCapsulePoly(bodyA, bodyB, shapeA, shapeB);
    }
    if ((typeA === 'box' || typeA === 'polygon') && typeB === 'capsule') {
      return this.collideCapsulePoly(bodyB, bodyA, shapeB, shapeA, true);
    }
    if (typeA === 'capsule' && typeB === 'capsule') {
      return this.collideCapsuleCapsule(bodyA, bodyB, shapeA, shapeB);
    }
    if (typeA === 'capsule' && typeB === 'segment') {
      return this.collideCapsuleSegment(bodyA, bodyB, shapeA, shapeB);
    }
    if (typeA === 'segment' && typeB === 'capsule') {
      return this.collideCapsuleSegment(bodyB, bodyA, shapeB, shapeA, true);
    }

    return null;
  }

  _initManifold(bodyA, bodyB, shapeA, shapeB, flip = false) {
    const m = flip
      ? new ContactManifold(bodyB, bodyA, shapeB, shapeA)
      : new ContactManifold(bodyA, bodyB, shapeA, shapeB);

    const comb = this.bridge.combineMaterials(shapeA.material, shapeB.material);
    m.friction = comb.friction;
    m.restitution = comb.restitution;
    return m;
  }

  /**
   * Kreis vs Kreis
   */
  collideCircleCircle(bodyA, bodyB, circleA, circleB, flip = false) {
    const centerA = bodyA.transform.transformPoint(circleA.offset);
    const centerB = bodyB.transform.transformPoint(circleB.offset);

    const delta = Vec2.sub(centerB, centerA);
    const distSq = delta.lengthSq();
    const rSum = circleA.radius + circleB.radius;

    if (distSq >= rSum * rSum) return null;

    const dist = Math.sqrt(distSq);
    let normal;
    if (dist > 1e-9) {
      normal = Vec2.scale(delta, 1.0 / dist);
    } else {
      normal = new Vec2(0, 1);
    }

    const penetration = rSum - dist;
    const contactPoint = Vec2.add(centerA, Vec2.scale(normal, circleA.radius - penetration * 0.5));

    const manifold = this._initManifold(bodyA, bodyB, circleA, circleB, flip);
    manifold.normal = flip ? normal.clone().negate() : normal;
    manifold.tangent = manifold.normal.perp();
    manifold.addPoint(contactPoint, penetration);

    return manifold;
  }

  /**
   * Kreis vs Box
   */
  collideCircleBox(bodyA, bodyB, circleA, boxB, flip = false) {
    const centerA = bodyA.transform.transformPoint(circleA.offset);
    // Bringe Kreiszentrum ins lokale Box-System
    const localCenter = bodyB.transform.inverseTransformPoint(centerA);
    const boxOffset = boxB.offset;

    // Nächsten Punkt auf der Kiste finden
    const cx = Math.max(boxOffset.x - boxB.hx, Math.min(boxOffset.x + boxB.hx, localCenter.x));
    const cy = Math.max(boxOffset.y - boxB.hy, Math.min(boxOffset.y + boxB.hy, localCenter.y));
    const closestLocal = new Vec2(cx, cy);

    let localDelta = Vec2.sub(localCenter, closestLocal);
    let distSq = localDelta.lengthSq();
    let inside = false;

    // Falls Zentrum innerhalb der Kiste liegt
    if (distSq < 1e-12) {
      inside = true;
      const dx1 = (boxOffset.x + boxB.hx) - localCenter.x;
      const dx2 = localCenter.x - (boxOffset.x - boxB.hx);
      const dy1 = (boxOffset.y + boxB.hy) - localCenter.y;
      const dy2 = localCenter.y - (boxOffset.y - boxB.hy);
      const minVal = Math.min(dx1, dx2, dy1, dy2);

      if (minVal === dx1) closestLocal.x = boxOffset.x + boxB.hx;
      else if (minVal === dx2) closestLocal.x = boxOffset.x - boxB.hx;
      else if (minVal === dy1) closestLocal.y = boxOffset.y + boxB.hy;
      else closestLocal.y = boxOffset.y - boxB.hy;

      localDelta = Vec2.sub(localCenter, closestLocal);
      distSq = localDelta.lengthSq();
    }

    if (!inside && distSq > circleA.radius * circleA.radius) {
      return null;
    }

    const dist = Math.sqrt(distSq);
    const worldClosest = bodyB.transform.transformPoint(closestLocal);

    let normal;
    let penetration;
    if (inside) {
      // Normale von A (Kreis) nach B (Box) -> zeigt in Kiste
      const localNorm = localDelta.normalize().negate();
      normal = bodyB.transform.transformVector(localNorm);
      penetration = circleA.radius + dist;
    } else {
      const localNorm = localDelta.normalize();
      // Normale von Kreis zu Box zeigt von A nach B -> localNorm invertieren
      normal = bodyB.transform.transformVector(localNorm).negate();
      penetration = circleA.radius - dist;
    }

    const manifold = this._initManifold(bodyA, bodyB, circleA, boxB, flip);
    manifold.normal = flip ? normal.clone().negate() : normal;
    manifold.tangent = manifold.normal.perp();
    manifold.addPoint(worldClosest, penetration);

    return manifold;
  }

  /**
   * Kreis vs Polygon
   */
  collideCirclePolygon(bodyA, bodyB, circleA, polyB, flip = false) {
    const centerA = bodyA.transform.transformPoint(circleA.offset);
    const verts = polyB.getWorldVertices(bodyB.transform);
    const normals = polyB.getWorldNormals(bodyB.transform);
    const n = verts.length;

    let maxSep = -Infinity;
    let bestEdge = 0;

    for (let i = 0; i < n; i++) {
      const v = verts[i];
      const norm = normals[i];
      const sep = norm.dot(Vec2.sub(centerA, v));
      if (sep > circleA.radius) {
        return null; // Außerhalb des Radius
      }
      if (sep > maxSep) {
        maxSep = sep;
        bestEdge = i;
      }
    }

    const v1 = verts[bestEdge];
    const v2 = verts[(bestEdge + 1) % n];
    const edge = Vec2.sub(v2, v1);
    const edgeLenSq = edge.lengthSq();
    const toCenter = Vec2.sub(centerA, v1);
    const u = Math.max(0, Math.min(1, toCenter.dot(edge) / edgeLenSq));
    const closest = Vec2.add(v1, Vec2.scale(edge, u));

    const delta = Vec2.sub(closest, centerA);
    const distSq = delta.lengthSq();
    if (distSq > circleA.radius * circleA.radius) return null;

    const dist = Math.sqrt(distSq);
    const normal = dist > 1e-9 ? Vec2.scale(delta, 1.0 / dist) : normals[bestEdge].clone();
    const penetration = circleA.radius - dist;

    const manifold = this._initManifold(bodyA, bodyB, circleA, polyB, flip);
    manifold.normal = flip ? normal.clone().negate() : normal;
    manifold.tangent = manifold.normal.perp();
    manifold.addPoint(closest, penetration);

    return manifold;
  }

  /**
   * Kreis vs Liniensegment
   */
  collideCircleSegment(bodyA, bodyB, circleA, segB, flip = false) {
    const centerA = bodyA.transform.transformPoint(circleA.offset);
    const [w1, w2] = segB.getWorldEndpoints(bodyB.transform);
    const edge = Vec2.sub(w2, w1);
    const edgeLenSq = edge.lengthSq();

    const toCenter = Vec2.sub(centerA, w1);
    const t = Math.max(0, Math.min(1, toCenter.dot(edge) / edgeLenSq));
    const closest = Vec2.add(w1, Vec2.scale(edge, t));

    const delta = Vec2.sub(closest, centerA);
    const distSq = delta.lengthSq();
    const rSum = circleA.radius + segB.thickness;

    if (distSq >= rSum * rSum) return null;

    const dist = Math.sqrt(distSq);
    const normal = dist > 1e-9 ? Vec2.scale(delta, 1.0 / dist) : new Vec2(0, 1);
    const penetration = rSum - dist;

    const manifold = this._initManifold(bodyA, bodyB, circleA, segB, flip);
    manifold.normal = flip ? normal.clone().negate() : normal;
    manifold.tangent = manifold.normal.perp();
    manifold.addPoint(closest, penetration);

    return manifold;
  }

  /**
   * Kreis vs Kapsel
   */
  collideCircleCapsule(bodyA, bodyB, circleA, capB, flip = false) {
    const centerA = bodyA.transform.transformPoint(circleA.offset);
    const [p1, p2] = capB.getWorldEndpoints(bodyB.transform);
    const seg = Vec2.sub(p2, p1);
    const lenSq = seg.lengthSq();

    const t = Math.max(0, Math.min(1, Vec2.sub(centerA, p1).dot(seg) / lenSq));
    const closest = Vec2.add(p1, Vec2.scale(seg, t));

    const delta = Vec2.sub(closest, centerA);
    const distSq = delta.lengthSq();
    const rSum = circleA.radius + capB.radius;

    if (distSq >= rSum * rSum) return null;

    const dist = Math.sqrt(distSq);
    const normal = dist > 1e-9 ? Vec2.scale(delta, 1.0 / dist) : new Vec2(0, 1);
    const penetration = rSum - dist;
    const contactPt = Vec2.add(centerA, Vec2.scale(normal, circleA.radius - penetration * 0.5));

    const manifold = this._initManifold(bodyA, bodyB, circleA, capB, flip);
    manifold.normal = flip ? normal.clone().negate() : normal;
    manifold.tangent = manifold.normal.perp();
    manifold.addPoint(contactPt, penetration);

    return manifold;
  }

  /**
   * Polygon/Box vs Polygon/Box via SAT
   */
  collidePolyPoly(bodyA, bodyB, shapeA, shapeB, flip = false) {
    const vertsA = shapeA.getWorldVertices(bodyA.transform);
    const normalsA = shapeA.getWorldNormals(bodyA.transform);
    const vertsB = shapeB.getWorldVertices(bodyB.transform);
    const normalsB = shapeB.getWorldNormals(bodyB.transform);

    const satResult = SAT.collidePolygons(
      vertsA, normalsA, bodyA.position,
      vertsB, normalsB, bodyB.position
    );

    if (!satResult.collision) return null;

    const manifold = this._initManifold(bodyA, bodyB, shapeA, shapeB, flip);
    manifold.normal = flip ? satResult.normal.clone().negate() : satResult.normal;
    manifold.tangent = manifold.normal.perp();

    for (const pt of satResult.points) {
      manifold.addPoint(pt.point, pt.depth);
    }

    return manifold;
  }

  /**
   * Segment vs Box / Polygon
   */
  collideSegmentPoly(bodyA, bodyB, segA, polyB, flip = false) {
    // Segment als dünnes Polygon behandeln
    const [w1, w2] = segA.getWorldEndpoints(bodyA.transform);
    const edge = Vec2.sub(w2, w1);
    const norm = new Vec2(edge.y, -edge.x).normalize();
    const halfThick = segA.thickness * 0.5;

    const segVerts = [
      Vec2.add(w1, Vec2.scale(norm, halfThick)),
      Vec2.add(w2, Vec2.scale(norm, halfThick)),
      Vec2.sub(w2, Vec2.scale(norm, halfThick)),
      Vec2.sub(w1, Vec2.scale(norm, halfThick))
    ];
    const segNorms = [
      norm.clone(),
      edge.clone().normalize(),
      norm.clone().negate(),
      edge.clone().normalize().negate()
    ];

    const vertsB = polyB.getWorldVertices(bodyB.transform);
    const normalsB = polyB.getWorldNormals(bodyB.transform);

    const satResult = SAT.collidePolygons(
      segVerts, segNorms, bodyA.position,
      vertsB, normalsB, bodyB.position
    );

    if (!satResult.collision) return null;

    const manifold = this._initManifold(bodyA, bodyB, segA, polyB, flip);
    manifold.normal = flip ? satResult.normal.clone().negate() : satResult.normal;
    manifold.tangent = manifold.normal.perp();

    for (const pt of satResult.points) {
      manifold.addPoint(pt.point, pt.depth);
    }

    return manifold;
  }

  /**
   * Capsule vs Polygon/Box
   */
  collideCapsulePoly(bodyA, bodyB, capA, polyB, flip = false) {
    // Kapsel als Segment mit Radius r behandeln
    const [p1, p2] = capA.getWorldEndpoints(bodyA.transform);
    const seg = Vec2.sub(p2, p1);
    const vertsB = polyB.getWorldVertices(bodyB.transform);
    const normalsB = polyB.getWorldNormals(bodyB.transform);

    // Finde tiefsten Endpunkt oder projiziere Segment auf Polygon-Normalen
    let bestSep = -Infinity;
    let bestNorm = null;

    for (let i = 0; i < normalsB.length; i++) {
      const n = normalsB[i];
      const d1 = n.dot(Vec2.sub(p1, vertsB[i]));
      const d2 = n.dot(Vec2.sub(p2, vertsB[i]));
      const minD = Math.min(d1, d2);
      if (minD > capA.radius) {
        return null; // Trennung!
      }
      if (minD > bestSep) {
        bestSep = minD;
        bestNorm = n;
      }
    }

    // Wenn keine trennende Achse existiert, erstelle Kontakt
    const manifold = this._initManifold(bodyA, bodyB, capA, polyB, flip);
    const normal = bestNorm ? bestNorm.clone().negate() : new Vec2(0, -1);
    manifold.normal = flip ? normal.clone().negate() : normal;
    manifold.tangent = manifold.normal.perp();

    // Teste beide Kapsel-Endpunkte als Kreis-Kontakte
    for (const p of [p1, p2]) {
      let inside = true;
      let minPen = Infinity;
      let closestPt = null;

      for (let i = 0; i < vertsB.length; i++) {
        const v1 = vertsB[i];
        const v2 = vertsB[(i + 1) % vertsB.length];
        const edge = Vec2.sub(v2, v1);
        const norm = normalsB[i];
        const dist = norm.dot(Vec2.sub(p, v1));
        if (dist > capA.radius) {
          inside = false;
          break;
        }
        const pen = capA.radius - dist;
        if (pen < minPen) {
          minPen = pen;
          closestPt = Vec2.add(p, Vec2.scale(norm, -dist));
        }
      }

      if (inside && closestPt) {
        manifold.addPoint(closestPt, minPen);
      }
    }

    if (manifold.points.length === 0) {
      const mid = Vec2.lerp(p1, p2, 0.5);
      manifold.addPoint(mid, capA.radius - bestSep);
    }

    return manifold;
  }

  /**
   * Capsule vs Capsule
   */
  collideCapsuleCapsule(bodyA, bodyB, capA, capB, flip = false) {
    const [a1, a2] = capA.getWorldEndpoints(bodyA.transform);
    const [b1, b2] = capB.getWorldEndpoints(bodyB.transform);

    // Kürzesten Abstand zwischen zwei Raumsegmenten berechnen
    const segA = Vec2.sub(a2, a1);
    const segB = Vec2.sub(b2, b1);
    const r = Vec2.sub(a1, b1);

    const a = segA.dot(segA);
    const e = segB.dot(segB);
    const f = segB.dot(r);

    let s = 0.0;
    let t = 0.0;

    const c = segA.dot(r);
    const b = segA.dot(segB);
    const denom = a * e - b * b;

    if (denom !== 0.0) {
      s = Math.max(0.0, Math.min(1.0, (b * f - c * e) / denom));
    }

    t = (b * s + f) / e;
    if (t < 0.0) {
      t = 0.0;
      s = Math.max(0.0, Math.min(1.0, -c / a));
    } else if (t > 1.0) {
      t = 1.0;
      s = Math.max(0.0, Math.min(1.0, (b - c) / a));
    }

    const closestA = Vec2.add(a1, Vec2.scale(segA, s));
    const closestB = Vec2.add(b1, Vec2.scale(segB, t));

    const delta = Vec2.sub(closestB, closestA);
    const distSq = delta.lengthSq();
    const rSum = capA.radius + capB.radius;

    if (distSq >= rSum * rSum) return null;

    const dist = Math.sqrt(distSq);
    const normal = dist > 1e-9 ? Vec2.scale(delta, 1.0 / dist) : new Vec2(0, 1);
    const penetration = rSum - dist;
    const pt = Vec2.add(closestA, Vec2.scale(normal, capA.radius - penetration * 0.5));

    const manifold = this._initManifold(bodyA, bodyB, capA, capB, flip);
    manifold.normal = flip ? normal.clone().negate() : normal;
    manifold.tangent = manifold.normal.perp();
    manifold.addPoint(pt, penetration);

    return manifold;
  }

  /**
   * Capsule vs Segment
   */
  collideCapsuleSegment(bodyA, bodyB, capA, segB, flip = false) {
    // Ähnlich wie Capsule-Capsule mit Segment-Radius = segB.thickness
    const [a1, a2] = capA.getWorldEndpoints(bodyA.transform);
    const [b1, b2] = segB.getWorldEndpoints(bodyB.transform);

    const segA = Vec2.sub(a2, a1);
    const segB_vec = Vec2.sub(b2, b1);
    const r = Vec2.sub(a1, b1);

    const a = segA.dot(segA);
    const e = segB_vec.dot(segB_vec);
    const f = segB_vec.dot(r);

    let s = 0.0, t = 0.0;
    const c = segA.dot(r);
    const b = segA.dot(segB_vec);
    const denom = a * e - b * b;

    if (denom !== 0.0) s = Math.max(0.0, Math.min(1.0, (b * f - c * e) / denom));
    t = (b * s + f) / e;
    if (t < 0.0) { t = 0.0; s = Math.max(0.0, Math.min(1.0, -c / a)); }
    else if (t > 1.0) { t = 1.0; s = Math.max(0.0, Math.min(1.0, (b - c) / a)); }

    const closestA = Vec2.add(a1, Vec2.scale(segA, s));
    const closestB = Vec2.add(b1, Vec2.scale(segB_vec, t));

    const delta = Vec2.sub(closestB, closestA);
    const distSq = delta.lengthSq();
    const rSum = capA.radius + segB.thickness;

    if (distSq >= rSum * rSum) return null;

    const dist = Math.sqrt(distSq);
    const normal = dist > 1e-9 ? Vec2.scale(delta, 1.0 / dist) : new Vec2(0, 1);
    const penetration = rSum - dist;

    const manifold = this._initManifold(bodyA, bodyB, capA, segB, flip);
    manifold.normal = flip ? normal.clone().negate() : normal;
    manifold.tangent = manifold.normal.perp();
    manifold.addPoint(closestB, penetration);

    return manifold;
  }
}

// --- src/dynamics/Body.mjs ---

let nextBodyId = 1;

/**
 * Body: Repräsentiert einen starren Körper (RigidBody) in der Simulation.
 *
 * Unterstützte Typen:
 * - 'dynamic': Vollständig physikalisch simuliert (Kräfte, Gravitation, Stöße).
 * - 'static': Feste Umgebung (Böden, Wände, Hindernisse). Unendliche Masse, bewegt sich nicht.
 * - 'kinematic': Bewegt sich rein durch gesetzte Geschwindigkeit, wird nicht von Kräften beschleunigt.
 */
class Body {
  constructor(config = {}) {
    this.id = nextBodyId++;
    this.type = config.type ?? 'dynamic'; // 'dynamic', 'static', 'kinematic'

    // Zustandsvariablen
    this.position = config.position ? config.position.clone() : new Vec2(0, 0);
    this.velocity = config.velocity ? config.velocity.clone() : new Vec2(0, 0);
    this.angle = config.angle ?? 0.0;
    this.angularVelocity = config.angularVelocity ?? 0.0;

    // Gespeicherte Transformation
    this.transform = new Transform(this.position, this.angle);

    // Akkumulierte Kräfte und Drehmomente für aktuellen Zeitschritt
    this.force = new Vec2(0, 0);
    this.torque = 0.0;

    // Dämpfung und Skalierungen
    this.linearDamping = config.linearDamping ?? 0.01;
    this.angularDamping = config.angularDamping ?? 0.02;
    this.gravityScale = config.gravityScale ?? 1.0;

    // Massendaten
    this.mass = 0.0;
    this.invMass = 0.0;
    this.inertia = 0.0;
    this.invInertia = 0.0;

    // Zerstörbarkeit & Materialbruch (SubQG Destruction Physics)
    this.isDestructible = config.isDestructible ?? false;
    this.fractureForce = config.fractureForce ?? 1500.0;
    this.isBroken = false;

    // Formen des Körpers (Compound Body Support)
    this.shapes = [];
    this.aabb = new AABB();
    this.boundingRadius = 0.5;

    // Schlafzustand (Sleeping Island Optimization)
    this.isSleeping = false;
    this.allowSleep = config.allowSleep ?? true;
    this.sleepTime = 0.0;

    // Benutzerdefinierte Daten (z. B. Spiel-Logik, Sprites, Entities)
    this.userData = config.userData ?? null;

    // Broadphase Tree Leaf Referenz
    this.treeLeaf = null;

    if (config.shape) {
      this.addShape(config.shape);
    }
  }

  addShape(shape) {
    shape.body = this;
    if (!shape.id) shape.id = nextBodyId++;
    this.shapes.push(shape);
    this._recomputeMassData();
    this.updateAABB();
    this.wakeUp();
    return this;
  }

  removeShape(shape) {
    const idx = this.shapes.indexOf(shape);
    if (idx !== -1) {
      this.shapes.splice(idx, 1);
      shape.body = null;
      this._recomputeMassData();
      this.updateAABB();
      this.wakeUp();
    }
    return this;
  }

  _recomputeMassData() {
    let totalMass = 0.0;
    let totalInertia = 0.0;
    let maxRadius = 0.1;

    for (const shape of this.shapes) {
      const data = shape.computeMassData(shape.material.density);
      totalMass += data.mass;
      totalInertia += data.inertia;

      // Ungefährer Hüllradius
      const r = shape.radius || Math.hypot(shape.width || 0.5, shape.height || 0.5);
      if (r > maxRadius) maxRadius = r;
    }

    if (this.type === 'static') {
      // Statische Körper (z.B. Planeten, Böden) besitzen Gravitationsmasse für das SubQG-Gitter,
      // aber inverse Masse = 0, sodass sie kinematisch unbeweglich sind.
      this.mass = totalMass > 0 ? totalMass : 0.0;
      this.invMass = 0.0;
      this.inertia = totalInertia > 0 ? totalInertia : 0.0;
      this.invInertia = 0.0;
      this.boundingRadius = maxRadius;
      return;
    }

    if (totalMass > 0.0) {
      this.mass = totalMass;
      this.invMass = 1.0 / totalMass;
      this.inertia = Math.max(1e-4, totalInertia);
      this.invInertia = 1.0 / this.inertia;
    } else {
      this.mass = 1.0;
      this.invMass = 1.0;
      this.inertia = 1.0;
      this.invInertia = 1.0;
    }

    this.boundingRadius = maxRadius;
  }

  updateAABB() {
    this.transform.set(this.position, this.angle);
    this.aabb.reset();
    for (const shape of this.shapes) {
      const shapeAABB = shape.computeAABB(this.transform);
      this.aabb.combine(shapeAABB);
    }
    return this.aabb;
  }

  setPosition(x, y) {
    this.position.set(x, y);
    this.updateAABB();
    this.wakeUp();
    return this;
  }

  setAngle(angle) {
    this.angle = angle;
    this.updateAABB();
    this.wakeUp();
    return this;
  }

  setVelocity(vx, vy) {
    this.velocity.set(vx, vy);
    this.wakeUp();
    return this;
  }

  setAngularVelocity(w) {
    this.angularVelocity = w;
    this.wakeUp();
    return this;
  }

  applyForce(f) {
    if (this.type !== 'dynamic' || this.isSleeping) return;
    this.force.add(f);
    this.wakeUp();
  }

  applyTorque(t) {
    if (this.type !== 'dynamic' || this.isSleeping) return;
    this.torque += t;
    this.wakeUp();
  }

  applyForceAtPoint(f, worldPoint) {
    if (this.type !== 'dynamic' || this.isSleeping) return;
    this.force.add(f);
    const r = Vec2.sub(worldPoint, this.position);
    this.torque += r.cross(f);
    this.wakeUp();
  }

  applyImpulse(impulse) {
    if (this.type !== 'dynamic') return;
    this.velocity.addScaled(impulse, this.invMass);
    this.wakeUp();
  }

  applyAngularImpulse(impulse) {
    if (this.type !== 'dynamic') return;
    this.angularVelocity += impulse * this.invInertia;
    this.wakeUp();
  }

  applyImpulseAtPoint(impulse, worldPoint) {
    if (this.type !== 'dynamic') return;
    this.velocity.addScaled(impulse, this.invMass);
    const r = Vec2.sub(worldPoint, this.position);
    this.angularVelocity += r.cross(impulse) * this.invInertia;
    this.wakeUp();
  }

  getVelocityAtPoint(worldPoint) {
    const r = Vec2.sub(worldPoint, this.position);
    return new Vec2(
      this.velocity.x - this.angularVelocity * r.y,
      this.velocity.y + this.angularVelocity * r.x
    );
  }

  wakeUp() {
    this.isSleeping = false;
    this.sleepTime = 0.0;
  }

  putToSleep() {
    if (!this.allowSleep || this.type !== 'dynamic') return;
    this.isSleeping = true;
    this.velocity.set(0, 0);
    this.angularVelocity = 0.0;
    this.force.set(0, 0);
    this.torque = 0.0;
  }

  integrateForces(dt) {
    if (this.type !== 'dynamic' || this.isSleeping) return;

    // Halber Geschwindigkeitsschritt oder Euler: v += dt * (F * invMass)
    this.velocity.addScaled(this.force, dt * this.invMass);
    this.angularVelocity += (this.torque * this.invInertia) * dt;

    // Dämpfung (Luftwiderstand)
    const linDamp = Math.max(0.0, 1.0 - this.linearDamping * dt);
    const angDamp = Math.max(0.0, 1.0 - this.angularDamping * dt);
    this.velocity.scale(linDamp);
    this.angularVelocity *= angDamp;

    // Kräfte für nächsten Zeitschritt leeren
    this.force.set(0, 0);
    this.torque = 0.0;
  }

  integrateVelocities(dt) {
    if (this.type === 'static' || this.isSleeping) return;

    // Schutzgrenze gegen unphysikalische Überschall-Geschwindigkeiten
    const maxSpeed = 30.0; // 30 m/s = 108 km/h
    const speedSq = this.velocity.lengthSq();
    if (speedSq > maxSpeed * maxSpeed) {
      this.velocity.scale(maxSpeed / Math.sqrt(speedSq));
    }
    const maxAngSpeed = 35.0; // rad/s
    if (Math.abs(this.angularVelocity) > maxAngSpeed) {
      this.angularVelocity = Math.sign(this.angularVelocity) * maxAngSpeed;
    }

    this.position.addScaled(this.velocity, dt);
    this.angle += this.angularVelocity * dt;

    this.updateAABB();
  }
}

// --- src/dynamics/ContactSolver.mjs ---

/**
 * ContactSolver: Hochpräziser sequentieller Impulssolver (Projected Gauss-Seidel)
 * zur simultanen Lösung von Normalstößen, Haft-/Gleitreibung (Coulomb-Reibungskegel)
 * und elastischem Rückprall mit Warm-Starting und Baumgarte-Stabilisierung.
 */
class ContactSolver {
  constructor(bridge) {
    this.bridge = bridge;
    this.restitutionThreshold = 0.5; // m/s: darunter elastischer Stoß abgedämpft gegen Ruhezittern
  }

  initVelocityConstraints(manifolds, dt) {
    for (const m of manifolds) {
      if (m.isTrigger) continue;

      const bA = m.bodyA;
      const bB = m.bodyB;
      const mA = bA.invMass;
      const mB = bB.invMass;
      const iA = bA.invInertia;
      const iB = bB.invInertia;
      const normal = m.normal;
      const tangent = m.tangent;

      for (const cp of m.points) {
        // Hebelarme berechnen
        cp.rA = Vec2.sub(cp.point, bA.position);
        cp.rB = Vec2.sub(cp.point, bB.position);

        const rnA = cp.rA.cross(normal);
        const rnB = cp.rB.cross(normal);
        const kNormal = mA + mB + iA * rnA * rnA + iB * rnB * rnB;
        cp.normalMass = kNormal > 1e-12 ? 1.0 / kNormal : 0.0;

        const rtA = cp.rA.cross(tangent);
        const rtB = cp.rB.cross(tangent);
        const kTangent = mA + mB + iA * rtA * rtA + iB * rtB * rtB;
        cp.tangentMass = kTangent > 1e-12 ? 1.0 / kTangent : 0.0;

        // Relative Geschwindigkeit an Kontaktstelle
        const vA = bA.getVelocityAtPoint(cp.point);
        const vB = bB.getVelocityAtPoint(cp.point);
        const vRel = Vec2.sub(vB, vA);
        const vNormal = vRel.dot(normal);

        // Baumgarte-Stabilisierung
        const penBias = this.bridge.computePenetrationBias(cp.penetration, dt);

        // Restitutions-Bias (Rückprall)
        let restBias = 0.0;
        if (vNormal < -this.restitutionThreshold) {
          restBias = -m.restitution * vNormal;
        }

        cp.bias = penBias + restBias;

        // Warm-Starting: Wende akkumulierte Impulse aus vorherigem Frame an
        const p = Vec2.add(
          Vec2.scale(normal, cp.normalImpulse),
          Vec2.scale(tangent, cp.tangentImpulse)
        );

        if (bA.type === 'dynamic') {
          bA.velocity.subScaled(p, mA);
          bA.angularVelocity -= iA * cp.rA.cross(p);
        }
        if (bB.type === 'dynamic') {
          bB.velocity.addScaled(p, mB);
          bB.angularVelocity += iB * cp.rB.cross(p);
        }
      }
    }
  }

  solveVelocityConstraints(manifolds) {
    for (const m of manifolds) {
      if (m.isTrigger) continue;

      const bA = m.bodyA;
      const bB = m.bodyB;
      const mA = bA.invMass;
      const mB = bB.invMass;
      const iA = bA.invInertia;
      const iB = bB.invInertia;
      const normal = m.normal;
      const tangent = m.tangent;
      const friction = m.friction;

      for (const cp of m.points) {
        // 1. Reibungs-Impuls (Tangential)
        const vA1 = bA.getVelocityAtPoint(cp.point);
        const vB1 = bB.getVelocityAtPoint(cp.point);
        const vRel1 = Vec2.sub(vB1, vA1);
        const vTangent = vRel1.dot(tangent);

        let lambdaT = -vTangent * cp.tangentMass;
        // Reibungskegel: |tangentImpulse| <= friction * normalImpulse
        const maxFriction = friction * cp.normalImpulse;
        const oldTangentImpulse = cp.tangentImpulse;
        cp.tangentImpulse = Math.max(-maxFriction, Math.min(maxFriction, oldTangentImpulse + lambdaT));
        lambdaT = cp.tangentImpulse - oldTangentImpulse;

        const pT = Vec2.scale(tangent, lambdaT);
        if (bA.type === 'dynamic') {
          bA.velocity.subScaled(pT, mA);
          bA.angularVelocity -= iA * cp.rA.cross(pT);
        }
        if (bB.type === 'dynamic') {
          bB.velocity.addScaled(pT, mB);
          bB.angularVelocity += iB * cp.rB.cross(pT);
        }

        // 2. Normal-Impuls (Nicht-Durchdringung)
        const vA2 = bA.getVelocityAtPoint(cp.point);
        const vB2 = bB.getVelocityAtPoint(cp.point);
        const vRel2 = Vec2.sub(vB2, vA2);
        const vNormal = vRel2.dot(normal);

        let lambdaN = -(vNormal - cp.bias) * cp.normalMass;
        const oldNormalImpulse = cp.normalImpulse;
        cp.normalImpulse = Math.max(0.0, oldNormalImpulse + lambdaN);
        lambdaN = cp.normalImpulse - oldNormalImpulse;

        const pN = Vec2.scale(normal, lambdaN);
        if (bA.type === 'dynamic') {
          bA.velocity.subScaled(pN, mA);
          bA.angularVelocity -= iA * cp.rA.cross(pN);
        }
        if (bB.type === 'dynamic') {
          bB.velocity.addScaled(pN, mB);
          bB.angularVelocity += iB * cp.rB.cross(pN);
        }
      }
    }
  }
}

// --- src/dynamics/Island.mjs ---
/**
 * Island: Gruppierung von zusammenhängenden Körpern, Kontakten und Gelenken.
 * Ermöglicht getrennte parallele Ausführung und automatischen Schlafzustand (Sleeping),
 * wenn eine Konstruktion (z. B. ein Kistenturm) zur Ruhe gekommen ist.
 */
class Island {
  constructor() {
    this.bodies = [];
    this.contacts = [];
    this.joints = [];
  }

  addBody(body) {
    this.bodies.push(body);
  }

  addContact(contact) {
    this.contacts.push(contact);
  }

  addJoint(joint) {
    this.joints.push(joint);
  }

  clear() {
    this.bodies.length = 0;
    this.contacts.length = 0;
    this.joints.length = 0;
  }

  /**
   * Prüft, ob alle Körper der Insel schlafen gelegt werden können
   */
  evaluateSleep(dt, linTolSq = 0.005, angTolSq = 0.005, timeToSleep = 0.5) {
    let canSleep = true;

    for (const b of this.bodies) {
      if (b.type !== 'dynamic' || !b.allowSleep) {
        canSleep = false;
        break;
      }

      const linVelSq = b.velocity.lengthSq();
      const angVelSq = b.angularVelocity * b.angularVelocity;

      if (linVelSq > linTolSq || angVelSq > angTolSq) {
        b.sleepTime = 0.0;
        canSleep = false;
      } else {
        b.sleepTime += dt;
        if (b.sleepTime < timeToSleep) {
          canSleep = false;
        }
      }
    }

    if (canSleep) {
      for (const b of this.bodies) {
        b.putToSleep();
      }
    }
  }
}

// --- src/dynamics/joints/Joint.mjs ---
let nextJointId = 1;

/**
 * Joint: Abstrakte Basisklasse für alle kinematischen und dynamischen Gelenke.
 * Unterstützt Materialbruch (Breaking Force / Breaking Torque).
 */
class Joint {
  constructor(bodyA, bodyB, type = 'joint', config = {}) {
    this.id = nextJointId++;
    this.type = type;
    this.bodyA = bodyA;
    this.bodyB = bodyB;
    this.collideConnected = config.collideConnected ?? false; // Ob verbundene Körper miteinander kollidieren dürfen
    this.breakingForce = config.breakingForce ?? Infinity;    // Max. Reißkraft vor Bruch in Newton
    this.breakingTorque = config.breakingTorque ?? Infinity;  // Max. Bruchmoment in Nm
    this.isBroken = false;
  }

  getReactionForce(dt) {
    return 0.0;
  }

  getReactionTorque(dt) {
    return 0.0;
  }

  initVelocityConstraints(dt) {
    throw new Error('initVelocityConstraints() must be implemented');
  }

  solveVelocityConstraints() {
    throw new Error('solveVelocityConstraints() must be implemented');
  }
}

// --- src/dynamics/joints/DistanceJoint.mjs ---

/**
 * DistanceJoint: Hält zwei Ankerpunkte auf festem Abstand (starre Stange)
 * oder simuliert eine gedämpfte Federung (z. B. Fahrzeug-Stoßdämpfer, Seil).
 */
class DistanceJoint extends Joint {
  constructor(bodyA, bodyB, anchorA, anchorB, config = {}) {
    super(bodyA, bodyB, 'distance', config);
    this.localAnchorA = bodyA.transform.inverseTransformPoint(anchorA);
    this.localAnchorB = bodyB.transform.inverseTransformPoint(anchorB);

    const worldA = bodyA.transform.transformPoint(this.localAnchorA);
    const worldB = bodyB.transform.transformPoint(this.localAnchorB);
    this.length = config.length ?? worldA.distanceTo(worldB);

    // Federungsparameter
    this.frequencyHz = config.frequencyHz ?? 0.0; // 0 = starr
    this.dampingRatio = config.dampingRatio ?? 0.0;

    // Interne Solver-Variablen
    this.u = new Vec2(0, 1);
    this.rA = new Vec2(0, 0);
    this.rB = new Vec2(0, 0);
    this.mass = 0.0;
    this.impulse = 0.0;
    this.bias = 0.0;
    this.gamma = 0.0;
  }

  initVelocityConstraints(dt) {
    const bA = this.bodyA;
    const bB = this.bodyB;

    this.rA = bA.transform.transformVector(this.localAnchorA);
    this.rB = bB.transform.transformVector(this.localAnchorB);

    const pA = Vec2.add(bA.position, this.rA);
    const pB = Vec2.add(bB.position, this.rB);
    const d = Vec2.sub(pB, pA);
    const currentLen = d.length();

    if (currentLen > 1e-6) {
      this.u = Vec2.scale(d, 1.0 / currentLen);
    } else {
      this.u.set(0, 0);
    }

    const crAu = this.rA.cross(this.u);
    const crBu = this.rB.cross(this.u);
    let invMass = bA.invMass + bB.invMass + bA.invInertia * crAu * crAu + bB.invInertia * crBu * crBu;

    if (this.frequencyHz > 0.0) {
      const C = currentLen - this.length;
      const omega = 2.0 * Math.PI * this.frequencyHz;
      const dCoeff = 2.0 * this.mass * this.dampingRatio * omega;
      const kCoeff = this.mass * omega * omega;

      this.gamma = dt * (dCoeff + dt * kCoeff);
      this.gamma = this.gamma !== 0.0 ? 1.0 / this.gamma : 0.0;
      this.bias = C * dt * kCoeff * this.gamma;

      invMass += this.gamma;
      this.mass = invMass !== 0.0 ? 1.0 / invMass : 0.0;
    } else {
      this.gamma = 0.0;
      const rawBias = 0.2 * Math.max(0, currentLen - this.length) / Math.max(dt, 1e-4);
      this.bias = Math.min(3.5, rawBias); // Begrenzung gegen Resonanzkatastrophen
      this.mass = invMass !== 0.0 ? 1.0 / invMass : 0.0;
    }

    // Warm starting
    const p = Vec2.scale(this.u, this.impulse);
    bA.velocity.subScaled(p, bA.invMass);
    bA.angularVelocity -= bA.invInertia * this.rA.cross(p);
    bB.velocity.addScaled(p, bB.invMass);
    bB.angularVelocity += bB.invInertia * this.rB.cross(p);
  }

  solveVelocityConstraints() {
    const bA = this.bodyA;
    const bB = this.bodyB;

    const vA = Vec2.add(bA.velocity, Vec2.crossScalarVec(bA.angularVelocity, this.rA));
    const vB = Vec2.add(bB.velocity, Vec2.crossScalarVec(bB.angularVelocity, this.rB));
    const vRel = this.u.dot(Vec2.sub(vB, vA));

    let impulse = -this.mass * (vRel + this.bias + this.gamma * this.impulse);
    this.impulse += impulse;

    const p = Vec2.scale(this.u, impulse);
    bA.velocity.subScaled(p, bA.invMass);
    bA.angularVelocity -= bA.invInertia * this.rA.cross(p);
    bB.velocity.addScaled(p, bB.invMass);
    bB.angularVelocity += bB.invInertia * this.rB.cross(p);
  }

  getReactionForce(dt) {
    return Math.abs(this.impulse) / Math.max(dt, 1e-4);
  }
}

// --- src/dynamics/joints/RevoluteJoint.mjs ---

/**
 * RevoluteJoint: Drehgelenk (Scharnier, Pin-Gelenk, Achse, Radlager).
 * Hält zwei Körper an einem gemeinsamen Drehpunkt zusammen,
 * unterstützt motorisierten Antrieb und Winkelbegrenzungen.
 */
class RevoluteJoint extends Joint {
  constructor(bodyA, bodyB, anchorWorld, config = {}) {
    super(bodyA, bodyB, 'revolute', config);
    this.localAnchorA = bodyA.transform.inverseTransformPoint(anchorWorld);
    this.localAnchorB = bodyB.transform.inverseTransformPoint(anchorWorld);
    this.referenceAngle = config.referenceAngle ?? (bodyB.angle - bodyA.angle);

    // Motor
    this.enableMotor = config.enableMotor ?? false;
    this.motorSpeed = config.motorSpeed ?? 0.0; // rad/s
    this.maxMotorTorque = config.maxMotorTorque ?? 10.0;
    this.motorImpulse = 0.0;

    // Winkelbegrenzungen
    this.enableLimit = config.enableLimit ?? false;
    this.lowerAngle = config.lowerAngle ?? 0.0;
    this.upperAngle = config.upperAngle ?? 0.0;
    this.limitImpulse = 0.0;

    // Interne Solver-Zustände
    this.rA = new Vec2(0, 0);
    this.rB = new Vec2(0, 0);
    this.linearMass = new Mat22();
    this.linearImpulse = new Vec2(0, 0);
    this.linearBias = new Vec2(0, 0);
    this.motorMass = 0.0;
  }

  getJointAngle() {
    return normalizeAngle(this.bodyB.angle - this.bodyA.angle - this.referenceAngle);
  }

  getJointSpeed() {
    return this.bodyB.angularVelocity - this.bodyA.angularVelocity;
  }

  setMotorSpeed(speed) {
    this.motorSpeed = speed;
  }

  initVelocityConstraints(dt) {
    const bA = this.bodyA;
    const bB = this.bodyB;

    this.rA = bA.transform.transformVector(this.localAnchorA);
    this.rB = bB.transform.transformVector(this.localAnchorB);

    const mA = bA.invMass;
    const mB = bB.invMass;
    const iA = bA.invInertia;
    const iB = bB.invInertia;

    // 2x2 K-Matrix: K = (mA + mB)*I - rA_skew * iA * rA_skew - rB_skew * iB * rB_skew
    const k11 = mA + mB + iA * this.rA.y * this.rA.y + iB * this.rB.y * this.rB.y;
    const k12 = -iA * this.rA.x * this.rA.y - iB * this.rB.x * this.rB.y;
    const k21 = k12;
    const k22 = mA + mB + iA * this.rA.x * this.rA.x + iB * this.rB.x * this.rB.x;

    this.linearMass.setElements(k11, k12, k21, k22).invert();

    // Motor Trägheitsmasse
    this.motorMass = iA + iB > 0.0 ? 1.0 / (iA + iB) : 0.0;

    // Positionsfehler (Baumgarte) - Gedämpft und strikt begrenzt gegen Energie-Explosionen
    const pA = Vec2.add(bA.position, this.rA);
    const pB = Vec2.add(bB.position, this.rB);
    const posError = Vec2.sub(pB, pA);
    const rawBias = Vec2.scale(posError, 0.2 / Math.max(dt, 1e-4));
    const maxBiasSpeed = 3.5; // m/s Obergrenze verhindert unphysikalische Kettenresonanz
    const biasLen = rawBias.length();
    this.linearBias = biasLen > maxBiasSpeed ? Vec2.scale(rawBias, maxBiasSpeed / biasLen) : rawBias;

    // Warm starting linear
    bA.velocity.subScaled(this.linearImpulse, mA);
    bA.angularVelocity -= iA * this.rA.cross(this.linearImpulse);
    bB.velocity.addScaled(this.linearImpulse, mB);
    bB.angularVelocity += iB * this.rB.cross(this.linearImpulse);

    // Warm starting motor & limit
    if (this.enableMotor) {
      bA.angularVelocity -= iA * this.motorImpulse;
      bB.angularVelocity += iB * this.motorImpulse;
    }
  }

  solveVelocityConstraints() {
    const bA = this.bodyA;
    const bB = this.bodyB;
    const mA = bA.invMass;
    const mB = bB.invMass;
    const iA = bA.invInertia;
    const iB = bB.invInertia;

    // 1. Löse Motor
    if (this.enableMotor) {
      const cDot = bB.angularVelocity - bA.angularVelocity - this.motorSpeed;
      let impulse = -this.motorMass * cDot;
      const oldImpulse = this.motorImpulse;
      const maxImp = this.maxMotorTorque * 0.02; // Begrenzung pro Zeitschritt
      this.motorImpulse = Math.max(-maxImp, Math.min(maxImp, oldImpulse + impulse));
      impulse = this.motorImpulse - oldImpulse;

      bA.angularVelocity -= iA * impulse;
      bB.angularVelocity += iB * impulse;
    }

    // 2. Löse Winkelbegrenzungen
    if (this.enableLimit) {
      const jointAngle = this.getJointAngle();
      if (jointAngle < this.lowerAngle) {
        const cDot = bB.angularVelocity - bA.angularVelocity;
        let impulse = -this.motorMass * (cDot + 0.2 * (jointAngle - this.lowerAngle));
        const oldImp = this.limitImpulse;
        this.limitImpulse = Math.max(0.0, oldImp + impulse);
        impulse = this.limitImpulse - oldImp;
        bA.angularVelocity -= iA * impulse;
        bB.angularVelocity += iB * impulse;
      } else if (jointAngle > this.upperAngle) {
        const cDot = bB.angularVelocity - bA.angularVelocity;
        let impulse = -this.motorMass * (cDot + 0.2 * (jointAngle - this.upperAngle));
        const oldImp = this.limitImpulse;
        this.limitImpulse = Math.min(0.0, oldImp + impulse);
        impulse = this.limitImpulse - oldImp;
        bA.angularVelocity -= iA * impulse;
        bB.angularVelocity += iB * impulse;
      }
    }

    // 3. Löse Punkt-Koinzidenz (Linear Constraint)
    const vA = Vec2.add(bA.velocity, Vec2.crossScalarVec(bA.angularVelocity, this.rA));
    const vB = Vec2.add(bB.velocity, Vec2.crossScalarVec(bB.angularVelocity, this.rB));
    const vRel = Vec2.sub(vB, vA);

    const cDot = Vec2.add(vRel, this.linearBias);
    const impulse = this.linearMass.mulVec(cDot).negate();

    this.linearImpulse.add(impulse);

    bA.velocity.subScaled(impulse, mA);
    bA.angularVelocity -= iA * this.rA.cross(impulse);
    bB.velocity.addScaled(impulse, mB);
    bB.angularVelocity += iB * this.rB.cross(impulse);
  }

  getReactionForce(dt) {
    return this.linearImpulse.length() / Math.max(dt, 1e-4);
  }

  getReactionTorque(dt) {
    return Math.abs(this.motorImpulse + this.limitImpulse) / Math.max(dt, 1e-4);
  }
}

// --- src/dynamics/joints/PrismaticJoint.mjs ---

/**
 * PrismaticJoint: Schubgelenk (Kolben, Aufzug, Gleitschiene).
 * Erlaubt ausschließlich lineare Verschiebung entlang einer festgelegten Achse
 * und blockiert relative Drehung.
 */
class PrismaticJoint extends Joint {
  constructor(bodyA, bodyB, anchorWorld, axisWorld, config = {}) {
    super(bodyA, bodyB, 'prismatic', config);
    this.localAnchorA = bodyA.transform.inverseTransformPoint(anchorWorld);
    this.localAnchorB = bodyB.transform.inverseTransformPoint(anchorWorld);
    this.localXAxisA = bodyA.transform.inverseTransformVector(axisWorld).normalize();
    this.localYAxisA = this.localXAxisA.perp();
    this.referenceAngle = config.referenceAngle ?? (bodyB.angle - bodyA.angle);

    // Motor
    this.enableMotor = config.enableMotor ?? false;
    this.motorSpeed = config.motorSpeed ?? 0.0;
    this.maxMotorForce = config.maxMotorForce ?? 20.0;
    this.motorImpulse = 0.0;

    // Translation Limits
    this.enableLimit = config.enableLimit ?? false;
    this.lowerTranslation = config.lowerTranslation ?? -1.0;
    this.upperTranslation = config.upperTranslation ?? 1.0;
    this.limitImpulse = 0.0;

    // Interne Solver-Zustände
    this.rA = new Vec2(0, 0);
    this.rB = new Vec2(0, 0);
    this.axis = new Vec2(1, 0);
    this.perp = new Vec2(0, 1);
    this.perpMass = 0.0;
    this.angularMass = 0.0;
    this.motorMass = 0.0;
    this.perpImpulse = 0.0;
    this.angularImpulse = 0.0;
    this.perpBias = 0.0;
    this.angularBias = 0.0;
  }

  getTranslation() {
    const pA = this.bodyA.transform.transformPoint(this.localAnchorA);
    const pB = this.bodyB.transform.transformPoint(this.localAnchorB);
    const d = Vec2.sub(pB, pA);
    const axis = this.bodyA.transform.transformVector(this.localXAxisA);
    return d.dot(axis);
  }

  initVelocityConstraints(dt) {
    const bA = this.bodyA;
    const bB = this.bodyB;

    this.rA = bA.transform.transformVector(this.localAnchorA);
    this.rB = bB.transform.transformVector(this.localAnchorB);
    this.axis = bA.transform.transformVector(this.localXAxisA);
    this.perp = this.axis.perp();

    const mA = bA.invMass;
    const mB = bB.invMass;
    const iA = bA.invInertia;
    const iB = bB.invInertia;

    const pA = Vec2.add(bA.position, this.rA);
    const pB = Vec2.add(bB.position, this.rB);
    const d = Vec2.sub(pB, pA);

    // K-Terme für Orthogonalität
    const s1 = Vec2.add(d, this.rA).cross(this.perp);
    const s2 = this.rB.cross(this.perp);
    const kPerp = mA + mB + iA * s1 * s1 + iB * s2 * s2;
    this.perpMass = kPerp > 1e-12 ? 1.0 / kPerp : 0.0;

    // K-Term für relative Drehung
    const kAng = iA + iB;
    this.angularMass = kAng > 1e-12 ? 1.0 / kAng : 0.0;

    // Motor Trägheitsmasse entlang Schiene
    const a1 = Vec2.add(d, this.rA).cross(this.axis);
    const a2 = this.rB.cross(this.axis);
    const kMotor = mA + mB + iA * a1 * a1 + iB * a2 * a2;
    this.motorMass = kMotor > 1e-12 ? 1.0 / kMotor : 0.0;

    // Baumgarte-Biases
    this.perpBias = 0.3 * d.dot(this.perp) / Math.max(dt, 1e-4);
    this.angularBias = 0.3 * (bB.angle - bA.angle - this.referenceAngle) / Math.max(dt, 1e-4);

    // Warm starting
    const p = Vec2.scale(this.perp, this.perpImpulse);
    bA.velocity.subScaled(p, mA);
    bA.angularVelocity -= iA * (s1 * this.perpImpulse + this.angularImpulse);
    bB.velocity.addScaled(p, mB);
    bB.angularVelocity += iB * (s2 * this.perpImpulse + this.angularImpulse);
  }

  solveVelocityConstraints() {
    const bA = this.bodyA;
    const bB = this.bodyB;
    const mA = bA.invMass;
    const mB = bB.invMass;
    const iA = bA.invInertia;
    const iB = bB.invInertia;

    // 1. Orthogonale Translation sperren
    const vA = Vec2.add(bA.velocity, Vec2.crossScalarVec(bA.angularVelocity, this.rA));
    const vB = Vec2.add(bB.velocity, Vec2.crossScalarVec(bB.angularVelocity, this.rB));
    const cDotPerp = Vec2.sub(vB, vA).dot(this.perp) + this.perpBias;
    const perpImp = -this.perpMass * cDotPerp;
    this.perpImpulse += perpImp;

    const p = Vec2.scale(this.perp, perpImp);
    bA.velocity.subScaled(p, mA);
    bA.angularVelocity -= iA * (this.rA.cross(p));
    bB.velocity.addScaled(p, mB);
    bB.angularVelocity += iB * (this.rB.cross(p));

    // 2. Relative Rotation sperren
    const cDotAng = bB.angularVelocity - bA.angularVelocity + this.angularBias;
    const angImp = -this.angularMass * cDotAng;
    this.angularImpulse += angImp;

    bA.angularVelocity -= iA * angImp;
    bB.angularVelocity += iB * angImp;

    // 3. Motor entlang der Schiene
    if (this.enableMotor) {
      const vRelAxis = Vec2.sub(vB, vA).dot(this.axis) - this.motorSpeed;
      let imp = -this.motorMass * vRelAxis;
      const oldImp = this.motorImpulse;
      const maxImp = this.maxMotorForce * 0.02;
      this.motorImpulse = Math.max(-maxImp, Math.min(maxImp, oldImp + imp));
      imp = this.motorImpulse - oldImp;

      const pAxis = Vec2.scale(this.axis, imp);
      bA.velocity.subScaled(pAxis, mA);
      bB.velocity.addScaled(pAxis, mB);
    }
  }

  getReactionForce(dt) {
    return Math.abs(this.linearImpulse) / Math.max(dt, 1e-4);
  }

  getReactionTorque(dt) {
    return Math.abs(this.angularImpulse) / Math.max(dt, 1e-4);
  }
}

// --- src/dynamics/joints/WeldJoint.mjs ---

/**
 * WeldJoint: Schweißgelenk (starre Verbindung zweier Körper).
 * Fixiert sowohl Relativposition als auch Relativwinkel komplett.
 */
class WeldJoint extends Joint {
  constructor(bodyA, bodyB, anchorWorld, config = {}) {
    super(bodyA, bodyB, 'weld', config);
    this.localAnchorA = bodyA.transform.inverseTransformPoint(anchorWorld);
    this.localAnchorB = bodyB.transform.inverseTransformPoint(anchorWorld);
    this.referenceAngle = config.referenceAngle ?? (bodyB.angle - bodyA.angle);

    this.rA = new Vec2(0, 0);
    this.rB = new Vec2(0, 0);
    this.linearMass = new Mat22();
    this.angularMass = 0.0;
    this.linearImpulse = new Vec2(0, 0);
    this.angularImpulse = 0.0;
    this.linearBias = new Vec2(0, 0);
    this.angularBias = 0.0;
  }

  initVelocityConstraints(dt) {
    const bA = this.bodyA;
    const bB = this.bodyB;

    this.rA = bA.transform.transformVector(this.localAnchorA);
    this.rB = bB.transform.transformVector(this.localAnchorB);

    const mA = bA.invMass;
    const mB = bB.invMass;
    const iA = bA.invInertia;
    const iB = bB.invInertia;

    const k11 = mA + mB + iA * this.rA.y * this.rA.y + iB * this.rB.y * this.rB.y;
    const k12 = -iA * this.rA.x * this.rA.y - iB * this.rB.x * this.rB.y;
    const k21 = k12;
    const k22 = mA + mB + iA * this.rA.x * this.rA.x + iB * this.rB.x * this.rB.x;
    this.linearMass.setElements(k11, k12, k21, k22).invert();

    this.angularMass = iA + iB > 0.0 ? 1.0 / (iA + iB) : 0.0;

    const pA = Vec2.add(bA.position, this.rA);
    const pB = Vec2.add(bB.position, this.rB);
    const rawLinBias = Vec2.scale(Vec2.sub(pB, pA), 0.2 / Math.max(dt, 1e-4));
    const biasLen = rawLinBias.length();
    this.linearBias = biasLen > 3.5 ? Vec2.scale(rawLinBias, 3.5 / biasLen) : rawLinBias;
    const rawAngBias = 0.2 * (bB.angle - bA.angle - this.referenceAngle) / Math.max(dt, 1e-4);
    this.angularBias = Math.max(-4.0, Math.min(4.0, rawAngBias));

    // Warm starting
    bA.velocity.subScaled(this.linearImpulse, mA);
    bA.angularVelocity -= iA * (this.rA.cross(this.linearImpulse) + this.angularImpulse);
    bB.velocity.addScaled(this.linearImpulse, mB);
    bB.angularVelocity += iB * (this.rB.cross(this.linearImpulse) + this.angularImpulse);
  }

  solveVelocityConstraints() {
    const bA = this.bodyA;
    const bB = this.bodyB;
    const mA = bA.invMass;
    const mB = bB.invMass;
    const iA = bA.invInertia;
    const iB = bB.invInertia;

    // Linear
    const vA = Vec2.add(bA.velocity, Vec2.crossScalarVec(bA.angularVelocity, this.rA));
    const vB = Vec2.add(bB.velocity, Vec2.crossScalarVec(bB.angularVelocity, this.rB));
    const cDotLinear = Vec2.add(Vec2.sub(vB, vA), this.linearBias);
    const linImp = this.linearMass.mulVec(cDotLinear).negate();
    this.linearImpulse.add(linImp);

    bA.velocity.subScaled(linImp, mA);
    bA.angularVelocity -= iA * this.rA.cross(linImp);
    bB.velocity.addScaled(linImp, mB);
    bB.angularVelocity += iB * this.rB.cross(linImp);

    // Angular
    const cDotAng = bB.angularVelocity - bA.angularVelocity + this.angularBias;
    const angImp = -this.angularMass * cDotAng;
    this.angularImpulse += angImp;

    bA.angularVelocity -= iA * angImp;
    bB.angularVelocity += iB * angImp;
  }

  getReactionForce(dt) {
    return this.linearImpulse.length() / Math.max(dt, 1e-4);
  }

  getReactionTorque(dt) {
    return Math.abs(this.angularImpulse) / Math.max(dt, 1e-4);
  }
}

// --- src/dynamics/joints/PulleyJoint.mjs ---

/**
 * PulleyJoint: Flaschenzug- / Seilzuggelenk.
 * Verbindet zwei Körper über zwei fixe Umlenkrollen mit Übersetzung:
 * length1 + ratio * length2 = totalLength
 */
class PulleyJoint extends Joint {
  constructor(bodyA, bodyB, groundAnchorA, groundAnchorB, anchorA, anchorB, ratio = 1.0, config = {}) {
    super(bodyA, bodyB, 'pulley', config);
    this.groundAnchorA = groundAnchorA.clone();
    this.groundAnchorB = groundAnchorB.clone();
    this.localAnchorA = bodyA.transform.inverseTransformPoint(anchorA);
    this.localAnchorB = bodyB.transform.inverseTransformPoint(anchorB);
    this.ratio = ratio;

    const pA = bodyA.transform.transformPoint(this.localAnchorA);
    const pB = bodyB.transform.transformPoint(this.localAnchorB);
    this.lengthA = pA.distanceTo(this.groundAnchorA);
    this.lengthB = pB.distanceTo(this.groundAnchorB);
    this.constant = this.lengthA + this.ratio * this.lengthB;

    this.uA = new Vec2(0, 1);
    this.uB = new Vec2(0, 1);
    this.rA = new Vec2(0, 0);
    this.rB = new Vec2(0, 0);
    this.mass = 0.0;
    this.impulse = 0.0;
    this.bias = 0.0;
  }

  initVelocityConstraints(dt) {
    const bA = this.bodyA;
    const bB = this.bodyB;

    this.rA = bA.transform.transformVector(this.localAnchorA);
    this.rB = bB.transform.transformVector(this.localAnchorB);

    const pA = Vec2.add(bA.position, this.rA);
    const pB = Vec2.add(bB.position, this.rB);

    const sA = Vec2.sub(pA, this.groundAnchorA);
    const sB = Vec2.sub(pB, this.groundAnchorB);

    const lenA = sA.length();
    const lenB = sB.length();

    this.uA = lenA > 1e-6 ? Vec2.scale(sA, 1.0 / lenA) : new Vec2(0, 0);
    this.uB = lenB > 1e-6 ? Vec2.scale(sB, 1.0 / lenB) : new Vec2(0, 0);

    const crAu = this.rA.cross(this.uA);
    const crBu = this.rB.cross(this.uB);

    const mA = bA.invMass + bA.invInertia * crAu * crAu;
    const mB = bB.invMass + bB.invInertia * crBu * crBu;

    const k = mA + this.ratio * this.ratio * mB;
    this.mass = k > 1e-12 ? 1.0 / k : 0.0;

    const C = (lenA + this.ratio * lenB) - this.constant;
    this.bias = 0.2 * Math.max(0, C) / Math.max(dt, 1e-4);

    // Warm starting
    const p1 = Vec2.scale(this.uA, -this.impulse);
    const p2 = Vec2.scale(this.uB, -this.ratio * this.impulse);
    bA.velocity.addScaled(p1, bA.invMass);
    bA.angularVelocity += bA.invInertia * this.rA.cross(p1);
    bB.velocity.addScaled(p2, bB.invMass);
    bB.angularVelocity += bB.invInertia * this.rB.cross(p2);
  }

  solveVelocityConstraints() {
    const bA = this.bodyA;
    const bB = this.bodyB;

    const vA = Vec2.add(bA.velocity, Vec2.crossScalarVec(bA.angularVelocity, this.rA));
    const vB = Vec2.add(bB.velocity, Vec2.crossScalarVec(bB.angularVelocity, this.rB));

    const cDot = this.uA.dot(vA) + this.ratio * this.uB.dot(vB);
    let impulse = -this.mass * (cDot + this.bias);
    const oldImp = this.impulse;
    this.impulse = Math.max(0.0, oldImp + impulse);
    impulse = this.impulse - oldImp;

    const p1 = Vec2.scale(this.uA, -impulse);
    const p2 = Vec2.scale(this.uB, -this.ratio * impulse);
    bA.velocity.addScaled(p1, bA.invMass);
    bA.angularVelocity += bA.invInertia * this.rA.cross(p1);
    bB.velocity.addScaled(p2, bB.invMass);
    bB.angularVelocity += bB.invInertia * this.rB.cross(p2);
  }

  getReactionForce(dt) {
    return Math.abs(this.impulse) / Math.max(dt, 1e-4);
  }
}

// --- src/world/StepConfig.mjs ---
/**
 * StepConfig: Konfigurationsparameter für Zeitschritt und Solver
 */
class StepConfig {
  constructor(config = {}) {
    this.dt = config.dt ?? (1.0 / 60.0);
    this.velocityIterations = config.velocityIterations ?? 8;
    this.positionIterations = config.positionIterations ?? 3;
    this.enableSubQGLattice = config.enableSubQGLattice ?? true; // SubQG Netzwerk im Hintergrund aktiv
    this.enableWarmStarting = config.enableWarmStarting ?? true;
    this.enableSleeping = config.enableSleeping ?? true;
    this.timeToSleep = config.timeToSleep ?? 0.5; // Sekunden bis zum Einschlafen
  }
}

// --- src/world/ContactListener.mjs ---
/**
 * ContactListener: Callback-Schnittstelle für Spiel- und Kollisionsereignisse
 */
class ContactListener {
  onBeginContact(contact) {}
  onEndContact(contact) {}
  onPreSolve(contact) {}
  onPostSolve(contact, normalImpulses, tangentImpulses) {}
}

// --- src/world/World.mjs ---

/**
 * World: Die zentrale Simulationswelt der SubQG Game Physics Engine.
 *
 * Stellt Spieleentwicklern eine vertraute, hochperformante RigidBody-API zur Verfügung
 * (Körper, Kräfte, Gelenke, Raycasts, Trigger, Stöße, Reibung),
 * während intern alle Gravitations-, Trägheits- und Kontaktwechselwirkungen
 * auf dem relationalen SubQG-Kantennetzwerk und der Kantenwirkungs-Minimierung basieren.
 */
class World {
  constructor(config = {}) {
    this.stepConfig = new StepConfig(config);
    this.engineMode = config.engineMode ?? 'hybrid'; // 'pure-subqg' (100% First-Principles) oder 'hybrid' (Echtzeit-Optimiert)

    // SubQG Subsysteme
    this.subqgGraph = new RelationalGraph(config.subqg || {});
    this.subqgSolver = new MetricLatticeSolver(this.subqgGraph);
    this.subqgBridge = new SubQGContactBridge(config.subqg || {});
    this.subqgPureDynamics = new SubQGPureDynamics(this.subqgGraph, config.subqg || {});
    this.subqgGravitation = new SubQGGravitationField({
      gravity: config.gravity ?? (this.engineMode === 'pure-subqg' ? new Vec2(0, 0) : new Vec2(0, -9.81)),
      enableMutualAttraction: config.enableMutualAttraction ?? (this.engineMode === 'pure-subqg')
    });

    // Kollisions- und Dynamiksysteme
    this.broadPhase = new DynamicAABBTree(config.fatPadding ?? 0.05);
    this.narrowPhase = new CollisionNarrowphase(this.subqgBridge);
    this.contactSolver = new ContactSolver(this.subqgBridge);
    this.triggerSystem = new TriggerSystem();
    this.destructionSystem = new SubQGDestructionSystem(this, config.destruction || {});
    this.contactSolverCalls = 0;
    this.jointSolverCalls = 0;
    this.classicalSolverCalls = 0;
    this.brokenJointsCount = 0;
    this.materialFractureEvents = []; // Aufzeichnung realer Materialbruch-Ereignisse

    // Entitäten
    this.bodies = [];
    this.joints = [];
    this.contactManifolds = new Map(); // key -> ContactManifold

    // Event Listener
    this.contactListeners = [];
    this.jointBreakListeners = [];

    // Letzte Diagnosedaten
    this.subqgDiagnostics = {
      totalEdgeAction: 0,
      maxStrain: 0,
      edgeCount: 0,
      nodeCount: 0,
      stepTimeMs: 0
    };
  }

  setGravity(gx, gy) {
    this.subqgGravitation.setGravity(gx, gy);
  }

  getGravity() {
    return this.subqgGravitation.gravity.clone();
  }

  addContactListener(listener) {
    this.contactListeners.push(listener);
    this.triggerSystem.addListener(listener);
    return this;
  }

  // ==========================================
  // KÖRPER-VERWALTUNG & ERGONOMISCHE FACTORIES
  // ==========================================

  addBody(body) {
    if (this.bodies.includes(body)) return body;
    this.bodies.push(body);
    body.updateAABB();
    body.treeLeaf = this.broadPhase.insertLeaf(body, body.aabb);
    return body;
  }

  removeBody(body) {
    const idx = this.bodies.indexOf(body);
    if (idx !== -1) {
      this.bodies.splice(idx, 1);
      if (body.treeLeaf) {
        this.broadPhase.removeLeaf(body.treeLeaf);
        body.treeLeaf = null;
      }
      // Entferne alle verbundenen Gelenke
      for (let i = this.joints.length - 1; i >= 0; i--) {
        const j = this.joints[i];
        if (j.bodyA === body || j.bodyB === body) {
          this.removeJoint(j);
        }
      }
    }
    return this;
  }

  createBody(config = {}) {
    const body = new Body(config);
    return this.addBody(body);
  }

  createBox(x, y, width, height, options = {}) {
    const body = new Body({
      position: new Vec2(x, y),
      type: options.type ?? 'dynamic',
      angle: options.angle ?? 0,
      linearDamping: options.linearDamping,
      angularDamping: options.angularDamping,
      isDestructible: options.isDestructible ?? false,
      fractureForce: options.fractureForce ?? 1500.0,
      allowSleep: options.allowSleep ?? true,
      gravityScale: options.gravityScale ?? 1.0,
      userData: options.userData
    });

    const box = new Box(width, height, options.offset || new Vec2(0, 0));
    if (options.material) box.setMaterial(options.material);
    if (options.isTrigger) box.setTrigger(true);

    body.addShape(box);
    return this.addBody(body);
  }

  createCircle(x, y, radius, options = {}) {
    const body = new Body({
      position: new Vec2(x, y),
      type: options.type ?? 'dynamic',
      angle: options.angle ?? 0,
      linearDamping: options.linearDamping,
      angularDamping: options.angularDamping,
      isDestructible: options.isDestructible ?? false,
      fractureForce: options.fractureForce ?? 1500.0,
      allowSleep: options.allowSleep ?? true,
      gravityScale: options.gravityScale ?? 1.0,
      userData: options.userData
    });

    const circle = new Circle(radius, options.offset || new Vec2(0, 0));
    if (options.material) circle.setMaterial(options.material);
    if (options.isTrigger) circle.setTrigger(true);

    body.addShape(circle);
    return this.addBody(body);
  }

  createPolygon(x, y, vertices, options = {}) {
    const body = new Body({
      position: new Vec2(x, y),
      type: options.type ?? 'dynamic',
      angle: options.angle ?? 0,
      linearDamping: options.linearDamping,
      angularDamping: options.angularDamping,
      isDestructible: options.isDestructible ?? false,
      fractureForce: options.fractureForce ?? 1500.0,
      allowSleep: options.allowSleep ?? true,
      gravityScale: options.gravityScale ?? 1.0,
      userData: options.userData
    });

    const poly = new Polygon(vertices, options.offset || new Vec2(0, 0));
    if (options.material) poly.setMaterial(options.material);
    if (options.isTrigger) poly.setTrigger(true);

    body.addShape(poly);
    return this.addBody(body);
  }

  createCapsule(x, y, length, radius, options = {}) {
    const body = new Body({
      position: new Vec2(x, y),
      type: options.type ?? 'dynamic',
      angle: options.angle ?? 0,
      linearDamping: options.linearDamping,
      angularDamping: options.angularDamping,
      isDestructible: options.isDestructible ?? false,
      fractureForce: options.fractureForce ?? 1500.0,
      allowSleep: options.allowSleep ?? true,
      gravityScale: options.gravityScale ?? 1.0,
      userData: options.userData
    });

    const capsule = new Capsule(length, radius, options.offset || new Vec2(0, 0));
    if (options.material) capsule.setMaterial(options.material);
    if (options.isTrigger) capsule.setTrigger(true);

    body.addShape(capsule);
    return this.addBody(body);
  }

  createSegment(x1, y1, x2, y2, options = {}) {
    const body = new Body({
      position: new Vec2(0, 0),
      type: options.type ?? 'static',
      isDestructible: options.isDestructible ?? false,
      fractureForce: options.fractureForce ?? 1500.0,
      userData: options.userData
    });

    const seg = new Segment(new Vec2(x1, y1), new Vec2(x2, y2));
    if (options.material) seg.setMaterial(options.material);
    if (options.isTrigger) seg.setTrigger(true);

    body.addShape(seg);
    return this.addBody(body);
  }

  // ==========================================
  // GELENK-VERWALTUNG & FACTORIES
  // ==========================================

  addJoint(joint) {
    if (this.joints.includes(joint)) return joint;
    this.joints.push(joint);
    if (!joint.bodyA.joints) joint.bodyA.joints = [];
    if (!joint.bodyB.joints) joint.bodyB.joints = [];
    if (!joint.bodyA.joints.includes(joint)) joint.bodyA.joints.push(joint);
    if (!joint.bodyB.joints.includes(joint)) joint.bodyB.joints.push(joint);
    joint.bodyA.wakeUp();
    joint.bodyB.wakeUp();
    return joint;
  }

  removeJoint(joint) {
    const idx = this.joints.indexOf(joint);
    if (idx !== -1) {
      this.joints.splice(idx, 1);
      if (joint.bodyA.joints) {
        const jIdxA = joint.bodyA.joints.indexOf(joint);
        if (jIdxA !== -1) joint.bodyA.joints.splice(jIdxA, 1);
      }
      if (joint.bodyB.joints) {
        const jIdxB = joint.bodyB.joints.indexOf(joint);
        if (jIdxB !== -1) joint.bodyB.joints.splice(jIdxB, 1);
      }
      joint.bodyA.wakeUp();
      joint.bodyB.wakeUp();
    }
    return this;
  }

  createDistanceJoint(bodyA, bodyB, anchorA, anchorB, config = {}) {
    const j = new DistanceJoint(bodyA, bodyB, anchorA, anchorB, config);
    return this.addJoint(j);
  }

  createRevoluteJoint(bodyA, bodyB, anchorWorld, config = {}) {
    const j = new RevoluteJoint(bodyA, bodyB, anchorWorld, config);
    return this.addJoint(j);
  }

  createPrismaticJoint(bodyA, bodyB, anchorWorld, axisWorld, config = {}) {
    const j = new PrismaticJoint(bodyA, bodyB, anchorWorld, axisWorld, config);
    return this.addJoint(j);
  }

  createWeldJoint(bodyA, bodyB, anchorWorld, config = {}) {
    const j = new WeldJoint(bodyA, bodyB, anchorWorld, config);
    return this.addJoint(j);
  }

  createPulleyJoint(bodyA, bodyB, groundA, groundB, anchorA, anchorB, ratio = 1.0, config = {}) {
    const j = new PulleyJoint(bodyA, bodyB, groundA, groundB, anchorA, anchorB, ratio, config);
    return this.addJoint(j);
  }

  onJointBreak(callback) {
    this.jointBreakListeners.push(callback);
    return this;
  }

  // ==========================================
  // ABFRAGEN: RAYCAST, AABB, PUNKT
  // ==========================================

  raycast(origin, direction, maxDistance = Infinity) {
    const ray = new Ray(origin, direction, maxDistance);
    let closestHit = null;

    this.broadPhase.raycast(origin, ray.direction, maxDistance, (body) => {
      for (const shape of body.shapes) {
        const hit = shape.raycast(ray, body.transform, maxDistance);
        if (hit.hit) {
          if (!closestHit || hit.fraction < closestHit.fraction) {
            closestHit = new RaycastHit(body, shape, hit.point, hit.normal, hit.fraction);
          }
        }
      }
    });

    return closestHit;
  }

  raycastAll(origin, direction, maxDistance = Infinity) {
    const ray = new Ray(origin, direction, maxDistance);
    const hits = [];

    this.broadPhase.raycast(origin, ray.direction, maxDistance, (body) => {
      for (const shape of body.shapes) {
        const hit = shape.raycast(ray, body.transform, maxDistance);
        if (hit.hit) {
          hits.push(new RaycastHit(body, shape, hit.point, hit.normal, hit.fraction));
        }
      }
    });

    hits.sort((a, b) => a.fraction - b.fraction);
    return hits;
  }

  queryAABB(aabb) {
    const results = [];
    this.broadPhase.queryAABB(aabb, (body) => {
      if (body.aabb.intersects(aabb)) {
        results.push(body);
      }
    });
    return results;
  }

  queryPoint(point) {
    const results = [];
    const ptAABB = new AABB(
      new Vec2(point.x - 0.01, point.y - 0.01),
      new Vec2(point.x + 0.01, point.y + 0.01)
    );

    this.broadPhase.queryAABB(ptAABB, (body) => {
      for (const shape of body.shapes) {
        if (shape.testPoint(point, body.transform)) {
          results.push({ body, shape });
        }
      }
    });

    return results;
  }

  // ==========================================
  // SIMULATIONSSCHRITT: SUBQG + SOLVER CYCLE
  // ==========================================

  step(customDt = null) {
    const startTime = performance.now();
    const dt = customDt ?? this.stepConfig.dt;
    if (dt <= 0.0) return;

    // 1. SubQG internes Netzwerk updaten
    if (this.stepConfig.enableSubQGLattice) {
      this.subqgGraph.resetDensities();
      for (const body of this.bodies) {
        this.subqgGraph.injectBodyMass(body);
      }
      const solveRes = this.subqgSolver.solve();
      this.subqgDiagnostics.totalEdgeAction = solveRes.totalEdgeAction;
      this.subqgDiagnostics.maxStrain = solveRes.maxStrain;
      this.subqgDiagnostics.edgeCount = solveRes.edgeCount;
      this.subqgDiagnostics.nodeCount = solveRes.nodeCount;
    }

    // 2. Gravitation anwenden
    if (this.engineMode === 'pure-subqg') {
      // Reiner SubQG-Modus: Gravitationskräfte entstehen direkt aus ∇Phi des Gitters
      // plus emergentem Hintergrund-Metrikgradienten
      this.subqgPureDynamics.evaluateGravitationalForces(this.bodies, this.subqgGravitation.gravity);
    } else {
      this.subqgGravitation.applyGravity(this.bodies, this.stepConfig.enableSubQGLattice ? this.subqgGraph : null);
    }

    // 3. Externe Kräfte & Drehmomente integrieren (v += F/m * dt)
    for (const body of this.bodies) {
      body.integrateForces(dt);
    }

    // 4. Broadphase AABB-Baum aktualisieren
    for (const body of this.bodies) {
      if (body.type !== 'static' && !body.isSleeping) {
        const disp = Vec2.scale(body.velocity, dt);
        this.broadPhase.updateLeaf(body.treeLeaf, body.aabb, disp);
      }
    }

    // 5. Kollisions-Paare finden & Narrowphase Kontakt-Manifolds berechnen
    const activeManifolds = [];
    const checkedPairs = new Set();

    this.broadPhase.queryPairs((bodyA, bodyB) => {
      // Zwei statische Körper kollidieren nicht miteinander
      if (bodyA.type === 'static' && bodyB.type === 'static') return;
      // Beide schlafen -> keine Berechnung nötig
      if (bodyA.isSleeping && bodyB.isSleeping) return;

      const pKey = bodyA.id < bodyB.id ? `${bodyA.id}:${bodyB.id}` : `${bodyB.id}:${bodyA.id}`;
      if (checkedPairs.has(pKey)) return;
      checkedPairs.add(pKey);

      // Prüfe verbundene Gelenke, ob Kollision erlaubt ist
      for (const joint of this.joints) {
        if (!joint.collideConnected) {
          if ((joint.bodyA === bodyA && joint.bodyB === bodyB) ||
              (joint.bodyA === bodyB && joint.bodyB === bodyA)) {
            return;
          }
        }
      }

      // Alle Formenpaare testen
      for (const sA of bodyA.shapes) {
        for (const sB of bodyB.shapes) {
          const manifold = this.narrowPhase.collide(bodyA, bodyB, sA, sB);
          if (manifold && manifold.points.length > 0) {
            if (manifold.isTrigger) {
              this.triggerSystem.registerOverlap(manifold);
            } else {
              // Match mit vorherigen Impulsen für Warm-Starting
              const prev = this.contactManifolds.get(manifold.key);
              if (prev && this.stepConfig.enableWarmStarting) {
                for (let k = 0; k < Math.min(manifold.points.length, prev.points.length); k++) {
                  manifold.points[k].normalImpulse = prev.points[k].normalImpulse;
                  manifold.points[k].tangentImpulse = prev.points[k].tangentImpulse;
                }
              }
              activeManifolds.push(manifold);
            }
          }
        }
      }
    });

    // Update Kontakt-Map
    this.contactManifolds.clear();
    for (const m of activeManifolds) {
      this.contactManifolds.set(m.key, m);
    }

    // 6. Kontakt- und Gelenklösung
    if (this.engineMode === 'pure-subqg') {
      // REINER SUBQG-MODUS (100% First-Principles):
      // Null Kontakt-Impulssolver!
      // Kontakt- und Reibungskräfte entstehen direkt aus der SubQG-Kantenbarriere-Wirkung (contactSolverCalls = 0)
      this.subqgPureDynamics.applyPureContactForces(activeManifolds, dt);
      for (const body of this.bodies) {
        body.integrateForces(dt);
      }
      // Topologische Gelenkbindungen (kinematische Invarianten)
      for (const joint of this.joints) {
        joint.initVelocityConstraints(dt);
      }
      for (let it = 0; it < this.stepConfig.velocityIterations; it++) {
        for (const joint of this.joints) {
          joint.solveVelocityConstraints();
          this.jointSolverCalls++;
        }
      }
    } else {
      // HYBRID-MODUS:
      // Klassischer sequentieller Impulssolver für maximale Framerate bei 60 FPS
      for (const joint of this.joints) {
        joint.initVelocityConstraints(dt);
      }
      this.contactSolver.initVelocityConstraints(activeManifolds, dt);

      for (let it = 0; it < this.stepConfig.velocityIterations; it++) {
        for (const joint of this.joints) {
          joint.solveVelocityConstraints();
          this.jointSolverCalls++;
        }
        this.contactSolverCalls++;
        this.classicalSolverCalls++;
        this.contactSolver.solveVelocityConstraints(activeManifolds);
      }
    }

    // 7. SubQG Zerstörungsphysik: Belastung -> Materialschaden -> Bruch -> Trümmerteile
    this.destructionSystem.evaluateJointFracture(dt);
    this.destructionSystem.evaluateBodyFracture(activeManifolds, dt);
    this.destructionSystem.stepDebris(dt);

    // 8. Geschwindigkeiten integrieren (x += v * dt)
    for (const body of this.bodies) {
      body.integrateVelocities(dt);
    }

    // 9. Schlafzustände auswerten (Sleeping)
    if (this.stepConfig.enableSleeping) {
      this._evaluateSleeping(dt);
    }

    // 10. Trigger-Ereignisse feuern (onTriggerEnter, onTriggerStay, onTriggerExit)
    this.triggerSystem.flushEvents();

    this.subqgDiagnostics.stepTimeMs = performance.now() - startTime;
  }

  _evaluateSleeping(dt) {
    const linTolSq = 0.002;
    const angTolSq = 0.002;

    for (const b of this.bodies) {
      if (b.type !== 'dynamic' || !b.allowSleep) continue;

      const linSpeedSq = b.velocity.lengthSq();
      const angSpeedSq = b.angularVelocity * b.angularVelocity;

      if (linSpeedSq > linTolSq || angSpeedSq > angTolSq) {
        b.sleepTime = 0.0;
        b.isSleeping = false;
      } else {
        b.sleepTime += dt;
        if (b.sleepTime >= this.stepConfig.timeToSleep) {
          b.putToSleep();
        }
      }
    }
  }

  getSubQGDiagnostics() {
    return { ...this.subqgDiagnostics };
  }
}

// --- src/debug/SubQGInspector.mjs ---

/**
 * SubQGInspector: Extrahiert Metrik-, Wirkungs- und Kausal-Zustände
 * aus dem internen SubQG-Hintergrundgitter für wissenschaftliche Audits,
 * Spiel-Shader und visuelle Heatmaps.
 */
class SubQGInspector {
  constructor(world) {
    this.world = world;
  }

  /**
   * Berechnet die vollständige Energie- und Aktionsbilanz des Gesamtsystems
   */
  computeFullEnergyAudit() {
    let kineticEnergy = 0.0;
    let rotationalEnergy = 0.0;
    let potentialEnergy = 0.0;
    const g = Math.abs(this.world.getGravity().y);

    for (const body of this.world.bodies) {
      if (body.type === 'dynamic' && body.mass > 0) {
        kineticEnergy += 0.5 * body.mass * body.velocity.lengthSq();
        rotationalEnergy += 0.5 * body.inertia * body.angularVelocity * body.angularVelocity;
        potentialEnergy += body.mass * g * Math.max(0, body.position.y);
      }
    }

    const mechanicalTotal = kineticEnergy + rotationalEnergy + potentialEnergy;
    const diag = this.world.getSubQGDiagnostics();

    return {
      kineticEnergy,
      rotationalEnergy,
      potentialEnergy,
      mechanicalTotal,
      subqgEdgeAction: diag.totalEdgeAction,
      maxMetricStrain: diag.maxStrain,
      activeEdges: diag.edgeCount,
      activeNodes: diag.nodeCount,
      stepTimeMs: diag.stepTimeMs
    };
  }

  /**
   * Extrahiert ein 2D Dichte- und Deformations-Grid für Visualisierung
   */
  extractMetricHeatmap(resolution = 32) {
    const graph = this.world.subqgGraph;
    const spanX = graph.extentX * 2;
    const spanY = graph.extentY * 2;
    const stepX = spanX / resolution;
    const stepY = spanY / resolution;

    const grid = [];
    for (let j = 0; j < resolution; j++) {
      const row = [];
      const y = -graph.extentY + j * stepY;
      for (let i = 0; i < resolution; i++) {
        const x = -graph.extentX + i * stepX;
        const phi = graph.samplePotential(new Vec2(x, y));
        row.push(phi);
      }
      grid.push(row);
    }

    return {
      resolution,
      spanX,
      spanY,
      grid
    };
  }
}

// --- src/debug/CanvasRenderer.mjs ---

/**
 * CanvasRenderer: Leichtgewichtiger 2D Canvas-Renderer zur Darstellung
 * von SubQG-Welten, RigidBodies, Gelenken, Kontakten und internem Metrikgitter.
 */
class CanvasRenderer {
  constructor(canvas, world, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.world = world;

    // Kamera & Skalierung
    this.scale = options.scale ?? 30.0; // Pixel pro Meter
    this.camera = options.camera ?? new Vec2(0, 5); // Weltzentrum der Ansicht

    // Render-Flags
    this.showShapes = options.showShapes ?? true;
    this.showJoints = options.showJoints ?? true;
    this.showContacts = options.showContacts ?? true;
    this.showAABBs = options.showAABBs ?? false;
    this.showSubQGLattice = options.showSubQGLattice ?? false;
    this.showRaycasts = options.showRaycasts ?? true;

    this.activeRays = [];
  }

  worldToScreen(worldPos) {
    const cx = this.canvas.width * 0.5;
    const cy = this.canvas.height * 0.5;
    return {
      x: cx + (worldPos.x - this.camera.x) * this.scale,
      y: cy - (worldPos.y - this.camera.y) * this.scale // Y nach oben invertieren
    };
  }

  screenToWorld(screenX, screenY) {
    const cx = this.canvas.width * 0.5;
    const cy = this.canvas.height * 0.5;
    return new Vec2(
      this.camera.x + (screenX - cx) / this.scale,
      this.camera.y - (screenY - cy) / this.scale
    );
  }

  addDebugRay(ray, hit) {
    this.activeRays.push({ ray, hit, time: 0.1 });
  }

  render(dt = 0.016) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. SubQG Metrik-Gitter (falls aktiv)
    if (this.showSubQGLattice) {
      this._renderSubQGLattice();
    }

    // 2. Formen & Körper
    if (this.showShapes) {
      this._renderBodies();
    }

    // 3. Gelenke
    if (this.showJoints) {
      this._renderJoints();
    }

    // 4. Kontakte & Normalen
    if (this.showContacts) {
      this._renderContacts();
    }

    // 5. Raycasts
    if (this.showRaycasts) {
      this._renderRays(dt);
    }

    // 6. SubQG Trümmerteile & Holzsplitter
    this._renderDebris();
  }

  _renderSubQGLattice() {
    const ctx = this.ctx;
    const graph = this.world.subqgGraph;
    ctx.save();
    ctx.lineWidth = 1;

    for (const edge of graph.edges) {
      const uNode = graph.nodes.get(edge.u);
      const vNode = graph.nodes.get(edge.v);
      if (!uNode || !vNode) continue;

      const p1 = this.worldToScreen(uNode.pos);
      const p2 = this.worldToScreen(vNode.pos);

      // Kantenverzerrung visualisieren (Grün = flach, Rot = verzerrt)
      const strain = Math.min(1.0, Math.abs(edge.x_e - 1.0) * 10.0);
      if (strain > 0.01) {
        ctx.strokeStyle = `rgba(255, ${Math.floor(255 * (1 - strain))}, 0, ${0.2 + 0.6 * strain})`;
      } else {
        ctx.strokeStyle = 'rgba(70, 90, 120, 0.15)';
      }

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  _renderBodies() {
    const ctx = this.ctx;

    for (const b of this.world.bodies) {
      ctx.save();
      const isSleeping = b.isSleeping;
      const isStatic = b.type === 'static';

      for (const shape of b.shapes) {
        if (shape.isTrigger) {
          ctx.fillStyle = 'rgba(255, 200, 0, 0.25)';
          ctx.strokeStyle = '#ffbb00';
        } else if (isStatic) {
          ctx.fillStyle = '#2c3e50';
          ctx.strokeStyle = '#7f8c8d';
        } else if (isSleeping) {
          ctx.fillStyle = '#4a5568';
          ctx.strokeStyle = '#a0aec0';
        } else {
          // Dynamisch: Farbe nach Material
          const rest = shape.material.restitution;
          if (rest > 0.6) {
            ctx.fillStyle = '#e74c3c'; // Gummi / Springend
            ctx.strokeStyle = '#c0392b';
          } else if (shape.material.density > 4.0) {
            ctx.fillStyle = '#95a5a6'; // Metall
            ctx.strokeStyle = '#7f8c8d';
          } else {
            ctx.fillStyle = '#3498db'; // Standard Holz / Kiste
            ctx.strokeStyle = '#2980b9';
          }
        }

        ctx.lineWidth = 1.5;

        if (shape.type === 'circle') {
          const center = b.transform.transformPoint(shape.offset);
          const sc = this.worldToScreen(center);
          const r = shape.radius * this.scale;

          ctx.beginPath();
          ctx.arc(sc.x, sc.y, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Rotationslinie
          const edgePt = b.transform.transformPoint(new Vec2(shape.offset.x + shape.radius, shape.offset.y));
          const scEdge = this.worldToScreen(edgePt);
          ctx.beginPath();
          ctx.moveTo(sc.x, sc.y);
          ctx.lineTo(scEdge.x, scEdge.y);
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();

        } else if (shape.type === 'box' || shape.type === 'polygon') {
          const verts = shape.getWorldVertices(b.transform);
          if (verts.length > 0) {
            ctx.beginPath();
            const start = this.worldToScreen(verts[0]);
            ctx.moveTo(start.x, start.y);
            for (let i = 1; i < verts.length; i++) {
              const sc = this.worldToScreen(verts[i]);
              ctx.lineTo(sc.x, sc.y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }

        } else if (shape.type === 'capsule') {
          const [p1, p2] = shape.getWorldEndpoints(b.transform);
          const sc1 = this.worldToScreen(p1);
          const sc2 = this.worldToScreen(p2);
          const r = shape.radius * this.scale;

          ctx.lineWidth = r * 2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(sc1.x, sc1.y);
          ctx.lineTo(sc2.x, sc2.y);
          ctx.stroke();

        } else if (shape.type === 'segment') {
          const [w1, w2] = shape.getWorldEndpoints(b.transform);
          const sc1 = this.worldToScreen(w1);
          const sc2 = this.worldToScreen(w2);

          ctx.strokeStyle = '#ecf0f1';
          ctx.lineWidth = Math.max(2, shape.thickness * this.scale);
          ctx.beginPath();
          ctx.moveTo(sc1.x, sc1.y);
          ctx.lineTo(sc2.x, sc2.y);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }

  _renderJoints() {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = '#2ecc71';
    ctx.fillStyle = '#2ecc71';
    ctx.lineWidth = 2;

    for (const j of this.world.joints) {
      if (j.type === 'distance') {
        const pA = j.bodyA.transform.transformPoint(j.localAnchorA);
        const pB = j.bodyB.transform.transformPoint(j.localAnchorB);
        const scA = this.worldToScreen(pA);
        const scB = this.worldToScreen(pB);

        ctx.beginPath();
        ctx.moveTo(scA.x, scA.y);
        ctx.lineTo(scB.x, scB.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(scA.x, scA.y, 4, 0, Math.PI * 2);
        ctx.arc(scB.x, scB.y, 4, 0, Math.PI * 2);
        ctx.fill();

      } else if (j.type === 'revolute') {
        const pA = j.bodyA.transform.transformPoint(j.localAnchorA);
        const scA = this.worldToScreen(pA);

        ctx.beginPath();
        ctx.arc(scA.x, scA.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#e67e22';
        ctx.fill();
        ctx.stroke();

      } else if (j.type === 'pulley') {
        const pA = j.bodyA.transform.transformPoint(j.localAnchorA);
        const pB = j.bodyB.transform.transformPoint(j.localAnchorB);
        const gA = j.groundAnchorA;
        const gB = j.groundAnchorB;

        const scA = this.worldToScreen(pA);
        const scB = this.worldToScreen(pB);
        const scGA = this.worldToScreen(gA);
        const scGB = this.worldToScreen(gB);

        ctx.strokeStyle = '#9b59b6';
        ctx.beginPath();
        ctx.moveTo(scA.x, scA.y);
        ctx.lineTo(scGA.x, scGA.y);
        ctx.lineTo(scGB.x, scGB.y);
        ctx.lineTo(scB.x, scB.y);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  _renderContacts() {
    const ctx = this.ctx;
    ctx.save();
    for (const m of this.world.contactManifolds.values()) {
      if (m.isTrigger) continue;
      for (const cp of m.points) {
        const sc = this.worldToScreen(cp.point);

        // Kontaktpunkt
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(sc.x, sc.y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Normalenvektor
        const normalEnd = Vec2.add(cp.point, Vec2.scale(m.normal, 0.3));
        const scNorm = this.worldToScreen(normalEnd);
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sc.x, sc.y);
        ctx.lineTo(scNorm.x, scNorm.y);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  _renderRays(dt) {
    const ctx = this.ctx;
    ctx.save();

    for (let i = this.activeRays.length - 1; i >= 0; i--) {
      const item = this.activeRays[i];
      item.time -= dt;
      if (item.time <= 0) {
        this.activeRays.splice(i, 1);
        continue;
      }

      const ray = item.ray;
      const hit = item.hit;
      const start = this.worldToScreen(ray.origin);
      const endPt = hit && hit.hit ? hit.point : Vec2.add(ray.origin, Vec2.scale(ray.direction, Math.min(20, ray.maxDistance)));
      const end = this.worldToScreen(endPt);

      ctx.strokeStyle = hit && hit.hit ? '#2ecc71' : '#e74c3c';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      ctx.setLineDash([]);

      if (hit && hit.hit) {
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath();
        ctx.arc(end.x, end.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  _renderDebris() {
    if (!this.world.destructionSystem) return;
    const particles = this.world.destructionSystem.debrisParticles;
    if (!particles || particles.length === 0) return;

    const ctx = this.ctx;
    ctx.save();
    for (const p of particles) {
      const sc = this.worldToScreen(new Vec2(p.x, p.y));
      const r = Math.max(1.5, p.size * this.scale);
      ctx.fillStyle = p.color || '#f6ad55';
      ctx.globalAlpha = Math.max(0.1, Math.min(1.0, p.life));
      ctx.beginPath();
      ctx.arc(sc.x, sc.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

// --- demo/demo_scenes.mjs ---

/**
 * Demo-Szenen für das interaktive Physik-Labor
 */
const DemoScenes = {
  // Szene 1: Kistenturm & Stapeln
  stackingTower(world) {
    // Boden
    world.createBox(0, 0, 40, 1.0, {
      type: 'static',
      material: new Material({ friction: 0.6, restitution: 0.0 })
    });

    // 8 Kisten übereinander gestapelt
    for (let i = 0; i < 8; i++) {
      world.createBox(0, 1.0 + i * 1.05, 1.0, 1.0, {
        type: 'dynamic',
        material: new Material({ friction: 0.6, restitution: 0.05 }),
        linearDamping: 0.05,
        angularDamping: 0.05
      });
    }

    // Zusätzliche Kistenpyramide links
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4 - row; col++) {
        const x = -8 + col * 1.1 + row * 0.55;
        const y = 1.0 + row * 1.05;
        world.createBox(x, y, 1.0, 1.0, {
          type: 'dynamic',
          material: new Material({ friction: 0.5, restitution: 0.1 })
        });
      }
    }
  },

  // Szene 2: Springende Bälle & Murmelbahn
  bouncingBalls(world) {
    // Geneigte Rampen (Segmente / Boxen)
    world.createBox(-5, 8, 12, 0.4, {
      type: 'static',
      angle: -0.3,
      material: new Material({ friction: 0.05, restitution: 0.7 })
    });

    world.createBox(5, 5, 12, 0.4, {
      type: 'static',
      angle: 0.3,
      material: new Material({ friction: 0.05, restitution: 0.7 })
    });

    world.createBox(0, 0, 30, 1.0, {
      type: 'static',
      material: new Material({ friction: 0.2, restitution: 0.8 })
    });

    // Bälle mit unterschiedlichen Farben und Elastizitäten
    for (let i = 0; i < 12; i++) {
      const x = -9 + (i % 4) * 0.8 + Math.random() * 0.2;
      const y = 12 + Math.floor(i / 4) * 1.2;
      world.createCircle(x, y, 0.3 + Math.random() * 0.2, {
        type: 'dynamic',
        material: new Material({
          density: 1.0,
          friction: 0.1,
          restitution: 0.6 + Math.random() * 0.35
        })
      });
    }
  },

  // Szene 3: Seilbrücke / Hängebrücke
  ropeBridge(world, options = {}) {
    world.createBox(0, 0, 40, 1.0, { type: 'static' });

    // Belastungsgrenze: Bei Materialbruch-Modus brechen Gelenke bei 250 N
    const breakable = options.breakable ?? false;
    const breakingForce = breakable ? (options.breakingForce ?? 250) : Infinity;

    // Zwei Pfeiler
    const p1 = world.createBox(-8, 5, 1.5, 4, { type: 'static' });
    const p2 = world.createBox(8, 5, 1.5, 4, { type: 'static' });

    // 12 Brückensegmente
    const segments = [];
    let prev = p1;
    let prevAnchor = new Vec2(-7.25, 6.8);

    for (let i = 0; i < 12; i++) {
      const x = -6.5 + i * 1.18;
      const sag = 0.5 * (1.0 - (x / 7.0) * (x / 7.0));
      const y = 6.5 - Math.max(0, sag);
      const plank = world.createBox(x, y, 1.1, 0.2, {
        type: 'dynamic',
        isDestructible: breakable,
        fractureForce: 350.0,
        linearDamping: 0.2,
        angularDamping: 0.4,
        material: new Material({ density: 1.2, friction: 0.6, restitution: 0.05 })
      });
      segments.push(plank);

      const anchor = new Vec2(x - 0.55, y);
      world.createRevoluteJoint(prev, plank, anchor, { breakingForce });
      prev = plank;
      prevAnchor = new Vec2(x + 0.55, y);
    }

    world.createRevoluteJoint(prev, p2, new Vec2(7.25, 6.8), { breakingForce });

    // Schwerer Stein fällt auf die Brücke
    world.createCircle(0, 12, 0.8, {
      type: 'dynamic',
      userData: 'Felsblock',
      material: new Material({ density: 4.0, friction: 0.5, restitution: 0.1 })
    });
  },

  // Szene 3b: Zerstörbare Hängebrücke (Materialbruch bei 250 N Belastung)
  ropeBridgeBreakable(world) {
    this.ropeBridge(world, { breakable: true, breakingForce: 250 });
  },

  // Szene 4: Motorisiertes Geländefahrzeug
  vehicleTerrain(world) {
    // Hügelige Landschaft (Kette aus Segmenten)
    const points = [
      [-20, 3], [-10, 0.5], [0, 0], [10, 1.5], [18, 0.5], [25, 3], [35, 0]
    ];
    for (let i = 0; i < points.length - 1; i++) {
      world.createSegment(points[i][0], points[i][1], points[i+1][0], points[i+1][1], {
        type: 'static',
        material: new Material({ friction: 0.9 })
      });
    }

    // Hangneigung am Startpunkt x = -13:
    // Zwischen [-20, 3] und [-10, 0.5] beträgt der Neigungswinkel atan2(-2.5, 10) = -0.245 rad (~ -14°)
    const slopeAngle = -0.245;
    const cosA = Math.cos(slopeAngle);
    const sinA = Math.sin(slopeAngle);

    // Fahrgestell: Tiefer Schwerpunkt, solider Radstand, Hang-angepasster Startwinkel
    const chassis = world.createBox(-13.0, 1.85, 3.8, 0.4, {
      type: 'dynamic',
      angle: slopeAngle,
      linearDamping: 0.1,
      angularDamping: 1.5,
      material: new Material({ density: 5.0, friction: 0.4 })
    });

    // Räder: Hohe Bodenhaftung und weiche Landung (restitution 0.0 verhindert Trampolin-Effekt)
    const wheelMat = new Material({ density: 1.5, friction: 1.0, restitution: 0.0 });
    const rearPos = new Vec2(-13.0 - 1.5 * cosA, 1.85 - 1.5 * sinA);
    const frontPos = new Vec2(-13.0 + 1.5 * cosA, 1.85 + 1.5 * sinA);
    const rear = world.createCircle(rearPos.x, rearPos.y, 0.55, { type: 'dynamic', material: wheelMat });
    const front = world.createCircle(frontPos.x, frontPos.y, 0.55, { type: 'dynamic', material: wheelMat });

    // Anti-Wheelie Allradantrieb mit Front-Zugkraft:
    // Der Frontmotor zieht das Fahrzeug aktiv vorwärts und abwärts an den Hang,
    // während der Heckmotor mit reduzierter Kraft sanft unterstützt, ohne die Nase aufzubäumen.
    world.createRevoluteJoint(chassis, rear, rearPos, {
      enableMotor: true,
      motorSpeed: -12.0,
      maxMotorTorque: 6.0
    });
    world.createRevoluteJoint(chassis, front, frontPos, {
      enableMotor: true,
      motorSpeed: -12.0,
      maxMotorTorque: 28.0
    });
  },

  // Szene 5: Katapult & Trebuchet (Verschiebbar & Manuell auslösbar)
  catapult(world) {
    world.createBox(0, 0, 80, 1.0, { type: 'static' });

    // Verschiebbares Katapult-Fahrgestell (Dynamic, mit der Maus greif- und verschiebbar!)
    const base = world.createBox(-12.0, 1.6, 3.2, 2.0, {
      type: 'dynamic',
      linearDamping: 0.3,
      angularDamping: 1.0,
      userData: 'Katapult-Fahrgestell (Verschiebbar)',
      material: new Material({ density: 10.0, friction: 0.9 })
    });
    base.invInertia = 0; // Fixierte Rotation: Steht beim Abfeuern stabil, kann horizontal frei verschoben werden

    // Wurfarm: Drehpunkt bei (-12.0, 2.4), zeigt in Ladestellung nach links
    const arm = world.createBox(-14.5, 2.4, 5.0, 0.35, {
      type: 'dynamic',
      userData: 'Katapult-Arm',
      material: new Material({ density: 1.0, friction: 0.4 })
    });

    // Wurfschale (Cup) am Hebelende
    const cup = world.createBox(-16.9, 2.8, 0.4, 0.8, {
      type: 'dynamic',
      userData: 'Katapult-Schale',
      material: new Material({ density: 0.8, friction: 0.2 })
    });
    world.createWeldJoint(arm, cup, new Vec2(-16.9, 2.4));

    // Gelenk mit Torsionsantrieb: Initial AUS (manuell startbar!)
    const catapultJoint = world.createRevoluteJoint(base, arm, new Vec2(-12.0, 2.4), {
      enableMotor: false,
      motorSpeed: -16.0,
      maxMotorTorque: 3500.0,
      enableLimit: true,
      lowerAngle: -Math.PI * 0.75, // ~ -135° Schlägt bei 45° nach rechts an
      upperAngle: Math.PI * 0.1
    });

    // Projektil (Schwerer Felsblock, zerstörbar bei Aufprall!)
    world.createCircle(-16.3, 3.1, 0.45, {
      type: 'dynamic',
      isDestructible: true,
      fractureForce: 400.0,
      userData: 'Felsblock',
      material: new Material({ density: 4.5, friction: 0.2, restitution: 0.15 })
    });

    // Treibgut / Zielmauer aus zerstörbaren Kisten bei x = 8..11
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 3; c++) {
        world.createBox(8.0 + c * 0.8, 0.9 + r * 0.8, 0.7, 0.7, {
          type: 'dynamic',
          isDestructible: true,
          fractureForce: 130.0,
          material: new Material({ density: 1.0, friction: 0.6, restitution: 0.05 })
        });
      }
    }

    // Katapult-Steuerung für manuelle Auslösung
    world.catapultController = {
      joint: catapultJoint,
      arm: arm,
      base: base,
      cup: cup,
      isFired: false,
      fire() {
        catapultJoint.enableMotor = true;
        catapultJoint.motorSpeed = -16.0;
        catapultJoint.maxMotorTorque = 3500.0;
        this.isFired = true;
      },
      reload() {
        catapultJoint.enableMotor = true;
        catapultJoint.motorSpeed = 6.0;
        catapultJoint.maxMotorTorque = 600.0;
        setTimeout(() => {
          catapultJoint.enableMotor = false;
          this.isFired = false;
          // Neues Projektil in die Wurfschale legen
          world.createCircle(base.position.x - 4.3, base.position.y + 1.4, 0.45, {
            type: 'dynamic',
            isDestructible: true,
            fractureForce: 400.0,
            userData: 'Felsblock',
            material: new Material({ density: 4.5, friction: 0.2, restitution: 0.15 })
          });
        }, 600);
      }
    };
  },

  // Szene 6: Sensor-Radar & Triggers
  sensorsAndTrays(world) {
    world.createBox(0, 0, 40, 1.0, { type: 'static' });

    // Ein Durchgang mit Trigger-Feld
    world.createBox(-2, 4, 1.5, 4, { type: 'static' });
    world.createBox(2, 4, 1.5, 4, { type: 'static' });

    // Sensor-Tor in der Mitte
    const trigger = world.createBox(0, 4, 2.5, 4.0, {
      type: 'static',
      isTrigger: true,
      userData: { name: 'GateSensor' }
    });

    // Periodisch Bälle durchrollen lassen
    for (let i = 0; i < 5; i++) {
      const b = world.createCircle(-8 - i * 1.5, 2.0, 0.4, {
        type: 'dynamic',
        material: new Material({ friction: 0.1, restitution: 0.5 })
      });
      b.setVelocity(5.0, 0); // Rollen nach rechts durch das Tor
    }
  }
};

// Application Logic

    const canvas = document.getElementById('physics-canvas');
    let world, renderer, inspector;
    let dragBody = null;
    let dragLocalAnchor = new Vec2();
    let rightClickRayStart = null;
    let mousePosWorld = new Vec2();

    function resizeCanvas() {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function loadScene(sceneKey) {
      const mode = document.getElementById('engine-mode-select').value;
      world = new World({
        engineMode: mode,
        gravity: document.getElementById('chk-gravity').checked ? new Vec2(0, -9.81) : new Vec2(0, 0),
        enableSubQGLattice: true,
        velocityIterations: 10
      });

      renderer = new CanvasRenderer(canvas, world, {
        scale: 32.0,
        camera: new Vec2(0, 5),
        showSubQGLattice: document.getElementById('chk-subqg').checked,
        showContacts: document.getElementById('chk-contacts').checked
      });

      inspector = new SubQGInspector(world);

      const breakable = document.getElementById('chk-breakable').checked;
      if (sceneKey === 'ropeBridge') {
        DemoScenes.ropeBridge(world, { breakable: false });
      } else if (sceneKey === 'ropeBridgeBreakable') {
        DemoScenes.ropeBridge(world, { breakable: true, breakingForce: 450 });
      } else if (DemoScenes[sceneKey]) {
        DemoScenes[sceneKey](world);
      }

      // Zeige Katapult-Steuerung nur in Szene 5
      const isCatapult = sceneKey === 'catapult';
      document.getElementById('btn-fire-catapult').style.display = isCatapult ? 'inline-block' : 'none';
      document.getElementById('btn-reload-catapult').style.display = isCatapult ? 'inline-block' : 'none';
    }

    const sceneSelect = document.getElementById('scene-select');
    const modeSelect = document.getElementById('engine-mode-select');
    sceneSelect.addEventListener('change', () => loadScene(sceneSelect.value));
    modeSelect.addEventListener('change', () => loadScene(sceneSelect.value));
    document.getElementById('btn-reset').addEventListener('click', () => loadScene(sceneSelect.value));

    // Katapult Manuelle Steuerung
    document.getElementById('btn-fire-catapult').addEventListener('click', () => {
      if (world.catapultController) world.catapultController.fire();
    });
    document.getElementById('btn-reload-catapult').addEventListener('click', () => {
      if (world.catapultController) world.catapultController.reload();
    });
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && sceneSelect.value === 'catapult') {
        e.preventDefault();
        if (world.catapultController) world.catapultController.fire();
      }
    });

    document.getElementById('chk-breakable').addEventListener('change', () => {
      const curScene = sceneSelect.value;
      if (curScene === 'ropeBridge' || curScene === 'ropeBridgeBreakable') {
        loadScene(document.getElementById('chk-breakable').checked ? 'ropeBridgeBreakable' : 'ropeBridge');
      }
    });

    document.getElementById('chk-subqg').addEventListener('change', (e) => {
      renderer.showSubQGLattice = e.target.checked;
    });

    document.getElementById('chk-contacts').addEventListener('change', (e) => {
      renderer.showContacts = e.target.checked;
    });

    document.getElementById('chk-gravity').addEventListener('change', (e) => {
      world.setGravity(0, e.target.checked ? -9.81 : 0);
      for (const b of world.bodies) b.wakeUp();
    });

    // Spawning Buttons - Alle 4 Materialien besitzen vollaktive Destruction Physics!
    document.getElementById('btn-spawn-box').addEventListener('click', () => {
      world.createBox(renderer.camera.x + (Math.random() - 0.5) * 2, renderer.camera.y + 6, 1.0, 1.0, {
        isDestructible: true,
        fractureForce: 150.0,
        userData: 'Kiste (Holz)',
        material: Material.wood()
      });
    });

    document.getElementById('btn-spawn-ball').addEventListener('click', () => {
      world.createCircle(renderer.camera.x + (Math.random() - 0.5) * 2, renderer.camera.y + 6, 0.5, {
        isDestructible: true,
        fractureForce: 450.0,
        userData: 'Ball (Gummi)',
        material: Material.rubber()
      });
    });

    document.getElementById('btn-spawn-boulder').addEventListener('click', () => {
      world.createCircle(renderer.camera.x + (Math.random() - 0.5) * 2, renderer.camera.y + 6, 0.8, {
        isDestructible: true,
        fractureForce: 400.0,
        userData: 'Felsblock',
        material: new Material({ density: 8.0, friction: 0.6, restitution: 0.05 })
      });
    });

    document.getElementById('btn-spawn-capsule').addEventListener('click', () => {
      world.createCapsule(renderer.camera.x + (Math.random() - 0.5) * 2, renderer.camera.y + 6, 1.4, 0.35, {
        isDestructible: true,
        fractureForce: 180.0,
        userData: 'Kapsel',
        material: Material.wood()
      });
    });

    // Mouse Interactions (Pick & Drag / Laser Raycast)
    canvas.addEventListener('mousedown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const wPos = renderer.screenToWorld(sx, sy);

      if (e.button === 0) { // Linksklick: Drag
        const hits = world.queryPoint(wPos);
        if (hits.length > 0) {
          const hit = hits[hits.length - 1];
          if (hit.body.type === 'dynamic') {
            dragBody = hit.body;
            dragLocalAnchor = dragBody.transform.inverseTransformPoint(wPos);
            dragBody.wakeUp();
          }
        }
      } else if (e.button === 2) { // Rechtsklick: Raycast
        rightClickRayStart = wPos.clone();
      }
    });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      mousePosWorld = renderer.screenToWorld(sx, sy);
    });

    window.addEventListener('mouseup', () => {
      dragBody = null;
      rightClickRayStart = null;
    });

    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      renderer.scale = Math.max(10.0, Math.min(100.0, renderer.scale * zoomFactor));
    });

    // Initial Scene
    loadScene('stackingTower');

    // Main Game Loop
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTime = 0;

    function loop(time) {
      const dt = Math.min(0.033, (time - lastTime) / 1000.0);
      lastTime = time;

      // Maus-Drag-Federkraft anwenden
      if (dragBody) {
        const targetWorld = mousePosWorld;
        const currentWorld = dragBody.transform.transformPoint(dragLocalAnchor);
        const delta = Vec2.sub(targetWorld, currentWorld);
        const springK = 150.0;
        const dampingK = 20.0;
        const fSpring = Vec2.scale(delta, springK * dragBody.mass);
        const vAtPoint = dragBody.getVelocityAtPoint(currentWorld);
        const fDamping = Vec2.scale(vAtPoint, dampingK * dragBody.mass);
        const fTotal = Vec2.sub(fSpring, fDamping);

        dragBody.applyForceAtPoint(fTotal, currentWorld);
      }

      // Rechtsklick Laser-Raycast
      if (rightClickRayStart) {
        const dir = Vec2.sub(mousePosWorld, rightClickRayStart);
        const len = dir.length();
        if (len > 0.05) {
          const hit = world.raycast(rightClickRayStart, dir.clone().normalize(), len);
          renderer.addDebugRay({ origin: rightClickRayStart, direction: dir.normalize(), maxDistance: len }, hit);
        }
      }

      // Physikschritt
      world.step(1.0 / 60.0);

      // Rendern
      renderer.render(dt);

      // HUD Telemetrie aktualisieren
      frameCount++;
      fpsTime += dt;
      if (fpsTime >= 0.25) {
        const fps = Math.round(frameCount / fpsTime);
        document.getElementById('hud-fps').textContent = fps;
        frameCount = 0;
        fpsTime = 0;

        const isPure = world.engineMode === 'pure-subqg';
        const modeEl = document.getElementById('hud-mode');
        modeEl.textContent = isPure ? 'PURE SUBQG (100%)' : 'HYBRID';
        modeEl.style.color = isPure ? '#d6bcfa' : '#63b3ed';

        const contactCalls = isPure ? '0 (Pure SubQG)' : world.contactSolverCalls + ' Aufrufe';
        const contactEl = document.getElementById('hud-contact-solver');
        contactEl.textContent = contactCalls;
        contactEl.style.color = isPure ? '#68d391' : '#f6ad55';

        const jointEl = document.getElementById('hud-joint-solver');
        jointEl.textContent = world.jointSolverCalls + ' Aufrufe';

        const jointsEl = document.getElementById('hud-joints');
        jointsEl.textContent = world.joints.length + ' intakt';

        const matEl = document.getElementById('hud-material');
        if (world.brokenJointsCount > 0) {
          matEl.textContent = 'BRUCH (' + world.brokenJointsCount + ' gerissen)';
          matEl.style.color = '#fc8181';
        } else {
          matEl.textContent = 'Intakt';
          matEl.style.color = '#68d391';
        }

        let sleepingCount = 0;
        for (const b of world.bodies) if (b.isSleeping) sleepingCount++;

        const audit = inspector.computeFullEnergyAudit();
        document.getElementById('hud-bodies').textContent = world.bodies.length;
        document.getElementById('hud-contacts').textContent = world.contactManifolds.size;
        document.getElementById('hud-sleeping').textContent = sleepingCount;
        document.getElementById('hud-energy').textContent = audit.kineticEnergy.toFixed(1) + ' J';

        document.getElementById('hud-action').textContent = audit.subqgEdgeAction.toFixed(3);
        document.getElementById('hud-strain').textContent = (audit.maxMetricStrain * 100.0).toFixed(2) + '%';
        document.getElementById('hud-edges').textContent = audit.activeEdges;
      }

      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);

</script>

</body>
</html>

```

## File: `docs/API_INTEGRATION_GUIDE.md`  
- Path: `docs/API_INTEGRATION_GUIDE.md`  
- Size: 9292 Bytes  
- Modified: 2026-11-12 15:48:48 UTC  
- Condensed: comments and repeated blank lines reduced

```markdown
# SubQG Physics Engine – Universeller API & Integrations-Guide
**Verbindung mit Unreal Engine 5, Blender 3.x/4.x und eigenen Game Engines**

---

## 1. System- & Architekturübersicht

Die **SubQG Physics Engine** basiert auf dem relationalen Subquantum-Graphity-Metrikgitter (100% First-Principles, 0 Kontakt-Impulssolver). Um die Engine universell in externen 3D-Engines, DCC-Tools und eigenen Rendering-Pipelines nutzbar zu machen, stellt sie einen extrem performanten, plattformunabhängigen **Live-Physik-Server** bereit.

```
+-------------------------------------------------------------------------+
|                  SubQG Physics Engine (Node.js Server)                  |
|  - Relationales Metrikgitter (Wirkungsvariation)                        |
|  - Kantenbarriere-Repulsion & Relationale Scherdämpfung                 |
|  - Kontinuierliche Gelenkbindungen & SubQG Materialbruch (Destruction)  |
+------------------------------------+------------------------------------+
                                     |
              +----------------------+----------------------+
              |                                             |
   [TCP Socket Stream: Port 3001]                [HTTP JSON-RPC: Port 3002]
   - Framed NDJSON (60 - 120 Hz)                 - REST API & Batch Baking
   - Latenz < 0.5 ms                             - Offline Keyframe-Export
              |                                             |
   +----------+-----------+                      +----------+-----------+
   |                      |                      |                      |
   v                      v                      v                      v
Unreal Engine 5       Custom C++            Blender 3.x/4.x        Web / Tools
(C++ / Blueprints)    Game Engines          (Python Addon)         (REST Clients)
```

### Server starten
Im Verzeichnis `game_physic_engine`:
```bash
npm run server
# oder: node tools/start_physics_server.mjs
```
Standard-Ports:
* **TCP Port 3001:** Echtzeit-Streaming für Unreal Engine, eigene Game Engines und interaktive Viewports.
* **HTTP Port 3002:** REST API und Batch Baking für Animations-Keyframes in Blender.

---

## 2. Unreal Engine 5 Integration (C++ & Blueprints)

### Schritt 1: Header und Source in das Unreal-Projekt kopieren
Kopiere die beiden Integrationsdateien in das `Source/<DeinProjekt>/`-Verzeichnis:
* `integrations/unreal/SubQGUnrealBridge.h`
* `integrations/unreal/SubQGUnrealBridge.cpp`

### Schritt 2: Module in `DeinProjekt.Build.cs` aktivieren
Füge `Sockets`, `Networking` und `Json` zu den `PublicDependencyModuleNames` hinzu:
```csharp
PublicDependencyModuleNames.AddRange(new string[] {
    "Core",
    "CoreUObject",
    "Engine",
    "InputCore",
    "Sockets",
    "Networking",
    "Json",
    "JsonUtilities"
});
```

### Schritt 3: Koordinaten-Mapping (Meters zu Zentimetern)
Unreal Engine arbeitet in Zentimetern (Z nach oben), während SubQG in physikalischen SI-Metern rechnet:
$$\vec{X}_{\text{UE}} = x_{\text{SubQG}} \cdot 100 \quad [\text{cm}]$$
$$\vec{Z}_{\text{UE}} = y_{\text{SubQG}} \cdot 100 \quad [\text{cm}]$$
$$\text{Pitch}_{\text{UE}} = -\theta_{\text{SubQG}} \cdot \frac{180}{\pi} \quad [^\circ]$$

### Schritt 4: Blueprint-Nutzung
1. **World Subsystem abrufen:** `Get SubQGPhysicsSubsystem`
2. **Verbinden:** Node `Connect To SubQG Server` (Host: `127.0.0.1`, Port: `3001`) aufrufen (z.B. in `BeginPlay`).
3. **Actor registrieren:** Rufe `Register Actor Binding` auf, um einen Unreal Actor mit einer SubQG Body-ID zu verknüpfen.
4. **Körper erzeugen:** `Spawn SubQG Box` oder `Spawn SubQG Sphere`.
5. **Zerstörungs-Events abfangen:** Binde an das Delegate `OnSubQGFracture`. Wenn eine Planke oder ein Felsen zerbricht, liefert das Event die genaue Bruchposition im Unreal-Raum – ideal, um ein **Niagara-Partikelsystem** (Holzsplitter, Steinstaub) oder einen **Chaos Geometry Collection**-Spawn auszulösen!

---

## 3. Blender 3.x / 4.x Integration (Python Addon & Keyframe Baking)

Mit der Blender-Integration kannst du komplexe SubQG-Kollisionen, elastische Stöße, Gelenkketten und Materialbrüche direkt mit einem Klick in photorealistische Blender-Animationen backen.

### Schritt 1: Skript in Blender laden
1. Starte den SubQG Server: `npm run server`
2. Öffne Blender (3.6 LTS, 4.0, 4.1 oder neuer).
3. Wechsle in den Arbeitsbereich **Scripting** -> erstelle ein neues Textdokument.
4. Öffne oder füge den Inhalt von `integrations/blender/subqg_blender_bridge.py` ein.
5. Klicke auf **Run Script** (oder installiere es als Addon über `Edit > Preferences > Add-ons > Install`).

### Schritt 2: Live-Nutzung im 3D-Viewport
1. Drücke im 3D-Viewport die Taste `N`, um das Sidebar-Panel zu öffnen.
2. Wechsle auf den Reiter **SubQG Physics**.
3. Klicke auf **Mit SubQG Server verbinden**.
4. Wähle die gewünschten Meshes in der Szene aus (z.B. einen Kistenturm und einen fallenden Fels).
5. Klicke auf **In Keyframes backen**:
   * Das Addon serialisiert die Geometrie der ausgewählten Objekte an SubQG.
   * Die SubQG-Engine berechnet die Kantenbarriere-Repulsionen und Bruchtrennungen.
   * Alle Translations- und Rotationswerte werden Frame für Frame in die Animationskurven der Blender-Objekte geschrieben!
6. Drücke die Leertaste in Blender – die Physik läuft mit voller Frame-Rate ab und kann sofort gerendert werden (Cycles / Eevee).

---

## 4. Eigene Game Engines (C++ / Python / Rust / Godot)

### A. Eigene C++ Game Engine (Header-Only `SubQGClient.hpp`)
Das Header-Only Interface benötigt keine externen Bibliotheken und funktioniert sofort unter Windows (Winsock2) und Linux/macOS (POSIX):

```cpp
#include "integrations/custom_engine/SubQGClient.hpp"

int main() {
    SubQG::Client physics;

    // 1. Verbinde mit dem lokalen SubQG Physics Server
    if (!physics.connect("127.0.0.1", 3001)) {
        std::cerr << "SubQG Server nicht erreichbar!" << std::endl;
        return 1;
    }

    // 2. Welt im Pure-SubQG Modus initialisieren (First-Principles)
    physics.createWorld("pure-subqg", 0.0f, -9.81f);

    // 3. Statischen Boden und dynamische Kiste erzeugen
    physics.createBox("ground", 0.0f, 0.0f, 40.0f, 1.0f, false);
    physics.createBox("crate_1", 0.0f, 8.0f, 1.2f, 1.2f, true, true, 300.0f);

    // 4. Game Loop (60 FPS)
    while (true) {
        // Simulationsschritt (dt = 1/60s)
        SubQG::WorldSnapshot snap = physics.step(1.0f / 60.0f);

        for (const auto& body : snap.bodies) {
            // Rendere Objekt an Position (body.x, body.y) mit Rotation body.angleDeg
            std::cout << body.id << " -> X: " << body.x << " | Y: " << body.y << "\n";
        }
    }

    return 0;
}
```

### B. Eigene Python Engine (Pygame, Ursina, Arcade, Godot)
Verwende das zero-dependency Skript `integrations/custom_engine/subqg_client.py`:

```python
from subqg_client import SubQGClient

client = SubQGClient("127.0.0.1", 3001)
client.connect()

# Welt aufbauen
client.create_world("pure-subqg", (0, -9.81))
client.create_box("floor", 0, 0, 50, 1.0, is_dynamic=False)
client.create_circle("ball", 0, 10, 0.5, is_dynamic=True)

# Gameloop
def update():
    state = client.step(1.0 / 60.0)
    for b in state["bodies"]:
        my_engine_set_transform(b["id"], b["x"], b["y"], b["angle"])
```

---

## 5. Vollständige JSON-RPC API Referenz

Alle Befehle können sowohl als Line-Delimited JSON über **TCP (Port 3001)** als auch per HTTP POST an `/api/rpc` an **HTTP (Port 3002)** gesendet werden.

| Methode | Parameter | Beschreibung |
|---|---|---|
| `create_world` | `engineMode` ("pure-subqg"\|"hybrid"), `gravity` [gx, gy], `enableSubQGLattice` (bool) | Erzeugt eine frische SubQG-Simulationswelt. |
| `load_scene` | `scene` ("ropeBridge", "ropeBridgeBreakable", "vehicleTerrain", "catapult") | Lädt eine vordefinierte Test- und Demoszene. |
| `create_box` | `id`, `x`, `y`, `width`, `height`, `type`, `density`, `friction`, `isDestructible`, `fractureForce` | Erzeugt einen rechteckigen Rigid Body. |
| `create_circle` | `id`, `x`, `y`, `radius`, `type`, `density`, `friction`, `isDestructible`, `fractureForce` | Erzeugt einen kreisförmigen Rigid Body. |
| `create_capsule`| `id`, `x`, `y`, `length`, `radius`, `type` | Erzeugt eine Kapsel. |
| `create_segment`| `id`, `x1`, `y1`, `x2`, `y2`, `friction` | Erzeugt ein statisches Liniensegment (z.B. Gelände). |
| `create_joint`  | `type` ("revolute"\|"distance"\|"weld"), `bodyA`, `bodyB`, `anchorX`, `anchorY`, `breakingForce` | Erzeugt eine topologische Gelenkverbindung mit optionaler Bruchlast. |
| `step`          | `dt` (Sekunden, z.B. 0.01666) | Führt einen Simulationsschritt aus und gibt den neuen Zustand zurück. |
| `get_state`     | *(keine)* | Liefert die aktuellen Posen, Geschwindigkeiten und Energiewerte aller Körper. |
| `apply_force`   | `id`, `fx`, `fy`, `px` (opt), `py` (opt) | Übt eine kontinuierliche Kraft (Newton) auf einen Körper aus. |
| `apply_impulse` | `id`, `ix`, `iy`, `px` (opt), `py` (opt) | Übt einen Sofortimpuls (N·s) auf einen Körper aus. |
| `raycast`       | `origin` [x, y], `direction` [dx, dy], `maxDistance` | Führt einen präzisen Laser-/Sichtlinien-Test durch. |
| `bake`          | `steps` (Anzahl Frames), `dt` | Backt die gesamte Simulation in ein Array von Snapshots (ideal für Blender). |

```

## File: `examples/01_falling_box.mjs`  
- Path: `examples/01_falling_box.mjs`  
- Size: 1152 Bytes  
- Modified: 2026-11-12 01:35:40 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import { World, Vec2, Material } from '../index.mjs';

const world = new World({ gravity: new Vec2(0, -9.81) });

world.createBox(0, 0, 20, 1.0, {
  type: 'static',
  material: Material.wood()
});

const box = world.createBox(0, 5.0, 1.0, 1.0, {
  type: 'dynamic',
  material: Material.wood()
});

console.log('=== SubQG Game Physics Engine: Fallende Kiste ===');
console.log(`Startposition: y = ${box.position.y.toFixed(2)} m`);

for (let step = 0; step <= 80; step++) {
  world.step(1.0 / 60.0);
  if (step % 10 === 0) {
    const diag = world.getSubQGDiagnostics();
    console.log(
      `Frame ${step.toString().padStart(2, ' ')} (${(step / 60).toFixed(2)}s): ` +
      `y = ${box.position.y.toFixed(3)} m, vy = ${box.velocity.y.toFixed(3)} m/s | ` +
      `SubQG Gitter-Wirkung: ${diag.totalEdgeAction.toFixed(4)}`
    );
  }
}

console.log(`Endposition: y = ${box.position.y.toFixed(3)} m (Ruhelage auf Bodenoberkante y = 1.000 m)`);

```

## File: `examples/02_bouncing_ball.mjs`  
- Path: `examples/02_bouncing_ball.mjs`  
- Size: 825 Bytes  
- Modified: 2026-11-12 01:35:50 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import { World, Vec2, Material } from '../index.mjs';

const world = new World({ gravity: new Vec2(0, -9.81) });

world.createBox(0, 0, 20, 1.0, {
  type: 'static',
  material: Material.stone()
});

const ball = world.createCircle(0, 6.0, 0.5, {
  type: 'dynamic',
  material: Material.rubber()
});

console.log('=== SubQG Game Physics Engine: Springender Gummiball ===');

let bounces = 0;
let prevVy = 0;

for (let step = 0; step < 120; step++) {
  world.step(1.0 / 60.0);
  if (prevVy < -0.5 && ball.velocity.y > 0.5) {
    bounces++;
    console.log(`-> Aufprall #${bounces} bei t = ${(step / 60).toFixed(2)}s: Rebound mit vy = +${ball.velocity.y.toFixed(2)} m/s`);
  }
  prevVy = ball.velocity.y;
}

console.log(`Ergebnis: Ball absolvierte ${bounces} elastische Sprünge.`);

```

## File: `examples/03_joint_pendulum.mjs`  
- Path: `examples/03_joint_pendulum.mjs`  
- Size: 886 Bytes  
- Modified: 2026-11-12 01:35:58 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import { World, Vec2 } from '../index.mjs';

const world = new World({ gravity: new Vec2(0, -9.81) });

const ceiling = world.createBox(0, 10, 4, 0.5, { type: 'static' });

const bob1 = world.createCircle(2, 10, 0.4, { type: 'dynamic' });
world.createRevoluteJoint(ceiling, bob1, new Vec2(0, 10));

const bob2 = world.createCircle(4, 10, 0.4, { type: 'dynamic' });
world.createRevoluteJoint(bob1, bob2, new Vec2(2, 10));

console.log('=== SubQG Game Physics Engine: Doppelpendel ===');
for (let step = 0; step < 60; step++) {
  world.step(1.0 / 60.0);
  if (step % 15 === 0) {
    console.log(
      `t = ${(step / 60).toFixed(2)}s: ` +
      `Bob1 = (${bob1.position.x.toFixed(2)}, ${bob1.position.y.toFixed(2)}), ` +
      `Bob2 = (${bob2.position.x.toFixed(2)}, ${bob2.position.y.toFixed(2)})`
    );
  }
}

```

## File: `examples/04_raycast_sensor.mjs`  
- Path: `examples/04_raycast_sensor.mjs`  
- Size: 815 Bytes  
- Modified: 2026-11-12 01:36:04 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript
import { World, Vec2 } from '../index.mjs';

const world = new World();

const obstacle = world.createBox(6, 2, 2, 2, { type: 'static' });

const playerPos = new Vec2(0, 2);
const directions = [
  new Vec2(1, 0),
  new Vec2(1, 0.5).normalize(),
  new Vec2(1, -0.5).normalize(),
  new Vec2(0, 1)
];

console.log('=== SubQG Game Physics Engine: Raycast-Radar ===');
for (const dir of directions) {
  const hit = world.raycast(playerPos, dir, 20);
  if (hit) {
    console.log(`[RADAR] Treffer in Richtung (${dir.x.toFixed(2)}, ${dir.y.toFixed(2)}): Distanz = ${hit.distance.toFixed(2)}m bei (${hit.point.x.toFixed(2)}, ${hit.point.y.toFixed(2)})`);
  } else {
    console.log(`[RADAR] Kein Hindernis in Richtung (${dir.x.toFixed(2)}, ${dir.y.toFixed(2)})`);
  }
}

```

## File: `index.mjs`  
- Path: `index.mjs`  
- Size: 2810 Bytes  
- Modified: 2026-11-12 01:46:30 UTC  
- Condensed: comments and repeated blank lines reduced

```javascript


export { Vec2 } from './src/math/Vec2.mjs';
export { Mat22 } from './src/math/Mat22.mjs';
export { Transform } from './src/math/Transform.mjs';
export { AABB } from './src/math/AABB.mjs';
export { clamp, lerp, sign, normalizeAngle, isApproxZero, EPSILON, DEG2RAD, RAD2DEG } from './src/math/MathUtils.mjs';

export { World } from './src/world/World.mjs';
export { StepConfig } from './src/world/StepConfig.mjs';
export { ContactListener } from './src/world/ContactListener.mjs';

export { Body } from './src/dynamics/Body.mjs';
export { Material } from './src/dynamics/Material.mjs';
export { ContactSolver } from './src/dynamics/ContactSolver.mjs';
export { Island } from './src/dynamics/Island.mjs';

export { Shape } from './src/collision/shapes/Shape.mjs';
export { Box } from './src/collision/shapes/Box.mjs';
export { Circle } from './src/collision/shapes/Circle.mjs';
export { Polygon } from './src/collision/shapes/Polygon.mjs';
export { Capsule } from './src/collision/shapes/Capsule.mjs';
export { Segment } from './src/collision/shapes/Segment.mjs';

export { Joint } from './src/dynamics/joints/Joint.mjs';
export { DistanceJoint } from './src/dynamics/joints/DistanceJoint.mjs';
export { RevoluteJoint } from './src/dynamics/joints/RevoluteJoint.mjs';
export { PrismaticJoint } from './src/dynamics/joints/PrismaticJoint.mjs';
export { WeldJoint } from './src/dynamics/joints/WeldJoint.mjs';
export { PulleyJoint } from './src/dynamics/joints/PulleyJoint.mjs';

export { DynamicAABBTree } from './src/collision/broadphase/DynamicAABBTree.mjs';
export { CollisionNarrowphase } from './src/collision/narrowphase/CollisionNarrowphase.mjs';
export { ContactManifold, ContactPoint } from './src/collision/narrowphase/ContactManifold.mjs';
export { SAT } from './src/collision/narrowphase/SAT.mjs';
export { Ray, RaycastHit } from './src/collision/Raycast.mjs';
export { TriggerSystem } from './src/collision/TriggerSystem.mjs';

export { RelationalGraph } from './src/subqg/RelationalGraph.mjs';
export { MetricLatticeSolver } from './src/subqg/MetricLatticeSolver.mjs';
export { SubQGGravitationField } from './src/subqg/SubQGGravitationField.mjs';
export { SubQGContactBridge } from './src/subqg/SubQGContactBridge.mjs';
export { SubQGPureDynamics } from './src/subqg/SubQGPureDynamics.mjs';
export { SubQGInspector } from './src/debug/SubQGInspector.mjs';

export { CanvasRenderer } from './src/debug/CanvasRenderer.mjs';

```

## File: `integrations/blender/subqg_blender_bridge.py`  
- Path: `integrations/blender/subqg_blender_bridge.py`  
- Size: 8586 Bytes  
- Modified: 2026-11-12 15:47:06 UTC  
- Condensed: comments and repeated blank lines reduced

```python


import bpy
import socket
import json
import math
from mathutils import Vector, Euler

bl_info = {
    "name": "SubQG Physics Engine Bridge",
    "author": "SubQG Research & Engineering Team",
    "version": (1, 0, 0),
    "blender": (3, 6, 0),
    "location": "View3D > Sidebar > SubQG Physics",
    "description": "Live Physics & Keyframe Baking via SubQG Relational Metric Lattice",
    "category": "Physics",
}

class SubQGClient:

    def __init__(self, host='127.0.0.1', port=3001):
        self.host = host
        self.port = port
        self.sock = None
        self.req_id = 1

    def connect(self):
        try:
            self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.sock.settimeout(3.0)
            self.sock.connect((self.host, self.port))
            return True
        except Exception as e:
            print(f"[SubQG Blender] Verbindung fehlgeschlagen: {e}")
            self.sock = None
            return False

    def disconnect(self):
        if self.sock:
            try:
                self.sock.close()
            except:
                pass
            self.sock = None

    def send_command(self, method, params=None):
        if not self.sock:
            if not self.connect():
                return None

        req = {
            "id": self.req_id,
            "method": method,
            "params": params or {}
        }
        self.req_id += 1

        try:
            msg = json.dumps(req) + "\n"
            self.sock.sendall(msg.encode('utf-8'))

            buffer = ""
            while "\n" not in buffer:
                chunk = self.sock.recv(4096).decode('utf-8')
                if not chunk:
                    break
                buffer += chunk

            line = buffer.split("\n")[0]
            return json.loads(line)
        except Exception as e:
            print(f"[SubQG Blender] RPC-Fehler ({method}): {e}")
            self.disconnect()
            return None

subqg_client = SubQGClient()

class SUBQG_OT_Connect(bpy.types.Operator):

    bl_idname = "subqg.connect"
    bl_label = "Mit SubQG Server verbinden"

    def execute(self, context):
        if subqg_client.connect():
            self.report({'INFO'}, "Erfolgreich mit SubQG Physics Server verbunden (Port 3001)!")
        else:
            self.report({'ERROR'}, "Verbindung fehlgeschlagen. Läuft der Server (node tools/start_physics_server.mjs)?")
        return {'FINISHED'}

class SUBQG_OT_BakeKeyframes(bpy.types.Operator):

    bl_idname = "subqg.bake_keyframes"
    bl_label = "In Keyframes backen"

    def execute(self, context):
        if not subqg_client.sock and not subqg_client.connect():
            self.report({'ERROR'}, "Keine Verbindung zum SubQG Server!")
            return {'CANCELLED'}

        props = context.scene.subqg_props
        start_frame = context.scene.frame_start
        end_frame = context.scene.frame_end
        steps = end_frame - start_frame + 1

        self.report({'INFO'}, f"Initialisiere SubQG Welt für {steps} Frames...")

        subqg_client.send_command("create_world", {
            "engineMode": props.engine_mode,
            "gravity": [0.0, -props.gravity_y],
            "enableSubQGLattice": True
        })

        selected_objs = [obj for obj in context.selected_objects if obj.type == 'MESH']
        if not selected_objs:
            self.report({'WARNING'}, "Keine Mesh-Objekte ausgewählt!")
            return {'CANCELLED'}

        for obj in selected_objs:
            dims = obj.dimensions
            loc = obj.location
            body_type = "static" if obj.name.lower().startswith("floor") or obj.name.lower().startswith("ground") else "dynamic"

            subqg_client.send_command("create_box", {
                "id": obj.name,
                "x": loc.x,
                "y": loc.z,
                "width": max(0.1, dims.x),
                "height": max(0.1, dims.z),
                "type": body_type,
                "density": 2.0,
                "friction": 0.5,
                "isDestructible": True,
                "fractureForce": 300.0
            })

        self.report({'INFO'}, f"Berechne SubQG Relationale Metrik für {steps} Schritte...")
        bake_res = subqg_client.send_command("bake", {
            "steps": steps,
            "dt": 1.0 / context.scene.render.fps
        })

        if not bake_res or "result" not in bake_res:
            self.report({'ERROR'}, "Fehler beim Empfang der Simulationsdaten!")
            return {'CANCELLED'}

        frames = bake_res["result"]["frames"]

        for f_data in frames:
            f_num = start_frame + f_data["frame"]
            context.scene.frame_set(f_num)

            for b in f_data["snapshot"]["bodies"]:
                if b["id"] in bpy.data.objects:
                    target_obj = bpy.data.objects[b["id"]]

                    target_obj.location.x = b["x"]
                    target_obj.location.z = b["y"]

                    target_obj.rotation_euler.y = -b["angle"]

                    target_obj.keyframe_insert(data_path="location", frame=f_num)
                    target_obj.keyframe_insert(data_path="rotation_euler", frame=f_num)

        self.report({'INFO'}, f"Erfolgreich {steps} Frames SubQG-Physik gebacken!")
        return {'FINISHED'}

class SUBQG_PT_Panel(bpy.types.Panel):

    bl_label = "SubQG Physics Engine"
    bl_idname = "SUBQG_PT_Panel"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = 'SubQG Physics'

    def draw(self, context):
        layout = self.layout
        props = context.scene.subqg_props

        box = layout.box()
        box.label(text="Server-Status", icon='NETWORK_DRIVE')
        box.operator("subqg.connect", icon='LINKED')

        box_sim = layout.box()
        box_sim.label(text="Simulationsparameter", icon='PHYSICS')
        box_sim.prop(props, "engine_mode")
        box_sim.prop(props, "gravity_y")

        box_bake = layout.box()
        box_bake.label(text="Keyframe Baking", icon='ANIM')
        box_bake.operator("subqg.bake_keyframes", icon='RENDER_ANIMATION')

class SubQGSceneProperties(bpy.types.PropertyGroup):
    engine_mode: bpy.props.EnumProperty(
        name="Physik-Modus",
        items=[
            ('pure-subqg', "SubQG Pure (First-Principles)", "Reine Kantenbarriere ohne Impulssolver"),
            ('hybrid', "SubQG Hybrid (Echtzeit)", "Optimierter Solver mit SubQG Metrikgitter")
        ],
        default='pure-subqg'
    )
    gravity_y: bpy.props.FloatProperty(
        name="Gravitation (m/s2)",
        default=9.81,
        min=0.0,
        max=50.0
    )

classes = (
    SubQGSceneProperties,
    SUBQG_OT_Connect,
    SUBQG_OT_BakeKeyframes,
    SUBQG_PT_Panel
)

def register():
    for cls in classes:
        bpy.utils.register_class(cls)
    bpy.types.Scene.subqg_props = bpy.props.PointerProperty(type=SubQGSceneProperties)

def unregister():
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)
    del bpy.types.Scene.subqg_props
    subqg_client.disconnect()

if __name__ == "__main__":
    register()

```

## File: `integrations/custom_engine/subqg_client.py`  
- Path: `integrations/custom_engine/subqg_client.py`  
- Size: 3848 Bytes  
- Modified: 2026-11-12 15:48:14 UTC  
- Condensed: comments and repeated blank lines reduced

```python


import socket
import json
import time

class SubQGClient:
    def __init__(self, host="127.0.0.1", port=3001):
        self.host = host
        self.port = port
        self.sock = None
        self.req_id = 1
        self._buffer = ""

    def connect(self):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.connect((self.host, self.port))
        return True

    def disconnect(self):
        if self.sock:
            self.sock.close()
            self.sock = None

    def send(self, method, params=None):
        if not self.sock:
            self.connect()

        payload = {
            "id": self.req_id,
            "method": method,
            "params": params or {}
        }
        self.req_id += 1

        msg = json.dumps(payload) + "\n"
        self.sock.sendall(msg.encode("utf-8"))

        while "\n" not in self._buffer:
            chunk = self.sock.recv(4096).decode("utf-8")
            if not chunk:
                break
            self._buffer += chunk

        line, self._buffer = self._buffer.split("\n", 1)
        return json.loads(line)

    def create_world(self, engine_mode="pure-subqg", gravity=(0.0, -9.81)):
        return self.send("create_world", {
            "engineMode": engine_mode,
            "gravity": list(gravity)
        })

    def create_box(self, body_id, x, y, width, height, is_dynamic=True, is_destructible=False, fracture_force=350.0):
        return self.send("create_box", {
            "id": body_id,
            "x": x,
            "y": y,
            "width": width,
            "height": height,
            "type": "dynamic" if is_dynamic else "static",
            "isDestructible": is_destructible,
            "fractureForce": fracture_force
        })

    def create_circle(self, body_id, x, y, radius, is_dynamic=True, is_destructible=False):
        return self.send("create_circle", {
            "id": body_id,
            "x": x,
            "y": y,
            "radius": radius,
            "type": "dynamic" if is_dynamic else "static",
            "isDestructible": is_destructible
        })

    def apply_force(self, body_id, fx, fy):
        return self.send("apply_force", {"id": body_id, "fx": fx, "fy": fy})

    def apply_impulse(self, body_id, ix, iy):
        return self.send("apply_impulse", {"id": body_id, "ix": ix, "iy": iy})

    def step(self, dt=1.0/60.0):
        res = self.send("step", {"dt": dt})
        return res.get("result", {})

    def get_state(self):
        res = self.send("get_state")
        return res.get("result", {})

if __name__ == "__main__":
    print("[SubQG Client Demo] Verbinde mit SubQG Physics Server...")
    client = SubQGClient()
    try:
        client.connect()
        print("Erfolgreich verbunden!")

        client.create_world("pure-subqg", (0, -9.81))
        client.create_box("ground", 0, 0, 40, 1.0, is_dynamic=False)
        client.create_box("falling_box", 0, 10, 1.0, 1.0, is_dynamic=True, is_destructible=True)

        print("Simuliere 60 Ticks (1 Sekunde)...")
        for i in range(60):
            state = client.step(1.0 / 60.0)
            if i % 15 == 0:
                box = next((b for b in state.get("bodies", []) if b["id"] == "falling_box"), None)
                if box:
                    print(f"Tick {i:02d}: Box Y={box['y']:.2f} m | Vy={box['vy']:.2f} m/s")

        print("Simulation erfolgreich abgeschlossen!")
    except Exception as e:
        print(f"Fehler: {e} (Läuft 'node tools/start_physics_server.mjs'?)")
    finally:
        client.disconnect()

```

## File: `integrations/custom_engine/SubQGClient.hpp`  
- Path: `integrations/custom_engine/SubQGClient.hpp`  
- Size: 8519 Bytes  
- Modified: 2026-11-12 15:48:04 UTC  
- Condensed: comments and repeated blank lines reduced

```
#pragma once

#include <string>
#include <vector>
#include <sstream>
#include <iostream>
#include <cstring>

#if defined(_WIN32) || defined(_WIN64)
    #define SUBQG_PLATFORM_WINDOWS
    #include <winsock2.h>
    #include <ws2tcpip.h>
    #pragma comment(lib, "ws2_32.lib")
#else
    #define SUBQG_PLATFORM_POSIX
    #include <sys/types.h>
    #include <sys/socket.h>
    #include <netinet/in.h>
    #include <arpa/inet.h>
    #include <unistd.h>
#endif

namespace SubQG {

struct BodyState {
    std::string id;
    std::string type;
    float x = 0.0f;
    float y = 0.0f;
    float angle = 0.0f;
    float angleDeg = 0.0f;
    float vx = 0.0f;
    float vy = 0.0f;
    float w = 0.0f;
    bool isSleeping = false;
};

struct WorldSnapshot {
    int bodyCount = 0;
    int jointCount = 0;
    int brokenJoints = 0;
    std::vector<BodyState> bodies;
};

class Client {
public:
    Client() {
#ifdef SUBQG_PLATFORM_WINDOWS
        WSADATA wsaData;
        WSAStartup(MAKEWORD(2, 2), &wsaData);
#endif
    }

    ~Client() {
        disconnect();
#ifdef SUBQG_PLATFORM_WINDOWS
        WSACleanup();
#endif
    }

    bool connect(const std::string& host = "127.0.0.1", int port = 3001) {
        disconnect();

#ifdef SUBQG_PLATFORM_WINDOWS
        m_socket = ::socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
        if (m_socket == INVALID_SOCKET) return false;
#else
        m_socket = ::socket(AF_INET, SOCK_STREAM, 0);
        if (m_socket < 0) return false;
#endif

        sockaddr_in serverAddr{};
        serverAddr.sin_family = AF_INET;
        serverAddr.sin_port = htons(port);
        inet_pton(AF_INET, host.c_str(), &serverAddr.sin_addr);

        if (::connect(m_socket, (struct sockaddr*)&serverAddr, sizeof(serverAddr)) < 0) {
            disconnect();
            return false;
        }

        m_connected = true;
        return true;
    }

    void disconnect() {
        if (m_connected) {
#ifdef SUBQG_PLATFORM_WINDOWS
            closesocket(m_socket);
            m_socket = INVALID_SOCKET;
#else
            ::close(m_socket);
            m_socket = -1;
#endif
            m_connected = false;
        }
    }

    bool isConnected() const { return m_connected; }

    bool createWorld(const std::string& engineMode = "pure-subqg", float gx = 0.0f, float gy = -9.81f) {
        std::ostringstream ss;
        ss << "{\"method\":\"create_world\",\"params\":{\"engineMode\":\"" << engineMode
           << "\",\"gravity\":[" << gx << "," << gy << "]}}";
        std::string res;
        return sendCommand(ss.str(), res);
    }

    bool createBox(const std::string& id, float x, float y, float width, float height,
                   bool isDynamic = true, bool isDestructible = false, float fractureForce = 350.0f) {
        std::ostringstream ss;
        ss << "{\"method\":\"create_box\",\"params\":{\"id\":\"" << id
           << "\",\"x\":" << x << ",\"y\":" << y
           << ",\"width\":" << width << ",\"height\":" << height
           << ",\"type\":\"" << (isDynamic ? "dynamic" : "static")
           << "\",\"isDestructible\":" << (isDestructible ? "true" : "false")
           << ",\"fractureForce\":" << fractureForce << "}}";
        std::string res;
        return sendCommand(ss.str(), res);
    }

    bool createCircle(const std::string& id, float x, float y, float radius,
                      bool isDynamic = true, bool isDestructible = false) {
        std::ostringstream ss;
        ss << "{\"method\":\"create_circle\",\"params\":{\"id\":\"" << id
           << "\",\"x\":" << x << ",\"y\":" << y
           << ",\"radius\":" << radius
           << ",\"type\":\"" << (isDynamic ? "dynamic" : "static")
           << "\",\"isDestructible\":" << (isDestructible ? "true" : "false") << "}}";
        std::string res;
        return sendCommand(ss.str(), res);
    }

    bool applyForce(const std::string& id, float fx, float fy) {
        std::ostringstream ss;
        ss << "{\"method\":\"apply_force\",\"params\":{\"id\":\"" << id
           << "\",\"fx\":" << fx << ",\"fy\":" << fy << "}}";
        std::string res;
        return sendCommand(ss.str(), res);
    }

    bool applyImpulse(const std::string& id, float ix, float iy) {
        std::ostringstream ss;
        ss << "{\"method\":\"apply_impulse\",\"params\":{\"id\":\"" << id
           << "\",\"ix\":" << ix << ",\"iy\":" << iy << "}}";
        std::string res;
        return sendCommand(ss.str(), res);
    }

    WorldSnapshot step(float dt = 1.0f / 60.0f) {
        std::ostringstream ss;
        ss << "{\"method\":\"step\",\"params\":{\"dt\":" << dt << "}}";
        std::string res;
        sendCommand(ss.str(), res);
        return parseSnapshot(res);
    }

    WorldSnapshot getState() {
        std::string res;
        sendCommand("{\"method\":\"get_state\"}", res);
        return parseSnapshot(res);
    }

private:
#ifdef SUBQG_PLATFORM_WINDOWS
    SOCKET m_socket = INVALID_SOCKET;
#else
    int m_socket = -1;
#endif
    bool m_connected = false;
    std::string m_readBuffer;

    bool sendCommand(const std::string& json, std::string& outResponse) {
        if (!m_connected) return false;

        std::string payload = json + "\n";
        int sent = ::send(m_socket, payload.c_str(), static_cast<int>(payload.length()), 0);
        if (sent <= 0) return false;

        char buf[4096];
        while (m_readBuffer.find('\n') == std::string::npos) {
            int received = ::recv(m_socket, buf, sizeof(buf) - 1, 0);
            if (received <= 0) return false;
            buf[received] = '\0';
            m_readBuffer += buf;
        }

        size_t newlinePos = m_readBuffer.find('\n');
        outResponse = m_readBuffer.substr(0, newlinePos);
        m_readBuffer.erase(0, newlinePos + 1);
        return true;
    }

    WorldSnapshot parseSnapshot(const std::string& json) {
        WorldSnapshot snap;

        size_t bodiesPos = json.find("\"bodies\":[");
        if (bodiesPos == std::string::npos) return snap;

        size_t cur = bodiesPos + 10;
        while (cur < json.length()) {
            size_t objStart = json.find('{', cur);
            size_t objEnd = json.find('}', objStart);
            if (objStart == std::string::npos || objEnd == std::string::npos) break;

            std::string bodyJson = json.substr(objStart, objEnd - objStart + 1);
            BodyState b;
            b.id = extractStringField(bodyJson, "id");
            b.type = extractStringField(bodyJson, "type");
            b.x = extractFloatField(bodyJson, "x");
            b.y = extractFloatField(bodyJson, "y");
            b.angle = extractFloatField(bodyJson, "angle");
            b.angleDeg = extractFloatField(bodyJson, "angleDeg");
            b.vx = extractFloatField(bodyJson, "vx");
            b.vy = extractFloatField(bodyJson, "vy");
            b.w = extractFloatField(bodyJson, "w");

            snap.bodies.push_back(b);
            cur = objEnd + 1;
            if (json[cur] == ']') break;
        }

        snap.bodyCount = static_cast<int>(snap.bodies.size());
        return snap;
    }

    std::string extractStringField(const std::string& obj, const std::string& key) {
        std::string pattern = "\"" + key + "\":\"";
        size_t p = obj.find(pattern);
        if (p == std::string::npos) return "";
        size_t start = p + pattern.length();
        size_t end = obj.find('"', start);
        return obj.substr(start, end - start);
    }

    float extractFloatField(const std::string& obj, const std::string& key) {
        std::string pattern = "\"" + key + "\":";
        size_t p = obj.find(pattern);
        if (p == std::string::npos) return 0.0f;
        size_t start = p + pattern.length();
        size_t end = obj.find_first_of(",}", start);
        try {
            return std::stof(obj.substr(start, end - start));
        } catch (...) {
            return 0.0f;
        }
    }
};

}

```

## File: `integrations/unreal/SubQGUnrealBridge.cpp`  
- Path: `integrations/unreal/SubQGUnrealBridge.cpp`  
- Size: 7542 Bytes  
- Modified: 2026-11-12 15:47:42 UTC  
- Condensed: comments and repeated blank lines reduced

```cpp
#include "SubQGUnrealBridge.h"
#include "Common/TcpSocketBuilder.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"
#include "Dom/JsonObject.h"

void USubQGPhysicsSubsystem::Initialize(FSubsystemCollectionBase& Collection)
{
	Super::Initialize(Collection);
	ClientSocket = nullptr;
	NextRequestId = 1;
}

void USubQGPhysicsSubsystem::Deinitialize()
{
	Disconnect();
	Super::Deinitialize();
}

bool USubQGPhysicsSubsystem::ConnectToSubQGServer(FString Host, int32 Port)
{
	Disconnect();

	FIPv4Address IPAddress;
	if (!FIPv4Address::Parse(Host, IPAddress))
	{
		UE_LOG(LogTemp, Error, TEXT("[SubQG UE5] Ungültige IP: %s"), *Host);
		return false;
	}

	TSharedRef<FInternetAddr> Addr = ISocketSubsystem::Get(PLATFORM_SOCKETSUBSYSTEM)->CreateInternetAddr();
	Addr->SetIp(IPAddress.Value);
	Addr->SetPort(Port);

	ClientSocket = FTcpSocketBuilder(TEXT("SubQG_UE_Client"))
		.AsReusable()
		.AsBlocking()
		.Build();

	if (!ClientSocket || !ClientSocket->Connect(*Addr))
	{
		UE_LOG(LogTemp, Error, TEXT("[SubQG UE5] Verbindung zu %s:%d fehlgeschlagen!"), *Host, Port);
		Disconnect();
		return false;
	}

	ClientSocket->SetNonBlocking(true);
	UE_LOG(LogTemp, Log, TEXT("[SubQG UE5] Erfolgreich mit SubQG Physics Server verbunden (%s:%d)!"), *Host, Port);

	FString InitResponse;
	SendJsonCommand(TEXT("{\"method\":\"create_world\",\"params\":{\"engineMode\":\"pure-subqg\",\"gravity\":[0,-9.81]}}"), InitResponse);

	return true;
}

void USubQGPhysicsSubsystem::Disconnect()
{
	if (ClientSocket)
	{
		ClientSocket->Close();
		ISocketSubsystem::Get(PLATFORM_SOCKETSUBSYSTEM)->DestroySocket(ClientSocket);
		ClientSocket = nullptr;
	}
	ActorBindings.Empty();
	ReceiveBuffer.Empty();
}

void USubQGPhysicsSubsystem::RegisterActorBinding(const FString& BodyId, AActor* TargetActor)
{
	if (TargetActor)
	{
		ActorBindings.Add(BodyId, TargetActor);
	}
}

void USubQGPhysicsSubsystem::SpawnSubQGBox(const FString& BodyId, FVector WorldLocation, FVector SizeCm, bool bIsDynamic, bool bIsDestructible, float FractureForce)
{
	const float X_m = WorldLocation.X / 100.0f;
	const float Y_m = WorldLocation.Z / 100.0f;
	const float Width_m = SizeCm.X / 100.0f;
	const float Height_m = SizeCm.Z / 100.0f;

	FString Cmd = FString::Printf(
		TEXT("{\"method\":\"create_box\",\"params\":{\"id\":\"%s\",\"x\":%f,\"y\":%f,\"width\":%f,\"height\":%f,\"type\":\"%s\",\"isDestructible\":%s,\"fractureForce\":%f}}"),
		*BodyId, X_m, Y_m, Width_m, Height_m,
		bIsDynamic ? TEXT("dynamic") : TEXT("static"),
		bIsDestructible ? TEXT("true") : TEXT("false"),
		FractureForce
	);

	FString Dummy;
	SendJsonCommand(Cmd, Dummy);
}

void USubQGPhysicsSubsystem::SpawnSubQGSphere(const FString& BodyId, FVector WorldLocation, float RadiusCm, bool bIsDynamic, bool bIsDestructible)
{
	const float X_m = WorldLocation.X / 100.0f;
	const float Y_m = WorldLocation.Z / 100.0f;
	const float Radius_m = RadiusCm / 100.0f;

	FString Cmd = FString::Printf(
		TEXT("{\"method\":\"create_circle\",\"params\":{\"id\":\"%s\",\"x\":%f,\"y\":%f,\"radius\":%f,\"type\":\"%s\",\"isDestructible\":%s}}"),
		*BodyId, X_m, Y_m, Radius_m,
		bIsDynamic ? TEXT("dynamic") : TEXT("static"),
		bIsDestructible ? TEXT("true") : TEXT("false")
	);

	FString Dummy;
	SendJsonCommand(Cmd, Dummy);
}

void USubQGPhysicsSubsystem::ApplySubQGForce(const FString& BodyId, FVector ForceNewtons)
{
	FString Cmd = FString::Printf(
		TEXT("{\"method\":\"apply_force\",\"params\":{\"id\":\"%s\",\"fx\":%f,\"fy\":%f}}"),
		*BodyId, ForceNewtons.X, ForceNewtons.Z
	);
	FString Dummy;
	SendJsonCommand(Cmd, Dummy);
}

void USubQGPhysicsSubsystem::ApplySubQGImpulse(const FString& BodyId, FVector ImpulseNs)
{
	FString Cmd = FString::Printf(
		TEXT("{\"method\":\"apply_impulse\",\"params\":{\"id\":\"%s\",\"ix\":%f,\"iy\":%f}}"),
		*BodyId, ImpulseNs.X, ImpulseNs.Z
	);
	FString Dummy;
	SendJsonCommand(Cmd, Dummy);
}

void USubQGPhysicsSubsystem::Tick(float DeltaTime)
{
	if (!ClientSocket) return;

	const float FixedDt = FMath::Clamp(DeltaTime, 0.001f, 0.05f);
	FString StepCmd = FString::Printf(TEXT("{\"method\":\"step\",\"params\":{\"dt\":%f}}"), FixedDt);

	FString Response;
	if (SendJsonCommand(StepCmd, Response))
	{
		DispatchSubQGState(Response);
	}
}

bool USubQGPhysicsSubsystem::SendJsonCommand(const FString& JsonCommand, FString& OutResponse)
{
	if (!ClientSocket) return false;

	FString Payload = JsonCommand + TEXT("\n");
	FTCHARToUTF8 Utf8Payload(*Payload);

	int32 BytesSent = 0;
	if (!ClientSocket->Send((const uint8*)Utf8Payload.Get(), Utf8Payload.Length(), BytesSent))
	{
		return false;
	}

	TArray<uint8> ReadBuffer;
	ReadBuffer.SetNumUninitialized(8192);

	int32 BytesRead = 0;
	if (ClientSocket->Recv(ReadBuffer.GetData(), ReadBuffer.Num(), BytesRead))
	{
		if (BytesRead > 0)
		{
			FString Chunk = FUTF8ToTCHAR((const ANSICHAR*)ReadBuffer.GetData(), BytesRead);
			ReceiveBuffer += Chunk;

			int32 NewlineIndex;
			if (ReceiveBuffer.FindChar(TEXT('\n'), NewlineIndex))
			{
				OutResponse = ReceiveBuffer.Left(NewlineIndex);
				ReceiveBuffer = ReceiveBuffer.Mid(NewlineIndex + 1);
				return true;
			}
		}
	}

	return false;
}

void USubQGPhysicsSubsystem::DispatchSubQGState(const FString& JsonResponse)
{
	TSharedPtr<FJsonObject> RootObject;
	TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(JsonResponse);

	if (!FJsonSerializer::Deserialize(Reader, RootObject) || !RootObject.IsValid())
	{
		return;
	}

	const TSharedPtr<FJsonObject>* ResultObject;
	if (!RootObject->TryGetObjectField(TEXT("result"), ResultObject))
	{
		return;
	}

	const TArray<TSharedPtr<FJsonValue>>* BodiesArray;
	if ((*ResultObject)->TryGetArrayField(TEXT("bodies"), BodiesArray))
	{
		for (const auto& BodyVal : *BodiesArray)
		{
			TSharedPtr<FJsonObject> B = BodyVal->AsObject();
			if (!B.IsValid()) continue;

			FString Id = B->GetStringField(TEXT("id"));
			float X = (float)B->GetNumberField(TEXT("x"));
			float Y = (float)B->GetNumberField(TEXT("y"));
			float Angle = (float)B->GetNumberField(TEXT("angle"));

			if (TWeakObjectPtr<AActor>* TargetPtr = ActorBindings.Find(Id))
			{
				if (AActor* Target = TargetPtr->Get())
				{
					FVector NewLoc = SubQGToUnrealLocation(X, Y, Target->GetActorLocation().Y);
					FRotator NewRot = SubQGToUnrealRotation(Angle);
					Target->SetActorLocationAndRotation(NewLoc, NewRot);
				}
			}
		}
	}

	const TArray<TSharedPtr<FJsonValue>>* EventsArray;
	if ((*ResultObject)->TryGetArrayField(TEXT("events"), EventsArray))
	{
		for (const auto& EventVal : *EventsArray)
		{
			TSharedPtr<FJsonObject> Evt = EventVal->AsObject();
			if (!Evt.IsValid()) continue;

			FString EvtType = Evt->GetStringField(TEXT("type"));
			if (EvtType == TEXT("body_shatter"))
			{
				FString ShatterBodyId = Evt->GetStringField(TEXT("bodyId"));
				float Force = (float)Evt->GetNumberField(TEXT("impactForce"));
				const TArray<TSharedPtr<FJsonValue>>* PtArr;
				FVector ImpactLoc = FVector::ZeroVector;
				if (Evt->TryGetArrayField(TEXT("point"), PtArr) && PtArr->Num() >= 2)
				{
					ImpactLoc = SubQGToUnrealLocation((*PtArr)[0]->AsNumber(), (*PtArr)[1]->AsNumber());
				}
				OnSubQGFracture.Broadcast(ShatterBodyId, ImpactLoc, Force);
			}
			else if (EvtType == TEXT("joint_break"))
			{
				int32 JointId = Evt->GetIntegerField(TEXT("jointId"));
				OnSubQGJointBreak.Broadcast(JointId);
			}
		}
	}
}

```

## File: `integrations/unreal/SubQGUnrealBridge.h`  
- Path: `integrations/unreal/SubQGUnrealBridge.h`  
- Size: 4337 Bytes  
- Modified: 2026-11-12 15:47:22 UTC  
- Condensed: comments and repeated blank lines reduced

```
#pragma once

#include "CoreMinimal.h"
#include "Subsystems/WorldSubsystem.h"
#include "Sockets.h"
#include "SocketSubsystem.h"
#include "SubQGUnrealBridge.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_ThreeParams(FOnSubQGFractureSignature, const FString&, BodyId, const FVector&, Location, float, ReactionForce);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnSubQGJointBreakSignature, int32, JointId);

USTRUCT(BlueprintType)
struct FSubQGBodyState
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly, Category = "SubQG")
	FString Id;

	UPROPERTY(BlueprintReadOnly, Category = "SubQG")
	FVector WorldPosition = FVector::ZeroVector;

	UPROPERTY(BlueprintReadOnly, Category = "SubQG")
	FRotator WorldRotation = FRotator::ZeroRotator;

	UPROPERTY(BlueprintReadOnly, Category = "SubQG")
	FVector LinearVelocity = FVector::ZeroVector;

	UPROPERTY(BlueprintReadOnly, Category = "SubQG")
	bool bIsSleeping = false;
};

UCLASS()
class SUBQGUNREALBRIDGE_API USubQGPhysicsSubsystem : public UTickableWorldSubsystem
{
	GENERATED_BODY()

public:
	virtual void Initialize(FSubsystemCollectionBase& Collection) override;
	virtual void Deinitialize() override;
	virtual void Tick(float DeltaTime) override;
	virtual TStatId GetStatId() const override { RETURN_QUICK_DECLARE_CYCLE_STAT(USubQGPhysicsSubsystem, STATGROUP_Tickables); }

	UFUNCTION(BlueprintCallable, Category = "SubQG Physics")
	bool ConnectToSubQGServer(FString Host = TEXT("127.0.0.1"), int32 Port = 3001);

	UFUNCTION(BlueprintCallable, Category = "SubQG Physics")
	void Disconnect();

	UFUNCTION(BlueprintCallable, Category = "SubQG Physics")
	void RegisterActorBinding(const FString& BodyId, AActor* TargetActor);

	UFUNCTION(BlueprintCallable, Category = "SubQG Physics")
	void SpawnSubQGBox(const FString& BodyId, FVector WorldLocation, FVector SizeCm, bool bIsDynamic = true, bool bIsDestructible = false, float FractureForce = 350.0f);

	UFUNCTION(BlueprintCallable, Category = "SubQG Physics")
	void SpawnSubQGSphere(const FString& BodyId, FVector WorldLocation, float RadiusCm, bool bIsDynamic = true, bool bIsDestructible = false);

	UFUNCTION(BlueprintCallable, Category = "SubQG Physics")
	void ApplySubQGForce(const FString& BodyId, FVector ForceNewtons);

	UFUNCTION(BlueprintCallable, Category = "SubQG Physics")
	void ApplySubQGImpulse(const FString& BodyId, FVector ImpulseNs);

	UPROPERTY(BlueprintAssignable, Category = "SubQG Physics|Events")
	FOnSubQGFractureSignature OnSubQGFracture;

	UPROPERTY(BlueprintAssignable, Category = "SubQG Physics|Events")
	FOnSubQGJointBreakSignature OnSubQGJointBreak;

private:
	FSocket* ClientSocket = nullptr;
	int32 NextRequestId = 1;
	TMap<FString, TWeakObjectPtr<AActor>> ActorBindings;
	FString ReceiveBuffer;

	bool SendJsonCommand(const FString& JsonCommand, FString& OutResponse);
	void ProcessIncomingData(const FString& Data);
	void DispatchSubQGState(const FString& JsonResponse);

	static FVector SubQGToUnrealLocation(float X_m, float Y_m, float Z_PlaneCm = 0.0f)
	{
		return FVector(X_m * 100.0f, Z_PlaneCm, Y_m * 100.0f);
	}

	static FRotator SubQGToUnrealRotation(float AngleRad)
	{

		return FRotator(FMath::RadiansToDegrees(-AngleRad), 0.0f, 0.0f);
	}
};

```

## File: `tools/build_standalone_demo.mjs`  
- Path: `tools/build_standalone_demo.mjs`  
- Size: 2706 Bytes  
- Modified: 2026-11-12 01:46:46 UTC  
- Warning: 1 secret-like value(s) redacted  
- Condensed: comments and repeated blank lines reduced

> Condensed: comments and repeated blank lines reduced

## File: `tools/serve.mjs`  
- Path: `tools/serve.mjs`  
- Size: 1565 Bytes  
- Modified: 2026-11-12 15:07:42 UTC  
- Warning: 1 secret-like value(s) redacted

> Warning: 1 secret-like value(s) redacted

## File: `tools/start_physics_server.mjs`  
- Path: `tools/start_physics_server.mjs`  
- Size: 708 Bytes  
- Modified: 2026-11-12 15:46:22 UTC

```javascript
import { SubQGServer } from '../src/api/SubQGServer.mjs';

const tcpPort = parseInt(process.env.SUBQG_TCP_PORT || '3001', 10);
const httpPort = parseInt(process.env.SUBQG_HTTP_PORT || '3002', 10);

const server = new SubQGServer({ tcpPort, httpPort });

server.start().then(() => {
  console.log(`[SubQG API Server] Subquantum Graphity Live Physics Server ready.`);
  console.log(`- TCP Port:  ${tcpPort} (For Unreal Engine C++, Custom Game Engines, Blender)`);
  console.log(`- HTTP Port: ${httpPort} (For REST RPC, Batch Animation Baking)`);
}).catch((err) => {
  console.error('[SubQG API Server Failed]', err);
  process.exit(1);
});

process.on('SIGINT', () => {
  server.stop();
  process.exit(0);
});

```

