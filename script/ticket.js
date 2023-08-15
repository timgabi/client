const movie = JSON.parse(localStorage.getItem("movie"));

const renderTicket = () => {
  const places = localStorage
    .getItem("places")
    .split("[")[1]
    .split("]");

  document.querySelector(".ticket__title").innerHTML = movie.movieTitle
    .split(",")
    .join(" ");

  document.querySelector(".ticket__chairs").innerHTML = places;

  document.querySelector(".ticket__hall").innerHTML = movie.movieHall;

  document.querySelector(".ticket__start").innerHTML = movie.movieStart;

  const qrCodeInfo = `Фильм: ${movie.movieTitle}, ${movie.movieHall}, Начало в: ${movie.movieStart}, Места: ${places}`;

  QrCreator.render(
    {
      text: qrCodeInfo,
      radius: 0.5, // 0.0 to 0.5
      ecLevel: "H", // L, M, Q, H
      fill: "#000", // foreground color
      background: null, // color or null for transparent
      size: 200, // in pixels
    },
    document.querySelector("#qr-code")
  );

  var canvas = document.querySelector("#qr-code").querySelector("canvas");
  var img = canvas.toDataURL("image/png");
  downloadImage(img);
};

renderTicket();

async function downloadImage(imageSrc) {
  const image = await fetch(imageSrc);
  const imageBlog = await image.blob();
  const imageURL = URL.createObjectURL(imageBlog);

  const link = document.createElement("a");
  link.href = imageURL;
  link.download = "Ваш билет";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
