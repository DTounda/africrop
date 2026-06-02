"""
crop_rules.py
-------------
A small, transparent agronomic rules engine.

It takes a crop and recent/forecast weather data (sourced from Open-Meteo via
the Node backend) and returns practical recommendations: whether conditions
favour planting, irrigation guidance, and pest/disease watch-outs.

The thresholds below are deliberately simple and readable. They are based on
broad agronomic guidance for common African staple crops. They are NOT a
replacement for local extension advice, and the README says so clearly.
"""

from typing import Dict, List

# Crop profiles. Temperatures in degrees Celsius, rainfall in millimetres.
# ideal_temp:    comfortable growing temperature band
# min_germ_temp: soil/air temperature below which germination is poor
# weekly_water:  rough water need per week (rain + irrigation), in mm
CROP_PROFILES: Dict[str, Dict] = {
    "maize": {
        "label_en": "Maize",
        "label_fr": "Maïs",
        "ideal_temp": (18, 32),
        "min_germ_temp": 12,
        "weekly_water": 30,
        "pests_en": ["Fall armyworm", "Stem borer"],
        "pests_fr": ["Chenille légionnaire", "Foreur de tige"],
    },
    "cassava": {
        "label_en": "Cassava",
        "label_fr": "Manioc",
        "ideal_temp": (20, 35),
        "min_germ_temp": 15,
        "weekly_water": 20,
        "pests_en": ["Cassava mosaic disease", "Mealybug"],
        "pests_fr": ["Mosaïque du manioc", "Cochenille"],
    },
    "beans": {
        "label_en": "Beans",
        "label_fr": "Haricots",
        "ideal_temp": (16, 27),
        "min_germ_temp": 10,
        "weekly_water": 28,
        "pests_en": ["Aphids", "Bean fly"],
        "pests_fr": ["Pucerons", "Mouche du haricot"],
    },
    "tomato": {
        "label_en": "Tomato",
        "label_fr": "Tomate",
        "ideal_temp": (18, 29),
        "min_germ_temp": 13,
        "weekly_water": 35,
        "pests_en": ["Tomato leaf miner", "Blight"],
        "pests_fr": ["Mineuse de la tomate", "Mildiou"],
    },
    "rice": {
        "label_en": "Rice",
        "label_fr": "Riz",
        "ideal_temp": (20, 35),
        "min_germ_temp": 15,
        "weekly_water": 50,
        "pests_en": ["Rice blast", "Stem borer"],
        "pests_fr": ["Pyriculariose", "Foreur de tige"],
    },
    "sorghum": {
        "label_en": "Sorghum",
        "label_fr": "Sorgho",
        "ideal_temp": (20, 35),
        "min_germ_temp": 15,
        "weekly_water": 22,
        "pests_en": ["Shoot fly", "Midge"],
        "pests_fr": ["Mouche des pousses", "Cécidomyie"],
    },
}


def _t(en: str, fr: str, lang: str) -> str:
    """Tiny helper: return the English or French string."""
    return fr if lang == "fr" else en


def list_crops(lang: str = "en") -> List[Dict]:
    """Return the crops we support, with localised labels (for the dropdown)."""
    return [
        {
            "id": crop_id,
            "label": profile["label_fr"] if lang == "fr" else profile["label_en"],
        }
        for crop_id, profile in CROP_PROFILES.items()
    ]


def get_advice(crop: str, weather: Dict, lang: str = "en") -> Dict:
    """
    Build advice for a crop given a weather summary.

    `weather` is expected to contain:
        temp_now      : current temperature (C)
        temp_max      : forecast max over the window (C)
        temp_min      : forecast min over the window (C)
        rain_next_7d  : total forecast rainfall over 7 days (mm)
        soil_moisture : volumetric soil moisture 0-1 (optional, may be None)
    """
    crop = (crop or "").lower()
    if crop not in CROP_PROFILES:
        raise ValueError(f"Unknown crop: {crop}")

    profile = CROP_PROFILES[crop]
    low, high = profile["ideal_temp"]
    temp_now = weather.get("temp_now")
    temp_min = weather.get("temp_min", temp_now)
    rain_7d = weather.get("rain_next_7d", 0) or 0
    soil = weather.get("soil_moisture")

    tips: List[str] = []

    # --- Planting suitability -------------------------------------------------
    if temp_min is not None and temp_min < profile["min_germ_temp"]:
        planting = _t(
            "Hold off planting. Nights are too cold for good germination right now.",
            "Reportez les semis. Les nuits sont trop froides pour une bonne germination.",
            lang,
        )
        planting_status = "wait"
    elif temp_now is not None and low <= temp_now <= high:
        planting = _t(
            "Good window to plant. Temperatures are in the comfortable range for this crop.",
            "Bonne fenêtre pour semer. Les températures sont dans la plage idéale pour cette culture.",
            lang,
        )
        planting_status = "go"
    elif temp_now is not None and temp_now > high:
        planting = _t(
            "Plant with care. It is hotter than ideal, so sow in the cooler part of the day and mulch well.",
            "Semez avec prudence. Il fait plus chaud qu'idéal : semez aux heures fraîches et paillez bien.",
            lang,
        )
        planting_status = "caution"
    else:
        planting = _t(
            "Conditions are workable. Watch the forecast over the next few days before sowing.",
            "Les conditions sont acceptables. Surveillez les prévisions des prochains jours avant de semer.",
            lang,
        )
        planting_status = "caution"

    # --- Water / irrigation ---------------------------------------------------
    need = profile["weekly_water"]
    if rain_7d >= need:
        water = _t(
            f"Rainfall over the next 7 days (about {round(rain_7d)} mm) should cover this crop's needs. Little to no irrigation required.",
            f"Les pluies des 7 prochains jours (environ {round(rain_7d)} mm) devraient couvrir les besoins. Peu ou pas d'irrigation nécessaire.",
            lang,
        )
        water_status = "ok"
    elif rain_7d >= need * 0.4:
        gap = round(need - rain_7d)
        water = _t(
            f"Partial rain expected. Plan to add roughly {gap} mm through irrigation this week.",
            f"Pluies partielles attendues. Prévoyez d'ajouter environ {gap} mm par irrigation cette semaine.",
            lang,
        )
        water_status = "supplement"
    else:
        water = _t(
            "Dry week ahead. Irrigation will be needed; water early morning or late evening to cut evaporation.",
            "Semaine sèche à venir. L'irrigation sera nécessaire : arrosez tôt le matin ou en soirée pour limiter l'évaporation.",
            lang,
        )
        water_status = "irrigate"

    # --- Soil moisture nudge (only if Open-Meteo returned it) -----------------
    if soil is not None:
        if soil < 0.15:
            tips.append(_t(
                "Soil is very dry. Consider watering before sowing seeds.",
                "Le sol est très sec. Pensez à arroser avant de semer.",
                lang,
            ))
        elif soil > 0.45:
            tips.append(_t(
                "Soil is quite wet. Avoid working the land until it drains to reduce root disease.",
                "Le sol est très humide. Évitez de travailler la terre avant qu'elle ne draine, pour limiter les maladies racinaires.",
                lang,
            ))

    # --- Pest / disease watch -------------------------------------------------
    pests = profile["pests_fr"] if lang == "fr" else profile["pests_en"]
    if rain_7d > need * 1.3:
        tips.append(_t(
            f"Wet conditions raise fungal risk. Scout for {pests[-1].lower()} and keep foliage dry where possible.",
            f"L'humidité augmente le risque fongique. Surveillez {pests[-1].lower()} et gardez le feuillage sec si possible.",
            lang,
        ))

    return {
        "crop": crop,
        "crop_label": profile["label_fr"] if lang == "fr" else profile["label_en"],
        "planting": {"status": planting_status, "message": planting},
        "water": {"status": water_status, "message": water},
        "pests": pests,
        "tips": tips,
        "disclaimer": _t(
            "General guidance only. For decisions, confirm with your local agricultural extension service.",
            "Conseils généraux uniquement. Pour vos décisions, confirmez auprès de votre service de vulgarisation agricole local.",
            lang,
        ),
    }
