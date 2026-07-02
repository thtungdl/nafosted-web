// Phục vụ dashboard đầy đủ CÓ KIỂM TRA ĐĂNG NHẬP (gate bằng middleware NextAuth).
// Dữ liệu tiến độ được NHÚNG thẳng vào HTML → chỉ người đăng nhập mới nhận được,
// không để file dữ liệu ở public/ (tránh lộ trên gói Free không có Password Protection).
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

export async function GET() {
  const dir = path.join(process.cwd(), "dashboard-src");
  let html = fs.readFileSync(path.join(dir, "dashboard.html"), "utf8");
  const data = fs.readFileSync(path.join(dir, "nafosted-progress-data.js"), "utf8");
  // thay <script src="nafosted-progress-data.js"> bằng dữ liệu nhúng inline
  html = html.replace(
    '<script src="nafosted-progress-data.js"></script>',
    "<script>\n" + data + "\n</script>"
  );
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
