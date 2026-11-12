import { World, Vec2 } from '../index.mjs';

const world = new World({ gravity: new Vec2(0, -9.81) });

// Decke
const ceiling = world.createBox(0, 10, 4, 0.5, { type: 'static' });

// Pendel 1
const bob1 = world.createCircle(2, 10, 0.4, { type: 'dynamic' });
world.createRevoluteJoint(ceiling, bob1, new Vec2(0, 10));

// Pendel 2 (am ersten Pendel befestigt: Doppelpendel)
const bob2 = world.createCircle(4, 10, 0.4, { type: 'dynamic' });
world.createRevoluteJoint(bob1, bob2, new Vec2(2, 10));

console.log('=== SubQG Game Physics Engine: Doppelpendel ===');
for (let step = 0; step < 60; step++) {
  world.step(1.0 / 60.0);
  if (step % 15 === 0) {
    console.log(
      `t = ${(step / 60).toFixed(2)}s: ` +
      `Bob1 = (${bob1.position.x.toFixed(2)}, ${bob1.position.y.toFixed(2)}), ` +
      `Bob2 = (${bob2.position.x.toFixed(2)}, ${bob2.position.y.toFixed(2)})`
    );
  }
}
