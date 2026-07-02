import Providers from "./providers";

export const metadata = {
  title: "Tiến độ NAFOSTED 108.05-2023.20",
  description: "Nộp & theo dõi tiến độ đề tài NAFOSTED",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body style={{ margin: 0, fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif", background: "#f5f7fb", color: "#1a1f2e" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
