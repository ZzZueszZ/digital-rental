from fastapi import APIRouter, Depends, File, UploadFile

from app.api.dependencies import require_api_key
from app.services.face_match_service import FaceMatchService

router = APIRouter()


@router.post("/dmp/checkface/v1")
async def check_face(
    files: list[UploadFile] = File(..., alias="file[]"),
    _: None = Depends(require_api_key),
) -> dict:
    contents = [await file.read() for file in files]
    return FaceMatchService().verify(contents)
