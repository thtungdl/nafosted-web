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

// ---- Đọc dữ liệu tiến độ gốc (JSON) ----
export async function getProgress() {
  const drive = driveClient();
  const res = await drive.files.get(
    { fileId: process.env.PROGRESS_FILE_ID, alt: "media" },
    { responseType: "json" }
  );
  return res.data;
}

// ---- Ghi đè dữ liệu tiến độ gốc (khi admin duyệt/gộp) ----
export async function saveProgress(obj) {
  const drive = driveClient();
  await drive.files.update({
    fileId: process.env.PROGRESS_FILE_ID,
    media: {
      mimeType: "application/json",
      body: Readable.from([JSON.stringify(obj, null, 2)]),
    },
  });
}

// ---- Tạo thư mục con cho một lần nộp ----
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

// ---- Lưu một bài nộp: record JSON + các file đính kèm ----
// record: object; files: [{name, mimeType, buffer}]
export async function saveSubmission(record, files = []) {
  const drive = driveClient();
  const stamp = record.submittedAt.replace(/[:T]/g, "-").slice(0, 16);
  const folderName = `${stamp}_${(record.nguoiNop || "anon").replace(/[\\/:*?"<>|]/g, "_")}`;
  const folderId = await ensureFolder(drive, folderName, process.env.SUBMISSIONS_FOLDER_ID);

  const attachMeta = [];
  for (const f of files) {
    const up = await drive.files.create({
      requestBody: { name: f.name, parents: [folderId] },
      media: { mimeType: f.mimeType || "application/octet-stream", body: Readable.from([f.buffer]) },
      fields: "id,name,webViewLink",
    });
    attachMeta.push({ id: up.data.id, name: up.data.name, link: up.data.webViewLink });
  }
  record.dinhKem = attachMeta;

  await drive.files.create({
    requestBody: { name: "submission.json", parents: [folderId] },
    media: { mimeType: "application/json", body: Readable.from([JSON.stringify(record, null, 2)]) },
    fields: "id",
  });
  return { folderId, dinhKem: attachMeta };
}

// ---- GENERIC STORE: đọc/ghi nafosted-<type>.json + sidecar .js ----
// type ∈ {cong, giaoviec, sop}
const TYPE_DEFAULT = {
  cong:      { edits: {}, added: [] },
  giaoviec:  { tasks: {}, submissions: [] },
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
    store.tasks = store.tasks || {};
    if (incoming.state) store.tasks = incoming.state; // ghi đè toàn bộ
    Object.keys(incoming.tasks || {}).forEach((k) => { store.tasks[k] = incoming.tasks[k]; });
    if (incoming.submissions !== undefined) store.submissions = incoming.submissions;
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

// ---- Liệt kê các bài nộp (đọc submission.json trong từng thư mục con) ----
export async function listSubmissions() {
  const drive = driveClient();
  const folders = await drive.files.list({
    q: `'${process.env.SUBMISSIONS_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id,name)",
    orderBy: "createdTime desc",
    pageSize: 200,
  });
  const out = [];
  for (const fol of folders.data.files || []) {
    const j = await drive.files.list({
      q: `name='submission.json' and '${fol.id}' in parents and trashed=false`,
      fields: "files(id)",
      pageSize: 1,
    });
    if (!j.data.files?.length) continue;
    const content = await drive.files.get(
      { fileId: j.data.files[0].id, alt: "media" },
      { responseType: "json" }
    );
    out.push({ folderId: fol.id, ...content.data });
  }
  return out;
}
