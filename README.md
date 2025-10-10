# CRUD Sederhana Data Mahasiswa Teknik Unhas

> Dokumentasi lengkap aplikasi CRUD berbasis web yang digunakan sebagai bahan penjelasan project UTS. Seluruh penjelasan disusun dalam Bahasa Indonesia dengan gaya yang mudah diikuti namun tetap teknis.

## Daftar Isi

- [Tech Stack](#tech-stack)
- [Ringkasan Proyek](#ringkasan-proyek)
- [Tujuan & Manfaat](#tujuan--manfaat)
- [Akun Demo](#akun-demo)
- [Alur Penggunaan Singkat](#alur-penggunaan-singkat)
- [Panduan Penggunaan Aplikasi](#panduan-penggunaan-aplikasi)
- [Fitur Utama Secara Mendalam](#fitur-utama-secara-mendalam)
  - [Autentikasi & Proteksi Sesi](#autentikasi--proteksi-sesi)
  - [Formulir & Pengelolaan Data](#formulir--pengelolaan-data)
  - [Validasi & Normalisasi Data](#validasi--normalisasi-data)
  - [Tabel, Pencarian, Filter, Sortir](#tabel-pencarian-filter-sortir)
  - [Import & Export](#import--export)
  - [Statistik & Laporan](#statistik--laporan)
  - [Pengalaman Pengguna & Aksesibilitas](#pengalaman-pengguna--aksesibilitas)
- [Pendekatan Teknis & Arsitektur](#pendekatan-teknis--arsitektur)
  - [Arsitektur Frontend](#arsitektur-frontend)
  - [Manajemen Data & Persistensi](#manajemen-data--persistensi)
  - [Validasi & Sanitasi](#validasi--sanitasi)
  - [Modularitas & Reusability](#modularitas--reusability)
  - [Integrasi Library Pihak Ketiga](#integrasi-library-pihak-ketiga)
  - [Keamanan di Sisi Klien](#keamanan-di-sisi-klien)
  - [Keterbatasan dan Pertimbangan Teknis](#keterbatasan-dan-pertimbangan-teknis)
- [Struktur Folder](#struktur-folder)
- [Cara Menjalankan Proyek](#cara-menjalankan-proyek)
- [Penjelasan File Penting](#penjelasan-file-penting)

---

## Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Data Storage:** localStorage, sessionStorage
- **Libraries:** jsPDF, jsPDF-AutoTable, SheetJS (XLSX.js)
- **Security:** SHA-256 Hashing via Web Crypto API
- **Deployment:** GitHub Pages / Vercel (static hosting)

## Ringkasan Proyek

Proyek ini dikembangkan sebagai bagian dari penilaian Ujian Tengah Semester (UTS) mata kuliah **Pemrograman Web** di Program Studi Teknik Informatika Universitas Hasanuddin.

Aplikasi ini merupakan dashboard CRUD (Create, Read, Update, Delete) berbasis web untuk mengelola data mahasiswa Fakultas Teknik Universitas Hasanuddin. Seluruh logika berjalan di sisi klien menggunakan HTML5, CSS3, dan JavaScript, tanpa framework maupun backend. Data disimpan pada `localStorage`, sehingga aplikasi dapat dipakai secara offline setelah dibuka. Proyek ini menonjolkan:

- Validasi NIM khusus Fakultas Teknik (awalan `D` dan kode departemen sah).
- Pengelolaan data mahasiswa yang kaya atribut (foto, IPK, catatan, NIM, prodi, dsb.).
- Fitur pencarian, filter, dan pengurutan multi-kriteria dengan feedback real-time.
- Import CSV/XLSX/JSON menggunakan SheetJS, serta ekspor PDF lengkap foto dengan jsPDF.
- Pengalaman pengguna (UX) yang rapi: custom dropdown, indikator statistik total data dan rata-rata ipk sederhana, dan dukungan aksesibilitas.

## Tujuan & Manfaat

- **Pembelajaran Web Programming**: memahami bagaimana membangun aplikasi CRUD tanpa framework dan bagaimana konsep dasar dari pembuatan website from scratch.
- **Simulasi Sistem Akademik**: mencontoh cara kampus mengelola data mahasiswa, mulai dari validasi data hingga pelaporan.
- **Bahan Dokumentasi**: dokumentasi ini memudahkan penjelasan arsitektur, fitur, dan alur data kepada dosen pengampuh mata kuliah.

## Akun Demo

- Email: `admin@example.com`
- Kata sandi: `Admin@123`
- Password disimpan dalam bentuk hash SHA-256 pada client-side untuk memastikan praktik penyimpanan yang lebih aman.

## Alur Penggunaan Singkat

1. Jalankan server statis lokal dan buka `src/pages/index.html`.
2. Halaman beranda mengenali status login:
   - Jika belum login, tombol menuju halaman login.
   - Jika sudah login, tombol langsung menuju dasbor.
3. Masuk menggunakan akun demo.
4. Gunakan dasbor untuk menambah, mengedit, menghapus, menyaring, atau mengekspor data.
5. Keluar melalui tombol `Logout` (membersihkan sesi pada `sessionStorage`).

🌐 **Demo Online:** [data-mahasiswa.fajrifarid.com](https://data-mahasiswa.fajrifarid.com)

## Panduan Penggunaan Aplikasi

### Langkah 1: Mulai Menggunakan Aplikasi

1. **Akses Aplikasi**: Buka `src/pages/index.html` di browser atau kunjungi [data-mahasiswa.fajrifarid.com](https://data-mahasiswa.fajrifarid.com)
2. **Masuk ke Sistem**: Klik tombol "Masuk ke Dasbor"
3. **Login**: Gunakan akun demo:
   - Email: `admin@example.com`
   - Password: `Admin@123`

### Langkah 2: Menambah Data Mahasiswa

1. **Isi Form**: Lengkapi form "Data Mahasiswa" di bagian atas dasbor
2. **Input NIM**: Ketik NIM mahasiswa (contoh: `D121231001`) - sistem otomatis mengisi Program Studi dan Angkatan
3. **Upload Foto** (opsional): Klik "Pilih Foto" untuk mengunggah foto dari komputer
4. **Simpan**: Klik tombol "Simpan" - data akan muncul di tabel

### Langkah 3: Mengelola Data

**Mengedit Data:**

- Klik tombol "Edit" pada baris yang ingin diubah
- Form akan terisi otomatis, ubah data yang diperlukan
- Klik "Perbarui" untuk menyimpan perubahan

**Menghapus Data:**

- Centang checkbox data yang ingin dihapus
- Klik "Hapus Terpilih" dan konfirmasi

### Langkah 4: Mencari dan Menyaring Data

1. **Pencarian**: Ketik nama/NIM/angkatan/dsb di kotak pencarian
2. **Filter Program Studi**: Pilih program studi dari dropdown
3. **Filter Angkatan**: Pilih tahun angkatan (batas angkatan cuman dalam rentang 2000-2025)
4. **Reset Filter**: Klik "Reset Filter" untuk menghapus semua filter

### Langkah 5: Import Data Massal

1. **Pilih File**: Klik "Upload CSV/XLSX" atau "Upload JSON"
2. **Unggah**: Pilih file dari folder `data/` (contoh: `mahasiswa_20_data.json`)
3. **Lihat Hasil**: Sistem akan menampilkan laporan import (berhasil/gagal/duplikat) berupa alert
4. **Download Log Error** (opsional): Jika ada data yang gagal diimpor, sistem akan menanyakan apakah Anda ingin mengunduh file log error untuk melihat detail kesalahan

### Langkah 6: Export Data

1. **Terapkan Filter** (opsional): Filter data sesuai kebutuhan
2. **Export**: Klik "Export PDF"
3. **Download**: File PDF akan terunduh dengan nama otomatis berdasarkan filter aktif

---

## Fitur Utama Secara Mendalam

### Autentikasi & Proteksi Sesi

- **Hashing di Browser**: Password user di-hash menggunakan Web Crypto API (`crypto.subtle.digest`). Jika API tidak tersedia (misal browser lama), tersedia fallback SHA-256 manual sehingga fitur tetap berjalan.
- **Penyimpanan Sesi**: Setelah login, info user tersimpan pada `sessionStorage` menggunakan key `crud_active_user`. Data berisi email, nama, dan timestamp login.
- **Pengamanan Halaman & Logika Sesi**:
  - `login.js` mencegah user yang sudah login mengakses kembali halaman login dengan melakukan redirect otomatis ke dasbor.
  - `dasbor.js` memeriksa validitas sesi saat halaman dimuat menggunakan `checkActiveUser()`. Jika sesi tidak valid atau tidak ditemukan, sistem akan:
    - Menambahkan kelas CSS `app-locked` ke elemen `<body>` yang menyembunyikan seluruh konten halaman.
    - Menampilkan overlay loading dengan pesan "Memeriksa sesi..." selama proses validasi.
    - Melakukan redirect otomatis ke `login.html` jika sesi tidak valid.
    - Hanya menampilkan konten dasbor (menghapus kelas `app-locked`) jika sesi terverifikasi valid.
  - **Mengapa `sessionStorage`?**: Dipilih karena sifatnya yang otomatis terhapus saat tab browser ditutup, memberikan keamanan tambahan untuk aplikasi yang mengelola data sensitif. Berbeda dengan `localStorage` yang persisten hingga dihapus manual, `sessionStorage` memastikan user harus login ulang setiap membuka aplikasi di tab/window baru.
- **Aksesibilitas Form Login**: Terdapat tombol show/hide password dengan ikon mata dan atribut ARIA agar pengguna mengetahui status tombol.

### Formulir & Pengelolaan Data

- **Field Wajib vs Opsional**:
  - Field wajib: Nama, NIM, Program Studi, Angkatan, Alamat, Email, IPK, dan Jenis Kelamin.
  - Field opsional: Catatan dan Foto (upload dari perangkat lokal).
  - Validasi form akan menolak penyimpanan jika ada field wajib yang kosong dengan menampilkan pesan error spesifik.
- **Upload Foto Lokal**:
  - Foto diambil dari perangkat pengguna menggunakan input `type="file"` dengan accept `image/*`.
  - File yang dipilih dikonversi menjadi Data URL menggunakan `FileReader` API dan disimpan langsung di `localStorage`.
  - Mendukung format umum: JPG, PNG, GIF, WebP dengan validasi ukuran maksimal (biasanya dibatasi agar tidak melebihi kapasitas localStorage).
  - Pratinjau foto langsung ditampilkan setelah upload berhasil.
- **Mode Tambah vs Edit**: form menyimpan state `data-mode`. Saat mengedit, tombol berubah menjadi `Perbarui`, field diisi ulang, dan fokus diarahkan ke field Nama.
- **Tombol Reset**: mengembalikan seluruh field ke nilai default, termasuk menghapus pesan error, mengosongkan catatan, dan mengembalikan foto placeholder.
- **Auto-increment ID**: Setiap data tersimpan dalam array `data`. Variabel `autoId` memastikan ID unik auto-increment berdasarkan ID tertinggi yang ada.

### Validasi & Normalisasi Data

- **Validasi NIM Fakultas Teknik** (`validateNIMFakultasTeknik`):
  - NIM harus diawali `D` dan memiliki 10 karakter.
  - Karakter 2–4 merujuk kode departemen yang dipetakan pada objek `FAKULTAS_TEKNIK_CODES`.
  - Karakter 5–6 adalah kode tahun angkatan (misal `23` menjadi 2023).
  - Karakter 7–10 adalah nomor urut empat digit.
- **Feedback Real-time**: Saat mengetik NIM, aplikasi langsung menampilkan pesan valid/invalid tepat di bawah input dengan indikator visual (warna hijau untuk valid, merah untuk invalid).
- **Validasi Field Wajib**:
  - Semua field wajib divalidasi saat penyimpanan dengan menampilkan pesan error spesifik.
  - Email divalidasi menggunakan regex pattern untuk memastikan format yang benar.
  - IPK hanya menerima nilai numerik antara 0.00–4.00 dengan validasi format dua desimal.
- **Normalisasi Data** (`normalizeMahasiswaRecord`):
  - NIM dikonversi ke huruf besar otomatis.
  - Program studi dan angkatan otomatis diisi berdasarkan NIM bila user tidak memasukkan nilai.
  - IPK diformat ke dua desimal (misal: 3.5 menjadi 3.50).
  - Nilai teks di-escape dengan `escapeHtml` saat ditampilkan pada tabel untuk mencegah XSS.
- **Cek Duplikasi** (`isDuplicateEntry`): mencegah penyimpanan data dengan kombinasi nama/NIM yang sudah ada dengan menampilkan peringatan yang jelas.

### Tabel, Pencarian, Filter, Sortir

- **Render Dinamis**: Fungsi `render()` menyiapkan tabel berdasarkan `filteredData`, menerapkan pagination, dan menjaga state checkbox terpilih.
- **Pencarian Multi-field**: Input pencarian memfilter data berdasarkan nama, NIM, prodi, angkatan, alamat, email, IPK, catatan, hingga jenis kelamin. Nilai pencarian disimpan di URL (`?search=`) agar dapat dibagikan.
- **Filter Dinamis Program Studi & Angkatan**:
  - `populateAngkatanFilter()` dan `populateProdiFilter()` membuat daftar opsi berdasarkan data yang ada saat ini.
  - Filter selalu sinkron dengan data aktual - jika ada data baru dengan prodi/angkatan baru, opsi filter otomatis bertambah.
  - Filter angkatan dan program studi menggunakan dropdown kustom (HTML + ul/li) dengan sinkronisasi ke elemen `<select hidden>`.
- **Indikator Filter Aktif**:
  - Bagian toolbar menampilkan filter yang sedang aktif (pencarian, program studi, angkatan, sorting).
  - Tombol "Reset Filter" untuk menghapus semua filter dan mengembalikan tampilan ke data lengkap.
  - Jumlah data terfilter ditampilkan real-time (misal: "Menampilkan 15 dari 50 data").
- **Pengurutan**:
  - Mendukung nama, NIM, angkatan, jurusan, dan IPK (ascending/descending).
  - Ikon sort di dropdown memanfaatkan aset SVG kustom dengan indikator arah pengurutan.
- **Pagination**: Pengguna bisa memilih 10/25/50/100 data per halaman. Tombol navigasi menampilkan ellipsis saat jumlah halaman banyak.
- **Aksi Massal**: Checkbox di header memungkinkan seleksi massal, dengan state `indeterminate` saat sebagian baris terpilih. Tersedia tombol `Hapus Terpilih` dan `Hapus Semua` dengan konfirmasi.

### Import & Export

- **Import CSV/XLSX**:
  - Menggunakan SheetJS (`xlsx.full.min.js`).
  - Sistem mengenali berbagai alias kolom melalui `IMPORT_FIELD_ALIASES` (misal `Program Studi`, `jurusan`, `program_studi` akan dipetakan ke kolom internal `programStudi`).
  - Setiap baris import divalidasi dengan pipeline yang sama seperti input manual.
  - Laporan hasil import menampilkan jumlah data berhasil, duplikat, dan gagal berikut detail error (maksimal 5 baris, sisanya diringkas).
  - **Download Log Error**: Jika terdapat data yang gagal divalidasi, sistem menawarkan opsi download file log error dalam format teks yang berisi detail lengkap setiap kesalahan validasi.
- **Import JSON**:
  - Mendukung struktur array langsung atau objek dengan properti `data` / `mahasiswa`.
  - Berguna untuk memigrasikan data dari aplikasi lain atau hasil ekspor custom.
  - **Download Log Error**: Sama seperti CSV/XLSX, tersedia opsi download log error jika ada data yang gagal divalidasi.
- **Export PDF**:
  - Memakai jsPDF 2.5.1 + plugin `jspdf-autotable`.
  - Header PDF menuliskan filter aktif, jumlah data, dan timestamp lengkap beserta zona waktu Indonesia (WIB/WITA/WIT) berdasarkan offset lokal.
  - Kolom foto ikut diekspor. Fungsi `prepareFotoForPdf` mengonversi gambar menjadi data URL dan menyesuaikan ukuran agar proporsional.
  - Nama file disusun dinamis berdasarkan filter dan timestamp (`data_mahasiswa_filter_xxx_angkatan_xxx_sort_xxx_YYYYMMDD_HHmm.pdf`).

### Statistik & Laporan

- **Panel Informasi Real-time**:
  - Jumlah data yang sedang terlihat berdasarkan filter aktif (misal: "Menampilkan 15 dari 50 data").
  - Total keseluruhan data yang tersimpan di localStorage.
  - Rata-rata IPK untuk data yang sedang terfilter dan rata-rata IPK keseluruhan data.
  - Perhitungan dilakukan oleh `calculateAverageIpk()` dengan pembulatan dua desimal.
- **Indikator Filter Aktif**:
  - Menampilkan filter yang sedang diterapkan (pencarian, program studi, angkatan, pengurutan).
  - Tombol "Reset Semua Filter" untuk mengembalikan tampilan ke kondisi awal tanpa filter.
- **Update Otomatis**: Informasi statistik langsung berubah setiap kali filter diterapkan, data ditambah/diedit/dihapus, atau ketika melakukan import data baru.

### Pengalaman Pengguna & Aksesibilitas

- **Custom Select**:
  - Fungsi `setupCustomSelect` mengubah `<select>` standar menjadi tombol interaktif dengan daftar opsi yang konsisten di semua browser.
  - Menambahkan atribut `aria-haspopup`, `aria-expanded`, dan label teks agar mudah dinavigasi keyboard.
- **Kontrol Foto**:
  - Pengunggahan foto menampilkan pratinjau instan, validasi tipe/ukuran, dan pesan error yang mudah dipahami.
  - Tautan foto di tabel membuka gambar pada tab baru dengan `rel="noopener noreferrer"`.
- **Tampilan Saat Data Kosong**:
  - Menampilkan ilustrasi `no-data.svg` dan pesan persuasif agar pengguna langsung mengisi data.
- **Feedback Form**:
  - Fungsi `showFormFeedback` dan `showNimRealtimeFeedback` memberikan informasi keberhasilan atau kesalahan tepat di lokasi input.
- **Performa**:
  - Semua script dimuat menggunakan atribut `defer` sehingga parsing HTML tidak terhambat.
  - Hanya halaman yang membutuhkan fitur tertentu yang memuat script terkait.

---

## Pendekatan Teknis & Arsitektur

### Arsitektur Frontend

- Proyek statis multi-halaman (`index.html`, `login.html`, `dasbor.html`).
- Tidak ada proses build. File dapat langsung dipublikasikan ke server statis atau CDN.
- CSS dibagi menjadi `global.css` (variabel warna, tipografi, reset) dan CSS khusus halaman (`index.css`, `login.css`, `dasbor.css`).
- JavaScript dipisah per halaman untuk meminimalkan ukuran file yang dimuat.

### Manajemen Data & Persistensi

- **localStorage sebagai Database Lokal**:
  - Data disimpan dengan key `crud_mahasiswa` dalam format JSON.
  - **Keterbatasan Kapasitas**: localStorage memiliki batas maksimal sekitar 5-10MB per domain (bervariasi per browser). Dengan foto yang disimpan sebagai Data URL, aplikasi dapat menampung sekitar 100-200 data mahasiswa dengan foto resolusi sedang.
- **Inisialisasi Data**: Saat pertama kali dijalankan, data diinisialisasi dari `window.INITIAL_MAHASISWA_DATA` (lihat `scripts/data/mahasiswa-initial.js`).
- **Struktur Data Mahasiswa**:

  ```json
  {
    "id": number,
    "nama": string,
    "nim": string,
    "programStudi": string,
    "angkatan": string,
    "alamat": string,
    "email": string,
    "ipk": number | "",
    "catatan?": string,
    "jenisKelamin": string,
    "fotoUrl?": string
  }
  ```

- **Error Handling**: Fungsi `loadData()` membaca dari storage dan melakukan validasi struktur sebelum dipakai aplikasi. Jika terjadi error (misalnya user memanipulasi storage atau data corrupt), data akan di-reset ke data awal dengan notifikasi kepada user.

### Validasi & Sanitasi

- `sanitizeJenisKelamin` mengonversi berbagai istilah (male, pria, wanita, female) menjadi nilai konsisten (`Laki-laki` atau `Perempuan`).
- `normalizeFotoUrl` memastikan link foto tidak kosong dan mengganti URL lama dengan placeholder baru bila diperlukan.
- `escapeHtml` mencegah injeksi HTML ketika menampilkan data dinamis pada tabel.
- Semua data import melewati fungsi `buildMahasiswaImportRecord`, sehingga tidak ada jalur pintas yang melewati validasi.

### Modularitas & Reusability

- `AppModules` mengekspos sekumpulan helper melalui `window.AppModules`. Ini memudahkan debugging manual dari console browser tanpa mengubah struktur kode lama.
- Fungsi utilitas seperti `applyFilters`, `renderPaginationPages`, `updateTotalDataDisplay`, dan `performBulkImport` memecah logika besar menjadi blok-blok kecil yang mudah diuji secara manual.

### Integrasi Library Pihak Ketiga

- **jsPDF & jsPDF-AutoTable**: digunakan untuk membuat PDF tabel mahasiswa dengan dukungan styling dan gambar.
- **SheetJS (XLSX.js)**: menangani parsing file CSV/XLSX langsung di browser.
- **Google Fonts (Inter)**: di-load melalui CSS untuk konsistensi tipografi.
- Semua library dimuat dari CDN, sehingga aplikasi berjalan tanpa instalasi tambahan.

### Keamanan di Sisi Klien

- **Password Hashing**: Password demo tersimpan sebagai hash SHA-256 (lihat `login.js`), bukan plain text untuk demonstrasi praktik keamanan yang baik.
- **Manajemen Sesi dengan sessionStorage**:
  - **Mengapa sessionStorage?**: Dipilih karena sifat sementara yang otomatis menghapus data saat tab browser ditutup, berbeda dengan localStorage yang persisten. Ini memberikan keamanan tambahan karena user harus login ulang setiap membuka aplikasi.
  - **Lifecycle Sesi**: Sesi aktif hanya selama tab browser tetap terbuka. Jika user menutup tab atau browser, sesi otomatis hilang dan user harus login ulang.
  - **Validasi Sesi**: Setiap halaman yang memerlukan autentikasi melakukan pengecekan sesi saat dimuat untuk memastikan user masih memiliki akses yang valid.
- **Sanitasi Data**: Nilai yang ditampilkan di DOM selalu di-escape untuk meminimalkan risiko XSS apabila user memasukkan karakter khusus.
- **Konfirmasi Operasi Destruktif**: Operasi seperti hapus data atau logout selalu meminta konfirmasi melalui `confirm()` untuk mencegah kesalahan pengguna.
- **⚠️ Catatan Edukasi**: Aplikasi ini dirancang untuk tujuan pembelajaran dan demonstrasi konsep pemrograman web. Tidak disarankan untuk mengelola data mahasiswa sesungguhnya karena seluruh data tersimpan di sisi klien (browser) tanpa enkripsi tambahan.

### Keterbatasan dan Pertimbangan Teknis

- **Kapasitas localStorage**:
  - Batas maksimal sekitar 5-10MB per domain (bervariasi antara browser: Chrome ~10MB, Firefox ~10MB, Safari ~5MB).
  - Foto disimpan sebagai Data URL yang berukuran lebih besar dari file asli (base64 encoding menambah ~33% ukuran).
  - Estimasi kapasitas: 100-200 mahasiswa dengan foto resolusi sedang (500KB per record termasuk foto).
- **Performa Browser**:
  - Operasi read/write localStorage bersifat synchronous dan dapat memblokir UI thread untuk data berukuran besar.
  - Rendering tabel dengan 1000+ record dapat menyebabkan lag, diatasi dengan pagination dan lazy loading.
- **Kompatibilitas Browser**:
  - Memerlukan browser modern yang mendukung ES6+, localStorage, sessionStorage, dan FileReader API.
  - Fallback SHA-256 manual untuk browser yang tidak mendukung Web Crypto API.

---

## Struktur Folder

```bash
pemweb-pakabdi/
├── README.md                # Dokumentasi ringkas bawaan
├── data/
│   ├── foto/                # Placeholder foto default
│   ├── mahasiswa.csv        # Contoh data untuk uji import CSV
│   ├── mahasiswa.xlsx       # Contoh data untuk uji import Excel
│   ├── mahasiswa_8_data.json   # Contoh data JSON 8 mahasiswa
│   ├── mahasiswa_20_data.json  # Contoh data JSON 20 mahasiswa
│   └── mahasiswa_100_data.json # Contoh data JSON 100 mahasiswa
└── src/
    ├── assets/              # Semua icon, ilustrasi, dan gambar
    │   └── foto-mahasiswa/  # Foto dummy untuk data awal
    ├── lib/
    │   └── hashedPasswordGenerator.js # Script Node.js untuk membuat hash password
    ├── pages/
    │   ├── index.html       # Beranda
    │   ├── login.html       # Halaman login
    │   └── dasbor.html      # Dashboard CRUD utama
    ├── scripts/
    │   ├── beranda.js       # Logika beranda & redirect ke login/dasbor
    │   ├── login.js         # Logika autentikasi dan session
    │   ├── dasbor.js        # Inti CRUD, filter, import/export
    │   └── data/
    │       └── mahasiswa-initial.js # Data mahasiswa sebagai initial data
    └── styles/
        ├── global.css       # Variabel, reset, komponen global
        ├── beranda.css      # Styling khusus beranda
        ├── login.css        # Styling halaman login
        └── dasbor.css       # Styling halaman dasbor & tabel
```

---

## Cara Menjalankan Proyek

1. **Clone / Unduh** repositori ini.
2. **Buka terminal** pada direktori proyek.
3. **Jalankan server statis** (pilih salah satu):
   - VS Code Live Server.
   - `npx serve .`
   - `python -m http.server`
4. **Akses** `http://localhost:PORT/src/pages/index.html`.
5. **Login** menggunakan kredensial demo.
6. **Eksplorasi** seluruh fitur CRUD, import, filter, dan ekspor PDF.
7. **Logout** sebelum menutup tab untuk membersihkan sesi.

> Catatan: akses file langsung (`file://`) tidak disarankan karena beberapa browser membatasi penggunaan `sessionStorage` dan `localStorage` saat file dibuka tanpa server.

---

## Penjelasan File Penting

- `src/pages/index.html`: Halaman beranda. Menampilkan deskripsi singkat dan tombol aksi. Memuat `beranda.js`.
- `src/pages/login.html`: Form login dengan input email & password, tombol toggle password, serta link kembali. Memuat `login.js`.
- `src/pages/dasbor.html`:
  - Mengimpor library eksternal (jsPDF, SheetJS) dan data awal.
  - Memuat form mahasiswa, toolbar filter, tabel data, dan kontrol aksi.
  - `dasbor.js` dipanggil dengan atribut `defer`.
- `src/scripts/dasbor.js`: File terbesar. Menangani:
  - Load/save data dari `localStorage`.
  - Normalisasi data, validasi, render tabel, pagination.
  - Fitur import/export, pengunggahan foto, dan session check.
- `src/scripts/login.js`: Validasi akun demo, hashing password, dan penyimpanan sesi.
- `src/scripts/beranda.js`: Mengecek status login agar tombol navigasi menyesuaikan.
- `src/scripts/data/mahasiswa-initial.js`: Data contoh sejumlah 20 mahasiswa dengan variasi prodi, angkatan (tahun 2000-2025), dan IPK.
- `src/lib/hashedPasswordGenerator.js`: Script Node.js untuk menghasilkan hash SHA-256 jika ingin mengganti password default.
- `src/styles/global.css`: Berisi reset, variabel CSS (warna, font), layout header/footer, utility classes.
