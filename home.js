import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  increment,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM Elements
const postHopBtn = document.getElementById("postHopBtn");
const hopContent = document.getElementById("hopContent");
const charCount = document.getElementById("charCount");
const hopsContainer = document.getElementById("hopsContainer");
const forYouBtn = document.getElementById("forYouBtn");
const followingBtn = document.getElementById("followingBtn");

// Track Character Count
hopContent.addEventListener("input", () => {
  const remaining = 200 - hopContent.value.length;
  charCount.textContent = remaining;

  if (remaining <= 20) {
    charCount.classList.add("warning");
  } else {
    charCount.classList.remove("warning");
  }
});

// Post a Hop
postHopBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to post!");
    return;
  }

  const content = hopContent.value.trim();
  if (!content) {
    alert("Hop content cannot be empty!");
    return;
  }

  try {
    await addDoc(collection(db, "hops"), {
      userId: user.uid,
      username: user.displayName || "Anonymous",
      content,
      timestamp: Date.now(),
      carrots: 0, // Initialize carrots
    });
    hopContent.value = ""; // Clear the textarea
    charCount.textContent = 200; // Reset character count
  } catch (error) {
    console.error("Error posting hop:", error.message);
  }
});

// Fetch User Profile Picture
const fetchProfilePicture = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data().profilePicture || "default-profile.png";
    }
  } catch (error) {
    console.error("Error fetching profile picture:", error.message);
  }
  return "default-profile.png"; // Fallback to default image
};

// Handle carrot clicks
const handleCarrotClick = async (hopId, carrotCountSpan) => {
  try {
    const hopRef = doc(db, "hops", hopId);
    await updateDoc(hopRef, {
      carrots: increment(1), // Increment the carrot count by 1
    });

    // Optimistically update the UI
    const currentCount = parseInt(carrotCountSpan.textContent);
    carrotCountSpan.textContent = currentCount + 1;
  } catch (error) {
    console.error("Error liking hop:", error.message);
  }
};

// Handle hop deletion
const handleDeleteClick = async (hopId) => {
  if (confirm("Are you sure you want to delete this hop?")) {
    try {
      await deleteDoc(doc(db, "hops", hopId));
      alert("Hop deleted successfully!");
    } catch (error) {
      console.error("Error deleting hop:", error.message);
      alert("Failed to delete hop. Please try again.");
    }
  }
};

const renderHop = async (hop) => {
    const profilePicture = await fetchProfilePicture(hop.userId);
  
    const hopElement = document.createElement("div");
    hopElement.classList.add("hop");
    hopElement.innerHTML = `
      <div style="display: flex; align-items: center;">
        <a href="user.html?user=${hop.username}" class="profile-link">
          <img src="${profilePicture}" alt="Profile Picture" class="profile-picture">
        </a>
        <div>
          <div class="hop-user">
            <a href="user.html?user=${hop.username}" class="profile-link">@${hop.username}</a>
          </div>
          <div class="hop-content">${hop.content}</div>
          <div class="hop-timestamp">${new Date(hop.timestamp).toLocaleString()}</div>
        </div>
      </div>
      <div class="hop-actions">
        <button class="carrot-btn" data-id="${hop.id}">
          🥕 <span class="carrot-count">${hop.carrots || 0}</span>
        </button>
        <button class="delete-btn hidden" data-id="${hop.id}">🗑️ Delete</button>
      </div>
    `;
  
    // Add carrot click functionality
    const carrotButton = hopElement.querySelector(".carrot-btn");
    const carrotCountSpan = hopElement.querySelector(".carrot-count");
    carrotButton.addEventListener("click", () => handleCarrotClick(hop.id, carrotCountSpan));
  
    // Show delete button if the hop belongs to the logged-in user
    const deleteButton = hopElement.querySelector(".delete-btn");
    const user = auth.currentUser;
    if (user && user.uid === hop.userId) {
      deleteButton.classList.remove("hidden");
      deleteButton.addEventListener("click", () => handleDeleteClick(hop.id));
    }
  
    return hopElement;
  };
  
  

// Load Hops
const loadHops = (feedType) => {
  let q;
  if (feedType === "forYou") {
    q = query(collection(db, "hops"), orderBy("timestamp", "desc")); // All hops
  } else if (feedType === "following") {
    // Placeholder for following logic
    q = query(collection(db, "hops"), orderBy("timestamp", "desc"));
  }

  onSnapshot(q, async (snapshot) => {
    hopsContainer.innerHTML = ""; // Clear the feed
    for (const doc of snapshot.docs) {
      const hopData = {
        id: doc.id,
        ...doc.data(),
      };
      const hopElement = await renderHop(hopData);
      hopsContainer.appendChild(hopElement);
    }
  });
};

// Navigation: Toggle Between Feeds
forYouBtn.addEventListener("click", () => {
  loadHops("forYou");
  forYouBtn.classList.add("active");
  followingBtn.classList.remove("active");
});

followingBtn.addEventListener("click", () => {
  loadHops("following");
  forYouBtn.classList.remove("active");
  followingBtn.classList.add("active");
});

// Default to "For You" Feed
loadHops("forYou");
