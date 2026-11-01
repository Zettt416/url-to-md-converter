# DOCS_TO_MD — URL to Markdown Converter

> Fast, clean, and reliable API documentation extractor and web-to-Markdown converter for LLMs, local knowledge bases (Obsidian, Notion), and offline developer archives.

🌐 **Production URLs**:
- [https://url-to-md-converter-hardcorez.vercel.app/](https://url-to-md-converter-hardcorez.vercel.app/)
- [https://url-to-md-converter.vercel.app/](https://url-to-md-converter.vercel.app/)  
📦 **Repository**: [https://github.com/Zettt416/url-to-md-converter](https://github.com/Zettt416/url-to-md-converter)

---

## 📑 Language / Bahasa

- [English](#-english)
- [Bahasa Indonesia](#-bahasa-indonesia)

---

## 🇬🇧 English

### Overview

**DOCS_TO_MD** is a developer-focused tool designed to convert web pages—especially dense API documentation and developer references—into clean, LLM-ready GitHub Flavored Markdown (GFM). Built with pure-JavaScript DOM parsing via `linkedom`, Mozilla's `Readability`, and customized `turndown` rules, it reliably parses modern single-page apps, resolves React Server Components streaming boundaries, and formats parameter tables neatly without line breaks.

### Key Features

- **Readability Content Extraction**: Automatically strips navigation headers, sidebars, ads, cookie banners, and footers, extracting only the documentation substance.
- **React Streaming Suspense Resolution**: Automatically unhides and swaps Next.js / RSC streaming chunks (`$RC("B:0", "S:0")`) common in modern documentation sites (e.g., OpenWeatherMap, Mintlify).
- **Strict GFM Tables**: API parameters, headers, query strings, and status codes are normalized into strict single-line GitHub Flavored Markdown tables with escaped pipe characters.
- **Preserved Code Blocks**: Detects and retains language tags (`curl`, `bash`, `json`, `python`, `javascript`, `typescript`, `go`, etc.).
- **Absolute URL Resolution**: Rewrites relative links and image paths to canonical absolute URLs.
- **YAML Frontmatter**: Automatically includes metadata (document title, source URL, conversion timestamp, and excerpt).
- **Dual-Pane Data Terminal UI**: Non-slop developer interface built with `Public Sans` and `JetBrains Mono`, featuring live rendered markdown preview, raw editor, and character/word/line counters.
- **Authenticated & Intranet Docs**:
  - Custom header/cookie drawer (`Authorization: Bearer <token>`, `Cookie: session=...`).
  - **Paste HTML** mode for intranet, firewall, or login-walled pages.
- **Zero-Friction Sharing**: 1-click clipboard copy (`Ctrl+Shift+C`) and instant `.md` file download.

### Live Production

The application is deployed on Vercel's global Edge CDN with native serverless endpoints:
👉 **[https://url-to-md-converter.vercel.app/](https://url-to-md-converter.vercel.app/)**

### API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check and server uptime |
| `POST` | `/api/convert` | Converts a remote URL (`{ "url": "https://..." }`) |
| `POST` | `/api/convert-html` | Converts raw HTML (`{ "html": "<article>...", "baseUrl": "..." }`) |

#### Example cURL

```bash
curl -X POST "https://url-to-md-converter.vercel.app/api/convert" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://jsonplaceholder.typicode.com"}'
```

### Local Development

#### Requirements
- Node.js 18+ (Node.js 20 or 22 LTS recommended)

#### Setup & Run
```powershell
# 1. Clone repository
git clone https://github.com/Zettt416/url-to-md-converter.git
cd url-to-md-converter

# 2. Install dependencies
npm install

# 3. Start local development server
npm start
```
Visit `http://localhost:3000` in your browser.

#### Running Tests
Runs native unit and integration tests using `node:test`:
```powershell
npm test
```

---

## 🇮🇩 Bahasa Indonesia

### Gambaran Umum

**DOCS_TO_MD** adalah aplikasi konversi web ke Markdown (`.md`) yang dirancang khusus untuk dokumentasi teknis dan referensi API. Dibangun menggunakan parser DOM pure-JavaScript `linkedom`, Mozilla `Readability`, dan aturan `turndown` yang telah disesuaikan agar menghasilkan format Markdown yang rapi, padat, dan ramah token untuk LLM, Obsidian, Notion, maupun arsip lokal.

### Fitur Utama

- **Ekstraksi Konten Cerdas**: Otomatis membuang navbar, footer, sidebar navigasi, iklan, dan banner persetujuan cookie, menyisakan isi dokumentasi esensial.
- **Resolusi React Streaming Suspense**: Mengatasi dokumentasi modern berbasis Next.js / React Server Components (seperti OpenWeatherMap atau Mintlify) dengan otomatis membuka kontainer streaming dan menggantikan placeholder loading.
- **GFM Tables Rapi & Valid**: Tabel parameter API, query params, headers, dan status code dinormalisasi menjadi satu baris Markdown yang valid tanpa merusak format tabel.
- **Fenced Code Blocks Presisi**: Mempertahankan identifier bahasa pemrograman (`curl`, `bash`, `json`, `python`, `typescript`, dll.).
- **Resolusi URL Absolut**: Link dan gambar relatif otomatis diubah menjadi URL absolut yang valid dan dapat diakses.
- **YAML Frontmatter**: Menyertakan metadata judul, URL sumber, tanggal konversi, dan deskripsi singkat di awal file `.md`.
- **UI Terminal Data Anti-Slop**: Tampilan dual-pane profesional dengan font `Public Sans` & `JetBrains Mono`, visual inspector, editor raw Markdown, serta statistik jumlah kata, karakter, dan baris secara real-time.
- **Dukungan Halaman Login / Intranet**:
  - Drawer Custom Header & Cookie (`Authorization`, `Cookie`, `X-API-Key`).
  - Mode **Paste HTML** untuk mengonversi halaman internal di balik VPN atau login SSO.
- **Salin & Unduh Cepat**: Tombol salin 1-klik (`Ctrl+Shift+C`) dan unduh berkas `.md` dengan penamaan file otomatis.

### Tautan Production

Aplikasi sudah live dan berjalan di jaringan global Vercel Edge CDN:  
👉 **[https://url-to-md-converter.vercel.app/](https://url-to-md-converter.vercel.app/)**

### Endpoint API

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Status server dan uptime |
| `POST` | `/api/convert` | Konversi dari URL publik (`{ "url": "https://..." }`) |
| `POST` | `/api/convert-html` | Konversi dari raw HTML string (`{ "html": "<article>...", "baseUrl": "..." }`) |

### Menjalankan di Lokal

#### Persyaratan
- Node.js versi 18 ke atas (disarankan Node.js 20 atau 22 LTS)

#### Langkah Instalasi
```powershell
# 1. Clone repo
git clone https://github.com/Zettt416/url-to-md-converter.git
cd url-to-md-converter

# 2. Pasang dependensi
npm install

# 3. Jalankan server lokal
npm start
```
Buka peramban di `http://localhost:3000`.

#### Pengujian (Testing)
Jalankan test suite bawaan Node.js:
```powershell
npm test
```

---

## 📂 Struktur Proyek / Project Structure

```text
├── api/
│   ├── convert.js        # Vercel serverless endpoint untuk konversi URL
│   ├── convert-html.js   # Vercel serverless endpoint untuk raw HTML
│   └── health.js         # Endpoint health check
├── converter.js          # Core engine (Linkedom + Readability + Turndown)
├── server.js             # Local development Express server
├── vercel.json           # Konfigurasi routing Vercel Edge CDN
├── index.html            # Antarmuka web data terminal devtools
├── style.css             # Desain styling terminal gelap
├── app.js                # Logika browser client (preview, copy, download)
├── test/
│   ├── converter.test.js # Unit test engine konversi
│   └── server.test.js    # Integration test API & server
└── package.json          # Metadata & dependensi npm
```

---

## 📄 Lisensi / License

[MIT License](LICENSE) © 2026 Zettt416
