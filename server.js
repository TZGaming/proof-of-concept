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

// Register a Liquid filter that formats ISO datetimes into relative times
engine.registerFilter('relative_time', function (iso) {
  if (!iso) return '';
  // Directus may return datetimes without a timezone offset.
  // Treat bare ISO datetimes as UTC so 'just now' works correctly for recent posts.
  var normIso = iso;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(iso)) {
    normIso = iso + 'Z';
  }
  var date = new Date(normIso);
  if (isNaN(date)) return iso;
  var now = new Date();
  var diffMs = now - date;
  var diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return diffMin + 'min ago';
  var diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return diffH + 'h ago';
  var diffD = Math.floor(diffH / 24);
  if (diffD < 7) return diffD + 'd ago';
  var diffW = Math.floor(diffD / 7);
  if (diffW < 4) return diffW + 'w ago';
  var diffM = Math.floor(diffD / 30);
  if (diffM < 12) return diffM + 'm ago';
  var diffY = Math.floor(diffD / 365);
  return diffY + 'y ago';
});

app.engine("liquid", engine.express());

// Stel de map met Liquid templates in
// Let op: de browser kan deze bestanden niet rechtstreeks laden (zoals voorheen met HTML bestanden)
app.set("views", "./views");

const baseURL = 'https://fdnd-agency.directus.app/items'
const productEndpoint = `${baseURL}/decathlon_products?fields=*,images.*`
const reviewEndpoint = `${baseURL}/decathlon_reviews?fields=*,attributes.*`
const reviewCreateEndpoint = `${baseURL}/decathlon_reviews`

const reviewUser = {
  id: '55',
  name: 'Tom',
};

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
    user_id: review.user_id != null ? String(review.user_id) : "",
  }));

  response.render("index.liquid", {
    product: products[0],
    reviews: reviewsWithRatings,
    currentUserId: String(reviewUser.id),
    currentUserName: reviewUser.name,
  });
});

app.post("/reviews/delete", async function (request, response) {
  const { id } = request.body;

  const reviewResponse = await fetch(`${reviewCreateEndpoint}/${id}`);
  const reviewJson = await reviewResponse.json();
  const review = reviewJson.data || {};

  if (String(review.user_id) === reviewUser.id || review.name === reviewUser.name) {
    await fetch(`${reviewCreateEndpoint}/${id}`, {
      method: "DELETE",
    });
  }

  response.redirect("/");
});

app.post("/reviews", async function (request, response) {
  const { title, description, rating, grip, foot_support, lightweight, value_for_money, look_design } = request.body;

  const payload = {
    title,
    description,
    rating: Number(rating) || 0,
    name: reviewUser.name,
    user_id: reviewUser.id,
    created_at: new Date().toISOString(),
    attributes: [
      { criteria: "grip", score: Number(grip) || 0 },
      { criteria: "foot support", score: Number(foot_support) || 0 },
      { criteria: "lightweight", score: Number(lightweight) || 0 },
      { criteria: "value for money", score: Number(value_for_money) || 0 },
      { criteria: "look / design", score: Number(look_design) || 0 },
    ],
  };

  await fetch(reviewCreateEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  response.redirect("/#reviews");
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