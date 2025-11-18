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

    // add to dropdowns
    categorySelect.innerHTML += `<option value="${cat}">${cat}</option>`;
    filterCategory.innerHTML += `<option value="${cat}">${cat}</option>`;

    // add to manager list
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

  // Save item
  await addDoc(collection(db, "inventory"), data);

  // Clear form
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

  // APPLY FILTERS
  if (filterCategory.value !== "all") {
    items = items.filter(i => i.category === filterCategory.value);
  }

  if (filterItemName.value !== "all") {
    items = items.filter(i => i.name === filterItemName.value);
  }

  if (filterDate.value) {
    items = items.filter(i => i.date === filterDate.value);
  }

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
// 🔥 VIEW ITEM DETAILS
// ======================================================
window.viewItem = function (id) {
  alert("View popup coming in next update");
};

// ======================================================
// 🔥 EDIT ITEM
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

// Load initial data
loadCategories();
loadInventory();
