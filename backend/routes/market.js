/**
 * routes/market.js
 * Serves market prices for a crop.
 *
 * Right now it reads from a seed JSON file. The response shape is deliberately
 * kept simple and stable so this handler can later be swapped to fetch from a
 * live source (WFP VAM, FAOSTAT, a national market-information system) without
 * the frontend needing any change. See README "Swapping in a live price feed".
 */
const express = require("express");
const path = require("path");
const router = express.Router();

const prices = require(path.join(__dirname, "..", "data", "market-prices.json"));

router.get("/", (req, res) => {
  const crop = (req.query.crop || "").toLowerCase();

  if (!crop) {
    return res.status(400).json({ error: "crop query param is required" });
  }

  const rows = prices.markets[crop];
  if (!rows) {
    return res.status(404).json({ error: `No price data for crop: ${crop}` });
  }

  res.json({
    crop,
    currency: prices.currency,
    unit: prices.unit,
    updated: prices.updated,
    prices: rows,
  });
});

module.exports = router;
