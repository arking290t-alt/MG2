// ------------------------------------------------------
// FIREBASE SETUP
// ------------------------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, deleteDoc,
  doc, updateDoc, getDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC6BmLTjzOHwTa2VEYa9eYkClDtS__zvTM",
  authDomain: "mg-manager-3ab66.firebaseapp.com",
  projectId: "mg-manager-3ab66",
  storageBucket: "mg-manager-3ab66.firebasestorage.app",
  messagingSenderId: "330667005987",
  appId: "1:330667005987:web:95de27b6259ace9fc6b996",
  measurementId: "G-05HW0KSN38"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ------------------------------
// DOM Elements
// ------------------------------
const itemName = document.getElementById("itemName");
const quantity = document.getElementById("quantity");
const unit = document.getElementById("unit");
const price = document.getElementById("price");
const invoice = document.getElementById("invoice");
const reel = document.getElementById("reel");
const supplier = document.getElementById("supplier");
const gsm = document.getElementById("gsm");
const bf = document.getElementById("bf");
const dateInput = document.getElementById("date");
const categorySelect = document.getElementById("categorySelect");

const addItemBtn = document.getElementById("addItemBtn");

// Category elements
const newCategoryName = document.getElementById("newCategoryName");
const addCategoryBtn = document.getElementById("addCategoryBtn");
const categoryList = document.getElementById("categoryList");

// Filters
const filterCategory = document.getElementById("filterCategory");
const filterItemName = document.getElementById("filterItemName");
const filterDate = document.getElementById("filterDate");
const clearFilters = document.getElementById("clearFilters");

// Inventory list display
const inventoryList = document.getElementById("inventoryList");

// ======================================================
// 🔥 LOAD CATEGORIES
// ======================================================
async function loadCategories() {
  categorySelect.innerHTML = "";
  filterCategory.innerHTML = `<option value="all">All Categories</option>`;
  categoryList.innerHTML = "";

  const snap = await getDocs(collection(db, "inventoryCategories"));
  snap.forEach(docu => {
    const cat = docu.data().name;

    categorySelect.innerHTML += `<option value="${cat}">${cat}</option>`;
    filterCategory.innerHTML += `<option value="${cat}">${cat}</option>`;

    categoryList.innerHTML += `
      <div class="cat-item">
        <span>${cat}</span>
        <button class="delete-btn" onclick="deleteCategory('${docu.id}')">Delete</button>
      </div>
    `;
  });
}

window.deleteCategory = async function (id) {
  await deleteDoc(doc(db, "inventoryCategories", id));
  loadCategories();
};

// ======================================================
// 🔥 ADD CATEGORY
// ======================================================
addCategoryBtn.onclick = async () => {
  const name = newCategoryName.value.trim();
  if (!name) return;

  await addDoc(collection(db, "inventoryCategories"), { name });
  newCategoryName.value = "";
  loadCategories();
};

// ======================================================
// 🔥 ADD ITEM TO INVENTORY
// ======================================================
addItemBtn.onclick = async () => {
  const data = {
    name: itemName.value,
    qty: Number(quantity.value),
    unit: unit.value,
    price: Number(price.value),
    invoice: invoice.value,
    reel: reel.value,
    supplier: supplier.value,
    gsm: gsm.value,
    bf: bf.value,
    date: dateInput.value,
    category: categorySelect.value,
  };

  await addDoc(collection(db, "inventory"), data);

  // Clear
  itemName.value = "";
  quantity.value = "";
  price.value = "";
  invoice.value = "";
  reel.value = "";
  supplier.value = "";
  gsm.value = "";
  bf.value = "";
  dateInput.value = "";

  loadInventory();
};

// ======================================================
// 🔥 LOAD INVENTORY LIST WITH FILTERS
// ======================================================
async function loadInventory() {
  inventoryList.innerHTML = "";
  filterItemName.innerHTML = `<option value="all">All Items</option>`;

  const snap = await getDocs(collection(db, "inventory"));
  let items = [];

  snap.forEach(d => items.push({ id: d.id, ...d.data() }));

  // FILTERS
  if (filterCategory.value !== "all")
    items = items.filter(i => i.category === filterCategory.value);

  if (filterItemName.value !== "all")
    items = items.filter(i => i.name === filterItemName.value);

  if (filterDate.value)
    items = items.filter(i => i.date === filterDate.value);

  // Build item name filter
  const uniqueNames = [...new Set(items.map(i => i.name))];
  uniqueNames.forEach(n => {
    filterItemName.innerHTML += `<option value="${n}">${n}</option>`;
  });

  if (items.length === 0) {
    inventoryList.innerHTML = `<p style="text-align:center; opacity:0.7;">No items found.</p>`;
    return;
  }

  items.forEach(item => {
    inventoryList.innerHTML += `
      <div class="inventory-item">
        <h3>${item.name}</h3>
        <p>Qty: ${item.qty} ${item.unit}</p>
        <p>Date: ${item.date}</p>
        <p>Category: ${item.category}</p>

        <div class="actions">
          <button class="btn btn-view" onclick="viewItem('${item.id}')">View</button>
          <button class="btn btn-edit" onclick="editItem('${item.id}')">Edit</button>
          <button class="btn btn-used" onclick="useItem('${item.id}')">Used</button>
          <button class="btn btn-delete" onclick="deleteItem('${item.id}')">Delete</button>
        </div>
      </div>
    `;
  });
}

// ======================================================
// 🔥 DELETE ITEM
// ======================================================
window.deleteItem = async function (id) {
  await deleteDoc(doc(db, "inventory", id));
  loadInventory();
};

// ======================================================
// 🔥 VIEW ITEM DETAILS POPUP
// ======================================================
window.viewItem = async function (id) {
  const snap = await getDoc(doc(db, "inventory", id));
  const item = snap.data();

  const popup = document.createElement("div");
  popup.className = "popup";

  popup.innerHTML = `
    <div class="popup-box">
      <h2>Item Details</h2>

      <label>Name</label>
      <input value="${item.name}" disabled>

      <label>Invoice</label>
      <input value="${item.invoice}" disabled>

      <label>Reel</label>
      <input value="${item.reel}" disabled>

      <label>Supplier</label>
      <input value="${item.supplier}" disabled>

      <label>GSM</label>
      <input value="${item.gsm}" disabled>

      <label>BF</label>
      <input value="${item.bf}" disabled>

      <label>Qty</label>
      <input value="${item.qty} ${item.unit}" disabled>

      <label>Price</label>
      <input value="${item.price}" disabled>

      <label>Category</label>
      <input value="${item.category}" disabled>

      <label>Date</label>
      <input value="${item.date}" disabled>

      <button class="btn-close" onclick="this.parentElement.parentElement.remove()">Close</button>
    </div>
  `;

  document.body.appendChild(popup);
};

// ======================================================
// 🔥 USED ITEM POPUP + MOVE TO inventoryUsed
// ======================================================
window.useItem = async function (id) {
  const snap = await getDoc(doc(db, "inventory", id));
  const item = snap.data();

  const popup = document.createElement("div");
  popup.className = "popup";

  popup.innerHTML = `
    <div class="popup-box">
      <h2>Use Item</h2>

      <label>Used Quantity</label>
      <input id="usedQty" type="number">

      <label>Used For</label>
      <input id="usedFor" type="text">

      <button class="btn-save" id="saveUsedBtn">Save</button>
      <button class="btn-close" onclick="this.parentElement.parentElement.remove()">Cancel</button>
    </div>
  `;

  document.body.appendChild(popup);

  document.getElementById("saveUsedBtn").onclick = async () => {
    const usedQty = Number(document.getElementById("usedQty").value);
    const usedFor = document.getElementById("usedFor").value;

    // ————————————————
    // SAVE USED ENTRY
    // ————————————————
    await addDoc(collection(db, "inventoryUsed"), {
      name: item.name,
      usedQty,
      usedFor,
      date: new Date().toLocaleString(),
      category: item.category,
      unit: item.unit,
      originalDate: item.date,
      originalPrice: item.price,
      reel: item.reel,
      supplier: item.supplier
    });

    // ————————————————
    // UPDATE INVENTORY QTY
    // ————————————————
    let newQty = item.qty - usedQty;

    if (newQty <= 0) {
      await deleteDoc(doc(db, "inventory", id));
    } else {
      await updateDoc(doc(db, "inventory", id), { qty: newQty });
    }

    popup.remove();
    loadInventory();
  };
};

// ======================================================
// 🔥 EDIT ITEM (next update if you want)
// ======================================================
window.editItem = function (id) {
  alert("Edit popup coming in next update");
};

// ======================================================
// CLEAR FILTERS
// ======================================================
clearFilters.onclick = () => {
  filterCategory.value = "all";
  filterItemName.value = "all";
  filterDate.value = "";
  loadInventory();
};

// INITIAL LOAD
loadCategories();
loadInventory();
