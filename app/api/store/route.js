import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";
import { getStore, saveStore } from "../../../lib/drive";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = ["cong", "giaoviec", "sop", "tieuchi", "admin"];

/**
 * GET /api/store?type=<type>
 * Đọc dữ liệu store cho type chỉ định (cong | giaoviec | sop).
 */
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") || "cong").replace("_state", "");
  if (!ALLOWED_TYPES.includes(type))
    return Response.json({ error: "invalid type" }, { status: 400 });
  // Danh mục quản trị (thành viên/quyền) — CHỈ admin đọc được.
  if (type === "admin" && !session.user?.isAdmin)
    return Response.json({ error: "forbidden" }, { status: 403 });

  try {
    return Response.json(await getStore(type));
  } catch (e) {
    return Response.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

/**
 * POST /api/store
 * Body: { type: "sop"|"giaoviec"|"cong", ...data }
 * Gộp dữ liệu vào store Drive + ghi sidecar .js (đồng bộ về J:\).
 */
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const type = (body.type || "cong").replace("_state", "");
    if (!ALLOWED_TYPES.includes(type))
      return Response.json({ error: "invalid type" }, { status: 400 });
    // Bộ tiêu chí ĐẠT + danh mục quản trị — CHỈ admin được sửa.
    if ((type === "tieuchi" || type === "admin") && !session.user?.isAdmin)
      return Response.json({ error: "forbidden" }, { status: 403 });

    const editor = session.user?.email || session.user?.name || "?";
    const store = await saveStore(type, body, editor);
    return Response.json({ ok: true, capNhat: store.capNhat, editor, type });
  } catch (e) {
    return Response.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
