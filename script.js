// script.js

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const errorMsg = document.getElementById("error");

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const user = document.getElementById("userid").value.trim().toLowerCase();
    const pass = document.getElementById("password").value.trim().toLowerCase();
    const role = document.getElementById("role").value;

    if (
      (user === "id-pratham" || user === "pratham") &&
      (pass === "pass-pratham0056" || pass === "pratham0056") &&
      role === "owner"
    ) {
      sessionStorage.setItem("loginRole", "owner");
      window.location.href = "dashboard.html";
    } else if (role === "staff") {
      sessionStorage.setItem("loginRole", "staff");
      window.location.href = "staff.html";
    } else {
      errorMsg.textContent = "Invalid credentials. Please try again.";
    }
  });
});
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
