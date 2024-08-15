import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
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
    const buttons = document.querySelectorAll(".btn-products");

    const containerMachinery = document.querySelector(".machinery-container");

    const operatorContainer = document.querySelector(
      ".available-machine-operator-container"
    );

    buttons.forEach((button) => {
      button.addEventListener("click", function () {
        const productType = this.getAttribute("data-product");
        sessionStorage.setItem("productType", productType);
        displayAllProducts(productType);
      });
    });

    currentDisplay();

    function currentDisplay() {
      const currentDisplayValue = sessionStorage.getItem("currentDisplay");
      const productType = sessionStorage.getItem("productType");

      const productsContainer = document.querySelector(".products-container");
      const allProductsContainer = document.querySelector(
        ".all-products-container"
      );

      if (currentDisplayValue === "allProducts") {
        // productsContainer.style.display = "none";
        // allProductsContainer.style.display = "grid";
        displayAllProducts(productType);

        //
      } else {
        allProductsContainer.style.display = "none";
        productsContainer.style.display = "grid";

        //
      }
    }

    function displayAllProducts(productType) {
      document.querySelector(".products-container").style.display = "none";
      const allProductsContainer = document.querySelector(
        ".all-products-container"
      );

      sessionStorage.setItem("currentDisplay", "allProducts");

      allProductsContainer.style.display = "grid";
      allProductsContainer.innerHTML = "";

      const btnBack = document.createElement("button");
      btnBack.classList.add("product-btn-back");
      btnBack.textContent = "Back";

      btnBack.addEventListener("click", () => {
        document.querySelector(".products-container").style.display = "grid";
        allProductsContainer.style.display = "none";
        sessionStorage.removeItem("currentDisplay");
      });

      allProductsContainer.appendChild(btnBack);

      const productRef = ref(database, `${productType}`);

      get(productRef).then((snapshot) => {
        if (snapshot.exists()) {
          const productData = snapshot.val();
          allProductsContainer.style.gridTemplateColumns = "repeat(3, 1fr)";

          for (const productID in productData) {
            const data = productData[productID];

            const productsCard = document.createElement("div");
            productsCard.classList.add("all-products-cards");

            const productImg = document.createElement("img");
            productImg.src = `${data.imageUrl}`;
            productImg.alt = "img";

            const productH1 = document.createElement("h1");
            if (productType === "land") {
              productH1.textContent = `${data.location}`;
            } else {
              productH1.textContent = data.name ? data.name : data.owner;
            }

            const productBtn = document.createElement("button");
            productBtn.classList.add("btn-all-products-details");
            productBtn.textContent = "VIEW DETAILS";

            productsCard.appendChild(productImg);
            productsCard.appendChild(productH1);
            productsCard.appendChild(productBtn);

            allProductsContainer.appendChild(productsCard);

            productBtn.addEventListener("click", () => {
              const calendarContainer = document.getElementById(
                "machinery-calendar-container"
              );

              if (calendarContainer.classList.contains("active")) {
                calendarContainer.classList.toggle("active");
              }
              allProductsContainer.style.display = "none";
              displayMachinery(productType, productID);
            });
          }
        } else {
          allProductsContainer.style.gridTemplateColumns = "1fr";
          const h1 = document.createElement("h1");
          h1.textContent = "There's no product posted yet.";

          allProductsContainer.appendChild(h1);
        }
      });
    }

    const ownerText = document.getElementById("owner-text");
    const contactText = document.getElementById("contact-text");
    const locationText = document.getElementById("location-text");
    const conditionText = document.querySelector(".machinery-condition");
    const hectareText = document.getElementById("hectare-text");
    const squareMeterText = document.getElementById("square-meter-text");
    const pricePerMonthText = document.getElementById("price-per-month-text");
    const pricePerDayText = document.getElementById("price-per-day-text");
    const dateText = document.getElementById("date-text");
    const durationText = document.getElementById("duration-text");
    const inpMonthDuration = document.getElementById("month-duration-text");
    const amountText = document.getElementById("amount-text");
    const inpHectare = document.getElementById("hectare-inp");

    const successEmail = document.getElementById("success-email");
    const infoName = document.getElementById("info-name");
    const infoOwner = document.getElementById("info-owner");
    const infoBrand = document.getElementById("info-brand");
    const infoLocation = document.getElementById("info-location");
    const infoDuration = document.getElementById("info-duration");
    const infoDate = document.getElementById("info-date");
    const infoAmount = document.getElementById("info-amount");

    const infoNameDiv = infoName.parentElement;
    const infoOwnerDiv = infoOwner.parentElement;
    const infoBrandDiv = infoBrand.parentElement;
    const infoDateDiv = infoDate.parentElement;

    const successContainer = document.getElementById("success-container");
    const overlay = document.getElementById("overlay");

    let startDateInput = containerMachinery.querySelector("#start-date");
    let endDateInput = containerMachinery.querySelector("#end-date");
    let selectedStartDate = null;
    let selectedEndDate = null;

    let newData;
    let totalAmount = null;
    let handleRentingClick;

    document.addEventListener("headerLoaded", () => {
      const btnHome = document.getElementById("btn-home");
      document.getElementById("btn-back-home").addEventListener("click", () => {
        successContainer.classList.toggle("active");
        overlay.classList.toggle("active");
        btnHome.click();
        sessionStorage.removeItem("currentDisplay");
        sessionStorage.removeItem("productType");
      });
    });

    async function HandleRenting(productType, productID) {
      const userSnapshot = await get(ref(database, `users/${user.uid}`));
      const userData = userSnapshot.val();

      infoNameDiv.style.display = "none";
      infoOwnerDiv.style.display = "none";
      infoBrandDiv.style.display = "none";
      infoDateDiv.style.display = "none";

      if (totalAmount) {
        let data = {};

        if (productType === "machinery") {
          infoNameDiv.style.display = "flex";
          infoBrandDiv.style.display = "flex";
          infoDateDiv.style.display = "flex";

          infoName.textContent = newData.name;
          infoBrand.textContent = newData.brand;
          infoLocation.textContent = newData.location;
          infoDuration.textContent = durationText.textContent;
          infoDate.textContent = `${startDateInput.value} - ${endDateInput.value}`;

          data = {
            type: productType,
            nameOwner: newData.name,
            brand: newData.brand,
            location: newData.location,
            duration: durationText.textContent,
            dateStart: startDateInput.value,
            dateEnd: endDateInput.value,
            amount: totalAmount,
            productID: productID,
            userName: userData.name,
            userID: user.uid,
            accepted: false,
            uniqueNumber: newData.uniqueNumber,
            userEmail: userData.email,
          };

          // data = {
          //   type: productType,
          //   nameOwner: newData.name,
          //   brand: newData.brand,
          //   location: newData.location,
          //   duration: durationText.textContent,
          //   dateStart: startDateInput.value,
          //   dateEnd: endDateInput.value,
          //   amount: totalAmount,
          //   productID: productID,
          //   userName: userData.name,
          //   userID: user.uid,
          //   accepted: false,
          //   uniqueNumber: newData.uniqueNumber,
          //   userEmail: userData.email,
          // };
        } else if (productType === "land") {
          infoOwnerDiv.style.display = "flex";

          infoOwner.textContent = newData.owner;
          infoLocation.textContent = newData.location;
          infoDuration.textContent = `${inpMonthDuration.value} Month(s)`;
          infoDate.textContent = `${startDateInput.value} - ${endDateInput.value}`;

          data = {
            type: productType,
            nameOwner: newData.owner,
            contact: newData.contact,
            location: newData.location,
            duration: `${inpMonthDuration.value} Month(s)`,
            amount: totalAmount,
            productID: productID,
            userName: userData.name,
            userID: user.uid,
            accepted: false,
            uniqueNumber: newData.uniqueNumber,
            userEmail: userData.email,
          };
        } else if (productType === "tools") {
          infoNameDiv.style.display = "flex";
          infoDateDiv.style.display = "flex";

          infoName.textContent = newData.owner;
          infoLocation.textContent = newData.location;
          infoDuration.textContent = durationText.textContent;
          infoDate.textContent = `${startDateInput.value} - ${endDateInput.value}`;

          data = {
            type: productType,
            nameOwner: newData.owner,
            contact: newData.contact,
            location: newData.location,
            duration: durationText.textContent,
            dateStart: startDateInput.value,
            dateEnd: endDateInput.value,
            amount: totalAmount,
            productID: productID,
            userName: userData.name,
            userID: user.uid,
            accepted: false,
            uniqueNumber: newData.uniqueNumber,
            userEmail: userData.email,
          };
        }

        successEmail.textContent = userData.email;
        infoAmount.textContent = totalAmount;

        set(push(ref(database, "transactions")), data).then(() => {
          successContainer.classList.toggle("active");
          overlay.classList.toggle("active");
        });
      }
    }

    function displayMachinery(productType, productID) {
      startDateInput = containerMachinery.querySelector("#start-date");
      endDateInput = containerMachinery.querySelector("#end-date");

      startDateInput.value = "";
      endDateInput.value = "";
      // duration;

      document
        .querySelector(".btn-machinery-back")
        .addEventListener("click", () => {
          containerMachinery.style.display = "none";
          document.querySelector(".all-products-container").style.display =
            "grid";

          operatorContainer.classList.remove("active");
        });

      containerMachinery.style.display = "flex";

      const productTypeText = document.getElementById("product-type-text");
      const machineryImg = containerMachinery.querySelector(".machinery-img");
      const machineryName = containerMachinery.querySelector(".machinery-name");
      const machineryBrand = containerMachinery.querySelector(
        ".machinery-brand-name"
      );
      const machineryColor =
        containerMachinery.querySelector(".machinery-color");
      const machineryPrice =
        containerMachinery.querySelector(".machinery-price");

      const divName = document.getElementById("name-div");
      const divOwner = document.getElementById("owner-div");
      const divContact = document.getElementById("contact-div");
      const divBrandName = document.getElementById("brand-name-div");
      const divLocation = document.getElementById("location-div");
      const divHectare = document.getElementById("hectare-div");
      const divMachineryHectare = document.getElementById(
        "machinery-hectare-div"
      );
      const divSquareMeter = document.getElementById("square-meter-div");
      const divColor = document.getElementById("color-div");
      const divCondition = document.getElementById("condition-div");
      const divCostPerUnit = document.getElementById("cost-per-unit-div");
      const divPricePerMonth = document.getElementById("price-per-month-div");
      const divPricePerDay = document.getElementById("price-per-day-div");
      const divDate = document.getElementById("date-div");
      const divDuration = document.getElementById("duration-div");
      const divMonthDuration = document.getElementById("month-duration-div");

      const btnMachineOperator = document.getElementById(
        "btn-machinery-operators"
      );
      const btnViewCalendar = document.getElementById("btn-machinery-calendar");
      // let totalHectare = null;

      ownerText.textContent = "";
      contactText.textContent = "";
      locationText.textContent = "";
      conditionText.textContent = "";
      hectareText.textContent = "";
      squareMeterText.textContent = "";
      pricePerMonthText.textContent = "";
      pricePerDayText.textContent = "";
      dateText.textContent = "";
      durationText.textContent = "";
      inpMonthDuration.value = "";
      amountText.textContent = "";
      inpHectare.value = "";
      const productRef = ref(database, `${productType}/${productID}`);

      get(productRef).then((snapshot) => {
        if (snapshot.exists()) {
          const productData = snapshot.val();
          newData = productData;

          machineryImg.src = `${productData.imageUrl}`;

          divName.style.display = "none";
          divOwner.style.display = "none";
          divContact.style.display = "none";
          divBrandName.style.display = "none";
          divLocation.style.display = "none";
          divHectare.style.display = "none";
          divMachineryHectare.style.display = "none";
          divSquareMeter.style.display = "none";
          divColor.style.display = "none";
          divCondition.style.display = "none";
          divCostPerUnit.style.display = "none";
          divPricePerMonth.style.display = "none";
          divPricePerDay.style.display = "none";
          divDate.style.display = "none";
          divDuration.style.display = "none";
          divMonthDuration.style.display = "none";

          btnMachineOperator.style.display = "none";
          btnViewCalendar.style.display = "none";

          if (productType === "machinery") {
            divName.style.display = "flex";
            divBrandName.style.display = "flex";
            divLocation.style.display = "flex";
            divColor.style.display = "flex";
            divCondition.style.display = "flex";
            divCostPerUnit.style.display = "flex";
            divDate.style.display = "flex";
            divDuration.style.display = "flex";
            divMachineryHectare.style.display = "flex";
            btnMachineOperator.style.display = "block";
            btnViewCalendar.style.display = "block";

            productTypeText.textContent = "Agricultural Machinery";
            machineryName.textContent = productData.name || "";
            machineryBrand.textContent = productData.brand || "";
            machineryColor.textContent = productData.color || "";
            machineryPrice.textContent = productData.price || "";
            locationText.textContent = productData.location || "";
            conditionText.textContent = productData.condition || "";
            displayMachineryCalendar(productData);
            displayOperator(productData);
          } else if (productType === "land") {
            divOwner.style.display = "flex";
            divContact.style.display = "flex";
            divLocation.style.display = "flex";
            divHectare.style.display = "flex";
            divSquareMeter.style.display = "flex";
            divPricePerMonth.style.display = "flex";
            divMonthDuration.style.display = "flex";

            productTypeText.textContent = "Land";
            ownerText.textContent = productData.owner || "";
            contactText.textContent = productData.contact || "";
            locationText.textContent = productData.location || "";
            hectareText.textContent = productData.hectare || "";
            squareMeterText.textContent = productData.squareMeter || "";
            pricePerMonthText.textContent = productData.price || "";

            inpMonthDuration.addEventListener("input", () => {
              totalAmount =
                inpMonthDuration.value *
                (productData.price * productData.hectare);
              amountText.textContent = totalAmount;
            });
          } else if (productType === "tools") {
            divOwner.style.display = "flex";
            divContact.style.display = "flex";
            divLocation.style.display = "flex";
            divPricePerDay.style.display = "flex";
            divDate.style.display = "flex";
            divDuration.style.display = "flex";
            btnViewCalendar.style.display = "block";

            productTypeText.textContent = "Tool";
            ownerText.textContent = productData.owner || "";
            contactText.textContent = productData.contact || "";
            locationText.textContent = productData.location || "";
            pricePerDayText.textContent = productData.price || "";
            displayMachineryCalendar(productData);
          }
        }
      });

      const btnRent = document.getElementById("btn-rent");

      if (handleRentingClick) {
        btnRent.removeEventListener("click", handleRentingClick);
      }

      handleRentingClick = () => HandleRenting(productType, productID);

      btnRent.addEventListener("click", handleRentingClick);

      function displayMachineryCalendar(data) {
        selectedStartDate = null;
        selectedEndDate = null;
        const datesContainer = containerMachinery.querySelector("#dates");
        const monthTitle = containerMachinery.querySelector("#month-title");
        const prevMonthBtn = containerMachinery.querySelector("#prev-month");
        const nextMonthBtn = containerMachinery.querySelector("#next-month");

        let currentMonth = new Date().getMonth();
        let currentYear = new Date().getFullYear();

        let availableStartDate = data
          ? new Date(data.availableStartDate + "T00:00:00")
          : null;
        let availableEndDate = data
          ? new Date(data.availableEndDate + "T00:00:00")
          : null;
        // let notAvailableDates = data.notAvailableDates
        //   ? data.notAvailableDates.map((date) => new Date(date + "T00:00:00"))
        //   : [];

        let notAvailableDates = data.notAvailableDates
          ? Object.values(data.notAvailableDates).map((date) => {
              return {
                start: new Date(date.dateStart + "T00:00:00"),
                end: new Date(date.dateEnd + "T00:00:00"),
              };
            })
          : [];

        // const availableStartDate = new Date(2024, 7, 7);
        // const availableEndDate = new Date(2024, 7, 15);

        // let notAvailableDates = [new Date(2024, 8, 9), new Date(2024, 9, 12)];

        function generateCalendar(month, year) {
          datesContainer.innerHTML = "";
          const firstDay = new Date(year, month).getDay() || 7;
          const daysInMonth = new Date(year, month + 1, 0).getDate();

          monthTitle.textContent = new Date(year, month).toLocaleString(
            "default",
            {
              month: "long",
              year: "numeric",
            }
          );

          for (let i = 1; i < firstDay; i++) {
            const blank = document.createElement("div");
            blank.classList.add("day", "date");
            datesContainer.appendChild(blank);
          }

          for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement("div");
            dayElement.classList.add("day", "date");
            dayElement.textContent = day;

            const currentDate = new Date(year, month, day);

            if (
              currentDate >= availableStartDate &&
              currentDate <= availableEndDate
            ) {
              if (
                notAvailableDates.some(
                  (date) => currentDate >= date.start && currentDate <= date.end
                )
              ) {
                dayElement.classList.add("not-available");
              } else {
                dayElement.classList.add("available");
                dayElement.addEventListener("click", () =>
                  selectDate(currentDate)
                );
              }
            }

            datesContainer.appendChild(dayElement);
          }

          highlightDates();
        }

        function selectDate(date) {
          if (
            notAvailableDates.some(
              (blockedDate) =>
                date >= blockedDate.start && date <= blockedDate.end
            )
          ) {
            return;
          }

          if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
            selectedStartDate = date;
            selectedEndDate = null;
          } else if (date < selectedStartDate) {
            let isBlocked = false;
            let tempDate = new Date(date);

            while (tempDate <= selectedStartDate) {
              if (
                notAvailableDates.some(
                  (blockedDate) =>
                    tempDate.getTime() >= blockedDate.start.getTime() &&
                    tempDate.getTime() <= blockedDate.end.getTime()
                )
              ) {
                isBlocked = true;
                break;
              }
              tempDate.setDate(tempDate.getDate() + 1);
            }

            if (!isBlocked) {
              selectedEndDate = selectedStartDate;
              selectedStartDate = date;
            } else {
              return;
            }
          } else {
            let isBlocked = false;
            let tempDate = new Date(selectedStartDate);

            while (tempDate <= date) {
              if (
                notAvailableDates.some(
                  (blockedDate) =>
                    tempDate.getTime() >= blockedDate.start.getTime() &&
                    tempDate.getTime() <= blockedDate.end.getTime()
                )
              ) {
                isBlocked = true;
                break;
              }
              tempDate.setDate(tempDate.getDate() + 1);
            }

            if (!isBlocked) {
              selectedEndDate = date;
            } else {
              return;
            }
          }

          // Adjust selected dates by adding 1 day
          const adjustedStartDate = new Date(selectedStartDate);
          adjustedStartDate.setDate(adjustedStartDate.getDate() + 1);

          const adjustedEndDate = new Date(selectedEndDate);
          adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

          startDateInput.value = adjustedStartDate.toISOString().split("T")[0];

          if (selectedEndDate) {
            endDateInput.value = adjustedEndDate.toISOString().split("T")[0];

            const duration =
              Math.ceil(
                (selectedEndDate.getTime() - selectedStartDate.getTime()) /
                  (1000 * 60 * 60 * 24)
              ) + 1;

            inpHectare.addEventListener("input", () => {
              if (inpHectare.value && duration && endDateInput.value) {
                totalAmount = duration * 100 + data.price * inpHectare.value;
                amountText.textContent = totalAmount;
              } else {
                amountText.textContent = "";
              }
            });

            if (productType === "machinery" && inpHectare.value) {
              totalAmount = duration * 100 + data.price * inpHectare.value;
              amountText.textContent = totalAmount;
            } else if (productType === "tools") {
              totalAmount = duration * data.price;
              amountText.textContent = totalAmount;
            }
            durationText.textContent = `${duration} day(s)`;
            dateText.textContent = `${startDateInput.value} - ${endDateInput.value}`;
          } else {
            endDateInput.value = "";
            durationText.textContent = "";
            dateText.textContent = "";
            amountText.textContent = "";
            totalAmount = null;
          }

          highlightDates();
        }

        function highlightDates() {
          const dates = document.querySelectorAll(".date");

          dates.forEach((date) => {
            const dateNumber = parseInt(date.textContent);
            if (!isNaN(dateNumber)) {
              const dateObj = new Date(currentYear, currentMonth, dateNumber);
              date.classList.remove("selected-range");

              if (selectedStartDate && selectedEndDate) {
                if (
                  dateObj >= selectedStartDate &&
                  dateObj <= selectedEndDate
                ) {
                  date.classList.add("selected-range");
                }
              } else if (
                selectedStartDate &&
                !selectedEndDate &&
                dateObj.getTime() === selectedStartDate.getTime()
              ) {
                date.classList.add("selected-range");
              }
            }
          });
        }

        function changeMonth(direction) {
          currentMonth += direction;
          if (currentMonth < 0) {
            currentMonth = 11;
            currentYear -= 1;
          } else if (currentMonth > 11) {
            currentMonth = 0;
            currentYear += 1;
          }
          generateCalendar(currentMonth, currentYear);
        }

        startDateInput.addEventListener("input", highlightDates);
        endDateInput.addEventListener("input", highlightDates);
        prevMonthBtn.addEventListener("click", () => changeMonth(-1));
        nextMonthBtn.addEventListener("click", () => changeMonth(1));

        generateCalendar(currentMonth, currentYear);
      }

      const machineOperatorContainer =
        document.getElementById("machine-operator");

      const operatorText = document.getElementById("available-operator-header");

      function displayOperator(operatorData) {
        machineOperatorContainer.innerHTML = "";

        if (!operatorData.machineOperator) {
          operatorText.textContent = "NO AVAILABLE MACHINE OPERATOR";
          return;
        } else {
          operatorText.textContent = "AVAILABLE MACHINE OPERATOR";
        }

        for (const ID in operatorData.machineOperator) {
          const data = operatorData.machineOperator[ID];

          const machineOperator = document.createElement("div");
          machineOperator.classList.add("available-operator-cards");

          const img = document.createElement("img");
          img.src = data.imgUrl;

          const div1 = document.createElement("div");
          const text1 = document.createElement("h1");
          text1.textContent = "Name:";
          const h1Name = document.createElement("h1");
          h1Name.textContent = data.name;
          div1.appendChild(text1);
          div1.appendChild(h1Name);

          const div2 = document.createElement("div");
          const text2 = document.createElement("h1");
          text2.textContent = "Age:";
          const h1Age = document.createElement("h1");
          h1Age.textContent = data.age;
          div2.appendChild(text2);
          div2.appendChild(h1Age);

          const div3 = document.createElement("div");
          const text3 = document.createElement("h1");
          text3.textContent = "Address:";
          const h1address = document.createElement("h1");
          h1address.textContent = data.address;
          div3.appendChild(text3);
          div3.appendChild(h1address);

          const div4 = document.createElement("div");
          const text4 = document.createElement("h1");
          text4.textContent = "Skills:";
          const h1Skills = document.createElement("h1");
          h1Skills.textContent = data.name;
          div4.appendChild(text4);
          div4.appendChild(h1Skills);

          const div5 = document.createElement("div");
          const text5 = document.createElement("h1");
          text5.textContent = "Experience:";
          const h1Experience = document.createElement("h1");
          h1Experience.textContent = data.experience;
          div5.appendChild(text5);
          div5.appendChild(h1Experience);

          machineOperator.appendChild(img);
          machineOperator.appendChild(div1);
          machineOperator.appendChild(div2);
          machineOperator.appendChild(div3);
          machineOperator.appendChild(div4);
          machineOperator.appendChild(div5);

          machineOperatorContainer.appendChild(machineOperator);
        }
      }
    }

    document
      .getElementById("btn-machinery-calendar")
      .addEventListener("click", () => {
        document
          .getElementById("machinery-calendar-container")
          .classList.toggle("active");
      });

    document
      .querySelector(".btn-machinery-operators")
      .addEventListener("click", () => {
        operatorContainer.classList.toggle("active");
        if (operatorContainer.classList.contains("active")) {
          setTimeout(() => {
            operatorContainer.scrollIntoView({ behavior: "smooth" });
          }, 300);
        }
      });
  } else {
    window.location.href = "./../index.html";
  }
});
