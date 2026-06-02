const TREND = {
  up: { glyph: "▲", cls: "trend-up", key: "trendUp" },
  down: { glyph: "▼", cls: "trend-down", key: "trendDown" },
  stable: { glyph: "▬", cls: "trend-stable", key: "trendStable" },
};

export default function MarketCard({ t, market }) {
  if (!market) return null;

  return (
    <article className="card market-card">
      <header className="card-head">
        <h2 className="card-title">{t.marketTitle}</h2>
        <span className="place-name">
          {t.updated} {market.updated}
        </span>
      </header>

      <ul className="market-list">
        {market.prices.map((row) => {
          const tr = TREND[row.trend] || TREND.stable;
          return (
            <li key={row.market} className="market-row">
              <div className="market-place">
                <span className="market-city">{row.market}</span>
                <span className="market-country">{row.country}</span>
              </div>
              <div className="market-price">
                <span className="price-value">
                  ${row.price.toFixed(2)}
                  <span className="price-unit"> / {market.unit}</span>
                </span>
                <span className={`trend ${tr.cls}`}>
                  {tr.glyph} {t[tr.key]}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
