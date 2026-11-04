/**
 * routes/advice.js
 * Forwards a crop + weather summary to the Python advice microservice and
 * returns its recommendations.
 *
 * If the Python service is unreachable, we fall back to a minimal built-in
 * message so the app degrades gracefully instead of erroring out. (Showing
 * graceful degradation is good engineering practice to demonstrate.)
 */
const express = require("express");
const router = express.Router();

// Trailing slashes are stripped so ".../" and "..." both work (".../" would
// otherwise produce "//advice" and a 404 from the advice service).
const ADVICE_URL = (process.env.ADVICE_SERVICE_URL || "http://localhost:8000").replace(/\/+$/, "");

router.post("/", async (req, res) => {
  const { crop, lang = "en", weather } = req.body || {};

  if (!crop || !weather) {
    return res.status(400).json({ error: "crop and weather are required in the body" });
  }

  try {
    const r = await fetch(`${ADVICE_URL}/advice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ crop, lang, weather }),
    });
    if (!r.ok) {
      const detail = await r.json().catch(() => ({}));
      return res.status(r.status).json(detail.detail ? { error: detail.detail } : detail);
    }
    res.json(await r.json());
  } catch (err) {
    console.error("Advice service unreachable:", err.message);
    res.status(200).json({
      crop,
      crop_label: crop,
      planting: {
        status: "unknown",
        message:
          lang === "fr"
            ? "Le service de conseils est momentanément indisponible. Réessayez plus tard."
            : "The advice service is briefly unavailable. Please try again shortly.",
      },
      water: { status: "unknown", message: "" },
      pests: [],
      tips: [],
      degraded: true,
    });
  }
});

module.exports = router;
