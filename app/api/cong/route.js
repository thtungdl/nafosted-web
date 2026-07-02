import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";
import { getCong, saveCong } from "../../../lib/drive";

export const dynamic = "force-dynamic";

// Đọc công thực tế (đa thiết bị, realtime)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
  try {
    return Response.json(await getCong());
  } catch (e) {
    return Response.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

// Ghi công thực tế (gộp chỉnh sửa) — ghi nhận người sửa + thời điểm
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
  try {
    const body = await req.json(); // { edits:{}, added:[] }
    const editor = session.user?.email || session.user?.name || "?";
    const store = await saveCong(body, editor);
    return Response.json({ ok: true, capNhat: store.capNhat, editor });
  } catch (e) {
    return Response.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
