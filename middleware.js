// Bắt buộc đăng nhập cho dashboard và API dữ liệu.
export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/api/cong", "/api/store", "/api/upload", "/api/export-sop"],
};
