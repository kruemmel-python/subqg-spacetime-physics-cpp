import test from 'node:test';
import assert from 'node:assert/strict';
import { World, Vec2 } from '../index.mjs';

test('Triggers: Sensor detektiert Enter, Stay und Exit ohne Stoßwiderstand', () => {
  const world = new World({ gravity: new Vec2(0, 0) }); // Schwerelos

  // Trigger-Zone bei (0, 0) mit Größe 2x2 (x von -1 bis 1)
  const sensor = world.createBox(0, 0, 2, 2, {
    type: 'static',
    isTrigger: true
  });

  // Dynamischer Ball startet bei x = -3 und fliegt mit 4 m/s nach rechts
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

  // Ball fliegt 90 Schritte (1.5 Sekunden)
  // Bei 4 m/s legt er 6 Meter zurück (von x = -3 bis x = +3)
  for (let i = 0; i < 90; i++) {
    world.step(1.0 / 60.0);
  }

  // Überprüfe Trigger-Ereignisse
  assert.equal(enterCount, 1, 'onTriggerEnter genau 1x aufgerufen');
  assert.ok(stayCount > 5, `onTriggerStay mehrfach aufgerufen (${stayCount})`);
  assert.equal(exitCount, 1, 'onTriggerExit genau 1x aufgerufen');

  // Ball darf nicht abgebremst worden sein (kein Stoßimpuls durch Sensor!)
  assert.ok(projectile.velocity.x > 3.9, `Geschwindigkeit nach Durchquerung: ${projectile.velocity.x}`);
});
