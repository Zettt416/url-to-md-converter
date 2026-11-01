// URL to Markdown Converter Client Logic
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const urlInput = document.getElementById('url-input');
  const pasteBtn = document.getElementById('paste-btn');
  const convertBtn = document.getElementById('convert-btn');
  const toggleInputModeBtn = document.getElementById('toggle-input-mode-btn');
  const inputModeLabel = document.getElementById('input-mode-label');
  const urlInputSection = document.getElementById('url-input-section');
  const htmlInputSection = document.getElementById('html-input-section');
  const htmlInput = document.getElementById('html-input');
  const htmlBaseUrl = document.getElementById('html-base-url');
  const convertHtmlBtn = document.getElementById('convert-html-btn');

  const optFrontmatter = document.getElementById('opt-frontmatter');
  const optMode = document.getElementById('opt-mode');
  const selectorWrapper = document.getElementById('selector-wrapper');
  const optSelector = document.getElementById('opt-selector');
  const toggleAuthBtn = document.getElementById('toggle-auth-btn');
  const authHeadersDrawer = document.getElementById('auth-headers-drawer');
  const optHeaders = document.getElementById('opt-headers');

  const errorBanner = document.getElementById('error-banner');
  const errorMessage = document.getElementById('error-message');
  const closeErrorBtn = document.getElementById('close-error-btn');

  const emptyState = document.getElementById('empty-state');
  const resultSection = document.getElementById('result-section');
  const resultTitle = document.getElementById('result-title');
  const statWords = document.getElementById('stat-words');
  const statChars = document.getElementById('stat-chars');
  const statLines = document.getElementById('stat-lines');

  const tabPreview = document.getElementById('tab-preview');
  const tabRaw = document.getElementById('tab-raw');
  const panePreview = document.getElementById('pane-preview');
  const paneRaw = document.getElementById('pane-raw');
  const previewOutput = document.getElementById('preview-output');
  const rawMarkdownOutput = document.getElementById('raw-markdown-output');

  const copyBtn = document.getElementById('copy-btn');
  const copyBtnText = document.getElementById('copy-btn-text');
  const downloadBtn = document.getElementById('download-btn');
  const toast = document.getElementById('toast');

  let currentMarkdown = '';
  let currentTitle = 'documentation';
  let isRawHtmlMode = false;

  // Initialize marked configuration if present
  if (window.marked) {
    window.marked.setOptions({
      gfm: true,
      breaks: false,
    });
  }

  // Helper: Show Toast
  function showToast(message, duration = 3000) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, duration);
  }

  // Helper: Show Error
  function showError(msg) {
    errorMessage.textContent = msg;
    errorBanner.classList.remove('hidden');
    errorBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Helper: Clear Error
  function clearError() {
    errorBanner.classList.add('hidden');
  }

  closeErrorBtn.addEventListener('click', clearError);

  // Toggle Auth / Custom Headers Drawer
  toggleAuthBtn.addEventListener('click', () => {
    authHeadersDrawer.classList.toggle('hidden');
    if (!authHeadersDrawer.classList.contains('hidden')) {
      optHeaders.focus();
    }
  });

  // Helper: Parse Key-Value Headers from Textarea
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

  // Toggle Mode (Readability vs Selector vs Full)
  optMode.addEventListener('change', () => {
    if (optMode.value === 'selector') {
      selectorWrapper.classList.remove('hidden');
      optSelector.focus();
    } else {
      selectorWrapper.classList.add('hidden');
    }
  });

  // Toggle URL mode vs Raw HTML mode
  toggleInputModeBtn.addEventListener('click', () => {
    isRawHtmlMode = !isRawHtmlMode;
    if (isRawHtmlMode) {
      inputModeLabel.textContent = 'Mode: Paste HTML';
      urlInputSection.classList.add('hidden');
      htmlInputSection.classList.remove('hidden');
      htmlInput.focus();
    } else {
      inputModeLabel.textContent = 'Mode: URL';
      htmlInputSection.classList.add('hidden');
      urlInputSection.classList.remove('hidden');
      urlInput.focus();
    }
  });

  // Paste button action
  if (navigator.clipboard && navigator.clipboard.readText) {
    pasteBtn.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          urlInput.value = text.trim();
          urlInput.focus();
        }
      } catch {
        showToast('Gagal mengakses clipboard. Silakan gunakan Ctrl+V manual.');
      }
    });
  } else {
    pasteBtn.classList.add('hidden');
  }

  // Sample quick chips
  document.querySelectorAll('.sample-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const sampleUrl = chip.getAttribute('data-url');
      if (sampleUrl) {
        urlInput.value = sampleUrl;
        triggerUrlConvert();
      }
    });
  });

  // Tabs Switcher (Preview vs Raw)
  tabPreview.addEventListener('click', () => {
    tabPreview.classList.add('active');
    tabPreview.setAttribute('aria-selected', 'true');
    tabRaw.classList.remove('active');
    tabRaw.setAttribute('aria-selected', 'false');

    panePreview.classList.add('active');
    paneRaw.classList.remove('active');
  });

  tabRaw.addEventListener('click', () => {
    tabRaw.classList.add('active');
    tabRaw.setAttribute('aria-selected', 'true');
    tabPreview.classList.remove('active');
    tabPreview.setAttribute('aria-selected', 'false');

    paneRaw.classList.add('active');
    panePreview.classList.remove('active');
  });

  // Render Result to UI
  function displayResult(data) {
    currentMarkdown = data.markdown || '';
    currentTitle = data.title || 'api-documentation';

    resultTitle.textContent = currentTitle;
    statWords.textContent = `${data.stats?.wordCount || 0} kata`;
    statChars.textContent = `${data.stats?.charCount || 0} karakter`;
    statLines.textContent = `${data.stats?.lineCount || 0} baris`;

    rawMarkdownOutput.value = currentMarkdown;

    // Render Preview
    if (window.marked) {
      try {
        // Strip frontmatter from preview so rendered document looks clean
        const contentWithoutFrontmatter = currentMarkdown.replace(/^---[\s\S]*?---\n*/, '');
        previewOutput.innerHTML = window.marked.parse(contentWithoutFrontmatter);
      } catch {
        previewOutput.innerHTML = `<pre><code>${escapeHtml(currentMarkdown)}</code></pre>`;
      }
    } else {
      previewOutput.innerHTML = `<pre><code>${escapeHtml(currentMarkdown)}</code></pre>`;
    }

    emptyState.classList.add('hidden');
    resultSection.classList.remove('hidden');
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Trigger URL Convert
  async function triggerUrlConvert() {
    const url = urlInput.value.trim();
    if (!url) {
      showError('Silakan masukkan URL dokumentasi API terlebih dahulu.');
      urlInput.focus();
      return;
    }

    clearError();
    convertBtn.classList.add('is-loading');
    convertBtn.disabled = true;

    try {
      const customHeaders = parseCustomHeaders(optHeaders ? optHeaders.value : '');

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
      showToast('Berhasil dikonversi ke Markdown!');
    } catch (err) {
      showError(`Gagal: ${err.message}`);
    } finally {
      convertBtn.classList.remove('is-loading');
      convertBtn.disabled = false;
    }
  }

  // Trigger HTML Convert
  async function triggerHtmlConvert() {
    const html = htmlInput.value.trim();
    if (!html) {
      showError('Silakan tempel kode HTML terlebih dahulu.');
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
      showToast('Berhasil dikonversi dari HTML!');
    } catch (err) {
      showError(`Gagal: ${err.message}`);
    } finally {
      convertHtmlBtn.classList.remove('is-loading');
      convertHtmlBtn.disabled = false;
    }
  }

  convertBtn.addEventListener('click', triggerUrlConvert);
  convertHtmlBtn.addEventListener('click', triggerHtmlConvert);

  // Keydown shortcuts
  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      triggerUrlConvert();
    }
  });

  document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+C to copy markdown
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
      showToast('Markdown berhasil disalin ke clipboard!');
      setTimeout(() => {
        copyBtnText.textContent = originalText;
      }, 2000);
    } catch {
      rawMarkdownOutput.select();
      document.execCommand('copy');
      showToast('Disalin ke clipboard!');
    }
  }

  copyBtn.addEventListener('click', copyMarkdownToClipboard);

  // Download .md File
  downloadBtn.addEventListener('click', () => {
    if (!currentMarkdown) return;

    // Generate safe filename
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

    showToast(`File ${filename} berhasil diunduh!`);
  });
});

