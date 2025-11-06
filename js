document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) loginBtn.addEventListener("click", login);
  loadData();
});

const ADMIN_ID = "pratham";
const ADMIN_PASS = "pratham0056";

function login() {
  const id = document.getElementById("loginId").value.trim();
  const pass = document.getElementById("loginPass").value.trim();
  const msg = document.getElementById("loginMsg");

  if (id === ADMIN_ID && pass === ADMIN_PASS) {
    localStorage.setItem("role", "admin");
    window.location.href = "home.html";
  } else {
    const staffList = JSON.parse(localStorage.getItem("staffList")) || [];
    const found = staffList.find(s => s.id === id && s.password === pass);
    if (found) {
      localStorage.setItem("role", "staff");
      localStorage.setItem("staffId", id);
      window.location.href = "mystaff.html";
    } else {
      msg.textContent = "❌ Invalid ID or Password";
      msg.style.color = "#ff7b7b";
    }
  }
}

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

let staffList = JSON.parse(localStorage.getItem("staffList")) || [];
let attendanceList = JSON.parse(localStorage.getItem("attendanceList")) || [];
let expenseList = JSON.parse(localStorage.getItem("expenseList")) || [];

function loadData() {
  if (document.getElementById("staffList")) renderStaff();
  if (document.getElementById("attendanceList")) renderAttendance();
  if (document.getElementById("expenseList")) renderExpenses();
  if (document.getElementById("attendanceSelect")) updateStaffDropdown();
  if (document.getElementById("staffNameLabel")) {
    const staffId = localStorage.getItem("staffId");
    document.getElementById("staffNameLabel").textContent = staffId;
    renderMyAttendance(staffId);
  }
}

// Staff
function addStaff() {
  const name = staffName.value.trim();
  const phone = staffPhone.value.trim();
  const salary = staffSalary.value.trim();
  if (!name || !phone || !salary) return alert("Fill all fields!");
  const id = name.toLowerCase().replace(/\s/g, "") + Math.floor(Math.random() * 1000);
  const password = phone.slice(-4);
  staffList.push({ id, name, phone, salary, password });
  localStorage.setItem("staffList", JSON.stringify(staffList));
  alert(`✅ Staff Added!\nID: ${id}\nPass: ${password}`);
  renderStaff();
  updateStaffDropdown();
}

function renderStaff() {
  const list = document.getElementById("staffList");
  if (!list) return;
  list.innerHTML = staffList.map(s => 
    `<li><b>${s.name}</b> — ₹${s.salary} | 📞 ${s.phone} | ID: <span>${s.id}</span></li>`
  ).join('');
}

function updateStaffDropdown() {
  const sel = document.getElementById("attendanceSelect");
  if (!sel) return;
  sel.innerHTML = staffList.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

// Attendance
function markAttendance() {
  const id = document.getElementById("attendanceSelect").value;
  attendanceList.push({ staffId: id, date: new Date().toLocaleDateString() });
  localStorage.setItem("attendanceList", JSON.stringify(attendanceList));
  renderAttendance();
}

function renderAttendance() {
  const list = document.getElementById("attendanceList");
  if (!list) return;
  list.innerHTML = attendanceList.map(a => {
    const s = staffList.find(x => x.id === a.staffId);
    return `<li>${s ? s.name : a.staffId} - ${a.date}</li>`;
  }).join('');
}

function markAttendanceStaff() {
  const id = localStorage.getItem("staffId");
  attendanceList.push({ staffId: id, date: new Date().toLocaleDateString() });
  localStorage.setItem("attendanceList", JSON.stringify(attendanceList));
  renderMyAttendance(id);
}

function renderMyAttendance(id) {
  const list = document.getElementById("myAttendanceList");
  if (!list) return;
  list.innerHTML = attendanceList.filter(a => a.staffId === id)
    .map(a => `<li>${a.date}</li>`).join('');
}

// Expenses
function addExpense() {
  const name = expenseName.value.trim();
  const amount = expenseAmount.value.trim();
  if (!name || !amount) return alert("Fill all fields!");
  expenseList.push({ name, amount, date: new Date().toLocaleDateString() });
  localStorage.setItem("expenseList", JSON.stringify(expenseList));
  renderExpenses();
}

function renderExpenses() {
  const list = document.getElementById("expenseList");
  if (!list) return;
  list.innerHTML = expenseList.map(e => `<li>${e.name} — ₹${e.amount} (${e.date})</li>`).join('');
}
