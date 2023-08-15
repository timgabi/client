const url = "https://jscp-diplom.netoserver.ru";
const movie = JSON.parse(localStorage.getItem("movie"));
const hallConfig = JSON.parse(localStorage["hallConfig"]).replace(
  /selected/g,
  "taken"
);

async function getTicket() {
  try {
    const response = await fetch(url, {
      method: "POST",
      body: `event=sale_add&timestamp=${movie.timestamp}&hallId=${movie.hallId}&seanceId=${movie.seanceId}&hallConfiguration=${hallConfig}`,
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

const renderPayment = () => {
  document.querySelector(".ticket__title").innerHTML = movie.movieTitle
    .split(",")
    .join(" ");

  document.querySelector(".ticket__chairs").innerHTML = localStorage
    .getItem("places")
    .split("[")[1]
    .split("]");

  document.querySelector(".ticket__hall").innerHTML = movie.movieHall;

  document.querySelector(".ticket__start").innerHTML = movie.movieStart;

  document.querySelector(".ticket__cost").innerHTML = localStorage.getItem(
    "price"
  );

  document
    .querySelector(".acceptin-button")
    .addEventListener("click", async () => {
      try {
        await getTicket();
        window.location.href = "ticket.html";
      } catch (e) {
        console.log(e);
      }
    });
};

renderPayment();
