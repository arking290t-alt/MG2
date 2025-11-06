document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const errorMsg = document.getElementById("error");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const user = document.getElementById("userid").value.trim();
    const pass = document.getElementById("password").value.trim();
    const role = document.getElementById("role").value;

    if (role === "owner" && user === "pratham" && pass === "pratham0056") {
      sessionStorage.setItem("loginRole", "owner");
      window.location.href = "dashboard.html";
    } else if (role === "staff") {
      sessionStorage.setItem("loginRole", "staff");
      window.location.href = "staff.html";
    } else {
      errorMsg.textContent = "Incorrect ID or Password!";
    }
  });
});
// Logout button (on dashboard)
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.clear();
      window.location.href = "index.html";
    });
  }
});

