"""
main.py
-------
FastAPI microservice that wraps the crop rules engine.

Endpoints:
    GET  /health           -> simple liveness check
    GET  /crops?lang=en    -> list of supported crops (for the dropdown)
    POST /advice           -> crop advice given crop + weather summary

The Node backend is the only expected caller, but CORS is open so the
service can also be tested directly from a browser or curl.
"""

from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import crop_rules

app = FastAPI(title="AfriCrop Advice Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class WeatherSummary(BaseModel):
    temp_now: Optional[float] = None
    temp_max: Optional[float] = None
    temp_min: Optional[float] = None
    rain_next_7d: Optional[float] = 0
    soil_moisture: Optional[float] = None


class AdviceRequest(BaseModel):
    crop: str
    lang: str = "en"
    weather: WeatherSummary


@app.get("/health")
def health():
    return {"status": "ok", "service": "advice"}


@app.get("/crops")
def crops(lang: str = "en"):
    return {"crops": crop_rules.list_crops(lang)}


@app.post("/advice")
def advice(req: AdviceRequest):
    try:
        return crop_rules.get_advice(req.crop, req.weather.model_dump(), req.lang)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
