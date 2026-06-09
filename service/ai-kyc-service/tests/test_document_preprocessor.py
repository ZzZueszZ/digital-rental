from io import BytesIO

from PIL import Image, ImageDraw

from app.services.document_preprocessor import DocumentPreprocessor


def jpeg_bytes(image: Image.Image) -> bytes:
    buffer = BytesIO()
    image.save(buffer, format="JPEG")
    return buffer.getvalue()


def test_invalid_image_is_rejected() -> None:
    result = DocumentPreprocessor().preprocess(b"not-an-image")

    assert result.valid is False
    assert result.quality["valid"] is False


def test_small_image_is_rejected() -> None:
    image = Image.new("RGB", (80, 80), "white")

    result = DocumentPreprocessor().preprocess(jpeg_bytes(image))

    assert result.valid is False
    assert result.quality["too_small"] is True


def test_rectangle_document_generates_rotation_candidates() -> None:
    image = Image.new("RGB", (800, 500), "black")
    draw = ImageDraw.Draw(image)
    draw.polygon([(90, 80), (720, 70), (735, 420), (80, 430)], fill="white")

    result = DocumentPreprocessor().preprocess(jpeg_bytes(image))

    assert result.valid is True
    assert {candidate.angle for candidate in result.candidates} == {0, 90, 180, 270}
    assert len(result.candidates) == 4
