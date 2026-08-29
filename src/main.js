import { initApp } from "./app.js";
import { TABLES } from "./data/tables.js";
import { loadFromGrist } from "./data/gristSource.js";
import { isInIframe, withTimeout } from "./data/resolveSource.js";
import { detectParentOrigin } from "./data/gristOrigin.js";
import { loadGristPluginApi } from "./data/loadGristPluginApi.js";

// Purement un filet de sécurité contre une requête vraiment bloquée (réseau
// mort, RPC perdu) : la validation humaine du prompt d'accès complet dans
// Grist peut légitimement prendre bien plus longtemps, donc ce délai reste
// volontairement large.
const GRIST_LOAD_TIMEOUT_MS = 30000;

function byId(id) {
  return document.getElementById(id);
}

const dom = {
  statTables: byId("stat-tables"),
  statFields: byId("stat-fields"),
  statLinks: byId("stat-links"),
  search: byId("search"),
  modeFocusBtn: byId("mode-focus"),
  modeAllBtn: byId("mode-all"),
  resetLayout: byId("reset-layout"),
  sidebar: byId("sidebar"),
  canvasWrap: byId("canvas-wrap"),
  canvasContent: byId("canvas-content"),
  emptyState: byId("empty-state"),
  wires: byId("wires"),
  zoomIn: byId("zoom-in"),
  zoomOut: byId("zoom-out"),
  zoomLevel: byId("zoom-level"),
  zoomFit: byId("zoom-fit"),
  focusBanner: byId("focus-banner"),
  focusName: byId("focus-name"),
  focusClear: byId("focus-clear"),
  legend: byId("legend"),
  legendToggle: byId("legend-toggle"),
  legendBody: byId("legend-body"),
  tooltip: byId("tooltip"),
  ttTable: byId("tt-table"),
  ttName: byId("tt-name"),
  ttType: byId("tt-type"),
  ttExtra: byId("tt-extra")
};

const loadingEl = byId("loading");
const loadErrorEl = byId("load-error");
const loadErrorMessageEl = byId("load-error-message");

function showLoading(visible) {
  loadingEl.classList.toggle("is-visible", visible);
}

function showLoadError(message) {
  loadErrorMessageEl.textContent = message;
  loadErrorEl.classList.add("is-visible");
}

async function resolveTables() {
  if (!isInIframe(window)) return TABLES;

  const origin = detectParentOrigin(window);
  if (!origin) {
    throw new Error(
      "Impossible de déterminer l'origine du document Grist parent (ancestorOrigins et document.referrer indisponibles)."
    );
  }

  showLoading(true);
  try {
    await loadGristPluginApi(origin);

    // Accès complet nécessaire : on lit les tables internes _grist_Tables et
    // _grist_Tables_column, pas seulement la table liée au widget.
    window.grist.ready({ requiredAccess: "full" });

    return await withTimeout(
      loadFromGrist(),
      GRIST_LOAD_TIMEOUT_MS,
      "Le document Grist met trop de temps à répondre."
    );
  } finally {
    showLoading(false);
  }
}

resolveTables()
  .then((tables) => initApp(dom, tables))
  .catch((err) => {
    console.error(err);
    showLoadError(
      "Vérifie que l'accès complet au document a bien été autorisé pour ce widget, puis recharge la page."
    );
  });
