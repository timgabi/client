const url = "https://jscp-diplom.netoserver.ru";

let TimestampToday = null;
let isCurrentDay = false;

const getNavigation = () => {
  const navigateItems = document.querySelectorAll(".page-nav__day");

  if (navigateItems) {
    const currentDay = new Date().toLocaleDateString();
    const currentWeek = getCurrentWeek().week;
    const days = getCurrentWeek().daysOfTheWeek;
    const tamestamps = getCurrentWeek().tamestamps;
    navigateItems.forEach((item, index) => {
      item.classList.remove(
        "page-nav__day_today",
        "page-nav__day_chosen",
        "page-nav__day_weekend"
      );
      item.setAttribute("data-tamestamp", tamestamps[index]);
      item.setAttribute("data-day", currentWeek[index]);

      if (currentWeek[index] === currentDay) {
        item.classList.add("page-nav__day_today", "page-nav__day_chosen");
        TimestampToday = item.getAttribute("data-tamestamp");
        isCurrentDay = true;
      }

      item.querySelector(".page-nav__day-number").innerHTML =
        currentWeek[index];
      item.querySelector(".page-nav__day-week").innerHTML = days[index];
      if (days[index] === "сб" || days[index] === "вс") {
        item.classList.add("page-nav__day_weekend");
      }
      item.addEventListener("click", () => {
        if (currentWeek[index] === currentDay) {
          isCurrentDay = true;
        } else {
          isCurrentDay = false;
        }
        navigateItems.forEach(i => i.classList.remove("page-nav__day_chosen"));
        item.classList.add("page-nav__day_chosen");
        TimestampToday = item.getAttribute("data-tamestamp");
        renderMovies();
      });
    });
  }

  function getCurrentWeek() {
    const week = [];
    const daysOfTheWeek = [];
    const tamestamps = [];

    for (let i = 1; i <= 7; i++) {
      const curr = new Date();
      const day = new Date(
        curr.setDate(curr.getDate() - 1 + i)
      ).toLocaleDateString();
      const dayOfTheWeek = new Date(
        curr.setDate(curr.getDate())
      ).toLocaleDateString("ru-us", { weekday: "short" });
      week.push(day);
      daysOfTheWeek.push(dayOfTheWeek);
      tamestamps.push(
        i === 1
          ? Math.trunc(
              new Date(new Date().setHours(0, 0, 0, 0)).getTime() / 1000
            )
          : Math.trunc(
              new Date(new Date().setHours(0, 0, 0, 0)).getTime() / 1000
            ) +
              24 * 60 * 60 * i
      );
    }

    return { week, daysOfTheWeek, tamestamps };
  }
};

getNavigation();

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

const renderMovies = async () => {
  const allMoviesWrap = document.querySelectorAll(".movie");
  const allSeances = await getAllSeances();
  const allFilmsResult = allSeances.films.result;
  const allHallsResult = allSeances.halls.result;
  const allSeancesResult = allSeances.seances.result;

  const getMovie = (film, hall, currentHalls) => `
    <section class="movie">
      <div class="movie__info">
        <div class="movie__poster">
          <img
            class="movie__poster-image"
            alt="Звёздные войны постер"
            src=${film.film_poster}
          />
        </div>
        <div class="movie__description">
          <h2 class="movie__title">${film.film_name}</h2>
          <p class="movie__synopsis">${film.film_description}</p>
          <p class="movie__data">
            <span class="movie__data-duration">${
              film.film_duration
            } минут</span>
            <span class="movie__data-origin">${film.film_origin}</span>
          </p>
        </div>
      </div>

    <div class="movie-seances__hall-wrap">
      ${parseHalls(hall, currentHalls, film.film_name)}
    </div>
</section>
`;

  function parseHalls(hall, currentHalls, filmName) {
    const dataArray = [];
    for (const key in currentHalls) {
      dataArray.push(currentHalls[key]);
    }

    return dataArray
      .map(i => getHall(hall, i, filmName))
      .sort()
      .join("");
  }

  const getHall = (hall, currentHalls, filmName) => {
    const findSeance = currentHalls.find(i => i.seance_hallid).seance_hallid;
    const findHall = hall.find(h => h.hall_id === findSeance);

    if (findHall.hall_open === "0") {
      return;
    }

    return `
      <div class="movie-seances__hall">
      <h3 class="movie-seances__hall-title">${findHall.hall_name}</h3>
      ${`<ul class="movie-seances__list">
      ${currentHalls.map((seance, index) => {
        const currentDate = new Date().toLocaleTimeString();
        const timestamp = Number(TimestampToday) + seance.seance_start * 60;
        return `<li class="movie-seances__time-block">
                      <div class="movie-seances__time ${
                        currentDate > seance.seance_time && isCurrentDay
                          ? "movie-seances__time--disabled"
                          : ""
                      }" href="hall.html"
                        data-hall-id=${findHall.hall_id}
                        data-seance-id=${seance.seance_id}
                        data-standart-price=${findHall.hall_price_standart}
                        data-vip-price=${findHall.hall_price_vip}
                        data-timestamp=${timestamp}
                        data-title=${filmName.split(" ")}
                        data-hall-name=${findHall.hall_name}
                        data-start=${seance.seance_time}>
                        ${seance.seance_time}
                      </div>
                  </li>`;
      })}
            </ul>`}
      </div>`;
  };

  if (allFilmsResult) {
    const allMoviesWrap = document.querySelector(".all-movies");
    allMoviesWrap.innerHTML = null;

    allFilmsResult.forEach((movie, index) => {
      const allCurrentFilms = allSeancesResult.filter(
        item => item.seance_filmid === allFilmsResult[index].film_id
      );
      const groupedHalls = groupBy(allCurrentFilms, "seance_hallid");
      const allCurrentHalls = allSeancesResult.filter(item => {
        return item.seance_filmid === allFilmsResult[index].film_id;
      });

      allMoviesWrap.insertAdjacentHTML(
        "beforeEnd",
        getMovie(movie, allHallsResult, groupedHalls)
      );
    });

    const allSeances = allMoviesWrap.querySelectorAll(".movie-seances__time");

    allSeances.forEach(seance => {
      seance.addEventListener("click", () => {
        const movie = {
          hallId: seance.getAttribute("data-hall-id"),
          seanceId: seance.getAttribute("data-seance-id"),
          standartPrice: seance.getAttribute("data-standart-price"),
          vipPrice: seance.getAttribute("data-vip-price"),
          timestamp: seance.getAttribute("data-timestamp"),
          movieTitle: seance.getAttribute("data-title"),
          movieHall: seance.getAttribute("data-hall-name"),
          movieStart: seance.getAttribute("data-start"),
        };
        localStorage.setItem("movie", JSON.stringify(movie));
        window.location.href = "hall.html";
      });
    });
  }
};

function groupBy(arr, property) {
  return arr.reduce((acc, cur) => {
    acc[cur[property]] = [...(acc[cur[property]] || []), cur];
    return acc;
  }, {});
}

renderMovies();
