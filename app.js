// DOCS_TO_MD — Client Workbench Controller
document.addEventListener('DOMContentLoaded', () => {
  // Navigation & Mode Toggles
  const modeTabUrl = document.getElementById('mode-tab-url');
  const modeTabHtml = document.getElementById('mode-tab-html');
  const urlConsoleView = document.getElementById('url-console-view');
  const htmlConsoleView = document.getElementById('html-console-view');

  // Input Elements
  const urlInput = document.getElementById('url-input');
  const pasteBtn = document.getElementById('paste-btn');
  const convertBtn = document.getElementById('convert-btn');
  const htmlInput = document.getElementById('html-input');
  const htmlBaseUrl = document.getElementById('html-base-url');
  const convertHtmlBtn = document.getElementById('convert-html-btn');

  // Options & Headers
  const optFrontmatter = document.getElementById('opt-frontmatter');
  const optMode = document.getElementById('opt-mode');
  const selectorWrapper = document.getElementById('selector-wrapper');
  const optSelector = document.getElementById('opt-selector');
  const toggleAuthBtn = document.getElementById('toggle-auth-btn');
  const authHeadersDrawer = document.getElementById('auth-headers-drawer');
  const optHeaders = document.getElementById('opt-headers');

  // Status & Error
  const errorBanner = document.getElementById('error-banner');
  const errorMessage = document.getElementById('error-message');
  const closeErrorBtn = document.getElementById('close-error-btn');
  const toast = document.getElementById('toast');

  // Workbench Panes & Actions
  const previewOutput = document.getElementById('preview-output');
  const rawMarkdownOutput = document.getElementById('raw-markdown-output');
  const docTitleBadge = document.getElementById('doc-title-badge');
  const statWordsBadge = document.getElementById('stat-words-badge');
  const statSizeBadge = document.getElementById('stat-size-badge');
  const copyBtn = document.getElementById('copy-btn');
  const copyBtnText = document.getElementById('copy-btn-text');
  const downloadBtn = document.getElementById('download-btn');

  let currentMarkdown = '';
  let currentTitle = 'documentation';

  // Initialize marked configuration
  if (window.marked) {
    window.marked.setOptions({
      gfm: true,
      breaks: false,
    });
  }

  // Toast Helper
  function showToast(message, duration = 2500) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, duration);
  }

  // Error Banner Helpers
  function showError(msg) {
    errorMessage.textContent = msg;
    errorBanner.classList.remove('hidden');
    errorBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function clearError() {
    errorBanner.classList.add('hidden');
  }

  closeErrorBtn.addEventListener('click', clearError);

  // Mode Tabs Switcher
  modeTabUrl.addEventListener('click', () => {
    modeTabUrl.classList.add('active');
    modeTabUrl.setAttribute('aria-selected', 'true');
    modeTabHtml.classList.remove('active');
    modeTabHtml.setAttribute('aria-selected', 'false');

    urlConsoleView.classList.remove('hidden');
    htmlConsoleView.classList.add('hidden');
    urlInput.focus();
  });

  modeTabHtml.addEventListener('click', () => {
    modeTabHtml.classList.add('active');
    modeTabHtml.setAttribute('aria-selected', 'true');
    modeTabUrl.classList.remove('active');
    modeTabUrl.setAttribute('aria-selected', 'false');

    htmlConsoleView.classList.remove('hidden');
    urlConsoleView.classList.add('hidden');
    htmlInput.focus();
  });

  // Toggle Mode (Readability vs Selector vs Full)
  optMode.addEventListener('change', () => {
    if (optMode.value === 'selector') {
      selectorWrapper.classList.remove('hidden');
      optSelector.focus();
    } else {
      selectorWrapper.classList.add('hidden');
    }
  });

  // Toggle Auth Headers Drawer
  toggleAuthBtn.addEventListener('click', () => {
    const isHidden = authHeadersDrawer.classList.toggle('hidden');
    toggleAuthBtn.setAttribute('aria-expanded', String(!isHidden));
    if (!isHidden) {
      optHeaders.focus();
    }
  });

  // Helper: Parse Key-Value Headers
  function parseCustomHeaders(rawText) {
    const headers = {};
    if (!rawText || !rawText.trim()) return headers;
    const lines = rawText.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx > 0) {
        const key = trimmed.slice(0, colonIdx).trim();
        const val = trimmed.slice(colonIdx + 1).trim();
        if (key && val) {
          headers[key] = val;
        }
      }
    }
    return headers;
  }

  // Paste Action
  if (navigator.clipboard && navigator.clipboard.readText) {
    pasteBtn.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          urlInput.value = text.trim();
          urlInput.focus();
        }
      } catch {
        showToast('Clipboard access unavailable. Use manual paste.');
      }
    });
  } else {
    pasteBtn.classList.add('hidden');
  }

  // Presets Quick Links
  document.querySelectorAll('.preset-link').forEach(link => {
    link.addEventListener('click', () => {
      const target = link.getAttribute('data-url');
      if (target) {
        urlInput.value = target;
        // Switch to URL mode if on HTML
        if (!modeTabUrl.classList.contains('active')) {
          modeTabUrl.click();
        }
        triggerUrlConvert();
      }
    });
  });

  // Update Display
  function displayResult(data) {
    currentMarkdown = data.markdown || '';
    currentTitle = data.title || 'api-documentation';

    // Format file size
    const bytes = new Blob([currentMarkdown]).size;
    const kb = (bytes / 1024).toFixed(1);

    docTitleBadge.textContent = currentTitle;
    statWordsBadge.textContent = `${data.stats?.wordCount || 0} words · ${data.stats?.lineCount || 0} lines`;
    statSizeBadge.textContent = `${kb} KB`;

    rawMarkdownOutput.value = currentMarkdown;

    // Render Preview
    if (window.marked) {
      try {
        // Strip YAML frontmatter from visual document render
        const docBody = currentMarkdown.replace(/^---[\s\S]*?---\n*/, '');
        previewOutput.innerHTML = window.marked.parse(docBody);
      } catch {
        previewOutput.innerHTML = `<pre><code>${escapeHtml(currentMarkdown)}</code></pre>`;
      }
    } else {
      previewOutput.innerHTML = `<pre><code>${escapeHtml(currentMarkdown)}</code></pre>`;
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Execute URL Conversion
  async function triggerUrlConvert() {
    const url = urlInput.value.trim();
    if (!url) {
      showError('Target URL is required.');
      urlInput.focus();
      return;
    }

    clearError();
    convertBtn.classList.add('is-loading');
    convertBtn.disabled = true;

    try {
      const customHeaders = parseCustomHeaders(optHeaders.value);
      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          mode: optMode.value,
          selector: optSelector.value.trim(),
          includeFrontmatter: optFrontmatter.checked,
          headers: customHeaders
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || `HTTP ${res.status}`);
      }

      displayResult(json.data);
      showToast('Document converted successfully');
    } catch (err) {
      showError(`Error: ${err.message}`);
    } finally {
      convertBtn.classList.remove('is-loading');
      convertBtn.disabled = false;
    }
  }

  // Execute Raw HTML Conversion
  async function triggerHtmlConvert() {
    const html = htmlInput.value.trim();
    if (!html) {
      showError('Raw HTML content is required.');
      htmlInput.focus();
      return;
    }

    clearError();
    convertHtmlBtn.classList.add('is-loading');
    convertHtmlBtn.disabled = true;

    try {
      const res = await fetch('/api/convert-html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html,
          baseUrl: htmlBaseUrl.value.trim(),
          mode: optMode.value,
          selector: optSelector.value.trim(),
          includeFrontmatter: optFrontmatter.checked
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || `HTTP ${res.status}`);
      }

      displayResult(json.data);
      showToast('HTML converted successfully');
    } catch (err) {
      showError(`Error: ${err.message}`);
    } finally {
      convertHtmlBtn.classList.remove('is-loading');
      convertHtmlBtn.disabled = false;
    }
  }

  convertBtn.addEventListener('click', triggerUrlConvert);
  convertHtmlBtn.addEventListener('click', triggerHtmlConvert);

  // Keyboard Shortcuts
  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      triggerUrlConvert();
    }
  });

  document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+C: Copy Markdown
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
      if (currentMarkdown) {
        e.preventDefault();
        copyMarkdownToClipboard();
      }
    }
  });

  // Copy Markdown
  async function copyMarkdownToClipboard() {
    if (!currentMarkdown) return;
    try {
      await navigator.clipboard.writeText(currentMarkdown);
      const originalText = copyBtnText.textContent;
      copyBtnText.textContent = 'Copied!';
      showToast('Markdown copied to clipboard');
      setTimeout(() => {
        copyBtnText.textContent = originalText;
      }, 1800);
    } catch {
      rawMarkdownOutput.select();
      document.execCommand('copy');
      showToast('Copied to clipboard');
    }
  }

  copyBtn.addEventListener('click', copyMarkdownToClipboard);

  // Download File
  downloadBtn.addEventListener('click', () => {
    if (!currentMarkdown) return;

    const safeTitle = currentTitle
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'api-documentation';
    const filename = `${safeTitle}.md`;

    const blob = new Blob([currentMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Downloaded ${filename}`);
  });
});
