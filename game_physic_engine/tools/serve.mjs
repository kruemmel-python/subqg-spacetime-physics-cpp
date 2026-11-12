import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 3000;
const BASE_DIR = path.resolve('H:/SubQG_Fundamental_Physics_Validation_FPV6/game_physic_engine');

const MIME_TYPES = {
  '.html': 'text/html',
  '.mjs': 'application/javascript',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/demo/index.html';

  const filePath = path.join(BASE_DIR, reqPath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found: ' + reqPath);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(data);
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} ist bereits belegt! Der Server läuft möglicherweise bereits unter http://localhost:${PORT}/demo/index.html`);
  } else {
    console.error('Serverfehler:', err);
  }
});

server.listen(PORT, () => {
  console.log(`SubQG Game Physics Server läuft unter: http://localhost:${PORT}/demo/index.html`);
});
