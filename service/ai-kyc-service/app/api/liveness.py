from fastapi import APIRouter, Depends, File, UploadFile

from app.api.dependencies import require_api_key
from app.services.liveness_service import LivenessService

router = APIRouter()


@router.post("/dmp/liveness/v3")
async def verify_liveness(
    video: UploadFile = File(...),
    cmnd: UploadFile | None = File(default=None),
    _: None = Depends(require_api_key),
) -> dict:
    video_content = await video.read()
    cmnd_content = await cmnd.read() if cmnd else None
    return LivenessService().verify(video_content, video.filename or "video", cmnd_content)
