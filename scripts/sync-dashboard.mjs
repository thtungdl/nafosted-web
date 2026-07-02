// Copy dashboard offline (NAFOSTED-PROGRESS.html + nafosted-progress-data.js)
// từ kho master Drive vào public/ để Vercel phục vụ.
//   node scripts/sync-dashboard.mjs "<đường dẫn thư mục 4. Nafosted>"
// Mặc định lấy từ J:\My Drive\4. Nafosted (sửa nếu khác).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SRC = process.argv[2] || "J:\\My Drive\\4. Nafosted";
const DST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dashboard-src");
fs.mkdirSync(DST, { recursive: true });

const files = [
  ["NAFOSTED-PROGRESS.html", "dashboard.html"],
  ["nafosted-progress-data.js", "nafosted-progress-data.js"],
];
for (const [src, dst] of files) {
  const from = path.join(SRC, src);
  if (!fs.existsSync(from)) { console.error("⚠ Không thấy:", from); continue; }
  fs.copyFileSync(from, path.join(DST, dst));
  console.log("✓", src, "→ dashboard-src/" + dst);
}
console.log("Xong. Dashboard phục vụ tại /dashboard (CÓ đăng nhập; dữ liệu nhúng inline).");
console.log("Nhớ COMMIT thư mục dashboard-src/ trước khi deploy. Công đồng bộ qua /api/cong.");
