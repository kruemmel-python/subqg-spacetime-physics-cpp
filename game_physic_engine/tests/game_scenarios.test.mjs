import test from 'node:test';
import assert from 'node:assert/strict';
import { World, Vec2, Material, Box, Circle } from '../index.mjs';

test('Game Scenario: Fahrzeug mit 2 Rädern und Radlagern fährt über Boden', () => {
  const world = new World({ gravity: new Vec2(0, -9.81) });

  // 1. Bodenfläche
  world.createBox(0, 0, 40, 1.0, {
    type: 'static',
    material: new Material({ friction: 0.8, restitution: 0.0 })
  });

  // 2. Fahrgestell (Chassis)
  const chassis = world.createBox(0, 2.0, 3.0, 0.8, {
    type: 'dynamic',
    material: new Material({ density: 1.0, friction: 0.2 })
  });

  // 3. Zwei Räder
  const wheelMaterial = new Material({ density: 2.0, friction: 0.9, restitution: 0.05 });
  const rearWheel = world.createCircle(-1.2, 1.2, 0.5, {
    type: 'dynamic',
    material: wheelMaterial
  });
  const frontWheel = world.createCircle(1.2, 1.2, 0.5, {
    type: 'dynamic',
    material: wheelMaterial
  });

  // 4. Radlager (RevoluteJoints) mit aktivem Motor für das Hinterrad
  const rearAxle = world.createRevoluteJoint(chassis, rearWheel, new Vec2(-1.2, 1.2), {
    enableMotor: true,
    motorSpeed: -15.0, // Drehung vorwärts im Uhrzeigersinn (negativ in math. Zählweise)
    maxMotorTorque: 50.0
  });

  const frontAxle = world.createRevoluteJoint(chassis, frontWheel, new Vec2(1.2, 1.2), {
    enableMotor: false
  });

  const initialX = chassis.position.x;

  // Simuliere 120 Schritte (2 Sekunden Fahrt)
  for (let i = 0; i < 120; i++) {
    world.step(1.0 / 60.0);
  }

  // Fahrzeug muss durch den motorisierten Radantrieb deutlich nach rechts gefahren sein (x > initialX)
  assert.ok(chassis.position.x > initialX + 2.0, `Fahrzeugposition x: ${chassis.position.x} (erwartet > ${initialX + 2.0})`);
  // Chassis muss stabil über dem Boden geblieben sein
  assert.ok(chassis.position.y > 1.0 && chassis.position.y < 3.0, `Chassis-Höhe y: ${chassis.position.y}`);
});

test('Game Scenario: Katapult schleudert Projektil mit Hebelarm', () => {
  const world = new World({ gravity: new Vec2(0, -9.81) });

  // Feste Basis
  const base = world.createBox(0, 1.0, 2, 2, { type: 'static' });

  // Wurfarm (Länge 4m, Drehpunkt bei x=0, y=2.0)
  const arm = world.createBox(1.5, 2.0, 4.0, 0.2, {
    type: 'dynamic',
    material: new Material({ density: 0.5 })
  });

  world.createRevoluteJoint(base, arm, new Vec2(0, 2.0));

  // Projektil am Armende bei x=3.5, y=2.3
  const projectile = world.createCircle(3.5, 2.3, 0.3, {
    type: 'dynamic',
    material: new Material({ density: 2.0, friction: 0.2, restitution: 0.2 })
  });

  // Schleudere Katapultarm mit starkem Drehmoment-Impuls gegen den Uhrzeigersinn
  arm.applyAngularImpulse(80.0);

  // Simuliere 60 Schritte
  for (let i = 0; i < 60; i++) {
    world.step(1.0 / 60.0);
  }

  // Projektil muss durch den Stoßimpuls hoch und weit geschleudert worden sein
  assert.ok(projectile.position.y > 3.0, `Projektil-Flughöhe y: ${projectile.position.y}`);
  assert.ok(projectile.position.x > 3.5, `Projektil-Wurfweite x: ${projectile.position.x}`);
});

test('Game Scenario: Compound Body (Spielfigur aus Kopf-Kreis und Rumpf-Box)', () => {
  const world = new World({ gravity: new Vec2(0, -9.81) });

  const character = world.createBody({
    position: new Vec2(0, 5),
    type: 'dynamic'
  });

  // Rumpf
  const torso = new Box(1.0, 1.5, new Vec2(0, 0));
  // Kopf (Kreis um 1.1m nach oben versetzt)
  const head = new Circle(0.4, new Vec2(0, 1.1));

  character.addShape(torso);
  character.addShape(head);

  assert.equal(character.shapes.length, 2);
  assert.ok(character.mass > 2.0); // Kombinierte Masse aus Rumpf und Kopf

  // Boden
  world.createBox(0, 0, 20, 1.0, { type: 'static' });

  for (let i = 0; i < 140; i++) {
    world.step(1.0 / 60.0);
  }

  // Figur ist auf dem Boden gelandet und steht stabil
  assert.ok(character.position.y < 2.0 && character.position.y > 0.8, `Endhöhe Figur: ${character.position.y}`);
  assert.ok(character.velocity.length() < 0.15, `Restgeschwindigkeit: ${character.velocity.length()}`);
});
