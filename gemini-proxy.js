const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 3000;
const GEMINI_HOST = 'generativelanguage.googleapis.com';

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const apiKey = parsed.query.key;

  if (!apiKey) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Missing api key' }));
    return;
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const options = {
      hostname: GEMINI_HOST,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const proxyReq = https.request(options, (proxyRes) => {
      let data = '';
      proxyRes.on('data', chunk => data += chunk);
      proxyRes.on('end', () => {
        res.writeHead(proxyRes.statusCode, { 'Content-Type': 'application/json' });
        res.end(data);
      });
    });

    proxyReq.on('error', (e) => {
      console.error('Proxy error:', e.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    });

    proxyReq.write(body);
    proxyReq.end();
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Gemini proxy running on port ${PORT}`);
});
