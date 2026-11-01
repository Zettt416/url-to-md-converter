import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { convertUrlToMarkdown, convertHtmlToMarkdown } from '../converter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup a test server instance on an ephemeral port
let server;
let baseUrl;

test.before(async () => {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/convert-html', (req, res) => {
    const { html, baseUrl = '', mode = 'readability', selector = '', includeFrontmatter = true } = req.body || {};
    try {
      const result = convertHtmlToMarkdown(html, baseUrl, { mode, selector, includeFrontmatter });
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.post('/api/convert', async (req, res) => {
    const { url, mode = 'readability', selector = '', includeFrontmatter = true, headers = {} } = req.body || {};
    if (!url) return res.status(400).json({ success: false, error: 'URL required' });
    try {
      const result = await convertUrlToMarkdown(url, { mode, selector, includeFrontmatter, headers });
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET / serves index.html', async () => {
  const res = await fetch(`${baseUrl}/`);
  assert.equal(res.status, 200);
  const text = await res.text();
  assert.ok(text.includes('DOCS_TO_MD'));
});

test('GET /api/health returns ok', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'ok');
});

test('POST /api/convert-html converts HTML snippet to markdown', async () => {
  const payload = {
    html: '<article><h1>REST API</h1><p>Endpoint description.</p></article>',
    baseUrl: 'https://api.test.com/v1',
    includeFrontmatter: true
  };

  const res = await fetch(`${baseUrl}/api/convert-html`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(json.data.markdown.includes('title: "REST API"'));
  assert.ok(json.data.markdown.includes('Endpoint description.'));
});

test('POST /api/convert accepts custom headers option', async () => {
  const res = await fetch(`${baseUrl}/api/convert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: `${baseUrl}/api/health`,
      headers: { 'Authorization': 'Bearer test-token' }
    })
  });

  // /api/health returns json, which converter.js handles and wraps into code block
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(json.data.markdown.includes('API Response'));
});

