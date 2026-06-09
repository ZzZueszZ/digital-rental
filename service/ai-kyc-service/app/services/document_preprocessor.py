from dataclasses import dataclass
import logging
from typing import Any

import numpy as np

from app.config import get_settings
from app.services.quality_service import QualityService
from app.utils.image_io import cv2_to_jpeg_bytes, load_cv2_image, rotate_cv2_image


logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class ImageCandidate:
    angle: int
    content: bytes


@dataclass(frozen=True)
class PreprocessResult:
    valid: bool
    candidates: list[ImageCandidate]
    quality: dict
    document_detected: bool
    document_confidence: float
    message: str


class DocumentPreprocessor:
    def __init__(self) -> None:
        self.quality_service = QualityService()

    def preprocess(self, content: bytes) -> PreprocessResult:
        quality = self.quality_service.assess_image(content)
        logger.info("OCR preprocess quality=%s", quality)
        if not quality["valid"]:
            logger.warning("OCR preprocess rejected invalid image")
            return PreprocessResult(False, [], quality, False, 0.0, "Invalid image")
        if quality["too_small"]:
            logger.warning("OCR preprocess rejected small image width=%s height=%s", quality["width"], quality["height"])
            return PreprocessResult(False, [], quality, False, 0.0, "Image is too small")

        cv_image = load_cv2_image(content)
        if cv_image is None:
            logger.warning("OCR preprocess OpenCV decode unavailable")
            return PreprocessResult(
                True,
                [ImageCandidate(0, content)],
                {**quality, "document_detected": False, "document_confidence": 0.0},
                False,
                0.0,
                "OpenCV decode unavailable; using original image",
            )

        cropped, document_detected, document_confidence = self._crop_document(cv_image)
        candidates = self._rotation_candidates(cropped)
        logger.info(
            "OCR preprocess document_detected=%s document_confidence=%.4f candidates=%s",
            document_detected,
            document_confidence,
            len(candidates),
        )
        metadata = {
            **quality,
            "document_detected": document_detected,
            "document_confidence": round(document_confidence, 4),
        }
        return PreprocessResult(
            True,
            candidates,
            metadata,
            document_detected,
            document_confidence,
            "Document detected" if document_detected else "Document contour not found; using original image",
        )

    def _crop_document(self, image: Any) -> tuple[Any, bool, float]:
        try:
            import cv2  # type: ignore
        except Exception:
            return image, False, 0.0

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contours:
            logger.warning("OCR preprocess contour search found no contours")
            return image, False, 0.0

        image_area = float(image.shape[0] * image.shape[1])
        settings = get_settings()
        for rank, contour in enumerate(sorted(contours, key=cv2.contourArea, reverse=True)[:8], start=1):
            area = float(cv2.contourArea(contour))
            area_ratio = area / image_area if image_area else 0.0
            if area_ratio < settings.ocr_min_document_area_ratio:
                logger.info("OCR contour rejected rank=%s reason=small_area area_ratio=%.4f", rank, area_ratio)
                continue
            perimeter = cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, 0.03 * perimeter, True)
            if len(approx) != 4:
                logger.info("OCR contour rejected rank=%s reason=not_quadrilateral area_ratio=%.4f vertices=%s", rank, area_ratio, len(approx))
                continue
            points = approx.reshape(4, 2).astype("float32")
            warped = self._four_point_transform(image, points)
            if warped is None:
                logger.info("OCR contour rejected rank=%s reason=warp_failed area_ratio=%.4f", rank, area_ratio)
                continue
            logger.info("OCR contour accepted rank=%s area_ratio=%.4f", rank, area_ratio)
            return warped, True, min(1.0, area_ratio)
        logger.warning("OCR preprocess contour search found no acceptable card contour total_contours=%s", len(contours))
        return image, False, 0.0

    def _four_point_transform(self, image: Any, points: np.ndarray) -> Any | None:
        try:
            import cv2  # type: ignore
        except Exception:
            return None

        rect = self._order_points(points)
        top_left, top_right, bottom_right, bottom_left = rect
        width_a = np.linalg.norm(bottom_right - bottom_left)
        width_b = np.linalg.norm(top_right - top_left)
        height_a = np.linalg.norm(top_right - bottom_right)
        height_b = np.linalg.norm(top_left - bottom_left)
        max_width = int(max(width_a, width_b))
        max_height = int(max(height_a, height_b))
        if max_width < 100 or max_height < 60:
            return None
        destination = np.array(
            [[0, 0], [max_width - 1, 0], [max_width - 1, max_height - 1], [0, max_height - 1]],
            dtype="float32",
        )
        matrix = cv2.getPerspectiveTransform(rect, destination)
        return cv2.warpPerspective(image, matrix, (max_width, max_height))

    def _order_points(self, points: np.ndarray) -> np.ndarray:
        rect = np.zeros((4, 2), dtype="float32")
        sums = points.sum(axis=1)
        diffs = np.diff(points, axis=1)
        rect[0] = points[np.argmin(sums)]
        rect[2] = points[np.argmax(sums)]
        rect[1] = points[np.argmin(diffs)]
        rect[3] = points[np.argmax(diffs)]
        return rect

    def _rotation_candidates(self, image: Any) -> list[ImageCandidate]:
        candidates: list[ImageCandidate] = []
        for angle in (0, 90, 180, 270):
            rotated = rotate_cv2_image(image, angle)
            candidates.append(ImageCandidate(angle, cv2_to_jpeg_bytes(rotated)))
        return candidates
