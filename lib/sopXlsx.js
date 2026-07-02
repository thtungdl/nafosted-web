// Dựng workbook Excel (.xlsx) từ store SOP {samples, batches, fields, checks}.
// Dùng chung cho: (1) auto-convert khi đồng bộ (lib/drive.js saveStore), (2) route /api/export-sop.
import ExcelJS from "exceljs";

const NAVY = "FF223771";
const CALC = "FFE3F5EA";
const THIN = { style: "thin", color: { argb: "FFCDD6E8" } };
const BORDER = { top: THIN, left: THIN, right: THIN, bottom: THIN };

function num(v) {
  const s = String(v == null ? "" : v).trim().replace(",", ".");
  if (s === "") return null;
  const n = parseFloat(s);
  return isFinite(n) ? n : null;
}

const REQ = ["ham_am", "m_bot", "m_coc", "m_coc_cao", "m_ong", "m_ong_cao"];

export async function buildSopXlsx(store) {
  store = store || {};
  const fields = store.fields || {};
  const checks = store.checks || {};
  const batches = store.batches || [];

  // thứ tự mẫu theo mẻ + map mã -> tên mẻ
  const ma2me = {};
  const order = [];
  batches.forEach((b) => (b.samples || []).forEach((ma) => {
    ma2me[ma] = b.ten || b.id || "";
    if (!order.includes(ma)) order.push(ma);
  }));
  (store.samples || []).forEach((ma) => { if (!order.includes(ma)) order.push(ma); });

  const wb = new ExcelJS.Workbook();
  wb.creator = "NAFOSTED dashboard";

  // ---- Sheet 1: Số liệu chiết mẫu ----
  const ws = wb.addWorksheet("Số liệu chiết mẫu", { views: [{ state: "frozen", ySplit: 1 }] });
  const cols = [
    ["Mẻ chiết", 14, "s"], ["Mã dược liệu", 14, "s"], ["Ngày chiết", 12, "s"], ["Người chiết", 16, "s"],
    ["Hàm ẩm (%)", 11, "n2"], ["m bột (g)", 11, "n4"], ["m cốc rỗng (g)", 13, "n4"], ["m cốc+cao (g)", 13, "n4"],
    ["m cao khô (g)", 13, "c4"], ["Hiệu suất (%)", 12, "c2"],
    ["m ống rỗng (g)", 13, "n4"], ["m ống+cao (g)", 13, "n4"], ["m cao lưu (g)", 13, "c4"],
    ["Nơi lưu", 14, "s"], ["Tình trạng in vitro", 16, "s"], ["Ngày gửi", 12, "s"], ["Nơi nhận", 12, "s"], ["Ghi chú", 24, "s"],
  ];
  ws.columns = cols.map((c) => ({ width: c[1] }));
  const hr = ws.getRow(1);
  hr.height = 30;
  cols.forEach((c, i) => {
    const cell = hr.getCell(i + 1);
    cell.value = c[0];
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = BORDER;
  });
  order.forEach((ma) => {
    const d = fields[ma] || {};
    const ham_am = num(d.ham_am), m_bot = num(d.m_bot), m_coc = num(d.m_coc),
      m_coc_cao = num(d.m_coc_cao), m_ong = num(d.m_ong), m_ong_cao = num(d.m_ong_cao);
    const mcao = (m_coc_cao != null && m_coc != null) ? (m_coc_cao - m_coc) : null;
    const denom = (m_bot != null && ham_am != null) ? (m_bot * (1 - ham_am / 100)) : null;
    const hs = (mcao != null && denom) ? (mcao / denom * 100) : null;
    const mluu = (m_ong_cao != null && m_ong != null) ? (m_ong_cao - m_ong) : null;
    const vals = [ma2me[ma] || "", ma, d.ngay || "", d.nguoi || "",
      ham_am, m_bot, m_coc, m_coc_cao, mcao, hs, m_ong, m_ong_cao, mluu,
      d.noi_luu || "", d.tt_invitro || "", d.ngay_gui || "", d.noi_nhan_invitro || "", d.ghichu || ""];
    const row = ws.addRow(vals);
    cols.forEach((c, i) => {
      const cell = row.getCell(i + 1);
      const t = c[2];
      cell.border = BORDER;
      cell.alignment = { horizontal: t === "s" ? "left" : "center", vertical: "middle", wrapText: t === "s" };
      if (t === "n2" || t === "c2") cell.numFmt = "0.00";
      else if (t === "n4" || t === "c4") cell.numFmt = "0.0000";
      if (t[0] === "c") cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: CALC } };
    });
  });
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: cols.length } };

  // ---- Sheet 2: Tiến độ chiết ----
  const ws2 = wb.addWorksheet("Tiến độ chiết", { views: [{ state: "frozen", ySplit: 1 }] });
  const cols2 = [["Mẻ chiết", 14], ["Mã dược liệu", 14], ["Đủ số liệu", 12],
    ["Ô checklist đã tick — chuẩn bị", 18], ["Ô checklist đã tick — chiết", 18]];
  ws2.columns = cols2.map((c) => ({ width: c[1] }));
  const hr2 = ws2.getRow(1); hr2.height = 30;
  cols2.forEach((c, i) => {
    const cell = hr2.getCell(i + 1);
    cell.value = c[0];
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = BORDER;
  });
  const ticks = (ma, proc) => {
    let done = 0;
    Object.keys(checks).forEach((k) => {
      const p = k.split("::");
      if (p.length === 4 && p[0] === "sop2-sample" && p[1] === proc && p[2] === ma) {
        (checks[k] || []).forEach((x) => { if (x) done++; });
      }
    });
    return done;
  };
  order.forEach((ma) => {
    const d = fields[ma] || {};
    const du = REQ.every((f) => String(d[f] == null ? "" : d[f]).trim() !== "");
    const row = ws2.addRow([ma2me[ma] || "", ma, du ? "Có" : "Chưa", ticks(ma, "prep"), ticks(ma, "extract")]);
    row.eachCell((cell, i) => {
      cell.border = BORDER;
      cell.alignment = { horizontal: i <= 2 ? "left" : "center", vertical: "middle" };
    });
  });

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}
