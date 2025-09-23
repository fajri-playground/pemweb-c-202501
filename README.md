# CRUD Sederhana Data Mahasiswa

## Deskripsi Project

Aplikasi web sederhana untuk mengelola data mahasiswa menggunakan teknologi **HTML**, **CSS**, dan **JavaScript** murni tanpa framework. Aplikasi ini menerapkan operasi CRUD (Create, Read, Update, Delete) dengan fitur-fitur tambahan seperti pencarian, pengurutan, ekspor PDF, dan import data dari file.

## 🚀 Fitur Utama

### 1. Operasi CRUD

- **Create**: Menambah data mahasiswa baru melalui form input
- **Read**: Menampilkan daftar mahasiswa dalam bentuk tabel
- **Update**: Mengedit data mahasiswa yang sudah ada
- **Delete**: Menghapus data mahasiswa dengan konfirmasi

### 2. Manajemen Data

- **Persistensi Data**: Menggunakan `localStorage` untuk menyimpan data secara lokal
- **Data Awal**: Tersedia 10 data mahasiswa sebagai contoh
- **Validasi Form**: Input nama, NIM, dan alamat wajib diisi

### 3. Pencarian dan Filter

- **Pencarian Real-time**: Cari berdasarkan nama atau NIM mahasiswa
- **URL Parameter**: Pencarian disimpan dalam URL untuk kemudahan berbagi
- **Filter Responsif**: Hasil pencarian langsung ditampilkan

### 4. Pengurutan Data

- **Dropdown Kustom**: Interface pengurutan yang menarik dengan icon SVG
- **Multiple Sort**: Urutkan berdasarkan:
  - Nama (A-Z / Z-A)
  - NIM (1-9 / 9-1)
  - Default (urutan asli)

### 5. Import/Export Data

- **Import File**: Mendukung format CSV dan XLSX
- **Export PDF**: Download data dalam format PDF dengan tabel yang rapi
- **Library External**: Menggunakan SheetJS untuk Excel dan jsPDF untuk PDF

## 📁 Struktur Project

```
pemweb/
├── index.html          # Halaman utama aplikasi
├── style.css           # Styling dan layout responsif
├── script.js           # Logika aplikasi dan interaksi
├── README.md           # Dokumentasi project
├── assets/             # Icon SVG
│   ├── fa-upload.svg
│   ├── fa-file-pdf.svg
│   ├── fa-sliders.svg
│   ├── fa-chevron-down.svg
│   ├── fa-arrow-up-a-z.svg
│   ├── fa-arrow-down-a-z.svg
│   ├── fa-arrow-up-1-9.svg
│   ├── fa-arrow-down-9-1.svg
│   └── no-data.svg
└── data/               # Sample data untuk fitur upload file
    ├── mahasiswa.csv
    └── mahasiswa.xlsx
```

## 🎨 Teknologi dan Library

### Core Technology

- **HTML5**: Struktur semantik dengan form dan tabel
- **CSS3**: Styling modern dengan CSS Variables dan Flexbox
- **JavaScript ES6+**: Logika aplikasi dengan DOM manipulation

### External Libraries

- **jsPDF**: Untuk menghasilkan file PDF
- **jsPDF-AutoTable**: Plugin untuk membuat tabel dalam PDF
- **SheetJS (XLSX.js)**: Untuk membaca file Excel/CSV

### Styling

- **Google Fonts**: Font Inter untuk tipografi yang bersih
- **Custom CSS**: Tidak menggunakan framework CSS
- **SVG Icons**: Icon lokal menggantikan Font Awesome sesuai kebijakan

## 💡 Implementasi Teknis

### 1. Persistensi Data

Aplikasi menggunakan localStorage browser untuk menyimpan data mahasiswa secara lokal. Data disimpan dalam format JSON sehingga tetap tersedia meski browser ditutup. Jika localStorage kosong, sistem akan memuat 10 data mahasiswa contoh sebagai data awal.

### 2. Pencarian dengan URL Parameter

Fitur pencarian terintegrasi dengan URL browser, sehingga ketika user mencari data tertentu, URL akan berubah menyertakan keyword pencarian. Ini memungkinkan user untuk bookmark atau share URL pencarian ke orang lain.

### 3. Upload File CSV/XLSX

Aplikasi dapat membaca dan mengimpor data dari file CSV dan Excel. File sample tersedia di folder `data/` untuk testing:

- `mahasiswa.csv` - Contoh format CSV
- `mahasiswa.xlsx` - Contoh format Excel

Cara mencoba: Klik tombol "Upload CSV/XLSX", pilih file dari folder `data/`, dan data akan otomatis ditambahkan ke tabel yang sudah ada.

### 4. Custom Dropdown Sort

Sistem pengurutan menggunakan dropdown kustom yang dibuat dari HTML dan CSS murni, tanpa menggunakan elemen `<select>` default browser. Dropdown dilengkapi dengan icon SVG dan animasi transisi yang smooth.

### 5. Export PDF

Fitur ekspor PDF menggunakan library jsPDF dan jsPDF-AutoTable untuk menghasilkan dokumen PDF dengan format tabel yang rapi, lengkap dengan header dan styling yang konsisten.

## 🔧 Cara Menjalankan

1. **Download/Clone** semua file ke folder lokal
2. **Buka** file `index.html` di web browser
3. **Pastikan** semua file asset dan script dapat diakses
4. **Aplikasi siap digunakan** tanpa server khusus
