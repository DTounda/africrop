// api.js
// All network calls live here. The base URL is read from a Vite env var so the
// same build works locally and in production (set VITE_API_URL on the host).

const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Open-Meteo's geocoding endpoint is free and key-less. We call it directly
// from the browser because it has no secrets and supports CORS.
const GEOCODE = "https://geocoding-api.open-meteo.com/v1/search";

export async function geocode(name, lang = "en") {
  const url = `${GEOCODE}?name=${encodeURIComponent(name)}&count=1&language=${lang}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("geocode failed");
  const data = await r.json();
  const hit = data.results?.[0];
  if (!hit) return null;
  return {
    name: hit.name,
    country: hit.country,
    lat: hit.latitude,
    lon: hit.longitude,
  };
}

// The crop list rarely changes, so we keep a small static copy in sync with
// advice-service/crop_rules.py rather than adding a network round-trip on load.
export function getCrops(lang = "en") {
  return STATIC_CROPS[lang] || STATIC_CROPS.en;
}

// Kept in sync with advice-service/crop_rules.py CROP_PROFILES.
const STATIC_CROPS = {
  en: [
    { id: "maize", label: "Maize" },
    { id: "cassava", label: "Cassava" },
    { id: "beans", label: "Beans" },
    { id: "tomato", label: "Tomato" },
    { id: "rice", label: "Rice" },
    { id: "sorghum", label: "Sorghum" },
  ],
  fr: [
    { id: "maize", label: "Maïs" },
    { id: "cassava", label: "Manioc" },
    { id: "beans", label: "Haricots" },
    { id: "tomato", label: "Tomate" },
    { id: "rice", label: "Riz" },
    { id: "sorghum", label: "Sorgho" },
  ],
};

export async function getWeather(lat, lon) {
  const r = await fetch(`${BASE}/api/weather?lat=${lat}&lon=${lon}`);
  if (!r.ok) throw new Error("weather failed");
  return r.json();
}

export async function getMarket(crop) {
  const r = await fetch(`${BASE}/api/market?crop=${crop}`);
  if (!r.ok) throw new Error("market failed");
  return r.json();
}

export async function getAdvice(crop, lang, weatherSummary) {
  const r = await fetch(`${BASE}/api/advice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ crop, lang, weather: weatherSummary }),
  });
  if (!r.ok) throw new Error("advice failed");
  return r.json();
}
