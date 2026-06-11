import express from "express";

// Importeer de Liquid package (ook als dependency via npm geïnstalleerd)
import { Liquid } from "liquidjs";

// Maak een nieuwe Express applicatie aan, waarin we de server configureren
const app = express();

// Maak werken met data uit formulieren iets prettiger
app.use(express.urlencoded({ extended: true }));

// Gebruik de map 'public' voor statische bestanden (resources zoals CSS, JavaScript, afbeeldingen en fonts)
// Bestanden in deze map kunnen dus door de browser gebruikt worden
app.use(express.static("public"));

// Stel Liquid in als 'view engine'
const engine = new Liquid();
app.engine("liquid", engine.express());

// Stel de map met Liquid templates in
// Let op: de browser kan deze bestanden niet rechtstreeks laden (zoals voorheen met HTML bestanden)
app.set("views", "./views");

const baseURL = 'https://fdnd-agency.directus.app/items'
const productEndpoint = `${baseURL}/decathlon_products?fields=*,images.*`
const reviewEndpoint = `${baseURL}/decathlon_reviews?fields=*,attributes.*`

const fetchData = async (url) => {
  const fetchResponse = await fetch(url);
  const json = await fetchResponse.json();
  return json.data;
};

const getRatingValue = (review) => {
  const rawRating = review?.rating ?? review?.review_rating ?? 0;
  const numberRating = typeof rawRating === "number" ? rawRating : Number(rawRating);
  return Number.isNaN(numberRating) ? 0 : Math.min(5, Math.max(0, Math.round(numberRating)));
};

app.get("/", async function (request, response) {
  const [products, reviews] = await Promise.all([
    fetchData(productEndpoint),
    fetchData(reviewEndpoint),
  ]);

  const reviewsWithRatings = reviews.map((review) => ({
    ...review,
    ratingValue: getRatingValue(review),
  }));

  response.render("index.liquid", {
    product: products[0],
    reviews: reviewsWithRatings,
  });
});

// Stel het poortnummer in waar Express op moet gaan luisteren
// Lokaal is dit poort 8000; als deze applicatie ergens gehost wordt, waarschijnlijk poort 80
app.set("port", process.env.PORT || 8000);

// Start Express op, gebruik daarbij het zojuist ingestelde poortnummer op
app.listen(app.get("port"), function () {
// Toon een bericht in de console
 console.log(
 `Website draait op http://localhost:${app.get("port")}/`,
 );
});