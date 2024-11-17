import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";

// Firebase Config
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
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const profilePicture = document.getElementById("profilePicture");
const changePictureBtn = document.getElementById("changePictureBtn");
const followBtn = document.getElementById("followBtn");
const unfollowBtn = document.getElementById("unfollowBtn");

// Extract the username from the URL query parameter
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get("user");

let loggedInUserId;
let profileUserId;

// Fetch User Data
const fetchUserData = async (username) => {
  const usersQuery = query(
    collection(db, "users"),
    where("username", "==", username)
  );
  const userSnapshot = await getDocs(usersQuery);

  if (!userSnapshot.empty) {
    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    profileUserId = userDoc.id;

    // Update profile picture
    profilePicture.src = userData.profilePicture || "default-profile.png";

    return userDoc.id;
  }
};

// Check if the user is viewing their own profile
onAuthStateChanged(auth, async (user) => {
  if (user) {
    loggedInUserId = user.uid;

    const userId = await fetchUserData(username);
    if (userId === loggedInUserId) {
      // Show "Change Profile Picture" button
      changePictureBtn.classList.remove("hidden");

      changePictureBtn.addEventListener("click", async () => {
        const file = await selectFile(); // File picker logic
        if (file) {
          const downloadURL = await uploadProfilePicture(file, loggedInUserId); // Upload logic
          await updateProfilePicture(downloadURL);
        }
      });
    } else {
      // Show "Follow" or "Unfollow" button based on the following status
      const userDoc = doc(db, "users", loggedInUserId);
      const userData = (await getDocs(userDoc)).data();

      if (userData.following.includes(profileUserId)) {
        unfollowBtn.classList.remove("hidden");
      } else {
        followBtn.classList.remove("hidden");
      }

      followBtn.addEventListener("click", async () => {
        await updateDoc(userDoc, {
          following: arrayUnion(profileUserId),
        });
        followBtn.classList.add("hidden");
        unfollowBtn.classList.remove("hidden");
      });

      unfollowBtn.addEventListener("click", async () => {
        await updateDoc(userDoc, {
          following: arrayRemove(profileUserId),
        });
        unfollowBtn.classList.add("hidden");
        followBtn.classList.remove("hidden");
      });
    }
  }
});

// File picker logic
const selectFile = () => {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => resolve(input.files[0]);
    input.click();
  });
};

// Upload profile picture logic
const uploadProfilePicture = async (file, userId) => {
  const storageRef = firebase.storage().ref();
  const fileRef = storageRef.child(`profilePictures/${userId}`);
  await fileRef.put(file);
  return fileRef.getDownloadURL();
};

// Update Firestore with the new profile picture URL
const updateProfilePicture = async (downloadURL) => {
  const userRef = doc(db, "users", loggedInUserId);
  await updateDoc(userRef, {
    profilePicture: downloadURL,
  });
  profilePicture.src = downloadURL;
};
