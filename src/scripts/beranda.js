(function () {
  const SESSION_KEY = "crud_active_user";
  const dashboardBtn = document.getElementById("btn-dashboard");

  if (!dashboardBtn) return;

  function resolveAppPath(page) {
    const pathname = window.location.pathname;
    const usesSrcPages = pathname.includes("/src/pages/");
    return usesSrcPages ? `/src/pages/${page}/index.html` : `/${page}`;
  }

  // Cek apakah user sudah login
  const activeUser = sessionStorage.getItem(SESSION_KEY);

  if (activeUser) {
    // Jika sudah login maka arahkan ke dasbor
    dashboardBtn.setAttribute("href", resolveAppPath("dasbor"));
    dashboardBtn.textContent = "Buka Dasbor";
  } else {
    // Jika belum login maka arahkan ke halaman login
    dashboardBtn.setAttribute("href", resolveAppPath("login"));
    dashboardBtn.textContent = "Masuk ke Dasbor";
  }
})();
