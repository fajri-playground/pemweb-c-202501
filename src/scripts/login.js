(function () {
  const SESSION_KEY = "crud_active_user";
  const EYE_OPEN_ICON = "../assets/eye-solid-full.svg";
  const EYE_CLOSED_ICON = "../assets/eye-slash-solid-full.svg";

  // Cegah akses halaman klw udh login
  const activeUser = sessionStorage.getItem(SESSION_KEY);
  if (activeUser) {
    alert("Anda sudah login");
    window.location.href = "/src/pages/dasbor.html";
    return;
  }

  // Akun default (email + hash password SHA-256)
  const defaultUsers = [
    {
      email: "admin@example.com",
      passwordHash:
        "e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7", // Admin@123
      name: "Administrator",
    },
  ];

  // Ambil elemen form & input
  const form = document.getElementById("login-form");
  const identityInput = document.getElementById("identity");
  const passwordInput = document.getElementById("password");
  const toggleButton = document.getElementById("toggle-password");
  const passwordIcon = document.getElementById("password-icon");

  if (!form || !identityInput || !passwordInput) return;

  // Utility untuk hashing password (SHA-256, async)
  async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  const normalize = (value = "") => value.toString().toLowerCase().trim();

  // Cari user berdasarkan email (identity)
  function findUserByIdentity(identity) {
    const formatted = normalize(identity);
    return defaultUsers.find((user) => normalize(user.email) === formatted);
  }

  // Toggle visibilitas password (ikon mata)
  let isPasswordVisible = false;
  function updatePasswordVisibility() {
    passwordInput.type = isPasswordVisible ? "text" : "password";
    if (passwordIcon) {
      passwordIcon.src = isPasswordVisible ? EYE_OPEN_ICON : EYE_CLOSED_ICON;
    }
    if (toggleButton) {
      toggleButton.setAttribute(
        "aria-label",
        isPasswordVisible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
      );
      toggleButton.setAttribute("aria-pressed", String(isPasswordVisible));
    }
  }
  if (toggleButton && passwordIcon) {
    toggleButton.addEventListener("click", () => {
      isPasswordVisible = !isPasswordVisible;
      updatePasswordVisibility();
      passwordInput.focus({ preventScroll: true });
    });
  }
  updatePasswordVisibility();

  // handle form submit
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // ambil dan validasi input
    const identity = identityInput.value.trim();
    const password = passwordInput.value;

    if (!identity || !password) {
      alert("Harap lengkapi email dan kata sandi.");
      return;
    }

    // Validasi user berdasarkan email
    const user = findUserByIdentity(identity);
    if (!user) {
      alert("Identitas atau kata sandi salah.");
      return;
    }

    // Cek hash password
    const inputHash = await hashPassword(password);
    if (inputHash !== user.passwordHash) {
      alert("Identitas atau kata sandi salah.");
      return;
    }

    // Simpan session ke sessionStorage
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        identity: user.email,
        name: user.name,
        lastLogin: new Date().toISOString(),
      })
    );

    alert("Login berhasil! Selamat datang kembali.");
    window.location.href = "/src/pages/dasbor.html";
  });
})();
