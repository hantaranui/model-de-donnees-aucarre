import { connectedTables } from "./data/connections.js";

export function applyFocusStyles(canvasContent, connections, focusedId) {
  const related = focusedId ? connectedTables(connections, focusedId) : null;
  canvasContent.querySelectorAll(".table-card").forEach((card) => {
    const id = card.dataset.id;
    card.classList.remove("is-active", "is-dimmed");
    if (!focusedId) return;
    if (id === focusedId || (related && related.has(id))) {
      card.classList.add("is-active");
    } else {
      card.classList.add("is-dimmed");
    }
  });
}
