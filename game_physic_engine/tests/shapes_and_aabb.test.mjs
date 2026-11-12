import test from 'node:test';
import assert from 'node:assert/strict';
import { Circle, Box, Polygon, Capsule, Segment, Transform, Vec2 } from '../index.mjs';

test('Shapes: Circle Masse und AABB', () => {
  const c = new Circle(1.0);
  const massData = c.computeMassData(2.0); // Dichte = 2.0
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
  const b = new Box(2.0, 4.0); // 2 x 4
  const massData = b.computeMassData(1.0);
  assert.equal(massData.area, 8.0);
  assert.equal(massData.mass, 8.0);
  // I = 1/12 * 8 * (4 + 16) = 8/12 * 20 = 13.3333
  assert.ok(Math.abs(massData.inertia - (8.0 / 12.0) * 20.0) < 1e-9);

  const t = new Transform(new Vec2(0, 0), Math.PI / 2); // Um 90 Grad gedreht
  const aabb = b.computeAABB(t);
  // Nach 90 Grad Rotation ist Breite 4 und Höhe 2
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
  const cap = new Capsule(2.0, 0.5); // Länge 2.0, Radius 0.5
  const t = new Transform(new Vec2(10, 10), 0);
  const aabb = cap.computeAABB(t);
  // Halbe Länge = 1.0, Radius = 0.5 -> Y von 10-1.5=8.5 bis 10+1.5=11.5, X von 9.5 bis 10.5
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
