from app.services.cccd_field_extractor import CccdFieldExtractor
from app.services.ocr_engine import OcrLine


def line(text: str, confidence: float = 0.95) -> OcrLine:
    return OcrLine(text=text, confidence=confidence)


def test_extract_front_fields_from_anchor_lines() -> None:
    result = CccdFieldExtractor().extract(
        [
            line("CAN CUOC CONG DAN"),
            line("So / No: 012345678901"),
            line("Ho va ten / Full name: NGUYEN VAN A"),
            line("Ngay sinh / Date of birth: 1/2/2000"),
            line("Gioi tinh / Sex: Nam"),
            line("Quoc tich / Nationality: Viet Nam"),
            line("Que quan / Place of origin: Xa A, Huyen B"),
            line("Noi thuong tru / Place of residence: So 1 Duong C"),
            line("Phuong D, Quan E"),
            line("Co gia tri den / Date of expiry: 01/02/2030"),
        ]
    )

    assert result.side == "front"
    assert result.fields["id"] == "012345678901"
    assert result.fields["name"] == "NGUYEN VAN A"
    assert result.fields["dob"] == "01/02/2000"
    assert result.fields["sex"] == "NAM"
    assert result.fields["doe"] == "01/02/2030"
    assert result.probabilities["id"] > 0.8


def test_extract_back_issue_date() -> None:
    result = CccdFieldExtractor().extract(
        [
            line("Dac diem nhan dang"),
            line("Ngay cap / Date of issue: 03/04/2022"),
            line("Noi cap: CUC CANH SAT"),
        ]
    )

    assert result.side == "back"
    assert result.fields["issue_date"] == "03/04/2022"


def test_malformed_date_is_ignored() -> None:
    result = CccdFieldExtractor().extract([line("Ngay sinh: 99/99/2000")])

    assert result.fields["dob"] is None
    assert result.probabilities["dob"] == 0.0


def test_extract_noisy_blurred_front_fields_without_id_or_name() -> None:
    result = CccdFieldExtractor().extract(
        [
            line("CNG HA X HI CH NGHA VIT NAM", 0.8),
            line("CN CƯC CÔNG DN", 0.85),
            line("S6:", 0.86),
            line("Ho và tên:", 0.9),
            line("Ngày, thäng, năm sinh: 01/06/1985", 0.91),
            line("Gidi tinh: Nü", 0.9),
            line("Quðe tich: Vit Nam", 0.88),
            line("Quê quan:", 0.9),
            line("Thanh Oai, Hà Ni", 0.87),
            line("Noi thubng trù:", 0.86),
            line("T6 48", 0.86),
            line("Vīnh Hung, Hoàng Mai, Hà Ni", 0.86),
            line("Có gia tri dên:", 0.88),
            line("01/06/2025", 0.92),
        ]
    )

    assert result.fields["id"] is None
    assert result.fields["name"] is None
    assert result.fields["dob"] == "01/06/1985"
    assert result.fields["sex"] == "NU"
    assert result.fields["nationality"] == "VIỆT NAM"
    assert result.fields["home"] == "THANH OAI, HÀ NI"
    assert result.fields["address"] == "T6 48 VĪNH HUNG, HOÀNG MAI, HÀ NI"
    assert result.fields["doe"] == "01/06/2025"


def test_extract_rotated_chip_card_noisy_paddle_lines() -> None:
    result = CccdFieldExtractor().extract(
        [
            line("Nam Quc tch / Nationality: Vit Nam", 0.88),
            line("Noi thuòng trú / Place of residence: Qunh Ngc 1", 0.88),
            line("Qunh Hi, Qunh Ph, Thái Bình", 0.88),
            line("CNG HA X HI CHÙ NGHA VIT NAM", 0.84),
            line("CN CƯÓC CÔNG DÂN", 0.86),
            line("066204002910", 0.92),
            line("Ngày sinh / Date of birth: 30/04/2004", 0.92),
            line("SOCIALIST REPUBLIC OF VIET NAM", 0.86),
            line("Independence - Freedom - Happiness", 0.84),
            line("NGUYN THNH LC", 0.89),
            line("Ea Na, Krông Ana, Đk Lk", 0.89),
            line("Citizen Identity Card", 0.84),
            line("Quê quán / Place of origin:", 0.88),
            line("H và tên / Full name.", 0.88),
            line("Giói tính / Sex:", 0.88),
            line("Có giá tr dén: 30/04/2029", 0.9),
        ]
    )

    assert result.fields["id"] == "066204002910"
    assert result.fields["name"] == "NGUYỄN THÀNH LỘC"
    assert result.fields["dob"] == "30/04/2004"
    assert result.fields["sex"] == "NAM"
    assert result.fields["nationality"] == "VIỆT NAM"
    assert result.fields["home"] == "QUỲNH HỘI, QUỲNH PHỤ, THÁI BÌNH"
    assert result.fields["address"] == "QUỲNH NGỌC 1, EA NA, KRÔNG A NA, ĐẮK LẮK"
    assert result.fields["doe"] == "30/04/2029"
