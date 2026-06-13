from dataclasses import dataclass
import tempfile
from pathlib import Path
from typing import Any

from app.config import get_settings
from app.services.liveness_antispoof import AntiSpoofValidator
from app.services.liveness_diagnostics import base_diagnostics, failure_stage
from app.services.liveness_pose import ActivePoseValidator


@dataclass(frozen=True)
class VideoMetadata:
    duration_sec: float
    fps: float
    width: int
    height: int
    frame_count: int


@dataclass(frozen=True)
class VideoSampleResult:
    valid: bool
    reason: str
    metadata: VideoMetadata | None = None
    frames: tuple[Any, ...] = ()


class LivenessService:
    def verify(self, video_content: bytes, filename: str, cmnd_content: bytes | None = None) -> dict:
        settings = get_settings()
        if not video_content:
            return self._response(0.0, False, True, False, "No video uploaded", base_diagnostics("no_video"))

        max_bytes = settings.max_upload_mb * 1024 * 1024
        if len(video_content) > max_bytes:
            diagnostics = base_diagnostics("video_too_large") | {"size_bytes": len(video_content), "max_bytes": max_bytes}
            return self._response(0.0, False, True, False, "Video exceeds size limit", diagnostics)

        sample = self._sample_video(video_content, filename)
        diagnostics = self._diagnostics(sample)
        if not sample.valid:
            return self._response(0.0, False, True, False, "liveness check failed", diagnostics)

        pose = ActivePoseValidator().validate(sample.frames)
        diagnostics.update(pose.diagnostics)
        antispoof = AntiSpoofValidator().validate(sample.frames, pose.face_boxes) if pose.passed else None
        if antispoof:
            diagnostics.update(antispoof.diagnostics)
            diagnostics["antispoof_reason"] = antispoof.reason
        diagnostics["reason"] = (
            antispoof.reason if pose.reason == "ok" and antispoof and antispoof.reason != "ok" else pose.reason
        )
        antispoof_score = antispoof.score if antispoof else 1.0
        score = round((pose.pose_score * 0.60) + (antispoof_score * 0.40), 4) if antispoof else pose.pose_score
        spoof_detected = antispoof.spoof_detected if antispoof else pose.pose_score < 0.50
        passed = pose.passed and score >= get_settings().liveness_threshold and not spoof_detected
        diagnostics["score_components"] = {
            "pose_score": pose.pose_score,
            "antispoof_score": antispoof.score if antispoof else None,
            "final_score": score,
        }
        diagnostics["failure_stage"] = failure_stage(str(diagnostics["reason"]))
        return self._response(
            score,
            passed,
            spoof_detected,
            pose.multiple_faces_detected,
            "liveness check successful" if passed else "liveness check failed",
            diagnostics,
        )

    def _sample_video(self, video_content: bytes, filename: str) -> VideoSampleResult:
        suffix = Path(filename).suffix.lower()
        if suffix not in {".webm", ".mp4", ".mov", ".avi"}:
            return VideoSampleResult(False, "unsupported_extension")
        if not self._looks_like_video(video_content, suffix):
            return VideoSampleResult(False, "invalid_video_signature")

        temp_path = None
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp.write(video_content)
            tmp.flush()
            temp_path = Path(tmp.name)
        try:
            return self._read_video(str(temp_path))
        finally:
            if temp_path is not None:
                temp_path.unlink(missing_ok=True)

    def _read_video(self, video_path: str) -> VideoSampleResult:
        try:
            import cv2  # type: ignore
        except Exception as exc:
            return VideoSampleResult(False, f"opencv_unavailable: {exc}")

        capture = cv2.VideoCapture(video_path)
        try:
            if not capture.isOpened():
                return VideoSampleResult(False, "video_unreadable")
            metadata = self._metadata(capture, cv2)
            rejection = self._metadata_rejection(metadata)
            if rejection:
                return VideoSampleResult(False, rejection, metadata)
            frames = self._sample_frames(capture, cv2, metadata)
            if not frames:
                return VideoSampleResult(False, "no_sampled_frames", metadata)
            return VideoSampleResult(True, "ok", metadata, tuple(frames))
        finally:
            capture.release()

    def _metadata(self, capture: Any, cv2: Any) -> VideoMetadata:
        fps = float(capture.get(cv2.CAP_PROP_FPS) or 0.0)
        frame_count = int(capture.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
        width = int(capture.get(cv2.CAP_PROP_FRAME_WIDTH) or 0)
        height = int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT) or 0)
        duration = float(frame_count / fps) if fps > 0 and frame_count > 0 else 0.0
        return VideoMetadata(round(duration, 3), round(fps, 3), width, height, frame_count)

    def _metadata_rejection(self, metadata: VideoMetadata) -> str | None:
        settings = get_settings()
        if metadata.frame_count <= 0 or metadata.fps <= 0:
            return "invalid_video_metadata"
        if metadata.duration_sec < settings.liveness_min_duration_sec:
            return "video_too_short"
        if metadata.duration_sec > settings.liveness_max_duration_sec:
            return "video_too_long"
        if metadata.fps < settings.liveness_min_fps:
            return "fps_too_low"
        if metadata.width < settings.liveness_min_width or metadata.height < settings.liveness_min_height:
            return "resolution_too_low"
        return None

    def _sample_frames(self, capture: Any, cv2: Any, metadata: VideoMetadata) -> list[Any]:
        settings = get_settings()
        target_count = min(
            settings.liveness_max_sample_frames,
            max(1, int(metadata.duration_sec * settings.liveness_sample_fps)),
        )
        if target_count == 1:
            indexes = [0]
        else:
            last = max(0, metadata.frame_count - 1)
            indexes = sorted({round(i * last / (target_count - 1)) for i in range(target_count)})

        frames: list[Any] = []
        for index in indexes:
            capture.set(cv2.CAP_PROP_POS_FRAMES, int(index))
            ok, frame = capture.read()
            if ok and frame is not None:
                frames.append(frame)
        return frames

    def _looks_like_video(self, content: bytes, suffix: str) -> bool:
        if suffix == ".webm":
            return content.startswith(bytes.fromhex("1A45DFA3"))
        if suffix in {".mp4", ".mov"}:
            return len(content) > 12 and content[4:8] == b"ftyp"
        if suffix == ".avi":
            return content.startswith(b"RIFF") and content[8:12] == b"AVI "
        return False

    def _diagnostics(self, sample: VideoSampleResult) -> dict[str, Any]:
        diagnostics = base_diagnostics(sample.reason) | {"sampled_frames": len(sample.frames)}
        if sample.metadata:
            diagnostics.update(
                {
                    "duration_sec": sample.metadata.duration_sec,
                    "fps": sample.metadata.fps,
                    "width": sample.metadata.width,
                    "height": sample.metadata.height,
                    "frame_count": sample.metadata.frame_count,
                }
            )
        return diagnostics

    def _response(
        self,
        score: float,
        passed: bool,
        spoof_detected: bool,
        multiple_faces_detected: bool,
        message: str,
        diagnostics: dict[str, Any] | None = None,
    ) -> dict:
        response = {
            "code": "200",
            "message": message,
            "data": {
                "score": score, "passed": passed, "spoof_detected": spoof_detected,
                "multiple_faces_detected": multiple_faces_detected,
            },
        }
        if diagnostics is not None:
            response["diagnostics"] = diagnostics
        return response
