import { convertUrlToMarkdown } from '../converter.js';

async function parseRequestBody(req) {
  if (typeof req.json === 'function') {
    try { return await req.json(); } catch { return {}; }
  }
  if (req.body && typeof req.body === 'object' && !('getReader' in req.body)) {
    return req.body;
  }
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  if (typeof req.on === 'function') {
    return new Promise((resolve) => {
      let data = '';
      req.on('data', chunk => { data += chunk; });
      req.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { resolve({}); }
      });
      req.on('error', () => resolve({}));
    });
  }
  return {};
}

function sendResponse(res, statusCode, body) {
  const jsonStr = JSON.stringify(body);
  if (res && typeof res.setHeader === 'function') {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(jsonStr);
    return;
  }
  return new Response(jsonStr, {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' }
  });
}

export default async function handler(req, res) {
  const method = req.method || (req.headers && req.headers['x-http-method']);
  if (method && method.toUpperCase() !== 'POST') {
    return sendResponse(res, 405, {
      success: false,
      error: 'Method Not Allowed. Use POST.'
    });
  }

  const payload = await parseRequestBody(req);
  const {
    url,
    mode = 'readability',
    selector = '',
    includeFrontmatter = true,
    headers = {}
  } = payload || {};

  if (!url || typeof url !== 'string' || !url.trim()) {
    return sendResponse(res, 400, {
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

    return sendResponse(res, 200, {
      success: true,
      data: result
    });
  } catch (err) {
    return sendResponse(res, 400, {
      success: false,
      error: err.message || 'Gagal mengonversi URL ke Markdown.'
    });
  }
}
