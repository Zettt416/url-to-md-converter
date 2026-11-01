# URL to Markdown Converter (API Docs to MD)

Aplikasi web modern, ringan, dan stabil untuk mengonversi halaman web serta dokumentasi API menjadi file Markdown (`.md`) bersih dan terstruktur. Cocok untuk konteks LLM, Obsidian, Notion, atau arsip dokumentasi offline.

## Fitur Utama

- **Ekstraksi Cerdas (Readability)**: Otomatis membersihkan navbar, footer, sidebar navigasi, dan iklan sehingga hanya menyisakan konten dokumentasi esensial.
- **GFM Tables**: Tabel parameter API, query params, headers, dan status code dikonversi utuh dengan format GitHub Flavored Markdown.
- **Fenced Code Blocks**: Mempertahankan tag bahasa pemrograman (`curl`, `bash`, `json`, `javascript`, `python`, dll.).
- **Resolusi Link Relatif**: Link internal dan gambar otomatis diubah menjadi URL absolut yang valid.
- **YAML Frontmatter**: Menyertakan metadata judul dokumen, URL sumber, tanggal konversi, dan deskripsi singkat.
- **Live Render Preview & Raw Editor**: Tampilan split-view untuk melihat hasil rendering dan source code Markdown dengan statistik jumlah kata/karakter/baris.
- **1-Click Copy & Download**: Tombol salin ke clipboard (shortcut `Ctrl+Shift+C`) dan download `.md` dengan penamaan file otomatis yang rapi.
- **Mode Fallback Paste HTML**: Tersedia opsi input kode HTML mentah jika dokumentasi berada di balik intranet atau halaman login.

## Persyaratan Sistem

- Node.js versi 18+ (disarankan Node.js 22 LTS)

## Cara Menjalankan

1. Pasang dependensi (jika belum):
   ```powershell
   npm install
   ```

2. Jalankan server lokal:
   ```powershell
   npm start
   ```

3. Buka browser di:
   [http://localhost:3000](http://localhost:3000)

## Menjalankan Pengujian (Testing)

Proyek ini dilengkapi dengan unit test dan integration test menggunakan native test runner Node.js (`node:test`):

```powershell
npm test
```

## Struktur Proyek

```text
├── converter.js          # Core engine konversi HTML & URL ke Markdown
├── server.js             # Express API server & static server
├── package.json          # Konfigurasi dependensi dan script npm
├── public/
│   ├── index.html        # Antarmuka web ramah developer & aksesibel
│   ├── style.css         # Styling dark theme (OLED, token warna dev tool)
│   └── app.js            # Interaktivitas client, preview renderer, copy & download
└── test/
    ├── converter.test.js # Unit test untuk engine konversi
    └── server.test.js    # Integration test untuk API endpoint & web server
```

