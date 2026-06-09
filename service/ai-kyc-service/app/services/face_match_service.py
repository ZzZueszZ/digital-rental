import hashlib
from math import sqrt

import numpy as np

from app.config import get_settings
from app.services.quality_service import QualityService
from app.utils.image_io import load_pil_image


class FaceMatchService:
    def __init__(self) -> None:
        self.quality_service = QualityService()

    def verify(self, images: list[bytes]) -> dict:
        if len(images) != 2:
            return self._response(0.0, False, "Exactly two file[] images are required")
        if not all(self.quality_service.is_usable_image(image) for image in images):
            return self._response(0.0, False, "One or more images are invalid or too small")

        similarity = self._insightface_similarity(images[0], images[1])
        if similarity is None:
            similarity = self._perceptual_similarity(images[0], images[1])
        matched = similarity >= get_settings().face_match_threshold
        return self._response(similarity, matched, "face matching successful")

    def _insightface_similarity(self, first: bytes, second: bytes) -> float | None:
        try:
            import cv2  # type: ignore
            from insightface.app import FaceAnalysis  # type: ignore

            app = FaceAnalysis(name="buffalo_s", providers=["CPUExecutionProvider"])
            app.prepare(ctx_id=-1, det_size=(640, 640))
            embeddings = []
            for content in (first, second):
                image = cv2.imdecode(np.frombuffer(content, dtype=np.uint8), cv2.IMREAD_COLOR)
                faces = app.get(image)
                if len(faces) != 1:
                    return 0.0
                embeddings.append(faces[0].embedding)
            cosine = self._cosine(embeddings[0], embeddings[1])
            return round(max(0.0, min(100.0, (cosine + 1.0) * 50.0)), 2)
        except Exception:
            return None

    def _perceptual_similarity(self, first: bytes, second: bytes) -> float:
        first_vec = self._image_vector(first)
        second_vec = self._image_vector(second)
        cosine = self._cosine(first_vec, second_vec)
        hash_penalty = 0 if hashlib.sha256(first).digest() == hashlib.sha256(second).digest() else 8
        return round(max(0.0, min(100.0, (cosine + 1.0) * 50.0 - hash_penalty)), 2)

    def _image_vector(self, content: bytes) -> np.ndarray:
        image = load_pil_image(content).resize((32, 32)).convert("L")
        arr = np.asarray(image, dtype=np.float32).reshape(-1)
        arr = arr - arr.mean()
        norm = np.linalg.norm(arr)
        return arr / norm if norm else arr

    def _cosine(self, first: np.ndarray, second: np.ndarray) -> float:
        denominator = sqrt(float(np.dot(first, first))) * sqrt(float(np.dot(second, second)))
        if denominator == 0:
            return 0.0
        return float(np.dot(first, second) / denominator)

    def _response(self, similarity: float, matched: bool, message: str) -> dict:
        return {
            "code": "200",
            "message": message,
            "data": {
                "similarity": similarity,
                "isMatch": matched,
            },
        }
