from dataclasses import dataclass
from pathlib import Path
from typing import Any

from app.config import get_settings


@dataclass(frozen=True)
class PoseFrame:
    face_count: int
    yaw_deg: float | None = None
    bbox_ratio: float = 0.0
    in_frame: bool = False
    bbox: tuple[float, float, float, float] | None = None


@dataclass(frozen=True)
class ActivePoseResult:
    passed: bool
    pose_score: float
    valid_face_ratio: float
    multiple_faces_detected: bool
    reason: str
    diagnostics: dict[str, Any]
    face_boxes: tuple[tuple[float, float, float, float], ...] = ()


class ActivePoseValidator:
    def validate(self, frames: tuple[Any, ...]) -> ActivePoseResult:
        unavailable = self._availability_rejection()
        if unavailable:
            return self._result(False, 0.0, 0.0, False, unavailable, {"pose_model_available": False})
        records = self._extract_pose_frames(frames)
        if not records:
            return self._result(False, 0.0, 0.0, False, "no_pose_frames", {"pose_model_available": True})
        return self.score(records)

    def score(self, records: list[PoseFrame]) -> ActivePoseResult:
        settings = get_settings()
        total = len(records)
        multiple_faces = any(frame.face_count > 1 for frame in records)
        usable = [frame for frame in records if self._is_usable(frame)]
        face_boxes = tuple(frame.bbox for frame in usable if frame.bbox is not None)
        valid_face_ratio = len(usable) / total if total else 0.0
        segment_scores = self._segment_scores(records)
        pose_score = sum(segment_scores) / len(segment_scores) if segment_scores else 0.0
        sequence_passed = bool(segment_scores) and all(score >= 0.5 for score in segment_scores)
        yaws = [float(frame.yaw_deg) for frame in usable if frame.yaw_deg is not None]

        reason = "ok"
        if multiple_faces:
            reason = "multiple_faces_detected"
        elif valid_face_ratio < settings.liveness_min_face_ratio:
            reason = "valid_face_ratio_too_low"
        elif not sequence_passed:
            reason = "pose_sequence_failed"

        diagnostics = {
            "pose_score": round(pose_score, 4),
            "valid_face_ratio": round(valid_face_ratio, 4),
            "segment_scores": [round(score, 4) for score in segment_scores],
            "sequence_passed": sequence_passed,
            "yaw_min": round(min(yaws), 3) if yaws else None,
            "yaw_max": round(max(yaws), 3) if yaws else None,
            "pose_frame_count": total,
        }
        passed = reason == "ok"
        return self._result(passed, pose_score, valid_face_ratio, multiple_faces, reason, diagnostics, face_boxes)

    def _extract_pose_frames(self, frames: tuple[Any, ...]) -> list[PoseFrame]:
        settings = get_settings()
        model_path = Path(settings.liveness_mediapipe_model_path)

        try:
            import cv2  # type: ignore
            import mediapipe as mp  # type: ignore
            from mediapipe.tasks import python  # type: ignore
            from mediapipe.tasks.python import vision  # type: ignore
        except Exception:
            return []

        try:
            options = vision.FaceLandmarkerOptions(
                base_options=python.BaseOptions(model_asset_path=str(model_path)),
                running_mode=vision.RunningMode.VIDEO,
                num_faces=2,
            )
            records: list[PoseFrame] = []
            with vision.FaceLandmarker.create_from_options(options) as detector:
                for index, frame in enumerate(frames):
                    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
                    result = detector.detect_for_video(image, int(index * 1000 / settings.liveness_sample_fps))
                    records.append(self._to_pose_frame(result))
            return records
        except Exception:
            return []

    def _availability_rejection(self) -> str | None:
        settings = get_settings()
        if not settings.enable_mediapipe:
            return "mediapipe_disabled"
        if not settings.liveness_mediapipe_model_path:
            return "mediapipe_model_not_configured"
        if not Path(settings.liveness_mediapipe_model_path).exists():
            return "mediapipe_model_not_found"
        try:
            import mediapipe  # noqa: F401  # type: ignore
            from mediapipe.tasks import python  # noqa: F401  # type: ignore
            from mediapipe.tasks.python import vision  # noqa: F401  # type: ignore
        except Exception:
            return "mediapipe_unavailable"
        return None

    def _to_pose_frame(self, result: Any) -> PoseFrame:
        landmarks = getattr(result, "face_landmarks", []) or []
        face_count = len(landmarks)
        if face_count != 1:
            return PoseFrame(face_count=face_count)
        points = landmarks[0]
        xs = [float(point.x) for point in points]
        ys = [float(point.y) for point in points]
        width = max(xs) - min(xs)
        height = max(ys) - min(ys)
        in_frame = min(xs) >= 0.02 and max(xs) <= 0.98 and min(ys) >= 0.02 and max(ys) <= 0.98
        return PoseFrame(
            face_count=1,
            yaw_deg=self._estimate_yaw(points),
            bbox_ratio=max(0.0, width * height),
            in_frame=in_frame,
            bbox=(max(0.0, min(xs)), max(0.0, min(ys)), min(1.0, max(xs)), min(1.0, max(ys))),
        )

    def _estimate_yaw(self, points: Any) -> float:
        nose_x = float(points[1].x)
        left_x = float(points[234].x)
        right_x = float(points[454].x)
        center_x = (left_x + right_x) / 2.0
        half_width = max(0.001, (right_x - left_x) / 2.0)
        return max(-45.0, min(45.0, ((nose_x - center_x) / half_width) * 30.0))

    def _segment_scores(self, records: list[PoseFrame]) -> list[float]:
        if len(records) < 4:
            return []
        indexes = self._segment_ranges(len(records))
        matchers = [self._is_center, self._is_left, self._is_right, self._is_center]
        return [self._segment_score(records[start:end], matchers[index]) for index, (start, end) in enumerate(indexes)]

    def _segment_ranges(self, total: int) -> list[tuple[int, int]]:
        return [(round(i * total / 4), round((i + 1) * total / 4)) for i in range(4)]

    def _segment_score(self, segment: list[PoseFrame], matcher) -> float:
        if not segment:
            return 0.0
        return sum(1 for frame in segment if self._is_usable(frame) and matcher(frame)) / len(segment)

    def _is_usable(self, frame: PoseFrame) -> bool:
        return frame.face_count == 1 and frame.yaw_deg is not None and frame.bbox_ratio > 0.0 and frame.in_frame

    def _is_center(self, frame: PoseFrame) -> bool:
        return abs(float(frame.yaw_deg or 0.0)) <= get_settings().liveness_center_yaw_deg

    def _is_left(self, frame: PoseFrame) -> bool:
        return float(frame.yaw_deg or 0.0) <= -get_settings().liveness_turn_yaw_deg

    def _is_right(self, frame: PoseFrame) -> bool:
        return float(frame.yaw_deg or 0.0) >= get_settings().liveness_turn_yaw_deg

    def _result(
        self,
        passed: bool,
        pose_score: float,
        valid_face_ratio: float,
        multiple_faces: bool,
        reason: str,
        diagnostics: dict[str, Any],
        face_boxes: tuple[tuple[float, float, float, float], ...] = (),
    ) -> ActivePoseResult:
        return ActivePoseResult(
            passed=passed,
            pose_score=round(max(0.0, min(1.0, pose_score)), 4),
            valid_face_ratio=round(max(0.0, min(1.0, valid_face_ratio)), 4),
            multiple_faces_detected=multiple_faces,
            reason=reason,
            diagnostics=diagnostics,
            face_boxes=face_boxes,
        )
