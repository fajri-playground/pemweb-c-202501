// ------------------- PERSISTENSI DATA -------------------
const STORAGE_KEY = "crud_mahasiswa"; // Key localStorage
// URL foto default dan legacy untuk normalisasi data lama
const DEFAULT_FOTO_URL = "../assets/foto/foto_mahasiswa_laki.png";
const LEGACY_DEFAULT_FOTO_URL =
  "https://rencanamu.id/assets/file_uploaded/blog/1467066493-maba.jpg";
const LEGACY_ICON_FOTO_URL = "../assets/user-solid-full.svg";

// Untuk inisialisasi data awal jika localStorage kosong
const initialDataSource =
  typeof window !== "undefined" && Array.isArray(window.INITIAL_MAHASISWA_DATA)
    ? window.INITIAL_MAHASISWA_DATA
    : [];

if (!Array.isArray(initialDataSource) || initialDataSource.length === 0) {
  console.warn(
    "INITIAL_MAHASISWA_DATA tidak ditemukan. Inisialisasi data awal sebagai array kosong."
  );
}

// Salin data awal untuk mencegah mutasi pada data asli
const initialData = initialDataSource.map((item) => ({ ...item }));

// Muat data mahasiswa dari storage, fallback ke data awal bila kosong.
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

      // Semua valid, kembalikan data yang sudah dinormalisasi
      return parsed.map(normalizeMahasiswaRecord);
    } catch (e) {
      console.warn("Gagal memuat data localStorage, gunakan data awal.", e);
    }
  }

  // Tidak ada data, atau gagal parsing lakukan reset ke initialData
  const normalizedInitialData = initialData.map(normalizeMahasiswaRecord);
  saveData(normalizedInitialData);
  return normalizedInitialData;
};

// Simpan array data ke localStorage
const saveData = (list) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

// ------------------- HELPER FUNCTIONS -------------------
const normalizeFotoUrl = (value) => {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed || trimmed === "-") return "";
  if (trimmed === LEGACY_DEFAULT_FOTO_URL || trimmed === LEGACY_ICON_FOTO_URL) {
    return DEFAULT_FOTO_URL;
  }
  return trimmed;
};

// Normalisasi input jenis kelamin ke format standar.
const sanitizeJenisKelamin = (value) => {
  if (!value || (typeof value !== "string" && typeof value !== "number"))
    return "";

  const normalized = String(value).trim().toLowerCase();
  if (!normalized) return "";

  if (
    normalized === "laki-laki" ||
    normalized === "laki laki" ||
    normalized === "pria" ||
    normalized === "male"
  ) {
    return "Laki-laki";
  }

  if (
    normalized === "perempuan" ||
    normalized === "wanita" ||
    normalized === "female"
  ) {
    return "Perempuan";
  }

  return "";
};

// ------------------- CUSTOM DROPDOWN UTILS -------------------
const customSelectInstances = [];

/**
 * Membuat dropdown kustom berbasis elemen <select> agar gaya & interaksinya konsisten.
 * Pendekatan ini mirip dropdown filter angkatan, tetapi cukup dipanggil sekali per select
 * sehingga kita tidak menulis ulang event handler untuk tiap dropdown baru.
 */
// Inisialisasi dropdown kustom agar tampilan konsisten.
function setupCustomSelect(selectEl, config = {}) {
  if (!selectEl) return null;

  const shell = selectEl.closest(".select-shell");
  if (!shell || shell.dataset.customSelectInitialized === "true") {
    return (
      customSelectInstances.find((inst) => inst.select === selectEl) || null
    );
  }

  let instanceRef = null;

  shell.dataset.customSelectInitialized = "true";
  shell.classList.add("custom-select");
  selectEl.classList.add("custom-select-native");

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "custom-select-trigger";
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");

  const labelSpan = document.createElement("span");
  labelSpan.className = "custom-select-label";

  const icon = document.createElement("img");
  icon.src = "../assets/fa-chevron-down.svg";
  icon.alt = "";
  icon.className = "icon-sort";

  trigger.append(labelSpan, icon);

  const optionsList = document.createElement("ul");
  optionsList.className = "custom-select-options";
  optionsList.setAttribute("role", "listbox");

  if (config.maxHeight) {
    optionsList.style.maxHeight = `${config.maxHeight}px`;
  }

  const optionsId =
    (selectEl.id || selectEl.name || "custom-select") + "-options";
  optionsList.id = optionsId;
  trigger.setAttribute("aria-controls", optionsId);

  shell.append(trigger, optionsList);

  // Ambil label opsi dari config atau fallback teks.
  const getOptionLabel = (option) =>
    typeof config.getOptionLabel === "function"
      ? config.getOptionLabel(option)
      : option.textContent;

  // Isi ulang konten elemen target dengan fallback jika kosong.
  const setContent = (target, content, fallback = "") => {
    target.innerHTML = "";
    let value = content;
    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.length === 0)
    ) {
      value = fallback;
    }

    if (value instanceof Node) {
      target.appendChild(value.cloneNode(true));
      return;
    }

    target.textContent =
      typeof value === "string" ? value : String(value ?? "");
  };

  // Rekonstruksi item dropdown berdasarkan opsi asli.
  const buildOptions = () => {
    optionsList.innerHTML = "";
    const fragment = document.createDocumentFragment();

    Array.from(selectEl.options).forEach((option) => {
      if (option.hidden) return;

      const item = document.createElement("li");
      item.dataset.value = option.value;
      item.setAttribute("role", "option");
      setContent(
        item,
        getOptionLabel(option),
        (option.textContent || option.value || "").trim()
      );

      if (option.disabled) {
        item.classList.add("disabled");
        item.setAttribute("aria-disabled", "true");
      }

      if (option.selected) {
        item.classList.add("active");
      }

      fragment.appendChild(item);
    });

    optionsList.appendChild(fragment);
  };

  // Segarkan label tombol trigger sesuai pilihan aktif.
  const updateLabel = () => {
    const selected = selectEl.options[selectEl.selectedIndex];
    const fallbackLabel =
      config.placeholder !== undefined ? config.placeholder : "Pilih...";
    const labelContent = selected ? getOptionLabel(selected) : null;
    setContent(labelSpan, labelContent, fallbackLabel);

    Array.from(optionsList.children).forEach((item) => {
      item.classList.toggle("active", item.dataset.value === selectEl.value);
    });
  };

  // Tutup dropdown custom select.
  const close = () => {
    shell.classList.remove("open");
    trigger.setAttribute("aria-expanded", "false");
  };

  // Buka dropdown dan pastikan dropdown lain tertutup.
  const open = () => {
    customSelectInstances.forEach((instance) => {
      if (instance !== instanceRef) {
        instance.close();
      }
    });

    shell.classList.add("open");
    trigger.setAttribute("aria-expanded", "true");
  };

  // Toggle antara open/close pada dropdown.
  const toggle = () => {
    if (shell.classList.contains("open")) {
      close();
    } else {
      open();
    }
  };

  // Pilih nilai tertentu dan trigger event change.
  const selectOption = (value) => {
    if (selectEl.value !== value) {
      selectEl.value = value;
      selectEl.dispatchEvent(new Event("change", { bubbles: true }));
    }

    updateLabel();
    close();
  };

  optionsList.addEventListener("click", (event) => {
    const item = event.target.closest("li");
    if (!item || item.classList.contains("disabled")) return;
    selectOption(item.dataset.value);
  });

  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    toggle();
  });

  trigger.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      toggle();
    } else if (event.key === "Escape") {
      close();
    }
  });

  selectEl.addEventListener("change", () => {
    updateLabel();
    if (typeof config.onChange === "function") {
      config.onChange(selectEl.value);
    }
  });

  const observer = new MutationObserver(() => {
    buildOptions();
    updateLabel();
  });

  observer.observe(selectEl, { childList: true });

  buildOptions();
  updateLabel();

  instanceRef = {
    root: shell,
    select: selectEl,
    trigger,
    optionsList,
    open,
    close,
    refresh: () => {
      buildOptions();
      updateLabel();
    },
  };

  customSelectInstances.push(instanceRef);
  return instanceRef;
}

document.addEventListener("click", (event) => {
  customSelectInstances.forEach((instance) => {
    if (!instance.root.contains(event.target)) {
      instance.close();
    }
  });
});

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

  // 6. Validasi rentang tahun yang diizinkan (2000-2025)
  const tahunInt = parseInt(tahunCode, 10);
  if (tahunInt < 0 || tahunInt > 25) {
    return {
      valid: false,
      message: `Kode tahun '${tahunCode}' harus dalam rentang 00-25 (angkatan 2000-2025).`,
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
  // Batasan angkatan: minimal 2000, maksimal 2025
  // 00-25 = 2000-2025
  const tahun = parseInt(tahunSingkat, 10);
  if (Number.isNaN(tahun)) return "N/A";

  // Validasi rentang angkatan yang diizinkan (2000-2025)
  if (tahun >= 0 && tahun <= 25) {
    return `20${tahunSingkat}`;
  }

  // Jika di luar rentang yang diizinkan, return N/A
  return "N/A";
}

// Normalisasi satu entri mahasiswa sebelum disimpan.
function normalizeMahasiswaRecord(entry) {
  if (!entry || typeof entry !== "object") {
    return {
      id: Date.now(),
      nama: "",
      nim: "",
      programStudi: "",
      angkatan: "",
      alamat: "",
      email: "",
      ipk: "",
      catatan: "",
      jenisKelamin: "",
      fotoUrl: DEFAULT_FOTO_URL,
    };
  }

  const normalizedNim = entry.nim ? String(entry.nim).toUpperCase() : "";
  const fallbackJurusan = getJurusanFromNim(normalizedNim);
  const fallbackAngkatan = getAngkatanFromNim(normalizedNim);
  const normalizedJenisKelamin = sanitizeJenisKelamin(entry.jenisKelamin);

  const rawIpk =
    entry.ipk === null || entry.ipk === undefined || entry.ipk === ""
      ? ""
      : Number(entry.ipk);
  const sanitizedIpk = Number.isFinite(rawIpk) ? rawIpk : "";

  return {
    ...entry,
    nim: normalizedNim,
    programStudi:
      entry.programStudi && String(entry.programStudi).trim().length > 0
        ? String(entry.programStudi).trim()
        : fallbackJurusan !== "N/A"
        ? fallbackJurusan
        : "",
    angkatan:
      entry.angkatan && String(entry.angkatan).trim().length > 0
        ? String(entry.angkatan).trim()
        : fallbackAngkatan !== "N/A"
        ? fallbackAngkatan
        : "",
    alamat: entry.alamat || "",
    email: entry.email || "",
    ipk: sanitizedIpk,
    catatan: entry.catatan || "",
    jenisKelamin: normalizedJenisKelamin,
    fotoUrl: normalizeFotoUrl(entry.fotoUrl),
  };
}

// Ambil label program studi dengan fallback dari NIM.
function getProgramStudiDisplay(mahasiswa) {
  if (!mahasiswa) return "-";
  if (mahasiswa.programStudi && mahasiswa.programStudi.trim().length > 0) {
    return mahasiswa.programStudi;
  }
  const jurusan = getJurusanFromNim(mahasiswa.nim);
  return jurusan !== "N/A" ? jurusan : "-";
}

// Ambil label angkatan dengan fallback dari NIM.
function getAngkatanDisplay(mahasiswa) {
  if (!mahasiswa) return "-";
  if (mahasiswa.angkatan && String(mahasiswa.angkatan).trim().length > 0) {
    return String(mahasiswa.angkatan).trim();
  }
  const fallback = getAngkatanFromNim(mahasiswa.nim);
  return fallback !== "N/A" ? fallback : "-";
}

// Format angka IPK menjadi dua digit desimal.
function formatIpk(ipk) {
  if (ipk === "" || ipk === null || ipk === undefined) return "-";
  const numeric = Number(ipk);
  if (Number.isNaN(numeric)) return "-";
  return numeric.toFixed(2);
}

// Hitung rata-rata IPK dari kumpulan data.
function calculateAverageIpk(records) {
  if (!Array.isArray(records) || records.length === 0) return null;
  let sum = 0;
  let count = 0;

  records.forEach((item) => {
    const numeric = Number(item?.ipk);
    if (!Number.isNaN(numeric)) {
      sum += numeric;
      count += 1;
    }
  });

  return count > 0 ? sum / count : null;
}

// Escape karakter berbahaya sebelum ditampilkan di HTML.
function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ------------------- PAGINATION HELPERS -------------------
// Hitung total halaman berdasarkan jumlah data terfilter dan entri per halaman.
function getTotalPages() {
  return Math.ceil(filteredData.length / entriesPerPage);
}

// Ambil data sesuai halaman dan jumlah entri per halaman.
function getPaginatedData() {
  const sortedData = sortData(filteredData);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  return sortedData.slice(startIndex, endIndex);
}

// Perbarui teks informasi paginasi saat render.
function updatePaginationInfo() {
  const totalPages = getTotalPages();

  // Update pagination info
  if (elPaginationInfo) {
    elPaginationInfo.textContent =
      totalPages > 0
        ? `Halaman ${currentPage} dari ${totalPages}`
        : "Halaman 0 dari 0";
  }

  // Update pagination buttons state
  if (btnPrevPage) {
    const prevDisabled = currentPage <= 1 || totalPages === 0;
    btnPrevPage.disabled = prevDisabled;
    btnPrevPage.setAttribute("aria-disabled", String(prevDisabled));
  }
  if (btnNextPage) {
    const nextDisabled = totalPages === 0 || currentPage >= totalPages;
    btnNextPage.disabled = nextDisabled;
    btnNextPage.setAttribute("aria-disabled", String(nextDisabled));
  }
}

// Bangun daftar nomor halaman untuk navigasi.
function buildPaginationSequence(totalPages, currentPage, siblings = 1) {
  if (totalPages <= 0) return [];
  const totalNumbersToShow = siblings * 2 + 5;

  if (totalPages <= totalNumbersToShow) {
    return Array.from({ length: totalPages }, (_, idx) => idx + 1);
  }

  const sequence = [1];
  let leftSibling = Math.max(currentPage - siblings, 2);
  let rightSibling = Math.min(currentPage + siblings, totalPages - 1);

  if (leftSibling <= 2) {
    leftSibling = 2;
    rightSibling = Math.min(2 + siblings * 2, totalPages - 1);
  }

  if (rightSibling >= totalPages - 1) {
    rightSibling = totalPages - 1;
    leftSibling = Math.max(totalPages - (siblings * 2 + 1), 2);
  }

  if (leftSibling > 2) {
    sequence.push("ellipsis-left");
  }

  for (let page = leftSibling; page <= rightSibling; page++) {
    sequence.push(page);
  }

  if (rightSibling < totalPages - 1) {
    sequence.push("ellipsis-right");
  }

  sequence.push(totalPages);
  return sequence;
}

// Render tombol halaman berdasarkan urutan paginasi.
function renderPaginationPages() {
  if (!paginationPagesContainer) return;

  const totalPages = getTotalPages();
  paginationPagesContainer.innerHTML = "";

  if (totalPages <= 1) {
    paginationPagesContainer.setAttribute("aria-hidden", "true");
    paginationPagesContainer.classList.add("is-hidden");
    return;
  }

  paginationPagesContainer.removeAttribute("aria-hidden");
  paginationPagesContainer.classList.remove("is-hidden");

  const sequence = buildPaginationSequence(totalPages, currentPage);

  sequence.forEach((item) => {
    if (typeof item === "string" && item.startsWith("ellipsis")) {
      const ellipsis = document.createElement("span");
      ellipsis.className = "pagination-ellipsis";
      ellipsis.setAttribute("aria-hidden", "true");
      ellipsis.textContent = "…";
      paginationPagesContainer.appendChild(ellipsis);
      return;
    }

    const pageNumber = item;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pagination-page-btn";
    button.textContent = pageNumber;
    button.setAttribute("aria-label", `Halaman ${pageNumber}`);
    button.dataset.page = String(pageNumber);

    if (pageNumber === currentPage) {
      button.classList.add("is-active");
      button.setAttribute("aria-current", "page");
    }

    button.addEventListener("click", () => {
      if (pageNumber === currentPage) return;
      currentPage = pageNumber;
      render();
    });

    paginationPagesContainer.appendChild(button);
  });
}

// Reset ke halaman pertama setiap kali filter berubah.
function resetToFirstPage() {
  currentPage = 1;
}

// ------------------- ACTIVE FILTER DISPLAY HELPERS -------------------
function updateActiveFilterDisplay() {
  const selectedProdi = elFilterProdi.value;
  const selectedAngkatan = elFilterAngkatan.value;
  const selectedSortValue = elSort ? elSort.value : "";
  const selectedSortOption =
    elSort && elSort.selectedIndex >= 0
      ? elSort.options[elSort.selectedIndex]
      : null;
  const selectedSortLabel = selectedSortOption
    ? selectedSortOption.textContent.trim()
    : "";

  // Update Program Studi filter display
  if (selectedProdi && activeProdiFilter) {
    activeProdiFilter.querySelector(".filter-value").textContent =
      selectedProdi;
    activeProdiFilter.style.display = "inline-flex";
  } else if (activeProdiFilter) {
    activeProdiFilter.style.display = "none";
  }

  // Update Angkatan filter display
  if (selectedAngkatan && activeAngkatanFilter) {
    activeAngkatanFilter.querySelector(".filter-value").textContent =
      selectedAngkatan;
    activeAngkatanFilter.style.display = "inline-flex";
  } else if (activeAngkatanFilter) {
    activeAngkatanFilter.style.display = "none";
  }

  // Update sort filter display
  if (activeSortFilter) {
    if (selectedSortValue) {
      activeSortFilter.querySelector(".filter-value").textContent =
        selectedSortLabel || "Default";
      activeSortFilter.style.display = "inline-flex";
      activeSortFilter.setAttribute("data-sort-active", "true");
    } else {
      activeSortFilter.style.display = "none";
      activeSortFilter.setAttribute("data-sort-active", "false");
    }
  }

  // Update total data display
  updateTotalDataDisplay();
}

// Tampilkan total data saat ini dan keseluruhan.
function updateTotalDataDisplay() {
  if (elTableTotalData) {
    const currentDataCount = filteredData.length;
    const totalDataCount = data.length;

    elTableTotalData.textContent = `${currentDataCount} Data`;

    // Update the total info
    const totalInfoSpan = document.querySelector(".total-info");
    if (totalInfoSpan) {
      totalInfoSpan.textContent = `Total ${totalDataCount} Mahasiswa`;
    }
  }

  if (elAverageIpk) {
    const filteredAverage = calculateAverageIpk(filteredData);
    const totalAverage = calculateAverageIpk(data);
    const filteredText =
      filteredAverage !== null ? filteredAverage.toFixed(2) : "-";
    const totalText = totalAverage !== null ? totalAverage.toFixed(2) : "-";

    if (elAverageIpkCurrentValue) {
      elAverageIpkCurrentValue.textContent = filteredText;
    }
    if (elAverageIpkTotalValue) {
      elAverageIpkTotalValue.textContent = totalText;
    }
  }
}

// Kosongkan semua filter dan kembalikan ke default.
function resetAllFilters() {
  // Reset filter values
  if (elFilterProdi) elFilterProdi.value = "";
  if (elFilterAngkatan) elFilterAngkatan.value = "";
  if (elSearch) elSearch.value = "";
  if (elSort) elSort.value = "";

  // Update custom selects
  refreshCustomSelect(elFilterProdi);
  refreshCustomSelect(elSort);

  // Update angkatan filter trigger
  if (filterTriggerLabel) {
    filterTriggerLabel.textContent = "Semua Angkatan";
  }

  // Reset pagination
  resetToFirstPage();

  // Apply filters (which will clear all filters)
  applyFilters();

  // Update active filter display
  updateActiveFilterDisplay();
}

// ------------------- STATE -------------------
let data = loadData(); // Array data mahasiswa
let autoId = data.reduce((m, o) => Math.max(m, o.id), 0) + 1; // Auto-increment ID
let filteredData = [...data];

// Pagination state
let currentPage = 1;
let entriesPerPage = 10;

// Cek apakah nama dan NIM sudah terdaftar.
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
const elProgramStudi = document.getElementById("program-studi");
const elAngkatan = document.getElementById("angkatan");
const elEmail = document.getElementById("email");
const elIpk = document.getElementById("ipk");
const elCatatan = document.getElementById("catatan");
const elJenisKelamin = document.getElementById("jenis-kelamin");
const elFotoUpload = document.getElementById("foto-upload");
const elFotoPreviewImg = document.getElementById("foto-preview-img");
const elFotoPreviewContainer = document.querySelector(".foto-preview");
const btnSubmit = document.getElementById("btn-simpan");
const elFormFeedback = document.getElementById("form-feedback");
const tbody = document.getElementById("tbody");
const btnReset = document.getElementById("btn-reset");
const elSearch = document.getElementById("search");
const elEntriesPerPage = document.getElementById("entries-per-page");
const elFilterProdi = document.getElementById("filter-prodi");
const elFilterAngkatan = document.getElementById("filter-angkatan");
const filterWrapper = document.getElementById("filter-angkatan-wrapper");
const filterTrigger = filterWrapper
  ? filterWrapper.querySelector(".filter-trigger")
  : null;
const filterTriggerLabel = filterWrapper
  ? filterWrapper.querySelector(".filter-trigger span")
  : null;
const elSort = document.getElementById("sort");
const tableSection = document.getElementById("table-section");
const btnDownloadPdf = document.getElementById("btn-download-pdf");
const fileUpload = document.getElementById("fileUpload");
const jsonUpload = document.getElementById("jsonUpload");
const btnLogout = document.getElementById("btn-logout");
const catatanLabel = document.querySelector('label[for="catatan"]');

// Pagination and table control elements
const elTableTotalData = document.getElementById("table-total-data");
const elPaginationInfo = document.getElementById("pagination-info");
const btnPrevPage = document.getElementById("btn-prev-page");
const btnNextPage = document.getElementById("btn-next-page");
const paginationPagesContainer = document.getElementById("pagination-pages");
const btnPilihSemua = document.getElementById("btn-pilih-semua");
const btnHapusTerpilih = document.getElementById("btn-hapus-terpilih");
const btnHapusSemua = document.getElementById("btn-hapus-semua");
const checkboxSelectAll = document.getElementById("checkbox-select-all");

// Active filter display elements
const btnResetFilters = document.getElementById("btn-reset-filters");
const activeProdiFilter = document.getElementById("active-prodi-filter");
const activeAngkatanFilter = document.getElementById("active-angkatan-filter");
const activeSortFilter = document.getElementById("active-sort-filter");
const elAverageIpk = document.getElementById("table-average-ipk");
const elAverageIpkCurrentValue = elAverageIpk
  ? elAverageIpk.querySelector('[data-role="ipk-current"]')
  : null;
const elAverageIpkTotalValue = elAverageIpk
  ? elAverageIpk.querySelector('[data-role="ipk-total"]')
  : null;

// Rapikan teks catatan agar konsisten.
const normalizeCatatanInput = (value) =>
  String(value)
    .replace(/\u00a0/g, " ")
    .replace(/\r\n/g, "\n");

// Ambil nilai catatan dari elemen contenteditable.
const getCatatanValue = () => {
  if (!elCatatan) return "";
  return normalizeCatatanInput(elCatatan.innerText).trim();
};

// Set nilai catatan ke elemen contenteditable.
const setCatatanValue = (value = "") => {
  if (!elCatatan) return;
  const safeValue =
    value === null || value === undefined ? "" : normalizeCatatanInput(value);
  elCatatan.textContent = safeValue;
};

// Kosongkan isi catatan pada form.
const clearCatatanValue = () => {
  if (!elCatatan) return;
  elCatatan.textContent = "";
};

if (catatanLabel && elCatatan) {
  catatanLabel.addEventListener("click", () => {
    elCatatan.focus();
  });
}

if (elCatatan) {
  clearCatatanValue();
}

// Cari elemen pembungkus .form-group terdekat untuk field tertentu.
const getFormGroup = (element) => {
  if (!element) return null;
  if (element.classList && element.classList.contains("form-group")) {
    return element;
  }
  return element.closest(".form-group");
};

// Fokuskan field atau trigger custom select jika tersedia.
const ensureFieldFocus = (field) => {
  if (!field) return;
  const instance = customSelectRegistry.get(field);
  if (
    instance &&
    instance.trigger &&
    typeof instance.trigger.focus === "function"
  ) {
    instance.trigger.focus();
    return;
  }
  if (typeof field.focus === "function") {
    field.focus();
  }
};

// Hapus status error pada field tertentu.
const clearFieldError = (field) => {
  const group = getFormGroup(field);
  if (!group) return;
  group.classList.remove("has-error");
  const feedback = group.querySelector(".field-error");
  if (feedback) {
    feedback.remove();
  }
  if (field && typeof field.setAttribute === "function") {
    field.setAttribute("aria-invalid", "false");
  }
};

// Tampilkan pesan error di bawah field.
const setFieldError = (field, message) => {
  const group = getFormGroup(field);
  if (!group) return;
  group.classList.add("has-error");
  let feedback = group.querySelector(".field-error");
  if (!feedback) {
    feedback = document.createElement("span");
    feedback.className = "field-error";
    group.appendChild(feedback);
  }
  feedback.textContent = message;
  if (field && typeof field.setAttribute === "function") {
    field.setAttribute("aria-invalid", "true");
  }
};

// Tandai field invalid tanpa menduplikasi pesan.
const flagFieldInvalid = (field) => {
  const group = getFormGroup(field);
  if (group) {
    group.classList.add("has-error");
    const feedback = group.querySelector(".field-error");
    if (feedback) {
      feedback.remove();
    }
    group
      .querySelectorAll(".nim-feedback-message")
      .forEach((node) => node.remove());
  }
  if (field && typeof field.setAttribute === "function") {
    field.setAttribute("aria-invalid", "true");
  }
};

// Reset status error untuk seluruh field pada form.
const clearAllFieldErrors = () => {
  if (!form) return;
  const erroredGroups = form.querySelectorAll(".form-group.has-error");
  erroredGroups.forEach((group) => {
    group.classList.remove("has-error");
    const feedback = group.querySelector(".field-error");
    if (feedback) {
      feedback.remove();
    }
  });
  [
    elNama,
    elNim,
    elAlamat,
    elProgramStudi,
    elAngkatan,
    elEmail,
    elIpk,
    elJenisKelamin,
    elCatatan,
  ].forEach((field) => {
    if (field) {
      field.setAttribute("aria-invalid", "false");
    }
  });
};

// Tampilkan pesan global di area feedback form.
const showFormFeedback = (message, type = "info") => {
  if (!elFormFeedback) return;
  elFormFeedback.textContent = message;
  elFormFeedback.dataset.type = type;
  elFormFeedback.classList.remove("is-hidden");
};

// Sembunyikan pesan global form.
const clearFormFeedback = () => {
  if (!elFormFeedback) return;
  elFormFeedback.textContent = "";
  elFormFeedback.dataset.type = "info";
  elFormFeedback.classList.add("is-hidden");
};

// Render pesan validasi real-time untuk input NIM.
const showNimRealtimeFeedback = (message, type = "error") => {
  if (!elNim) return;
  const container = getFormGroup(elNim) || elNim.parentNode;
  if (!container) return;
  const feedback = document.createElement("div");
  feedback.className = "nim-feedback-message";
  feedback.style.fontSize = "0.85rem";
  feedback.style.marginTop = "0.25rem";
  feedback.style.color = type === "success" ? "#43a047" : "#e53935";
  feedback.textContent = message;
  container.appendChild(feedback);
};

// Bersihkan pesan NIM real-time.
const clearNimRealtimeFeedback = () => {
  if (!elNim) return;
  elNim.style.borderColor = "";
  const container = getFormGroup(elNim) || elNim.parentNode;
  if (!container) return;
  container
    .querySelectorAll(".nim-feedback-message")
    .forEach((node) => node.remove());
};

// Ambil nilai string dari field atau konten editable.
const getFieldCurrentValue = (field) => {
  if (!field) return "";
  if (Object.prototype.hasOwnProperty.call(field, "value")) {
    return typeof field.value === "string" ? field.value : "";
  }
  if (field instanceof HTMLElement) {
    return field.innerText || field.textContent || "";
  }
  return "";
};

// Ubah tampilan form sesuai mode edit / tambah.
function setFormEditingMode(editing) {
  const isEditing = Boolean(editing);
  if (form) {
    form.classList.toggle("is-editing", isEditing);
    form.setAttribute("data-mode", isEditing ? "edit" : "create");
  }
  if (btnSubmit) {
    btnSubmit.textContent = isEditing ? "Perbarui" : "Simpan";
  }
}
setFormEditingMode(false);
clearNimRealtimeFeedback();

// ------------------- MODULE REGISTRY -------------------
/**
 * Lightweight module registry exposing frequently reused helpers.
 * This keeps the legacy single-file structure while mimicking a modular API.
 */
const AppModules = Object.freeze({
  dataStore: {
    loadData,
    saveData,
    normalizeMahasiswaRecord,
    updateAllFilters,
    applyFilters,
  },
  validators: {
    validateNIMFakultasTeknik,
    sanitizeJenisKelamin,
    getJurusanFromNim,
    getAngkatanFromNim,
  },
  ui: {
    showFormFeedback,
    clearFormFeedback,
    showNimRealtimeFeedback,
    clearNimRealtimeFeedback,
    setFormEditingMode,
    ensureFieldFocus,
    clearFieldError,
  },
});

[
  [elNama, "input"],
  [elNim, "input"],
  [elAlamat, "input"],
  [elProgramStudi, "change"],
  [elAngkatan, "input"],
  [elEmail, "input"],
  [elIpk, "input"],
  [elJenisKelamin, "change"],
  [elCatatan, "input"],
].forEach(([field, eventName]) => {
  if (!field) return;
  field.addEventListener(eventName, () => {
    if (elFormFeedback && elFormFeedback.dataset.type === "error") {
      clearFormFeedback();
    }
    if (field === elCatatan) {
      if (getFieldCurrentValue(field).length <= MAX_CATATAN_LENGTH) {
        clearFieldError(field);
      }
      return;
    }
    clearFieldError(field);
  });
  field.addEventListener("blur", () => {
    const value = getFieldCurrentValue(field).trim();
    if (
      value.length > 0 &&
      (field !== elCatatan || value.length <= MAX_CATATAN_LENGTH)
    ) {
      clearFieldError(field);
    }
  });
});

const customSelectRegistry = new Map();

// Bangun label opsi select dengan ikon.
const buildIconOptionLabel = (option) => {
  const iconSrc = option.dataset.icon;
  const optionText = (option.textContent || "").trim();
  if (!iconSrc) {
    return optionText;
  }
  const fragment = document.createDocumentFragment();
  const img = document.createElement("img");
  img.src = iconSrc;
  img.alt = "";
  img.className = option.dataset.iconClass || "icon2";
  fragment.appendChild(img);
  const text = document.createElement("span");
  text.textContent = optionText;
  fragment.appendChild(text);
  return fragment;
};

const customSelectTargets = [
  [elEntriesPerPage, { maxHeight: 200 }],
  [elFilterProdi, { placeholder: "Semua Prodi", maxHeight: 240 }],
  [
    elProgramStudi,
    {
      maxHeight: 260,
      placeholder: "Pilih Program Studi",
      initialize: (select, instance) => {
        if (select && select.value) {
          instance.refresh();
        }
      },
    },
  ],
  [
    elJenisKelamin,
    {
      maxHeight: 200,
      placeholder: "Pilih Jenis Kelamin",
      initialize: (select, instance) => {
        if (select && select.value) {
          instance.refresh();
        }
      },
    },
  ],
  [
    elSort,
    {
      placeholder: "Default",
      maxHeight: 260,
      getOptionLabel: buildIconOptionLabel,
      onChange: () => render(),
    },
  ],
];

customSelectTargets.forEach(([selectEl, options]) => {
  const instance = setupCustomSelect(selectEl, options);
  if (instance && selectEl) {
    customSelectRegistry.set(selectEl, instance);
    if (typeof options.initialize === "function") {
      options.initialize(selectEl, instance);
    }
  }
});

// Sinkronkan tampilan custom select dengan value asli.
const refreshCustomSelect = (selectEl) => {
  const instance = customSelectRegistry.get(selectEl);
  if (instance) {
    instance.refresh();
  }
};

const MAX_FOTO_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_FOTO_EXTENSIONS = ["png", "jpg", "jpeg"];
const ALLOWED_FOTO_MIME_TYPES = ["image/png", "image/jpeg"];
const DEFAULT_PREVIEW_FOTO_SRC =
  (elFotoPreviewImg &&
    (elFotoPreviewImg.getAttribute("data-default-src") ||
      elFotoPreviewImg.getAttribute("src"))) ||
  DEFAULT_FOTO_URL;
const FOTO_MODE_DEFAULT = "default";
const FOTO_MODE_CUSTOM = "custom";
const FOTO_MODE_NONE = "none";
const MAX_CATATAN_LENGTH = 1000;
let currentFotoValue = DEFAULT_FOTO_URL;
let currentFotoMode = FOTO_MODE_DEFAULT;

// Baca file foto dan kembalikan dalam bentuk data URL.
const readFileAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const { result } = loadEvent.target || {};
      if (typeof result === "string") {
        resolve(result);
      } else {
        reject(new Error("Gagal membaca file sebagai Data URL."));
      }
    };
    reader.onerror = () =>
      reject(new Error("Terjadi kesalahan saat membaca file foto."));
    reader.readAsDataURL(file);
  });

// Konversi path relatif/URL ke bentuk absolut yang aman.
const resolveAssetUrl = (value) => {
  if (!value) return null;
  if (value.startsWith("data:image/")) return value;
  if (/^https?:\/\//i.test(value)) return value;
  try {
    return new URL(value, window.location.href).href;
  } catch (error) {
    return value;
  }
};

// Resize gambar ke ukuran aman dan ubah ke data URL.
const loadImageToCanvasData = (src, maxDimension = 240) =>
  new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }

    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      const { width, height } = image;
      if (!width || !height) {
        resolve(null);
        return;
      }

      const largestSide = Math.max(width, height);
      const scale = Math.min(1, maxDimension / largestSide);
      const targetWidth = Math.max(1, Math.round(width * scale));
      const targetHeight = Math.max(1, Math.round(height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const context = canvas.getContext("2d");
      if (!context) {
        resolve(null);
        return;
      }

      context.drawImage(image, 0, 0, targetWidth, targetHeight);

      resolve({
        dataUrl: canvas.toDataURL("image/png"),
        width: targetWidth,
        height: targetHeight,
      });
    };

    image.onerror = () => resolve(null);
    image.src = src;
  });

// Atur tampilan preview foto berdasarkan mode.
function setFotoPreview(options = {}) {
  if (!elFotoPreviewImg) return;
  const { mode = FOTO_MODE_DEFAULT, src = "" } = options;
  const normalizedSrc = typeof src === "string" ? src : "";

  if (mode === FOTO_MODE_CUSTOM && normalizedSrc) {
    elFotoPreviewImg.src = normalizedSrc;
    elFotoPreviewImg.dataset.custom = "true";
    elFotoPreviewImg.dataset.mode = FOTO_MODE_CUSTOM;
    currentFotoValue = normalizedSrc;
    currentFotoMode = FOTO_MODE_CUSTOM;
    return;
  }

  elFotoPreviewImg.src = DEFAULT_PREVIEW_FOTO_SRC;
  elFotoPreviewImg.dataset.custom = "false";

  if (mode === FOTO_MODE_NONE) {
    elFotoPreviewImg.dataset.mode = FOTO_MODE_NONE;
    currentFotoValue = "";
    currentFotoMode = FOTO_MODE_NONE;
  } else {
    elFotoPreviewImg.dataset.mode = FOTO_MODE_DEFAULT;
    currentFotoValue = DEFAULT_FOTO_URL;
    currentFotoMode = FOTO_MODE_DEFAULT;
  }
}

// Kembalikan preview foto ke kondisi default.
function resetFotoPreview() {
  if (!elFotoPreviewImg) return;
  setFotoPreview({ mode: FOTO_MODE_DEFAULT });
  if (elFotoUpload) {
    elFotoUpload.value = "";
  }
}

if (elFotoPreviewImg) {
  resetFotoPreview();
}

if (elFotoUpload) {
  if (elFotoPreviewContainer) {
    elFotoPreviewContainer.setAttribute("role", "button");
    elFotoPreviewContainer.setAttribute("tabindex", "0");
    elFotoPreviewContainer.addEventListener("click", () => {
      elFotoUpload.click();
    });
    elFotoPreviewContainer.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        elFotoUpload.click();
      }
    });
  }

  elFotoUpload.addEventListener("change", async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      resetFotoPreview();
      return;
    }

    const extension = (file.name.split(".").pop() || "").toLowerCase();
    const mimeType = (file.type || "").toLowerCase();
    const isAllowedExtension = ALLOWED_FOTO_EXTENSIONS.includes(extension);
    const isAllowedMime =
      !mimeType || ALLOWED_FOTO_MIME_TYPES.includes(mimeType);

    if (!isAllowedExtension || !isAllowedMime) {
      alert("Format foto harus berupa PNG atau JPG.");
      resetFotoPreview();
      return;
    }

    if (file.size > MAX_FOTO_SIZE) {
      alert("Ukuran foto maksimal 2MB.");
      resetFotoPreview();
      return;
    }

    try {
      const dataUrl = await readFileAsDataURL(file);
      setFotoPreview({ mode: FOTO_MODE_CUSTOM, src: dataUrl });
    } catch (error) {
      console.warn(error);
      alert("Gagal memuat foto, coba lagi.");
      resetFotoPreview();
    }
  });
}

// ------------------- VALIDASI REAL-TIME NIM -------------------
// Tambahkan validasi real-time untuk input NIM
if (elNim) {
  elNim.addEventListener("input", (e) => {
    const nim = e.target.value.trim();

    clearNimRealtimeFeedback();

    if (nim.length === 0) {
      return;
    }

    const validation = validateNIMFakultasTeknik(nim);

    if (!validation.valid) {
      elNim.style.borderColor = "#e53935";
      showNimRealtimeFeedback(validation.message, "error");
      return;
    }

    if (nim.length === 10) {
      elNim.style.borderColor = "#43a047";
      const departemenLabel = validation.info?.departemen || "Program Studi";
      const angkatanLabel = getAngkatanFromNim(validation.normalizedNim);
      showNimRealtimeFeedback(
        `✓ ${departemenLabel} - Angkatan ${angkatanLabel}`,
        "success"
      );
    }
  });
}

// ------------------- FUNGSI RENDER -------------------
// Render tabel mahasiswa dengan paginasi dan filter.
function render() {
  if (!Array.isArray(data)) filteredData = [];

  // Preserve checkbox states before clearing table
  const selectedIds = new Set();
  document.querySelectorAll(".row-select:checked").forEach((checkbox) => {
    selectedIds.add(parseInt(checkbox.dataset.id));
  });

  tbody.innerHTML = ""; // Kosongkan tabel sebelum render ulang

  const totalPages = getTotalPages();
  if (totalPages === 0) {
    currentPage = 1;
  } else if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  // Update pagination info terlebih dahulu
  updatePaginationInfo();
  renderPaginationPages();

  // Update data display and active filters
  updateTotalDataDisplay();

  // Kondisi ketika data utama kosong total
  if (data.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `
      <td colspan="13" style="text-align: center; padding: 3rem 1rem;">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem; color: var(--color-muted);">
          <img src="../assets/no-data.svg" alt="Belum ada data" style="width: 80px; height: 80px; opacity: 0.6;" />
          <div>
            <p style="margin: 0; font-size: 1.1rem; font-weight: 600;">Belum ada data mahasiswa.</p>
            <p style="margin: 0.5rem 0 0 0; font-size: 0.95rem;">Silakan tambahkan data terlebih dahulu.</p>
          </div>
        </div>
      </td>
    `;
    tbody.appendChild(emptyRow);
    return;
  }

  // Kondisi ketika data hasil filter pencarian tidak ada
  if (filteredData.length === 0) {
    const notFoundRow = document.createElement("tr");
    notFoundRow.innerHTML = `
      <td colspan="13" style="text-align: center; padding: 3rem 1rem;">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem; color: var(--color-muted);">
          <img src="../assets/no-data.svg" alt="Data tidak ditemukan" style="width: 80px; height: 80px; opacity: 0.6;" />
          <p style="margin: 0; font-size: 1.1rem; font-weight: 600;">Data mahasiswa tidak ditemukan</p>
        </div>
      </td>
    `;
    tbody.appendChild(notFoundRow);
    return;
  }

  // Sort data yang sudah difilter dan get paginated data
  const paginatedData = getPaginatedData();

  // Calculate start index for row numbering
  const startIndex = (currentPage - 1) * entriesPerPage;

  paginatedData.forEach((row, idx) => {
    const normalizedRow = normalizeMahasiswaRecord(row);
    const tr = document.createElement("tr");
    const programStudi = escapeHtml(getProgramStudiDisplay(normalizedRow));
    const angkatan = escapeHtml(getAngkatanDisplay(normalizedRow));
    const nama = escapeHtml(normalizedRow.nama);
    const nim = escapeHtml(normalizedRow.nim);
    const jenisKelamin = normalizedRow.jenisKelamin
      ? escapeHtml(normalizedRow.jenisKelamin)
      : "-";
    const alamat = normalizedRow.alamat
      ? escapeHtml(normalizedRow.alamat)
      : "-";
    const catatan = normalizedRow.catatan
      ? escapeHtml(normalizedRow.catatan)
      : "-";
    const rawFotoUrl =
      typeof normalizedRow.fotoUrl === "string"
        ? normalizedRow.fotoUrl.trim()
        : "";
    const hasFoto = rawFotoUrl.length > 0;
    const fotoUrl = hasFoto ? escapeHtml(rawFotoUrl) : "";
    const emailText = normalizedRow.email
      ? escapeHtml(normalizedRow.email)
      : "-";
    const emailHref = normalizedRow.email
      ? `mailto:${encodeURIComponent(normalizedRow.email)}`
      : "";
    const emailCell = normalizedRow.email
      ? `<a href="${emailHref}" class="email-link">${emailText}</a>`
      : "-";
    const ipkCell = formatIpk(normalizedRow.ipk);

    // Check if this row was previously selected
    const isSelected = selectedIds.has(normalizedRow.id);

    tr.innerHTML = `
          <td class="col-select">
            <label class="checkbox-control" aria-label="Pilih baris ${
              nama || "tanpa nama"
            }">
              <input type="checkbox" class="row-select" data-id="${
                normalizedRow.id
              }" ${isSelected ? "checked" : ""} />
              <span class="checkbox-custom"></span>
            </label>
          </td>
          <td class="col-number">
            <span class="number-chip">${startIndex + idx + 1}</span>
          </td>
          <td>${nama}</td>
          <td>${nim}</td>
          <td class="col-jenis-kelamin">${jenisKelamin}</td>
          <td>${programStudi}</td>
          <td>${angkatan}</td>
          <td>${emailCell}</td>
          <td class="col-ipk">${ipkCell}</td>
          <td class="col-alamat">${alamat}</td>
          <td class="col-catatan">${catatan}</td>
          <td class="col-foto">${
            hasFoto
              ? `<a href="${fotoUrl}" target="_blank" rel="noopener noreferrer" class="foto-link">
              <img src="${fotoUrl}" alt="Foto ${nama}" class="foto-thumbnail" />
            </a>`
              : "-"
          }</td>
          <td class="table-actions">
    <div class="action-buttons">
      <button type="button" data-edit="${
        normalizedRow.id
      }" class="edit" aria-label="Edit Data Mahasiswa ${nama}">Edit</button>
      <button type="button" data-del="${
        normalizedRow.id
      }" class="hapus" aria-label="Hapus Data Mahasiswa ${
      nama || "tanpa nama"
    }">Hapus</button>
    </div>
  </td>
        `;
    tbody.appendChild(tr);
  });

  // Update select all checkbox state after rendering
  setTimeout(() => {
    const allCheckboxes = document.querySelectorAll(".row-select");
    const checkedCheckboxes = document.querySelectorAll(".row-select:checked");

    if (checkboxSelectAll && allCheckboxes.length > 0) {
      if (checkedCheckboxes.length === 0) {
        checkboxSelectAll.checked = false;
        checkboxSelectAll.indeterminate = false;
      } else if (checkedCheckboxes.length === allCheckboxes.length) {
        checkboxSelectAll.checked = true;
        checkboxSelectAll.indeterminate = false;
      } else {
        checkboxSelectAll.checked = false;
        checkboxSelectAll.indeterminate = true;
      }
    }
  }, 0);
}

// ------------------- FILTER ANGKATAN FUNCTIONALITY START -------------------
// Isi dropdown filter angkatan berdasarkan data yang tersedia.
function populateAngkatanFilter() {
  if (!filterWrapper || !elFilterAngkatan) return;

  // Ambil semua angkatan unik dari data yang tersedia
  const angkatanSet = new Set();

  data.forEach((mahasiswa) => {
    const angkatan = getAngkatanDisplay(mahasiswa);
    if (angkatan && angkatan !== "-" && angkatan !== "N/A") {
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
  if (!filterOptionsList) return;
  while (filterOptionsList.children.length > 1) {
    filterOptionsList.removeChild(filterOptionsList.lastChild);
  }

  // Tambahkan opsi angkatan hanya yang ada datanya
  sortedAngkatan.forEach((angkatan) => {
    // Tambah ke select (hidden)
    const option = document.createElement("option");
    option.value = angkatan;
    option.textContent = angkatan;
    elFilterAngkatan.appendChild(option);

    // Tambah ke dropdown visual
    const li = document.createElement("li");
    li.setAttribute("data-value", angkatan);
    li.textContent = angkatan;
    filterOptionsList.appendChild(li);
  });

  // Update event listeners untuk opsi baru
  updateFilterEventListeners();

  // Set tinggi dropdown sesuai dengan jumlah opsi
  const dropdownList = filterWrapper.querySelector(".filter-options");
  if (!dropdownList) return;
  const optionCount = dropdownList.children.length;
  const optionHeight = 40;
  const maxHeight = Math.min(optionCount * optionHeight, 200);
  dropdownList.style.setProperty("--max-height", `${maxHeight}px`);
}

// Fungsi untuk populate Program Studi filter hanya dengan data yang tersedia
function populateProdiFilter() {
  if (!elFilterProdi) return;

  // Ambil semua program studi unik dari data yang tersedia
  const prodiSet = new Set();

  data.forEach((mahasiswa) => {
    const prodi = getProgramStudiDisplay(mahasiswa);
    if (prodi && prodi !== "-" && prodi !== "N/A") {
      prodiSet.add(prodi);
    }
  });

  // Urutkan program studi secara alfabetis
  const sortedProdi = Array.from(prodiSet).sort((a, b) => a.localeCompare(b));

  // Simpan nilai yang dipilih saat ini
  const currentValue = elFilterProdi.value;

  // Hapus semua opsi kecuali "Semua Prodi"
  while (elFilterProdi.children.length > 1) {
    elFilterProdi.removeChild(elFilterProdi.lastChild);
  }

  // Tambahkan opsi program studi hanya yang ada datanya
  sortedProdi.forEach((prodi) => {
    const option = document.createElement("option");
    option.value = prodi;
    option.textContent = prodi;
    elFilterProdi.appendChild(option);
  });

  // Restore nilai yang dipilih jika masih tersedia
  if (currentValue && sortedProdi.includes(currentValue)) {
    elFilterProdi.value = currentValue;
  } else {
    elFilterProdi.value = "";
  }

  // Refresh custom select untuk program studi
  refreshCustomSelect(elFilterProdi);
}

// Perbarui semua filter dropdown berdasarkan data yang tersedia.
function updateAllFilters() {
  populateAngkatanFilter();
  populateProdiFilter();
}

// Perbarui event listener untuk opsi filter yang baru dibuat.
function updateFilterEventListeners() {
  if (!filterWrapper || !filterTriggerLabel || !elFilterAngkatan) return;
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
if (filterTrigger && filterWrapper) {
  filterTrigger.addEventListener("click", () => {
    filterWrapper.classList.toggle("open");
  });

  // Tutup dropdown filter jika klik di luar area
  document.addEventListener("click", (e) => {
    if (!filterWrapper.contains(e.target)) {
      filterWrapper.classList.remove("open");
    }
  });
}

// Event listener untuk filter angkatan (fallback)
if (elFilterAngkatan) {
  elFilterAngkatan.addEventListener("change", () => {
    applyFilters();
  });
}

// Fungsi untuk menerapkan semua filter (search + angkatan + prodi)
function applyFilters() {
  const searchKeyword = elSearch.value.toLowerCase().trim();
  const selectedAngkatan = elFilterAngkatan.value;
  const selectedProdi = elFilterProdi.value;

  filteredData = data.filter((m) => {
    const programStudi = getProgramStudiDisplay(m).toLowerCase();
    const angkatanDisplay = getAngkatanDisplay(m);
    const angkatanLower = angkatanDisplay.toLowerCase();
    const namaLower = m.nama ? m.nama.toLowerCase() : "";
    const nimLower = m.nim ? m.nim.toLowerCase() : "";
    const alamatLower = m.alamat ? m.alamat.toLowerCase() : "";
    const emailLower = m.email ? m.email.toLowerCase() : "";
    const ipkLower =
      m.ipk === null || m.ipk === undefined || m.ipk === ""
        ? ""
        : String(m.ipk).toLowerCase();
    const catatanLower = m.catatan ? m.catatan.toLowerCase() : "";
    const jenisKelaminLower = m.jenisKelamin
      ? m.jenisKelamin.toLowerCase()
      : "";

    // Filter berdasarkan search keyword
    const matchesSearch =
      !searchKeyword ||
      namaLower.includes(searchKeyword) ||
      nimLower.includes(searchKeyword) ||
      programStudi.includes(searchKeyword) ||
      angkatanLower.includes(searchKeyword) ||
      alamatLower.includes(searchKeyword) ||
      emailLower.includes(searchKeyword) ||
      ipkLower.includes(searchKeyword) ||
      catatanLower.includes(searchKeyword) ||
      jenisKelaminLower.includes(searchKeyword);

    // Filter berdasarkan angkatan
    const matchesAngkatan =
      !selectedAngkatan || angkatanDisplay === selectedAngkatan;

    // Filter berdasarkan program studi
    const matchesProdi =
      !selectedProdi || getProgramStudiDisplay(m) === selectedProdi;

    return matchesSearch && matchesAngkatan && matchesProdi;
  });

  // Reset ke halaman pertama setiap kali filter berubah
  resetToFirstPage();

  render();

  // Update active filter display
  updateActiveFilterDisplay();
}
// ------------------- FILTER ANGKATAN FUNCTIONALITY END -------------------

// ------------------- SEARCH FUNCTIONALITY START -------------------
// Inisialisasi pencarian berdasarkan parameter URL.
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
      const angkatanA = getAngkatanDisplay(a);
      const angkatanB = getAngkatanDisplay(b);
      return angkatanA.localeCompare(angkatanB);
    });
  } else if (sortValue === "angkatan-desc") {
    // urutkan data berdasarkan angkatan descending
    return [...list].sort((a, b) => {
      const angkatanA = getAngkatanDisplay(a);
      const angkatanB = getAngkatanDisplay(b);
      return angkatanB.localeCompare(angkatanA);
    });
  } else if (sortValue === "jurusan-asc") {
    // urutkan data berdasarkan jurusan ascending
    return [...list].sort((a, b) => {
      const jurusanA = getProgramStudiDisplay(a);
      const jurusanB = getProgramStudiDisplay(b);
      return jurusanA.localeCompare(jurusanB);
    });
  } else if (sortValue === "jurusan-desc") {
    // urutkan data berdasarkan jurusan descending
    return [...list].sort((a, b) => {
      const jurusanA = getProgramStudiDisplay(a);
      const jurusanB = getProgramStudiDisplay(b);
      return jurusanB.localeCompare(jurusanA);
    });
  } else if (sortValue === "ipk-asc") {
    // urutkan data berdasarkan IPK ascending
    return [...list].sort((a, b) => {
      const ipkA = Number(a.ipk) || 0;
      const ipkB = Number(b.ipk) || 0;
      return ipkA - ipkB;
    });
  } else if (sortValue === "ipk-desc") {
    // urutkan data berdasarkan IPK descending
    return [...list].sort((a, b) => {
      const ipkA = Number(a.ipk) || 0;
      const ipkB = Number(b.ipk) || 0;
      return ipkB - ipkA;
    });
  } else {
    // default → kembalikan list apa adanya
    return list;
  }
}
// ------------------- SORT FUNCTIONALITY END -------------------

const PDF_FOTO_COLUMN_INDEX = 10;
const PDF_FOTO_MAX_WIDTH_MM = 20;
const PDF_FOTO_MAX_HEIGHT_MM = 20;
const PDF_FOTO_PADDING_MM = 6;

// Siapkan foto untuk disertakan dalam PDF export.
const prepareFotoForPdf = async (fotoUrl) => {
  const normalizedSrc = normalizeFotoUrl(fotoUrl);
  const resolvedSrc = resolveAssetUrl(normalizedSrc);
  const imageData = await loadImageToCanvasData(resolvedSrc);
  return imageData;
};

// -------------- DOWNLOAD PDF FUNCTIONALITY START ---------------
/**
 * Export data mahasiswa yang sudah difilter ke format PDF
 * Menyertakan header dengan informasi filter aktif (program studi, angkatan, urutan)
 * dan menggenerate tabel lengkap dengan foto mahasiswa
 */
btnDownloadPdf.addEventListener("click", async () => {
  // Ambil data yang sudah difilter
  const exportData = sortData(filteredData);

  if (exportData.length === 0) {
    alert("Tidak ada data untuk diekspor!");
    return;
  }

  // Buat dokumen PDF baru
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "landscape" });

  // Judul utama PDF
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");

  // Ambil informasi semua filter aktif untuk judul
  const selectedAngkatan = elFilterAngkatan.value;
  const selectedProdi = elFilterProdi.value;
  let judulPDF = "Daftar Mahasiswa Fakultas Teknik";

  // Tambahkan filter ke judul jika ada
  const filterParts = [];
  if (selectedAngkatan) {
    filterParts.push(`Angkatan ${selectedAngkatan}`);
  }
  if (selectedProdi) {
    filterParts.push(`Prodi ${selectedProdi}`);
  }

  if (filterParts.length > 0) {
    judulPDF += ` (${filterParts.join(", ")})`;
  }

  doc.text(judulPDF, 14, 20);

  let currentY = 30;

  // Ambil informasi filtering dan sorting untuk keterangan detail
  const searchKeyword = elSearch.value.trim();
  const sortValue = elSort.value;

  // Keterangan filtering dan sorting detail
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");

  // Tampilkan filter pencarian jika ada
  if (searchKeyword) {
    doc.text(`Filter pencarian: "${searchKeyword}"`, 14, currentY);
    currentY += 7;
  }

  // Tampilkan filter program studi jika ada
  if (selectedProdi) {
    doc.text(`Filter program studi: ${selectedProdi}`, 14, currentY);
    currentY += 7;
  }

  // Tampilkan filter angkatan jika ada
  if (selectedAngkatan) {
    doc.text(`Filter angkatan: ${selectedAngkatan}`, 14, currentY);
    currentY += 7;
  }

  // Tampilkan urutan sorting jika ada
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
      "ipk-asc": "Diurutkan berdasarkan IPK (rendah ke tinggi)",
      "ipk-desc": "Diurutkan berdasarkan IPK (tinggi ke rendah)",
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
  currentY += 10;

  // AutoTable untuk render tabel
  const processedRows = await Promise.all(
    exportData.map(async (row) => {
      const normalized = normalizeMahasiswaRecord(row);
      const fotoData = await prepareFotoForPdf(normalized.fotoUrl);

      return {
        normalized,
        fotoData,
      };
    })
  );

  doc.autoTable({
    startY: currentY,
    head: [
      [
        "No",
        "Nama",
        "NIM",
        "Jenis Kelamin",
        "Program Studi",
        "Angkatan",
        "Email",
        "IPK",
        "Alamat",
        "Catatan",
        "Foto",
      ],
    ],
    body: processedRows.map(({ normalized }, idx) => {
      const jenisKelamin = sanitizeJenisKelamin(normalized.jenisKelamin) || "-";
      const programStudi = getProgramStudiDisplay(normalized) || "-";
      const angkatan = getAngkatanDisplay(normalized) || "-";
      const email = normalized.email ? String(normalized.email) : "-";
      const ipk = formatIpk(normalized.ipk);
      const alamat = normalized.alamat ? String(normalized.alamat) : "-";
      const catatan = normalized.catatan ? String(normalized.catatan) : "-";

      return [
        idx + 1,
        normalized.nama,
        normalized.nim,
        jenisKelamin,
        programStudi,
        angkatan,
        email,
        ipk,
        alamat,
        catatan,
        " ",
      ];
    }),
    theme: "grid",
    headStyles: {
      fillColor: [25, 118, 210],
      textColor: 255,
      fontStyle: "bold",
    },
    styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak" },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      [PDF_FOTO_COLUMN_INDEX]: {
        cellWidth: 26,
        minCellHeight: 26,
        halign: "center",
        valign: "middle",
      },
    },
    didDrawCell: (data) => {
      if (
        data.section === "body" &&
        data.column.index === PDF_FOTO_COLUMN_INDEX
      ) {
        const rowInfo = processedRows[data.row.index];
        if (!rowInfo || !rowInfo.fotoData || !rowInfo.fotoData.dataUrl) {
          return;
        }

        const { dataUrl, width, height } = rowInfo.fotoData;
        if (!dataUrl || !width || !height) {
          return;
        }

        const aspectRatio = width / height;
        let drawWidth = PDF_FOTO_MAX_WIDTH_MM;
        let drawHeight = drawWidth / aspectRatio;

        if (drawHeight > PDF_FOTO_MAX_HEIGHT_MM) {
          drawHeight = PDF_FOTO_MAX_HEIGHT_MM;
          drawWidth = drawHeight * aspectRatio;
        }

        const availableWidth = Math.max(
          4,
          data.cell.width - PDF_FOTO_PADDING_MM
        );
        const availableHeight = Math.max(
          4,
          data.cell.height - PDF_FOTO_PADDING_MM
        );

        if (drawWidth > availableWidth) {
          drawWidth = availableWidth;
          drawHeight = drawWidth / aspectRatio;
        }

        if (drawHeight > availableHeight) {
          drawHeight = availableHeight;
          drawWidth = drawHeight * aspectRatio;
        }

        const x = data.cell.x + (data.cell.width - drawWidth) / 2;
        const y = data.cell.y + (data.cell.height - drawHeight) / 2;

        try {
          doc.addImage(dataUrl, "PNG", x, y, drawWidth, drawHeight);
        } catch (error) {
          console.warn("Gagal menambahkan foto ke PDF:", error);
        }
      }
    },
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
const IMPORT_FIELD_ALIASES = {
  nama: ["nama mahasiswa", "nama lengkap", "nama"],
  nim: [
    "nomor induk mahasiswa",
    "nomor mahasiswa",
    "no. nim",
    "no nim",
    "nrp",
    "nim",
  ],
  programStudi: [
    "program studi",
    "program_studi",
    "programstudi",
    "prodi",
    "jurusan",
  ],
  angkatan: ["angkatan", "tahun angkatan", "tahun masuk", "angkatan masuk"],
  alamat: ["alamat", "alamat domisili", "domisili", "alamat lengkap"],
  email: ["email", "surelam", "surel", "e-mail"],
  ipk: ["ipk", "nilai ipk", "gpa"],
  catatan: ["catatan", "keterangan", "catatan tambahan", "notes"],
  jenisKelamin: ["jenis kelamin", "gender", "jk", "jenis_kelamin"],
  fotoUrl: [
    "foto",
    "foto mahasiswa",
    "foto url",
    "foto_url",
    "link foto",
    "gambar",
  ],
};

// Normalisasi nama kolom dari file impor.
const normalizeImportKey = (key) =>
  String(key || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "")
    .toLowerCase();

// Mapping nama kolom impor yang telah dinormalisasi.
const IMPORT_ALIAS_MAP = (() => {
  const aliasMap = new Map();
  // Tambahkan alias kolom ke map agar mudah dipetakan.
  const addAlias = (alias, field) => {
    const normalized = normalizeImportKey(alias);
    if (!normalized || aliasMap.has(normalized)) return;
    aliasMap.set(normalized, field);
  };

  Object.entries(IMPORT_FIELD_ALIASES).forEach(([field, aliases]) => {
    const aliasList = Array.isArray(aliases) ? [...aliases] : [];
    aliasList.push(field);
    aliasList.push(field.replace(/([a-z])([A-Z])/g, "$1 $2"));
    aliasList.forEach((alias) => addAlias(alias, field));
  });

  return aliasMap;
})();

// Petakan nama kolom impor ke field internal.
const resolveImportFieldName = (key) => {
  if (!key) return null;
  return IMPORT_ALIAS_MAP.get(normalizeImportKey(key)) || null;
};

// Rapikan nilai impor menjadi string bersih.
const sanitizeImportValue = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") {
    if (Number.isNaN(value)) return "";
    return String(value);
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  const text = String(value).trim();
  if (!text || text === "-") return "";
  return text;
};

// Bangun objek impor hanya dengan field dikenal.
const normalizeImportRecordKeys = (rawInput) => {
  if (!rawInput || typeof rawInput !== "object") {
    return {};
  }
  const normalized = {};
  Object.entries(rawInput).forEach(([key, value]) => {
    if (key === "__rowNumber") return;
    const fieldName = resolveImportFieldName(key);
    if (fieldName) {
      normalized[fieldName] = value;
    }
  });
  return normalized;
};

// Konversi sheet Excel menjadi array record.
const buildTabularRecordsFromRows = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { error: "File tidak memiliki data yang bisa diproses." };
  }

  const headerRow = rows[0].map((cell) => sanitizeImportValue(cell));
  const headerMap = {};

  headerRow.forEach((header, idx) => {
    const fieldName = resolveImportFieldName(header);
    if (fieldName && !(idx in headerMap)) {
      headerMap[idx] = fieldName;
    }
  });

  const headerFields = Object.values(headerMap);
  if (!headerFields.includes("nama") || !headerFields.includes("nim")) {
    return {
      error:
        "Header file harus mengikuti format tabel terbaru dan minimal memuat kolom 'Nama' serta 'NIM'.",
    };
  }

  const records = [];
  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    if (
      !row ||
      (Array.isArray(row) &&
        row.every((cell) => sanitizeImportValue(cell) === ""))
    ) {
      continue;
    }

    const entry = { __rowNumber: rowIndex + 1 };
    Object.entries(headerMap).forEach(([colIndex, fieldName]) => {
      const columnIndex = Number(colIndex);
      const value =
        Array.isArray(row) && columnIndex < row.length ? row[columnIndex] : "";
      entry[fieldName] = value;
    });
    records.push(entry);
  }

  return { records };
};

// Validasi dan normalisasi satu baris impor mahasiswa.
const buildMahasiswaImportRecord = (rawInput) => {
  if (!rawInput || typeof rawInput !== "object") {
    return { error: "Format entri tidak dikenali." };
  }

  const normalized = normalizeImportRecordKeys(rawInput);
  if (Object.keys(normalized).length === 0) {
    return {
      error: "Format entri tidak memuat kolom yang dikenali sistem.",
    };
  }

  // Helper untuk mengambil nilai terformat dari field tertentu.
  const getValue = (field) => sanitizeImportValue(normalized[field]);
  const nama = getValue("nama");
  const nimRaw = getValue("nim");

  if (!nama) {
    return { error: "Nama wajib diisi." };
  }

  if (!nimRaw) {
    return { error: "NIM wajib diisi." };
  }

  const nimValidation = validateNIMFakultasTeknik(nimRaw);
  if (!nimValidation.valid) {
    return { error: `${nimRaw}: ${nimValidation.message}` };
  }

  const ipkRaw = getValue("ipk");
  let ipk = "";
  if (ipkRaw) {
    const normalizedIpk = ipkRaw.replace(",", ".").replace(/[^\d.]/g, "");
    const numericIpk = Number(normalizedIpk);
    if (Number.isNaN(numericIpk) || numericIpk < 0 || numericIpk > 4) {
      return {
        error: `IPK '${ipkRaw}' tidak valid (gunakan nilai 0.00 - 4.00).`,
      };
    }
    ipk = Number(numericIpk.toFixed(2));
  }

  const jenisKelaminRaw = getValue("jenisKelamin");
  const jenisKelamin = jenisKelaminRaw
    ? sanitizeJenisKelamin(jenisKelaminRaw)
    : "";

  const email = getValue("email");
  const alamat = getValue("alamat");
  const programStudiRaw = getValue("programStudi");
  const angkatanRaw = getValue("angkatan");
  const catatan = getValue("catatan");

  if (!alamat) {
    return { error: "Alamat wajib diisi." };
  }

  const derivedProgramStudi = getJurusanFromNim(nimValidation.normalizedNim);
  const resolvedProgramStudi =
    programStudiRaw ||
    (derivedProgramStudi !== "N/A" ? derivedProgramStudi : "");

  if (
    programStudiRaw &&
    derivedProgramStudi !== "N/A" &&
    programStudiRaw.trim() !== derivedProgramStudi
  ) {
    return {
      error: `Program Studi '${programStudiRaw}' tidak sesuai dengan NIM (seharusnya ${derivedProgramStudi}).`,
    };
  }

  const derivedAngkatan = getAngkatanFromNim(nimValidation.normalizedNim);
  let resolvedAngkatan =
    angkatanRaw || (derivedAngkatan !== "N/A" ? derivedAngkatan : "");

  if (resolvedAngkatan) {
    const normalizedAngkatan = String(resolvedAngkatan).trim();
    if (!/^\d{4}$/.test(normalizedAngkatan)) {
      return {
        error: `Angkatan '${resolvedAngkatan}' harus berupa 4 digit tahun.`,
      };
    }
    const angkatanNum = Number(normalizedAngkatan);
    const MIN_ANGKATAN = 2000;
    const MAX_ANGKATAN = 2025;
    if (angkatanNum < MIN_ANGKATAN || angkatanNum > MAX_ANGKATAN) {
      return {
        error: `Angkatan '${resolvedAngkatan}' harus berada di rentang ${MIN_ANGKATAN}-${MAX_ANGKATAN}.`,
      };
    }
    resolvedAngkatan = String(angkatanNum);
    if (derivedAngkatan !== "N/A" && resolvedAngkatan !== derivedAngkatan) {
      return {
        error: `Angkatan '${resolvedAngkatan}' tidak sesuai dengan NIM (seharusnya ${derivedAngkatan}).`,
      };
    }
  }

  return {
    record: {
      nama,
      nim: nimValidation.normalizedNim,
      alamat,
      programStudi: resolvedProgramStudi,
      angkatan: resolvedAngkatan,
      email,
      ipk,
      catatan,
      jenisKelamin,
      fotoUrl: "", // Kontes tabel terbaru tidak menyediakan gambar; tampilkan "-" di kolom foto.
    },
  };
};

// Proses sekumpulan data impor dan catat statistik.
const performBulkImport = (rawRecords, makeLabel) => {
  const summary = {
    importedCount: 0,
    duplicateCount: 0,
    invalidCount: 0,
    invalidDetails: [],
  };

  if (!Array.isArray(rawRecords) || rawRecords.length === 0) {
    return summary;
  }

  rawRecords.forEach((originalEntry, index) => {
    const label =
      typeof makeLabel === "function"
        ? makeLabel(originalEntry, index)
        : `Entri ${index + 1}`;

    const entry =
      originalEntry && typeof originalEntry === "object"
        ? { ...originalEntry }
        : originalEntry;

    if (entry && typeof entry === "object") {
      delete entry.__rowNumber;
    }

    const result = buildMahasiswaImportRecord(entry);
    if (!result || result.error) {
      summary.invalidCount += 1;
      summary.invalidDetails.push(
        `${label}: ${result?.error || "Format entri tidak dikenali."}`
      );
      return;
    }

    const { record } = result;

    if (isDuplicateEntry(record.nama, record.nim)) {
      summary.duplicateCount += 1;
      return;
    }

    data.push(
      normalizeMahasiswaRecord({
        id: autoId++,
        ...record,
      })
    );
    summary.importedCount += 1;
  });

  if (summary.importedCount > 0) {
    saveData(data);
    updateAllFilters();
    applyFilters();
  }

  return summary;
};

// Susun laporan hasil impor untuk ditampilkan.
const buildImportReportMessage = (summary, sourceLabel) => {
  const label = sourceLabel || "file";
  let reportMessage = `Import ${label} selesai!\n\n`;
  reportMessage += `Berhasil: ${summary.importedCount} data\n`;
  if (summary.duplicateCount > 0) {
    reportMessage += `Duplikat: ${summary.duplicateCount} data\n`;
  }
  if (summary.invalidCount > 0) {
    reportMessage += `Gagal: ${summary.invalidCount} data\n`;
    if (summary.invalidDetails.length > 0) {
      const detailPreview = summary.invalidDetails.slice(0, 5);
      reportMessage += `\nDetail:\n- ${detailPreview.join("\n- ")}`;
      if (summary.invalidDetails.length > detailPreview.length) {
        reportMessage += `\n- dan ${
          summary.invalidDetails.length - detailPreview.length
        } entri lainnya.`;
      }
    }
  }
  return reportMessage;
};

// Generate dan download file log error dalam format teks
const downloadErrorLog = (summary, sourceLabel, timestamp = new Date()) => {
  if (
    !summary ||
    !summary.invalidDetails ||
    summary.invalidDetails.length === 0
  ) {
    return;
  }

  // Format timestamp
  const dateStr = timestamp.toLocaleDateString("id-ID");
  const timeStr = timestamp.toLocaleTimeString("id-ID");

  // Header log
  let logContent = `LOG ERROR IMPORT DATA MAHASISWA\n`;
  logContent += `===============================\n`;
  logContent += `Tanggal: ${dateStr} ${timeStr}\n`;
  logContent += `Sumber: ${sourceLabel}\n`;
  logContent += `Total Error: ${summary.invalidCount} dari ${
    summary.importedCount + summary.duplicateCount + summary.invalidCount
  } data\n\n`;

  // Detail error
  logContent += `DETAIL ERROR:\n`;
  logContent += `=============\n\n`;

  summary.invalidDetails.forEach((error, index) => {
    logContent += `${index + 1}. ${error}\n`;
  });

  // Informasi tambahan
  logContent += `\n\nRINGKASAN:\n`;
  logContent += `=========\n`;
  logContent += `• Data berhasil diimpor: ${summary.importedCount}\n`;
  logContent += `• Data duplikat (dilewati): ${summary.duplicateCount}\n`;
  logContent += `• Data gagal (error): ${summary.invalidCount}\n`;

  // Buat dan download file
  const blob = new Blob([logContent], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  // Format nama file
  const fileTimestamp = timestamp.toISOString().slice(0, 16).replace(/:/g, "-");
  const fileName = `error_log_import_mahasiswa_${fileTimestamp}.txt`;

  // Trigger download
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Tampilkan hasil import dengan opsi download log error
const showImportResultWithLogOption = (summary, sourceLabel) => {
  const reportMessage = buildImportReportMessage(summary, sourceLabel);

  // Tampilkan alert hasil import
  alert(reportMessage);

  // Jika ada error, tawarkan download log
  if (summary.invalidCount > 0) {
    const shouldDownload = confirm(
      `Ditemukan ${summary.invalidCount} data yang gagal diimpor.\n\n` +
        `Apakah Anda ingin mengunduh file log error untuk melihat detail kesalahan?`
    );

    if (shouldDownload) {
      downloadErrorLog(summary, sourceLabel);
    }
  }
};
if (fileUpload) {
  fileUpload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    const reader = new FileReader();

    // Proses workbook dan jalankan alur impor baris demi baris.
    const processWorkbook = (workbook, label) => {
      if (
        !workbook ||
        !Array.isArray(workbook.SheetNames) ||
        workbook.SheetNames.length === 0
      ) {
        alert("File tidak memiliki sheet yang dapat diproses.");
        return;
      }

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: "",
        blankrows: false,
      });

      const { records, error } = buildTabularRecordsFromRows(rows);
      if (error) {
        alert(error);
        return;
      }

      if (!records || records.length === 0) {
        alert("Tidak ada data baru yang ditemukan pada file tersebut.");
        return;
      }

      const summary = performBulkImport(records, (record, idx) => {
        if (record && typeof record.__rowNumber === "number") {
          return `Baris ${record.__rowNumber}`;
        }
        return `Baris ${idx + 2}`;
      });

      showImportResultWithLogOption(summary, label);
    };

    reader.onerror = () => {
      alert("Terjadi kesalahan saat membaca file. Coba ulangi lagi.");
      e.target.value = "";
    };

    if (ext === "csv") {
      reader.onload = (event) => {
        try {
          const workbook = XLSX.read(event.target.result, { type: "string" });
          processWorkbook(workbook, "CSV");
        } catch (error) {
          console.warn(error);
          alert("File CSV tidak dapat diproses. Periksa formatnya kembali.");
        } finally {
          e.target.value = "";
        }
      };
      reader.readAsText(file);
    } else if (ext === "xlsx") {
      reader.onload = (event) => {
        try {
          const workbook = XLSX.read(new Uint8Array(event.target.result), {
            type: "array",
          });
          processWorkbook(workbook, "XLSX");
        } catch (error) {
          console.warn(error);
          alert(
            "File XLSX tidak dapat diproses. Pastikan format mengikuti tabel terbaru."
          );
        } finally {
          e.target.value = "";
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Format file tidak didukung. Gunakan CSV atau XLSX.");
      e.target.value = "";
    }
  });
}

if (jsonUpload) {
  jsonUpload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);

        let records = [];
        if (Array.isArray(parsed)) {
          records = parsed;
        } else if (parsed && typeof parsed === "object") {
          if (Array.isArray(parsed.data)) {
            records = parsed.data;
          } else if (Array.isArray(parsed.mahasiswa)) {
            records = parsed.mahasiswa;
          }
        }

        if (!Array.isArray(records) || records.length === 0) {
          alert(
            "Struktur JSON tidak dikenali. Pastikan berisi array data mahasiswa."
          );
          return;
        }

        const summary = performBulkImport(
          records,
          (_, idx) => `Entri ${idx + 1}`
        );
        showImportResultWithLogOption(summary, "JSON");
      } catch (error) {
        alert("File JSON tidak valid. Pastikan formatnya benar.");
      } finally {
        jsonUpload.value = "";
      }
    };

    reader.readAsText(file);
  });
}
// ----------------- UPLOAD FILE FUNCTIONALITY END ------------------

// ------------------- FORM SUBMIT (CREATE / UPDATE) -------------------
form.addEventListener("submit", (e) => {
  e.preventDefault(); // Mencegah reload halaman

  const idVal = elId.value.trim();
  const nama = elNama.value.trim();
  const nim = elNim.value.trim();
  const alamat = elAlamat.value.trim();
  const programStudi = elProgramStudi.value.trim();
  const angkatan = elAngkatan.value.trim();
  const email = elEmail.value.trim();
  const ipkRaw = elIpk.value.trim().replace(",", ".");
  const catatan = getCatatanValue();
  const jenisKelaminRaw = elJenisKelamin.value;
  const jenisKelamin = sanitizeJenisKelamin(jenisKelaminRaw);
  const fotoUrl = currentFotoValue;
  const finalFotoUrl = currentFotoMode === FOTO_MODE_CUSTOM ? fotoUrl : "";

  elNama.value = nama;
  elNim.value = nim.toUpperCase();
  elAlamat.value = alamat;
  elProgramStudi.value = programStudi;
  elAngkatan.value = angkatan;
  elEmail.value = email;
  elIpk.value = ipkRaw;

  clearAllFieldErrors();
  clearFormFeedback();
  clearNimRealtimeFeedback();

  let hasError = false;
  let firstInvalidField = null;
  // Catat error baru dan simpan field pertama yang invalid.
  const registerError = (field, message) => {
    if (!hasError) {
      firstInvalidField = field;
    }
    hasError = true;
    setFieldError(field, message);
  };

  if (!nama) {
    registerError(elNama, "Nama wajib diisi.");
  }

  let normalizedNim = "";
  let nimDerivedAngkatan = "";
  let nimDerivedProdi = "";
  if (!nim) {
    registerError(elNim, "NIM wajib diisi.");
  } else {
    const nimValidation = validateNIMFakultasTeknik(nim);
    if (!nimValidation.valid) {
      registerError(elNim, `Format NIM tidak valid: ${nimValidation.message}`);
    } else {
      normalizedNim = nimValidation.normalizedNim;
      elNim.value = normalizedNim;
      const derivedAngkatan = getAngkatanFromNim(normalizedNim);
      nimDerivedAngkatan = derivedAngkatan !== "N/A" ? derivedAngkatan : "";
      const derivedProdi = getJurusanFromNim(normalizedNim);
      nimDerivedProdi = derivedProdi !== "N/A" ? derivedProdi : "";
    }
  }

  if (!alamat) {
    registerError(elAlamat, "Alamat wajib diisi.");
  }

  if (!programStudi) {
    registerError(elProgramStudi, "Program studi wajib dipilih.");
  } else if (nimDerivedProdi && programStudi !== nimDerivedProdi) {
    registerError(
      elProgramStudi,
      `Program studi harus sesuai dengan NIM (seharusnya ${nimDerivedProdi}).`
    );
  }

  const MIN_ANGKATAN = 1956;
  const MAX_ANGKATAN = 2055;
  if (!angkatan) {
    registerError(elAngkatan, "Angkatan wajib diisi.");
  } else if (!/^\d{4}$/.test(angkatan)) {
    registerError(elAngkatan, "Angkatan harus berupa 4 digit.");
  } else {
    const angkatanNum = Number(angkatan);
    if (Number.isNaN(angkatanNum)) {
      registerError(elAngkatan, "Angkatan tidak valid.");
    } else if (angkatanNum < MIN_ANGKATAN || angkatanNum > MAX_ANGKATAN) {
      registerError(
        elAngkatan,
        `Angkatan harus berada di rentang ${MIN_ANGKATAN}-${MAX_ANGKATAN}.`
      );
    } else {
      elAngkatan.value = String(angkatanNum);
      if (nimDerivedAngkatan && String(angkatanNum) !== nimDerivedAngkatan) {
        registerError(
          elAngkatan,
          `Angkatan harus sesuai dengan NIM (seharusnya ${nimDerivedAngkatan}).`
        );
      }
    }
  }

  if (!email) {
    registerError(elEmail, "Email wajib diisi.");
  } else if (elEmail && !elEmail.checkValidity()) {
    registerError(elEmail, "Format email tidak valid.");
  }

  let parsedIpk = "";
  if (!ipkRaw) {
    registerError(elIpk, "IPK wajib diisi.");
  } else {
    const numericIpk = Number(ipkRaw);
    if (Number.isNaN(numericIpk)) {
      registerError(elIpk, "IPK harus berupa angka.");
    } else if (numericIpk < 0 || numericIpk > 4) {
      registerError(elIpk, "IPK harus berupa angka antara 0.00 sampai 4.00.");
    } else {
      parsedIpk = Number(numericIpk.toFixed(2));
      elIpk.value = parsedIpk.toFixed(2);
    }
  }

  if (!jenisKelamin) {
    registerError(elJenisKelamin, "Jenis kelamin wajib dipilih.");
  } else {
    elJenisKelamin.value = jenisKelamin;
  }

  if (catatan && catatan.length > MAX_CATATAN_LENGTH) {
    registerError(
      elCatatan,
      `Catatan maksimal ${MAX_CATATAN_LENGTH} karakter.`
    );
  }

  if (hasError) {
    if (firstInvalidField) {
      ensureFieldFocus(firstInvalidField);
    }
    showFormFeedback("Periksa kembali input yang ditandai.", "error");
    return;
  }

  if (idVal) {
    // UPDATE DATA
    const idNum = Number(idVal);
    if (isDuplicateEntry(nama, normalizedNim, idNum)) {
      flagFieldInvalid(elNim);
      ensureFieldFocus(elNim);
      showFormFeedback(
        "Nama dan NIM tersebut sudah terdaftar pada data lain.",
        "error"
      );
      return;
    }
    const idx = data.findIndex((x) => x.id === idNum);
    if (idx >= 0) {
      data[idx] = normalizeMahasiswaRecord({
        ...data[idx],
        nama,
        nim: normalizedNim,
        alamat,
        programStudi,
        angkatan,
        email,
        ipk: parsedIpk,
        catatan,
        jenisKelamin,
        fotoUrl: finalFotoUrl,
      });
    }
    alert("Data berhasil diperbarui.");
  } else {
    // CREATE DATA BARU
    if (isDuplicateEntry(nama, normalizedNim)) {
      flagFieldInvalid(elNim);
      ensureFieldFocus(elNim);
      showFormFeedback("Nama dan NIM tersebut sudah terdaftar.", "error");
      return;
    }
    const newEntry = normalizeMahasiswaRecord({
      id: autoId,
      nama,
      nim: normalizedNim,
      alamat,
      programStudi,
      angkatan,
      email,
      ipk: parsedIpk,
      catatan,
      jenisKelamin,
      fotoUrl: finalFotoUrl,
    });
    data.push(newEntry);
    autoId += 1;
    alert("Data berhasil ditambahkan.");
  }

  saveData(data); // Simpan data
  updateAllFilters(); // Update semua filter berdasarkan data terbaru
  applyFilters(); // Terapkan filter yang aktif

  form.reset(); // Reset form
  elId.value = "";
  clearAllFieldErrors();
  clearNimRealtimeFeedback();
  clearCatatanValue();
  resetFotoPreview();
  refreshCustomSelect(elProgramStudi);
  refreshCustomSelect(elJenisKelamin);
  elNama.focus(); // Fokus ke input nama
  setFormEditingMode(false);
});

// ------------------- RESET FORM -------------------
btnReset.addEventListener("click", () => {
  form.reset();
  elId.value = "";
  clearAllFieldErrors();
  clearFormFeedback();
  clearNimRealtimeFeedback();
  clearCatatanValue();
  resetFotoPreview();
  refreshCustomSelect(elProgramStudi);
  refreshCustomSelect(elJenisKelamin);
  elNama.focus();
  setFormEditingMode(false);
});

// ------------------- HANDLER TOMBOL EDIT / HAPUS -------------------
tbody.addEventListener("click", (e) => {
  const fotoLink = e.target.closest(".foto-link");
  if (fotoLink) {
    const href = fotoLink.getAttribute("href") || "";
    const isDataUrl = href.startsWith("data:image/");
    if (isDataUrl) {
      e.preventDefault();
      const previewWindow = window.open("", "_blank");
      if (previewWindow) {
        previewWindow.document.title =
          fotoLink.querySelector("img")?.getAttribute("alt") ||
          "Foto Mahasiswa";
        previewWindow.document.body.style.margin = "0";
        previewWindow.document.body.style.display = "flex";
        previewWindow.document.body.style.alignItems = "center";
        previewWindow.document.body.style.justifyContent = "center";
        previewWindow.document.body.style.backgroundColor = "#111";
        const img = previewWindow.document.createElement("img");
        img.src = href;
        img.alt =
          fotoLink.querySelector("img")?.getAttribute("alt") ||
          "Foto Mahasiswa";
        img.style.maxWidth = "100%";
        img.style.maxHeight = "100vh";
        previewWindow.document.body.appendChild(img);
      } else {
        alert(
          "Tidak dapat membuka jendela baru. Izinkan pop-up untuk melihat foto."
        );
      }
    }
    return;
  }

  const editId = e.target.getAttribute("data-edit");
  const delId = e.target.getAttribute("data-del");

  if (editId) {
    // EDIT DATA
    const item = data.find((x) => x.id === Number(editId));
    if (item) {
      clearAllFieldErrors();
      clearFormFeedback();
      clearNimRealtimeFeedback();
      elId.value = item.id;
      elNama.value = item.nama;
      elNim.value = item.nim;
      elAlamat.value = item.alamat;
      elProgramStudi.value = getProgramStudiDisplay(item) || "";
      elAngkatan.value = getAngkatanDisplay(item) || "";
      elEmail.value = item.email || "";
      elIpk.value =
        item.ipk === "" || item.ipk === null || item.ipk === undefined
          ? ""
          : Number(item.ipk);
      setCatatanValue(item.catatan || "");
      elJenisKelamin.value = sanitizeJenisKelamin(item.jenisKelamin) || "";
      refreshCustomSelect(elProgramStudi);
      refreshCustomSelect(elJenisKelamin);
      const sanitizedFoto = normalizeFotoUrl(item.fotoUrl);
      const fotoMode = sanitizedFoto
        ? sanitizedFoto === DEFAULT_FOTO_URL
          ? FOTO_MODE_DEFAULT
          : FOTO_MODE_CUSTOM
        : FOTO_MODE_NONE;
      setFotoPreview({
        mode: fotoMode,
        src: fotoMode === FOTO_MODE_CUSTOM ? sanitizedFoto : "",
      });
      if (elFotoUpload) {
        elFotoUpload.value = "";
      }
      setFormEditingMode(true);
      elNama.focus();
    }
  }

  if (delId) {
    // DELETE DATA
    const idNum = Number(delId);
    if (confirm("Yakin hapus data ini?")) {
      data = data.filter((x) => x.id !== idNum);
      saveData(data);
      updateAllFilters(); // Update semua filter
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
    return;
  }
  document.body.classList.remove("app-locked");
})();

// ------------------- PAGINATION EVENT LISTENERS -------------------
// Event listener untuk entries per page
if (elEntriesPerPage) {
  elEntriesPerPage.addEventListener("change", (e) => {
    entriesPerPage = parseInt(e.target.value) || 10;
    resetToFirstPage();
    render();
  });
}

// Event listener untuk tombol halaman sebelumnya
if (btnPrevPage) {
  btnPrevPage.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      render();
    }
  });
}

// Event listener untuk tombol halaman selanjutnya
if (btnNextPage) {
  btnNextPage.addEventListener("click", () => {
    const totalPages = getTotalPages();
    if (currentPage < totalPages) {
      currentPage++;
      render();
    }
  });
}

// ------------------- PROGRAM STUDI FILTER -------------------
// Event listener untuk filter program studi
if (elFilterProdi) {
  elFilterProdi.addEventListener("change", () => {
    applyFilters();
  });
}

// ------------------- SORT FUNCTIONALITY -------------------
// Event listener untuk sort
if (elSort) {
  elSort.addEventListener("change", () => {
    render(); // Re-render table dengan urutan baru
    updateActiveFilterDisplay();
  });
}

// ------------------- RESET FILTERS -------------------
// Event listener untuk reset filter button
if (btnResetFilters) {
  btnResetFilters.addEventListener("click", () => {
    resetAllFilters();
  });
}

// ------------------- BULK ACTIONS -------------------
// Event listener untuk checkbox individual pada tabel
tbody.addEventListener("change", (e) => {
  if (e.target.classList.contains("row-select")) {
    // Update state checkbox select all berdasarkan checkbox individual
    const allCheckboxes = document.querySelectorAll(".row-select");
    const checkedCheckboxes = document.querySelectorAll(".row-select:checked");

    if (checkboxSelectAll) {
      if (checkedCheckboxes.length === 0) {
        checkboxSelectAll.checked = false;
        checkboxSelectAll.indeterminate = false;
      } else if (checkedCheckboxes.length === allCheckboxes.length) {
        checkboxSelectAll.checked = true;
        checkboxSelectAll.indeterminate = false;
      } else {
        checkboxSelectAll.checked = false;
        checkboxSelectAll.indeterminate = true;
      }
    }
  }
});

// Event listener untuk pilih semua checkbox
if (checkboxSelectAll) {
  checkboxSelectAll.addEventListener("change", (e) => {
    const checkboxes = document.querySelectorAll(".row-select");
    checkboxes.forEach((checkbox) => {
      checkbox.checked = e.target.checked;
    });
    checkboxSelectAll.indeterminate = false;
  });
}

// Event listener untuk tombol "Pilih Semua"
if (btnPilihSemua) {
  btnPilihSemua.addEventListener("click", () => {
    const checkboxes = document.querySelectorAll(".row-select");
    const allChecked = Array.from(checkboxes).every((cb) => cb.checked);

    checkboxes.forEach((checkbox) => {
      checkbox.checked = !allChecked;
    });

    if (checkboxSelectAll) {
      checkboxSelectAll.checked = !allChecked;
    }
  });
}

// Event listener untuk tombol "Hapus Terpilih"
if (btnHapusTerpilih) {
  btnHapusTerpilih.addEventListener("click", () => {
    const selectedCheckboxes = document.querySelectorAll(".row-select:checked");
    const selectedIds = Array.from(selectedCheckboxes).map((cb) =>
      parseInt(cb.dataset.id)
    );

    if (selectedIds.length === 0) {
      alert("Pilih data yang akan dihapus terlebih dahulu.");
      return;
    }

    if (
      confirm(`Yakin ingin menghapus ${selectedIds.length} data yang dipilih?`)
    ) {
      data = data.filter((item) => !selectedIds.includes(item.id));
      saveData(data);
      updateAllFilters();
      applyFilters();
      alert(`${selectedIds.length} data berhasil dihapus.`);

      // Reset checkbox select all
      if (checkboxSelectAll) {
        checkboxSelectAll.checked = false;
      }
    }
  });
}

// Event listener untuk tombol "Hapus Semua"
if (btnHapusSemua) {
  btnHapusSemua.addEventListener("click", () => {
    if (data.length === 0) {
      alert("Tidak ada data untuk dihapus.");
      return;
    }

    if (
      confirm(
        "Yakin ingin menghapus SEMUA data mahasiswa? Tindakan ini tidak dapat dibatalkan."
      )
    ) {
      data = [];
      saveData(data);
      updateAllFilters();
      applyFilters();
      alert("Semua data berhasil dihapus.");

      // Reset checkbox select all
      if (checkboxSelectAll) {
        checkboxSelectAll.checked = false;
      }
    }
  });
}

// ------------------- INIT -------------------
updateAllFilters(); // Isi opsi filter berdasarkan data yang tersedia
render(); // Render tabel saat halaman pertama kali dibuka
initSearchFromUrl(); // Inisialisasi pencarian dari URL
updateActiveFilterDisplay(); // Update tampilan filter aktif
