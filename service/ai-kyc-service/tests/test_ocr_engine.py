from app.services.ocr_engine import OcrLine, PaddleOcrEngine


def test_anchor_score_prefers_cccd_text() -> None:
    engine = PaddleOcrEngine()
    blank = [OcrLine("random text", 0.95)]
    cccd = [
        OcrLine("CAN CUOC CONG DAN", 0.80),
        OcrLine("Ho va ten: NGUYEN VAN A", 0.90),
        OcrLine("Ngay sinh: 01/01/2000", 0.90),
    ]

    assert engine.anchor_score(cccd) > engine.anchor_score(blank)


def test_missing_paddleocr_returns_unavailable(monkeypatch) -> None:
    engine = PaddleOcrEngine()
    monkeypatch.setattr(engine, "_get_ocr", lambda: (None, "PaddleOCR import failed: test"))

    result = engine.recognize_best([type("Candidate", (), {"angle": 0, "content": b"image"})()])

    assert result.available is False
    assert result.lines == []
    assert "PaddleOCR import failed" in result.message
