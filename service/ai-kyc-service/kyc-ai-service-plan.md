# Kế hoạch dựng kyc-ai-service nội bộ thay FPT KYC

## 1. Mục tiêu

Dựng một service nội bộ thay FPT cho 3 phần:

- OCR CCCD
- Face match
- Liveness 4 góc

Giữ backend Java gần như không đổi bằng cách đổi biến môi trường:

```env
FPT_KYC_IDR_URL=http://kyc-ai-service:8000/vision/idr/vnm/
FPT_KYC_FACEMATCH_URL=http://kyc-ai-service:8000/dmp/checkface/v1
FPT_KYC_LIVENESS_URL=http://kyc-ai-service:8000/dmp/liveness/v3
FPT_KYC_API_KEY=local-dev-key
```

Service mới cần giả lập API contract FPT vì `FptKycProvider.java` hiện đang parse response theo FPT-style.

---

## 2. Service architecture

```text
Spring Boot LensHub
  -> FptKycProvider hiện tại
    -> kyc-ai-service FastAPI

kyc-ai-service
  -> OCR module: PaddleOCR CPU + CCCD parser
  -> Face module: InsightFace/ArcFace ONNX embedding
  -> Liveness module: MediaPipe face landmarks + ONNX anti-spoof
```

---

## 3. Khuyến nghị stack

- Python 3.11
- FastAPI
- Uvicorn
- OpenCV
- PaddleOCR / PaddlePaddle CPU
- InsightFace hoặc ONNX Runtime face models
- MediaPipe
- ONNX Runtime CPU
- NumPy
- Pillow

---

## 4. Endpoint 1: OCR CCCD

### 4.1 Backend hiện gọi

```http
POST /vision/idr/vnm/
Header: api-key: xxx
Multipart: image=<file>
```

### 4.2 Response cần tương thích

```json
{
  "errorCode": 0,
  "data": [
    {
      "id": "012345678901",
      "name": "NGUYEN VAN A",
      "dob": "01/01/2000",
      "sex": "NAM",
      "nationality": "VIET NAM",
      "home": "XA..., HUYEN..., TINH...",
      "address": "SO..., PHUONG..., QUAN...",
      "issue_date": "01/01/2022",
      "doe": "01/01/2032",
      "type_new": "cccd",
      "id_prob": "0.98",
      "name_prob": "0.96",
      "dob_prob": "0.95",
      "address_prob": "0.90",
      "home_prob": "0.90",
      "doe_prob": "0.92",
      "issue_date_prob": "0.91"
    }
  ]
}
```

### 4.3 OCR cần implement

1. Validate image: size, blur, brightness.
2. Detect/crop CCCD: find document contour, perspective transform.
3. Auto rotate: 0/90/180/270.
4. OCR text: PaddleOCR `lang=vi`.
5. Classify front/back.
6. Extract fields by regex + label anchors.
7. Normalize date/gender/address.
8. Return confidence.

### 4.4 Open-source phù hợp

PaddleOCR là lựa chọn phù hợp. PaddleOCR có `lang=vi`, PP-OCRv5 multilingual hỗ trợ Vietnamese/Latin language group.

### 4.5 Rủi ro

Rủi ro lớn nhất nằm ở OCR. FPT OCR là domain-specific cho CCCD Việt Nam, trong khi open-source OCR sẽ cần test nhiều ảnh thật để tune parser.

---

## 5. Endpoint 2: Face match

### 5.1 Backend hiện gọi

```http
POST /dmp/checkface/v1
Header: api_key: xxx
Multipart:
  file[]=id_image
  file[]=selfie_image
```

### 5.2 Response cần tương thích

```json
{
  "data": {
    "similarity": 86.4,
    "isMatch": true
  }
}
```

### 5.3 Face match pipeline

1. Read 2 images.
2. Detect exactly one usable face per image.
3. Align face by landmarks.
4. Extract embedding.
5. Cosine similarity.
6. Map score to 0..100.
7. `isMatch = similarity >= threshold`.

### 5.4 Model/lib phù hợp

- InsightFace: face detection, recognition, alignment.
- ONNX Runtime CPU để chạy model nhẹ hơn.

### 5.5 Threshold ban đầu

```text
similarity >= 80 => match
```

Tuy nhiên nên tune bằng test set nội bộ, vì scale score của InsightFace có thể khác FPT.

---

## 6. Endpoint 3: Liveness 4 góc

### 6.1 Backend hiện gọi

```http
POST /dmp/liveness/v3
Header: api-key: xxx
Multipart:
  video=<liveness video>
  cmnd=<front id image>
```

### 6.2 Response nên trả theo parser hiện tại của Java

```json
{
  "data": {
    "score": 0.91,
    "passed": true,
    "spoof_detected": false,
    "multiple_faces_detected": false
  }
}
```

### 6.3 Flow FE hiện tại

FE hiện đã quay video 4 góc:

```text
center -> left -> right -> center
```

### 6.4 Liveness pipeline nên gồm 2 lớp

#### Lớp 1: Active pose validation

- Sample frames theo timeline.
- Detect one face.
- Estimate yaw/head pose.
- Check sequence center/left/right/center.

#### Lớp 2: Passive anti-spoof

- Sample 8-12 frames.
- Run ONNX anti-spoof model.
- Aggregate score.

### 6.5 Lib/model phù hợp

Dùng MediaPipe Face Landmarker/Face Mesh để lấy landmarks/head pose trên CPU.

Anti-spoof model tham khảo:

- `face-antispoof-onnx`
- `face-recognition-liveness`

### 6.6 Điều kiện tham khảo từ FPT liveness

FPT liveness thật thường yêu cầu:

- Video 5-6 giây.
- HD 720p.
- Tối thiểu 25fps.
- Một mặt.
- Mặt không ra khỏi frame.

---

## 7. CPU-only performance strategy

Không xử lý mọi frame.

### OCR

- Process 1 image/lần.
- Không batch ở giai đoạn MVP.

### Face match

- Process 2 ảnh.
- Nhẹ hơn OCR.

### Liveness

- Sample 2-3 fps cho pose.
- Sample 8-12 frame cho anti-spoof.
- Giới hạn video 5-8 giây.
- Reject video > 10MB.
- Dùng queue nếu nhiều request.

### Timeout đề xuất

| Module | Timeout |
|---|---:|
| OCR | 8-12s |
| Face match | 3-5s |
| Liveness | 10-15s |

---

## 8. Docker layout đề xuất

```text
kyc-ai-service/
  app/
    main.py
    config.py
    api/
      ocr.py
      face_match.py
      liveness.py
    services/
      cccd_ocr_service.py
      face_match_service.py
      liveness_service.py
      quality_service.py
    models/
      face/
      liveness/
    utils/
      image_io.py
      response_mapper.py
  Dockerfile
  requirements.txt
```

---

## 9. Decision rules

### 9.1 OCR

- Missing `id/name/dob` => `errorCode != 0` hoặc confidence thấp.
- Confidence thấp => vẫn trả `data` nhưng mark low confidence.
- Backend risk/manual review xử lý tiếp.

### 9.2 Face match

- No face => `similarity = 0`, `isMatch = false`.
- Multiple faces => `similarity = 0`, `isMatch = false`.
- Low quality => `similarity = 0`, `isMatch = false`.

### 9.3 Liveness

- Missing video => `passed = false`.
- Multiple faces => `multiple_faces_detected = true`.
- Pose sequence fail => `passed = false`.
- Anti-spoof fail => `spoof_detected = true`.
- `score < 0.80` => `passed = false`.

---

## 10. Implementation order

1. Dựng FastAPI skeleton + health endpoint.
2. Implement 3 endpoint contract giả lập FPT, trả mock fixed data.
3. Trỏ backend env sang service nội bộ, verify flow không đổi.
4. Implement face match thật.
5. Implement liveness pose sequence.
6. Implement anti-spoof.
7. Implement OCR CCCD.
8. Tune thresholds bằng ảnh/video thật.
9. Add Docker compose.
10. Add logging, request id, metrics, timeout.

---

## 11. Lưu ý quan trọng

Không nên sửa Java ngay.

Service mới nên tương thích với `FptKycProvider` hiện tại trước. Sau khi chạy ổn mới cân nhắc đổi tên provider từ `fpt` sang `self-hosted`.

---

## 12. Unresolved questions

1. Có bộ ảnh CCCD/selfie/video test để tune OCR + threshold chưa?
2. Muốn OCR fail thì reject ngay, hay cho qua manual review?
3. Service chạy 1 instance CPU hay cần queue/worker riêng?
