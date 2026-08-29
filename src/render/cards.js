import { icon } from "../icons.js";
import { GROUP_COLORS } from "../constants.js";
import { escapeHtml } from "../escapeHtml.js";

export function fieldRowHTML(tableId, field, idx) {
  const isRef = field.type === "ref" || field.type === "reflist";
  const safeName = escapeHtml(field.name);
  const safeRef = escapeHtml(field.ref);
  return `<div class="field-row ${isRef ? "is-ref" : ""}" data-table="${escapeHtml(tableId)}" data-field="${safeName}" data-idx="${idx}">
      ${icon(field.type)}
      <span class="fname${field.description ? " has-desc" : ""}">${safeName}</span>
      ${field.formula ? '<span class="ftag">ƒx</span>' : ""}
      ${isRef ? `<span class="fref-target" data-jump="${safeRef}">→ ${safeRef}</span>` : ""}
    </div>`;
}

function cardHTML(table, isOrphan) {
  const safeId = escapeHtml(table.id);
  return `
    <div class="card-header">
      <span class="dot"></span>
      <span class="tname${table.description ? " has-desc" : ""}">${safeId}</span>
      ${isOrphan ? '<span class="otag" title="Aucune liaison entrante ni sortante">Isolée</span>' : ""}
      <span class="fcount">${table.fields.length}</span>
    </div>
    <div class="card-body">
      ${table.fields.map((f, i) => fieldRowHTML(table.id, f, i)).join("")}
    </div>`;
}

export function renderCards(canvasContent, tables, positions, orphanIds = new Set()) {
  canvasContent.querySelectorAll(".table-card").forEach((el) => el.remove());
  tables.forEach((t) => {
    const pos = positions[t.id];
    const card = document.createElement("div");
    card.className = "table-card";
    card.dataset.id = t.id;
    card.style.left = `${pos.x}px`;
    card.style.top = `${pos.y}px`;
    card.style.setProperty("--group-color", GROUP_COLORS[t.group] || "#59736E");
    card.innerHTML = cardHTML(t, orphanIds.has(t.id));
    canvasContent.appendChild(card);
  });
}

// callbacks: { onCardMoved(tableId), onCardToggled(tableId), onFieldHover(row, event),
//              onFieldMove(event), onFieldLeave(), onRefEnter(row), onRefLeave(),
//              onRefJump(targetTableId), onTableHover(tableId, event), onTableMove(event),
//              onTableLeave() }
// getZoom: () => number courant du zoom, pour convertir un déplacement de
// souris (pixels écran) en déplacement dans l'espace non zoomé du canvas.
export function attachCardBehaviors(canvasContent, positions, callbacks, getZoom = () => 1) {
  canvasContent.querySelectorAll(".table-card").forEach((card) => {
    const header = card.querySelector(".card-header");
    let dragging = false;
    let moved = false;
    let startX, startY, origX, origY;

    header.addEventListener("mousedown", (e) => {
      dragging = true;
      moved = false;
      startX = e.clientX;
      startY = e.clientY;
      const pos = positions[card.dataset.id];
      origX = pos.x;
      origY = pos.y;
      card.classList.add("is-dragging");
      e.preventDefault();
    });

    header.addEventListener("mouseenter", () => callbacks.onTableHover(card.dataset.id));
    header.addEventListener("mousemove", (e) => callbacks.onTableMove(e));
    header.addEventListener("mouseleave", () => callbacks.onTableLeave());

    window.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
      if (!moved) return;
      const zoom = getZoom() || 1;
      const pos = positions[card.dataset.id];
      pos.x = Math.max(0, origX + dx / zoom);
      pos.y = Math.max(0, origY + dy / zoom);
      card.style.left = `${pos.x}px`;
      card.style.top = `${pos.y}px`;
      callbacks.onCardMoved(card.dataset.id);
    });

    window.addEventListener("mouseup", () => {
      if (!dragging) return;
      dragging = false;
      card.classList.remove("is-dragging");
      if (!moved) callbacks.onCardToggled(card.dataset.id);
    });

    card.querySelectorAll(".field-row").forEach((row) => {
      row.addEventListener("mouseenter", (e) => callbacks.onFieldHover(row, e));
      row.addEventListener("mousemove", (e) => callbacks.onFieldMove(e));
      row.addEventListener("mouseleave", () => callbacks.onFieldLeave());

      if (row.classList.contains("is-ref")) {
        row.addEventListener("mouseenter", () => callbacks.onRefEnter(row));
        row.addEventListener("mouseleave", () => callbacks.onRefLeave());
        const jump = row.querySelector(".fref-target");
        if (jump) {
          jump.addEventListener("click", (e) => {
            e.stopPropagation();
            callbacks.onRefJump(jump.dataset.jump);
          });
        }
      }
    });
  });
}
