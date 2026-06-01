const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const PORT = process.env.PORT || 3000;
const subscribers = new Map();
const staticRoot = fs.existsSync(path.join(__dirname, 'public'))
  ? path.join(__dirname, 'public')
  : __dirname;

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png'
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept'
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

async function handleSubscribe(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept'
    });
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const rawBody = await readBody(req);
  let email = '';

  try {
    const payload = JSON.parse(rawBody || '{}');
    email = (payload.email || '').toString().trim();
  } catch {
    email = (new URLSearchParams(rawBody).get('email') || '').trim();
  }

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    sendJson(res, 400, { error: 'Invalid email address' });
    return;
  }

  const key = email.toLowerCase();

  if (subscribers.has(key)) {
    sendJson(res, 200, { message: 'Already subscribed.' });
    return;
  }

  subscribers.set(key, {
    id: crypto.randomUUID(),
    email,
    subscribedAt: new Date().toISOString()
  });

  sendJson(res, 200, { message: 'Thanks! Your email has been submitted.' });
}

function sendStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const requestPath = url.pathname === '/' ? '/index.html' : url.pathname;
  const filePath = path.normalize(path.join(staticRoot, requestPath));
  const relativePath = path.relative(staticRoot, filePath);

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': contentTypes[ext] || 'application/octet-stream'
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/subscribe')) {
    handleSubscribe(req, res).catch(error => {
      console.error('Newsletter error:', error);
      sendJson(res, 500, { error: 'Could not save subscription' });
    });
    return;
  }

  sendStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`TUMIMURIM listening on http://localhost:${PORT}`);
});
