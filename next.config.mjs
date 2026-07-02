/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Bảo đảm thư mục dashboard-src/ được đóng gói để route /dashboard đọc được khi chạy trên Vercel
  experimental: {
    outputFileTracingIncludes: {
      "/dashboard": ["./dashboard-src/**"],
    },
  },
};
export default nextConfig;
