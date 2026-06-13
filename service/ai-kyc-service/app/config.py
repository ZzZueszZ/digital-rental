from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="KYC_AI_", env_file=".env", extra="ignore")

    api_key: str = "local-dev-key"
    log_level: str = "INFO"
    log_ocr_text: bool = False
    face_match_threshold: float = 80.0
    face_match_model_name: str = "buffalo_s"
    face_match_det_size: int = 640
    liveness_threshold: float = 0.80
    liveness_min_duration_sec: float = 4.0
    liveness_max_duration_sec: float = 8.0
    liveness_min_fps: float = 20.0
    liveness_min_width: int = 640
    liveness_min_height: int = 480
    liveness_sample_fps: float = 2.5
    liveness_max_sample_frames: int = 18
    liveness_min_face_ratio: float = 0.80
    liveness_center_yaw_deg: float = 12.0
    liveness_turn_yaw_deg: float = 18.0
    liveness_antispoof_threshold: float = 0.75
    liveness_mediapipe_model_path: str = ""
    liveness_antispoof_model_path: str = ""
    liveness_antispoof_input_width: int = 80
    liveness_antispoof_input_height: int = 80
    liveness_antispoof_expand_ratio: float = 0.30
    liveness_antispoof_live_index: int = 1
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
