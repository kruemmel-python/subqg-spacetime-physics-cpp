import test from 'node:test';
import assert from 'node:assert/strict';
import { World, Vec2, SubQGInspector, Material } from '../index.mjs';
import { DemoScenes } from '../demo/demo_scenes.mjs';

test('SubQG: Masseunabhängiger freier Fall (Universal Free Fall)', () => {
  const world = new World({ gravity: new Vec2(0, -9.81) });

  // Apfel: leichte Masse (0.2 kg)
  const apple = world.createCircle(0, 10, 0.2, {
    material: new Material({ density: 1.0 })
  });

  // Felsblock: schwere Masse (200.0 kg)
  const boulder = world.createBox(5, 10, 2.0, 2.0, {
    material: new Material({ density: 50.0 })
  });

  assert.ok(boulder.mass > 100 * apple.mass);

  // Beide fallen 30 Schritte (0.5 s)
  for (let i = 0; i < 30; i++) {
    world.step(1.0 / 60.0);
  }

  // Galilei/Lean4 Satz 'constant_metric_gradient_gives_universal_acceleration':
  // Beide müssen exakt dieselbe vertikale Position und Geschwindigkeit haben!
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

  // Platziere schwere Masse in der Welt
  const planet = world.createCircle(0, 0, 2.0, {
    type: 'static',
    material: new Material({ density: 100.0 })
  });

  world.step(1.0 / 60.0);

  const inspector = new SubQGInspector(world);
  const diag = world.getSubQGDiagnostics();

  // Kantenanzahl und Knotenanzahl im relationalen Hintergrundgitter
  assert.ok(diag.edgeCount > 100, `Kantenanzahl: ${diag.edgeCount}`);
  assert.ok(diag.nodeCount > 50, `Knotenanzahl: ${diag.nodeCount}`);

  // Durch die schwere Masse muss eine messbare Kantenverzerrung existieren
  assert.ok(diag.maxStrain > 0.0, `Maximale Kantenverzerrung: ${diag.maxStrain}`);

  // Vollständiger Energie- und Wirkungs-Audit
  const audit = inspector.computeFullEnergyAudit();
  assert.ok(Number.isFinite(audit.subqgEdgeAction));
  assert.ok(audit.stepTimeMs >= 0);

  // Heatmap-Extraktion
  const heatmap = inspector.extractMetricHeatmap(16);
  assert.equal(heatmap.resolution, 16);
  assert.equal(heatmap.grid.length, 16);
  assert.equal(heatmap.grid[0].length, 16);

  // Im Zentrum (bei 0, 0) muss das Potential negativer (stärker) sein als am Rand
  const centerPhi = world.subqgGraph.samplePotential(new Vec2(0, 0));
  const farPhi = world.subqgGraph.samplePotential(new Vec2(25, 25));
  assert.ok(centerPhi < farPhi, `Zentrumspotential ${centerPhi} < Fernfeld ${farPhi}`);
});

test('SubQG: Pure-SubQG Modus berechnet Gravitation und Repulsion rein aus Wirkungsvariation', () => {
  const world = new World({
    engineMode: 'pure-subqg'
  });

  // Ein schweres Zentrum (z.B. Planet bei y=0)
  world.createCircle(0, 0, 2.0, {
    type: 'static',
    material: new Material({ density: 50.0 })
  });

  // Ein Testkörper oberhalb bei y=5
  const body = world.createCircle(0, 5, 0.5, {
    type: 'dynamic',
    material: new Material({ density: 1.0 })
  });

  const initialY = body.position.y;

  // Führe Schritte im reinen SubQG-Modus aus
  for (let i = 0; i < 30; i++) {
    world.step(1.0 / 60.0);
  }

  // Körper muss sich rein durch das relationale SubQG-Gradientenpotential nach unten bewegt haben
  assert.ok(body.position.y < initialY, `Reine SubQG-Bewegung: y=${body.position.y} < ${initialY}`);
  assert.ok(body.velocity.y < 0, `Negative Geschwindigkeit aus SubQG-Gradient: vy=${body.velocity.y}`);
  // Strikte Bedingung 1: Impulssolver darf im Pure-Modus NICHT aufgerufen werden!
  assert.equal(world.contactSolverCalls, 0, 'Klassischer Impulssolver wurde im Pure-Modus 0x aufgerufen');
});

test('SubQG Pure: Keine Phantom-Repulsion oberhalb flacher Box (Kritikpunkt 2 des Testers)', () => {
  const world = new World({
    engineMode: 'pure-subqg'
  });

  // Flache Box (40 x 1.0 m) bei y = 0 (Oberkante bei y = 0.5)
  world.createBox(0, 0, 40, 1.0, { type: 'static' });

  // Kreis mit Radius 0.5 bei y = 3.0 (Unterkante bei y = 2.5 -> 2 Meter freie Luft!)
  const circle = world.createCircle(0, 3.0, 0.5, { type: 'dynamic' });

  // 1 Zeitschritt à dt = 1/600 s (exakt der Fall des Testers)
  world.step(1.0 / 600.0);

  // Es darf KEINE Phantom-Repulsion existieren (Tester maß vy ≈ 801 durch Hüllradien)
  assert.ok(Math.abs(circle.velocity.y) < 2.0, `Keine Phantom-Beschleunigung: vy = ${circle.velocity.y}`);
  assert.equal(world.contactSolverCalls, 0);
});

test('SubQG Pure: Echte geometrische Kantenbarriere-Repulsion und Relationale Scherdämpfung', () => {
  const world = new World({
    engineMode: 'pure-subqg'
  });

  // Fester Boden bei y = 0, Dicke 1.0 (Oberkante y = 0.5)
  world.createBox(0, 0, 20, 1.0, { type: 'static' });

  // Dynamische Kiste dringt geometrisch um 0.05 m ein (y = 0.95 statt 1.0)
  const crate = world.createBox(0, 0.95, 1.0, 1.0, { type: 'dynamic' });
  crate.setVelocity(4.0, 0.0); // 4 m/s Vorwärts-Gleitgeschwindigkeit

  // Ein Zeitschritt im Pure-Modus
  world.step(1.0 / 60.0);

  // 1. Kantenbarriere muss nach oben abstoßen (F_y > 0 -> vy > 0)
  assert.ok(crate.velocity.y > 0.05, `Kantenbarriere stößt ab: vy = ${crate.velocity.y} > 0`);

  // 2. Relationale Scherdämpfung muss Gleitbewegung abbremsen (vx < 4.0)
  assert.ok(crate.velocity.x < 4.0, `Scherdämpfung bremst Gleiten: vx = ${crate.velocity.x} < 4.0`);

  // 3. Impulssolver blieb unberührt
  assert.equal(world.contactSolverCalls, 0, 'Impulssolver-Aufrufe strikt 0');
});

test('SubQG Pure: Topologische Gelenke schwingen stabil (0 Kontakt-Solver-Aufrufe)', () => {
  const world = new World({
    engineMode: 'pure-subqg'
  });

  const anchor = world.createBox(0, 5, 1.0, 1.0, { type: 'static' });
  const bob = world.createCircle(1.5, 5, 0.4, { type: 'dynamic' });
  const joint = world.createRevoluteJoint(anchor, bob, new Vec2(0, 5));

  // Pendel für 60 Schritte schwingen lassen
  for (let i = 0; i < 60; i++) {
    bob.applyForce(new Vec2(0, -9.81 * bob.mass)); // Schwerkraft
    world.step(1.0 / 60.0);
  }

  // 1. Gelenkanker hält Distanz stabil (Abstand zur Drehachse ~ 1.5 m)
  const dist = bob.position.distanceTo(new Vec2(0, 5));
  assert.ok(Math.abs(dist - 1.5) < 0.05, `Gelenkabstand stabil: dist = ${dist}`);

  // 2. Körper schwingt dynamisch
  assert.ok(bob.velocity.length() > 0.1, `Pendelbewegung aktiv: v = ${bob.velocity.length()}`);

  // 3. Strikte Tester-Bedingung: Null klassische Kontakt-Impulssolver-Aufrufe!
  assert.equal(world.contactSolverCalls, 0, 'contactSolverCalls strikt 0');
});

test('SubQG: Tragfaehige Bruecke faengt schweren Felsen stabil ab (ohne Durchdringung)', () => {
  const world = new World({
    engineMode: 'pure-subqg',
    gravity: new Vec2(0, -9.81)
  });

  // Boden bei y = 0
  world.createBox(0, 0, 40, 1.0, { type: 'static' });
  // Zwei Pfeiler bei x = -8 und x = 8
  const p1 = world.createBox(-8, 5, 1.5, 4, { type: 'static' });
  const p2 = world.createBox(8, 5, 1.5, 4, { type: 'static' });

  // 12 Planken
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

  // Schwerer Felsblock (8 kg) fällt aus y = 12 m auf die Brücke
  const boulder = world.createCircle(0, 12, 0.8, {
    type: 'dynamic',
    material: new Material({ density: 4.0, friction: 0.5, restitution: 0.1 })
  });

  // 160 Zeitschritte simulieren
  for (let i = 0; i < 160; i++) {
    world.step(1.0 / 60.0);
  }

  // 1. Alle 13 Gelenke sind intakt geblieben
  assert.equal(world.joints.length, 13, 'Alle 13 Gelenke der tragfähigen Brücke sind intakt');
  assert.equal(world.brokenJointsCount, 0, '0 Gelenkbrüche');

  // 2. Felsblock wurde von der Brücke abgefangen und liegt über dem Boden (Boden ist bei y=0.5..1.0, Felsen bleibt bei y >= 3.0)
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

  // 160 Zeitschritte simulieren
  let minBoulderY = Infinity;
  for (let i = 0; i < 160; i++) {
    world.step(1.0 / 60.0);
    if (boulder.position.y < minBoulderY) minBoulderY = boulder.position.y;
  }

  // 1. Gelenke sind durch die berechnete Reaktionskraft über 250 N gerissen
  assert.ok(world.joints.length < 13, `Gelenke wurden durch Materialbruch getrennt: verbleibend ${world.joints.length} < 13`);
  assert.ok(world.brokenJointsCount > 0, `Gelenkbruch gezählt: ${world.brokenJointsCount} > 0`);
  assert.ok(world.destructionSystem.fractureEvents.length > 0, `Echte Bruch-Events registriert: ${world.destructionSystem.fractureEvents.length}`);

  // 2. Felsblock fällt durch die reale physische Bruchöffnung bis auf den Boden (y < 2.0)
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

  // Rufe fractureBody direkt auf
  world.destructionSystem.fractureBody(plank, new Vec2(0, 5), new Vec2(0, 1));

  // 1. Die ursprüngliche Planke wurde aus der Welt entfernt
  assert.ok(!world.bodies.includes(plank), 'Urspruengliche Planke wurde aus world.bodies entfernt');
  assert.equal(plank.isBroken, true, 'Planke als gebrochen markiert');

  // 2. Es wurden 2 neue Fragmente hinzugefuegt (initial - 1 + 2 = initial + 1)
  assert.equal(world.bodies.length, initialBodyCount + 1, '2 neue Bruchstuecke in der Welt vorhanden');

  // 3. Bruchereignis wurde sauber protokolliert
  const shatterEvt = world.destructionSystem.fractureEvents.find(e => e.type === 'body_shatter');
  assert.ok(shatterEvt, 'Bruchereignis body_shatter vorhanden');
  assert.equal(shatterEvt.pieces.length, 2, '2 Bruchstueck-IDs im Event');

  // 4. Splitterpartikel wurden generiert
  assert.ok(world.destructionSystem.debrisParticles.length > 0, 'Holzsplitter-Partikel wurden erzeugt');
});

test('SubQG Pure: Gelaendefahrzeug landet gedaempft und faehrt stabil (kein Katapultieren)', () => {
  const world = new World({ engineMode: 'pure-subqg', gravity: new Vec2(0, -9.81) });
  DemoScenes.vehicleTerrain(world);
  const chassis = world.bodies.find(b => b.shapes[0] && b.shapes[0].type === 'box' && b.type === 'dynamic');
  
  // Simuliere 120 Schritte (2 Sekunden Fahrt)
  for (let i = 0; i < 120; i++) {
    world.step(1.0 / 60.0);
    // Fahrzeug darf niemals weggeschleudert werden (y < 6.0 m)
    assert.ok(chassis.position.y < 6.0, `Fahrzeug bleibt bodennah: y=${chassis.position.y.toFixed(2)} < 6.0 m`);
    assert.ok(chassis.velocity.length() < 20.0, `Geschwindigkeit bleibt physikalisch stabil: v=${chassis.velocity.length().toFixed(2)} < 20 m/s`);
  }
  // Fahrzeug ist vorwaerts gefahren (x > -5.0)
  assert.ok(chassis.position.x > -5.0, `Fahrzeug faehrt vorwaerts entlang des Terrains: x=${chassis.position.x.toFixed(2)}`);
});
