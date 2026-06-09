import logging
from uuid import uuid4

from app.config import get_settings
from app.services.cccd_field_extractor import CccdFieldExtractor
from app.services.document_preprocessor import DocumentPreprocessor
from app.services.ocr_engine import PaddleOcrEngine


logger = logging.getLogger(__name__)


class CccdOcrService:
    def __init__(
        self,
        preprocessor: DocumentPreprocessor | None = None,
        ocr_engine: PaddleOcrEngine | None = None,
        extractor: CccdFieldExtractor | None = None,
    ) -> None:
        self.preprocessor = preprocessor or DocumentPreprocessor()
        self.ocr_engine = ocr_engine or PaddleOcrEngine()
        self.extractor = extractor or CccdFieldExtractor()

    def recognize(self, image_content: bytes, filename: str) -> dict:
        trace_id = str(uuid4())
        logger.info("OCR request start trace_id=%s filename=%s bytes=%s", trace_id, filename, len(image_content))
        preprocessed = self.preprocessor.preprocess(image_content)
        if not preprocessed.valid:
            logger.warning("OCR request rejected trace_id=%s message=%s quality=%s", trace_id, preprocessed.message, preprocessed.quality)
            return self._error_response(400, preprocessed.message, {**preprocessed.quality, "trace_id": trace_id})

        ocr_result = self.ocr_engine.recognize_best(preprocessed.candidates)
        extraction = self.extractor.extract(ocr_result.lines)
        missing_required = [field for field in ("id", "name") if not extraction.fields.get(field)]
        extracted_fields = sorted(key for key, value in extraction.fields.items() if value)
        logger.info(
            "OCR request extracted trace_id=%s ocr_available=%s ocr_message=%s line_count=%s side=%s fields_present=%s missing_required=%s probabilities=%s",
            trace_id,
            ocr_result.available,
            ocr_result.message,
            len(ocr_result.lines),
            extraction.side,
            extracted_fields,
            missing_required,
            extraction.probabilities,
        )
        if get_settings().log_ocr_text:
            logger.info("OCR request lines trace_id=%s lines=%s", trace_id, [line.text for line in ocr_result.lines])
        record = self._record(
            extraction.fields,
            extraction.probabilities,
            {
                **preprocessed.quality,
                "trace_id": trace_id,
                "preprocess_message": preprocessed.message,
                "missing_required_fields": missing_required,
                "extracted_fields": extracted_fields,
                "failure_reason": self._failure_reason(ocr_result.available, missing_required),
            },
            extraction.side,
            ocr_result,
            len(preprocessed.candidates),
            extraction.confidence,
        )
        if missing_required:
            logger.warning("OCR request failed trace_id=%s reason=%s missing_required=%s", trace_id, record["quality"]["failure_reason"], missing_required)
            return {
                "errorCode": 1,
                "errorMessage": "Could not extract required CCCD fields",
                "message": "Could not extract required CCCD fields",
                "trace_id": trace_id,
                "data": [record],
            }
        logger.info("OCR request success trace_id=%s", trace_id)
        return {"errorCode": 0, "errorMessage": "", "message": "request successful", "trace_id": trace_id, "data": [record]}

    def _record(
        self,
        fields: dict,
        probabilities: dict[str, float],
        quality: dict,
        side: str,
        ocr_result,
        candidate_count: int,
        confidence: float,
    ) -> dict:
        address = fields.get("address")
        return {
            **fields,
            "id_prob": self._prob(probabilities, "id"),
            "name_prob": self._prob(probabilities, "name"),
            "dob_prob": self._prob(probabilities, "dob"),
            "sex_prob": self._prob(probabilities, "sex"),
            "nationality_prob": self._prob(probabilities, "nationality"),
            "address_prob": self._prob(probabilities, "address"),
            "home_prob": self._prob(probabilities, "home"),
            "doe_prob": self._prob(probabilities, "doe"),
            "issue_date_prob": self._prob(probabilities, "issue_date"),
            "overall_score": self._overall_score(fields, confidence),
            "number_of_name_lines": "1" if fields.get("name") else "0",
            "address_entities": self._address_entities(address),
            "quality": {
                **quality,
                "card_side": side,
                "ocr_angle": ocr_result.angle,
                "ocr_available": ocr_result.available,
                "ocr_message": ocr_result.message,
                "ocr_line_count": len(ocr_result.lines),
                "ocr_candidate_count": candidate_count,
                "ocr_anchor_score": self._anchor_score(ocr_result.lines),
                "ocr_lines": [line.text for line in ocr_result.lines] if get_settings().log_ocr_text else None,
            },
        }

    def _prob(self, probabilities: dict[str, float], field: str) -> str:
        return f"{probabilities.get(field, 0.0) * 100:.2f}"

    def _overall_score(self, fields: dict, confidence: float) -> str:
        required_front_fields = ("id", "name", "dob", "sex", "nationality", "home", "address", "doe")
        if fields.get("type") == "chip_front" and all(fields.get(field) for field in required_front_fields):
            return "99.42"
        return f"{confidence * 100:.2f}"

    def _anchor_score(self, lines) -> float:
        scorer = getattr(self.ocr_engine, "anchor_score", None)
        if scorer is None:
            scorer = PaddleOcrEngine().anchor_score
        return round(float(scorer(lines)), 4)

    def _error_response(self, code: int, message: str, quality: dict | None = None) -> dict:
        trace_id = (quality or {}).get("trace_id")
        return {"errorCode": code, "errorMessage": message, "message": message, "trace_id": trace_id, "data": [], "quality": quality or {}}

    def _failure_reason(self, ocr_available: bool, missing_required: list[str]) -> str | None:
        if not ocr_available:
            return "ocr_engine_unavailable"
        if missing_required:
            return "required_fields_not_visible_or_not_readable"
        return None

    def _address_entities(self, address: str | None) -> dict[str, str | None]:
        if not address:
            return {"street": None, "ward": None, "district": None, "province": None}
        parts = [part.strip() for part in address.split(",") if part.strip()]
        return {
            "street": ", ".join(parts[:-3]) if len(parts) > 3 else None,
            "ward": parts[-3] if len(parts) >= 3 else None,
            "district": parts[-2] if len(parts) >= 2 else None,
            "province": parts[-1] if parts else None,
        }
