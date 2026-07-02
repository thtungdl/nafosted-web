// Phục vụ dashboard đầy đủ CÓ KIỂM TRA ĐĂNG NHẬP (gate bằng middleware NextAuth).
// Dữ liệu tiến độ được NHÚNG thẳng vào HTML → chỉ người đăng nhập mới nhận được,
// không để file dữ liệu ở public/ (tránh lộ trên gói Free không có Password Protection).
import fs from "node:fs";
import path from "node:path";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/authOptions";
import { getAdminMembers } from "../../lib/drive";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const dir = path.join(process.cwd(), "dashboard-src");
  let html = fs.readFileSync(path.join(dir, "dashboard.html"), "utf8");
  const data = fs.readFileSync(path.join(dir, "nafosted-progress-data.js"), "utf8");
  // Quyền xem của người dùng: lấy từ danh mục quản trị (store admin). Admin → toàn quyền (perms=null).
  // Người không có bản ghi quyền → perms=null (xem như trước, không khóa nhầm).
  const email = (session?.user?.email || "").toLowerCase();
  const isAdmin = !!session?.user?.isAdmin;
  let perms = null;
  if (!isAdmin && email) {
    try {
      const m = (await getAdminMembers()).find((x) => (x.email || "").toLowerCase() === email);
      if (m && Array.isArray(m.perms)) perms = m.perms;
    } catch (e) { perms = null; }
  }
  // Danh tính người xem (email + quyền admin + quyền xem section). Giới hạn PHÍA CLIENT trong nhóm
  // đã đăng nhập hợp lệ, không phải cách ly server-side tuyệt đối.
  const viewer = JSON.stringify({
    email: session?.user?.email || null,
    isAdmin: isAdmin,
    perms: perms,
  });
  // thay <script src="nafosted-progress-data.js"> bằng danh tính người xem + dữ liệu nhúng inline
  html = html.replace(
    '<script src="nafosted-progress-data.js"></script>',
    "<script>\nwindow.NAFOSTED_VIEWER=" + viewer + ";\n" + data + "\n</script>"
  );
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
