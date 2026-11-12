import { World, Vec2, Material } from '../index.mjs';

const world = new World({ gravity: new Vec2(0, -9.81) });

// Boden
world.createBox(0, 0, 20, 1.0, {
  type: 'static',
  material: Material.stone()
});

// Gummiball mit Restitution = 0.85
const ball = world.createCircle(0, 6.0, 0.5, {
  type: 'dynamic',
  material: Material.rubber()
});

console.log('=== SubQG Game Physics Engine: Springender Gummiball ===');

let bounces = 0;
let prevVy = 0;

for (let step = 0; step < 120; step++) {
  world.step(1.0 / 60.0);
  if (prevVy < -0.5 && ball.velocity.y > 0.5) {
    bounces++;
    console.log(`-> Aufprall #${bounces} bei t = ${(step / 60).toFixed(2)}s: Rebound mit vy = +${ball.velocity.y.toFixed(2)} m/s`);
  }
  prevVy = ball.velocity.y;
}

console.log(`Ergebnis: Ball absolvierte ${bounces} elastische Sprünge.`);
