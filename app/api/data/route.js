import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";
import { getProgress, listSubmissions } from "../../../lib/drive";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
  try {
    const [progress, submissions] = await Promise.all([getProgress(), listSubmissions()]);
    // Chỉ admin mới thấy chi tiết các bài nộp chờ duyệt
    const subs = session.user.isAdmin ? submissions : submissions.map((s) => ({
      nguoiNop: s.nguoiNop, doiTuong: s.doiTuong, submittedAt: s.submittedAt,
    }));
    return Response.json({ ...progress, _submissions: subs });
  } catch (e) {
    return Response.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
