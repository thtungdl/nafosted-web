// Kết nối Google Drive dưới TÀI KHOẢN của anh Tùng (OAuth refresh token).
// File tạo ra nằm trong My Drive → sync xuống J:\My Drive\4. Nafosted.
import { google } from "googleapis";
import { Readable } from "node:stream";
import { buildSopXlsx } from "./sopXlsx.js";

function driveClient() {
  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2.setCredentials({ refresh_token: process.env.DRIVE_REFRESH_TOKEN });
  return google.drive({ version: "v3", auth: oauth2 });
}

// ---- GENERIC STORE: đọc/ghi nafosted-<type>.json + sidecar .js ----
// type ∈ {cong, giaoviec, sop}
const TYPE_DEFAULT = {
  cong:      { edits: {}, added: [] },
  giaoviec:  { state: {}, custom: [] },
  sop:       { samples: [], batches: [], fields: {}, checks: {}, photos: {}, cvnotes: {} },
  tieuchi:   { map: {} },
  wbs:       { edits: {}, added: [] },   // sửa nội dung công việc + thêm công việc n.n.n
  admin:     { members: [] },   // members: [{ ten, email, perms:[sectionKey...] }]
  baocaotuan:{ reports: [] },   // báo cáo tiến độ tuần theo mẫu Word — mỗi report kèm mảng phụ lục
};

export async function getStore(type) {
  const drive = driveClient();
  const folderId = process.env.NAFOSTED_FOLDER_ID;
  // Tương thích ngược: cong → thử nafosted-cong.json trước, sau đó nafosted-cong-thucte.json
  let id = await fileByName(drive, `nafosted-${type}.json`, folderId);
  if (!id && type === "cong") id = await fileByName(drive, "nafosted-cong-thucte.json", folderId);
  if (!id) return { ...(TYPE_DEFAULT[type] || {}) };
  const res = await drive.files.get({ fileId: id, alt: "media" }, { responseType: "json" });
  return res.data || { ...(TYPE_DEFAULT[type] || {}) };
}

// Danh sách thành viên quản trị (tên/email/quyền) — không bao giờ ném lỗi (tránh khóa đăng nhập).
export async function getAdminMembers() {
  try {
    const s = await getStore("admin");
    return Array.isArray(s.members) ? s.members : [];
  } catch (e) {
    return [];
  }
}

export async function saveStore(type, incoming, editor) {
  const drive = driveClient();
  const folderId = process.env.NAFOSTED_FOLDER_ID;
  const store = await getStore(type);

  if (type === "cong") {
    store.edits = store.edits || {};
    Object.keys(incoming.edits || {}).forEach((k) => { store.edits[k] = incoming.edits[k]; });
    if (incoming.added !== undefined) store.added = incoming.added;
  } else if (type === "giaoviec") {
    // state: tiến độ/duyệt/minh chứng theo mã GV; custom: danh sách phiếu tự tạo (WBS-độc lập)
    if (incoming.state) store.state = incoming.state;
    if (incoming.custom) store.custom = incoming.custom;
  } else if (type === "sop") {
    if (incoming.samples) store.samples = incoming.samples;
    if (incoming.batches) store.batches = incoming.batches;
    if (incoming.photos) store.photos = incoming.photos;
    if (incoming.cvnotes) store.cvnotes = incoming.cvnotes;
    store.fields = store.fields || {};
    Object.keys(incoming.fields || {}).forEach((ma) => { store.fields[ma] = incoming.fields[ma]; });
    store.checks = store.checks || {};
    Object.keys(incoming.checks || {}).forEach((k) => { store.checks[k] = incoming.checks[k]; });
  } else if (type === "admin") {
    if (incoming.members) store.members = incoming.members;
  } else if (type === "wbs") {
    store.edits = store.edits || {};
    Object.keys(incoming.edits || {}).forEach((k) => { store.edits[k] = incoming.edits[k]; });
    if (incoming.added !== undefined) store.added = incoming.added;
  } else if (type === "tieuchi") {
    // map = { "<mã n.n.n>": [ {ten, minhChung}, ... ] } — CHỈ chứa các công việc admin đã ghi đè.
    // Thay TOÀN BỘ map (client gửi trọn bộ override hiện hành) để cho phép xóa override.
    if (incoming.map) store.map = incoming.map;
  } else if (type === "baocaotuan") {
    // GỘP THEO KHÓA (hoTen + tuanSo) — KHÔNG ghi đè cả mảng, để một client có mảng cũ/thiếu
    // KHÔNG BAO GIỜ xóa mất báo cáo của người khác. Thêm/cập nhật từng report; xóa qua deleteIds.
    store.reports = Array.isArray(store.reports) ? store.reports : [];
    const rk = (r) => `${r.hoTen}||${r.tuanSo}`;
    if (Array.isArray(incoming.reports)) {
      for (const r of incoming.reports) {
        const i = store.reports.findIndex((x) => rk(x) === rk(r));
        if (i >= 0) store.reports[i] = r; else store.reports.push(r);
      }
    }
    if (Array.isArray(incoming.deleteIds) && incoming.deleteIds.length) {
      const del = new Set(incoming.deleteIds);
      store.reports = store.reports.filter((x) => !del.has(x.id));
    }
  }

  store.capNhat = new Date().toISOString();
  if (editor) store.editor = editor;

  const json = JSON.stringify(store, null, 2);
  const varName = `NAFOSTED_${type.toUpperCase()}`;
  const js = `window.${varName} = ${JSON.stringify(store)};`;

  await upsertFile(drive, `nafosted-${type}.json`, "application/json", json, folderId);
  await upsertFile(drive, `nafosted-${type}.js`, "application/javascript", js, folderId);
  // Alias cũ cho cong (tương thích sidecar offline)
  if (type === "cong") {
    await upsertFile(drive, "nafosted-cong-thucte.json", "application/json", json, folderId);
    await upsertFile(drive, "nafosted-cong-thucte.js", "application/javascript", js.replace(`NAFOSTED_CONG`, "NAFOSTED_CONG"), folderId);
  }
  // Alias RIÊNG cho giaoviec: bộ não AI (_NAFOSTED.OS/.ai-review/chuan_bi_goi_duyet.mjs) đọc thẳng
  // window.NAFOSTED_GIAOVIEC dạng flat state map {<ma gv>: {...}} — KHÔNG bọc {state,custom}.
  if (type === "giaoviec") {
    const flatState = store.state || {};
    await upsertFile(drive, "nafosted-giaoviec-thucte.js", "application/javascript", `window.NAFOSTED_GIAOVIEC = ${JSON.stringify(flatState)};`, folderId);
  }
  // Auto-convert SOP: mỗi lần đồng bộ JSON → sinh luôn nafosted-sop.xlsx trên Drive.
  // Lỗi tạo xlsx KHÔNG chặn việc lưu JSON (chỉ là bản phụ trợ).
  if (type === "sop") {
    try {
      const xbuf = await buildSopXlsx(store);
      await upsertFile(drive, "nafosted-sop.xlsx",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", xbuf, folderId);
    } catch (e) { /* bỏ qua lỗi xlsx phụ trợ */ }
  }
  return store;
}

// ---- CÔNG THỰC TẾ: đọc/ghi nafosted-cong-thucte.json trong thư mục Nafosted ----
//   NAFOSTED_FOLDER_ID = thư mục chứa dashboard (để bản offline J:\ cũng đồng bộ qua sidecar .js)
async function fileByName(drive, name, folderId) {
  const r = await drive.files.list({
    q: `name='${name.replace(/'/g, "\\'")}' and '${folderId}' in parents and trashed=false`,
    fields: "files(id)", pageSize: 1,
  });
  return r.data.files?.[0]?.id || null;
}
async function upsertFile(drive, name, mimeType, content, folderId) {
  const id = await fileByName(drive, name, folderId);
  if (id) {
    await drive.files.update({ fileId: id, media: { mimeType, body: Readable.from([content]) } });
  } else {
    await drive.files.create({ requestBody: { name, parents: [folderId] }, media: { mimeType, body: Readable.from([content]) } });
  }
}

// ---- Tạo (hoặc tái dùng) thư mục con theo tên trong 1 thư mục cha ----
async function ensureFolder(drive, name, parentId) {
  const q = `name='${name.replace(/'/g, "\\'")}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const found = await drive.files.list({ q, fields: "files(id)", pageSize: 1 });
  if (found.data.files?.length) return found.data.files[0].id;
  const created = await drive.files.create({
    requestBody: { name, mimeType: "application/vnd.google-apps.folder", parents: [parentId] },
    fields: "id",
  });
  return created.data.id;
}
function sanitizeFolderName(name) {
  return String(name).replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, " ").trim().slice(0, 150) || "Khac";
}

// ---- Nộp báo cáo tiến độ: lưu vào Project management system/Raw/<ND>/<mã CV - tên CV>/<tên chuẩn> ----
// Thư mục phân tầng theo WBS (ND → công việc) — một Raw duy nhất, không rải theo người nộp.
export async function uploadReport({ buffer, mimeType, fileName, nd, cvMa, cvTen }) {
  const drive = driveClient();
  const rootId = process.env.NAFOSTED_FOLDER_ID;
  let parentId = await ensureFolder(drive, "Raw", rootId);
  if (nd) parentId = await ensureFolder(drive, sanitizeFolderName(nd), parentId);
  if (cvMa) {
    const sub = cvTen ? `${cvMa} - ${cvTen}` : cvMa;
    parentId = await ensureFolder(drive, sanitizeFolderName(sub), parentId);
  }
  const up = await drive.files.create({
    requestBody: { name: sanitizeFolderName(fileName), parents: [parentId] },
    media: { mimeType: mimeType || "application/octet-stream", body: Readable.from([buffer]) },
    fields: "id,webViewLink",
  });
  return { id: up.data.id, link: up.data.webViewLink };
}

// Chuyển 1 file vào thùng rác Drive (xóa báo cáo đã nộp — khôi phục được).
export async function trashFile(fileId) {
  const drive = driveClient();
  await drive.files.update({ fileId, requestBody: { trashed: true } });
  return { ok: true };
}

export async function getCong() {
  const drive = driveClient();
  const id = await fileByName(drive, "nafosted-cong-thucte.json", process.env.NAFOSTED_FOLDER_ID);
  if (!id) return { edits: {}, added: [] };
  const res = await drive.files.get({ fileId: id, alt: "media" }, { responseType: "json" });
  return res.data || { edits: {}, added: [] };
}

// Gộp chỉnh sửa rồi ghi cả .json (chuẩn) + .js (sidecar cho bản offline J:\)
export async function saveCong(incoming, editor) {
  const drive = driveClient();
  const folderId = process.env.NAFOSTED_FOLDER_ID;
  const store = await getCong();
  store.edits = store.edits || {};
  Object.keys(incoming.edits || {}).forEach((k) => { store.edits[k] = incoming.edits[k]; });
  if (incoming.added) store.added = incoming.added;
  store.capNhat = new Date().toISOString();
  store.editor = editor || store.editor || null;
  await upsertFile(drive, "nafosted-cong-thucte.json", "application/json", JSON.stringify(store, null, 2), folderId);
  await upsertFile(drive, "nafosted-cong-thucte.js", "application/javascript", "window.NAFOSTED_CONG = " + JSON.stringify(store) + ";", folderId);
  return store;
}
