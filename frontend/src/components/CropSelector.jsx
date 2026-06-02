const ICONS = {
  maize: "🌽",
  cassava: "🥔",
  beans: "🫘",
  tomato: "🍅",
  rice: "🌾",
  sorghum: "🌾",
};

export default function CropSelector({ t, crops, selected, onSelect }) {
  return (
    <section className="crop-selector" aria-label={t.cropLabel}>
      <h2 className="section-label">{t.cropLabel}</h2>
      <div className="crop-chips">
        {crops.map((c) => (
          <button
            key={c.id}
            className={`crop-chip ${selected === c.id ? "is-active" : ""}`}
            onClick={() => onSelect(c.id)}
            aria-pressed={selected === c.id}
          >
            <span className="crop-icon" aria-hidden="true">{ICONS[c.id] || "🌱"}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
