// ------------------------------
// MG Login System (FULL FILE)
// ------------------------------

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// ------------------------------------------
// 🔥 FIREBASE CONFIG
// ------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyC6BmLTjzOHwTa2VEYa9eYkClDtS__zvTM",
  authDomain: "mg-manager-3ab66.firebaseapp.com",
  projectId: "mg-manager-3ab66",
  storageBucket: "mg-manager-3ab66.appspot.com",
  messagingSenderId: "330667005987",
  appId: "1:330667005987:web:95de27b6259ace9fc6b996",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ------------------------------------------
// 🔑 LOGIN FORM HANDLER
// ------------------------------------------
const loginForm = document.getElementById("loginForm");
const errorText = document.getElementById("error");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    // 🟦 SIGN IN USER
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    // 🟩 FETCH ROLE FROM FIRESTORE
    const snap = await getDoc(doc(db, "users", uid));

    let role = "staff"; // default fallback for safety

    if (snap.exists() && snap.data().role) {
      role = snap.data().role;
    }

    // save role locally
    localStorage.setItem("loggedRole", role);
    localStorage.setItem("loggedUID", uid);
    localStorage.setItem("loggedEmail", email);

    // 🟨 REDIRECT BASED ON ROLE
    if (role === "owner") {
      window.location.href = "dashboard.html";
    } else {
      window.location.href = "staffDashboard.html";
    }

  } catch (err) {
    errorText.textContent = "Login failed: " + err.message;
  }
});
