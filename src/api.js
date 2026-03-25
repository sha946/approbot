const STORAGE_KEY = "robo_projects";

const getAll = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
const saveAll = (projects) => localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));

// ── Projects ─────────────────────────────────────────────────────
export function fetchProjects() {
  return Promise.resolve(getAll());
}

export function createProject(name, type) {
  const project = {
    _id: Date.now().toString(),
    name,
    type,
    createdAt: new Date().toISOString(),
  };
  const projects = getAll();
  projects.unshift(project);
  saveAll(projects);
  return Promise.resolve(project);
}

export function deleteProject(id) {
  saveAll(getAll().filter(p => p._id !== id));
  return Promise.resolve({ success: true });
}

// ── Blocks ────────────────────────────────────────────────────────
export function saveBlocks(id, blocksSave) {
  const projects = getAll().map(p => p._id === id ? { ...p, blocksSave } : p);
  saveAll(projects);
  return Promise.resolve({ blocksSave });
}

export function loadBlocks(id) {
  const project = getAll().find(p => p._id === id);
  return Promise.resolve({ blocksSave: project?.blocksSave || "" });
}

// ── Draw ──────────────────────────────────────────────────────────
export function saveDraw(id, drawSave) {
  const projects = getAll().map(p => p._id === id ? { ...p, drawSave } : p);
  saveAll(projects);
  return Promise.resolve({ drawSave });
}

export function loadDraw(id) {
  const project = getAll().find(p => p._id === id);
  return Promise.resolve({ drawSave: project?.drawSave || null });
}

// ── Kids ──────────────────────────────────────────────────────────
export function saveKids(id, kidsSave) {
  const projects = getAll().map(p => p._id === id ? { ...p, kidsSave } : p);
  saveAll(projects);
  return Promise.resolve({ kidsSave });
}

export function loadKids(id) {
  const project = getAll().find(p => p._id === id);
  return Promise.resolve({ kidsSave: project?.kidsSave || null });
}