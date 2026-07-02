import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";
import { getStore } from "../../../lib/drive";
import { buildSopXlsx } from "../../../lib/sopXlsx";

export const dynamic = "force-dynamic";

// Tải file Excel (.xlsx) số liệu SOP — dựng tại chỗ từ store sop hiện hành trên Drive.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
  try {
    const store = await getStore("sop");
    const buf = await buildSopXlsx(store);
    return new Response(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="So lieu chiet mau SOP.xlsx"',
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return Response.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
