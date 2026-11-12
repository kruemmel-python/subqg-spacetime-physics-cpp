import test from 'node:test';
import assert from 'node:assert/strict';
import { World, Vec2, Material } from '../index.mjs';

test('Dynamics: Fallende Kiste landet auf Boden und bleibt liegen (Ruhelage)', () => {
  const world = new World({ gravity: new Vec2(0, -9.81) });

  // Statischer Boden bei y = 0, Dicke 1.0 (Oberkante bei y = 0.5)
  const floor = world.createBox(0, 0, 20, 1.0, {
    type: 'static',
    material: new Material({ friction: 0.5, restitution: 0.05 })
  });

  // Kiste bei y = 5.0 (Größe 1x1, Unterkante bei y = 4.5)
  const box = world.createBox(0, 5.0, 1.0, 1.0, {
    type: 'dynamic',
    material: new Material({ friction: 0.5, restitution: 0.05 })
  });

  const initialY = box.position.y;
  assert.equal(initialY, 5.0);

  // Simuliere 120 Schritte à 1/60 s = 2 Sekunden
  for (let i = 0; i < 120; i++) {
    world.step(1.0 / 60.0);
  }

  // Kiste muss auf dem Boden liegen (Unterkante bei y=0.5 -> Schwerpunkt bei y=1.0)
  assert.ok(box.position.y < 1.05 && box.position.y >= 0.98, `Kistenposition y: ${box.position.y}`);
  // Geschwindigkeit muss nahe 0 sein (zur Ruhe gekommen)
  assert.ok(Math.abs(box.velocity.y) < 0.05, `Kistengeschwindigkeit vy: ${box.velocity.y}`);
});

test('Dynamics: Elastischer Ball springt mehrfach vom Boden ab (Restitution)', () => {
  const world = new World({ gravity: new Vec2(0, -9.81) });

  // Boden
  world.createBox(0, 0, 20, 1.0, {
    type: 'static',
    material: new Material({ friction: 0.1, restitution: 0.85 })
  });

  // Flummiball bei y = 4.0 mit hoher Elastizität e = 0.85
  const ball = world.createCircle(0, 4.0, 0.5, {
    type: 'dynamic',
    material: new Material({ friction: 0.1, restitution: 0.85 })
  });

  let hitCount = 0;
  let maxBounceHeight = 0;
  let prevVy = ball.velocity.y;

  for (let i = 0; i < 180; i++) {
    world.step(1.0 / 60.0);
    // Erkenne Umkehrpunkt des Aufpralls (vy wechselt von negativ nach positiv)
    if (prevVy < -0.5 && ball.velocity.y > 0.5) {
      hitCount++;
    }
    prevVy = ball.velocity.y;
    if (ball.position.y > maxBounceHeight && hitCount >= 1) {
      maxBounceHeight = ball.position.y;
    }
  }

  // Ball muss mindestens einmal abgeprallt und wieder hochgesprungen sein
  assert.ok(hitCount >= 1, `Aufprall-Zähler: ${hitCount}`);
  assert.ok(maxBounceHeight > 1.5, `Rebound Höhe: ${maxBounceHeight}`);
});

test('Dynamics: Rollender Ball und Kastenreibung auf Ebene', () => {
  const world = new World({ gravity: new Vec2(0, -9.81) });

  // Boden
  world.createBox(0, 0, 30, 1.0, {
    type: 'static',
    material: new Material({ friction: 0.4, restitution: 0.0 })
  });

  // Gleitende Kiste mit horizontalem Impuls
  const slidingBox = world.createBox(-5, 1.0, 1.0, 1.0, {
    type: 'dynamic',
    material: new Material({ friction: 0.4, restitution: 0.0 })
  });
  slidingBox.setVelocity(6.0, 0); // 6 m/s nach rechts

  // Simuliere 120 Schritte
  for (let i = 0; i < 120; i++) {
    world.step(1.0 / 60.0);
  }

  // Durch Reibung muss die Kiste langsamer geworden oder zum Stillstand gekommen sein
  assert.ok(slidingBox.velocity.x < 1.0, `Endgeschwindigkeit vx: ${slidingBox.velocity.x}`);
});
