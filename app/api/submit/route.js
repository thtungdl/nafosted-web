import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";
import { saveSubmission } from "../../../lib/drive";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_FILE = 20 * 1024 * 1024; // 20 MB / file

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });

  try {
    const form = await req.formData();
    const record = {
      nguoiNop: session.user.name || session.user.email,
      email: session.user.email,
      doiTuong: form.get("doiTuong") || "",        // mã ND hoặc công việc
      tenCongViec: form.get("tenCongViec") || "",
      tienDo: Number(form.get("tienDo") || 0),       // 0..100
      trangThai: form.get("trangThai") || "dangLam",
      ghiChu: form.get("ghiChu") || "",
      submittedAt: new Date().toISOString(),
    };

    const files = [];
    for (const entry of form.getAll("dinhKem")) {
      if (typeof entry === "object" && entry.size > 0) {
        if (entry.size > MAX_FILE) {
          return Response.json({ error: `File "${entry.name}" vượt 20 MB` }, { status: 413 });
        }
        const buffer = Buffer.from(await entry.arrayBuffer());
        files.push({ name: entry.name, mimeType: entry.type, buffer });
      }
    }

    const result = await saveSubmission(record, files);
    return Response.json({ ok: true, ...result });
  } catch (e) {
    return Response.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
