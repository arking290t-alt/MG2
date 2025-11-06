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
// ===== Paid Amount System =====
const PAY_KEY = "payments_by_staff";
let paymentData = JSON.parse(localStorage.getItem(PAY_KEY)) || {};

function updatePaidSection(total) {
  if (!selectedStaff) return;
  const y = viewDate.getFullYear(), m = viewDate.getMonth() + 1;
  const monthKey = `${y}-${m}`;
  const list = (paymentData[selectedStaff]?.[monthKey]) || [];
  const totalPaid = list.reduce((a, b) => a + b, 0);
  paidList.textContent = list.length ? list.map(x => "₹" + x).join(" | ") : "None";
  paidTotal.textContent = totalPaid;
  remaining.textContent = Math.max(0, total - totalPaid);
}

document.getElementById("addPaid").onclick = () => {
  if (!selectedStaff) return alert("Select a staff first!");
  const val = parseFloat(prompt("Enter paid amount: ₹"));
  if (isNaN(val) || val <= 0) return;
  const y = viewDate.getFullYear(), m = viewDate.getMonth() + 1;
  const monthKey = `${y}-${m}`;
  if (!paymentData[selectedStaff]) paymentData[selectedStaff] = {};
  if (!paymentData[selectedStaff][monthKey]) paymentData[selectedStaff][monthKey] = [];
  paymentData[selectedStaff][monthKey].push(val);
  localStorage.setItem(PAY_KEY, JSON.stringify(paymentData));
  renderCalendar();
};
updatePaidSection(total);
function addPayment() {
  const staffName = staffSelect.value;
  if (!staffName) return alert("Select a staff first!");

  const amount = prompt("Enter payment amount:");
  if (!amount || isNaN(amount)) return;

  const note = prompt("Enter note (optional):") || "Salary Payment";
  const payAmount = parseFloat(amount);
  const payDate = new Date().toLocaleDateString();

  // Store in attendance paymentData
  const payKey = `${staffName}_${currentYear}_${currentMonth}`;
  if (!paymentData[payKey]) paymentData[payKey] = [];
  paymentData[payKey].push({ amount: payAmount, note, date: payDate });
  localStorage.setItem(PAY_KEY, JSON.stringify(paymentData));

  // ✅ Also save to expenses automatically
  const EXP_KEY = "expensesData";
  let expensesData = JSON.parse(localStorage.getItem(EXP_KEY)) || [];

  expensesData.push({
    category: "Salary",
    description: `${note} - ${staffName}`,
    amount: payAmount,
    date: payDate,
    month: currentMonth,
    year: currentYear
  });

  localStorage.setItem(EXP_KEY, JSON.stringify(expensesData));

  // Update the display
  alert(`₹${payAmount.toFixed(2)} added for ${staffName} and logged in Expenses.`);
  updateSalarySummary();
}
