# Web nộp & theo dõi tiến độ NAFOSTED — Hướng dẫn triển khai

App **Next.js** deploy lên **Vercel**, đăng nhập **Google (theo danh sách email)**, dữ liệu nộp lưu vào **Google Drive** (thư mục `4. Nafosted`) → tự sync xuống `J:\`.

> ⚠️ **Đừng `npm install` bên trong Google Drive.** Copy thư mục `web-progress/` ra ngoài Drive (vd `C:\dev\nafosted-web\`) hoặc đẩy lên GitHub rồi để Vercel build. `node_modules` trong Drive sẽ làm sync hỏng.

---

## Bản đồ file

```
web-progress/
├── app/
│   ├── page.js              # Trang chủ + nút đăng nhập Google
│   ├── submit/page.js       # Form nộp tiến độ (có cấu trúc + đính kèm)
│   ├── dashboard/page.js    # Dashboard (bản tóm tắt — xem "Bước còn lại")
│   └── api/
│       ├── auth/[...nextauth]/route.js
│       ├── data/route.js    # Đọc tiến độ + bài nộp từ Drive
│       ├── submit/route.js  # Nhận bài nộp → ghi Drive
│       └── cong/route.js    # ĐỒNG BỘ CÔNG: GET đọc / POST ghi (Drive)
├── app/dashboard/route.js   # Phục vụ dashboard CÓ đăng nhập (nhúng dữ liệu inline)
├── lib/drive.js             # Kết nối Drive + getCong/saveCong
├── lib/authOptions.js       # Đăng nhập Google + allowlist email
├── middleware.js            # Bắt buộc đăng nhập (gồm /dashboard, /api/cong)
├── scripts/get-refresh-token.mjs
├── scripts/sync-dashboard.mjs   # Copy dashboard offline → dashboard-src/
├── dashboard-src/           # dashboard.html + nafosted-progress-data.js (COMMIT thư mục này)
├── .env.example             # Mẫu biến môi trường (gồm NAFOSTED_FOLDER_ID)
└── package.json
```

---

## Triển khai trên gói FREE (Hobby) — chặn người ngoài bằng đăng nhập Google

Gói Free KHÔNG có Password Protection của Vercel, nên dashboard được **gate bằng NextAuth (đăng nhập Google theo allowlist)**: route `/dashboard` (và mọi `/api/*`) bắt buộc đăng nhập; **dữ liệu tiến độ nhúng thẳng vào HTML đã xác thực** → không để file dữ liệu công khai ở `public/`.

**Triển khai:**
1. Điền env (Vercel + `.env.local`): các biến NextAuth/OAuth/Drive như trên **+ `NAFOSTED_FOLDER_ID`** (ID thư mục `4. Nafosted`).
2. `npm run sync-dashboard` → copy dashboard vào `dashboard-src/` → **commit thư mục `dashboard-src/`**.
3. Đẩy GitHub → Vercel deploy (gói Free OK). Mở trang chủ → đăng nhập Google → bấm **Dashboard** (`/dashboard`).
4. Chỉ email trong `ALLOWED_EMAILS` mới vào được; người ngoài bị chặn ở bước đăng nhập.

## ĐỒNG BỘ CÔNG (tab "Tính công") qua /api/cong + Drive

Khi dashboard chạy hosted (https), tab **Tính công** TỰ động dùng `/api/cong`:
- **Đọc**: `GET /api/cong` → realtime, mọi máy thấy bản mới (không chờ Drive sync).
- **Ghi**: `POST /api/cong` (đã đăng nhập → ghi nhận **ai sửa**) → lưu `nafosted-cong-thucte.json` **+** sidecar `.js` vào thư mục Nafosted (bản offline `J:\` cũng đồng bộ).

> Dashboard là MỘT file dùng chung: mở `file://` (offline) → localStorage/Apps Script; mở qua Vercel (https, đã đăng nhập) → tự `/api/cong`. Không cần 2 bản.
> **Khi lên Pro** (mở rộng/bảo mật cao hơn): có thể bật thêm **Deployment Protection → Password** để chặn ở tầng nền tảng + thêm người quản lý (seat).

---

## Checklist triển khai (làm 1 lần)

### 1. Google Cloud — tạo OAuth
1. Vào https://console.cloud.google.com → tạo **Project** mới (vd "NAFOSTED Web").
2. **APIs & Services → Library** → bật **Google Drive API**.
3. **OAuth consent screen**: chọn *External*, điền tên app; ở mục *Test users* thêm email anh Tùng (và các thành viên) — hoặc *Publish* nếu muốn mở rộng.
4. **Credentials → Create Credentials → OAuth client ID → Web application**. Thêm **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google` (chạy thử)
   - `http://localhost:5555/callback` (để lấy refresh token)
   - `https://<ten-app>.vercel.app/api/auth/callback/google` (production — điền sau khi có domain)
5. Lưu lại **Client ID** và **Client secret**.

### 2. Lấy DRIVE_REFRESH_TOKEN (danh tính ghi Drive = tài khoản anh Tùng)
```powershell
# copy .env.example → .env.local, điền GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET
npm install
npm run get-token        # mở link, ĐĂNG NHẬP BẰNG TÀI KHOẢN ANH TÙNG → in ra refresh token
```
Dán token vào `DRIVE_REFRESH_TOKEN`.

### 3. Chuẩn bị thư mục & file trên Google Drive
1. Trong `4. Nafosted/00 RAW-NAFOSTED/` tạo thư mục con **`_submissions`**.
2. Upload file tiến độ gốc **`nafosted-progress.json`** vào `4. Nafosted/` (lấy từ `seed/` — xem mục cuối; chính là dữ liệu của dashboard hiện tại).
3. Lấy **ID** từ URL Google Drive (phần sau `/d/` hoặc `/folders/`):
   - `PROGRESS_FILE_ID` = ID của `nafosted-progress.json`
   - `SUBMISSIONS_FOLDER_ID` = ID của thư mục `_submissions`

### 4. Đẩy code lên GitHub
```bash
# Ở BẢN COPY NGOÀI DRIVE
git init && git add . && git commit -m "NAFOSTED progress web"
# tạo repo trên GitHub rồi:
git remote add origin <repo-url> && git push -u origin main
```

### 5. Deploy Vercel
1. https://vercel.com → **Add New → Project** → import repo GitHub.
2. **Settings → Environment Variables**: điền tất cả biến trong `.env.example`
   (`NEXTAUTH_URL` = domain Vercel; `NEXTAUTH_SECRET` = `openssl rand -base64 32`).
3. **Deploy**. Sau khi có domain, quay lại **bước 1.4** thêm redirect URI production rồi redeploy.
4. (Khuyến nghị) **Settings → Deployment Protection** → bật Vercel Authentication/Password để chặn truy cập ngoài.

### 6. Phân quyền
- `ALLOWED_EMAILS` = danh sách email được nộp (Tùng, Khánh Linh, Khánh Mai, các thành viên…).
- `ADMIN_EMAILS` = ai được duyệt/gộp tiến độ (Tùng).

---

## Luồng dữ liệu (đã đơn giản hóa — không còn trang "Nộp báo cáo" riêng)

Toàn bộ quản lý (giao việc, theo dõi tiến độ, tính công, SOP thực nghiệm) nằm gọn trong **một Dashboard** duy nhất (`/dashboard`, phục vụ từ `dashboard-src/dashboard.html`), không còn luồng "nộp báo cáo" tách rời:

1. Thành viên đăng nhập → vào thẳng Dashboard.
2. Mọi thao tác (tạo/nhận/nộp kết quả giao việc, nhập số liệu SOP, ghi công) **tự động lưu lên Google Drive** qua `/api/store` (loại `cong`/`giaoviec`/`sop`, xem `lib/drive.js`) — không cần bấm nút riêng, không cần trang nộp báo cáo.
3. Drive sync → các file `nafosted-<type>.json` + sidecar `.js` xuất hiện trong `J:\My Drive\4. Nafosted\`.
4. **Duyệt (HITL) trong tab Giao việc:** người nhận nộp kết quả + minh chứng → vào hàng "chờ CNĐT duyệt" → anh Tùng bấm Đạt/Chưa đạt ngay trên Dashboard.

(Lịch sử: từng có trang `/submit` + `/api/submit` ghi vào `_submissions/` riêng — đã gỡ bỏ 2026-07-02 vì trùng lặp với tab Giao việc trên Dashboard.)
