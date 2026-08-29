import { TYPE_LABELS } from "../constants.js";
import { escapeHtml } from "../escapeHtml.js";

// Fonction pure : calcule le contenu texte/HTML du tooltip pour un champ
// donné, avec le nom de sa table en en-tête.
export function tooltipContent(field, tableName) {
  let extraHTML = "";
  if (field.description) {
    extraHTML += `<div class="t-description">${escapeHtml(field.description)}</div>`;
  }
  if (field.ref) {
    extraHTML += `<div class="t-label" style="margin-top:6px;">Cible</div><div class="mono">${escapeHtml(field.ref)}</div>`;
    if (field.displayColumn) {
      extraHTML += `<div class="t-display-col">${escapeHtml(field.displayColumn)}</div>`;
    }
  }
  if (field.formula) {
    extraHTML += `<div class="t-label" style="margin-top:6px;">Formule</div><div class="t-formula">${escapeHtml(field.formula)}</div>`;
  }
  return {
    tableName: tableName || "",
    name: field.name,
    typeLabel: TYPE_LABELS[field.type] || field.type,
    extraHTML
  };
}

// Fonction pure : calcule le contenu du tooltip affiché au survol de l'en-tête
// d'une carte (description de table uniquement, pas de type/champ).
export function tableTooltipContent(table) {
  const extraHTML = table.description ? `<div class="t-description">${escapeHtml(table.description)}</div>` : "";
  return { tableName: "", name: table.id, typeLabel: "", extraHTML };
}

// Fonction pure : place le tooltip près du curseur sans déborder de la fenêtre.
export function tooltipPosition(cursor, tooltipRect, viewport, pad = 14) {
  let x = cursor.x + pad;
  let y = cursor.y + pad;
  if (x + tooltipRect.width > viewport.width - 10) x = cursor.x - tooltipRect.width - pad;
  if (y + tooltipRect.height > viewport.height - 10) y = cursor.y - tooltipRect.height - pad;
  return { x, y };
}

export function createTooltipController(tooltipEl, tableEl, nameEl, typeEl, extraEl) {
  function show(field, tableName) {
    const content = tooltipContent(field, tableName);
    tableEl.textContent = content.tableName;
    nameEl.textContent = content.name;
    typeEl.textContent = content.typeLabel;
    extraEl.innerHTML = content.extraHTML;
    tooltipEl.classList.add("is-visible");
  }

  // Ne s'affiche que si la table a une description : sinon il n'y a rien à
  // montrer de plus que le nom déjà visible dans l'en-tête de la carte.
  function showTable(table) {
    if (!table.description) return;
    const content = tableTooltipContent(table);
    tableEl.textContent = content.tableName;
    nameEl.textContent = content.name;
    typeEl.textContent = content.typeLabel;
    extraEl.innerHTML = content.extraHTML;
    tooltipEl.classList.add("is-visible");
  }

  function move(event) {
    const rect = tooltipEl.getBoundingClientRect();
    const pos = tooltipPosition(
      { x: event.clientX, y: event.clientY },
      rect,
      { width: window.innerWidth, height: window.innerHeight }
    );
    tooltipEl.style.left = `${pos.x}px`;
    tooltipEl.style.top = `${pos.y}px`;
  }

  function hide() {
    tooltipEl.classList.remove("is-visible");
  }

  return { show, showTable, move, hide };
}
