// Bắt buộc đăng nhập cho dashboard, trang nộp và API dữ liệu.
export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/submit/:path*", "/api/data", "/api/submit", "/api/cong", "/api/store"],
};
