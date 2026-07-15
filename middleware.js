// Bắt buộc đăng nhập cho dashboard và API dữ liệu.
// Tự giải mã JWT thay vì dùng thẳng next-auth/middleware: cookie phiên cũ không giải mã được
// (vd. sau khi đổi NEXTAUTH_SECRET, hoặc cookie hỏng) từng khiến middleware ném lỗi 500 thay vì
// coi là "chưa đăng nhập" — API dashboard gọi lên vì vậy lưu Drive thất bại âm thầm, trong khi
// giao diện vẫn có vẻ bình thường vì dữ liệu chỉ mới nằm ở localStorage của trình duyệt.
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  let token = null;
  try {
    token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  } catch (e) {
    token = null; // JWT không giải mã được → coi như chưa đăng nhập, không để crash thành 500
  }
  if (token) return NextResponse.next();

  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const signInUrl = new URL("/api/auth/signin", req.url);
  signInUrl.searchParams.set("callbackUrl", req.url);
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/api/cong", "/api/store", "/api/upload", "/api/export-sop"],
};
