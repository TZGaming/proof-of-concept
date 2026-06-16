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

engine.registerFilter('relative_time', function (iso) {
  // Geen datum? Dan niets laten zien.
  if (!iso) return '';

  // Directus kan tijden geven zonder tijdzone-achtervoegsel.
  // Voeg in dat geval 'Z' toe zodat we het als UTC kunnen rekenen.
  var normIso = iso;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(iso)) {
    normIso = iso + 'Z';
  }

  // Maak van de string een echte Date.
  var date = new Date(normIso);
  if (isNaN(date)) return iso;

  // Bereken hoeveel tijd er sinds de datum is verlopen.
  var now = new Date();
  var diffMs = now - date;
  var diffMin = Math.floor(diffMs / 60000);

  // Afhankelijk van hoe lang geleden het is, geef een korte tekst terug.
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
  name: 'Tom',
};

const fetchData = async (url) => {
  const fetchResponse = await fetch(url);
  const json = await fetchResponse.json();
  return json.data;
};

// Haal een nette rating score uit een review en zorg dat het altijd een getal tussen 0 en 5 wordt.
const getRatingValue = (review) => {
  const rawRating = review?.rating ?? review?.review_rating ?? 0;
  const numberRating = typeof rawRating === "number" ? rawRating : Number(rawRating);
  return Number.isNaN(numberRating) ? 0 : Math.min(5, Math.max(0, Math.round(numberRating)));
};

// De product pagina route: product- en reviewdata ophalen en doorgeven aan de template.
app.get("/", async function (request, response) {
  const [products, reviews] = await Promise.all([
    fetchData(productEndpoint),
    fetchData(reviewEndpoint),
  ]);

  // Voeg voor elke review een nette rating toe.
  const reviewsWithRatings = reviews.map((review) => ({
    ...review,
    ratingValue: getRatingValue(review),
  }));

  // Render de index template met de eerste productdata en de reviews.
  response.render("index.liquid", {
    product: products[0],
    reviews: reviewsWithRatings,
    currentUserName: reviewUser.name,
  });
});

app.post("/reviews", async function (request, response) {
  const { title, description, rating, grip, foot_support, lightweight, value_for_money, look_design } = request.body;

  const payload = {
    title,
    description,
    rating: Number(rating) || 0,
    name: reviewUser.name,
    created_at: new Date().toISOString(),
    attributes: [
      { criteria: "grip", score: Number(grip) || 0 },
      { criteria: "foot support", score: Number(foot_support) || 0 },
      { criteria: "lightweight", score: Number(lightweight) || 0 },
      { criteria: "value for money", score: Number(value_for_money) || 0 },
      { criteria: "look / design", score: Number(look_design) || 0 },
    ],
  };

  // Stuur de nieuwe review naar de API en haal het aangemaakte review-ID op.
  const createResponse = await fetch(reviewCreateEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // Probeer de response JSON te lezen en bepaal het ID van de aangemaakte review.
  let createdId = null;
  try {
    const createJson = await createResponse.json();
    // Directus zet vaak het item onder `data.id`, maar andere API's kunnen `id` direct teruggeven.
    createdId = createJson?.data?.id ?? createJson?.id ?? null;
  } catch (e) {
    // Fout bij parsen; fallback naar geen ID.
    createdId = null;
  }

  // Redirect naar de specifieke review anchor als we een ID hebben, anders naar de reviews-sectie.
  if (createdId) {
    response.redirect(`/#review-${createdId}`);
  } else {
    response.redirect("/#reviews");
  }
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