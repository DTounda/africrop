/**
 * routes/weather.js
 * Calls the free, key-less Open-Meteo API and reduces the raw forecast into a
 * compact summary that both the frontend and the Python advice service can use.
 *
 * Open-Meteo docs: https://open-meteo.com/en/docs
 */
const express = require("express");
const router = express.Router();

const OPEN_METEO = "https://api.open-meteo.com/v1/forecast";

router.get("/", async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "lat and lon query params are required" });
  }

  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: "temperature_2m,relative_humidity_2m,weather_code",
    daily: "temperature_2m_max,temperature_2m_min,precipitation_sum",
    hourly: "soil_moisture_3_to_9cm",
    forecast_days: "7",
    timezone: "auto",
  });

  try {
    const r = await fetch(`${OPEN_METEO}?${params.toString()}`);
    if (!r.ok) throw new Error(`Open-Meteo responded ${r.status}`);
    const data = await r.json();

    // Total rainfall across the 7-day window.
    const rain7d = (data.daily?.precipitation_sum || []).reduce(
      (sum, mm) => sum + (mm || 0),
      0
    );

    // Latest available soil-moisture reading, if present.
    const soilSeries = data.hourly?.soil_moisture_3_to_9cm || [];
    const soilMoisture = soilSeries.length
      ? soilSeries.filter((v) => v != null).slice(-1)[0] ?? null
      : null;

    const summary = {
      temp_now: data.current?.temperature_2m ?? null,
      humidity: data.current?.relative_humidity_2m ?? null,
      temp_max: data.daily?.temperature_2m_max?.[0] ?? null,
      temp_min: data.daily?.temperature_2m_min?.[0] ?? null,
      rain_next_7d: Math.round(rain7d * 10) / 10,
      soil_moisture: soilMoisture,
    };

    // Pass through the daily arrays so the frontend can draw a mini forecast.
    res.json({
      summary,
      daily: {
        time: data.daily?.time || [],
        temp_max: data.daily?.temperature_2m_max || [],
        temp_min: data.daily?.temperature_2m_min || [],
        rain: data.daily?.precipitation_sum || [],
      },
    });
  } catch (err) {
    console.error("Weather error:", err.message);
    res.status(502).json({ error: "Could not reach the weather service" });
  }
});

module.exports = router;
