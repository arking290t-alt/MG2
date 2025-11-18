// ------------------------------------------------------
// FIREBASE SETUP
// ------------------------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, deleteDoc,
  doc, updateDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC6BmLTjzOHwTa2VEYa9eYkClDtS__zvTM",
  authDomain: "mg-manager-3ab66.firebaseapp.com",
  projectId: "mg-manager-3ab66",
  storageBucket: "mg-manager-3ab66.firebasestorage.app",
  messagingSenderId: "330667005987",
  appId: "1:330667005987:web:95de27b6259ace9fc6b996",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ------------------------------------------------------
// DOM ELEMENTS
// ------------------------------------------------------
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

// Category
const newCategoryName = document.getElementById("newCategoryName");
const addCategoryBtn = document.getElementById("addCategoryBtn");
const categoryList = document.getElementById("categoryList");

// Filters
const filterCategory = document.getElementById("filterCategory");
const filterItemName = document.getElementById("filterItemName");
const filterDate = document.getElementById("filterDate");
const clearFilters = document.getElementById("clearFilters");

// List
const inventoryList = document.getElementById("inventoryList");

// STORE ALL ITEMS HERE
let allInventory = [];

// =====================================================
// 🔥 LOAD CATEGORIES
// =====================================================
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
        <button class="delete-btn" onclick="deleteCategory('${docu.id}', '${cat}')">Delete</button>
      </div>
    `;
  });
}

window.deleteCategory = async function (id, name) {
  if (!confirm(`Delete category: ${name}?`)) return;
  await deleteDoc(doc(db, "inventoryCategories", id));
  loadCategories();
};

// =====================================================
// 🔥 ADD CATEGORY
// =====================================================
addCategoryBtn.onclick = async () => {
  const name = newCategoryName.value.trim();
  if (!name) return alert("Enter category name!");

  await addDoc(collection(db, "inventoryCategories"), { name });
  newCategoryName.value = "";
  loadCategories();
};

// =====================================================
// 🔥 ADD ITEM
// =====================================================
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

// =====================================================
// 🔥 LOAD INVENTORY WITH FILTERS
// =====================================================
async function loadInventory() {
  inventoryList.innerHTML = "";
  filterItemName.innerHTML = `<option value="all">All Items</option>`;

  const snap = await getDocs(collection(db, "inventory"));
  allInventory = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  let items = [...allInventory];

  // FILTERS
  if (filterCategory.value !== "all") {
    items = items.filter(i => i.category === filterCategory.value);
  }
  if (filterItemName.value !== "all") {
    items = items.filter(i => i.name === filterItemName.value);
  }
  if (filterDate.value) {
    items = items.filter(i => i.date === filterDate.value);
  }

  // BUILD ITEM NAME FILTER LIST
  const uniqueNames = [...new Set(allInventory.map(i => i.name))];
  uniqueNames.forEach(n => {
    filterItemName.innerHTML += `<option value="${n}">${n}</option>`;
  });

  if (items.length === 0) {
    inventoryList.innerHTML = `<p style="opacity:0.7; text-align:center;">No items found.</p>`;
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
          <button class="btn btn-delete" onclick="deleteItem('${item.id}', '${item.name}')">Delete</button>
        </div>
      </div>
    `;
  });
}

// =====================================================
// 🔥 DELETE ITEM (WITH CONFIRM)
// =====================================================
window.deleteItem = async function (id, name) {
  if (!confirm(`Delete ${name}?`)) return;
  await deleteDoc(doc(db, "inventory", id));
  loadInventory();
};

// =====================================================
// 🔥 VIEW POPUP
// =====================================================
window.viewItem = function (id) {
  const item = allInventory.find(x => x.id === id);
  if (!item) return;

  d_name.innerText = item.name;
  d_invoice.innerText = item.invoice;
  d_reel.innerText = item.reel;
  d_supplier.innerText = item.supplier;
  d_gsm.innerText = item.gsm;
  d_bf.innerText = item.bf;
  d_qty.innerText = `${item.qty} ${item.unit}`;
  d_price.innerText = item.price;
  d_category.innerText = item.category;
  d_date.innerText = item.date;

  detailsPopup.style.display = "flex";
};

window.closeDetails = function () {
  detailsPopup.style.display = "none";
};

// =====================================================
// 🔥 EDIT POPUP
// =====================================================
let currentEditId = null;

window.editItem = function (id) {
  const item = allInventory.find(x => x.id === id);
  if (!item) return;

  currentEditId = id;

  e_name.value = item.name;
  e_invoice.value = item.invoice;
  e_reel.value = item.reel;
  e_supplier.value = item.supplier;
  e_gsm.value = item.gsm;
  e_bf.value = item.bf;
  e_qty.value = item.qty;
  e_price.value = item.price;
  e_category.value = item.category;
  e_date.value = item.date;

  editPopup.style.display = "flex";
};

window.closeEdit = function () {
  editPopup.style.display = "none";
};

window.saveEdit = async function () {
  const ref = doc(db, "inventory", currentEditId);

  await updateDoc(ref, {
    name: e_name.value,
    invoice: e_invoice.value,
    reel: e_reel.value,
    supplier: e_supplier.value,
    gsm: e_gsm.value,
    bf: e_bf.value,
    qty: Number(e_qty.value),
    price: Number(e_price.value),
    category: e_category.value,
    date: e_date.value
  });

  closeEdit();
  loadInventory();
};

// =====================================================
// 🔥 USED POPUP
// =====================================================
let currentUsedId = null;
let currentUsedItem = null;

window.useItem = function (id) {
  const item = allInventory.find(x => x.id === id);
  if (!item) return;

  currentUsedId = id;
  currentUsedItem = item;

  u_available.value = `${item.qty} ${item.unit}`;
  u_qty.value = "";
  u_for.value = "";

  usedPopup.style.display = "flex";
};

window.closeUsed = function () {
  usedPopup.style.display = "none";
};

window.saveUsed = async function () {
  const usedQty = Number(u_qty.value);
  const usedFor = u_for.value.trim();

  const ref = doc(db, "inventory", currentUsedId);

  const newQty = currentUsedItem.qty - usedQty;

  await updateDoc(ref, { qty: newQty });

  await addDoc(collection(db, "inventoryUsed"), {
    itemId: currentUsedId,
    name: currentUsedItem.name,
    usedQty,
    usedFor,
    unit: currentUsedItem.unit,
    date: new Date().toLocaleString()
  });

  closeUsed();
  loadInventory();
};

// =====================================================
// CLEAR FILTERS
// =====================================================
clearFilters.onclick = () => {
  filterCategory.value = "all";
  filterItemName.value = "all";
  filterDate.value = "";
  loadInventory();
};

// INITIAL LOAD
loadCategories();
loadInventory();
