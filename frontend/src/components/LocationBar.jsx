import { useState } from "react";
import { geocode } from "../api.js";

export default function LocationBar({ t, lang, onResolved, onError }) {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;
    setBusy(true);
    try {
      const place = await geocode(query.trim(), lang);
      if (!place) {
        onError(t.notFound);
      } else {
        onResolved(place);
      }
    } catch {
      onError(t.notFound);
    } finally {
      setBusy(false);
    }
  }

  function handleGeolocate() {
    if (!navigator.geolocation) {
      onError(t.geoError);
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBusy(false);
        onResolved({
          name: t.useMyLocation,
          country: "",
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      () => {
        setBusy(false);
        onError(t.geoError);
      },
      { timeout: 8000 }
    );
  }

  return (
    <section className="location-bar" aria-label={t.locationLabel}>
      <div className="search-row">
        <input
          className="search-input"
          type="text"
          inputMode="text"
          placeholder={t.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          aria-label={t.searchPlaceholder}
        />
        <button className="btn btn-primary" onClick={handleSearch} disabled={busy}>
          {t.search}
        </button>
      </div>
      <button className="btn btn-ghost geo-btn" onClick={handleGeolocate} disabled={busy}>
        <span className="pin" aria-hidden="true">◉</span> {t.useMyLocation}
      </button>
    </section>
  );
}
