import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";

// Firebase Config (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyCZBfQDh8rz-jggpz7Ps2dcQKV9eMOmAVY",
  authDomain: "chungus-social.firebaseapp.com",
  projectId: "chungus-social",
  storageBucket: "chungus-social.appspot.com",
  messagingSenderId: "201577278582",
  appId: "1:201577278582:web:98013ebd9155c27efc0357",
  measurementId: "G-WH219S96E3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Check Auth State
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Redirect to home page
    window.location.href = "/home";
  } else {
    // Redirect to login page
    window.location.href = "/login";
  }
});
