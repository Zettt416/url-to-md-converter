import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { convertUrlToMarkdown, convertHtmlToMarkdown } from './converter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Serve static frontend assets from root and public
app.use(express.static(__dirname));
if (path.join(__dirname, 'public')) {
  app.use(express.static(path.join(__dirname, 'public')));
}

// Convert from URL
app.post('/api/convert', async (req, res) => {
  const {
    url,
    mode = 'readability',
    selector = '',
    includeFrontmatter = true,
    headers = {}
  } = req.body || {};

  if (!url || typeof url !== 'string' || !url.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Parameter "url" wajib diisi.'
    });
  }

  try {
    const result = await convertUrlToMarkdown(url.trim(), {
      mode,
      selector: selector ? selector.trim() : '',
      includeFrontmatter: Boolean(includeFrontmatter),
      headers: typeof headers === 'object' && headers !== null ? headers : {}
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message || 'Gagal mengonversi URL ke Markdown.'
    });
  }
});

// Convert from raw HTML string
app.post('/api/convert-html', (req, res) => {
  const { html, baseUrl = '', mode = 'readability', selector = '', includeFrontmatter = true } = req.body || {};

  if (!html || typeof html !== 'string' || !html.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Parameter "html" wajib diisi.'
    });
  }

  try {
    const result = convertHtmlToMarkdown(html, baseUrl.trim(), {
      mode,
      selector: selector ? selector.trim() : '',
      includeFrontmatter: Boolean(includeFrontmatter)
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message || 'Gagal mengonversi HTML ke Markdown.'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Fallback to index.html for any unmatched route
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server locally (skip if running in Vercel Serverless environment)
if (!process.env.VERCEL) {
  const HOST = '0.0.0.0';
  app.listen(PORT, HOST, () => {
    console.log(`\n🚀 URL to Markdown Converter berjalan di:`);
    console.log(`   - Local:   http://localhost:${PORT}`);
    console.log(`   - IPv4:    http://127.0.0.1:${PORT}`);
    console.log(`Tekan Ctrl+C untuk menghentikan server.\n`);
  });
}

export default app;
