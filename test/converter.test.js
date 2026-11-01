import test from 'node:test';
import assert from 'node:assert/strict';
import { convertHtmlToMarkdown } from '../converter.js';

test('converts basic HTML to Markdown with frontmatter', () => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head><title>API Reference - Users</title></head>
      <body>
        <article>
          <h1>Users API</h1>
          <p>This endpoint manages user accounts.</p>
          <pre><code class="language-bash">curl -X GET https://api.example.com/users</code></pre>
        </article>
      </body>
    </html>
  `;

  const result = convertHtmlToMarkdown(html, 'https://api.example.com/docs', {
    includeFrontmatter: true,
  });

  assert.ok(result.markdown.includes('title: "API Reference - Users"'));
  assert.ok(result.markdown.includes('source: "https://api.example.com/docs"'));
  assert.ok(result.markdown.includes('```bash'));
  assert.ok(result.markdown.includes('curl -X GET https://api.example.com/users'));
  assert.equal(result.title, 'API Reference - Users');
});

test('converts HTML tables to GFM tables', () => {
  const html = `
    <html>
      <head><title>Parameters</title></head>
      <body>
        <main>
          <h2>Query Parameters</h2>
          <table>
            <thead>
              <tr><th>Field</th><th>Type</th><th>Description</th></tr>
            </thead>
            <tbody>
              <tr><td>limit</td><td>integer</td><td>Max records to return</td></tr>
              <tr><td>offset</td><td>integer</td><td>Pagination offset</td></tr>
            </tbody>
          </table>
        </main>
      </body>
    </html>
  `;

  const result = convertHtmlToMarkdown(html, 'https://example.com/params', {
    includeFrontmatter: false,
  });

  assert.ok(result.markdown.includes('| Field | Type | Description |'));
  assert.ok(result.markdown.includes('| limit | integer | Max records to return |'));
});

test('resolves relative URLs to absolute', () => {
  const html = `
    <html>
      <head><title>Links Test</title></head>
      <body>
        <main>
          <p>See <a href="/v1/auth">Auth Specs</a> and <img src="../images/diagram.png" alt="Diagram" /></p>
        </main>
      </body>
    </html>
  `;

  const result = convertHtmlToMarkdown(html, 'https://api.example.com/v1/overview', {
    includeFrontmatter: false,
  });

  assert.ok(result.markdown.includes('https://api.example.com/v1/auth'));
  assert.ok(result.markdown.includes('https://api.example.com/images/diagram.png'));
});

test('supports custom CSS selector', () => {
  const html = `
    <html>
      <head><title>Custom Selector</title></head>
      <body>
        <nav><a href="/">Home</a></nav>
        <div id="api-content">
          <h3>Authentication Header</h3>
          <p>Bearer token required.</p>
        </div>
        <footer>Copyright 2026</footer>
      </body>
    </html>
  `;

  const result = convertHtmlToMarkdown(html, 'https://example.com', {
    mode: 'selector',
    selector: '#api-content',
    includeFrontmatter: false,
  });

  assert.ok(result.markdown.includes('### Authentication Header'));
  assert.ok(!result.markdown.includes('Copyright 2026'));
  assert.ok(!result.markdown.includes('Home'));
});

test('resolves React Server Components streaming Suspense boundaries', () => {
  const html = `
    <html>
      <head><title>Weather API</title></head>
      <body>
        <main>
          <div id="B:0">Loading skeleton...</div>
        </main>
        <div hidden id="S:0">
          <article>
            <h2>One Call Weather Endpoints</h2>
            <p>Access global weather data with 10-minute updates.</p>
            <pre><code class="language-bash">curl https://api.openweathermap.org/data/4.0/onecall</code></pre>
          </article>
        </div>
        <script>$RC("B:0", "S:0")</script>
      </body>
    </html>
  `;

  const result = convertHtmlToMarkdown(html, 'https://example.com/api', {
    includeFrontmatter: true,
  });

  assert.ok(!result.markdown.includes('Loading skeleton'));
  assert.ok(result.markdown.includes('One Call Weather Endpoints'));
  assert.ok(result.markdown.includes('curl https://api.openweathermap.org/data/4.0/onecall'));
});

test('handles missing selector with clear error', () => {
  const html = '<html><body><div>Test</div></body></html>';
  assert.throws(() => {
    convertHtmlToMarkdown(html, 'https://example.com', {
      mode: 'selector',
      selector: '#non-existent',
    });
  }, /tidak ditemukan/);
});

