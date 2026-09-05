const FILES_URL = 'https://www.googleapis.com/drive/v3/files';
const UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';
const FILE_NAME = 'budget_data.json';

async function authedFetch(url, token, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err = new Error(`Drive API ${res.status}: ${body}`);
    err.status = res.status;
    throw err;
  }
  return res;
}

// Looks for an existing budget_data.json created by this app (drive.file scope
// means this search only ever sees files the app itself created).
export async function findBudgetFile(token) {
  const q = encodeURIComponent(`name='${FILE_NAME}' and trashed=false`);
  const res = await authedFetch(
    `${FILES_URL}?q=${q}&spaces=drive&fields=files(id,name,modifiedTime)`,
    token
  );
  const json = await res.json();
  return json.files && json.files.length ? json.files[0] : null;
}

export async function createBudgetFile(token, dataObj) {
  const boundary = 'budgetpwa_boundary_314159';
  const metadata = { name: FILE_NAME, mimeType: 'application/json' };
  const body =
    `--${boundary}\r\n` +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    'Content-Type: application/json\r\n\r\n' +
    `${JSON.stringify(dataObj)}\r\n` +
    `--${boundary}--`;

  const res = await authedFetch(`${UPLOAD_URL}?uploadType=multipart&fields=id`, token, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  });
  return res.json(); // { id }
}

export async function readBudgetFile(token, fileId) {
  const res = await authedFetch(`${FILES_URL}/${fileId}?alt=media`, token);
  return res.json();
}

export async function updateBudgetFile(token, fileId, dataObj) {
  await authedFetch(`${UPLOAD_URL}/${fileId}?uploadType=media`, token, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dataObj),
  });
}
