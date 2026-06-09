from fastapi import FastAPI
import logging

from app.api.face_match import router as face_match_router
from app.api.liveness import router as liveness_router
from app.api.ocr import router as ocr_router
from app.config import get_settings


settings = get_settings()
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)


app = FastAPI(
    title="LensHub AI KYC Service",
    description="Self-hosted CPU-only KYC service with FPT-compatible API contracts.",
    version="0.1.0",
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(ocr_router)
app.include_router(face_match_router)
app.include_router(liveness_router)
