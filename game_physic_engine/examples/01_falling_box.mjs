import { World, Vec2, Material } from '../index.mjs';

// 1. Erstelle die physikalische Spielwelt mit Standard-Erdschwerkraft
const world = new World({ gravity: new Vec2(0, -9.81) });

// 2. Erstelle einen statischen Boden bei y = 0
world.createBox(0, 0, 20, 1.0, {
  type: 'static',
  material: Material.wood()
});

// 3. Erstelle eine dynamische Kiste in 5 Metern Höhe
const box = world.createBox(0, 5.0, 1.0, 1.0, {
  type: 'dynamic',
  material: Material.wood()
});

console.log('=== SubQG Game Physics Engine: Fallende Kiste ===');
console.log(`Startposition: y = ${box.position.y.toFixed(2)} m`);

// 4. Simulationsschritte ausführen
for (let step = 0; step <= 80; step++) {
  world.step(1.0 / 60.0);
  if (step % 10 === 0) {
    const diag = world.getSubQGDiagnostics();
    console.log(
      `Frame ${step.toString().padStart(2, ' ')} (${(step / 60).toFixed(2)}s): ` +
      `y = ${box.position.y.toFixed(3)} m, vy = ${box.velocity.y.toFixed(3)} m/s | ` +
      `SubQG Gitter-Wirkung: ${diag.totalEdgeAction.toFixed(4)}`
    );
  }
}

console.log(`Endposition: y = ${box.position.y.toFixed(3)} m (Ruhelage auf Bodenoberkante y = 1.000 m)`);
