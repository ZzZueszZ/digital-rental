# LensHub AI KYC Service

## Documentation Maintenance

**Last Updated:** 2026-06-29
**Document Version:** 2.0
**Maintained By:** Development Team

`service/ai-kyc-service` is an optional self-hosted FastAPI provider for local and experimental KYC work. It exposes FPT-compatible OCR, face match, and liveness endpoints so the Java backend can switch providers by changing environment variables.

## Stack

- Python
- FastAPI and Uvicorn
- PaddleOCR for CCCD OCR
- InsightFace and ONNX Runtime for face match
- OpenCV, MediaPipe, and optional ONNX anti-spoof for liveness

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/vision/idr/vnm/` | CCCD OCR. Header `api-key`; form-data field `image`. |
| `POST` | `/dmp/checkface/v1` | Face match. Header `api_key`; form-data field `file[]` with two images. |
| `POST` | `/dmp/liveness/v3` | Liveness video. Header `api-key`; form-data field `video`; optional `cmnd`. |
| `GET` | `/health` | Health check. |

## Prerequisites

- Python compatible with dependencies in `requirements.txt`
- `pip`
- Docker Desktop if using Compose
- Network access for first-time PaddleOCR model download, or pre-populated model cache

## Local Setup with venv

From this directory:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

If PowerShell blocks activation:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
.\.venv\Scripts\Activate.ps1
```

## Run

```powershell
$env:KYC_AI_API_KEY="local-dev-key"
$env:KYC_AI_FACE_MATCH_THRESHOLD="80"
$env:KYC_AI_LOG_LEVEL="INFO"
$env:KYC_AI_LOG_OCR_TEXT="true"
$env:DISABLE_MODEL_SOURCE_CHECK="True"

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Health check:

```powershell
curl.exe http://localhost:8000/health
```

## Run with Docker

```powershell
docker compose up --build
```

Docker is useful for packaging checks. For model tuning, local venv usually gives faster feedback.

## Configuration

The service reads `KYC_AI_*` variables. Important settings:

| Variable | Default | Purpose |
| --- | --- | --- |
| `KYC_AI_API_KEY` | `local-dev-key` | Expected request API key. |
| `KYC_AI_FACE_MATCH_THRESHOLD` | `80.0` | Face match pass threshold. |
| `KYC_AI_LIVENESS_THRESHOLD` | `0.80` | Liveness pass threshold. |
| `KYC_AI_MAX_UPLOAD_MB` | `10` | Upload size limit. |
| `KYC_AI_ENABLE_PADDLE_OCR` | `true` | Enables OCR engine. |
| `KYC_AI_ENABLE_MEDIAPIPE` | `true` | Enables active-pose liveness. |
| `KYC_AI_ENABLE_ONNX_ANTISPOOF` | `true` | Enables passive anti-spoof. |
| `KYC_AI_LIVENESS_MEDIAPIPE_MODEL_PATH` | empty | Path to Face Landmarker `.task` model. |
| `KYC_AI_LIVENESS_ANTISPOOF_MODEL_PATH` | empty | Path to anti-spoof ONNX model. |

See `app/config.py` for the full list.

## PaddleOCR Warmup

First OCR run may need to download models. Warm up once with network access:

```powershell
$env:DISABLE_MODEL_SOURCE_CHECK="True"
python -c "from paddleocr import PaddleOCR; PaddleOCR(lang='vi', use_doc_orientation_classify=False, use_doc_unwarping=False, use_textline_orientation=True)"
```

If the machine is offline, copy a known-good PaddleOCR/PaddleX cache from another machine.

## Face Match Notes

Face match uses InsightFace and ONNX Runtime CPU. If InsightFace is unavailable, the endpoint fails closed with diagnostics instead of returning a fake match.

Example request:

```powershell
curl.exe -X POST http://localhost:8000/dmp/checkface/v1 `
  -H "api_key: local-dev-key" `
  -F "file[]=@.\samples\id-image.jpg" `
  -F "file[]=@.\samples\selfie.jpg"
```

Common diagnostics:

| Reason | Meaning |
| --- | --- |
| `insightface_unavailable` | InsightFace package/model unavailable. |
| `exactly_one_face_required` | Image has zero or multiple faces. |
| `invalid_image_quality` | Image unreadable or too low quality. |

## OCR Test

```powershell
curl.exe -X POST http://localhost:8000/vision/idr/vnm/ `
  -H "api-key: local-dev-key" `
  -F "image=@.\samples\cccd-front.jpg"
```

If response diagnostics say OCR is unavailable, check PaddleOCR install and model cache.

## Liveness Test

Use a real video file. Renamed text bytes or corrupted videos should fail closed.

```powershell
curl.exe -X POST http://localhost:8000/dmp/liveness/v3 `
  -H "api-key: local-dev-key" `
  -F "video=@.\samples\liveness.webm"
```

Active-pose liveness needs a local MediaPipe Face Landmarker model:

```env
KYC_AI_LIVENESS_MEDIAPIPE_MODEL_PATH=.\models\face_landmarker.task
```

Passive anti-spoof uses ONNX Runtime CPU when enabled:

```env
KYC_AI_LIVENESS_ANTISPOOF_MODEL_PATH=.\models\antispoof.onnx
KYC_AI_LIVENESS_ANTISPOOF_THRESHOLD=0.75
```

Diagnostics are returned outside `data` so the Java parser can keep the same contract. Useful fields include `reason`, `failure_stage`, `thresholds`, and `score_components`.

## Test Data

Use `testdata/liveness/` for local-only videos. Real videos and images are ignored by git.

Recommended tuning set:

- 10 pass videos
- 3 wrong-order videos
- 3 no-face videos
- 3 multi-face videos
- 5 screen or paper spoof attempts
- 3 short videos

Record tuning notes under `plans/2026-06-10-ai-kyc-liveness-phase-3/reports/`.

## Backend Integration

In `service/lenshub/.env`, point the backend to this service:

```env
APP_KYC_PROVIDER=fpt
FPT_KYC_API_KEY=local-dev-key
FPT_KYC_IDR_URL=http://localhost:8000/vision/idr/vnm/
FPT_KYC_FACEMATCH_URL=http://localhost:8000/dmp/checkface/v1
FPT_KYC_LIVENESS_URL=http://localhost:8000/dmp/liveness/v3
```

## Tests

```powershell
.\.venv\Scripts\Activate.ps1
python -m pytest
```

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `No available model hosting platforms detected` | Run PaddleOCR warmup with network access or copy model cache. |
| `Unknown argument: show_log` | Restart Uvicorn to load current code; current service no longer passes `show_log`. |
| `No module named 'insightface'` | Activate venv and run `pip install -r requirements.txt`. |
| Liveness cannot read `.webm` | Use a real browser/video file, not fake bytes with a video extension. |
| Active pose always unavailable | Set `KYC_AI_LIVENESS_MEDIAPIPE_MODEL_PATH` to a local `.task` model. |
| Anti-spoof unavailable | Set `KYC_AI_LIVENESS_ANTISPOOF_MODEL_PATH` or disable ONNX anti-spoof for local metadata-only checks. |
