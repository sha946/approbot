const BASE = "https://my-backend-production-64d0.up.railway.app";

function getToken() {
  return localStorage.getItem("token") || "";
}

function authHeaders() {
  return { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` };
}

// ── Projects ─────────────────────────────────────────────────────
export async function fetchProjects() {
  const res = await fetch(`${BASE}/api/projects`, { headers: authHeaders() });
  if (!res.ok) throw new Error("فشل تحميل المشاريع");
  return res.json();
}

export async function createProject(name, type) {
  const res = await fetch(`${BASE}/api/projects`, {
    method: "POST", headers: authHeaders(),
    body: JSON.stringify({ name, type }),
  });
  if (!res.ok) throw new Error("فشل إنشاء المشروع");
  return res.json();
}

export async function deleteProject(id) {
  await fetch(`${BASE}/api/projects/${id}`, { method: "DELETE", headers: authHeaders() });
}

// Save blocks XML to backend
export async function saveBlocks(id, blocksSave) {
  const res = await fetch(`${BASE}/api/projects/${id}/blocks`, {
    method: "PUT", headers: authHeaders(),
    body: JSON.stringify({ blocksSave }),
  });
  if (!res.ok) throw new Error("فشل حفظ الكتل");
  return res.json();
}

// Load blocks XML from backend — returns { blocksSave: "..." } or { blocksSave: "" }
export async function loadBlocks(id) {
  const res = await fetch(`${BASE}/api/projects/${id}/blocks`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("فشل تحميل الكتل");
  return res.json();
}

// Save draw — sends { drawSave: { strokes, speed } }
export async function saveDraw(id, drawSave) {
  const res = await fetch(`${BASE}/api/projects/${id}/draw`, {
    method: "PUT", headers: authHeaders(),
    body: JSON.stringify({ drawSave }),
  });
  if (!res.ok) throw new Error("فشل حفظ الرسم");
  return res.json();
}

// Load draw — returns { drawSave: { strokes, speed } } or { drawSave: null }
export async function loadDraw(id) {
  const res = await fetch(`${BASE}/api/projects/${id}/draw`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("فشل تحميل الرسم");
  return res.json();
}