import { SubQGServer } from '../src/api/SubQGServer.mjs';

const tcpPort = parseInt(process.env.SUBQG_TCP_PORT || '3001', 10);
const httpPort = parseInt(process.env.SUBQG_HTTP_PORT || '3002', 10);

const server = new SubQGServer({ tcpPort, httpPort });

server.start().then(() => {
  console.log(`[SubQG API Server] Subquantum Graphity Live Physics Server ready.`);
  console.log(`- TCP Port:  ${tcpPort} (For Unreal Engine C++, Custom Game Engines, Blender)`);
  console.log(`- HTTP Port: ${httpPort} (For REST RPC, Batch Animation Baking)`);
}).catch((err) => {
  console.error('[SubQG API Server Failed]', err);
  process.exit(1);
});

process.on('SIGINT', () => {
  server.stop();
  process.exit(0);
});
