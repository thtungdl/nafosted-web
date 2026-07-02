import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";
import { uploadReport } from "../../../lib/drive";

export const dynamic = "force-dynamic";

// Nộp báo cáo tiến độ cá nhân (nút "📤 Nộp báo cáo" trên thẻ việc) — lưu vào
// "4. Nafosted/Project management system/Raw/<ND>/<mã công việc - tên công việc>/<tên chuẩn>".
// Tên file + thư mục tự động theo mã công việc (số thứ tự) + tên công việc cụ thể, một Raw
// duy nhất dùng chung cho cả đề tài (không rải theo người nộp).
// Lưu ý: Vercel giới hạn kích thước request body (~4.5 MB trên gói Hobby) — file lớn hơn sẽ lỗi.
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });

  try {
    const form = await req.formData();
    const file = form.get("file");
    const tenChuan = form.get("tenChuan");
    const nd = form.get("nd") || "";
    const cvMa = form.get("cvMa") || "";
    const cvTen = form.get("cvTen") || "";

    if (!file || typeof file === "string") {
      return Response.json({ ok: false, error: "Thiếu file" }, { status: 400 });
    }
    if (!tenChuan) {
      return Response.json({ ok: false, error: "Thiếu tên chuẩn" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadReport({
      buffer,
      mimeType: file.type || "application/octet-stream",
      fileName: tenChuan,
      nd,
      cvMa,
      cvTen,
    });

    return Response.json({ ok: true, ...result });
  } catch (e) {
    return Response.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
