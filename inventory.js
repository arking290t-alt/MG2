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

  try {
    const snap = await getDocs(collection(db, "inventoryCategories"));
    snap.forEach(docu => {
      const cat = docu.data().name;

      categorySelect.innerHTML += `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`;
      filterCategory.innerHTML += `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`;

      categoryList.innerHTML += `
        <div class="cat-item">
          <span>${escapeHtml(cat)}</span>
          <button class="delete-btn" onclick="deleteCategory('${docu.id}')">Delete</button>
        </div>
      `;
    });
  } catch (err) {
    console.error("loadCategories err:", err);
  }
}

window.deleteCategory = async function (id) {
  if (!confirm("Delete this category?")) return;
  await deleteDoc(doc(db, "inventoryCategories", id));
  loadCategories();
};

// ======================================================
// 🔥 ADD CATEGORY
// ======================================================
addCategoryBtn.onclick = async () => {
  const name = (newCategoryName.value || "").trim();
  if (!name) return alert("Enter category name");
  await addDoc(collection(db, "inventoryCategories"), { name });
  newCategoryName.value = "";
  loadCategories();
};

// ======================================================
// 🔥 ADD ITEM TO INVENTORY
// ======================================================
addItemBtn.onclick = async () => {
  const data = {
    name: (itemName.value || "").trim(),
    qty: Number(quantity.value) || 0,
    unit: unit.value || "PCS",
    price: Number(price.value) || 0,
    invoice: (invoice.value || "").trim(),
    reel: (reel.value || "").trim(),
    supplier: (supplier.value || "").trim(),
    gsm: gsm.value || "",
    bf: bf.value || "",
    date: dateInput.value || new Date().toISOString().slice(0,10),
    category: categorySelect.value || ""
  };

  if (!data.name) return alert("Enter item name");

  try {
    await addDoc(collection(db, "inventory"), data);
    // clear form
    itemName.value = ""; quantity.value = ""; price.value = "";
    invoice.value = ""; reel.value = ""; supplier.value = "";
    gsm.value = ""; bf.value = ""; dateInput.value = "";
    loadInventory();
  } catch (err) {
    console.error("addItem err:", err);
    alert("Failed to add item. Check console.");
  }
};

// ======================================================
// 🔥 LOAD INVENTORY LIST WITH FILTERS
// ======================================================
async function loadInventory() {
  inventoryList.innerHTML = "";
  filterItemName.innerHTML = `<option value="all">All Items</option>`;

  try {
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

    // Build item name filter (unique names from DB regardless of active filters)
    const allNames = [...new Set(items.map(i => i.name))];
    allNames.forEach(n => {
      filterItemName.innerHTML += `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`;
    });

    if (items.length === 0) {
      inventoryList.innerHTML = `<p style="text-align:center; opacity:0.7;">No items found.</p>`;
      return;
    }

    // Render items
    items.forEach(item => {
      inventoryList.innerHTML += `
        <div class="inventory-item" id="inv-${item.id}">
          <h3>${escapeHtml(item.name)}</h3>
          <p>Qty: ${escapeHtml(String(item.qty))} ${escapeHtml(item.unit || "")}</p>
          <p>Date: ${escapeHtml(item.date || "")}</p>
          <p>Category: ${escapeHtml(item.category || "")}</p>

          <div class="actions">
            <button class="btn btn-view" onclick="viewItem('${item.id}')">View</button>
            <button class="btn btn-edit" onclick="editItem('${item.id}')">Edit</button>
            <button class="btn btn-used" onclick="useItem('${item.id}')">Used</button>
            <button class="btn btn-delete" onclick="deleteItem('${item.id}')">Delete</button>
          </div>
        </div>
      `;
    });
  } catch (err) {
    console.error("loadInventory err:", err);
    inventoryList.innerHTML = `<p style="text-align:center; opacity:0.7;">Failed loading items.</p>`;
  }
}

// ======================================================
// 🔥 DELETE ITEM
// ======================================================
window.deleteItem = async function (id) {
  if (!confirm("Delete this inventory item?")) return;
  await deleteDoc(doc(db, "inventory", id));
  loadInventory();
};

// ======================================================
// 🔥 VIEW ITEM DETAILS POPUP
// ======================================================
window.viewItem = async function (id) {
  try {
    const snap = await getDoc(doc(db, "inventory", id));
    if (!snap.exists()) return alert("Item not found");
    const item = snap.data();

    const popup = document.createElement("div");
    popup.className = "popup-overlay";
    popup.innerHTML = `
      <div class="popup-box" role="dialog" aria-modal="true">
        <h2 style="color:#00b4ff;margin-bottom:12px;">Item Details</h2>

        <label>Name</label><input value="${escapeHtml(item.name || "")}" disabled>
        <label>Invoice Number</label><input value="${escapeHtml(item.invoice || "")}" disabled>
        <label>Reel Number</label><input value="${escapeHtml(item.reel || "")}" disabled>
        <label>Supplier</label><input value="${escapeHtml(item.supplier || "")}" disabled>
        <label>GSM</label><input value="${escapeHtml(item.gsm || "")}" disabled>
        <label>BF</label><input value="${escapeHtml(item.bf || "")}" disabled>
        <label>Qty</label><input value="${escapeHtml(String(item.qty || 0))} ${escapeHtml(item.unit || "")}" disabled>
        <label>Price</label><input value="${escapeHtml(String(item.price || ""))}" disabled>
        <label>Category</label><input value="${escapeHtml(item.category || "")}" disabled>
        <label>Date</label><input value="${escapeHtml(item.date || "")}" disabled>

        <div style="display:flex;gap:10px;margin-top:14px;">
          <button class="btn btn-close">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(popup);
    popup.querySelector(".btn-close").onclick = () => popup.remove();
  } catch (err) {
    console.error("viewItem err:", err);
  }
};

// ======================================================
// 🔥 USED ITEM POPUP + MOVE TO inventoryUsed
// ======================================================
window.useItem = async function (id) {
  try {
    const snap = await getDoc(doc(db, "inventory", id));
    if (!snap.exists()) return alert("Item not found");
    const item = snap.data();

    const popup = document.createElement("div");
    popup.className = "popup-overlay";
    popup.innerHTML = `
      <div class="popup-box" role="dialog" aria-modal="true">
        <h2 style="color:#00b4ff;margin-bottom:12px;">Use Item — ${escapeHtml(item.name || "")}</h2>

        <label>Used Quantity</label><input id="usedQty" type="number" placeholder="Enter quantity used">

        <label>Unit</label>
        <input value="${escapeHtml(item.unit || "")}" disabled>

        <label>Used For</label><input id="usedFor" type="text" placeholder="What is this used for?">

        <div style="display:flex;gap:10px;margin-top:14px;">
          <button class="btn" id="saveUsedBtn" style="background:#00b4ff;">Save</button>
          <button class="btn btn-close" style="background:#666;">Cancel</button>
        </div>
      </div>
    `;

    document.body.appendChild(popup);

    popup.querySelector(".btn-close").onclick = () => popup.remove();

    popup.querySelector("#saveUsedBtn").onclick = async () => {
      const usedQty = Number(popup.querySelector("#usedQty").value) || 0;
      const usedFor = (popup.querySelector("#usedFor").value || "").trim();

      // save used entry
      await addDoc(collection(db, "inventoryUsed"), {
        name: item.name,
        usedQty,
        usedFor,
        date: new Date().toLocaleString(),
        category: item.category || "",
        unit: item.unit || "",
        originalDate: item.date || "",
        originalPrice: item.price || 0,
        reel: item.reel || "",
        supplier: item.supplier || ""
      });

      // update inventory quantity (no blocking if usedQty > qty — proceed)
      const newQty = (Number(item.qty) || 0) - usedQty;
      if (newQty <= 0) {
        await deleteDoc(doc(db, "inventory", id));
      } else {
        await updateDoc(doc(db, "inventory", id), { qty: newQty });
      }

      popup.remove();
      loadInventory();
    };

  } catch (err) {
    console.error("useItem err:", err);
  }
};

// ======================================================
// 🔥 EDIT ITEM (simple alert placeholder — keep as-is)
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

// ======================================================
// UTIL: small escape to avoid injection into innerHTML
// ======================================================
function escapeHtml(s) {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// INITIAL LOAD
loadCategories();
loadInventory();
