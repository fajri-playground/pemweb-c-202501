/* global XLSX */ // for eslint
// ------------------- PERSISTENSI DATA -------------------
const STORAGE_KEY = "crud_mahasiswa"; // Key localStorage

// Untuk inisialisasi data awal jika localStorage kosong
const initialData = [
  { id: 1, nama: "Andi Saputra", nim: "D121231038", alamat: "Makassar" },
  { id: 2, nama: "Budi Santoso", nim: "D121231039", alamat: "Jakarta" },
  { id: 3, nama: "Citra Dewi", nim: "D121231040", alamat: "Bandung" },
  { id: 4, nama: "Dewi Lestari", nim: "D121231041", alamat: "Surabaya" },
  { id: 5, nama: "Eko Prasetyo", nim: "D121231042", alamat: "Yogyakarta" },
  { id: 6, nama: "Farhan Ahmad", nim: "D121231043", alamat: "Medan" },
  { id: 7, nama: "Gita Putri", nim: "D121231044", alamat: "Palembang" },
  { id: 8, nama: "Hariyanto", nim: "D121231045", alamat: "Balikpapan" },
  { id: 9, nama: "Intan Permata", nim: "D121231046", alamat: "Makassar" },
  { id: 10, nama: "Joko Susilo", nim: "D121231047", alamat: "Semarang" },
];

const loadData = () => {
  // Ambil data yang sudah tersimpan di localStorag
  const stored = localStorage.getItem(STORAGE_KEY);

  // jika ada data di localStorage, kembalikan dalam bentuk array dan baca
  if (stored) return JSON.parse(stored);

  // jika tidak ada, kembalikan data awal (initialData) dan simpan ke localStorage
  saveData(initialData);

  return [...initialData];
};

// Simpan array data ke localStorage
const saveData = (list) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

// ------------------- STATE -------------------
let data = loadData(); // Array data mahasiswa
let autoId = data.reduce((m, o) => Math.max(m, o.id), 0) + 1; // Auto-increment ID
let filteredData = [...data];

// ------------------- ELEMENT HTML -------------------
const form = document.getElementById("form-mahasiswa");
const elId = document.getElementById("id");
const elNama = document.getElementById("nama");
const elNim = document.getElementById("nim");
const elAlamat = document.getElementById("alamat");
const tbody = document.getElementById("tbody");
const btnReset = document.getElementById("btn-reset");
const elSearch = document.getElementById("search");
const elSort = document.getElementById("sort");
const sortWrapper = document.getElementById("sort-wrapper");
const trigger = sortWrapper.querySelector(".trigger");
const options = sortWrapper.querySelectorAll(".options li");
const triggerLabel = sortWrapper.querySelector(".trigger span");
const tableSection = document.getElementById("table-section");
const btnDownloadPdf = document.getElementById("btn-download-pdf");
const fileUpload = document.getElementById("fileUpload");

// ------------------- FUNGSI RENDER -------------------
function render() {
  if (!Array.isArray(data)) filteredData = [];
  tbody.innerHTML = ""; // Kosongkan tabel sebelum render ulang

  // Hapus pesan "Data tidak ditemukan" jika ada
  const notFound = document.querySelector("#empty-state");
  if (notFound) notFound.remove();

  // Kondisi ketika data utama kosong total
  if (data.length === 0) {
    const emptyData = document.createElement("div");
    emptyData.id = "empty-state";
    emptyData.innerHTML = `
      <img src="./assets/no-data.svg" alt="Belum ada data"/>
      <div>
        <p>Belum ada data mahasiswa.</p>
        <p>Silakan tambahkan data terlebih dahulu.</p>
      </div>
    `;
    tableSection.appendChild(emptyData);
    return;
  }

  // Kondisi ketika data hasil filter pencarian tidak ada
  if (filteredData.length === 0) {
    const notFoundData = document.createElement("div");
    notFoundData.id = "empty-state";
    notFoundData.innerHTML = `
      <img src="./assets/no-data.svg" alt="Data tidak ditemukan"/>
      <p>Data mahasiswa tidak ditemukan</p>
    `;
    tableSection.appendChild(notFoundData);
    return;
  }

  const sortedData = sortData(filteredData);

  sortedData.forEach((row, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
          <td>${idx + 1}</td>
          <td>${row.nama}</td>
          <td>${row.nim}</td>
          <td>${row.alamat}</td>
          <td class="table-actions">
    <div class="action-buttons">
      <button type="button" data-edit="${
        row.id
      }" class="edit" aria-label="Edit Data Mahasiswa ${row.nama}">Edit</button>
      <button type="button" data-del="${
        row.id
      }" class="hapus" aria-label="Hapus Data Mahasiswa ${
      row.nama
    }">Hapus</button>
    </div>
  </td>
        `;
    tbody.appendChild(tr);
  });
}

// ------------------- SEARCH FUNCTIONALITY START -------------------
function initSearchFromUrl() {
  // Inisialisasi nilai input pencarian dari URL saat halaman dimuat
  const params = new URLSearchParams(window.location.search);
  const searchKeyword = params.get("search") || "";

  if (searchKeyword) {
    // Jika ada keyword di URL, set ke input pencarian dan filter data
    elSearch.value = searchKeyword;

    // filter data berdasarkan nama dan nim
    filteredData = data.filter(
      (m) =>
        m.nama.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        m.nim.toLowerCase().includes(searchKeyword.toLowerCase())
    );
  } else {
    // kalau nggk ada keyword, tampilkan semua data
    filteredData = [...data];
  }
  render();
}

elSearch.addEventListener("input", (e) => {
  // Ambil nilai input pencarian
  const searchKeyword = e.target.value.toLowerCase().trim();

  // Update URL tanpa reload halaman
  const params = new URLSearchParams(window.location.search);

  // Jika ada keyword, set ke URL
  if (searchKeyword) {
    params.set("search", searchKeyword);
  } else {
    // kalau kosong hapus parameter search
    params.delete("search");
  }

  // Buat query string dari params
  const queryString = params.toString();

  // Update URL di browser tanpa reload halaman
  const newUrl = queryString
    ? `${window.location.pathname}?${queryString}`
    : window.location.pathname;
  window.history.replaceState({}, "", newUrl);

  if (searchKeyword === "") {
    // Jika input pencarian kosong, tampilkan semua data
    filteredData = [...data];
  } else {
    filteredData = data.filter(
      (m) =>
        // sort berdasarkan nama dan nim
        m.nama.toLowerCase().includes(searchKeyword) ||
        m.nim.toLowerCase().includes(searchKeyword)
    );
  }
  render();
});
// ------------------- SEARCH FUNCTIONALITY END -------------------

// ------------------- SORT FUNCTIONALITY START -------------------
// Trigger "klik" untuk membuka/menutup dropdown sort
trigger.addEventListener("click", () => {
  sortWrapper.classList.toggle("open");
});

// Event listener untuk handle setiap opsi sort
options.forEach((option) => {
  // Ketika opsi diklik
  option.addEventListener("click", () => {
    const value = option.getAttribute("data-value");
    const html = option.innerHTML;

    // Update label & value sort untuk ditampilkan nanti
    triggerLabel.innerHTML = html;
    elSort.value = value;

    // tutup dropdown setelah memilih opsi
    elSort.parentElement.classList.remove("open");

    render();
  });
});

// Tutup dropdown sort jika klik di luar area
document.addEventListener("click", (e) => {
  if (!sortWrapper.contains(e.target)) {
    sortWrapper.classList.remove("open");
  }
});

// Fungsi untuk mengurutkan data berdasarkan opsi yang dipilih sebelumnya
function sortData(list) {
  const sortValue = elSort.value;

  if (sortValue === "nama-asc") {
    // urutkan data berdasarkan nama ascending
    return [...list].sort((a, b) => a.nama.localeCompare(b.nama));
  } else if (sortValue === "nama-desc") {
    // urutkan data berdasarkan nama descending
    return [...list].sort((a, b) => b.nama.localeCompare(a.nama));
  } else if (sortValue === "nim-asc") {
    // urutkan data berdasarkan nim ascending
    return [...list].sort((a, b) => a.nim.localeCompare(b.nim));
  } else if (sortValue === "nim-desc") {
    // urutkan data berdasarkan nim descending
    return [...list].sort((a, b) => b.nim.localeCompare(a.nim));
  } else {
    // default → kembalikan list apa adanya
    return list;
  }
}
// ------------------- SORT FUNCTIONALITY END -------------------

// -------------- DOWNLOAD PDF FUNCTIONALITY START ---------------
btnDownloadPdf.addEventListener("click", () => {
  // Ambil data yang sudah difilter
  const exportData = sortData(filteredData);

  if (exportData.length === 0) {
    alert("Tidak ada data untuk diekspor!");
    return;
  }

  // Buat dokumen PDF baru
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Judul PDF
  doc.setFontSize(14);
  doc.text("Daftar Mahasiswa", 14, 15);

  // AutoTable untuk render tabel
  doc.autoTable({
    startY: 25,
    head: [["No", "Nama", "NIM", "Alamat"]],
    body: exportData.map((m, idx) => [idx + 1, m.nama, m.nim, m.alamat]),
    theme: "grid",
    headStyles: { fillColor: [25, 118, 210] },
    styles: { fontSize: 10 },
  });

  // Simpan PDF
  doc.save("data_mahasiswa.pdf");
});
// ---------------- DOWNLOAD PDF FUNCTIONALITY END ----------------

// ---------------- UPLOAD FILE FUNCTIONALITY START ----------------
fileUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // ambil ekstensi file
  const ext = file.name.split(".").pop().toLowerCase();
  const reader = new FileReader();

  // Fungsi untuk mengecek apakah data sudah ada (duplikasi)
  const isDuplicate = (nama, nim) => {
    return data.some(
      (item) =>
        item.nim.toLowerCase() === nim.toLowerCase() ||
        (item.nama.toLowerCase() === nama.toLowerCase() &&
          item.nim.toLowerCase() === nim.toLowerCase())
    );
  };

  let importedCount = 0; // Counter data yang berhasil diimport
  let duplicateCount = 0; // Counter data duplikat yang di-skip

  if (ext === "csv") {
    // Baca CSV
    reader.onload = (event) => {
      const text = event.target.result; // isi file CSV dalam bentuk teks
      const rows = text.split("\n").map((r) => r.split(",")); // pecah baris & kolom
      rows.forEach((row, idx) => {
        if (idx === 0) return; // skip header
        const [nama, nim, alamat] = row.map((c) => c.trim()); // ambil kolom
        if (nama && nim && alamat) {
          // Cek apakah data sudah ada
          if (!isDuplicate(nama, nim)) {
            data.push({ id: autoId++, nama, nim, alamat }); // tambah ke data untuk setiap baris
            importedCount++;
          } else {
            duplicateCount++;
          }
        }
      });
      saveData(data); // simpan data ke localStorage
      filteredData = [...data]; // sinkronkan sort data
      render(); // render ulang tabel

      if (importedCount > 0) {
        alert(
          `Import CSV selesai!\n Berhasil menambahkan ${importedCount} data baru `
        );
      } else {
        alert("Data CSV Ada duplikat, tidak ada data ditambahkan");
      }
    };
    reader.readAsText(file);
  } else if (ext === "xlsx") {
    // Baca XLSX sebagai ArrayBuffer
    reader.onload = (event) => {
      const dataBinary = new Uint8Array(event.target.result); // isi file dalam array biner
      const workbook = XLSX.read(dataBinary, { type: "array" }); // parse dengan SheetJS
      const sheet = workbook.Sheets[workbook.SheetNames[0]]; // ambil sheet pertama
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // ubah jadi array of rows

      jsonData.forEach((row, idx) => {
        if (idx === 0) return; // skip header
        const [nama, nim, alamat] = row.map((c) => String(c).trim()); // ambil kolom
        if (nama && nim && alamat) {
          // Cek apakah data sudah ada
          if (!isDuplicate(nama, nim)) {
            data.push({ id: autoId++, nama, nim, alamat }); // tambah ke data untuk setiap baris
            importedCount++;
          } else {
            duplicateCount++;
          }
        }
      });
      saveData(data); // simpan data ke localStorage
      filteredData = [...data]; // sinkronkan sort data
      render(); // render ulang tabel

      if (importedCount > 0) {
        alert(
          `Import xlsx selesai!\n Berhasil menambahkan ${importedCount} data baru `
        );
      } else {
        alert("Data xlsx Ada duplikat, tidak ada data ditambahkan");
      }
    };
    reader.readAsArrayBuffer(file); // baca file sebagai ArrayBuffer
  } else {
    alert("Format file tidak didukung. Gunakan CSV atau XLSX.");
  }
});
// ----------------- UPLOAD FILE FUNCTIONALITY END ------------------

// ------------------- FORM SUBMIT (CREATE / UPDATE) -------------------
form.addEventListener("submit", (e) => {
  e.preventDefault(); // Mencegah reload halaman

  const idVal = elId.value.trim();
  const nama = elNama.value.trim();
  const nim = elNim.value.trim();
  const alamat = elAlamat.value.trim();

  if (!nama || !nim || !alamat)
    return alert("Nama, NIM, dan Alamat wajib diisi.");

  if (idVal) {
    // UPDATE DATA
    const idNum = Number(idVal);
    const idx = data.findIndex((x) => x.id === idNum);
    if (idx >= 0) {
      data[idx].nama = nama;
      data[idx].nim = nim;
      data[idx].alamat = alamat;
    }
    alert("Data berhasil diperbarui.");
  } else {
    // CREATE DATA BARU
    data.push({ id: autoId++, nama, nim, alamat });
    alert("Data berhasil ditambahkan.");
  }

  saveData(data); // Simpan data

  const searchKeyword = elSearch.value.toLowerCase().trim();
  if (searchKeyword) {
    filteredData = data.filter(
      (m) =>
        m.nama.toLowerCase().includes(searchKeyword) ||
        m.nim.toLowerCase().includes(searchKeyword)
    );
  } else {
    filteredData = [...data];
  }

  render(); // Render ulang tabel
  form.reset(); // Reset form
  elId.value = "";
  elNama.focus(); // Fokus ke input nama
});

// ------------------- RESET FORM -------------------
btnReset.addEventListener("click", () => {
  form.reset();
  elId.value = "";
  elNama.focus();
});

// ------------------- HANDLER TOMBOL EDIT / HAPUS -------------------
tbody.addEventListener("click", (e) => {
  const editId = e.target.getAttribute("data-edit");
  const delId = e.target.getAttribute("data-del");

  if (editId) {
    // EDIT DATA
    const item = data.find((x) => x.id === Number(editId));
    if (item) {
      elId.value = item.id;
      elNama.value = item.nama;
      elNim.value = item.nim;
      elAlamat.value = item.alamat;
      elNama.focus();
    }
  }

  if (delId) {
    // DELETE DATA
    const idNum = Number(delId);
    if (confirm("Yakin hapus data ini?")) {
      data = data.filter((x) => x.id !== idNum);
      saveData(data);

      // sinkronkan filteredData lagi
      const searchKeyword = elSearch.value.toLowerCase().trim();
      if (searchKeyword) {
        filteredData = data.filter(
          (m) =>
            m.nama.toLowerCase().includes(searchKeyword) ||
            m.nim.toLowerCase().includes(searchKeyword)
        );
      } else {
        filteredData = [...data];
      }
      alert("Data berhasil dihapus.");
      render();
    }
  }
});

// ------------------- INIT -------------------
render(); // Render tabel saat halaman pertama kali dibuka
initSearchFromUrl(); // Inisialisasi pencarian dari URL
