# AI Agent — Đề xuất hãng giao & so sánh giá (bản web có AI)

Web tự đọc đơn, đề xuất hãng giao (Xanh SM / Grab / Ahamove), ước khoảng cách và so sánh giá.
Phần AI gọi **Claude API** qua một backend Node nhỏ.

## Cấu trúc
```
web-service/
├─ public/index.html   ← giao diện (frontend)
├─ server.js           ← backend: phục vụ web + endpoint /api/classify gọi Claude
├─ package.json
└─ .env.example        ← mẫu khai báo khóa API
```

## Chạy thử trên máy (local)
Yêu cầu: Node.js 18 trở lên.
```bash
cd web-service
npm install
# Lấy khóa API tại https://console.anthropic.com  ->  API Keys
export ANTHROPIC_API_KEY=sk-ant-...        # Windows PowerShell: $env:ANTHROPIC_API_KEY="sk-ant-..."
npm start
```
Mở http://localhost:3000 — bật công tắc "🤖 Dùng AI", dán đơn, bấm Đề xuất.

## Đưa lên mạng (chọn 1 dịch vụ)
Cách dễ nhất là dùng nền tảng host Node có biến môi trường:

**Render.com (miễn phí, gợi ý)**
1. Đẩy thư mục này lên một repo GitHub.
2. Render → New → Web Service → chọn repo.
3. Build Command: `npm install` · Start Command: `npm start`.
4. Environment → thêm `ANTHROPIC_API_KEY` = khóa của bạn.
5. Deploy → nhận link dạng `https://...onrender.com`.

**Railway.app / Fly.io / VPS**: tương tự — đặt biến `ANTHROPIC_API_KEY`, chạy `npm start`.

> Quan trọng: KHÓA API để ở **biến môi trường trên server**, không đặt trong code frontend (tránh lộ khóa).

## Chi phí & lưu ý
- Mỗi lần bấm "Đề xuất" gọi Claude 1 lần (model mặc định Haiku — rẻ & nhanh). Có thể đổi qua biến `CLAUDE_MODEL`.
- Nếu backend lỗi/không có khóa, frontend tự chuyển sang **chế độ quy tắc** (vẫn đề xuất + so sánh giá, không có AI).
- Giá là ước tính theo công thức "2km đầu + mỗi km + phụ phí cao điểm − % giảm đối tác" trong panel ⚙️; chỉnh cho khớp giá thật của shop.
- Khoảng cách: chế độ AI để Claude ước theo địa chỉ; muốn chính xác từng đơn cần nối thêm API bản đồ (chưa có).

## Cột dữ liệu
NỀN TẢNG · MÃ ĐƠN · ĐỊA CHỈ · TRỌNG LƯỢNG · GIỜ GIAO · TÊN HÀNG
(không cần Tên khách / SĐT; nếu có dòng tiêu đề sẽ tự khớp cột.)
