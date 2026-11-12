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

  assert.equal(v1.dot(v2), 3 * 1 + 4 * 2); // 11
  assert.equal(v1.cross(v2), 3 * 2 - 4 * 1); // 2

  const perp = v1.perp();
  assert.equal(perp.x, -4);
  assert.equal(perp.y, 3);
  assert.equal(v1.dot(perp), 0); // Orthogonal
});

test('Math: Mat22 Inversion und lineares Gleichungssystem', () => {
  const m = new Mat22();
  m.set(Math.PI / 2); // 90 Grad Rotation
  const v = new Vec2(1, 0);
  const rotV = m.mulVec(v);
  assert.ok(Math.abs(rotV.x) < 1e-12);
  assert.ok(Math.abs(rotV.y - 1.0) < 1e-12);

  // Lineares Gleichungssystem M * x = b
  const M = new Mat22();
  M.setElements(2, 1, 1, 3);
  const b = new Vec2(5, 10); // 2x + y = 5, x + 3y = 10 -> x = 1, y = 3
  const x = M.solve(b);
  assert.ok(Math.abs(x.x - 1.0) < 1e-9);
  assert.ok(Math.abs(x.y - 3.0) < 1e-9);
});

test('Math: Transform Lokal- und Weltkoordinaten', () => {
  const t = new Transform(new Vec2(10, 20), Math.PI / 2);
  const localPt = new Vec2(2, 0);
  const worldPt = t.transformPoint(localPt); // (10 + 0, 20 + 2) = (10, 22)
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

  // Slab Raycast
  const rayOrigin = new Vec2(-5, 5);
  const rayDir = new Vec2(1, 0);
  const hit = aabb1.raycast(rayOrigin, rayDir, 20);
  assert.equal(hit.hit, true);
  assert.equal(hit.fraction, 5); // Trifft bei x = 0 (Distanz 5)
  assert.equal(hit.point.x, 0);
  assert.equal(hit.point.y, 5);
  assert.equal(hit.normal.x, -1);
});
