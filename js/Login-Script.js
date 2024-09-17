import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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

auth.onAuthStateChanged((user) => {
  if (user) {
    window.location.href = "./html/Inquire.html";
  }
});

setPersistence(auth, browserSessionPersistence).then(() => {
  const btnLogin = document.querySelector(".btn-login");
  btnLogin.addEventListener("click", login);

  function login() {
    const email = document.getElementById("login-inp-email").value;
    const password = document.getElementById("login-inp-password").value;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        if (user.emailVerified) {
          sessionStorage.setItem("isLoggedIn", true);
          window.location.href = "./html/Inquire.html";
        } else {
          alert("Please verify your email before logging in.");
        }
      })
      .catch((error) => {
        const errorMessage = error.message;
        alert(errorMessage);
      });
  }
});
