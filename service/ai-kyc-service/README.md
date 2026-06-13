# LensHub AI KYC Service - Hướng Dẫn Chạy Local

Service FastAPI tự host để thay FPT KYC trong lúc dev/test. Ưu tiên chạy bằng Python venv khi test model AI vì nhanh hơn Docker.

## 1. Endpoint

- `POST /vision/idr/vnm/`: OCR CCCD, header `api-key`, form-data `image`.
- `POST /dmp/checkface/v1`: face match, header `api_key`, form-data `file[]` 2 ảnh.
- `POST /dmp/liveness/v3`: liveness, header `api-key`, form-data `video`, optional `cmnd`.
- `GET /health`: kiểm tra service sống.

## 2. Tạo venv

```powershell
cd D:\PERSONAL\hoc-ki-2-nam-4\KLTN\test-project\service\ai-kyc-service

python -m venv .venv
.\.venv\Scripts\Activate.ps1

python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

Nếu PowerShell chặn activate:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
.\.venv\Scripts\Activate.ps1
```

## 3. Cài model face match

Face match dùng InsightFace + ONNX Runtime CPU. Hai package này đã nằm trong `requirements.txt`. Nếu cần cài riêng:

```powershell
pip install -r requirements.txt
```

Trên Windows Python 3.13, `requirements.txt` dùng prebuilt wheel để tránh lỗi:

```text
Microsoft Visual C++ 14.0 or greater is required
```

Nếu wheel không tải được hoặc bạn muốn build từ source, cài Visual Studio Build Tools:

- MSVC C++ build tools
- Windows SDK
- CMake

Sau đó chạy lại:

```powershell
pip install --no-cache-dir insightface==0.7.3
```

Nếu chưa cài `insightface`, endpoint face match vẫn chạy nhưng fail closed:

```json
{
  "data": {
    "similarity": 0.0,
    "isMatch": false
  },
  "diagnostics": {
    "reason": "face_embedding_unavailable"
  }
}
```

## 4. Chuẩn bị PaddleOCR

OCR cần PaddleOCR model files. Lần đầu phải có mạng để PaddleOCR tải model, hoặc phải có cache model sẵn.

Chạy warmup một lần khi có mạng:

```powershell
$env:DISABLE_MODEL_SOURCE_CHECK="True"
python -c "from paddleocr import PaddleOCR; PaddleOCR(lang='vi', use_doc_orientation_classify=False, use_doc_unwarping=False, use_textline_orientation=True)"
```

Nếu gặp lỗi:

```text
No available model hosting platforms detected. Please check your network connection.
```

Nguyên nhân: máy không truy cập được model host và model chưa cache. Cách xử lý:

1. Bật mạng/proxy/VPN rồi chạy warmup lại.
2. Chạy service trên máy đã cache model.
3. Copy thư mục cache PaddleOCR/PaddleX từ máy đã tải model sang máy offline.

Lưu ý: `DISABLE_MODEL_SOURCE_CHECK=True` chỉ bỏ bước check host. Nó không tự tạo model nếu máy chưa từng tải model.

## 5. Run service bằng venv

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

## 6. Test OCR bằng curl

```powershell
curl.exe -X POST http://localhost:8000/vision/idr/vnm/ `
  -H "api-key: local-dev-key" `
  -F "image=@D:\PERSONAL\hoc-ki-2-nam-4\KLTN\Báo cáo\z7919010704080_e6a0229cdb09a93f6bebbfbb118e0a3f.jpg"
```

Nếu response có:

```json
"ocr_available": false
```

thì đọc `quality.ocr_message`. Thường là model chưa cache hoặc PaddleOCR chưa cài đúng venv.

## 7. Test face match bằng Postman

Request:

- Method: `POST`
- URL: `http://localhost:8000/dmp/checkface/v1`
- Header: `api_key: local-dev-key`
- Body: `form-data`
  - key `file[]`, type File, chọn ảnh 1
  - key `file[]`, type File, chọn ảnh 2

Response:

```json
{
  "data": {
    "similarity": 86.4,
    "isMatch": true
  }
}
```

Nếu `similarity = 0`, xem `diagnostics`:

- `insightface_unavailable`: chưa cài `insightface`.
- `exactly_one_face_required`: ảnh không có mặt hoặc có nhiều mặt.
- `invalid_image_quality`: ảnh lỗi/nhỏ quá.

## 8. Test face match bằng curl

```powershell
curl.exe -X POST http://localhost:8000/dmp/checkface/v1 `
  -H "api_key: local-dev-key" `
  -F "file[]=@D:\path\id_image.jpg" `
  -F "file[]=@D:\path\selfie_image.jpg"
```

## 9. Test liveness

Postman:

- Method: `POST`
- URL: `http://localhost:8000/dmp/liveness/v3`
- Header: `api-key: local-dev-key`
- Body: `form-data`
  - key `video`, type File, chọn file video thật `.webm`, `.mp4`, `.mov`, `.avi`
  - key `cmnd`, type File, optional

Không dùng fake bytes đổi đuôi `.webm`; service sẽ trả fail closed:

```json
{
  "data": {
    "score": 0.0,
    "passed": false,
    "spoof_detected": true,
    "multiple_faces_detected": false
  }
}
```

Active pose liveness needs MediaPipe and a local Face Landmarker `.task` model:

```env
KYC_AI_LIVENESS_MEDIAPIPE_MODEL_PATH=D:\models\face_landmarker.task
```

If the model path is missing, the endpoint still validates video metadata and sampled frames, then fails closed with diagnostics reason `mediapipe_model_not_configured`.

Passive anti-spoof uses ONNX Runtime CPU when enabled. Put the selected model outside git and point env to it:

```env
KYC_AI_LIVENESS_ANTISPOOF_MODEL_PATH=D:\models\antispoof.onnx
KYC_AI_LIVENESS_ANTISPOOF_THRESHOLD=0.75
```

If active pose passes but the ONNX model is missing, the request fails closed with `antispoof_model_not_configured` or `antispoof_model_not_found`.

Diagnostics are returned outside `data` so the Java parser can keep reading the same contract. Useful fields:

- `reason`: normalized fail/pass reason.
- `failure_stage`: `input_validation`, `video_sampling`, `active_pose`, `passive_antispoof`, or `passed`.
- `thresholds`: active config values used for the decision.
- `score_components`: pose, anti-spoof, and final score when model scoring runs.

### Liveness test data and tuning

Use `testdata/liveness/` for local-only FE videos. The folder has a `.gitignore` that blocks real videos/images from git. Collect at least:

- 10 pass videos.
- 3 wrong-order videos.
- 3 no-face videos.
- 3 multi-face videos.
- 5 screen/paper spoof attempts.
- 3 short videos.

Record tuning notes in `plans/2026-06-10-ai-kyc-liveness-phase-3/reports/threshold-tuning-*.md`.

## 10. Env cho LensHub backend

```env
APP_KYC_PROVIDER=fpt
FPT_KYC_API_KEY=local-dev-key
FPT_KYC_IDR_URL=http://localhost:8000/vision/idr/vnm/
FPT_KYC_FACEMATCH_URL=http://localhost:8000/dmp/checkface/v1
FPT_KYC_LIVENESS_URL=http://localhost:8000/dmp/liveness/v3
```

## 11. Docker chỉ dùng khi đóng gói

Build Docker:

```powershell
docker compose build
docker compose up -d --force-recreate
```

Nếu Docker build model quá lâu, quay lại dùng venv để dev/test. Venv cho feedback nhanh hơn.

## 12. Troubleshooting nhanh

### PaddleOCR báo no model hosting

```text
No available model hosting platforms detected
```

Fix: chạy warmup có mạng hoặc copy cache model sang máy local.

### PaddleOCR báo `Unknown argument: show_log`

Code hiện tại đã bỏ `show_log`. Restart lại uvicorn để load code mới.

### Face match báo `No module named 'insightface'`

```powershell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Liveness báo không đọc được `.webm`

Dùng video thật. Fake bytes hoặc file hỏng sẽ bị reject trước khi phân tích.

## 13. Test suite

```powershell
cd D:\PERSONAL\hoc-ki-2-nam-4\KLTN\test-project\service\ai-kyc-service
.\.venv\Scripts\Activate.ps1
python -m pytest
```
