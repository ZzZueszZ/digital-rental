from typing import Any

from app.config import get_settings


def failure_stage(reason: str) -> str:
    if reason in {"no_video", "video_too_large", "unsupported_extension", "invalid_video_signature"}:
        return "input_validation"
    if reason in {
        "video_unreadable",
        "invalid_video_metadata",
        "video_too_short",
        "video_too_long",
        "fps_too_low",
        "resolution_too_low",
        "no_sampled_frames",
    } or reason.startswith("opencv_unavailable"):
        return "video_sampling"
    if reason.startswith("mediapipe") or reason in {
        "no_pose_frames",
        "multiple_faces_detected",
        "valid_face_ratio_too_low",
        "pose_sequence_failed",
    }:
        return "active_pose"
    if reason.startswith("antispoof") or reason in {"onnxruntime_unavailable", "spoof_detected"}:
        return "passive_antispoof"
    return "passed"


def base_diagnostics(reason: str) -> dict[str, Any]:
    settings = get_settings()
    return {
        "reason": reason,
        "failure_stage": failure_stage(reason),
        "thresholds": {
            "liveness_threshold": settings.liveness_threshold,
            "min_duration_sec": settings.liveness_min_duration_sec,
            "max_duration_sec": settings.liveness_max_duration_sec,
            "min_fps": settings.liveness_min_fps,
            "min_width": settings.liveness_min_width,
            "min_height": settings.liveness_min_height,
            "min_face_ratio": settings.liveness_min_face_ratio,
            "antispoof_threshold": settings.liveness_antispoof_threshold,
        },
    }
