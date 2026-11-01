import { convertUrlToMarkdown } from '../converter.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Use POST.'
    });
  }

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

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message || 'Gagal mengonversi URL ke Markdown.'
    });
  }
}
