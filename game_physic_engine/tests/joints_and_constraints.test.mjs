import test from 'node:test';
import assert from 'node:assert/strict';
import { World, Vec2, Material } from '../index.mjs';

test('Joints: RevoluteJoint (Pendel) hält Drehpunkt exakt ein', () => {
  const world = new World({ gravity: new Vec2(0, -9.81) });

  // Fester Deckenanker
  const ceiling = world.createBox(0, 10, 2, 0.5, { type: 'static' });
  // Pendelkörper bei (3, 10) (horizontal ausgelenkt)
  const bob = world.createCircle(3, 10, 0.5, { type: 'dynamic' });

  const joint = world.createRevoluteJoint(ceiling, bob, new Vec2(0, 10));

  // Simuliere 60 Schritte
  for (let i = 0; i < 60; i++) {
    world.step(1.0 / 60.0);
    // Abstand des Drehpunkts an ceiling und bob muss identisch sein (< 0.02 m Toleranz)
    const pA = ceiling.transform.transformPoint(joint.localAnchorA);
    const pB = bob.transform.transformPoint(joint.localAnchorB);
    assert.ok(pA.distanceTo(pB) < 0.02, `Gelenk-Distanzfehler: ${pA.distanceTo(pB)}`);
  }

  // Bob muss durch Schwerkraft nach unten geschwungen sein
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
  // Piston kann nur vertikal (Achse: (0, 1)) gleiten
  const piston = world.createBox(0, 7, 1, 1, { type: 'dynamic' });

  world.createPrismaticJoint(base, piston, new Vec2(0, 5), new Vec2(0, 1));

  // Wende seitliche Querkraft an, die geblockt werden muss
  piston.applyForce(new Vec2(50.0, 0));

  for (let i = 0; i < 60; i++) {
    world.step(1.0 / 60.0);
    // Horizontale Verschiebung x muss blockiert bleiben (< 0.02 m)
    assert.ok(Math.abs(piston.position.x) < 0.02, `Piston x-Drift: ${piston.position.x}`);
  }

  // Piston ist vertikal gefallen
  assert.ok(piston.position.y < 7.0, `Piston y: ${piston.position.y}`);
});

test('Joints: WeldJoint verschweißt Körper starr', () => {
  const world = new World({ gravity: new Vec2(0, 0) }); // Schwerelos

  const b1 = world.createBox(0, 0, 1, 1, { type: 'dynamic' });
  const b2 = world.createBox(2, 0, 1, 1, { type: 'dynamic' });

  world.createWeldJoint(b1, b2, new Vec2(1, 0));

  // Drehmoment nur auf b1
  b1.applyTorque(10.0);

  for (let i = 0; i < 30; i++) {
    world.step(1.0 / 60.0);
  }

  // Beide müssen denselben Winkel und Drehgeschwindigkeit besitzen
  assert.ok(Math.abs(b1.angle - b2.angle) < 0.02, `Winkel-Differenz: ${Math.abs(b1.angle - b2.angle)}`);
  assert.ok(Math.abs(b1.angularVelocity - b2.angularVelocity) < 0.05);
});
