# Arsip Digital System

Sistem Manajemen Arsip Digital yang dibangun menggunakan Next.js (Frontend & Auth) dan Google Apps Script (sebagai Database Spreadsheet & penyimpanan Google Drive).

## Panduan Instalasi & Deployment

Untuk menjalankan aplikasi ini di komputer lokal (localhost) atau men-deploy-nya ke server produksi (misalnya Vercel), Anda perlu menyiapkan 2 sistem Google terlebih dahulu: **Google Apps Script** (untuk database) dan **Google Cloud Console** (untuk Login).

---

### Langkah 1: Setup Database (Google Apps Script & Spreadsheet)

Aplikasi ini menggunakan Google Spreadsheet sebagai database gratis dan Google Drive sebagai tempat penyimpanan file fisik arsip.

1. Buka [Google Sheets](https://sheets.google.com) dan buat dokumen kosong baru.
2. Di menu atas, klik **Extensions (Ekstensi) > Apps Script**.
3. Hapus semua kode default `function myFunction() {}` yang ada di editor.
4. Buka folder `google-apps-script` di project ini, salin seluruh isi file `Code.gs`, lalu **paste** ke editor Apps Script tersebut.
5. Jalankan fungsi inisialisasi:
   - Di bagian atas (sebelah tombol "Run/Jalankan"), pilih fungsi **`testAuthorization`** dari dropdown.
   - Klik **Run (Jalankan)**.
   - Google akan meminta izin akses **(Authorization Required)**.
   - Klik **Review Permissions** $\rightarrow$ Pilih akun Google Anda $\rightarrow$ Klik **Advanced (Lanjutan)** $\rightarrow$ Klik **Go to project (unsafe)** $\rightarrow$ Klik **Allow (Izinkan)**.
6. Deploy Script sebagai API:
   - Di pojok kanan atas, klik tombol biru **Deploy > New deployment**.
   - Klik icon roda gigi (⚙️) di sebelah "Select type", centang **Web app**.
   - Isi form:
     - Description: `Arsip API v1`
     - Web app $\rightarrow$ Execute as: **Me (email Anda)**
     - Web app $\rightarrow$ Who has access: **Anyone** (⚠️ Sangat Penting)
   - Klik **Deploy**.
   - Salin URL panjang di bagian **Web app URL**. Simpan URL ini untuk nanti kita masukkan ke `APPS_SCRIPT_URL`.

---

### Langkah 2: Setup Login (Google Cloud Console)

Aplikasi ini menggunakan sistem *Sign in with Google*.

1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Buat Project baru (misal: "Arsip Digital Auth").
3. Buka menu navigasi kiri $\rightarrow$ **APIs & Services $\rightarrow$ OAuth consent screen**.
   - Pilih **External**, lalu isi nama aplikasi dan email dukungan (sisanya abaikan).
   - Jangan tambahkan Test users, simpan dan lanjutkan sampai selesai.
   - Kembali ke Dasbor OAuth consent screen, klik **PUBLISH APP** agar statusnya menjadi "In production".
4. Buka menu navigasi kiri $\rightarrow$ **APIs & Services $\rightarrow$ Credentials**.
   - Klik tombol **+ CREATE CREDENTIALS** (di atas) $\rightarrow$ pilih **OAuth client ID**.
   - Application type: **Web application**.
   - Di bagian **Authorized JavaScript origins**, tambahkan:
     - `http://localhost:3000` (Untuk pengembangan lokal)
     - `https://domain-anda.vercel.app` (Jika akan di-deploy ke Vercel)
   - Di bagian **Authorized redirect URIs**, tambahkan:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://domain-anda.vercel.app/api/auth/callback/google` (Ganti dengan domain asli Anda)
   - Klik **Create**.
5. Anda akan mendapatkan **Client ID** dan **Client Secret**. Simpan untuk langkah berikutnya.

---

### Langkah 3: Konfigurasi Environment Variables (`.env.local`)

Aplikasi Next.js membutuhkan token-token dari langkah sebelumnya agar bisa berfungsi. Anda harus membuat satu file konfigurasi rahasia bernama `.env.local` di folder *root* (folder terluar) project.

**Struktur Folder (Project Tree) yang Benar:**
```text
arsip-digital/
├── google-apps-script/
│   └── Code.gs                  # Kode untuk Google Apps Script
├── src/
│   ├── app/                     # Halaman Web (Frontend)
│   ├── components/              # Komponen UI
│   └── lib/                     # Konfigurasi & Tipe Data
├── public/                      # Aset Gambar/Ikon
├── .env.local                   # ⚠️ BUAT FILE INI DI SINI (SEJAJAR DENGAN package.json)
├── package.json                 
├── next.config.mjs              
└── README.md                    
```

**Cara Membuat File `.env.local` (Untuk Pengembangan Lokal / Localhost):**
1. Buka folder project Anda di aplikasi *Code Editor* (misalnya VS Code).
2. Klik kanan di area folder root, lalu pilih **New File (File Baru)**.
3. Beri nama file tersebut **tepat**: `.env.local` (tanpa nama tambahan di depan titik).
4. Buka file `.env.local` tersebut, *copy-paste* kode di bawah ini, lalu ganti tulisan `masukkan_...` dengan *keys/tokens* asli yang sudah Anda catat dari Langkah 1 & Langkah 2:

```env
# 1. Google OAuth Credentials (Dari Langkah 2: Google Cloud Console)
GOOGLE_CLIENT_ID=masukkan_client_id_google_anda_disini
GOOGLE_CLIENT_SECRET=masukkan_client_secret_google_anda_disini

# 2. NextAuth Configuration
# Gunakan sembarang teks acak panjang (minimal 32 karakter) untuk token keamanan, contoh: rahasia1234567890abcdef
NEXTAUTH_SECRET=supersecretrandomstring_bisa_diganti_apa_saja_123456789
# URL utama aplikasi Anda saat di-test di komputer
NEXTAUTH_URL=http://localhost:3000

# 3. Database Backend (Dari Langkah 1: Google Apps Script Web App URL)
APPS_SCRIPT_URL=masukkan_url_deployment_apps_script_anda_disini
```

Setelah diisi, jalankan aplikasi di terminal dengan perintah:
```bash
npm install
npm run dev
```
Buka `http://localhost:3000` di browser.

#### Untuk Production Deployment (Contoh: Vercel):
Jika Anda mengunggah (deploy) aplikasi ini ke Vercel atau layanan hosting Next.js lainnya, pastikan Anda mengisi Environment Variables di menu **Settings $\rightarrow$ Environment Variables** di Dashboard hosting tersebut:

- `GOOGLE_CLIENT_ID` = `...`
- `GOOGLE_CLIENT_SECRET` = `...`
- `NEXTAUTH_SECRET` = `...`
- `NEXTAUTH_URL` = `https://<domain-asli-anda>` *(Wajib sesuai dengan domain produksi Anda)*
- `APPS_SCRIPT_URL` = `...`

---

## Troublehsooting / Masalah Umum

1. **Error 400: redirect_uri_mismatch saat klik Login Google**
   $\rightarrow$ Pastikan Anda telah memasukkan `URL/api/auth/callback/google` yang tepat di opsi **Authorized redirect URIs** pada Google Cloud Console (Langkah 2.4).
   $\rightarrow$ Pastikan `NEXTAUTH_URL` di environment variables Vercel sama persis dengan URL asli website Anda.

2. **Gagal menyimpan/mengunggah dokumen**
   $\rightarrow$ Pastikan Anda memberikan hak akses *"Who has access: Anyone"* saat mendeploy Apps Script.
   $\rightarrow$ Pastikan Anda sudah memberikan izin Otorisasi (menjalankan `testAuthorization`) saat men-deploy Apps Script pertama kali.

3. **Data tidak muncul di tabel**
   $\rightarrow$ Buka file Google Spreadsheet Anda, pastikan nama lembar tab (di bagian bawah) adalah **Arsip** (huruf A besar).
