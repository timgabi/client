const url = "https://jscp-diplom.netoserver.ru";
const movie = JSON.parse(localStorage.getItem("movie"));
const cinemaWrap = document.querySelector(".conf-step__wrapper");
let isResponse = false;

async function getHallConfig() {
  try {
    const response = await fetch(url, {
      method: "POST",
      body: `event=get_hallConfig&timestamp=${movie.timestamp}&hallId=${movie.hallId}&seanceId=${movie.seanceId}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    const data = await response.json();
    if (data) {
      isResponse = true;
      cinemaWrap.innerHTML = data;
    }
    return data;
  } catch (error) {
    console.error("Ошибка:", error);
  }
}

async function getAllSeances() {
  try {
    const response = await fetch(url, {
      method: "POST",
      body: "event=update",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Ошибка:", error);
  }
}

getHallConfig();

async function orderTicket() {
  try {
    const response = await fetch(url, {
      method: "POST",
      body:
        "event=sale_add&timestamp=51600&hallId=71&seanceId=63&hallConfiguration",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Ошибка:", error);
  }
}

function nodeListToString(nodeList) {
  return [].slice.call(nodeList).reduce((str, x) => {
    return (str += x.outerHTML);
  }, "");
}

const renderConfPlaces = async () => {
  const buyBtn = document.querySelector(".acceptin-button");
  const accessModal = document.querySelector(".conf-access-modal");
  const aceessModalBuyBtn = document.querySelector(".js-access-buy");
  const aceessModalCancelBtn = document.querySelector(".js-access-cancel");
  const qrModal = document.querySelector(".conf-qr-modal");
  const hallConfig = await getAllSeances();
  const hallConfigResult = hallConfig.halls.result[0].hall_config;

  document.querySelector(
    ".buying__info-title"
  ).innerHTML = movie.movieTitle.split(",").join(" ");

  document.querySelector(
    ".buying__info-start"
  ).innerHTML = `Начало сеанса: ${movie.movieStart}`;

  document.querySelector(".buying__info-hall").innerHTML = movie.movieHall;

  if (!isResponse) {
    cinemaWrap.innerHTML = hallConfigResult;
  }
  const allConfPlace = cinemaWrap.querySelectorAll(".conf-step__chair");
  const rows = cinemaWrap.querySelectorAll(".conf-step__row");

  if (rows) {
    rows.forEach((row, rowIndex) => {
      const places = row.querySelectorAll(".conf-step__chair");
      places.forEach((place, placeIndex) => {
        if (place.classList.contains("conf-step__chair_standart")) {
          place.setAttribute("data-price", movie.standartPrice);
        } else {
          place.setAttribute("data-price", movie.vipPrice);
        }
        place.setAttribute(
          "data-position",
          `${rowIndex + 1}/${placeIndex + 1}`
        );
        if (place.classList.contains("conf-step__chair_taken"))
          place.style.pointerEvents = "none";
      });
    });
  }

  const matchesClasses = ".conf-step__chair_standart, .conf-step__chair_vip";

  cinemaWrap.addEventListener(
    "click",
    event => {
      if (!event.target.matches(matchesClasses)) {
        return;
      }

      event.preventDefault();

      event.target.classList.toggle("conf-step__chair_selected");
    },
    false
  );

  buyBtn.addEventListener("click", () => {
    const allSelectedChair = cinemaWrap.querySelectorAll(
      ".conf-step__chair_selected"
    );

    if (!allSelectedChair.length) {
      return;
    }

    const places = [];
    const prices = [];

    allSelectedChair.forEach(selectedChair => {
      places.push(selectedChair.getAttribute("data-position"));
      prices.push(selectedChair.getAttribute("data-price"));
    });
    const price = prices.reduce((acc, cur) => Number(acc) + Number(cur), 0);
    localStorage.setItem("places", JSON.stringify(places));
    localStorage.setItem("price", JSON.stringify(price));
    cinemaWrap.childNodes.forEach(elem => {
      const childrens = elem.childNodes;

      childrens.forEach(child => {
        delete child.dataset.price;
        delete child.dataset.position;
      });
    });
    localStorage.setItem(
      "hallConfig",
      JSON.stringify(nodeListToString(cinemaWrap.childNodes))
    );
    window.location.href = "payment.html";
  });

  document.querySelector(".price-standart").innerHTML = movie.standartPrice;
  document.querySelector(".price-vip").innerHTML = movie.vipPrice;
};

renderConfPlaces();
