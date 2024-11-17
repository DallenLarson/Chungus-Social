import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore

// DOM Elements
const profilePicture = document.getElementById("profilePicture");
const changePictureBtn = document.getElementById("changePictureBtn");
const followBtn = document.getElementById("followBtn");
const unfollowBtn = document.getElementById("unfollowBtn");
const followerCountElem = document.getElementById("followerCount");
const hopsContainer = document.getElementById("hopsContainer");

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

    // Update follower count
    followerCountElem.textContent = userData.followers || 0;

    // Display all hops
    await displayUserHops(profileUserId);

    return userDoc.id;
  } else {
    console.error("User not found");
    return null;
  }
};

// Display User Hops
const displayUserHops = async (userId) => {
  const hopsQuery = query(
    collection(db, "hops"),
    where("userId", "==", userId)
  );

  const hopsSnapshot = await getDocs(hopsQuery);
  hopsContainer.innerHTML = ""; // Clear the container

  hopsSnapshot.forEach((hopDoc) => {
    const hopData = hopDoc.data();

    // Create hop element
    const hopElem = document.createElement("div");
    hopElem.classList.add("hop");

    hopElem.innerHTML = `
      <div class="hop-user">@${username}</div>
      <div class="hop-content">${hopData.content}</div>
      <div class="hop-timestamp">${new Date(hopData.timestamp).toLocaleString()}</div>
    `;

    hopsContainer.appendChild(hopElem);
  });
};

// Check if the user is viewing their own profile
onAuthStateChanged(auth, async (user) => {
  try {
    if (user) {
      loggedInUserId = user.uid;

      const userId = await fetchUserData(username);
      if (userId === loggedInUserId) {
        // Show "Change Profile Picture" button
        changePictureBtn.classList.remove("hidden");

        changePictureBtn.addEventListener("click", async () => {
          const imageURL = prompt(
            "Enter the direct link to the image you'd like to use as your profile picture:"
          );
          if (imageURL) {
            await updateProfilePicture(imageURL);
          }
        });
      } else if (userId) {
        // Show "Follow" or "Unfollow" button based on the following status
        const userRef = doc(db, "users", loggedInUserId);
        const profileUserRef = doc(db, "users", profileUserId);

        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        if (userData?.following?.includes(profileUserId)) {
          unfollowBtn.classList.remove("hidden");
        } else {
          followBtn.classList.remove("hidden");
        }

        followBtn.addEventListener("click", async () => {
          await updateDoc(userRef, {
            following: arrayUnion(profileUserId),
          });
          await updateDoc(profileUserRef, {
            followers: increment(1),
          });

          followBtn.classList.add("hidden");
          unfollowBtn.classList.remove("hidden");

          // Update follower count in UI
          const profileUserDoc = await getDoc(profileUserRef);
          followerCountElem.textContent = profileUserDoc.data().followers || 0;
        });

        unfollowBtn.addEventListener("click", async () => {
          await updateDoc(userRef, {
            following: arrayRemove(profileUserId),
          });
          await updateDoc(profileUserRef, {
            followers: increment(-1),
          });

          unfollowBtn.classList.add("hidden");
          followBtn.classList.remove("hidden");

          // Update follower count in UI
          const profileUserDoc = await getDoc(profileUserRef);
          followerCountElem.textContent = profileUserDoc.data().followers || 0;
        });
      }
    }
  } catch (error) {
    console.error("Error in onAuthStateChanged:", error.message);
  }
});

// Update Firestore with the new profile picture URL
const updateProfilePicture = async (imageURL) => {
  const userRef = doc(db, "users", loggedInUserId);
  await updateDoc(userRef, {
    profilePicture: imageURL,
  });
  profilePicture.src = imageURL;
};
