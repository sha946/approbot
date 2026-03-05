// Centralised API helper — imports this instead of hardcoding fetch() everywhere
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
  return res.json();           // array of project objects
}

export async function createProject(name, type) {
  const res = await fetch(`${BASE}/api/projects`, {
    method: "POST", headers: authHeaders(),
    body: JSON.stringify({ name, type }),
  });
  if (!res.ok) throw new Error("فشل إنشاء المشروع");
  return res.json();           // new project object
}

export async function deleteProject(id) {
  await fetch(`${BASE}/api/projects/${id}`, { method: "DELETE", headers: authHeaders() });
}

export async function saveBlocks(id, blocksSave) {
  await fetch(`${BASE}/api/projects/${id}/blocks`, {
    method: "PUT", headers: authHeaders(),
    body: JSON.stringify({ blocksSave }),
  });
}

export async function saveDraw(id, drawSave) {
  await fetch(`${BASE}/api/projects/${id}/draw`, {
    method: "PUT", headers: authHeaders(),
    body: JSON.stringify({ drawSave }),
  });
}