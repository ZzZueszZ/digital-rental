from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np

from app.config import get_settings


@dataclass(frozen=True)
class AntiSpoofResult:
    score: float
    spoof_detected: bool
    reason: str
    diagnostics: dict[str, Any]


class AntiSpoofValidator:
    def validate(self, frames: tuple[Any, ...], face_boxes: tuple[tuple[float, float, float, float], ...]) -> AntiSpoofResult:
        if not get_settings().enable_onnx_antispoof:
            return self._result(1.0, False, "antispoof_disabled", {"antispoof_available": False})
        unavailable = self._availability_rejection()
        if unavailable:
            return self._result(0.0, True, unavailable, {"antispoof_available": False})
        if not frames or not face_boxes:
            return self._result(0.0, True, "antispoof_no_face_crops", {"antispoof_available": True})

        try:
            session = self._create_session()
            live_scores = self._predict_live_scores(session, frames, face_boxes)
        except Exception as exc:
            return self._result(0.0, True, "antispoof_inference_failed", {"antispoof_error": str(exc)})

        if not live_scores:
            return self._result(0.0, True, "antispoof_no_scores", {"antispoof_available": True})
        score = float(np.percentile(np.asarray(live_scores, dtype=np.float32), 25))
        spoof = score < get_settings().liveness_antispoof_threshold
        diagnostics = {
            "antispoof_available": True,
            "antispoof_frame_count": len(live_scores),
            "antispoof_scores": [round(float(value), 4) for value in live_scores],
            "antispoof_score": round(score, 4),
        }
        return self._result(score, spoof, "spoof_detected" if spoof else "ok", diagnostics)

    def _availability_rejection(self) -> str | None:
        settings = get_settings()
        if not settings.liveness_antispoof_model_path:
            return "antispoof_model_not_configured"
        if not Path(settings.liveness_antispoof_model_path).exists():
            return "antispoof_model_not_found"
        try:
            import onnxruntime  # noqa: F401  # type: ignore
        except Exception:
            return "onnxruntime_unavailable"
        return None

    def _create_session(self) -> Any:
        import onnxruntime as ort  # type: ignore

        return ort.InferenceSession(get_settings().liveness_antispoof_model_path, providers=["CPUExecutionProvider"])

    def _predict_live_scores(
        self,
        session: Any,
        frames: tuple[Any, ...],
        face_boxes: tuple[tuple[float, float, float, float], ...],
    ) -> list[float]:
        input_name = session.get_inputs()[0].name
        scores: list[float] = []
        limit = min(12, len(frames), len(face_boxes))
        for frame, box in zip(frames[:limit], face_boxes[:limit]):
            tensor = self._preprocess(frame, box)
            output = session.run(None, {input_name: tensor})[0]
            scores.append(self._live_score(output))
        return scores

    def _preprocess(self, frame: Any, box: tuple[float, float, float, float]) -> np.ndarray:
        import cv2  # type: ignore

        settings = get_settings()
        height, width = frame.shape[:2]
        left, top, right, bottom = self._expanded_pixel_box(box, width, height)
        crop = frame[top:bottom, left:right]
        if crop.size == 0:
            raise ValueError("empty face crop")
        resized = cv2.resize(crop, (settings.liveness_antispoof_input_width, settings.liveness_antispoof_input_height))
        rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
        return np.transpose(rgb, (2, 0, 1))[None, ...]

    def _expanded_pixel_box(self, box: tuple[float, float, float, float], width: int, height: int) -> tuple[int, int, int, int]:
        ratio = get_settings().liveness_antispoof_expand_ratio
        x1, y1, x2, y2 = box
        bw = x2 - x1
        bh = y2 - y1
        x1 = max(0.0, x1 - bw * ratio)
        y1 = max(0.0, y1 - bh * ratio)
        x2 = min(1.0, x2 + bw * ratio)
        y2 = min(1.0, y2 + bh * ratio)
        return (
            max(0, int(x1 * width)),
            max(0, int(y1 * height)),
            min(width, int(x2 * width)),
            min(height, int(y2 * height)),
        )

    def _live_score(self, output: Any) -> float:
        values = np.asarray(output, dtype=np.float32).reshape(-1)
        if values.size == 1:
            return float(values[0])
        index = min(max(0, get_settings().liveness_antispoof_live_index), values.size - 1)
        exp = np.exp(values - np.max(values))
        probs = exp / np.sum(exp)
        return float(probs[index])

    def _result(self, score: float, spoof: bool, reason: str, diagnostics: dict[str, Any]) -> AntiSpoofResult:
        return AntiSpoofResult(
            score=round(max(0.0, min(1.0, score)), 4),
            spoof_detected=spoof,
            reason=reason,
            diagnostics=diagnostics,
        )
