from dataclasses import dataclass
from functools import lru_cache
import logging
from math import sqrt
from typing import Protocol

import numpy as np

from app.config import get_settings
from app.services.quality_service import QualityService
from app.utils.image_io import load_cv2_image


logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class FaceEmbeddingResult:
    embedding: np.ndarray | None
    face_count: int
    message: str


class FaceMatcher(Protocol):
    def embedding(self, content: bytes) -> FaceEmbeddingResult:
        ...


class InsightFaceMatcher:
    def __init__(self) -> None:
        self._app, self._message = self._load_model()

    def embedding(self, content: bytes) -> FaceEmbeddingResult:
        if self._app is None:
            return FaceEmbeddingResult(None, 0, self._message)

        image = load_cv2_image(content)
        if image is None:
            return FaceEmbeddingResult(None, 0, "invalid_image")

        try:
            faces = self._app.get(image)
        except Exception as exc:
            logger.exception("Face match detection failed: %s", exc)
            return FaceEmbeddingResult(None, 0, "face_detection_failed")

        if len(faces) != 1:
            return FaceEmbeddingResult(None, len(faces), "exactly_one_face_required")

        embedding = getattr(faces[0], "embedding", None)
        if embedding is None:
            return FaceEmbeddingResult(None, 1, "face_embedding_missing")
        return FaceEmbeddingResult(np.asarray(embedding, dtype=np.float32), 1, "face_embedding_ready")

    def _load_model(self):
        try:
            from insightface.app import FaceAnalysis  # type: ignore
        except Exception as exc:
            logger.warning("InsightFace import unavailable: %s", exc)
            return None, f"insightface_unavailable: {exc}"

        settings = get_settings()
        try:
            app = FaceAnalysis(name=settings.face_match_model_name, providers=["CPUExecutionProvider"])
            app.prepare(ctx_id=-1, det_size=(settings.face_match_det_size, settings.face_match_det_size))
            logger.info("InsightFace ready model=%s provider=CPUExecutionProvider", settings.face_match_model_name)
            return app, "insightface_ready"
        except Exception as exc:
            logger.exception("InsightFace initialization failed: %s", exc)
            return None, f"insightface_init_failed: {exc}"


class FaceMatchService:
    def __init__(
        self,
        quality_service: QualityService | None = None,
        matcher: FaceMatcher | None = None,
    ) -> None:
        self.quality_service = quality_service or QualityService()
        self.matcher = matcher or get_face_matcher()

    def verify(self, images: list[bytes]) -> dict:
        if len(images) != 2:
            return self._response(0.0, False, "Exactly two file[] images are required", "invalid_file_count")
        if not all(self.quality_service.is_usable_image(image) for image in images):
            return self._response(0.0, False, "One or more images are invalid or too small", "invalid_image_quality")

        first = self.matcher.embedding(images[0])
        second = self.matcher.embedding(images[1])
        diagnostics = {
            "first_face_count": first.face_count,
            "second_face_count": second.face_count,
            "first_message": first.message,
            "second_message": second.message,
        }
        if first.embedding is None or second.embedding is None:
            logger.info("Face match failed diagnostics=%s", diagnostics)
            return self._response(0.0, False, "face matching failed", "face_embedding_unavailable", diagnostics)

        cosine = self._cosine(first.embedding, second.embedding)
        similarity = self._score(cosine)
        matched = similarity >= get_settings().face_match_threshold
        logger.info("Face match completed similarity=%.2f matched=%s diagnostics=%s", similarity, matched, diagnostics)
        return self._response(similarity, matched, "face matching successful", "ok", diagnostics)

    def _score(self, cosine: float) -> float:
        return round(max(0.0, min(100.0, (cosine + 1.0) * 50.0)), 2)

    def _cosine(self, first: np.ndarray, second: np.ndarray) -> float:
        denominator = sqrt(float(np.dot(first, first))) * sqrt(float(np.dot(second, second)))
        if denominator == 0:
            return 0.0
        return float(np.dot(first, second) / denominator)

    def _response(
        self,
        similarity: float,
        matched: bool,
        message: str,
        reason: str,
        diagnostics: dict | None = None,
    ) -> dict:
        return {
            "code": "200",
            "message": message,
            "data": {
                "similarity": similarity,
                "isMatch": matched,
            },
            "diagnostics": {
                "reason": reason,
                "threshold": get_settings().face_match_threshold,
                **(diagnostics or {}),
            },
        }


@lru_cache(maxsize=1)
def get_face_matcher() -> InsightFaceMatcher:
    return InsightFaceMatcher()
