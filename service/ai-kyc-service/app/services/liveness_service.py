import tempfile
from pathlib import Path

from app.config import get_settings


class LivenessService:
    def verify(self, video_content: bytes, filename: str, cmnd_content: bytes | None = None) -> dict:
        if not video_content:
            return self._response(0.0, False, False, False, "No video uploaded")
        max_bytes = get_settings().max_upload_mb * 1024 * 1024
        if len(video_content) > max_bytes:
            return self._response(0.0, False, False, False, "Video exceeds size limit")

        result = self._analyze_video(video_content, filename)
        return self._response(
            result["score"],
            bool(result["passed"]),
            bool(result["spoof_detected"]),
            bool(result["multiple_faces_detected"]),
            str(result["message"]),
        )

    def _analyze_video(self, video_content: bytes, filename: str) -> dict[str, float | bool | str]:
        suffix = Path(filename).suffix or ".webm"
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=True) as tmp:
            tmp.write(video_content)
            tmp.flush()
            frames = self._sample_frames(tmp.name)

        if not frames:
            return {
                "score": 0.0,
                "passed": False,
                "spoof_detected": True,
                "multiple_faces_detected": False,
                "message": "Video could not be analyzed",
            }

        face_counts = [frame["face_count"] for frame in frames]
        multiple_faces = any(count > 1 for count in face_counts)
        no_face_ratio = sum(1 for count in face_counts if count == 0) / len(face_counts)
        motion_score = self._motion_score(frames)
        pose_score = self._pose_sequence_score(frames)
        score = max(0.0, min(1.0, (1.0 - no_face_ratio) * 0.45 + motion_score * 0.25 + pose_score * 0.30))
        passed = score >= get_settings().liveness_threshold and not multiple_faces
        return {
            "score": round(score, 4),
            "passed": passed,
            "spoof_detected": score < 0.50,
            "multiple_faces_detected": multiple_faces,
            "message": "liveness check successful" if passed else "liveness check failed",
        }

    def _sample_frames(self, video_path: str) -> list[dict[str, float | int]]:
        try:
            import cv2  # type: ignore
        except Exception:
            return []

        capture = cv2.VideoCapture(video_path)
        if not capture.isOpened():
            return []
        total = int(capture.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
        step = max(1, total // 12) if total else 15
        frames: list[dict[str, float | int]] = []
        previous_gray = None
        face_cascade = self._face_cascade(cv2)
        index = 0
        while len(frames) < 12:
            ok, frame = capture.read()
            if not ok:
                break
            if index % step != 0:
                index += 1
                continue
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4) if face_cascade else []
            face_center_x = 0.5
            if len(faces) == 1:
                x, _, w, _ = faces[0]
                face_center_x = float(x + (w / 2)) / float(gray.shape[1])
            motion = 0.0
            if previous_gray is not None:
                motion = float(cv2.absdiff(gray, previous_gray).mean()) / 255.0
            previous_gray = gray
            frames.append({"face_count": len(faces), "motion": motion, "face_center_x": face_center_x})
            index += 1
        capture.release()
        return frames

    def _face_cascade(self, cv2):
        try:
            path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
            return cv2.CascadeClassifier(path)
        except Exception:
            return None

    def _motion_score(self, frames: list[dict[str, float | int]]) -> float:
        if len(frames) < 2:
            return 0.0
        avg_motion = sum(float(frame["motion"]) for frame in frames[1:]) / (len(frames) - 1)
        return max(0.0, min(1.0, avg_motion * 12.0))

    def _pose_sequence_score(self, frames: list[dict[str, float | int]]) -> float:
        """Approximate center-left-right-center until MediaPipe yaw model is enabled."""
        usable = [frame for frame in frames if int(frame["face_count"]) == 1]
        if len(usable) < 4:
            return 0.0
        segment_size = max(1, len(usable) // 4)
        segments = [
            usable[0:segment_size],
            usable[segment_size : segment_size * 2],
            usable[segment_size * 2 : segment_size * 3],
            usable[segment_size * 3 :],
        ]
        centers = [self._avg_center_x(segment) for segment in segments]
        first_center = 1.0 if 0.35 <= centers[0] <= 0.65 else 0.0
        left_turn = 1.0 if centers[1] < centers[0] - 0.04 else 0.0
        right_turn = 1.0 if centers[2] > centers[1] + 0.08 else 0.0
        final_center = 1.0 if abs(centers[3] - centers[0]) <= 0.12 else 0.0
        return (first_center + left_turn + right_turn + final_center) / 4

    def _avg_center_x(self, frames: list[dict[str, float | int]]) -> float:
        if not frames:
            return 0.5
        return sum(float(frame["face_center_x"]) for frame in frames) / len(frames)

    def _response(
        self,
        score: float,
        passed: bool,
        spoof_detected: bool,
        multiple_faces_detected: bool,
        message: str,
    ) -> dict:
        return {
            "code": "200",
            "message": message,
            "data": {
                "score": score,
                "passed": passed,
                "spoof_detected": spoof_detected,
                "multiple_faces_detected": multiple_faces_detected,
            },
        }
