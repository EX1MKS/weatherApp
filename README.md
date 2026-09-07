# ⛅ Aplikasi Ramalan Cuaca (Weather Outlook App)

Aplikasi web modern untuk melihat ramalan cuaca interaktif dan real-time berdasarkan data **Visual Crossing Weather API**. Dilengkapi dengan tampilan cuaca 48 jam (24 jam lalu & 24 jam depan), penanda otomatis waktu saat ini, serta antarmuka yang bersih dan responsif.

---

## 🛠️ Teknologi yang Digunakan

- **React 19** + **TypeScript**
- **Vite** (Build Tool & Dev Server)
- **Tailwind CSS v4**
- **Shadcn UI** & **Lucide React Icons**
- **Visual Crossing Weather API**

---

## 🚀 Cara Menjalankan Project di Laptop (Lokal)

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi di komputer/laptop Anda:

### 1. Prasyarat (Prerequisites)
Pastikan Anda sudah menginstal:
- **Node.js** (Versi 18 atau lebih baru). Cek dengan perintah:
  ```bash
  node -v
  ```
- **npm** (Bawaan Node.js). Cek dengan perintah:
  ```bash
  npm -v
  ```

---

### 2. Langkah-Langkah Instalasi & Mengoperasikan

1. **Buka Terminal / Command Prompt** dan masuk ke direktori project:
   ```bash
   cd "weatherApp"
   ```

2. **Install Semua Dependensi**:
   Jalankan perintah berikut untuk mengunduh semua paket yang dibutuhkan:
   ```bash
   npm install
   ```

3. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```

4. **Buka Aplikasi di Browser**:
   Setelah perintah di atas dijalankan, terminal akan menampilkan URL lokal seperti:
   ```
   ➜ Local:   http://localhost:5173/
   ```
   Buka alamat `http://localhost:5173/` di browser web Anda (Chrome, Edge, Firefox, dll).

---

## 📜 Perintah Utama (Available Scripts)

| Perintah | Keterangan |
| :--- | :--- |
| `npm run dev` | Menjalankan server pengembang lokal dengan Hot Reload (`http://localhost:5173`). |
| `npm run build` | Melakukan kompilasi TypeScript dan membuat folder bundle produksi (`dist/`). |
| `npm run preview` | Menjalankan preview dari hasil kompilasi produksi secara lokal. |
| `npm run lint` | Memeriksa kualitas kode menggunakan ESLint. |

---

## ✨ Fitur Utama

- 🔍 **Pencarian Kota Real-Time**: Masukkan nama kota di Indonesia atau mancanegara (contoh: *Pandeglang, Jakarta, Bandung, Serang, Surabaya*).
- ⏱️ **Laporan 48 Jam**: Menampilkan riwayat cuaca 24 jam sebelumnya dan prakiraan 24 jam berikutnya.
- 🎯 **Penanda "Saat Ini" & Auto-Scroll**: Card jam cuaca saat ini ditandai dengan warna khusus dan otomatis bergeser ke tengah layar.
- 🔄 **Tombol Perbarui (Refresh)**: Memperbarui data cuaca terkini secara instan dari API.
- 🌐 **Netlify Ready**: Sudah dilengkapi file konfig `netlify.toml` dan `public/_redirects` untuk kemudahan hosting.
