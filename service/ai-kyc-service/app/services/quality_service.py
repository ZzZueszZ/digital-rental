from app.utils.image_io import image_quality
from app.config import get_settings


class QualityService:
    def assess_image(self, content: bytes) -> dict[str, float | int | bool]:
        quality = image_quality(content)
        if not quality["valid"]:
            return {
                **quality,
                "too_small": True,
                "too_dark": False,
                "too_bright": False,
                "blurry": False,
            }
        settings = get_settings()
        too_small = int(quality["width"]) < settings.ocr_min_width or int(quality["height"]) < settings.ocr_min_height
        too_dark = float(quality["brightness"]) < settings.ocr_min_brightness
        too_bright = float(quality["brightness"]) > settings.ocr_max_brightness
        blurry = 0 < float(quality["blur"]) < settings.ocr_blur_threshold
        return {
            **quality,
            "too_small": too_small,
            "too_dark": too_dark,
            "too_bright": too_bright,
            "blurry": blurry,
        }

    def is_usable_image(self, content: bytes) -> bool:
        quality = self.assess_image(content)
        if not quality["valid"]:
            return False
        return not bool(quality["too_small"])
