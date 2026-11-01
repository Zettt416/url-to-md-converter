# URL to Markdown Converter (API Docs to MD)

Aplikasi web modern, ringan, dan stabil untuk mengonversi halaman web serta dokumentasi API menjadi file Markdown (`.md`) bersih dan terstruktur. Cocok untuk konteks LLM, Obsidian, Notion, atau arsip dokumentasi offline.

## Fitur Utama

- **Ekstraksi Cerdas (Readability)**: Otomatis membersihkan navbar, footer, sidebar navigasi, dan iklan sehingga hanya menyisakan konten dokumentasi esensial.
- **Resolusi React Streaming Suspense**: Mendukung dokumentasi modern berbasis Next.js / RSC (seperti OpenWeatherMap, Mintlify) dengan memproses kontainer streaming dan mengganti placeholder loading secara otomatis.
- **GFM Tables**: Tabel parameter API, query params, headers, dan status code dikonversi utuh dengan format GitHub Flavored Markdown satu baris yang valid dan rapi.
- **Fenced Code Blocks**: Mempertahankan tag bahasa pemrograman (`curl`, `bash`, `json`, `javascript`, `python`, dll.).
- **Resolusi Link Relatif**: Link internal dan gambar otomatis diubah menjadi URL absolut yang valid.
- **YAML Frontmatter**: Menyertakan metadata judul dokumen, URL sumber, tanggal konversi, dan deskripsi singkat.
- **Live Render Preview & Raw Editor**: Tampilan split-view untuk melihat hasil rendering dan source code Markdown dengan statistik jumlah kata/karakter/baris.
- **1-Click Copy & Download**: Tombol salin ke clipboard (shortcut `Ctrl+Shift+C`) dan download `.md` dengan penamaan file otomatis yang rapi.
- **Dukungan Halaman Login / Intranet**: Mendukung input custom header/cookie (`Authorization`, `Cookie`) serta mode fallback **Paste HTML** untuk dokumen internal.

## Persyaratan Sistem

- Node.js versi 18+ (disarankan Node.js 22 LTS)

## Cara Menjalankan Lokal

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

## Deploy ke Vercel

Proyek ini sudah dikonfigurasi penuh untuk Vercel Serverless Function & Edge CDN melalui `vercel.json` dan `api/index.js`.

### Cara 1: Deploy via Vercel Dashboard (Rekomendasi - Cuma 1 Menit)

1. Buka dashboard Vercel kamu:  
   👉 **[https://vercel.com/hardcorez/~/deployments](https://vercel.com/hardcorez/~/deployments)**
2. Klik tombol **"Add New..."** di kanan atas, lalu pilih **"Project"**.
3. Di bagian **"Import Git Repository"**:
   - Cari dan pilih repositori **`url-to-md-converter`** (atau `Zettt416/url-to-md-converter`).
   - Klik tombol **"Import"**.
4. Di halaman **"Configure Project"**:
   - **Framework Preset**: Biarkan **`Other`** (Vercel otomatis mendeteksi konfigurasi `vercel.json`).
   - **Root Directory**: `./` (default).
   - **Build and Output Settings**: Biarkan default / kosong (tidak memerlukan proses build).
   - **Environment Variables**: Tidak ada variabel wajib yang perlu diisi.
5. Klik tombol **"Deploy"**.
6. Tunggu sekitar 15–30 detik. Website langsung aktif secara publik dengan domain Vercel gratis (contoh: `https://url-to-md-converter-hardcorez.vercel.app`).

### Cara 2: Deploy Cepat via Terminal PowerShell (Vercel CLI)

Jika ingin deploy langsung dari terminal tanpa membuka web browser:

```powershell
# Jalankan di folder proyek
npx vercel --prod
```

### Keuntungan di Vercel
- **Auto-Deploy (CI/CD)**: Setiap kali melakukan `git push` ke branch `main`, Vercel otomatis memperbarui website.
- **Edge CDN**: Frontend statis dilayani sangat cepat di seluruh dunia.
- **Serverless**: API konversi berjalan otomatis tanpa perlu menyewa server VPS.

## Menjalankan Pengujian (Testing)

Proyek ini dilengkapi dengan unit test dan integration test menggunakan native test runner Node.js (`node:test`):

```powershell
npm test
```

## Struktur Proyek

```text
├── api/
│   └── index.js          # Adapter serverless Express untuk Vercel
├── converter.js          # Core engine konversi HTML & URL ke Markdown
├── server.js             # Express API server & static server
├── vercel.json           # Konfigurasi routing Vercel
├── package.json          # Konfigurasi dependensi dan script npm
├── public/
│   ├── index.html        # Antarmuka web ramah developer & aksesibel
│   ├── style.css         # Styling dark theme (OLED, token warna dev tool)
│   └── app.js            # Interaktivitas client, preview renderer, copy & download
└── test/
    ├── converter.test.js # Unit test untuk engine konversi
    └── server.test.js    # Integration test untuk API endpoint & web server
```
