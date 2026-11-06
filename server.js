/**
 * VOID DEV — Official Studio Server (Local & Vercel Serverless Compatible)
 * Authored by Sunil (@Sunil56224972) & Prashank
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

// Explicit static file references so @vercel/nft bundles all studio assets into serverless deployments
const PRELOADED_ASSETS = {
  '/index.html': fs.readFileSync(path.join(__dirname, 'index.html')),
  '/assets/css/style.css': fs.readFileSync(path.join(__dirname, 'assets/css/style.css')),
  '/assets/js/main.js': fs.readFileSync(path.join(__dirname, 'assets/js/main.js')),
  '/assets/img/favicon.svg': fs.readFileSync(path.join(__dirname, 'assets/img/favicon.svg')),
  '/assets/img/arrow.svg': fs.readFileSync(path.join(__dirname, 'assets/img/arrow.svg')),
  '/assets/img/project-01.png': fs.readFileSync(path.join(__dirname, 'assets/img/project-01.png')),
  '/assets/img/project-02.png': fs.readFileSync(path.join(__dirname, 'assets/img/project-02.png')),
  '/assets/img/project-03.png': fs.readFileSync(path.join(__dirname, 'assets/img/project-03.png')),
  '/assets/img/project-04.png': fs.readFileSync(path.join(__dirname, 'assets/img/project-04.png')),
  '/assets/img/preview-hero.png': fs.readFileSync(path.join(__dirname, 'assets/img/preview-hero.png')),
  '/assets/img/preview-about.png': fs.readFileSync(path.join(__dirname, 'assets/img/preview-about.png')),
  '/assets/img/preview-projects.png': fs.readFileSync(path.join(__dirname, 'assets/img/preview-projects.png'))
};

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.json': 'application/json'
};

const server = http.createServer((req, res) => {
  const rawUrl = decodeURIComponent((req.url || '/').split('?')[0]);
  const normalizedUrl = rawUrl === '/' ? '/index.html' : '/' + rawUrl.replace(/^\/+/, '');
  const ext = path.extname(normalizedUrl).toLowerCase();

  // Serve from preloaded bundle if available (guarantees Vercel Serverless availability)
  if (PRELOADED_ASSETS[normalizedUrl] && process.env.VERCEL) {
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': 'public, max-age=0, must-revalidate'
    });
    return res.end(PRELOADED_ASSETS[normalizedUrl]);
  }

  const filePath = path.join(ROOT, normalizedUrl.replace(/^\/+/, ''));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (PRELOADED_ASSETS[normalizedUrl]) {
        res.writeHead(200, {
          'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
          'Cache-Control': 'public, max-age=0, must-revalidate'
        });
        return res.end(PRELOADED_ASSETS[normalizedUrl]);
      }
      res.writeHead(404);
      return res.end('Not found');
    }
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`VOID DEV server running at ${url}`);
  if (process.platform === 'win32' && !process.env.VERCEL) {
    exec(`start "" "${url}"`);
  }
});

module.exports = server;
