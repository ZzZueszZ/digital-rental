from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="KYC_AI_", env_file=".env", extra="ignore")

    api_key: str = "local-dev-key"
    log_level: str = "INFO"
    log_ocr_text: bool = False
    face_match_threshold: float = 80.0
    liveness_threshold: float = 0.80
    max_upload_mb: int = 10
    ocr_min_width: int = 320
    ocr_min_height: int = 200
    ocr_blur_threshold: float = 80.0
    ocr_min_brightness: float = 45.0
    ocr_max_brightness: float = 230.0
    ocr_min_document_area_ratio: float = 0.15
    enable_paddle_ocr: bool = True
    enable_mediapipe: bool = True
    enable_onnx_antispoof: bool = True


@lru_cache
def get_settings() -> Settings:
    return Settings()
