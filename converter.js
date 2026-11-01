import { parseHTML } from 'linkedom';
import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

/**
 * Configure Turndown service with GFM and customized rules for developer documentation
 */
export function createTurndownService() {
  const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '_',
    strongDelimiter: '**',
  });

  // Enable GitHub Flavored Markdown (tables, strikethrough, task lists)
  turndown.use(gfm);

  // Clean table cells: ensure single-line cells and properly escaped pipes for valid GFM tables
  turndown.addRule('cleanTableCell', {
    filter: ['th', 'td'],
    replacement: function (content, node) {
      const clean = content
        .replace(/[\r\n]+/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
      const escaped = clean.replace(/(?<!\\)\|/g, '\\|');
      const parent = node.parentNode;
      const index = Array.prototype.indexOf.call(parent.children, node);
      const prefix = index === 0 ? '| ' : ' ';
      return prefix + (escaped || ' ') + ' |';
    }
  });

  // Custom rule: Preserve language tag in fenced code blocks
  turndown.addRule('fencedCodeBlockWithLang', {
    filter: function (node, options) {
      return (
        node.nodeName === 'PRE' &&
        (node.querySelector('code') !== null || Boolean(node.textContent))
      );
    },
    replacement: function (content, node) {
      const codeNode = node.querySelector('code') || node;
      const dataLang = codeNode.getAttribute('data-language') || node.getAttribute('data-language') || '';
      const classAttr = (codeNode.getAttribute('class') || '') + ' ' + (node.getAttribute('class') || '');
      
      // Match common patterns: language-js, lang-python, highlight-source-json, or direct language class name
      const match = classAttr.match(/(?:language|lang|highlight[_-]source)[_-]([a-zA-Z0-9_+-]+)/i) ||
                    classAttr.match(/\b(json|javascript|js|typescript|ts|python|py|bash|sh|shell|curl|html|css|sql|ruby|go|rust|php|java|c|cpp|csharp|yaml|yml|http)\b/i);
      const language = dataLang || (match ? match[1].toLowerCase() : '');
      
      const codeText = codeNode.textContent || node.textContent || '';
      const trimmed = codeText.replace(/\r\n/g, '\n').replace(/^\n+|\n+$/g, '');
      return `\n\n\`\`\`${language}\n${trimmed}\n\`\`\`\n\n`;
    }
  });

  // Ignore useless elements like script, style, noscript, svg
  turndown.remove(['script', 'style', 'noscript', 'iframe']);

  return turndown;
}

/**
 * Resolve relative links and images against the base URL
 */
function resolveRelativeUrls(document, baseUrl) {
  if (!baseUrl) return;

  const links = document.querySelectorAll('a[href]');
  links.forEach(a => {
    try {
      const href = a.getAttribute('href');
      if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('javascript:')) {
        a.setAttribute('href', new URL(href, baseUrl).href);
      }
    } catch {
      // Ignore malformed URLs
    }
  });

  const images = document.querySelectorAll('img[src]');
  images.forEach(img => {
    try {
      const src = img.getAttribute('src');
      if (src && !src.startsWith('data:')) {
        img.setAttribute('src', new URL(src, baseUrl).href);
      }
    } catch {
      // Ignore malformed URLs
    }
  });
}

/**
 * Resolves React Server Components / Next.js Streaming Suspense boundaries.
 * Modern frameworks stream async content into hidden containers (e.g. <div hidden id="S:0">)
 * and use inline scripts like $RC("B:0", "S:0") or $RS("B:0", "S:0") to swap them.
 * Without running client JS, standard parsers only see the "Loading..." fallback.
 */
function resolveReactStreamingSuspense(document) {
  const scripts = Array.from(document.querySelectorAll('script'));
  for (const script of scripts) {
    const text = script.textContent || '';
    const matches = text.matchAll(/\$R[CS]\s*\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*\)/g);
    for (const m of matches) {
      const boundaryId = m[1];
      const sourceId = m[2];
      const boundary = document.getElementById(boundaryId) || document.querySelector(`[id="${boundaryId}"]`);
      const source = document.getElementById(sourceId);
      if (boundary && source) {
        source.removeAttribute('hidden');
        boundary.replaceWith(...source.childNodes);
        source.remove();
      }
    }
  }

  // Unhide any remaining streamed containers so Readability doesn't discard them
  document.querySelectorAll('[id^="S:"], [id^="s:"]').forEach(el => {
    el.removeAttribute('hidden');
  });
}

/**
 * Convert HTML string to Markdown
 */
export function convertHtmlToMarkdown(html, baseUrl, options = {}) {
  const {
    mode = 'readability', // 'readability' | 'full' | 'selector'
    selector = '',
    includeFrontmatter = true,
  } = options;

  const { document } = parseHTML(html);

  // Resolve relative links so exported docs are self-contained
  if (baseUrl) {
    resolveRelativeUrls(document, baseUrl);
  }

  // Resolve Next.js / React streaming SSR (e.g. OpenWeatherMap, Mintlify, modern docs)
  resolveReactStreamingSuspense(document);

  // Normalize table cells so block elements don't break GFM tables
  document.querySelectorAll('th, td').forEach(cell => {
    cell.querySelectorAll('p, div').forEach(p => {
      p.insertAdjacentHTML('afterend', ' ');
    });
  });

  let title = document.title ? document.title.trim() : '';
  if (!title) {
    const h1 = document.querySelector('h1');
    if (h1 && h1.textContent.trim()) {
      title = h1.textContent.trim();
    }
  }
  if (!title) {
    title = 'Untitled Document';
  }
  let contentHtml = '';
  let excerpt = '';
  let byline = '';
  let siteName = '';

  if (mode === 'selector' && selector) {
    const selectedEl = document.querySelector(selector);
    if (!selectedEl) {
      throw new Error(`Elemen dengan selector "${selector}" tidak ditemukan pada halaman.`);
    }
    contentHtml = selectedEl.innerHTML;
  } else if (mode === 'readability') {
    // Preserve language information on code blocks before Readability cleans them
    document.querySelectorAll('pre, code').forEach(el => {
      const cls = el.getAttribute('class') || '';
      const match = cls.match(/(?:language|lang|highlight[_-]source)[_-]([a-zA-Z0-9_+-]+)/i) ||
                    cls.match(/\b(json|javascript|js|typescript|ts|python|py|bash|sh|shell|curl|html|css|sql|ruby|go|rust|php|java|c|cpp|csharp|yaml|yml|http)\b/i);
      if (match) {
        el.setAttribute('data-language', match[1].toLowerCase());
      }
    });

    // Pass classesToPreserve so Readability does not strip language classes
    const classesToPreserve = [];
    document.querySelectorAll('[class]').forEach(el => {
      const classes = el.getAttribute('class').split(/\s+/);
      classes.forEach(c => {
        if (/^(?:language|lang|highlight)[_-]/i.test(c)) {
          classesToPreserve.push(c);
        }
      });
    });

    const reader = new Readability(document, {
      classesToPreserve: Array.from(new Set(classesToPreserve))
    });
    const article = reader.parse();

    if (article && article.content) {
      title = article.title || title;
      contentHtml = article.content;
      excerpt = article.excerpt || '';
      byline = article.byline || '';
      siteName = article.siteName || '';
    } else {
      // Fallback if Readability cannot extract article (e.g. non-article structure)
      const mainEl = document.querySelector('main, article, [role="main"], #content, .content, body');
      contentHtml = mainEl ? mainEl.innerHTML : document.body.innerHTML;
    }
  } else {
    // Mode 'full'
    const mainEl = document.querySelector('main, article, [role="main"], body');
    contentHtml = mainEl ? mainEl.innerHTML : document.body.innerHTML;
  }

  const turndown = createTurndownService();
  let markdown = turndown.turndown(contentHtml);

  // Normalize duplicate blank lines
  markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();

  // Prepend frontmatter if requested
  if (includeFrontmatter) {
    const frontmatterLines = ['---'];
    frontmatterLines.push(`title: "${title.replace(/"/g, '\\"')}"`);
    if (baseUrl) {
      frontmatterLines.push(`source: "${baseUrl}"`);
    }
    frontmatterLines.push(`converted: "${new Date().toISOString()}"`);
    if (siteName) {
      frontmatterLines.push(`site: "${siteName.replace(/"/g, '\\"')}"`);
    }
    if (byline) {
      frontmatterLines.push(`author: "${byline.replace(/"/g, '\\"')}"`);
    }
    if (excerpt) {
      frontmatterLines.push(`description: "${excerpt.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`);
    }
    frontmatterLines.push('---', '');
    markdown = `${frontmatterLines.join('\n')}\n${markdown}`;
  }

  return {
    title,
    markdown,
    excerpt,
    byline,
    siteName,
    url: baseUrl,
    stats: {
      charCount: markdown.length,
      wordCount: markdown.trim().split(/\s+/).filter(Boolean).length,
      lineCount: markdown.split('\n').length
    }
  };
}

/**
 * Fetch a URL and convert its content to Markdown
 */
export async function convertUrlToMarkdown(targetUrl, options = {}) {
  const {
    headers: customHeaders = {},
    mode = 'readability',
    selector = '',
    includeFrontmatter = true,
  } = options;

  // Validate URL
  let parsedUrl;
  try {
    parsedUrl = new URL(targetUrl);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Protokol URL harus berupa http atau https.');
    }
  } catch (err) {
    throw new Error(`URL tidak valid: ${err.message}`);
  }

  // Fetch with realistic headers and 15s timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  let response;
  try {
    const requestHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
      'Cache-Control': 'no-cache',
      ...customHeaders
    };

    response = await fetch(parsedUrl.href, {
      signal: controller.signal,
      headers: requestHeaders,
      redirect: 'follow',
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timeout (lebih dari 15 detik). Website mungkin sedang lambat atau memblokir bot.');
    }
    throw new Error(`Gagal menghubungi server URL: ${err.message}`);
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(`Website merespons status error HTTP ${response.status} (${response.statusText}).`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
    // If it's already plain text or markdown or json
    const rawText = await response.text();
    if (contentType.includes('application/json')) {
      const formattedJson = '```json\n' + JSON.stringify(JSON.parse(rawText), null, 2) + '\n```';
      return {
        title: parsedUrl.pathname.split('/').pop() || 'API Response',
        markdown: `# API Response\n\nSource: ${parsedUrl.href}\n\n${formattedJson}`,
        url: parsedUrl.href,
        stats: {
          charCount: formattedJson.length,
          wordCount: formattedJson.split(/\s+/).length,
          lineCount: formattedJson.split('\n').length
        }
      };
    }
  }

  const html = await response.text();
  return convertHtmlToMarkdown(html, response.url || parsedUrl.href, options);
}
