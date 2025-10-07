// ------------------- PERSISTENSI DATA -------------------
const STORAGE_KEY = "crud_mahasiswa"; // Key localStorage

// Untuk inisialisasi data awal jika localStorage kosong
const initialData = [
  { id: 1, nama: "Andi Saputra", nim: "D121231038", alamat: "Makassar" }, // Teknik Informatika
  { id: 2, nama: "Budi Santoso", nim: "D021231039", alamat: "Jakarta" }, // Teknik Mesin
  { id: 3, nama: "Citra Dewi", nim: "D041221040", alamat: "Bandung" }, // Teknik Elektro
  { id: 4, nama: "Dewi Lestari", nim: "D011231041", alamat: "Surabaya" }, // Teknik Sipil
  { id: 5, nama: "Eko Prasetyo", nim: "D071221042", alamat: "Yogyakarta" }, // Teknik Industri
  { id: 6, nama: "Farhan Ahmad", nim: "D031231043", alamat: "Medan" }, // Teknik Perkapalan
  { id: 7, nama: "Gita Putri", nim: "D522221044", alamat: "Palembang" }, // Arsitektur
  { id: 8, nama: "Hariyanto", nim: "D061211045", alamat: "Balikpapan" }, // Teknik Geologi
  { id: 9, nama: "Intan Permata", nim: "D131221046", alamat: "Makassar" }, // Teknik Lingkungan
  { id: 10, nama: "Joko Susilo", nim: "D621201047", alamat: "Semarang" }, // Teknik Pertambangan
];

const loadData = () => {
  // Ambil data mentah dari localStorage
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored) {
    try {
      const parsed = JSON.parse(stored);

      // Validasi: harus array
      if (!Array.isArray(parsed)) {
        console.warn("Data localStorage bukan array, reset ke data awal.");
        throw new Error("Invalid data structure");
      }

      // Validasi tambahan:
      // tiap item harus punya struktur minimal { id, nama, nim, alamat }
      const isValidStructure = parsed.every(
        (item) =>
          typeof item === "object" &&
          item !== null &&
          "id" in item &&
          "nama" in item &&
          "nim" in item &&
          "alamat" in item
      );

      if (!isValidStructure) {
        console.warn(
          "Data localStorage tidak lengkap atau rusak, reset ke data awal."
        );
        throw new Error("Incomplete data schema");
      }

      // Semua valid, kembalikan data
      return parsed;
    } catch (e) {
      console.warn("Gagal memuat data localStorage, gunakan data awal.", e);
    }
  }

  // Tidak ada data, atau gagal parsing lakukan reset ke initialData
  saveData(initialData);
  return [...initialData];
};

// Simpan array data ke localStorage
const saveData = (list) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

// ------------------- HELPER FUNCTIONS -------------------
// Mapping kode fakultas dan departemen/prodi yang valid untuk Fakultas Teknik
const FAKULTAS_TEKNIK_CODES = {
  // Kode Fakultas Teknik
  fakultas: "D",

  // Kode Departemen/Prodi yang valid untuk Fakultas Teknik
  departemen: {
    "041": "Teknik Elektro",
    "021": "Teknik Mesin",
    521: "Teknik Mesin",
    621: "Teknik Pertambangan",
    111: "Teknik Pertambangan",
    "061": "Teknik Geologi",
    "071": "Teknik Industri",
    "033": "Teknologi Kebumian dan Lingkungan",
    "031": "Teknik Perkapalan",
    "091": "Teknik Sistem Perkapalan",
    101: "Teknik Perencanaan Wilayah dan Kota",
    "011": "Teknik Sipil",
    121: "Teknik Informatika",
    131: "Teknik Lingkungan",
    522: "Arsitektur",
    511: "Arsitektur",
    "012": "S2 Teknik Sipil",
    "072": "S2 Teknik Industri",
    "022": "S2 Teknik Mesin",
    "052": "S2 Teknik Perkapalan",
    "042": "S2 Ilmu Arsitektur",
    "053": "S3 - Teknik Elektro",
    "013": "S3 Teknik Sipil",
  },
};

// Fungsi untuk memvalidasi format NIM Fakultas Teknik
function validateNIMFakultasTeknik(nim) {
  if (!nim) {
    return { valid: false, message: "NIM tidak boleh kosong" };
  }

  const normalizedNim = nim.toUpperCase();
  const fakultasCode = normalizedNim.charAt(0);

  // 1. Prioritaskan cek awalan fakultas
  if (fakultasCode !== "D") {
    return {
      valid: false,
      message: "NIM harus diawali huruf 'D' atau 'd' untuk Fakultas Teknik",
    };
  }

  // 2. Baru setelah lolos, cek panjang NIM
  if (normalizedNim.length !== 10) {
    return {
      valid: false,
      message: "NIM harus terdiri dari 10 karakter",
    };
  }

  // 3. Sekarang aman untuk potong substring
  const departemenCode = normalizedNim.substring(1, 4);
  const tahunCode = normalizedNim.substring(4, 6);
  const nomorUrut = normalizedNim.substring(6, 10);

  // 4. Validasi kode departemen
  if (!FAKULTAS_TEKNIK_CODES.departemen[departemenCode]) {
    return {
      valid: false,
      message: `Kode departemen '${departemenCode}' (karakter ke-2 s.d. ke-4 dari NIM) tidak valid untuk Fakultas Teknik`,
    };
  }

  // 5. Validasi tahun dan nomor urut
  if (!/^\d{2}$/.test(tahunCode)) {
    return {
      valid: false,
      message: `Kode tahun '${tahunCode}' (karakter ke-5 s.d. ke-6 dari NIM) harus berupa 2 digit angka, misalnya '23' untuk angkatan 2023.`,
    };
  }

  if (!/^\d{4}$/.test(nomorUrut)) {
    return {
      valid: false,
      message: `Nomor urut '${nomorUrut}' (karakter ke-7 s.d. ke-10 dari NIM) harus berupa 4 digit angka, misalnya '0045'.`,
    };
  }
  // 6. Semua valid
  return {
    valid: true,
    message: "NIM valid",
    normalizedNim,
    info: {
      fakultas: "Fakultas Teknik",
      departemen: FAKULTAS_TEKNIK_CODES.departemen[departemenCode],
      tahun: tahunCode,
      nomorUrut,
    },
  };
}

// Fungsi untuk mengekstrak jurusan dari NIM
function getJurusanFromNim(nim) {
  // Validasi NIM terlebih dahulu
  const validation = validateNIMFakultasTeknik(nim);
  if (!validation.valid) return "N/A";

  // Gunakan normalized NIM
  const normalizedNim = validation.normalizedNim;

  // Ambil kode departemen (karakter 2-4)
  const departemenCode = normalizedNim.substring(1, 4);

  // Return nama jurusan dari mapping
  return FAKULTAS_TEKNIK_CODES.departemen[departemenCode] || "N/A";
}

// Fungsi untuk mengekstrak angkatan dari NIM
function getAngkatanFromNim(nim) {
  // Validasi NIM terlebih dahulu
  const validation = validateNIMFakultasTeknik(nim);
  if (!validation.valid) return "N/A";

  // Gunakan normalized NIM
  const normalizedNim = validation.normalizedNim;

  // Ambil karakter ke-5 dan ke-6 dari NIM (index 4 dan 5)
  // Contoh: D121231001 -> "23" -> 2023
  const tahunSingkat = normalizedNim.substring(4, 6);

  // Validasi apakah 2 karakter tersebut adalah angka
  if (!/^\d{2}$/.test(tahunSingkat)) return "N/A";

  // Konversi ke tahun penuh
  // Kampus berdiri tahun 1956, jadi:
  // 56-99 = 1956-1999, 00-55 = 2000-2055
  const tahun = parseInt(tahunSingkat, 10);
  if (Number.isNaN(tahun)) return "N/A";

  return tahun >= 56 ? `19${tahunSingkat}` : `20${tahunSingkat}`;
} // ------------------- STATE -------------------
let data = loadData(); // Array data mahasiswa
let autoId = data.reduce((m, o) => Math.max(m, o.id), 0) + 1; // Auto-increment ID
let filteredData = [...data];

const isDuplicateEntry = (nama, nim, excludeId = null) => {
  const targetNama = nama.toLowerCase();
  const targetNim = nim.toLowerCase();

  return data.some((item) => {
    if (excludeId !== null && item.id === excludeId) return false;

    const nimMatches = item.nim.toLowerCase() === targetNim;
    const namaMatches = item.nama.toLowerCase() === targetNama;

    return nimMatches || (namaMatches && nimMatches);
  });
};

// ------------------- ELEMENT HTML -------------------
const form = document.getElementById("form-mahasiswa");
const elId = document.getElementById("id");
const elNama = document.getElementById("nama");
const elNim = document.getElementById("nim");
const elAlamat = document.getElementById("alamat");
const tbody = document.getElementById("tbody");
const btnReset = document.getElementById("btn-reset");
const elSearch = document.getElementById("search");
const elFilterAngkatan = document.getElementById("filter-angkatan");
const filterWrapper = document.getElementById("filter-angkatan-wrapper");
const filterTrigger = filterWrapper.querySelector(".filter-trigger");
const filterOptions = filterWrapper.querySelectorAll(".filter-options li");
const filterTriggerLabel = filterWrapper.querySelector(".filter-trigger span");
const elSort = document.getElementById("sort");
const sortWrapper = document.getElementById("sort-wrapper");
const trigger = sortWrapper.querySelector(".trigger");
const options = sortWrapper.querySelectorAll(".options li");
const triggerLabel = sortWrapper.querySelector(".trigger span");
const tableSection = document.getElementById("table-section");
const btnDownloadPdf = document.getElementById("btn-download-pdf");
const fileUpload = document.getElementById("fileUpload");
const btnLogout = document.getElementById("btn-logout");

// ------------------- VALIDASI REAL-TIME NIM -------------------
// Tambahkan validasi real-time untuk input NIM
elNim.addEventListener("input", (e) => {
  const nim = e.target.value.trim();

  // Reset style input
  elNim.style.borderColor = "";

  // Hapus pesan error sebelumnya
  const existingError = document.querySelector(".nim-error-message");
  if (existingError) existingError.remove();

  if (nim.length > 0) {
    const validation = validateNIMFakultasTeknik(nim);

    if (!validation.valid) {
      elNim.style.borderColor = "#e53935";

      // Buat elemen pesan error
      const errorDiv = document.createElement("div");
      errorDiv.className = "nim-error-message";
      errorDiv.style.color = "#e53935";
      errorDiv.style.fontSize = "0.85rem";
      errorDiv.style.marginTop = "0.25rem";
      errorDiv.textContent = validation.message;

      elNim.parentNode.appendChild(errorDiv);
    } else if (nim.length === 10) {
      elNim.style.borderColor = "#43a047";

      const infoDiv = document.createElement("div");
      infoDiv.className = "nim-error-message";
      infoDiv.style.color = "#43a047";
      infoDiv.style.fontSize = "0.85rem";
      infoDiv.style.marginTop = "0.25rem";
      infoDiv.textContent = `✓ ${
        validation.info.departemen
      } - Angkatan ${getAngkatanFromNim(validation.normalizedNim)}`;

      elNim.parentNode.appendChild(infoDiv);
    }
  }
});

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
      <img src="../assets/no-data.svg" alt="Belum ada data"/>
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
      <img src="../assets/no-data.svg" alt="Data tidak ditemukan"/>
      <p>Data mahasiswa tidak ditemukan</p>
    `;
    tableSection.appendChild(notFoundData);
    return;
  }

  const sortedData = sortData(filteredData);

  sortedData.forEach((row, idx) => {
    const tr = document.createElement("tr");
    const angkatan = getAngkatanFromNim(row.nim);
    const jurusan = getJurusanFromNim(row.nim);
    tr.innerHTML = `
          <td>${idx + 1}</td>
          <td>${row.nama}</td>
          <td>${row.nim}</td>
          <td>${jurusan}</td>
          <td>${angkatan}</td>
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

// ------------------- FILTER ANGKATAN FUNCTIONALITY START -------------------
function populateAngkatanFilter() {
  // Ambil semua angkatan unik dari data
  const angkatanSet = new Set();

  data.forEach((mahasiswa) => {
    const angkatan = getAngkatanFromNim(mahasiswa.nim);
    if (angkatan && angkatan !== "N/A") {
      angkatanSet.add(angkatan);
    }
  });

  // Urutkan angkatan dari yang terbaru ke terlama
  const sortedAngkatan = Array.from(angkatanSet).sort((a, b) =>
    b.localeCompare(a)
  );

  // Hapus opsi yang ada kecuali "Semua Angkatan" untuk select
  while (elFilterAngkatan.children.length > 1) {
    elFilterAngkatan.removeChild(elFilterAngkatan.lastChild);
  }

  // Hapus opsi yang ada kecuali "Semua Angkatan" untuk dropdown visual
  const filterOptionsList = filterWrapper.querySelector(".filter-options");
  while (filterOptionsList.children.length > 1) {
    filterOptionsList.removeChild(filterOptionsList.lastChild);
  }

  // Tambahkan opsi angkatan
  sortedAngkatan.forEach((angkatan) => {
    // Tambah ke select (hidden)
    const option = document.createElement("option");
    option.value = angkatan;
    option.textContent = angkatan; // Hanya tahun tanpa "Angkatan"
    elFilterAngkatan.appendChild(option);

    // Tambah ke dropdown visual
    const li = document.createElement("li");
    li.setAttribute("data-value", angkatan);
    li.textContent = angkatan; // Hanya tahun tanpa "Angkatan"
    filterOptionsList.appendChild(li);
  });

  // Update event listeners untuk opsi baru
  updateFilterEventListeners();

  // Set tinggi dropdown sesuai dengan jumlah opsi
  const dropdownList = filterWrapper.querySelector(".filter-options");
  const optionCount = dropdownList.children.length;
  const optionHeight = 40; // Tinggi per opsi (padding + line-height)
  const maxHeight = Math.min(optionCount * optionHeight, 200); // Maksimal 200px

  dropdownList.style.setProperty("--max-height", `${maxHeight}px`);
}

// Fungsi untuk update event listeners filter
function updateFilterEventListeners() {
  const newFilterOptions = filterWrapper.querySelectorAll(".filter-options li");

  newFilterOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const value = option.getAttribute("data-value");
      const text = option.textContent;

      // Update label & value filter
      filterTriggerLabel.textContent = text;
      elFilterAngkatan.value = value;

      // Tutup dropdown
      filterWrapper.classList.remove("open");

      // Terapkan filter
      applyFilters();
    });
  });
}

// Trigger untuk membuka/menutup dropdown filter
filterTrigger.addEventListener("click", () => {
  filterWrapper.classList.toggle("open");
});

// Tutup dropdown filter jika klik di luar area
document.addEventListener("click", (e) => {
  if (!filterWrapper.contains(e.target)) {
    filterWrapper.classList.remove("open");
  }
});

// Event listener untuk filter angkatan (fallback)
elFilterAngkatan.addEventListener("change", () => {
  applyFilters();
});

// Fungsi untuk menerapkan semua filter (search + angkatan)
function applyFilters() {
  const searchKeyword = elSearch.value.toLowerCase().trim();
  const selectedAngkatan = elFilterAngkatan.value;

  filteredData = data.filter((m) => {
    const angkatan = getAngkatanFromNim(m.nim);
    const jurusan = getJurusanFromNim(m.nim);

    // Filter berdasarkan search keyword
    const matchesSearch =
      !searchKeyword ||
      m.nama.toLowerCase().includes(searchKeyword) ||
      m.nim.toLowerCase().includes(searchKeyword) ||
      jurusan.toLowerCase().includes(searchKeyword) ||
      angkatan.toLowerCase().includes(searchKeyword) ||
      m.alamat.toLowerCase().includes(searchKeyword);

    // Filter berdasarkan angkatan
    const matchesAngkatan = !selectedAngkatan || angkatan === selectedAngkatan;

    return matchesSearch && matchesAngkatan;
  });

  render();
}
// ------------------- FILTER ANGKATAN FUNCTIONALITY END -------------------

// ------------------- SEARCH FUNCTIONALITY START -------------------
function initSearchFromUrl() {
  // Inisialisasi nilai input pencarian dari URL saat halaman dimuat
  const params = new URLSearchParams(window.location.search);
  const searchKeyword = params.get("search") || "";

  if (searchKeyword) {
    // Jika ada keyword di URL, set ke input pencarian
    elSearch.value = searchKeyword;
  }

  // Terapkan filter
  applyFilters();
}

elSearch.addEventListener("input", (e) => {
  // Update URL tanpa reload halaman
  const params = new URLSearchParams(window.location.search);
  const searchKeyword = e.target.value.trim();

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

  // Terapkan filter
  applyFilters();
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
  } else if (sortValue === "angkatan-asc") {
    // urutkan data berdasarkan angkatan ascending
    return [...list].sort((a, b) => {
      const angkatanA = getAngkatanFromNim(a.nim);
      const angkatanB = getAngkatanFromNim(b.nim);
      return angkatanA.localeCompare(angkatanB);
    });
  } else if (sortValue === "angkatan-desc") {
    // urutkan data berdasarkan angkatan descending
    return [...list].sort((a, b) => {
      const angkatanA = getAngkatanFromNim(a.nim);
      const angkatanB = getAngkatanFromNim(b.nim);
      return angkatanB.localeCompare(angkatanA);
    });
  } else if (sortValue === "jurusan-asc") {
    // urutkan data berdasarkan jurusan ascending
    return [...list].sort((a, b) => {
      const jurusanA = getJurusanFromNim(a.nim);
      const jurusanB = getJurusanFromNim(b.nim);
      return jurusanA.localeCompare(jurusanB);
    });
  } else if (sortValue === "jurusan-desc") {
    // urutkan data berdasarkan jurusan descending
    return [...list].sort((a, b) => {
      const jurusanA = getJurusanFromNim(a.nim);
      const jurusanB = getJurusanFromNim(b.nim);
      return jurusanB.localeCompare(jurusanA);
    });
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

  // Judul utama PDF
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");

  // Ambil informasi filter angkatan untuk judul
  const selectedAngkatan = elFilterAngkatan.value;
  let judulPDF = "Daftar Mahasiswa Fakultas Teknik";

  // Tambahkan angkatan ke judul jika ada filter angkatan
  if (selectedAngkatan) {
    judulPDF += ` (Angkatan ${selectedAngkatan})`;
  }

  doc.text(judulPDF, 14, 20);

  let currentY = 30;

  // Ambil informasi filtering dan sorting
  const searchKeyword = elSearch.value.trim();
  const sortValue = elSort.value;

  // Keterangan filtering
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");

  if (searchKeyword) {
    doc.text(`Filter pencarian: "${searchKeyword}"`, 14, currentY);
    currentY += 7;
  }

  if (sortValue) {
    const sortLabels = {
      "nama-asc": "Diurutkan berdasarkan nama (A ke Z)",
      "nama-desc": "Diurutkan berdasarkan nama (Z ke A)",
      "nim-asc": "Diurutkan berdasarkan NIM (terkecil ke terbesar)",
      "nim-desc": "Diurutkan berdasarkan NIM (terbesar ke terkecil)",
      "angkatan-asc": "Diurutkan berdasarkan angkatan (angkatan lama ke baru)",
      "angkatan-desc": "Diurutkan berdasarkan angkatan (angkatan baru ke lama)",
      "jurusan-asc": "Diurutkan berdasarkan jurusan (A ke Z)",
      "jurusan-desc": "Diurutkan berdasarkan jurusan (Z ke A)",
    };

    if (sortLabels[sortValue]) {
      doc.text(sortLabels[sortValue], 14, currentY);
      currentY += 7;
    }
  }

  // Info total data
  doc.setFont(undefined, "italic");
  doc.text(
    `Total data yang ditampilkan: ${exportData.length} mahasiswa`,
    14,
    currentY
  );
  currentY += 5;

  // Tanggal export
  const now = new Date();

  // Fungsi untuk mendapatkan zona waktu Indonesia
  const getIndonesianTimeZone = () => {
    const offset = now.getTimezoneOffset() / -60; // Offset dalam jam

    switch (offset) {
      case 7:
        return "WIB"; // UTC+7 - Waktu Indonesia Barat
      case 8:
        return "WITA"; // UTC+8 - Waktu Indonesia Tengah
      case 9:
        return "WIT"; // UTC+9 - Waktu Indonesia Timur
      default:
        return `GMT${offset >= 0 ? "+" : ""}${offset}`; // Fallback untuk zona lain
    }
  };

  const tanggalExport = now.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const timeZone = getIndonesianTimeZone();

  doc.setFontSize(9);
  doc.setFont(undefined, "normal");
  doc.text(`Diekspor pada: ${tanggalExport} ${timeZone}`, 14, currentY);
  currentY += 15;

  // AutoTable untuk render tabel
  doc.autoTable({
    startY: currentY,
    head: [["No", "Nama", "NIM", "Jurusan", "Angkatan", "Alamat"]],
    body: exportData.map((m, idx) => [
      idx + 1,
      m.nama,
      m.nim,
      getJurusanFromNim(m.nim),
      getAngkatanFromNim(m.nim),
      m.alamat,
    ]),
    theme: "grid",
    headStyles: {
      fillColor: [25, 118, 210],
      textColor: 255,
      fontStyle: "bold",
    },
    styles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  // Generate nama file dinamis
  let fileName = "data_mahasiswa";

  // Tambahkan keterangan search jika ada
  if (searchKeyword) {
    const cleanKeyword = searchKeyword
      .replace(/[^a-zA-Z0-9]/g, "_")
      .toLowerCase();
    fileName += `_filter_${cleanKeyword}`;
  }

  // Tambahkan keterangan angkatan jika ada
  if (selectedAngkatan) {
    fileName += `_angkatan_${selectedAngkatan}`;
  }

  // Tambahkan keterangan sort jika ada
  if (sortValue) {
    const sortSuffixes = {
      "nama-asc": "nama_az",
      "nama-desc": "nama_za",
      "nim-asc": "nim_09",
      "nim-desc": "nim_90",
      "angkatan-asc": "angkatan_lama_baru",
      "angkatan-desc": "angkatan_baru_lama",
      "jurusan-asc": "jurusan_az",
      "jurusan-desc": "jurusan_za",
    };

    if (sortSuffixes[sortValue]) {
      fileName += `_sort_${sortSuffixes[sortValue]}`;
    }
  }

  // Tambahkan timestamp dengan waktu lokal
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  const timestamp = `${year}${month}${day}_${hours}${minutes}`;
  fileName += `_${timestamp}`;

  // Simpan PDF dengan nama file dinamis
  doc.save(`${fileName}.pdf`);
});
// ---------------- DOWNLOAD PDF FUNCTIONALITY END ----------------

// ---------------- UPLOAD FILE FUNCTIONALITY START ----------------
fileUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // ambil ekstensi file
  const ext = file.name.split(".").pop().toLowerCase();
  const reader = new FileReader();

  let importedCount = 0; // Counter data yang berhasil diimport
  let duplicateCount = 0; // Counter data duplikat yang di-skip
  let invalidCount = 0; // Counter data dengan NIM tidak valid
  let invalidDetails = []; // Detail data yang tidak valid

  if (ext === "csv") {
    // Baca CSV
    reader.onload = (event) => {
      const text = event.target.result; // isi file CSV dalam bentuk teks
      const rows = text.split("\n").map((r) => r.split(",")); // pecah baris & kolom
      rows.forEach((row, idx) => {
        if (idx === 0) return; // skip header
        const [nama, nim, alamat] = row.map((c) => c.trim()); // ambil kolom
        if (nama && nim && alamat) {
          // Validasi format NIM terlebih dahulu
          const nimValidation = validateNIMFakultasTeknik(nim);
          if (!nimValidation.valid) {
            invalidCount++;
            invalidDetails.push(
              `Baris ${idx + 1}: ${nim} - ${nimValidation.message}`
            );
            return; // skip baris ini
          }

          // Gunakan normalized NIM
          const normalizedNim = nimValidation.normalizedNim;

          // Cek apakah data sudah ada
          if (!isDuplicateEntry(nama, normalizedNim)) {
            data.push({ id: autoId++, nama, nim: normalizedNim, alamat }); // tambah ke data untuk setiap baris
            importedCount++;
          } else {
            duplicateCount++;
          }
        }
      });
      saveData(data); // simpan data ke localStorage
      populateAngkatanFilter(); // Update filter angkatan
      applyFilters(); // Terapkan filter yang aktif

      // Buat laporan hasil import
      let reportMessage = "Import CSV selesai!\n\n";
      reportMessage += `Berhasil: ${importedCount} data\n`;
      if (duplicateCount > 0) {
        reportMessage += `Duplikat: ${duplicateCount} data\n`;
      }
      if (invalidCount > 0) {
        reportMessage += `Gagal: ${invalidCount} data (NIM tidak valid)\n`;
      }

      alert(reportMessage);
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
          // Validasi format NIM terlebih dahulu
          const nimValidation = validateNIMFakultasTeknik(nim);
          if (!nimValidation.valid) {
            invalidCount++;
            invalidDetails.push(
              `Baris ${idx + 1}: ${nim} - ${nimValidation.message}`
            );
            return; // skip baris ini
          }

          // Gunakan normalized NIM
          const normalizedNim = nimValidation.normalizedNim;

          // Cek apakah data sudah ada
          if (!isDuplicateEntry(nama, normalizedNim)) {
            data.push({ id: autoId++, nama, nim: normalizedNim, alamat }); // tambah ke data untuk setiap baris
            importedCount++;
          } else {
            duplicateCount++;
          }
        }
      });
      saveData(data); // simpan data ke localStorage
      populateAngkatanFilter(); // Update filter angkatan
      applyFilters(); // Terapkan filter yang aktif

      // Buat laporan hasil import
      let reportMessage = "Import XLSX selesai!\n\n";
      reportMessage += `Berhasil: ${importedCount} data\n`;
      if (duplicateCount > 0) {
        reportMessage += `Duplikat: ${duplicateCount} data\n`;
      }
      if (invalidCount > 0) {
        reportMessage += `Gagal: ${invalidCount} data (NIM tidak valid)\n`;
      }

      alert(reportMessage);
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

  // Validasi format NIM Fakultas Teknik
  const nimValidation = validateNIMFakultasTeknik(nim);
  if (!nimValidation.valid) {
    return alert(`Format NIM tidak valid: ${nimValidation.message}`);
  }

  // Gunakan normalized NIM (huruf besar)
  const normalizedNim = nimValidation.normalizedNim;

  if (idVal) {
    // UPDATE DATA
    const idNum = Number(idVal);
    if (isDuplicateEntry(nama, normalizedNim, idNum)) {
      return alert("Nama dan NIM tersebut sudah terdaftar pada data lain.");
    }
    const idx = data.findIndex((x) => x.id === idNum);
    if (idx >= 0) {
      data[idx].nama = nama;
      data[idx].nim = normalizedNim;
      data[idx].alamat = alamat;
    }
    alert("Data berhasil diperbarui.");
  } else {
    // CREATE DATA BARU
    if (isDuplicateEntry(nama, normalizedNim)) {
      return alert("Nama dan NIM tersebut sudah terdaftar.");
    }
    data.push({ id: autoId++, nama, nim: normalizedNim, alamat });
    alert("Data berhasil ditambahkan.");
  }

  saveData(data); // Simpan data
  populateAngkatanFilter(); // Update filter angkatan
  applyFilters(); // Terapkan filter yang aktif

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
      populateAngkatanFilter(); // Update filter angkatan
      applyFilters(); // Terapkan filter yang aktif
      alert("Data berhasil dihapus.");
    }
  }
});

// ------------------- LOGOUT FUNCTIONALITY -------------------
if (btnLogout) {
  btnLogout.addEventListener("click", () => {
    if (confirm("Yakin ingin keluar?")) {
      sessionStorage.removeItem("crud_active_user"); // hapus session
      window.location.href = "./login.html";
    }
  });
}

// ------------------- SESSION VALIDATION -------------------
// Cek apakah user sudah login sebelum akses dasbor
(function checkSession() {
  const activeUser = sessionStorage.getItem("crud_active_user");
  if (!activeUser) {
    alert("Silakan login terlebih dahulu!");
    window.location.href = "./login.html";
  }
})();

// ------------------- INIT -------------------
populateAngkatanFilter(); // Isi opsi filter angkatan
render(); // Render tabel saat halaman pertama kali dibuka
initSearchFromUrl(); // Inisialisasi pencarian dari URL
