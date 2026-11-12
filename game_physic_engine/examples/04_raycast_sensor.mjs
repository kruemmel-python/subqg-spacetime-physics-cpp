import { World, Vec2 } from '../index.mjs';

const world = new World();

// Hindernis
const obstacle = world.createBox(6, 2, 2, 2, { type: 'static' });

// Raycast-Radar vom Spieler bei (0, 2)
const playerPos = new Vec2(0, 2);
const directions = [
  new Vec2(1, 0),
  new Vec2(1, 0.5).normalize(),
  new Vec2(1, -0.5).normalize(),
  new Vec2(0, 1)
];

console.log('=== SubQG Game Physics Engine: Raycast-Radar ===');
for (const dir of directions) {
  const hit = world.raycast(playerPos, dir, 20);
  if (hit) {
    console.log(`[RADAR] Treffer in Richtung (${dir.x.toFixed(2)}, ${dir.y.toFixed(2)}): Distanz = ${hit.distance.toFixed(2)}m bei (${hit.point.x.toFixed(2)}, ${hit.point.y.toFixed(2)})`);
  } else {
    console.log(`[RADAR] Kein Hindernis in Richtung (${dir.x.toFixed(2)}, ${dir.y.toFixed(2)})`);
  }
}
