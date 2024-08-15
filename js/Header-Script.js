import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  updateEmail,
  updatePassword,
  sendEmailVerification,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get,
  push,
  child,
  remove,
  update,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import {
  getStorage,
  ref as storageRef,
  getDownloadURL,
  uploadBytes,
  deleteObject,
  listAll,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

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
const database = getDatabase(firebaseApp);
const storage = getStorage(firebaseApp);

auth.onAuthStateChanged((user) => {
  if (user) {
    const userID = user.uid;

    const userRef = ref(database, "users/" + userID);
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        let userData = snapshot.val();

        const headerContainer = document.getElementById("header-container");

        loadHeader();

        function loadHeader() {
          fetch("./../html/Header-Content.html")
            .then((response) => response.text())
            .then((data) => {
              headerContainer.innerHTML = data;
              document.dispatchEvent(new Event("headerLoaded"));
            })
            .catch((error) => {
              console.log("Error:", error);
            });
        }

        document.addEventListener("headerLoaded", () => {
          const btnMenu = document.querySelector(".btn-menu");
          const dropdownContent = document.querySelector(
            ".menu-dropdown-content"
          );
          const menuOverlay = document.querySelector(".menu-overlay");
          // PROFILE ====================================================================================================================================================
          const profileContainer = document.querySelector(".profile-container");

          const imgInput = profileContainer.querySelector("input[type='file']");
          const profileImg = profileContainer.querySelector(".profile-img");
          const name = profileContainer.querySelector(".name");
          const contact = profileContainer.querySelector(".contact");
          const address = profileContainer.querySelector(".address");
          const email = profileContainer.querySelector(".email");
          const password = profileContainer.querySelector(".password");
          const userName = document.querySelector(".user-name");

          const btnChangeProfile = profileContainer.querySelector(
            ".btn-change-profile"
          );
          const editName = profileContainer.querySelector(".edit-name");
          const editContact = profileContainer.querySelector(".edit-contact");
          const editAddress = profileContainer.querySelector(".edit-address");
          const editEmail = profileContainer.querySelector(".edit-email");
          const editPassword = profileContainer.querySelector(".edit-password");

          profileContainer
            .querySelector(".btn-close-profile")
            .addEventListener("click", () => {
              profileContainer.style.display = "none";
            });
          document
            .querySelector(".btn-profile")
            .addEventListener("click", () => {
              profileContainer.style.display = "block";
            });

          btnChangeProfile.addEventListener("click", () => {
            imgInput.click();
          });

          displayUser();

          function displayUser() {
            get(userRef).then((snapshot) => {
              userData = snapshot.val();

              userName.textContent = `${userData.name}`;
              name.textContent = `${userData.name}`;
              contact.textContent = `${userData.contact}`;
              address.textContent = `${userData.address}`;
              email.textContent = `${userData.email}`;

              if (userData.profileImg != "none") {
                profileImg.src = `${userData.profileImg}`;
              }
            });
          }

          imgInput.addEventListener("change", async (e) => {
            const img = e.target.files[0];

            if (userData.profileImg != "none") {
              const profileRef = storageRef(storage, `profileImg/${userID}`);

              listAll(profileRef).then((res) => {
                const deletePromises = res.items.map((itemRef) =>
                  deleteObject(itemRef)
                );
                return Promise.all(deletePromises);
              });
            }

            const imgStorageRef = storageRef(
              storage,
              `profileImg/${userID}/${img.name}`
            );
            const snapshot = await uploadBytes(imgStorageRef, img);

            await update(ref(database, `users/${userID}`), {
              profileImg: await getDownloadURL(imgStorageRef),
            });

            displayUser();
          });

          editName.addEventListener("click", async () => {
            if (name.contentEditable === "true") {
              name.contentEditable = "false";
              editName.src = "./../media/icons/icons8-edit-black.png";

              await update(ref(database, `users/${userID}`), {
                name: name.textContent.trim(),
              });

              displayUser();
            } else {
              name.contentEditable = "true";
              editName.src = "./../media/icons/icons8-check-black.png";
            }
          });

          editContact.addEventListener("click", async () => {
            if (contact.contentEditable === "true") {
              contact.contentEditable = "false";
              editContact.src = "./../media/icons/icons8-edit-black.png";

              await update(ref(database, `users/${userID}`), {
                contact: contact.textContent.trim(),
              });

              displayUser();
            } else {
              contact.contentEditable = "true";
              editContact.src = "./../media/icons/icons8-check-black.png";
            }
          });

          editPassword.addEventListener("click", async () => {
            if (password.contentEditable === "true") {
              password.contentEditable = "false";
              editPassword.src = "./../media/icons/icons8-edit-black.png";

              const newPassword = password.textContent.trim();

              try {
                const userRef = ref(database, "users/" + user.uid);
                const snapshot = await get(userRef);
                if (snapshot.exists()) {
                  const userData = snapshot.val();
                  const credential = EmailAuthProvider.credential(
                    userData.email,
                    prompt("Please enter your current password")
                  );

                  await reauthenticateWithCredential(user, credential);
                  await updatePassword(user, newPassword);
                  alert("Password has been changed.");
                  password.textContent = "";
                } else {
                  password.textContent = "";
                  throw new Error("User data not found.");
                }
              } catch (error) {
                console.error("Error updating password:", error);
                alert("Error updating password: " + error.message);
                password.textContent = "";
              }
            } else {
              password.contentEditable = "true";
              editPassword.src = "./../media/icons/icons8-check-black.png";
            }
          });

          editAddress.addEventListener("click", async () => {
            if (address.contentEditable === "true") {
              address.contentEditable = "false";
              editAddress.src = "./../media/icons/icons8-edit-black.png";

              await update(ref(database, `users/${userID}`), {
                address: address.textContent.trim(),
              });

              displayUser();
            } else {
              address.contentEditable = "true";
              editAddress.src = "./../media/icons/icons8-check-black.png";
            }
          });

          editEmail.addEventListener("click", async () => {
            if (email.contentEditable === "true") {
              email.contentEditable = "false";
              editEmail.src = "./../media/icons/icons8-edit-black.png";
              await updateEmailHandle();
            } else {
              email.contentEditable = "true";
              editEmail.src = "./../media/icons/icons8-check-black.png";
            }
          });

          async function updateEmailHandle() {
            const user = auth.currentUser;
            const newEmail = email.textContent.trim();

            console.log("current Email", userData.email);

            if (newEmail) {
              try {
                await updateEmail(user, newEmail);
                await sendEmailVerification(user);

                console.log(
                  "Verification email sent to the new email address. Please verify and then log in again."
                );
                alert(
                  "Verification email sent to the new email address. Please verify and then log in again."
                );

                const emailUpdate = {};
                emailUpdate["users/" + user.uid + "/email"] = newEmail;

                await update(ref(database), emailUpdate);
                console.log("Email in database updated successfully");
                logout();
              } catch (error) {
                console.error("Error during email update process:", error);
                alert("Error during email update process: " + error.message);
              }
            } else {
              alert("Please enter a new email.");
            }
          }
          // PROFILE END ====================================================================================================================================================

          // INBOX  ====================================================================================================================================================
          const inboxContainer = document.querySelector(".inbox-container");
          const posterContainer =
            inboxContainer.querySelector(".poster-container");
          const applicantContainer = inboxContainer.querySelector(
            ".applicant-container"
          );
          const applicantContent =
            inboxContainer.querySelector(".applicant-content");
          const posterApplicant = inboxContainer.querySelector(
            ".poster-applicant-container"
          );
          inboxContainer
            .querySelector(".btn-poster-applicant-close")
            .addEventListener("click", () => {
              posterApplicant.style.display = "none";
            });
          inboxContainer
            .querySelector(".btn-close-inbox")
            .addEventListener("click", () => {
              inboxContainer.style.display = "none";
            });

          document.querySelector(".btn-inbox").addEventListener("click", () => {
            inboxContainer.style.display = "block";
            userHasApplied(userID);
          });

          async function userHasApplied(userID) {
            const farmersRef = ref(database, "farmers");
            const snapshot = await get(farmersRef);

            if (!snapshot.exists()) {
              return false;
            }

            let postIDArr = [];

            const farmersData = snapshot.val();
            for (const postID in farmersData) {
              const post = farmersData[postID];
              if (post.applications && post.applications[userID]) {
                postIDArr.push(postID);
              }
            }
            if (postIDArr) {
              return displayApplicant(postIDArr);
            } else {
              return displayPosterApplicant();
            }
          }

          async function displayApplicant(postID) {
            posterContainer.style.display = "none";
            applicantContainer.style.display = "block";
            applicantContainer.innerHTML = "";

            postID.forEach(async (ID) => {
              const applicantRef = ref(
                database,
                `farmers/${ID}/applications/${user.uid}`
              );
              const snapshot = await get(applicantRef);

              if (snapshot.exists()) {
                const data = snapshot.val();

                const h1 = document.createElement("h1");

                if (data.status === "Pending") {
                  h1.textContent = `Your application is still ${data.status}`;
                } else {
                  h1.textContent = `Your application has been ${data.status}`;
                }

                applicantContainer.appendChild(h1);
              }
            });

            const userPostsRef = ref(database, `farmers/${userID}`);
            const snapshot = await get(userPostsRef);

            if (snapshot.exists()) {
              displayPosterApplicant();
            }
          }

          async function displayPosterApplicant() {
            // applicantContainer.style.display = "none";
            posterContainer.style.display = "block";
            applicantContent.innerHTML = "";

            const applicantRef = ref(
              database,
              `farmers/${user.uid}/applications`
            );
            const snapshot = await get(applicantRef);

            if (snapshot.exists()) {
              const applicantData = snapshot.val();

              for (const AID in applicantData) {
                const data = applicantData[AID];

                const btnApplicant = document.createElement("button");
                btnApplicant.classList.add("btn-new-applicant");
                btnApplicant.textContent = `${data.status} applicant: ${data.applyName}`;

                applicantContent.appendChild(btnApplicant);

                btnApplicant.addEventListener("click", () => {
                  posterApplicant.style.display = "block";

                  inboxContainer.querySelector(
                    ".applicant-name"
                  ).textContent = `${data.applyName}`;
                  inboxContainer.querySelector(
                    ".applicant-number"
                  ).textContent = `${data.applyNumber}`;
                  inboxContainer.querySelector(
                    ".applicant-address"
                  ).textContent = `${data.applyAddress}`;
                  inboxContainer.querySelector(
                    ".applicant-skills"
                  ).textContent = `${data.applySkills}`;
                  inboxContainer.querySelector(
                    ".applicant-experience"
                  ).textContent = `${data.applyExperience}`;

                  // if (data.status != "Pending") {
                  //   document.querySelector(
                  //     ".post-applicant-actions"
                  //   ).style.display = "none";
                  // }

                  inboxContainer
                    .querySelector(".btn-applicant-decline")
                    .addEventListener("click", async () => {
                      try {
                        const applicationRef = ref(
                          database,
                          `farmers/${user.uid}/applications/${userID}`
                        );

                        const applicationSnapshot = await get(applicationRef);
                        if (applicationSnapshot.exists()) {
                          const applicationData = applicationSnapshot.val();
                          const status = applicationData.status;

                          if (status !== "Declined") {
                            await update(applicationRef, {
                              status: "Declined",
                            });

                            const postRef = ref(
                              database,
                              `farmers/${user.uid}`
                            );
                            const postSnapshot = await get(postRef);
                            if (postSnapshot.exists()) {
                              const postData = postSnapshot.val();
                              const acceptedCount = postData.accepted || 0;
                              await update(postRef, {
                                accepted: acceptedCount - 1,
                              });
                            }
                          }

                          posterApplicant.style.display = "none";
                          displayPosterApplicant();
                        } else {
                          alert("Application does not exist.");
                        }
                      } catch (error) {
                        console.error("Error accepting applicant:", error);
                        alert("Error accepting applicant: " + error.message);
                      }
                    });

                  inboxContainer
                    .querySelector(".btn-applicant-accept")
                    .addEventListener("click", async () => {
                      try {
                        const applicationRef = ref(
                          database,
                          `farmers/${user.uid}/applications/${userID}`
                        );

                        const applicationSnapshot = await get(applicationRef);
                        if (applicationSnapshot.exists()) {
                          const applicationData = applicationSnapshot.val();
                          const status = applicationData.status;

                          if (status !== "Accepted") {
                            await update(applicationRef, {
                              status: "Accepted",
                            });

                            const postRef = ref(
                              database,
                              `farmers/${user.uid}`
                            );
                            const postSnapshot = await get(postRef);
                            if (postSnapshot.exists()) {
                              const postData = postSnapshot.val();
                              const acceptedCount = postData.accepted || 0;
                              await update(postRef, {
                                accepted: acceptedCount + 1,
                              });
                            }
                          }

                          posterApplicant.style.display = "none";
                          displayPosterApplicant();
                        } else {
                          alert("Application does not exist.");
                        }
                      } catch (error) {
                        console.error("Error accepting applicant:", error);
                        alert("Error accepting applicant: " + error.message);
                      }
                    });
                });
              }
            }
          }
          // INBOX END ====================================================================================================================================================

          btnMenu.style.display = "none";

          btnMenu.addEventListener("click", btnHandleMenu);
          menuOverlay.addEventListener("click", btnHandleMenu);

          function btnHandleMenu() {
            dropdownContent.classList.toggle("active");
            menuOverlay.classList.toggle("active");
          }

          const profileDropdown = document.querySelector(".profile-dropdown");
          const profileDropdownContent = document.querySelector(
            ".profile-dropdown-content"
          );

          profileDropdown.addEventListener("click", handleProfileDropdown);

          function handleProfileDropdown() {
            profileDropdownContent.classList.toggle("active");
          }

          document
            .querySelector(".btn-logout")
            .addEventListener("click", () => logout());

          function logout() {
            auth.signOut().then(() => {
              window.location.href = "./../index.html";
            });
          }
        });
      }
    });
  } else {
    window.location.href = "./../index.html";
  }
});
