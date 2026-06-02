import { useEffect, useState } from "react";
import { useStrings } from "./i18n.js";
import { getCrops, getWeather, getMarket, getAdvice } from "./api.js";
import LocationBar from "./components/LocationBar.jsx";
import CropSelector from "./components/CropSelector.jsx";
import WeatherCard from "./components/WeatherCard.jsx";
import AdviceCard from "./components/AdviceCard.jsx";
import MarketCard from "./components/MarketCard.jsx";

export default function App() {
  const [lang, setLang] = useState("en");
  const t = useStrings(lang);

  const [place, setPlace] = useState(null);
  const [crop, setCrop] = useState(null);
  const [weather, setWeather] = useState(null);
  const [advice, setAdvice] = useState(null);
  const [market, setMarket] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const crops = getCrops(lang);

  // When we have both a place and a crop, fetch everything.
  useEffect(() => {
    if (!place || !crop) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const w = await getWeather(place.lat, place.lon);
        if (cancelled) return;
        setWeather(w);

        const [a, m] = await Promise.all([
          getAdvice(crop, lang, w.summary),
          getMarket(crop),
        ]);
        if (cancelled) return;
        setAdvice(a);
        setMarket(m);
      } catch {
        if (!cancelled) setError(t.notFound);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [place, crop, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="app">
      <div className="grain" aria-hidden="true" />

      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">🌱</span>
          <div>
            <h1 className="brand-name">AfriCrop</h1>
            <p className="brand-tag">{t.tagline}</p>
          </div>
        </div>
        <div className="lang-toggle" role="group" aria-label="Language">
          <button
            className={lang === "en" ? "is-active" : ""}
            onClick={() => setLang("en")}
          >
            EN
          </button>
          <button
            className={lang === "fr" ? "is-active" : ""}
            onClick={() => setLang("fr")}
          >
            FR
          </button>
        </div>
      </header>

      <main className="content">
        <LocationBar
          t={t}
          lang={lang}
          onResolved={(p) => {
            setPlace(p);
            setError("");
          }}
          onError={(msg) => setError(msg)}
        />

        <CropSelector t={t} crops={crops} selected={crop} onSelect={setCrop} />

        {error ? <p className="error-banner">{error}</p> : null}
        {loading ? <p className="loading">{t.loading}</p> : null}

        {!loading && place && crop ? (
          <div className="results">
            <WeatherCard t={t} place={place} weather={weather} />
            <AdviceCard t={t} advice={advice} />
            <MarketCard t={t} market={market} />
          </div>
        ) : !loading ? (
          <p className="hint">{t.pickCrop}</p>
        ) : null}
      </main>

      <footer className="app-footer">{t.footer}</footer>
    </div>
  );
}
