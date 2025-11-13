*// 🔥 Firebase Setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

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
const auth = getAuth(app);

// ---------------------------------------------------------------------------
// 🔐 AUTO REDIRECT BASED ON ROLE (every page uses this except login.html)
// ---------------------------------------------------------------------------

onAuthStateChanged(auth, () => {
  const currentPage = window.location.pathname.split("/").pop();
  const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));

  // if not logged in → send to login
  if (!loggedUser) {
    if (currentPage !== "login.html") {
      window.location.href = "login.html";
    }
    return;
  }

  const role = loggedUser.role;

  // OWNER PAGES SECURITY
  const ownerPages = [
    "dashboard.html",
    "attendance.html",
    "expenses.html",
    "jobs.html",
    "job-detail.html"
  ];

  // STAFF PAGES SECURITY
  const staffPages = [
    "staff-jobs.html",
    "staff-job-detail.html"
  ];

  // If staff tries to access owner pages → send to staff-jobs
  if (role === "staff" && ownerPages.includes(currentPage)) {
    window.location.href = "staff-jobs.html";
    return;
  }

  // If owner tries to access staff pages → send back to dashboard
  if (role === "owner" && staffPages.includes(currentPage)) {
    window.location.href = "dashboard.html";
    return;
  }
});

// ---------------------------------------------------------------------------
// 🚪 LOGOUT FUNCTION (works for owner + staff pages)
// ---------------------------------------------------------------------------

window.logoutUser = async function () {
  await signOut(auth);
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
};
