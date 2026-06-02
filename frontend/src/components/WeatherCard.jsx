export default function WeatherCard({ t, place, weather }) {
  if (!weather) return null;
  const s = weather.summary;
  const fmt = (v, unit = "") => (v == null ? "—" : `${Math.round(v)}${unit}`);

  return (
    <article className="card weather-card">
      <header className="card-head">
        <h2 className="card-title">{t.weatherTitle}</h2>
        <span className="place-name">
          {place.name}
          {place.country ? `, ${place.country}` : ""}
        </span>
      </header>

      <div className="weather-now">
        <span className="temp-big">{fmt(s.temp_now, "°")}</span>
        <span className="temp-label">{t.now}</span>
      </div>

      <div className="weather-grid">
        <Stat label={t.high} value={fmt(s.temp_max, "°")} />
        <Stat label={t.low} value={fmt(s.temp_min, "°")} />
        <Stat label={t.rain7d} value={s.rain_next_7d == null ? "—" : `${s.rain_next_7d} mm`} />
        <Stat label={t.humidity} value={fmt(s.humidity, "%")} />
      </div>
    </article>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
