const STATUS_DOT = {
  go: "status-go",
  ok: "status-go",
  caution: "status-warn",
  supplement: "status-warn",
  wait: "status-stop",
  irrigate: "status-stop",
  unknown: "status-muted",
};

export default function AdviceCard({ t, advice }) {
  if (!advice) return null;

  return (
    <article className="card advice-card">
      <header className="card-head">
        <h2 className="card-title">{t.adviceTitle}</h2>
        <span className="place-name">{advice.crop_label}</span>
      </header>

      <Row
        label={t.planting}
        status={advice.planting?.status}
        text={advice.planting?.message}
      />
      {advice.water?.message ? (
        <Row label={t.water} status={advice.water?.status} text={advice.water?.message} />
      ) : null}

      {advice.pests?.length ? (
        <div className="advice-row">
          <span className="advice-label">{t.pestWatch}</span>
          <div className="pest-tags">
            {advice.pests.map((p) => (
              <span key={p} className="pest-tag">{p}</span>
            ))}
          </div>
        </div>
      ) : null}

      {advice.tips?.length ? (
        <ul className="tip-list">
          {advice.tips.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      ) : null}

      {advice.disclaimer ? <p className="disclaimer">{advice.disclaimer}</p> : null}
    </article>
  );
}

function Row({ label, status, text }) {
  return (
    <div className="advice-row">
      <span className="advice-label">
        <span className={`status-dot ${STATUS_DOT[status] || "status-muted"}`} aria-hidden="true" />
        {label}
      </span>
      <p className="advice-text">{text}</p>
    </div>
  );
}
