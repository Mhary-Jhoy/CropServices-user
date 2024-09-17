import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  browserSessionPersistence,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD1pFPja6Jc47JXJAJLYr0M3PIDLaH-TfQ",
  authDomain: "cropservices-a2575.firebaseapp.com",
  projectId: "cropservices-a2575",
  storageBucket: "cropservices-a2575.appspot.com",
  messagingSenderId: "968472156055",
  appId: "1:968472156055:web:9003f7eaddaa2502e416d2",
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const database = getDatabase();

setPersistence(auth, browserSessionPersistence).then(() => {
  const btnSignUp = document.querySelector(".btn-create-account");
  btnSignUp.addEventListener("click", register);

  function register() {
    const email = document.getElementById("sign-up-inp-email").value;
    const name = document.getElementById("sign-up-inp-name").value;
    const contact = document.getElementById("sign-up-inp-phone").value;
    const address = document.getElementById("sign-up-inp-address").value;
    const password = document.getElementById("sign-up-inp-password").value;
    const cpWord = document.getElementById("sign-up-inp-cpassword").value;

    if (password !== cpWord) {
      alert("Password and confirm password do not match.");
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        sendEmailVerification(auth.currentUser)
          .then(() => {
            alert("Verification email sent. Please check your inbox.");
          })
          .catch((error) => {
            console.error("Error sending verification email:", error);
          });

        auth
          .signOut()
          .then(() => {})
          .catch((error) => {
            console.error("Error signing out:", error);
          });

        const user = userCredential.user;
        const userData = {
          email: email,
          name: name,
          contact: contact,
          address: address,
          isSignup: true,
          profileImg: "none",
        };

        set(ref(database, "users/" + user.uid), userData)
          .then(() => {
            alert("Registration successful!");
            window.location.href = "./../index.html";
          })
          .catch((error) => {
            alert("Error registering user: " + error.message);
          });
      })
      .catch((error) => {
        const errorMessage = error.message;
        alert(errorMessage);
      });
  }
});
