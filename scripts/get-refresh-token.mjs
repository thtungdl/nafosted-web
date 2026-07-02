// Lấy DRIVE_REFRESH_TOKEN (chạy 1 lần trên máy anh Tùng).
//   1) Đặt GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET trong .env.local
//   2) Trong Google Cloud → OAuth client, thêm redirect URI: http://localhost:5555/callback
//   3) node scripts/get-refresh-token.mjs  → mở link, đăng nhập bằng TÀI KHOẢN ANH TÙNG, dán token vào .env
import http from "node:http";
import { google } from "googleapis";
import "node:fs";

const CID = process.env.GOOGLE_CLIENT_ID;
const CSECRET = process.env.GOOGLE_CLIENT_SECRET;
if (!CID || !CSECRET) { console.error("Thiếu GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET"); process.exit(1); }

const REDIRECT = "http://localhost:5555/callback";
const oauth2 = new google.auth.OAuth2(CID, CSECRET, REDIRECT);
const url = oauth2.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: ["https://www.googleapis.com/auth/drive"],
});

console.log("\n👉 Mở link sau, đăng nhập bằng tài khoản Google của anh Tùng:\n\n" + url + "\n");

http.createServer(async (req, res) => {
  if (!req.url.startsWith("/callback")) { res.end("…"); return; }
  const code = new URL(req.url, REDIRECT).searchParams.get("code");
  const { tokens } = await oauth2.getToken(code);
  res.end("Xong! Quay lại terminal để lấy refresh token.");
  console.log("\n✅ DRIVE_REFRESH_TOKEN=\n" + tokens.refresh_token + "\n\nDán vào .env.local và Vercel Env.");
  process.exit(0);
}).listen(5555, () => console.log("Đang chờ ở http://localhost:5555/callback …"));
