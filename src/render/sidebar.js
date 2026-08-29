import { escapeHtml } from "../escapeHtml.js";
import { tableSearchResult } from "../search.js";

// Regroupe les tables par groupe métier, dans l'ordre de première apparition.
export function groupTables(tables) {
  const groups = new Map();
  tables.forEach((t) => {
    if (!groups.has(t.group)) groups.set(t.group, []);
    groups.get(t.group).push(t);
  });
  return groups;
}

export function renderSidebar(sidebarEl, tables, focusedId, onSelect, orphanIds = new Set()) {
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
      const orphanMark = orphanIds.has(t.id)
        ? '<span class="orphan-dot" title="Aucune liaison entrante ni sortante">●</span>'
        : "";
      row.innerHTML = `<span class="name">${escapeHtml(t.id)}</span>${orphanMark}<span class="count">${t.fields.length}</span>`;
      row.addEventListener("click", () => onSelect(t.id));
      wrap.appendChild(row);
    });
    sidebarEl.appendChild(wrap);
  });
}

// Estompe une table dans la sidebar seulement si ni elle ni aucun de ses
// champs ne correspond à la recherche (même critère que sur le canvas :
// nom, formule ou description — voir tableSearchResult).
export function applySidebarSearch(sidebarEl, tables, query) {
  const byId = new Map(tables.map((t) => [t.id, t]));
  sidebarEl.querySelectorAll(".sidebar-row").forEach((row) => {
    const table = byId.get(row.dataset.table);
    const { dim } = tableSearchResult(table, query);
    row.classList.toggle("is-dim", dim);
  });
}
