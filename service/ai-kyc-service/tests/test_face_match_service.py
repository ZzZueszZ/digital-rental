from io import BytesIO

import numpy as np
from PIL import Image

from app.services.face_match_service import FaceEmbeddingResult, FaceMatchService


def image_bytes() -> bytes:
    buffer = BytesIO()
    Image.new("RGB", (320, 240), (220, 220, 220)).save(buffer, format="JPEG")
    return buffer.getvalue()


class FakeMatcher:
    def __init__(self, results: list[FaceEmbeddingResult]) -> None:
        self.results = results
        self.index = 0

    def embedding(self, content: bytes) -> FaceEmbeddingResult:
        result = self.results[self.index]
        self.index += 1
        return result


def service_with(results: list[FaceEmbeddingResult]) -> FaceMatchService:
    return FaceMatchService(matcher=FakeMatcher(results))


def embedding(values: list[float]) -> FaceEmbeddingResult:
    return FaceEmbeddingResult(np.asarray(values, dtype=np.float32), 1, "face_embedding_ready")


def test_face_match_success_from_embeddings() -> None:
    service = service_with([embedding([1.0, 0.0]), embedding([1.0, 0.0])])

    response = service.verify([image_bytes(), image_bytes()])

    assert response["data"] == {"similarity": 100.0, "isMatch": True}
    assert response["diagnostics"]["reason"] == "ok"


def test_face_match_non_match_below_threshold() -> None:
    service = service_with([embedding([1.0, 0.0]), embedding([-1.0, 0.0])])

    response = service.verify([image_bytes(), image_bytes()])

    assert response["data"] == {"similarity": 0.0, "isMatch": False}
    assert response["diagnostics"]["reason"] == "ok"


def test_face_match_fails_closed_without_exactly_one_face() -> None:
    service = service_with(
        [
            FaceEmbeddingResult(None, 0, "exactly_one_face_required"),
            embedding([1.0, 0.0]),
        ]
    )

    response = service.verify([image_bytes(), image_bytes()])

    assert response["data"] == {"similarity": 0.0, "isMatch": False}
    assert response["diagnostics"]["reason"] == "face_embedding_unavailable"
    assert response["diagnostics"]["first_face_count"] == 0


def test_face_match_requires_two_images() -> None:
    response = service_with([]).verify([image_bytes()])

    assert response["data"] == {"similarity": 0.0, "isMatch": False}
    assert response["diagnostics"]["reason"] == "invalid_file_count"
