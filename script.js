<script>
  const staffSelect = document.getElementById("staffSelect");
  const calendar = document.getElementById("calendar");
  const modal = document.getElementById("attendanceModal");
  const closeModal = document.getElementById("closeModal");
  const actions = document.getElementById("actions");
  const modalTitle = document.getElementById("modalTitle");
  const salarySummary = document.getElementById("salarySummary");
  const addPaymentBtn = document.getElementById("addPaymentBtn");

  const STAFF_KEY = "staffList";
  const ATTEND_KEY = "attendanceData";
  const PAY_KEY = "paymentData";
  const PAY_LIST_KEY = "paymentListData";

  const staffList = JSON.parse(localStorage.getItem(STAFF_KEY)) || [];
  const attendanceData = JSON.parse(localStorage.getItem(ATTEND_KEY)) || {};
  const paymentData = JSON.parse(localStorage.getItem(PAY_KEY)) || {};
  const paymentListData = JSON.parse(localStorage.getItem(PAY_LIST_KEY)) || {};

  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  let currentDay = null;

  function updateMonthYear() {
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    document.getElementById("monthYear").textContent = `${months[currentMonth]} ${currentYear}`;
  }

  function loadStaffList() {
    if (!staffList.length) {
      staffSelect.innerHTML = "<option>No staff added</option>";
      return;
    }
    staffSelect.innerHTML = `<option value="">Select Staff</option>` + staffList.map(s => `<option value="${s.name}">${s.name}</option>`).join("");
  }

  function renderCalendar() {
    calendar.innerHTML = "";
    updateMonthYear();

    const staffName = staffSelect.value;
    if (!staffName) return;

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const div = document.createElement("div");
      div.className = "day";
      div.textContent = i;

      const key = `${staffName}_${currentYear}_${currentMonth}_${i}`;
      const rec = attendanceData[key];
      if (rec) {
        const dot = document.createElement("div");
        dot.className = "dot";
        dot.style.background = rec.status === "Present" ? "var(--present)" :
                               rec.status === "Half" ? "var(--half)" :
                               rec.status === "Absent" ? "var(--absent)" :
                               rec.status === "Leave" ? "var(--leave)" :
                               rec.status === "OT" ? "var(--ot)" : "#888";
        div.appendChild(dot);
      }

      div.onclick = () => openAttendanceModal(i);
      calendar.appendChild(div);
    }

    updateSalarySummary();
    renderPaymentList();
  }

  function openAttendanceModal(day) {
    const staffName = staffSelect.value;
    if (!staffName) return alert("Select a staff first!");

    modal.style.display = "flex";
    modalTitle.textContent = `${staffName} - ${day}/${currentMonth + 1}/${currentYear}`;
    currentDay = day;

    actions.innerHTML = `
      <button class="present" onclick="mark('Present')">Present</button>
      <button class="half" onclick="mark('Half')">Half</button>
      <button class="absent" onclick="mark('Absent')">Absent</button>
      <button class="leave" onclick="mark('Leave')">Leave</button>
      <button class="ot" onclick="markOT()">OT</button>
      <button class="clear" onclick="clearStatus()">Clear</button>
    `;
  }

  function mark(status) {
    const staffName = staffSelect.value;
    const key = `${staffName}_${currentYear}_${currentMonth}_${currentDay}`;
    attendanceData[key] = { status, ot: 0 };
    localStorage.setItem(ATTEND_KEY, JSON.stringify(attendanceData));
    renderCalendar();
    updateSalarySummary();
    modal.style.display = "none";
  }

  function markOT() {
    const staffName = staffSelect.value;
    const rate = prompt("Enter OT amount:");
    if (!rate || isNaN(rate)) return;
    const key = `${staffName}_${currentYear}_${currentMonth}_${currentDay}`;
    attendanceData[key] = { status: "OT", ot: parseFloat(rate) };
    localStorage.setItem(ATTEND_KEY, JSON.stringify(attendanceData));
    renderCalendar();
    updateSalarySummary();
    modal.style.display = "none";
  }

  function clearStatus() {
    const staffName = staffSelect.value;
    const key = `${staffName}_${currentYear}_${currentMonth}_${currentDay}`;
    delete attendanceData[key];
    localStorage.setItem(ATTEND_KEY, JSON.stringify(attendanceData));
    renderCalendar();
    updateSalarySummary();
    modal.style.display = "none";
  }

  function addPayment() {
    const staffName = staffSelect.value;
    if (!staffName) return alert("Select a staff first!");

    const amount = prompt("Enter payment amount:");
    if (!amount || isNaN(amount)) return;

    const key = `${staffName}_${currentYear}_${currentMonth}`;
    const paymentId = Date.now();

    // update totals
    paymentData[key] = (paymentData[key] || 0) + parseFloat(amount);
    localStorage.setItem(PAY_KEY, JSON.stringify(paymentData));

    // add to list
    if (!paymentListData[key]) paymentListData[key] = [];
    paymentListData[key].push({ id: paymentId, amount: parseFloat(amount) });
    localStorage.setItem(PAY_LIST_KEY, JSON.stringify(paymentListData));

    updateSalarySummary();
    renderPaymentList();
  }

  function deletePayment(paymentId) {
    const staffName = staffSelect.value;
    const key = `${staffName}_${currentYear}_${currentMonth}`;
    const list = paymentListData[key] || [];

    const item = list.find(p => p.id === paymentId);
    if (!item) return;

    if (!confirm("Delete this payment of ₹" + item.amount + "?")) return;

    // remove payment
    const newList = list.filter(p => p.id !== paymentId);
    paymentListData[key] = newList;
    localStorage.setItem(PAY_LIST_KEY, JSON.stringify(paymentListData));

    // adjust total (add back to remaining)
    paymentData[key] = (paymentData[key] || 0) - item.amount;
    if (paymentData[key] < 0) paymentData[key] = 0;
    localStorage.setItem(PAY_KEY, JSON.stringify(paymentData));

    updateSalarySummary();
    renderPaymentList();
  }

  function renderPaymentList() {
    const staffName = staffSelect.value;
    const key = `${staffName}_${currentYear}_${currentMonth}`;
    const list = paymentListData[key] || [];

    let listContainer = document.getElementById("paymentList");
    if (!listContainer) {
      listContainer = document.createElement("div");
      listContainer.id = "paymentList";
      listContainer.style.marginTop = "20px";
      listContainer.style.textAlign = "center";
      document.querySelector(".container").appendChild(listContainer);
    }

    if (!staffName) {
      listContainer.innerHTML = "";
      return;
    }

    if (list.length === 0) {
      listContainer.innerHTML = `<p style="color:#aaa;">No payments added yet.</p>`;
      return;
    }

    listContainer.innerHTML = `
      <h3 style="color:var(--accent);">Payments This Month</h3>
      ${list.map(p => `
        <div style="margin:6px auto; width:240px; background:rgba(255,255,255,0.07); padding:6px 10px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
          <span>₹${p.amount.toFixed(2)}</span>
          <button onclick="deletePayment(${p.id})" style="background:#ef4444; border:none; color:white; border-radius:6px; padding:3px 8px; cursor:pointer;">Delete</button>
        </div>
      `).join("")}
    `;
  }

  function updateSalarySummary() {
    const staffName = staffSelect.value;
    const staff = staffList.find(s => s.name === staffName);
    if (!staff) return;

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const perDay = staff.salary / daysInMonth;
    let full = 0, half = 0, totalOT = 0;

    for (let i = 1; i <= daysInMonth; i++) {
      const key = `${staffName}_${currentYear}_${currentMonth}_${i}`;
      const rec = attendanceData[key];
      if (!rec) continue;
      if (rec.status === "Present") full++;
      if (rec.status === "Half") half += 0.5;
      if (rec.status === "OT") totalOT += rec.ot;
    }

    const total = (full + half) * perDay + totalOT;
    const payKey = `${staffName}_${currentYear}_${currentMonth}`;
    const paid = paymentData[payKey] || 0;
    const remaining = total - paid;

    salarySummary.textContent = `Per Day: ₹${perDay.toFixed(2)} | Earnings: ₹${total.toFixed(2)} | Paid: ₹${paid.toFixed(2)} | Remaining: ₹${remaining.toFixed(2)}`;
  }

  document.getElementById("prevMonth").onclick = () => {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    renderCalendar();
  };

  document.getElementById("nextMonth").onclick = () => {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    renderCalendar();
  };

  closeModal.onclick = () => modal.style.display = "none";
  window.onclick = e => { if (e.target === modal) modal.style.display = "none"; };

  document.getElementById("logoutBtn").onclick = () => {
    localStorage.removeItem("loggedInUser");
    location.href = "login.html";
  };

  staffSelect.onchange = renderCalendar;
  addPaymentBtn.onclick = addPayment;

  loadStaffList();
</script>
