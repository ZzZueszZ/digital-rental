from io import BytesIO

from fastapi.testclient import TestClient
from PIL import Image

from app.main import app


client = TestClient(app)


def image_bytes(color: tuple[int, int, int] = (255, 255, 255)) -> bytes:
    buffer = BytesIO()
    image = Image.new("RGB", (320, 240), color)
    image.save(buffer, format="JPEG")
    return buffer.getvalue()


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_ocr_contract() -> None:
    response = client.post(
        "/vision/idr/vnm/",
        headers={"api-key": "local-dev-key"},
        files={"image": ("front.jpg", image_bytes(), "image/jpeg")},
    )
    assert response.status_code == 200
    body = response.json()
    assert "errorCode" in body
    assert isinstance(body["data"], list)


def test_face_match_contract() -> None:
    files = [
        ("file[]", ("first.jpg", image_bytes((220, 220, 220)), "image/jpeg")),
        ("file[]", ("second.jpg", image_bytes((220, 220, 220)), "image/jpeg")),
    ]
    response = client.post("/dmp/checkface/v1", headers={"api_key": "local-dev-key"}, files=files)
    assert response.status_code == 200
    data = response.json()["data"]
    assert "similarity" in data
    assert "isMatch" in data


def test_liveness_contract() -> None:
    response = client.post(
        "/dmp/liveness/v3",
        headers={"api-key": "local-dev-key"},
        files={
            "video": ("liveness.webm", b"fake-video-bytes", "video/webm"),
            "cmnd": ("front.jpg", image_bytes(), "image/jpeg"),
        },
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert set(data) == {"score", "passed", "spoof_detected", "multiple_faces_detected"}
    assert data["passed"] is False
    assert response.json()["diagnostics"]["reason"] == "invalid_video_signature"


def test_rejects_wrong_api_key() -> None:
    response = client.post(
        "/vision/idr/vnm/",
        headers={"api-key": "wrong"},
        files={"image": ("front.jpg", image_bytes(), "image/jpeg")},
    )
    assert response.status_code == 401
