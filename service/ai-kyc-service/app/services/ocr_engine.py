from dataclasses import dataclass
from functools import lru_cache
from importlib import metadata
from typing import Any
import logging
import os
import tempfile
import unicodedata
import warnings

from app.config import get_settings
from app.services.document_preprocessor import ImageCandidate
from app.utils.image_io import load_cv2_image


logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class OcrLine:
    text: str
    confidence: float
    bbox: list[list[float]] | None = None


@dataclass(frozen=True)
class OcrResult:
    lines: list[OcrLine]
    angle: int
    available: bool
    message: str


class PaddleOcrEngine:
    def recognize_best(self, candidates: list[ImageCandidate]) -> OcrResult:
        if not candidates:
            return OcrResult([], 0, False, "No OCR candidates")
        if not get_settings().enable_paddle_ocr:
            return OcrResult([], candidates[0].angle, False, "PaddleOCR disabled")

        ocr, init_message = self._get_ocr()
        if ocr is None:
            logger.error(
                "OCR engine unavailable: %s enable_paddle_ocr=%s candidate_count=%s",
                init_message,
                get_settings().enable_paddle_ocr,
                len(candidates),
            )
            return OcrResult([], candidates[0].angle, False, init_message)

        best = OcrResult([], candidates[0].angle, True, "No text detected")
        best_score = -1.0
        for candidate in candidates:
            lines = self._recognize_candidate(ocr, candidate.content)
            score = self.anchor_score(lines)
            logger.info("OCR candidate angle=%s line_count=%s anchor_score=%.4f", candidate.angle, len(lines), score)
            if get_settings().log_ocr_text:
                logger.info("OCR candidate angle=%s texts=%s", candidate.angle, [line.text for line in lines])
            if score > best_score:
                best_score = score
                best = OcrResult(lines, candidate.angle, True, "OCR successful" if lines else "No text detected")
        logger.info("OCR selected angle=%s line_count=%s available=%s", best.angle, len(best.lines), best.available)
        return best

    def _recognize_candidate(self, ocr: Any, content: bytes) -> list[OcrLine]:
        if hasattr(ocr, "predict"):
            return self._recognize_candidate_v3(ocr, content)
        try:
            image = load_cv2_image(content)
            result = ocr.ocr(image if image is not None else content, cls=True)
        except Exception as exc:
            logger.exception("OCR legacy recognition failed: %s", exc)
            return []
        return self._parse_legacy_result(result)

    def _recognize_candidate_v3(self, ocr: Any, content: bytes) -> list[OcrLine]:
        try:
            with tempfile.NamedTemporaryFile(suffix=".jpg", delete=True) as tmp:
                tmp.write(content)
                tmp.flush()
                result = ocr.predict(input=tmp.name)
        except Exception as exc:
            logger.exception("OCR v3 recognition failed: %s", exc)
            return []
        return self._parse_v3_result(result)

    def _parse_legacy_result(self, result: Any) -> list[OcrLine]:
        lines: list[OcrLine] = []
        for page in result or []:
            for item in page or []:
                try:
                    bbox = [[float(x), float(y)] for x, y in item[0]]
                    text = str(item[1][0]).strip()
                    confidence = float(item[1][1])
                except Exception:
                    continue
                if text:
                    lines.append(OcrLine(text=text, confidence=max(0.0, min(1.0, confidence)), bbox=bbox))
        return lines

    def _parse_v3_result(self, result: Any) -> list[OcrLine]:
        lines: list[OcrLine] = []
        for page in result or []:
            data = self._result_to_dict(page)
            texts = self._first_present(data, "rec_texts", "texts")
            scores = self._first_present(data, "rec_scores", "scores")
            boxes = self._first_present(data, "rec_boxes", "dt_polys", "boxes")
            for index, text in enumerate(texts):
                clean_text = str(text).strip()
                if not clean_text:
                    continue
                score = float(scores[index]) if index < len(scores) else 0.0
                bbox = self._normalize_bbox(boxes[index]) if index < len(boxes) else None
                lines.append(OcrLine(clean_text, max(0.0, min(1.0, score)), bbox))
        return lines

    def _first_present(self, data: dict, *keys: str) -> Any:
        for key in keys:
            value = data.get(key)
            if value is not None:
                return value
        return []

    def _result_to_dict(self, page: Any) -> dict:
        if isinstance(page, dict):
            return page
        if hasattr(page, "json"):
            try:
                data = page.json
                return data if isinstance(data, dict) else {}
            except Exception:
                return {}
        if hasattr(page, "to_dict"):
            try:
                data = page.to_dict()
                return data if isinstance(data, dict) else {}
            except Exception:
                return {}
        return {}

    def _normalize_bbox(self, value: Any) -> list[list[float]] | None:
        try:
            if len(value) == 4 and all(not isinstance(item, (list, tuple)) for item in value):
                x1, y1, x2, y2 = [float(item) for item in value]
                return [[x1, y1], [x2, y1], [x2, y2], [x1, y2]]
            return [[float(x), float(y)] for x, y in value]
        except Exception:
            return None

    def anchor_score(self, lines: list[OcrLine]) -> float:
        text = " ".join(self._strip_accents(line.text).lower() for line in lines)
        anchors = [
            "can cuoc",
            "cong dan",
            "cong hoa",
            "socialist",
            "identity",
            "ho va ten",
            "full name",
            "ngay sinh",
            "date of birth",
            "gioi tinh",
            "sex",
            "quoc tich",
            "nationality",
            "que quan",
            "place of origin",
            "noi thuong tru",
            "place of residence",
            "dac diem",
            "ngay cap",
        ]
        anchor_hits = sum(1 for anchor in anchors if anchor in text)
        digit_bonus = 1 if any(char.isdigit() for char in text) else 0
        confidence = sum(line.confidence for line in lines) / len(lines) if lines else 0.0
        return anchor_hits * 2.0 + digit_bonus + confidence

    @staticmethod
    def _strip_accents(value: str) -> str:
        normalized = unicodedata.normalize("NFD", value)
        return "".join(ch for ch in normalized if unicodedata.category(ch) != "Mn")

    @staticmethod
    @lru_cache(maxsize=1)
    def _get_ocr() -> tuple[Any | None, str]:
        os.environ.setdefault("DISABLE_MODEL_SOURCE_CHECK", "True")
        warnings.filterwarnings("ignore", message="No ccache found.*")
        try:
            from paddleocr import PaddleOCR  # type: ignore
        except Exception as exc:
            logger.exception("PaddleOCR import failed")
            return None, f"PaddleOCR import failed: {exc}"

        try:
            version = metadata.version("paddleocr")
        except Exception:
            version = "unknown"
        logger.info("PaddleOCR import ready version=%s", version)

        constructors = (
            {
                "lang": "vi",
                "use_doc_orientation_classify": False,
                "use_doc_unwarping": False,
                "use_textline_orientation": True,
            },
            {"lang": "vi"},
        )
        last_error = ""
        for kwargs in constructors:
            try:
                logger.info("PaddleOCR init start kwargs=%s", kwargs)
                ocr = PaddleOCR(**kwargs)
                logger.info("PaddleOCR init success kwargs=%s", kwargs)
                return ocr, f"PaddleOCR ready version={version}"
            except Exception as exc:
                logger.warning("PaddleOCR init attempt failed kwargs=%s error=%s", kwargs, exc)
                last_error = str(exc)
        if "No available model hosting platforms detected" in last_error:
            return None, (
                "PaddleOCR init failed: model files are not cached and model host is unreachable. "
                "Run once with network access or pre-download PaddleOCR models before offline use."
            )
        return None, f"PaddleOCR init failed: {last_error}"
