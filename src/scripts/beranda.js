(function () {
  const SESSION_KEY = "crud_active_user";
  const dashboardBtn = document.getElementById("btn-dashboard");

  if (!dashboardBtn) return;

  // Cek apakah user sudah login
  const activeUser = sessionStorage.getItem(SESSION_KEY);

  if (activeUser) {
    // Jika sudah login maka arahkan ke dasbor
    dashboardBtn.setAttribute("href", "./dasbor.html");
    dashboardBtn.textContent = "Buka Dasbor";
  } else {
    // Jika belum login maka arahkan ke halaman login
    dashboardBtn.setAttribute("href", "./login.html");
    dashboardBtn.textContent = "Masuk ke Dasbor";
  }
})();
