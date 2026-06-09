# LensHub AI KYC Service

Self-hosted CPU-only FastAPI service that exposes FPT-compatible KYC endpoints for LensHub.

## Endpoints

- `POST /vision/idr/vnm/` with header `api-key`, multipart `image`
- `POST /dmp/checkface/v1` with header `api_key`, multipart `file[]` twice
- `POST /dmp/liveness/v3` with header `api-key`, multipart `video` and optional `cmnd`
- `GET /health`

## LensHub env

```env
APP_KYC_PROVIDER=fpt
FPT_KYC_API_KEY=local-dev-key
FPT_KYC_IDR_URL=http://localhost:8000/vision/idr/vnm/
FPT_KYC_FACEMATCH_URL=http://localhost:8000/dmp/checkface/v1
FPT_KYC_LIVENESS_URL=http://localhost:8000/dmp/liveness/v3
```

## Run locally

```powershell
cd service/ai-kyc-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
uvicorn app.main:app --reload --port 8000
```

## Run tests

```powershell
cd service/ai-kyc-service
pytest
```

## Notes

The service is contract-compatible first. Heavy model packages are optional and imported lazily. Without them, OCR returns low-confidence extraction, face match uses a perceptual fallback, and liveness fails closed when video frames cannot be analyzed.

Current liveness checks combine one-face sampling, frame motion, and an approximate `center -> left -> right -> center` sequence score based on face position. Replace that approximation with MediaPipe yaw/head-pose thresholds once representative videos are available.

## OCR pipeline

The CCCD OCR endpoint runs a layered CPU-only pipeline:

1. Validate image quality: size, blur, brightness.
2. Detect card-like contour with OpenCV and perspective-crop when reliable.
3. Generate 0/90/180/270 rotation candidates.
4. Run lazy PaddleOCR `lang="vi"` when installed.
5. Pick best rotation by CCCD anchor score.
6. Classify front/back/unknown.
7. Extract fields with anchor labels plus regex fallback.
8. Normalize dates/gender and return FPT-compatible confidence fields.

`paddleocr` and `paddlepaddle` remain optional. Tests use fake OCR lines and do not download models.
