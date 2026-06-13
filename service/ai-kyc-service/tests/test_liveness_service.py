from pathlib import Path

import pytest

from app.services.liveness_pose import ActivePoseValidator, PoseFrame
from app.services.liveness_antispoof import AntiSpoofValidator
from app.services import liveness_service
from app.services.liveness_service import LivenessService, VideoMetadata


def test_rejects_unsupported_extension() -> None:
    body = LivenessService().verify(b"not-video", "liveness.txt")

    assert body["data"]["passed"] is False
    assert body["diagnostics"]["reason"] == "unsupported_extension"
    assert body["diagnostics"]["failure_stage"] == "input_validation"
    assert "thresholds" in body["diagnostics"]


def test_rejects_fake_webm_signature() -> None:
    body = LivenessService().verify(b"fake-video-bytes", "liveness.webm")

    assert body["data"]["passed"] is False
    assert body["diagnostics"]["reason"] == "invalid_video_signature"
    assert set(body["data"]) == {"score", "passed", "spoof_detected", "multiple_faces_detected"}


def test_rejects_video_over_size_limit() -> None:
    body = LivenessService().verify(b"x" * (11 * 1024 * 1024), "liveness.webm")

    assert body["data"]["passed"] is False
    assert body["diagnostics"]["reason"] == "video_too_large"
    assert body["diagnostics"]["max_bytes"] == 10 * 1024 * 1024


def test_metadata_rejects_short_video() -> None:
    service = LivenessService()
    metadata = VideoMetadata(duration_sec=3.9, fps=25.0, width=640, height=480, frame_count=98)

    assert service._metadata_rejection(metadata) == "video_too_short"


def test_metadata_rejects_long_video() -> None:
    service = LivenessService()
    metadata = VideoMetadata(duration_sec=8.1, fps=25.0, width=640, height=480, frame_count=203)

    assert service._metadata_rejection(metadata) == "video_too_long"


def test_metadata_rejects_low_fps() -> None:
    service = LivenessService()
    metadata = VideoMetadata(duration_sec=5.0, fps=19.9, width=640, height=480, frame_count=100)

    assert service._metadata_rejection(metadata) == "fps_too_low"


def test_metadata_rejects_low_resolution() -> None:
    service = LivenessService()
    metadata = VideoMetadata(duration_sec=5.0, fps=25.0, width=639, height=480, frame_count=125)

    assert service._metadata_rejection(metadata) == "resolution_too_low"


def test_metadata_accepts_required_bounds() -> None:
    service = LivenessService()
    metadata = VideoMetadata(duration_sec=4.0, fps=20.0, width=640, height=480, frame_count=80)

    assert service._metadata_rejection(metadata) is None


def test_valid_video_samples_frames_and_fails_closed(tmp_path: Path) -> None:
    cv2 = pytest.importorskip("cv2")
    import numpy as np

    video_path = tmp_path / "valid.avi"
    writer = cv2.VideoWriter(
        str(video_path),
        cv2.VideoWriter_fourcc(*"MJPG"),
        25.0,
        (640, 480),
    )
    for index in range(125):
        frame = np.full((480, 640, 3), index % 255, dtype=np.uint8)
        writer.write(frame)
    writer.release()

    body = LivenessService().verify(video_path.read_bytes(), "valid.avi")

    assert body["data"] == {
        "score": 0.0,
        "passed": False,
        "spoof_detected": True,
        "multiple_faces_detected": False,
    }
    assert body["diagnostics"]["reason"] == "mediapipe_model_not_configured"
    assert body["diagnostics"]["failure_stage"] == "active_pose"
    assert body["diagnostics"]["duration_sec"] == 5.0
    assert body["diagnostics"]["fps"] == 25.0
    assert body["diagnostics"]["width"] == 640
    assert body["diagnostics"]["height"] == 480
    assert body["diagnostics"]["sampled_frames"] == 12


def _pose(face_count: int = 1, yaw: float | None = 0.0, in_frame: bool = True) -> PoseFrame:
    return PoseFrame(face_count=face_count, yaw_deg=yaw, bbox_ratio=0.15, in_frame=in_frame)


def test_active_pose_passes_center_left_right_center() -> None:
    records = [
        *[_pose(yaw=0.0) for _ in range(3)],
        *[_pose(yaw=-24.0) for _ in range(3)],
        *[_pose(yaw=24.0) for _ in range(3)],
        *[_pose(yaw=2.0) for _ in range(3)],
    ]

    result = ActivePoseValidator().score(records)

    assert result.passed is True
    assert result.pose_score == 1.0
    assert result.valid_face_ratio == 1.0
    assert result.reason == "ok"
    assert result.diagnostics["segment_scores"] == [1.0, 1.0, 1.0, 1.0]


def test_active_pose_rejects_wrong_order() -> None:
    records = [
        *[_pose(yaw=0.0) for _ in range(3)],
        *[_pose(yaw=24.0) for _ in range(3)],
        *[_pose(yaw=-24.0) for _ in range(3)],
        *[_pose(yaw=2.0) for _ in range(3)],
    ]

    result = ActivePoseValidator().score(records)

    assert result.passed is False
    assert result.reason == "pose_sequence_failed"


def test_active_pose_rejects_multiple_faces() -> None:
    records = [
        *[_pose(yaw=0.0) for _ in range(3)],
        _pose(face_count=2, yaw=None),
        *[_pose(yaw=-24.0) for _ in range(2)],
        *[_pose(yaw=24.0) for _ in range(3)],
        *[_pose(yaw=2.0) for _ in range(3)],
    ]

    result = ActivePoseValidator().score(records)

    assert result.passed is False
    assert result.multiple_faces_detected is True
    assert result.reason == "multiple_faces_detected"


def test_active_pose_rejects_low_valid_face_ratio() -> None:
    records = [
        *[_pose(yaw=0.0) for _ in range(3)],
        *[_pose(yaw=-24.0) for _ in range(2)],
        _pose(face_count=0, yaw=None),
        *[_pose(face_count=0, yaw=None) for _ in range(3)],
        *[_pose(yaw=2.0) for _ in range(3)],
    ]

    result = ActivePoseValidator().score(records)

    assert result.passed is False
    assert result.reason == "valid_face_ratio_too_low"
    assert result.valid_face_ratio < 0.80


def test_active_pose_rejects_face_out_of_frame() -> None:
    records = [
        *[_pose(yaw=0.0) for _ in range(3)],
        *[_pose(yaw=-24.0, in_frame=False) for _ in range(3)],
        *[_pose(yaw=24.0) for _ in range(3)],
        *[_pose(yaw=2.0) for _ in range(3)],
    ]

    result = ActivePoseValidator().score(records)

    assert result.passed is False
    assert result.reason in {"valid_face_ratio_too_low", "pose_sequence_failed"}


def test_antispoof_missing_model_fails_closed() -> None:
    result = AntiSpoofValidator().validate((), ())

    assert result.spoof_detected is True
    assert result.score == 0.0
    assert result.reason == "antispoof_model_not_configured"


def test_antispoof_aggregates_percentile_25_live_scores() -> None:
    cv2 = pytest.importorskip("cv2")
    import numpy as np

    class FakeInput:
        name = "input"

    class FakeSession:
        def __init__(self) -> None:
            self.scores = [0.90, 0.80, 0.40, 0.70]

        def get_inputs(self):
            return [FakeInput()]

        def run(self, _outputs, _feeds):
            return [np.array([[self.scores.pop(0)]], dtype=np.float32)]

    class FakeValidator(AntiSpoofValidator):
        def _availability_rejection(self):
            return None

        def _create_session(self):
            return FakeSession()

    frames = tuple(np.full((120, 160, 3), 128, dtype=np.uint8) for _ in range(4))
    boxes = tuple((0.25, 0.20, 0.75, 0.80) for _ in range(4))

    result = FakeValidator().validate(frames, boxes)

    assert result.score == 0.625
    assert result.spoof_detected is True
    assert result.reason == "spoof_detected"
    assert result.diagnostics["antispoof_frame_count"] == 4


def test_antispoof_high_scores_pass() -> None:
    import numpy as np

    class FakeInput:
        name = "input"

    class FakeSession:
        def get_inputs(self):
            return [FakeInput()]

        def run(self, _outputs, _feeds):
            return [np.array([[0.95]], dtype=np.float32)]

    class FakeValidator(AntiSpoofValidator):
        def _availability_rejection(self):
            return None

        def _create_session(self):
            return FakeSession()

    frames = tuple(np.full((120, 160, 3), 128, dtype=np.uint8) for _ in range(4))
    boxes = tuple((0.25, 0.20, 0.75, 0.80) for _ in range(4))

    result = FakeValidator().validate(frames, boxes)

    assert result.score == 0.95
    assert result.spoof_detected is False
    assert result.reason == "ok"


def test_liveness_combines_pose_and_antispoof_scores(monkeypatch, tmp_path: Path) -> None:
    cv2 = pytest.importorskip("cv2")
    import numpy as np

    class FakePoseResult:
        passed = True
        pose_score = 0.90
        multiple_faces_detected = False
        reason = "ok"
        diagnostics = {"pose_score": 0.90, "valid_face_ratio": 1.0, "sequence_passed": True}
        face_boxes = ((0.25, 0.20, 0.75, 0.80),)

    class FakePoseValidator:
        def validate(self, _frames):
            return FakePoseResult()

    class FakeAntiSpoofResult:
        score = 0.80
        spoof_detected = False
        reason = "ok"
        diagnostics = {"antispoof_score": 0.80}

    class FakeAntiSpoofValidator:
        def validate(self, _frames, _boxes):
            return FakeAntiSpoofResult()

    monkeypatch.setattr(liveness_service, "ActivePoseValidator", FakePoseValidator)
    monkeypatch.setattr(liveness_service, "AntiSpoofValidator", FakeAntiSpoofValidator)

    video_path = tmp_path / "valid.avi"
    writer = cv2.VideoWriter(str(video_path), cv2.VideoWriter_fourcc(*"MJPG"), 25.0, (640, 480))
    for _ in range(125):
        writer.write(np.full((480, 640, 3), 128, dtype=np.uint8))
    writer.release()

    body = LivenessService().verify(video_path.read_bytes(), "valid.avi")

    assert body["data"]["score"] == 0.86
    assert body["data"]["passed"] is True
    assert body["diagnostics"]["failure_stage"] == "passed"
    assert body["diagnostics"]["score_components"] == {
        "pose_score": 0.90,
        "antispoof_score": 0.80,
        "final_score": 0.86,
    }


def test_liveness_testdata_layout_is_repo_safe() -> None:
    root = Path(__file__).resolve().parents[1] / "testdata" / "liveness"
    expected = {
        "pass",
        "fail_wrong_order",
        "fail_no_face",
        "fail_multiple_faces",
        "fail_spoof_screen",
        "fail_short_video",
    }

    assert {path.name for path in root.iterdir() if path.is_dir()} == expected
    assert (root / ".gitignore").exists()
    for folder in expected:
        assert (root / folder / ".gitkeep").exists()
