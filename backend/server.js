/**
 * server.js
 * AfriCrop API gateway. Ties together three routes:
 *   /api/weather  -> live forecast from Open-Meteo
 *   /api/market   -> crop market prices
 *   /api/advice   -> crop recommendations from the Python service
 *
 * The frontend only ever talks to this server, never to the third-party APIs
 * or the Python service directly. That keeps secrets and CORS in one place.
 */
const express = require("express");
const cors = require("cors");

const weatherRoute = require("./routes/weather");
const marketRoute = require("./routes/market");
const adviceRoute = require("./routes/advice");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "gateway" }));

app.use("/api/weather", weatherRoute);
app.use("/api/market", marketRoute);
app.use("/api/advice", adviceRoute);

app.listen(PORT, () => {
  console.log(`AfriCrop API gateway running on http://localhost:${PORT}`);
});
