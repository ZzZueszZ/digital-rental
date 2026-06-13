from fastapi import APIRouter, Depends, File, UploadFile

from app.api.dependencies import require_api_key
from app.services.cccd_ocr_service import CccdOcrService

router = APIRouter()


@router.post("/vision/idr/vnm/")
async def recognize_vietnamese_id(
    image: UploadFile = File(...),
    _: None = Depends(require_api_key),
) -> dict:
    content = await image.read()
    return CccdOcrService().recognize(content, image.filename or "image")
