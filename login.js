import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";

// Firebase Config (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyCZBfQDh8rz-jggpz7Ps2dcQKV9eMOmAVY",
  authDomain: "chungus-social.firebaseapp.com",
  projectId: "chungus-social",
  storageBucket: "chungus-social.appspot.com",
  messagingSenderId: "201577278582",
  appId: "1:201577278582:web:98013ebd9155c27efc0357",
  measurementId: "G-WH219S96E3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const toggleToSignup = document.getElementById("toggleToSignup");
const toggleToLogin = document.getElementById("toggleToLogin");
const errorMessage = document.getElementById("errorMessage");

// Toggle Between Login and Sign-Up Forms
toggleToSignup.addEventListener("click", () => {
  loginForm.classList.add("hidden");
  signupForm.classList.remove("hidden");
  toggleToSignup.classList.add("hidden");
  toggleToLogin.classList.remove("hidden");
});

toggleToLogin.addEventListener("click", () => {
  signupForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
  toggleToSignup.classList.remove("hidden");
  toggleToLogin.classList.add("hidden");
});

// Handle Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Logged in as:", userCredential.user.email);
    alert("Welcome back to Chungus Social!");
    window.location.href = "home.html"; // Redirect to Home Page
  } catch (error) {
    console.error("Login error:", error.message);
    errorMessage.textContent = "Error: " + error.message;
  }
});

// Handle Sign-Up
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("signupUsername").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Update the user's profile with their username
    await updateProfile(userCredential.user, { displayName: username });

    // Add the user to Firestore
    const userRef = doc(db, "users", userCredential.user.uid);
    await setDoc(userRef, {
      username,
      email,
      createdAt: Date.now()
    });

    console.log("Account created for:", username);
    alert("Account successfully created! You can now log in.");
    toggleToLogin.click(); // Switch to Login Form
  } catch (error) {
    console.error("Sign-up error:", error.message);
    errorMessage.textContent = "Error: " + error.message;
  }
});

// Handle Google Login
const googleProvider = new GoogleAuthProvider();

document.getElementById("googleLoginBtn").addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user exists in Firestore
    const userRef = doc(db, "users", user.uid);
    const userDoc = await setDoc(userRef, {
      username: user.displayName || "Anonymous",
      email: user.email,
      profilePicture: user.photoURL || "default-profile.png",
      createdAt: Date.now(),
    });

    console.log("Google login successful:", user.email);
    alert("Welcome to Chungus Social!");
    window.location.href = "home.html"; // Redirect to Home Page
  } catch (error) {
    console.error("Google login error:", error.message);
    errorMessage.textContent = "Error: " + error.message;
  }
});
