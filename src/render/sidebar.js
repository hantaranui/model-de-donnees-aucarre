import { escapeHtml } from "../escapeHtml.js";

// Regroupe les tables par groupe métier, dans l'ordre de première apparition.
export function groupTables(tables) {
  const groups = new Map();
  tables.forEach((t) => {
    if (!groups.has(t.group)) groups.set(t.group, []);
    groups.get(t.group).push(t);
  });
  return groups;
}

export function renderSidebar(sidebarEl, tables, focusedId, onSelect) {
  sidebarEl.innerHTML = "";
  groupTables(tables).forEach((groupTables_, groupName) => {
    const wrap = document.createElement("div");
    wrap.className = "sidebar-group";
    wrap.innerHTML = `<div class="sidebar-group-label">${escapeHtml(groupName)}</div>`;
    groupTables_.forEach((t) => {
      const row = document.createElement("div");
      row.className = "sidebar-row";
      if (t.id === focusedId) row.classList.add("is-focused");
      row.dataset.table = t.id;
      row.innerHTML = `<span class="name">${escapeHtml(t.id)}</span><span class="count">${t.fields.length}</span>`;
      row.addEventListener("click", () => onSelect(t.id));
      wrap.appendChild(row);
    });
    sidebarEl.appendChild(wrap);
  });
}

export function applySidebarSearch(sidebarEl, query) {
  const q = query.trim().toLowerCase();
  sidebarEl.querySelectorAll(".sidebar-row").forEach((row) => {
    const match = q.length === 0 || row.dataset.table.toLowerCase().includes(q);
    row.classList.toggle("is-dim", !match);
  });
}
