# CRUD Sederhana Data Mahasiswa Teknik Unhas

## Akun Demo Cepat

- Email: `admin@example.com`
- Kata sandi: `Admin@123`

## Deskripsi Project

Aplikasi web sederhana untuk mengelola data mahasiswa Fakultas Teknik Universitas Hasanuddin menggunakan teknologi **HTML**, **CSS**, dan **JavaScript** murni tanpa framework. Aplikasi ini menerapkan operasi CRUD (Create, Read, Update, Delete) dengan fitur-fitur tambahan seperti sistem login, validasi NIM Fakultas Teknik, pencarian multi-field, filter angkatan, pengurutan, ekspor PDF, dan import data dari file.

## 🚀 Fitur Utama

### 1. Sistem Autentikasi

- **Halaman Login**: Sistem login dengan validasi kredensial
- **Password Toggle**: Tombol show/hide password untuk kemudahan
- **Password Hashing**: Input password di-hash di browser menggunakan Web Crypto API bila tersedia, dengan fallback SHA-256 murni supaya tetap bekerja saat proyek dibuka dari server lokal sederhana.
- **Session Management**: Menggunakan `sessionStorage` untuk menjaga status login
- **Auto Redirect**: Redirect otomatis ke dasbor jika sudah login, atau ke login jika belum
- **Session Protection**: Halaman dasbor terlindungi, hanya bisa diakses setelah login
- **Logout**: Tombol logout untuk keluar dan menghapus session

### 2. Operasi CRUD

- **Create**: Menambah data mahasiswa baru melalui form input
- **Read**: Menampilkan daftar mahasiswa dalam bentuk tabel
- **Update**: Mengedit data mahasiswa yang sudah ada
- **Delete**: Menghapus data mahasiswa dengan konfirmasi

### 3. Validasi Data Mahasiswa

- **Validasi NIM Ketat**: Khusus untuk mahasiswa Fakultas Teknik Unhas dengan input prevention
- **Input Control**: Karakter pertama hanya boleh 'D', karakter 2-10 hanya angka
- **Auto-generate Fields**: Angkatan dan jurusan otomatis berdasarkan NIM
- **Real-time Validation**: Validasi langsung saat mengetik dengan feedback visual
- **Paste Protection**: Validasi content yang di-paste sesuai format NIM
- **Persistensi Data**: Menggunakan `localStorage` untuk menyimpan data secara lokal

### 4. Pencarian dan Filter

- **Pencarian Multi-field**: Cari berdasarkan nama, NIM, jurusan, angkatan, atau alamat
- **Filter Angkatan**: Dropdown interaktif untuk filter berdasarkan tahun angkatan
- **URL Parameter**: Pencarian disimpan dalam URL untuk kemudahan berbagi
- **Real-time Results**: Hasil pencarian dan filter langsung ditampilkan

### 5. Pengurutan Data

- **Dropdown Kustom**: Interface pengurutan yang menarik dengan icon SVG
- **Multiple Sort Options**: Urutkan berdasarkan:
  - Nama (A-Z / Z-A)
  - NIM (1-9 / 9-1)
  - Angkatan (Terbaru/Terlama)
  - Jurusan (A-Z / Z-A)
  - Default (urutan asli)

### 6. Import/Export Data

- **Import File**: Mendukung format CSV dan XLSX dengan validasi data
- **Partial Import**: Sistem import yang cerdas dengan laporan detail
- **Export PDF**: Download data dalam format PDF dengan informasi filter dan timestamp
- **Dynamic PDF Naming**: Nama file PDF otomatis berdasarkan filter yang aktif
- **Library External**: Menggunakan SheetJS untuk Excel dan jsPDF untuk PDF

## 📁 Struktur Project

```bash
pemweb/
├── README.md                  # Dokumentasi project
├── data/                      # Sample data untuk testing
│   ├── mahasiswa.csv          # Contoh format CSV
│   └── mahasiswa.xlsx         # Contoh format Excel
└── src/                       # Source code aplikasi
    ├── assets/                # Icon dan gambar SVG
    │   ├── eye-slash-solid-full.svg
    │   ├── eye-solid-full.svg
    │   ├── fa-arrow-down-9-1.svg
    │   ├── fa-arrow-down-a-z.svg
    │   ├── fa-arrow-up-1-9.svg
    │   ├── fa-arrow-up-a-z.svg
    │   ├── fa-chevron-down.svg
    │   ├── fa-file-pdf.svg
    │   ├── fa-sliders.svg
    │   ├── fa-upload.svg
    │   ├── no-data.svg
    │   └── university.svg
    ├── lib/                  # Library dan utility
    │   └── hashedPasswordGenerator.js
    ├── pages/                # Halaman HTML
    │   ├── dasbor.html       # Halaman utama CRUD
    │   ├── index.html        # Halaman beranda
    │   └── login.html        # Halaman login
    ├── scripts/              # JavaScript files
    │   ├── dasbor.js         # Logika CRUD dan fitur utama
    │   └── login.js          # Logika autentikasi
    │   └── beranda.js        # Logika routing beranda
    └── styles/               # CSS files
        ├── dasbor.css        # Style khusus dasbor
        ├── global.css        # Style global (font, variables, header/footer)
        ├── index.css         # Style khusus beranda
        └── login.css         # Style khusus login
```

## 🎨 Teknologi dan Library

### Core Technology

- **HTML5**: Struktur semantik dengan form, tabel, dan navigasi multi-halaman
- **CSS3**: Styling modern dengan CSS Variables, Flexbox, dan arsitektur global.css
- **JavaScript ES6+**: Logika aplikasi dengan DOM manipulation, localStorage, sessionStorage, dan validasi

### External Libraries

- **jsPDF**: Untuk menghasilkan file PDF dengan metadata dan timestamp
- **jsPDF-AutoTable**: Plugin untuk membuat tabel dalam PDF dengan styling
- **SheetJS (XLSX.js)**: Untuk membaca dan memproses file Excel/CSV

### Arsitektur CSS

- **global.css**: File CSS terpusat untuk font, variables, reset, header/footer yang berulang
- **CSS Modular**: Setiap halaman memiliki file CSS spesifik untuk styling unik
- **Google Fonts**: Font Inter untuk tipografi yang bersih dan modern
- **SVG Icons**: Icon lokal untuk performa optimal tanpa dependency eksternal

## 💡 Implementasi Teknis

### 1. Sistem Login dan Navigasi

Aplikasi memiliki tiga halaman utama: beranda (index.html), login, dan dasbor. Sistem login menggunakan validasi kredensial sederhana dengan session management berbasis `sessionStorage`. Setelah login berhasil, user akan redirect otomatis ke dasbor dan session akan tersimpan. Halaman dasbor terlindungi dengan session validation - jika user belum login atau session expired, akan otomatis redirect ke halaman login. Fitur password toggle memungkinkan user melihat/menyembunyikan password saat mengetik.

### 2. Session Management dan Security

Aplikasi menggunakan `sessionStorage` untuk menjaga status login user. Session akan otomatis terhapus ketika browser tab ditutup atau user logout. Setiap akses ke halaman dasbor akan dicek validitas session-nya. Jika session tidak valid, user akan diarahkan kembali ke halaman login dengan pesan notifikasi.

### 3. Validasi NIM Fakultas Teknik

Sistem validasi NIM khusus untuk mahasiswa Fakultas Teknik Unhas dengan pattern tertentu dan input prevention yang ketat. Karakter pertama harus 'D' dan 9 karakter selanjutnya harus angka. User tidak bisa mengetik karakter yang tidak sesuai aturan. Angkatan dan jurusan akan otomatis ter-generate berdasarkan pola NIM yang diinput. Validasi real-time memberikan feedback langsung kepada user dengan visual indicator.

### 4. Persistensi Data dengan localStorage

Data mahasiswa disimpan dalam localStorage browser dalam format JSON. Jika localStorage kosong, sistem akan memuat data contoh sebagai starter. Data tetap tersedia meskipun browser ditutup dan dibuka kembali.

### 5. Pencarian dan Filter Multi-field

Fitur pencarian mendukung pencarian berdasarkan nama, NIM, jurusan, angkatan, atau alamat secara bersamaan. Filter angkatan menggunakan dropdown interaktif yang ter-generate otomatis berdasarkan data yang ada. URL parameter menyimpan state pencarian untuk kemudahan berbagi.

### 6. Import Data dengan Validasi

Sistem import mendukung file CSV dan XLSX dengan validasi komprehensif termasuk validasi format NIM Fakultas Teknik. File sample tersedia di folder `data/` untuk testing. Sistem memberikan laporan detail tentang data yang berhasil diimport, yang gagal beserta alasannya, dan duplikasi yang di-skip untuk mencegah data ganda.

### 7. Export PDF dengan Metadata

Export PDF menggunakan jsPDF dengan informasi filter yang aktif, timestamp lokal, dan naming dinamis berdasarkan kondisi filter. PDF include header, styling yang konsisten, dan informasi tambahan seperti total data yang diekspor.

### 8. Arsitektur CSS Global

Implementasi global.css untuk mengatasi duplikasi kode CSS. File ini berisi font import, CSS variables, reset global, dan styling header/footer yang berulang. Setiap halaman tetap memiliki CSS spesifik untuk kebutuhan unik masing-masing.

### 9. Input Control dan UX

Kontrol input yang ketat untuk memastikan kualitas data. Input NIM mencegah user memasukkan karakter yang tidak sesuai format, auto-uppercase untuk konsistensi, dan paste protection untuk menjaga integritas data. Semua interaction dilengkapi dengan feedback visual yang jelas.

### 10. Penempatan Script di Halaman

Seluruh file HTML di `src/pages` memuat JavaScript dari folder `src/scripts` memakai path relatif (misal `../scripts/login.js`). Tag `<script>` ditempatkan di bagian `<head>` dengan atribut `defer`, sehingga parsing HTML tidak terblokir dan kode baru dijalankan setelah DOM siap. Halaman `dasbor.html` juga memuat library eksternal (jsPDF, jsPDF-AutoTable, SheetJS) lebih dulu di `<head>` supaya dependensi tersedia ketika `dasbor.js` dieksekusi.

## 🔧 Cara Menjalankan

1. **Download/Clone** semua file ke folder lokal.
2. **Jalankan** proyek lewat web server lokal (contoh: ekstensi VS Code _Live Server_, `npx serve`, atau `python -m http.server`) sehingga URL berada di `http://localhost/...`.
3. **Akses** `http://localhost:PORT/src/pages/index.html` melalui browser favorit Anda.
4. **Pastikan** semua file asset dan script dapat diakses dengan path relatif yang benar
5. **Navigate** melalui aplikasi: Beranda → Login → Dasbor untuk mengakses fitur CRUD
6. **Testing Import**: Gunakan file sample di folder `data/` untuk menguji fitur import
7. **Aplikasi siap digunakan** tanpa memerlukan server khusus atau setup tambahan
