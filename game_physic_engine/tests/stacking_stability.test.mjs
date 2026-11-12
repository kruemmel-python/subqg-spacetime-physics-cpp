import test from 'node:test';
import assert from 'node:assert/strict';
import { World, Vec2, Material } from '../index.mjs';

test('Stacking: Stabiler Kistenturm (5 Kisten aufeinander) ohne Einsturz oder Zittern', () => {
  const world = new World({
    gravity: new Vec2(0, -9.81),
    velocityIterations: 10
  });

  // Boden bei y = 0, Dicke 1.0 (Oberkante bei y = 0.5)
  world.createBox(0, 0, 20, 1.0, {
    type: 'static',
    material: new Material({ friction: 0.6, restitution: 0.0 })
  });

  const boxes = [];
  const boxHeight = 1.0;
  const numBoxes = 5;

  // Erzeuge 5 Kisten übereinander mit 1.0 m Abstand
  for (let i = 0; i < numBoxes; i++) {
    // Unterste Kiste bei y = 0.5 + 0.5 = 1.0
    const yPos = 1.0 + i * boxHeight;
    const b = world.createBox(0, yPos, 1.0, boxHeight, {
      type: 'dynamic',
      material: new Material({ friction: 0.6, restitution: 0.0 }),
      linearDamping: 0.05,
      angularDamping: 0.05
    });
    boxes.push(b);
  }

  // Simuliere 200 Zeitschritte (über 3.3 Sekunden)
  for (let step = 0; step < 200; step++) {
    world.step(1.0 / 60.0);
  }

  // Überprüfe Stabilität jeder Kiste im Turm
  for (let i = 0; i < numBoxes; i++) {
    const b = boxes[i];
    // Horizontale Verschiebung muss minimal sein (< 0.1 m)
    assert.ok(Math.abs(b.position.x) < 0.1, `Kiste ${i} x-Drift: ${b.position.x}`);
    // Vertikale Höhe muss ordnungsgemäß gestapelt sein
    const expectedY = 1.0 + i * boxHeight;
    assert.ok(Math.abs(b.position.y - expectedY) < 0.15, `Kiste ${i} y-Höhe: ${b.position.y} (erwartet ~${expectedY})`);
    // Geschwindigkeiten müssen zur Ruhe gekommen sein
    assert.ok(b.velocity.length() < 0.1, `Kiste ${i} Restgeschwindigkeit: ${b.velocity.length()}`);
  }
});
