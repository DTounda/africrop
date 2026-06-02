# 🌱 AfriCrop

**Crop advice and market prices for African farmers, in English and French.**

AfriCrop is a mobile-first web app that gives smallholder farmers practical,
location-aware guidance: a live local weather forecast, plain-language advice on
when to plant and water their crop, pest watch-outs, and current market prices.
The whole interface works in both English and French.

This repository is a focused, working slice of a larger agricultural super-app
concept. It is built to demonstrate a real full-stack architecture rather than a
single-file demo.

> ⚠️ The advice is general guidance for a prototype. It is not a substitute for
> local agricultural extension services, and the UI says so.

---

## ✨ What it does

- **Find your location** by search (any town/city) or one-tap geolocation.
- **Pick a crop** from common African staples (maize, cassava, beans, tomato, rice, sorghum).
- **See live weather** for the next 7 days, pulled from the Open-Meteo API.
- **Get crop advice**: planting window, irrigation guidance, and pest watch, all
  computed from the real forecast by a dedicated Python rules engine.
- **Check market prices** across regional markets, with price trends.
- **Switch language** between English and French instantly — both are first-class.

---

## 🧱 Architecture

AfriCrop is built as three small services, which is how real products are
structured (separation of concerns, independent scaling, language-appropriate
tools for each job):

```
   ┌─────────────────┐      ┌──────────────────────┐      ┌────────────────────────┐
   │  React frontend  │ ───▶ │  Node API gateway     │ ───▶ │  Python advice service  │
   │  (Vite, mobile)  │      │  (Express)            │      │  (FastAPI rules engine) │
   └─────────────────┘      └──────────────────────┘      └────────────────────────┘
            │                          │
            │ geocoding                │ live forecast
            ▼                          ▼
     Open-Meteo (geocode)       Open-Meteo (weather)
```

- **`frontend/`** — React + Vite. Mobile-first CSS, bilingual UI, no heavy UI
  libraries. Talks only to the gateway (plus Open-Meteo's keyless geocoder).
- **`backend/`** — Node + Express. A single front door for the app: proxies the
  weather API, serves market prices, and forwards advice requests. Keeps CORS and
  any future secrets in one place. Degrades gracefully if the advice service is down.
- **`advice-service/`** — Python + FastAPI. A transparent, readable agronomic
  rules engine. Separated out because the crop logic is the kind of thing that
  grows into data analysis / modelling, which is Python's home turf.

**Tech:** React, JavaScript, Node.js, Express, Python, FastAPI, HTML, CSS,
the Open-Meteo API, and a REST design that cleanly separates the three layers.

---

## 🚀 Run it locally

You need **Node 18+** and **Python 3.10+**.

Open three terminals.

### 1. Advice service (Python)

```bash
cd advice-service
python3 -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. API gateway (Node)

```bash
cd backend
npm install
npm run dev          # starts on http://localhost:4000
```

### 3. Frontend (React)

```bash
cd frontend
npm install
npm run dev          # starts on http://localhost:5173
```

Open **http://localhost:5173**, search a town (try "Kigali"), pick a crop, and
you'll see live weather, advice, and prices.

---

## 🌍 Deploy it (free tiers)

A live link is what turns a repo into a portfolio piece. One simple split:

1. **Advice service** → deploy `advice-service/` as a web service on Render.
   Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
2. **Backend** → deploy `backend/` as a Node web service on Render.
   Set env var `ADVICE_SERVICE_URL` to the advice service's URL.
3. **Frontend** → deploy `frontend/` on Vercel or Netlify.
   Set env var `VITE_API_URL` to the backend's URL, then build with `npm run build`.

---

## 🔁 Swapping in a live price feed

Market prices currently come from a seed dataset (`backend/data/market-prices.json`)
modelled on typical regional wholesale ranges. The `/api/market` response shape is
kept deliberately stable so the data source can be swapped without touching the
frontend. To go live, point `backend/routes/market.js` at a real source such as:

- **WFP VAM** economic price data
- **FAO FAOSTAT** producer prices
- A national market-information system API

Return the same `{ market, country, price, trend }` shape and the UI just works.

---

## 🗺️ Roadmap

- SMS / WhatsApp delivery layer for farmers without smartphones
- Historical price charts and simple forecasting (Python)
- More crops and region-specific agronomic rules
- Offline-first caching for low-connectivity areas

---

## 📋 API reference

| Method | Endpoint        | Purpose                                   |
| ------ | --------------- | ----------------------------------------- |
| GET    | `/api/health`   | Gateway liveness                          |
| GET    | `/api/weather`  | 7-day forecast for `?lat=&lon=`           |
| GET    | `/api/market`   | Prices for `?crop=`                       |
| POST   | `/api/advice`   | Crop advice from `{ crop, lang, weather }`|

---

Built by Lesly Nana Tounda · [GitHub](https://github.com/DTounda) · [LinkedIn](https://linkedin.com/in/nana-dorcase-64a355312)
