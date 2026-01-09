import express from "express";
import axios from "axios";

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const API_BASE = "https://www.thecocktaildb.com/api/json/v1/1";

function normalizeQuery(q) {
  return (q ?? "").trim();
}

app.get("/", async (req, res) => {
  // optional: show a random cocktail on first load
  try {
    const r = await axios.get(`${API_BASE}/random.php`, { timeout: 8000 });
    const drink = r.data?.drinks?.[0] ?? null;

    res.render("index", {
      query: "",
      drinks: drink ? [drink] : [],
      error: null,
      mode: "random",
    });
  } catch (err) {
    res.render("index", {
      query: "",
      drinks: [],
      error: "Could not load a random cocktail right now.",
      mode: "random",
    });
  }
});

app.post("/search", async (req, res) => {
  const query = normalizeQuery(req.body.query);

  if (!query) {
    return res.render("index", {
      query: "",
      drinks: [],
      error: "Please type a cocktail name to search.",
      mode: "search",
    });
  }

  try {
    const r = await axios.get(`${API_BASE}/search.php`, {
      params: { s: query },          // axios safely builds the URL
      timeout: 8000,
    });

    const drinks = r.data?.drinks ?? []; // API returns null if none found

    res.render("index", {
      query,
      drinks,
      error: drinks.length ? null : `No results for "${query}".`,
      mode: "search",
    });
  } catch (err) {
    res.render("index", {
      query,
      drinks: [],
      error: "Search failed. Please try again.",
      mode: "search",
    });
  }
});

app.get("/drink/:id", async (req, res) => {
  try {
    const r = await axios.get(`${API_BASE}/lookup.php`, {
      params: { i: req.params.id },
      timeout: 8000,
    });
    const drink = r.data?.drinks?.[0];

    if (!drink) return res.status(404).send("Not found");

    res.render("drink", { drink });
  } catch (err) {
    res.status(500).send("Error loading drink");
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
