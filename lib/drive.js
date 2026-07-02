// Kết nối Google Drive dưới TÀI KHOẢN của anh Tùng (OAuth refresh token).
// File tạo ra nằm trong My Drive → sync xuống J:\My Drive\4. Nafosted.
import { google } from "googleapis";
import { Readable } from "node:stream";

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
  sop:       { samples: [], fields: {}, checks: {} },
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
    store.fields = store.fields || {};
    Object.keys(incoming.fields || {}).forEach((ma) => { store.fields[ma] = incoming.fields[ma]; });
    store.checks = store.checks || {};
    Object.keys(incoming.checks || {}).forEach((k) => { store.checks[k] = incoming.checks[k]; });
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
