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
  editModeToggle: byId("edit-mode-toggle"),
  editModeBanner: byId("edit-mode-banner"),
  newTableBtn: byId("new-table-btn"),
  stagingCount: byId("staging-count"),
  discardStagingBtn: byId("discard-staging-btn"),
  commitSchemaBtn: byId("commit-schema-btn"),
  confirmDialog: byId("confirm-dialog"),
  confirmMessage: byId("confirm-message"),
  confirmConfirmBtn: byId("confirm-confirm"),
  confirmCancelBtn: byId("confirm-cancel"),
  linkDraftDialog: byId("link-draft-dialog"),
  linkDraftSource: byId("link-draft-source"),
  linkDraftTarget: byId("link-draft-target"),
  linkDraftName: byId("link-draft-name"),
  linkDraftType: byId("link-draft-type"),
  linkDraftDisplayCol: byId("link-draft-display-col"),
  linkDraftError: byId("link-draft-error"),
  linkDraftConfirmBtn: byId("link-draft-confirm"),
  linkDraftCancelBtn: byId("link-draft-cancel"),
  toast: byId("toast"),
  legend: byId("legend"),
  legendToggle: byId("legend-toggle"),
  legendBody: byId("legend-body"),
  healthPanel: byId("health-panel"),
  healthToggle: byId("health-toggle"),
  healthBody: byId("health-body"),
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
  if (!isInIframe(window)) return { tables: TABLES, isLiveGrist: false };

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
    // _grist_Tables_column, pas seulement la table liée au widget. Le même
    // accès permet aussi l'écriture (applyUserActions) utilisée par le mode
    // édition de la V3.
    window.grist.ready({ requiredAccess: "full" });

    const tables = await withTimeout(
      loadFromGrist(),
      GRIST_LOAD_TIMEOUT_MS,
      "Le document Grist met trop de temps à répondre."
    );
    return { tables, isLiveGrist: true };
  } finally {
    showLoading(false);
  }
}

resolveTables()
  .then(({ tables, isLiveGrist }) => initApp(dom, tables, { isLiveGrist }))
  .catch((err) => {
    console.error(err);
    showLoadError(
      "Vérifie que l'accès complet au document a bien été autorisé pour ce widget, puis recharge la page."
    );
  });
