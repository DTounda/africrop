// i18n.js
// Minimal, dependency-free bilingual layer. The whole UI reads strings from
// here, which is the differentiator: French and English are first-class, not a
// bolt-on toggle. Crop labels and advice text come already localised from the
// backend, so this file only covers the static UI chrome.

export const STRINGS = {
  en: {
    tagline: "Crop advice & market prices for African farmers",
    locationLabel: "Your location",
    useMyLocation: "Use my location",
    searchPlaceholder: "Town or city (e.g. Kigali)",
    search: "Search",
    cropLabel: "Choose your crop",
    weatherTitle: "Weather",
    now: "Now",
    high: "High",
    low: "Low",
    rain7d: "Rain (7 days)",
    humidity: "Humidity",
    adviceTitle: "What to do",
    planting: "Planting",
    water: "Water",
    pestWatch: "Pest watch",
    marketTitle: "Market prices",
    perKg: "per kg",
    updated: "Updated",
    loading: "Loading…",
    locating: "Finding you…",
    geoError: "Could not get your location. Try searching by name.",
    notFound: "Place not found. Check the spelling.",
    pickCrop: "Pick a crop to see advice and prices.",
    trendUp: "rising",
    trendDown: "falling",
    trendStable: "steady",
    footer: "Built as an open prototype. Weather from Open-Meteo.",
  },
  fr: {
    tagline: "Conseils agricoles et prix du marché pour les agriculteurs africains",
    locationLabel: "Votre localisation",
    useMyLocation: "Utiliser ma position",
    searchPlaceholder: "Ville (ex : Kigali)",
    search: "Rechercher",
    cropLabel: "Choisissez votre culture",
    weatherTitle: "Météo",
    now: "Actuel",
    high: "Max",
    low: "Min",
    rain7d: "Pluie (7 jours)",
    humidity: "Humidité",
    adviceTitle: "Que faire",
    planting: "Semis",
    water: "Eau",
    pestWatch: "Vigilance ravageurs",
    marketTitle: "Prix du marché",
    perKg: "par kg",
    updated: "Mis à jour",
    loading: "Chargement…",
    locating: "Localisation…",
    geoError: "Impossible d'obtenir votre position. Essayez par nom.",
    notFound: "Lieu introuvable. Vérifiez l'orthographe.",
    pickCrop: "Choisissez une culture pour voir les conseils et les prix.",
    trendUp: "en hausse",
    trendDown: "en baisse",
    trendStable: "stable",
    footer: "Prototype open source. Météo via Open-Meteo.",
  },
};

export function useStrings(lang) {
  return STRINGS[lang] || STRINGS.en;
}
