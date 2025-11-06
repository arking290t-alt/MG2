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
// Logout functionality
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.clear();
      window.location.href = "index.html";
    });
  }
});
// ================== STAFF PAGE FUNCTIONALITY ==================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("staffForm");
  const staffContainer = document.getElementById("staffContainer");
  if (!form || !staffContainer) return; // Only run on staff.html

  // Fetch staff list from localStorage
  function getStaff() {
    return JSON.parse(localStorage.getItem("staffList") || "[]");
  }

  // Save staff list
  function saveStaff(list) {
    localStorage.setItem("staffList", JSON.stringify(list));
  }

  // Render all staff cards
  function renderStaff() {
    const staffList = getStaff();
    staffContainer.innerHTML = "";

    if (staffList.length === 0) {
      staffContainer.innerHTML = `<p class="subtitle">No staff added yet.</p>`;
      return;
    }

    staffList.forEach((staff, index) => {
      const card = document.createElement("div");
      card.classList.add("staff-card");

      card.innerHTML = `
        <div class="staff-info">
          <h4>${staff.name}</h4>
          <p>${staff.phone} | ₹${staff.salary}/month</p>
        </div>
        <button class="btn-delete" data-index="${index}">Delete</button>
      `;

      staffContainer.appendChild(card);
    });

    // Delete button actions
    document.querySelectorAll(".btn-delete").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const i = e.target.getAttribute("data-index");
        const confirmDelete = confirm("Are you sure you want to delete this staff member?");
        if (confirmDelete) {
          const staffList = getStaff();
          staffList.splice(i, 1);
          saveStaff(staffList);
          renderStaff();
        }
      });
    });
  }

  // Handle form submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("staffName").value.trim();
    const phone = document.getElementById("staffPhone").value.trim();
    const salary = document.getElementById("staffSalary").value.trim();

    if (!name || !phone || !salary) {
      alert("Please fill all fields.");
      return;
    }

    const staffList = getStaff();
    staffList.push({ name, phone, salary });
    saveStaff(staffList);

    form.reset();
    renderStaff();
  });

  renderStaff();
});
attendance = {
  "vikas": { Present: 3, Absent: 1, Leave: 0 }
}
