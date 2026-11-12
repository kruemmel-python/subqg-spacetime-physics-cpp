import test from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import { SubQGServer } from '../src/api/SubQGServer.mjs';

test('SubQG API Server: TCP Socket und JSON-RPC Kommunikation', async () => {
  const server = new SubQGServer({ tcpPort: 3101, httpPort: 3102 });
  await server.start();

  try {
    const client = net.createConnection({ port: 3101 }, () => {});
    
    // Hilfsfunktion für TCP Request/Response
    function sendCommand(cmd) {
      return new Promise((resolve) => {
        client.once('data', (data) => {
          const res = JSON.parse(data.toString('utf-8').trim());
          resolve(res);
        });
        client.write(JSON.stringify(cmd) + '\n');
      });
    }

    // 1. Box erzeugen
    const resBox = await sendCommand({
      id: 1,
      method: 'create_box',
      params: { id: 'test_plank', x: 0, y: 10, width: 2.0, height: 0.5, type: 'dynamic' }
    });
    assert.equal(resBox.id, 1);
    assert.equal(resBox.result.bodyId, 'test_plank');

    // 2. Boden erzeugen
    const resGround = await sendCommand({
      id: 2,
      method: 'create_segment',
      params: { id: 'ground', x1: -20, y1: 0, x2: 20, y2: 0 }
    });
    assert.equal(resGround.id, 2);

    // 3. Simulationsschritte ausführen
    for (let i = 0; i < 30; i++) {
      await sendCommand({ id: 100 + i, method: 'step', params: { dt: 1/60 } });
    }

    // 4. Status abfragen
    const resState = await sendCommand({ id: 3, method: 'get_state' });
    assert.equal(resState.id, 3);
    const plank = resState.result.bodies.find(b => b.id === 'test_plank');
    assert.ok(plank, 'Planke existiert im Snapshot');
    assert.ok(plank.y < 10.0, `Planke ist durch Gravitation gefallen: y=${plank.y} < 10`);

    client.end();
  } finally {
    server.stop();
  }
});

test('SubQG API Server: Batch Baking für Blender Animation Keyframes', async () => {
  const server = new SubQGServer({ tcpPort: 3201, httpPort: 3202 });
  await server.start();

  try {
    // Erstelle Welt und fallenden Ball
    server.handleCommand({
      method: 'create_circle',
      params: { id: 'blender_sphere', x: 0, y: 5, radius: 0.5, type: 'dynamic' }
    });
    server.handleCommand({
      method: 'create_segment',
      params: { id: 'floor', x1: -10, y1: 0, x2: 10, y2: 0 }
    });

    // Backe 60 Frames
    const bakeRes = server.handleCommand({
      id: 42,
      method: 'bake',
      params: { steps: 60, dt: 1/60 }
    });

    assert.equal(bakeRes.id, 42);
    assert.equal(bakeRes.result.totalFrames, 60);
    assert.equal(bakeRes.result.frames.length, 60);

    const f0 = bakeRes.result.frames[0].snapshot.bodies.find(b => b.id === 'blender_sphere');
    const f59 = bakeRes.result.frames[59].snapshot.bodies.find(b => b.id === 'blender_sphere');

    assert.ok(f59.y < f0.y, `Ball ist in der gebackenen Animation gefallen: ${f59.y} < ${f0.y}`);
  } finally {
    server.stop();
  }
});
