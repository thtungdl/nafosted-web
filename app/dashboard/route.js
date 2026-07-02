// Phục vụ dashboard đầy đủ CÓ KIỂM TRA ĐĂNG NHẬP (gate bằng middleware NextAuth).
// Dữ liệu tiến độ được NHÚNG thẳng vào HTML → chỉ người đăng nhập mới nhận được,
// không để file dữ liệu ở public/ (tránh lộ trên gói Free không có Password Protection).
import fs from "node:fs";
import path from "node:path";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/authOptions";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const dir = path.join(process.cwd(), "dashboard-src");
  let html = fs.readFileSync(path.join(dir, "dashboard.html"), "utf8");
  const data = fs.readFileSync(path.join(dir, "nafosted-progress-data.js"), "utf8");
  // Danh tính người xem (email + quyền admin) — dashboard JS dùng để: (1) chỉ hiện tab "Tính công"
  // cho admin, (2) khóa bảng "Tiến độ cá nhân" về đúng người đăng nhập (không xem được người khác).
  // Đây là giới hạn PHÍA CLIENT trong nhóm đã đăng nhập hợp lệ, không phải cách ly server-side tuyệt đối.
  const viewer = JSON.stringify({
    email: session?.user?.email || null,
    isAdmin: !!session?.user?.isAdmin,
  });
  // thay <script src="nafosted-progress-data.js"> bằng danh tính người xem + dữ liệu nhúng inline
  html = html.replace(
    '<script src="nafosted-progress-data.js"></script>',
    "<script>\nwindow.NAFOSTED_VIEWER=" + viewer + ";\n" + data + "\n</script>"
  );
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
