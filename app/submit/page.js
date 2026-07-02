"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Submit() {
  const { data: session } = useSession();
  const [data, setData] = useState(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { fetch("/api/data").then((r) => r.json()).then(setData).catch(() => {}); }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true); setMsg("Đang gửi…");
    try {
      const res = await fetch("/api/submit", { method: "POST", body: new FormData(e.target) });
      const j = await res.json();
      if (j.ok) { setMsg("✅ Đã nộp! Dữ liệu đã lưu vào thư mục Nafosted."); e.target.reset(); }
      else setMsg("❌ Lỗi: " + (j.error || "không rõ"));
    } catch (err) { setMsg("❌ Lỗi mạng: " + err.message); }
    setBusy(false);
  }

  const wrap = { maxWidth: 640, margin: "5vh auto", background: "#fff", border: "1px solid #e3e8f2", borderRadius: 16, padding: 26 };
  const label = { display: "block", fontWeight: 600, margin: "14px 0 5px", fontSize: ".92rem" };
  const inp = { width: "100%", padding: "10px 12px", border: "2px solid #e3e8f2", borderRadius: 10, fontSize: 15, boxSizing: "border-box" };
  const opts = [];
  if (data) {
    (data.noiDung || []).forEach((n) => opts.push([n.ma, `${n.ma} — ${n.ten}`]));
    (data.congViec || []).forEach((c) => opts.push([`${c.nd}:${c.ten}`, `[${c.nd}] ${c.ten}`]));
  }

  return (
    <div style={wrap}>
      <Link href="/" style={{ color: "#223771" }}>← Trang chủ</Link>
      <h1 style={{ color: "#223771", fontSize: "1.25rem" }}>Nộp báo cáo tiến độ</h1>
      <p style={{ color: "#5d667d", fontSize: ".9rem" }}>Người nộp: <b>{session?.user?.name}</b></p>
      <form onSubmit={onSubmit}>
        <label style={label}>Nội dung / công việc</label>
        <select name="doiTuong" style={inp} required>
          <option value="">— Chọn —</option>
          {opts.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
        </select>

        <label style={label}>Tiêu đề công việc (nếu khác)</label>
        <input name="tenCongViec" style={inp} placeholder="Tùy chọn" />

        <label style={label}>Tiến độ (%)</label>
        <input name="tienDo" type="number" min="0" max="100" style={inp} required />

        <label style={label}>Trạng thái</label>
        <select name="trangThai" style={inp}>
          <option value="dangLam">Đang làm</option>
          <option value="xong">Xong</option>
          <option value="chuaBatDau">Chưa bắt đầu</option>
        </select>

        <label style={label}>Ghi chú / kết quả đạt được</label>
        <textarea name="ghiChu" rows={4} style={inp} placeholder="Mô tả ngắn tiến triển, khó khăn, kế hoạch tiếp theo…" />

        <label style={label}>Đính kèm (báo cáo, số liệu, ảnh — tối đa 20 MB/file)</label>
        <input name="dinhKem" type="file" multiple style={inp} />

        <button disabled={busy} style={{ marginTop: 18, background: "#F26522", color: "#fff", border: 0, borderRadius: 10, padding: "12px 20px", fontSize: 16, cursor: "pointer" }}>
          {busy ? "Đang gửi…" : "Nộp báo cáo"}
        </button>
        {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
      </form>
    </div>
  );
}
