import { convertHtmlToMarkdown } from '../converter.js';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Use POST.'
    });
  }

  const {
    html,
    baseUrl = '',
    mode = 'readability',
    selector = '',
    includeFrontmatter = true
  } = req.body || {};

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

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message || 'Gagal mengonversi HTML ke Markdown.'
    });
  }
}
