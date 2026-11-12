import test from 'node:test';
import assert from 'node:assert/strict';
import { World, Vec2, Box, Circle, Polygon, Segment } from '../index.mjs';

test('Raycast: Präziser Treffertest gegen verschiedene Formen', () => {
  const world = new World();

  // Kiste bei (5, 0) mit Größe 2x2 -> x von 4 bis 6, y von -1 bis 1
  const crate = world.createBox(5, 0, 2, 2, { type: 'static' });

  // Strahl von (0, 0) nach rechts (1, 0)
  const hit = world.raycast(new Vec2(0, 0), new Vec2(1, 0), 10);
  assert.ok(hit !== null);
  assert.equal(hit.body, crate);
  assert.ok(Math.abs(hit.point.x - 4.0) < 1e-4); // Trifft linke Wand bei x = 4
  assert.ok(Math.abs(hit.point.y - 0.0) < 1e-4);
  assert.ok(Math.abs(hit.normal.x - (-1.0)) < 1e-4); // Normale nach links

  // Strahl vorbei (nach oben)
  const miss = world.raycast(new Vec2(0, 5), new Vec2(1, 0), 10);
  assert.equal(miss, null);

  // Kreis bei (0, 8) mit Radius 1 -> trifft bei y = 7
  const ball = world.createCircle(0, 8, 1.0, { type: 'static' });
  const hitCircle = world.raycast(new Vec2(0, 0), new Vec2(0, 1), 10);
  assert.ok(hitCircle !== null);
  assert.equal(hitCircle.body, ball);
  assert.ok(Math.abs(hitCircle.point.y - 7.0) < 1e-4);
  assert.ok(Math.abs(hitCircle.normal.y - (-1.0)) < 1e-4);
});

test('RaycastAll: Sortierung nach Trefferdistanz', () => {
  const world = new World();
  const b1 = world.createBox(3, 0, 1, 1, { type: 'static' }); // x von 2.5 bis 3.5
  const b2 = world.createBox(7, 0, 1, 1, { type: 'static' }); // x von 6.5 bis 7.5

  const hits = world.raycastAll(new Vec2(0, 0), new Vec2(1, 0), 20);
  assert.equal(hits.length, 2);
  assert.equal(hits[0].body, b1);
  assert.equal(hits[1].body, b2);
  assert.ok(hits[0].fraction < hits[1].fraction);
});
