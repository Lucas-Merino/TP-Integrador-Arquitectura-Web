const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Servidor funcionando correctamente\n');
    return;
  }

  if (req.method === 'POST' && req.url === '/archivo') {
    let totalBytes = 0;

    // El body llega en fragmentos a través del stream de request.
    req.on('data', (chunk) => {
      totalBytes += chunk.length;
    });

    // Respondemos cuando se recibieron todos los fragmentos.
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`Bytes recibidos: ${totalBytes}\n`);
    });

    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 - Recurso no encontrado\n');
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});