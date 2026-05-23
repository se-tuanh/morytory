# MoryTory - Mô hình gỗ cá nhân hóa bằng AI

Đồ án xây dựng hệ sinh thái tự thiết kế và đặt hàng mô hình gỗ gia đình, tốt nghiệp, đám cưới, ứng dụng công nghệ ghép mặt AI (Face Swap) và lưu trữ điện toán đám mây.

## 📁 Cấu trúc thư mục dự án

Dự án được phân chia rõ ràng thành các phân hệ để dễ quản lý, bảo trì và deploy:

```text
├── frontend/             # Giao diện tĩnh của khách hàng và Admin
│   ├── index.html        # Trang chủ & Tra cứu đơn hàng của khách
│   ├── product_custom.html # Trang công cụ tự thiết kế (Upload mặt, Ghép AI)
│   ├── admin.html        # Trang Dashboard Quản trị đơn hàng dành cho Admin
│   ├── logo.png          # Logo thương hiệu MoryTory
│   ├── vietinbank_qr.png # Ảnh QR tài khoản VietinBank tĩnh
│   └── *.jpg, *.png      # Phôi ảnh mẫu chất lượng cao và ảnh mẫu quảng cáo
│
├── worker/               # Backend API chạy trên Cloudflare Workers
│   ├── index.js          # Logic Router xử lý API (Đặt hàng, Tra cứu, Gọi AI, CORS)
│   ├── templates_data.js # Bản mã hóa Base64 của phôi ảnh mẫu (tự động build)
│   └── wrangler.toml     # File cấu hình deploy Cloudflare Worker & R2 Buckets
│
├── scripts/              # Các công cụ hỗ trợ và script kiểm thử dự án
│   ├── build_worker_assets.js # Script mã hóa ảnh mẫu sang Base64 đóng gói vào Worker
│   ├── create_templates_with_markers.js # Script tạo Marker tọa độ khuôn mặt để canh chỉnh
│   ├── crop_templates.js # Công cụ cắt/crop ảnh mẫu phục vụ AI
│   ├── test_orders.js    # Script kiểm thử tự động API Backend (POST/GET/Auth)
│   ├── test_replicate.js # Script test gọi thử API Replicate AI độc lập
│   └── ... (các script hỗ trợ tiền xử lý ảnh khác)
│
├── .gitignore            # File cấu hình bỏ qua các file thừa (node_modules, logs)
├── package.json          # File quản lý thư viện NodeJS của dự án
└── README.md             # Tài liệu hướng dẫn sử dụng (File này)
```

## 🛠️ Hướng dẫn vận hành nhanh

### 1. Build tài nguyên ảnh nền cho Worker
Nếu có thay đổi các phôi ảnh mẫu trong thư mục `frontend/`, chạy lệnh sau để đóng gói lại ảnh vào Worker:
```bash
node scripts/build_worker_assets.js
```

### 2. Deploy Backend (Cloudflare Worker)
Di chuyển vào thư mục `worker` và chạy lệnh deploy:
```bash
cd worker
npx wrangler deploy
```

### 3. Deploy Frontend (Cloudflare Pages)
Tại thư mục gốc của dự án, chạy lệnh deploy thư mục tĩnh `frontend`:
```bash
npx wrangler pages deploy frontend
```
