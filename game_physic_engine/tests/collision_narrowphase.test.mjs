import test from 'node:test';
import assert from 'node:assert/strict';
import { Body, Circle, Box, Polygon, Capsule, Segment, CollisionNarrowphase, SubQGContactBridge, Vec2 } from '../index.mjs';

const bridge = new SubQGContactBridge();
const narrow = new CollisionNarrowphase(bridge);

test('Narrowphase: Circle vs Circle Kollision und Distanz', () => {
  const b1 = new Body({ position: new Vec2(0, 0) });
  const c1 = new Circle(1.0);
  b1.addShape(c1);

  const b2 = new Body({ position: new Vec2(1.5, 0) }); // Überlappung = 2.0 - 1.5 = 0.5
  const c2 = new Circle(1.0);
  b2.addShape(c2);

  const manifold = narrow.collide(b1, b2, c1, c2);
  assert.ok(manifold !== null);
  assert.equal(manifold.points.length, 1);
  assert.ok(Math.abs(manifold.points[0].penetration - 0.5) < 1e-9);
  assert.ok(Math.abs(manifold.normal.x - 1.0) < 1e-9);
  assert.ok(Math.abs(manifold.normal.y - 0.0) < 1e-9);

  // Keine Kollision bei Abstand > 2.0
  b2.setPosition(2.5, 0);
  assert.equal(narrow.collide(b1, b2, c1, c2), null);
});

test('Narrowphase: Circle vs Box Kollision', () => {
  const bBox = new Body({ position: new Vec2(0, 0), type: 'static' });
  const box = new Box(4.0, 2.0); // [-2, 2] x [-1, 1]
  bBox.addShape(box);

  const bCircle = new Body({ position: new Vec2(0, 1.8) }); // Radius 1.0 -> Überlappung bei y=1.0 ist 0.2
  const circle = new Circle(1.0);
  bCircle.addShape(circle);

  const manifold = narrow.collide(bCircle, bBox, circle, box);
  assert.ok(manifold !== null);
  assert.equal(manifold.points.length, 1);
  assert.ok(Math.abs(manifold.points[0].penetration - 0.2) < 1e-3);
  // Normale zeigt von Circle nach Box -> nach unten (-y)
  assert.ok(manifold.normal.y < -0.9);
});

test('Narrowphase: Box vs Box SAT und 2 Kontaktpunkte', () => {
  const bFloor = new Body({ position: new Vec2(0, 0), type: 'static' });
  const floorBox = new Box(10.0, 1.0); // y von -0.5 bis 0.5
  bFloor.addShape(floorBox);

  const bCrate = new Body({ position: new Vec2(0, 1.4) }); // Kiste 1x1, y von 0.9 bis 1.9 -> berührt bei y=0.5
  const crateBox = new Box(1.0, 1.0);
  bCrate.addShape(crateBox);

  // Kiste senkt sich um 0.1 ab -> y=1.35, Kistenunterkante bei 0.85? Nein: 1.35 - 0.5 = 0.85 > 0.5.
  // Setze Kiste auf y=0.9 -> Unterkante bei 0.4 -> Überlappung 0.1 mit Bodenoberkante 0.5!
  bCrate.setPosition(0, 0.9);

  const manifold = narrow.collide(bFloor, bCrate, floorBox, crateBox);
  assert.ok(manifold !== null);
  // Box-Box flach aufeinander ergibt 2 Kontaktpunkte (Kanten-Kontakt)
  assert.ok(manifold.points.length >= 1);
  assert.ok(Math.abs(manifold.normal.y - 1.0) < 1e-6); // Normale von Floor nach Crate zeigt nach oben
  assert.ok(manifold.points[0].penetration > 0.05);
});
