from io import BytesIO
from typing import Any

import numpy as np
from PIL import Image, ImageStat


def load_pil_image(content: bytes) -> Image.Image:
    return Image.open(BytesIO(content)).convert("RGB")


def load_cv2_image(content: bytes) -> Any | None:
    try:
        import cv2  # type: ignore
    except Exception:
        return None
    arr = np.frombuffer(content, dtype=np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)


def cv2_to_jpeg_bytes(image: Any) -> bytes:
    try:
        import cv2  # type: ignore
    except Exception as exc:
        raise RuntimeError("OpenCV is not available") from exc
    ok, buffer = cv2.imencode(".jpg", image)
    if not ok:
        raise ValueError("Could not encode image")
    return buffer.tobytes()


def rotate_cv2_image(image: Any, angle: int) -> Any:
    if angle == 0:
        return image
    try:
        import cv2  # type: ignore
    except Exception as exc:
        raise RuntimeError("OpenCV is not available") from exc
    if angle == 90:
        return cv2.rotate(image, cv2.ROTATE_90_CLOCKWISE)
    if angle == 180:
        return cv2.rotate(image, cv2.ROTATE_180)
    if angle == 270:
        return cv2.rotate(image, cv2.ROTATE_90_COUNTERCLOCKWISE)
    raise ValueError(f"Unsupported rotation angle: {angle}")


def image_quality(content: bytes) -> dict[str, float | int | bool]:
    try:
        image = load_pil_image(content)
    except Exception:
        return {"valid": False, "width": 0, "height": 0, "brightness": 0.0, "blur": 0.0}

    grayscale = image.convert("L")
    stat = ImageStat.Stat(grayscale)
    brightness = float(stat.mean[0])
    blur = 0.0
    cv_image = load_cv2_image(content)
    if cv_image is not None:
        try:
            import cv2  # type: ignore

            gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
            blur = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        except Exception:
            blur = 0.0

    width, height = image.size
    return {
        "valid": True,
        "width": width,
        "height": height,
        "brightness": brightness,
        "blur": blur,
    }
