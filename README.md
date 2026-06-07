# Lenshub - Website Mua Bán và Cho Thuê Thiết Bị Máy Ảnh

Lenshub là một nền tảng thương mại điện tử chuyên nghiệp hỗ trợ mua bán và cho thuê thiết bị máy ảnh. Hệ thống tích hợp quy trình xác thực danh tính **AI eKYC** và định hướng bảo mật **E2EE-SHIELD** để bảo vệ dữ liệu người dùng và giao dịch thuê thiết bị.

---

## 📂 Cấu Trúc Dự Án

Dự án được xây dựng theo mô hình Client-Server với các thư mục chính:

*   **[frontend/](file:///d:/Nga/KLTN/digital-rental/frontend)**: Ứng dụng Next.js (FE) dành cho khách hàng, nhân viên (Staff) và quản trị viên (Admin/Super Admin).
*   **[service/lenshub/](file:///d:/Nga/KLTN/digital-rental/service/lenshub)**: Dịch vụ API Spring Boot (BE) xử lý toàn bộ nghiệp vụ lõi (Catalog, Thuê/Mua, Thanh toán, eKYC, Inventory...).
*   **[docker/](file:///d:/Nga/KLTN/digital-rental/docker)**: Cấu hình Docker Compose để khởi chạy nhanh các dịch vụ database (PostgreSQL, MySQL, Redis).

---

## 🛠️ Yêu Cầu Hệ Thống

Để chạy dự án local, máy tính của bạn cần cài đặt sẵn:
1.  **Node.js** (Phiên bản v18 trở lên) & **pnpm** (Trình quản lý package của FE).
2.  **Java SDK 17** (Để chạy Spring Boot Backend).
3.  **Docker Desktop** (Để khởi chạy Database PostgreSQL và Redis).

---

## 🚀 Hướng Dẫn Thiết Lập & Khởi Chạy

Thực hiện lần lượt các bước dưới đây để cài đặt dự án trên máy cá nhân:

### Bước 1: Khởi động CSDL và Redis (Docker)

Hệ thống backend sử dụng PostgreSQL làm CSDL chính và Redis làm bộ nhớ đệm (cache/session). 

Mở terminal tại thư mục gốc dự án (`digital-rental/`) và chạy:

```bash
docker compose -f docker/docker-compose.yml up -d lenshub-postgres lenshub-redis
```

*   **PostgreSQL** sẽ chạy tại cổng: `5433` (Username: `postgres`, Password: `123123`).
*   **Redis** sẽ chạy tại cổng: `6379`.

---

### Bước 2: Thiết lập và chạy Backend (Spring Boot)

1.  Di chuyển vào thư mục backend:
    ```bash
    cd service/lenshub
    ```
2.  Tạo file cấu hình `.env` bằng cách copy từ file mẫu [env.example](file:///d:/Nga/KLTN/digital-rental/service/lenshub/.env.example):
    *   *Windows (Cmd/PowerShell):* `copy .env.example .env`
    *   *Linux/macOS:* `cp .env.example .env`
3.  Mở file [.env](file:///d:/Nga/KLTN/digital-rental/service/lenshub/.env) và cập nhật các thông tin bảo mật/môi trường (JWT secret, Gmail SMTP, VNPAY API nếu cần). Cấu hình database mặc định đã khớp sẵn với Docker ở Bước 1.
4.  Chạy ứng dụng Backend:
    *   *Windows (cmd/powershell):*
        ```bash
        gradlew.bat bootRun
        ```
    *   *Linux/macOS:*
        ```bash
        chmod +x gradlew
        ./gradlew bootRun
        ```
5.  Backend sẽ khởi động tại địa chỉ: `http://localhost:8080/api`
    *   Tài liệu API Swagger UI có thể truy cập tại: [http://localhost:8080/api/swagger-ui/index.html](http://localhost:8080/api/swagger-ui/index.html)

---

### Bước 3: Thiết lập và chạy Frontend (Next.js)

1.  Mở một cửa sổ terminal mới và di chuyển vào thư mục frontend:
    ```bash
    cd frontend
    ```
2.  Cài đặt các thư viện phụ thuộc:
    ```bash
    pnpm install
    ```
3.  Tạo file cấu hình môi trường `.env.local` tại thư mục `frontend/` để kết nối với API Backend:
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:8080/api
    ```
4.  Khởi chạy Frontend ở chế độ phát triển (Development):
    ```bash
    pnpm dev
    ```
5.  Mở trình duyệt và truy cập: [http://localhost:3000](http://localhost:3000) để trải nghiệm giao diện khách hàng.

---

## 🔒 Các Lưu Ý Quan Trọng về Bảo Mật & eKYC

*   **Không log dữ liệu nhạy cảm**: Hạn chế in logs thông tin cá nhân của người dùng, tài liệu eKYC (hình ảnh khuôn mặt, CCCD) hoặc các JWT token trong console backend.
*   **Tích hợp VNPAY**: Luôn đảm bảo giữ nguyên cơ chế xác minh chữ ký bảo mật (checksum) cho các callback thanh toán.
*   **Quyền truy cập thư mục**: Luôn cấu hình chính xác quyền hạn cho các thư mục lưu trữ file upload (avatar, thiết bị, hợp đồng).
