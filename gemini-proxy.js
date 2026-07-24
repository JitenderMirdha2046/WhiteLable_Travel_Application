const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 3090;
const GEMINI_HOST = 'generativelanguage.googleapis.com';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const server = http.createServer((req, res) => {
  // For health check
  if (req.method === 'GET' && (req.url === '/gemini' || req.url === '/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'Gemini proxy is running', 
      port: PORT,
      keyConfigured: !!GEMINI_API_KEY 
    }));
    return;
  }

  // For POST requests - proxy to Gemini
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const parsed = url.parse(req.url, true);
    
    // Build the target path - replace /gemini with the actual Gemini API endpoint
    let targetPath = parsed.pathname;
    if (targetPath === '/gemini' || targetPath === '/gemini/') {
      targetPath = '/v1beta/models/gemini-2.5-flash:generateContent';
    }
    
    // Build query string with the real API key from environment
    const apiKey = GEMINI_API_KEY || parsed.query.key;
    const queryString = `?key=${apiKey}`;
    
    const options = {
      hostname: GEMINI_HOST,
      path: targetPath + queryString,
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
        res.writeHead(proxyRes.statusCode, { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
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
  if (!GEMINI_API_KEY) {
    console.log('WARNING: GEMINI_API_KEY not set in environment');
  } else {
    console.log('GEMINI_API_KEY configured');
  }
});
