# Panduan Deploy ke Vercel

Panduan langkah-demi-langkah untuk melakukan deploy website **URL to Markdown Converter** ke akun Vercel kamu di [https://vercel.com/hardcorez/~/deployments](https://vercel.com/hardcorez/~/deployments).

---

## ⚡ Cara 1: Deploy Otomatis via Vercel Dashboard (Rekomendasi - Cuma 1 Menit)

Karena repositori proyek ini sudah berada di GitHub (`Zettt416/url-to-md-converter`), kamu bisa langsung menghubungkannya dari dashboard Vercel:

1. Buka dashboard Vercel kamu:  
   👉 **[https://vercel.com/hardcorez/~/deployments](https://vercel.com/hardcorez/~/deployments)**
2. Klik tombol **"Add New..."** di kanan atas, lalu pilih **"Project"**.
3. Di bagian **"Import Git Repository"**:
   - Cari repositori **`url-to-md-converter`** (atau `Zettt416/url-to-md-converter`).
   - Klik tombol **"Import"**.
4. Di halaman **"Configure Project"**:
   - **Project Name**: `url-to-md-converter` (atau sesuai keinginan).
   - **Framework Preset**: Biarkan **`Other`** (Vercel otomatis mendeteksi konfigurasi `vercel.json` yang sudah kita siapkan).
   - **Root Directory**: `./` (default).
   - **Build and Output Settings**: Biarkan default / kosong (tidak memerlukan proses compile/build yang rumit).
   - **Environment Variables**: Tidak ada variabel wajib yang perlu diisi.
5. Klik tombol **"Deploy"**.
6. Tunggu sekitar 15–30 detik. Saat animasi confetti muncul, website kamu sudah aktif secara publik di domain Vercel (contoh: `https://url-to-md-converter-hardcorez.vercel.app`)! 🎉

---

## 💻 Cara 2: Deploy Cepat via Terminal PowerShell (Vercel CLI)

Jika ingin deploy langsung dari terminal tanpa membuka web browser:

1. Buka terminal PowerShell di folder proyek ini:
   ```powershell
   npx vercel
   ```
2. Ikuti instruksi di layar:
   - *Log in to Vercel*: Pilih login via browser atau GitHub (masuk sebagai akun `hardcorez`).
   - *Set up and deploy?*: Ketik `Y` lalu Enter.
   - *Which scope?*: Pilih akun `hardcorez`.
   - *Link to existing project?*: Ketik `N`.
   - *What's your project's name?*: Tekan Enter (pakai default `url-to-md-converter`).
   - *In which directory is your code located?*: Tekan Enter (`./`).
3. Untuk langsung mempublikasikan ke domain utama (Production):
   ```powershell
   npx vercel --prod
   ```

---

## 🔄 Keuntungan Setelah Terhubung ke Vercel

1. **Auto-Deploy (CI/CD)**: Setiap kali kamu melakukan `git push` ke branch `main`, Vercel akan otomatis meng-update websitemu dalam hitungan detik.
2. **Edge CDN Global**: Halaman frontend (`index.html`, `style.css`, `app.js`) dilayani oleh CDN Vercel yang tersebar di seluruh dunia sehingga loading web sangat cepat.
3. **Serverless Node.js**: Endpoint API konversi (`/api/convert` dan `/api/convert-html`) berjalan otomatis di atas infrastruktur Vercel Serverless Function yang auto-scale sesuai kebutuhan.

---

## ⚙️ Berkas Konfigurasi Vercel yang Sudah Disiapkan

- **`vercel.json`**: Mengarahkan routing `/api/*` ke serverless function dan `/` ke folder `public/`.
- **`api/index.js`**: Adapter serverless yang menghubungkan Express app ke runtime Vercel.
- **`server.js`**: Sudah disesuaikan agar berjalan lokal saat `npm start` dan berjalan serverless saat di Vercel (`process.env.VERCEL`).
