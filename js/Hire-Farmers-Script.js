import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  set,
  child,
  push,
  remove,
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

auth.onAuthStateChanged(async (user) => {
  if (user) {
    const userID = user.uid;

    const userRef = ref(database, "users/" + user.uid);
    const userSnapshot = await get(userRef);
    const userData = userSnapshot.val();

    const postLocation = document.getElementById("post-inp-location");
    const postSalary = document.getElementById("post-inp-salary");
    const postPeopleNum = document.getElementById("post-inp-people-num");
    const postLookingFor = document.getElementById("post-inp-looking-for");

    const applyName = document.getElementById("apply-inp-name");
    const applyNumber = document.getElementById("apply-inp-number");
    const applyAddress = document.getElementById("apply-inp-address");
    const applySkills = document.getElementById("apply-inp-skills");
    const applyExperience = document.getElementById("apply-inp-experience");

    // HTML NAV END ================================================================================================================================
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

    const handleApply = () => {
      document.body.classList.toggle("active");
      document.querySelector(".apply-overlay").classList.toggle("active");
      document.querySelector(".apply-container").classList.toggle("active");
      scrollToTop();

      applyName.value = "";
      applyNumber.value = "";
      applyAddress.value = "";
      applySkills.value = "";
      applyExperience.value = "";
    };

    const handlePostNav = () => {
      document.body.classList.toggle("active");
      document.querySelector(".post-overlay").classList.toggle("active");
      document.querySelector(".post-container").classList.toggle("active");
      scrollToTop();

      postLocation.value = "";
      postSalary.value = "";
      postPeopleNum.value = "";
      postLookingFor.value = "";
    };
    // HTML NAV END ================================================================================================================================

    // POST
    const btnPost = document.querySelector(".btn-post");

    btnPost.addEventListener("click", handlePost);

    async function handlePost() {
      if (
        postLocation.value ||
        postSalary.value ||
        postPeopleNum.value ||
        postLookingFor.value
      ) {
        const userPostsRef = ref(database, `farmers/${userID}`);
        const snapshot = await get(userPostsRef);

        if (snapshot.exists()) {
          const userChoice = confirm(
            "You have already made a post. Do you want to remove the current post and create a new one?"
          );
          if (userChoice) {
            await remove(userPostsRef);
          } else {
            return;
          }
        }

        const newPostRef = push(userPostsRef);
        const postID = newPostRef.key;

        const postData = {
          postLocation: postLocation.value,
          postSalary: postSalary.value,
          postPeopleNum: postPeopleNum.value,
          postLookingFor: postLookingFor.value,
          accepted: 0,
          pending: 0,
          userID: userID,
          type: "post",
          approved: false,
          ownerName: userData.name,
        };

        set(ref(database, `pending/${user.uid}`), postData)
          .then(() => {
            alert(
              "Your post has been submitted, Please wait for the approval."
            );
            handlePostNav();
            displayCards();
          })
          .catch((error) => {
            console.error("Error submitting post:", error);
            alert("Error submitting post: " + error.message);
          });
      } else {
        alert("Please fill up all the fields.");
      }
    }
    // POST END

    // CARDS CONTAINER

    async function fetchFarmersData() {
      const farmersRef = ref(database, "farmers");
      const snapshot = await get(farmersRef);
      return snapshot.val();
    }

    // DISPLAY CARDS ==============================================================================================================================
    displayCards();

    async function displayCards() {
      const cardsContainer = document.querySelector(".cards-container");
      cardsContainer.innerHTML = "";

      const snapshot = await get(ref(database, "farmers"));
      const farmersData = snapshot.val();

      for (const farmerId in farmersData) {
        const post = farmersData[farmerId];
        // const post = userPosts[postId];
        // for (const postId in userPosts) {

        if (post.approved === true) {
          const cards = document.createElement("div");
          cards.classList.add("cards");

          const cardsInnerContainer = document.createElement("div");
          cardsInnerContainer.classList.add("cards-inner-container");

          const cardHeader = document.createElement("div");
          cardHeader.classList.add("card-header");

          const imgPin = document.createElement("img");
          imgPin.src = "./../media/icons/icons8-location-pin-100.png";
          imgPin.alt = "pin";

          const cardLocation = document.createElement("h1");
          cardLocation.textContent = post.postLocation;

          cardHeader.appendChild(imgPin);
          cardHeader.appendChild(cardLocation);

          const cardsContent = document.createElement("div");
          cardsContent.classList.add("cards-content");

          const labelHiring = document.createElement("h3");
          labelHiring.textContent = "WE'RE HIRING";

          const lookingFor = document.createElement("h3");
          lookingFor.textContent = `${post.postLookingFor}`;

          cardsContent.appendChild(labelHiring);
          cardsContent.appendChild(lookingFor);

          const cardsLower = document.createElement("div");
          cardsLower.classList.add("cards-lower");

          const personNum = document.createElement("h1");
          personNum.classList.add("person-num");
          personNum.textContent = `${post.accepted}/${post.postPeopleNum}`;

          const salary = document.createElement("h1");
          salary.classList.add("salary");
          salary.textContent = `PHP ${post.postSalary} per day`;

          cardsLower.appendChild(personNum);
          cardsLower.appendChild(salary);

          const cardsBtnApply = document.createElement("button");
          cardsBtnApply.classList.add("btn-apply");
          cardsBtnApply.textContent = "APPLY";

          cardsInnerContainer.appendChild(cardHeader);
          cardsInnerContainer.appendChild(cardsContent);
          cardsInnerContainer.appendChild(cardsLower);

          cards.appendChild(cardsInnerContainer);
          cards.appendChild(cardsBtnApply);

          cardsContainer.appendChild(cards);

          // if (post.accepted == post.postPeopleNum || userHasApplied(userID)) {
          //   cardsBtnApply.style.pointerEvents = "none";
          // }

          async function userHasApplied(userID) {
            const farmersRef = ref(database, "farmers");
            const snapshot = await get(farmersRef);

            if (!snapshot.exists()) {
              return true;
            }

            const farmersData = snapshot.val();
            for (const postID in farmersData) {
              const post = farmersData[postID];
              if (
                post.applications &&
                post.applications[userID] &&
                post.applications[userID].status === "Pending"
              ) {
                return false;
              }
            }
            return true;
          }

          cardsBtnApply.addEventListener("click", () => {
            handleApply();
            document
              .querySelector(".btn-apply-submit")
              .addEventListener("click", () => {
                if (
                  applyName.value ||
                  applyNumber.value ||
                  applyAddress.value ||
                  applySkills.value ||
                  applyExperience.value
                ) {
                  const applyRef = ref(database, "farmers");
                  const newApplyRef = push(child(applyRef, farmerId));
                  const applyID = newApplyRef.key;

                  const applyData = {
                    userID: userID,
                    applyName: applyName.value,
                    applyNumber: applyNumber.value,
                    applyAddress: applyAddress.value,
                    applySkills: applySkills.value,
                    applyExperience: applyExperience.value,
                    status: "Pending",
                  };

                  set(
                    child(applyRef, `${farmerId}/applications/${userID}`),
                    applyData
                  ).then(() => {
                    alert("Your application has been submitted");
                    handleApply();
                  });
                }
              });
          });
        }
      }
    }
    // DISPLAY CARDS END ==============================================================================================================================

    // HTML BTN NAV ===================================================================================================================================
    const btnApply = document.querySelector(".btn-apply");
    const btnApplyClose = document.querySelector(".btn-apply-close");
    const btnPostNav = document.querySelector(".btn-post-nav");
    const btnPostClose = document.querySelector(".btn-post-close");

    btnApplyClose.addEventListener("click", () => handleApply());
    btnPostNav.addEventListener("click", () => handlePostNav());
    btnPostClose.addEventListener("click", () => handlePostNav());
    // HTML BTN NAV END ===================================================================================================================================
  } else {
    window.location.href = "./../index.html";
    // alert("Please login first to proceed here.").then(() => {
    // });
  }
});
