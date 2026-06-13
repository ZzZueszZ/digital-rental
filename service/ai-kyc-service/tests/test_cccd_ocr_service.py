from dataclasses import dataclass

from app.services.cccd_ocr_service import CccdOcrService
from app.services.document_preprocessor import ImageCandidate, PreprocessResult
from app.services.ocr_engine import OcrLine, OcrResult


@dataclass
class FakePreprocessor:
    valid: bool = True

    def preprocess(self, content: bytes) -> PreprocessResult:
        if not self.valid:
            return PreprocessResult(False, [], {"valid": False}, False, 0.0, "Invalid image")
        return PreprocessResult(
            True,
            [ImageCandidate(0, b"image")],
            {"valid": True, "width": 640, "height": 400, "document_detected": True},
            True,
            0.9,
            "ok",
        )


class FakeOcrEngine:
    def recognize_best(self, candidates: list[ImageCandidate]) -> OcrResult:
        return OcrResult(
            [
                OcrLine("CAN CUOC CONG DAN", 0.9),
                OcrLine("So: 012345678901", 0.9),
                OcrLine("Ho va ten: NGUYEN VAN A", 0.9),
            ],
            0,
            True,
            "fake",
        )


def test_service_maps_fpt_compatible_success_response() -> None:
    service = CccdOcrService(preprocessor=FakePreprocessor(), ocr_engine=FakeOcrEngine())

    response = service.recognize(b"image", "front.jpg")

    assert response["errorCode"] == 0
    data = response["data"][0]
    assert data["id"] == "012345678901"
    assert data["name"] == "NGUYEN VAN A"
    assert "id_prob" in data
    assert data["quality"]["ocr_available"] is True


def test_service_maps_invalid_image_response() -> None:
    service = CccdOcrService(preprocessor=FakePreprocessor(valid=False), ocr_engine=FakeOcrEngine())

    response = service.recognize(b"bad", "front.jpg")

    assert response["errorCode"] == 400
    assert response["data"] == []
