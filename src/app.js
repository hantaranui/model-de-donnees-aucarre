import { TABLES, tableById } from "./data/tables.js";
import { buildConnections, orphanTableIds } from "./data/connections.js";
import { markBrokenReferences } from "./data/referenceIntegrity.js";
import { isEffectivelyEmpty } from "./data/documentState.js";
import { computeModelHealth } from "./data/health.js";
import { createState, resetPositions } from "./state.js";
import { renderLegend, bindLegendToggle } from "./render/legend.js";
import { renderHealthPanel } from "./render/health.js";
import { renderSidebar, applySidebarSearch } from "./render/sidebar.js";
import { renderCards, attachCardBehaviors } from "./render/cards.js";
import { renderWires, updateWireVisibility } from "./render/wires.js";
import { createTooltipController } from "./render/tooltip.js";
import { createDraftTableCard } from "./render/draftCard.js";
import { createDraftFieldRow, isChoiceLikeType } from "./render/draftField.js";
import { showConfirmDialog } from "./render/confirmDialog.js";
import { showLinkDraftDialog } from "./render/linkDraftDialog.js";
import { applyFocusStyles } from "./focus.js";
import { applySearchToCards } from "./search.js";
import { CARD_W } from "./constants.js";
import { cardHeight } from "./layout.js";
import { clampZoom, computeFitZoom, tablesBounds, ZOOM_STEP } from "./zoom.js";
import { tableAnchor, elbowPath, canvasPointFromClient } from "./geometry.js";
import { sanitizeLabel, parseChoiceOptions, applyActionsToGrist } from "./data/gristWrite.js";
import { loadFromGrist, fetchRawGristMetadata, fetchRawDataSectionsByTableRef } from "./data/gristSource.js";
import { buildDisplayTables } from "./data/displayModel.js";
import {
  createStagingState,
  isStagingEmpty,
  isStagedTableName,
  addStagedTable,
  removeStagedTable,
  addStagedField,
  removeStagedField,
  stagedFieldsForOwner,
  stagedFieldCount,
  stagedLinkCount,
  validateNewTableName,
  validateNewFieldName,
  buildSchemaSummaryText,
  resolveStagedFieldReferences
} from "./data/staging.js";
import {
  buildAddTableActions,
  buildAddColumnActions,
  buildVisibleColActions,
  buildRawDataFieldActions,
  resolveStagedTableNames,
  findMissingSchemaItems
} from "./data/schemaCommit.js";

const SVG_NS = "http://www.w3.org/2000/svg";

export function initApp(dom, rawTables = TABLES, options = {}) {
  const { isLiveGrist = false } = options;
  const tables = markBrokenReferences(rawTables);
  const state = createState(tables);

  dom.statTables.textContent = String(tables.length);
  dom.statFields.textContent = String(tables.reduce((n, t) => n + t.fields.length, 0));
  dom.statLinks.textContent = String(buildConnections(tables).length);

  let toastTimer = null;
  function showToast(message) {
    dom.toast.textContent = message;
    dom.toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => dom.toast.classList.remove("is-visible"), 6000);
  }

  // Fusionne les tables réelles avec le brouillon de schéma en cours pour le
  // rendu (cartes, liaisons, sidebar, recherche...) — voir data/displayModel.js.
  // Recalculé à chaque usage plutôt que mis en cache : le volume de données
  // en jeu reste modeste, et ça évite tout risque de vue périmée.
  function getDisplay() {
    const displayTables = markBrokenReferences(buildDisplayTables(tables, state.staging));
    const displayConnections = buildConnections(displayTables);
    const displayOrphanIds = orphanTableIds(displayTables, displayConnections);
    return { displayTables, displayConnections, displayOrphanIds };
  }

  renderLegend(dom.legendBody);
  bindLegendToggle(dom.legend, dom.legendToggle);

  renderHealthPanel(dom.healthBody, computeModelHealth(tables), (tableId, fieldName) =>
    fieldName ? jumpToField(tableId, fieldName) : jumpTo(tableId)
  );
  // Bascule collapse/expand générique : même comportement que la légende.
  bindLegendToggle(dom.healthPanel, dom.healthToggle);

  const tooltip = createTooltipController(dom.tooltip, dom.ttTable, dom.ttName, dom.ttType, dom.ttExtra);

  function applyZoom() {
    dom.canvasContent.style.transform = `scale(${state.zoom})`;
    dom.zoomLevel.textContent = `${Math.round(state.zoom * 100)}%`;
  }

  function setZoom(value) {
    state.zoom = clampZoom(value);
    applyZoom();
  }

  // Zoom centré sur un point donné (coordonnées écran) : le point sous le
  // curseur reste visuellement fixe pendant le zoom (molette + Ctrl/Cmd).
  function setZoomAround(value, clientX, clientY) {
    const rect = dom.canvasWrap.getBoundingClientRect();
    const contentX = (dom.canvasWrap.scrollLeft + clientX - rect.left) / state.zoom;
    const contentY = (dom.canvasWrap.scrollTop + clientY - rect.top) / state.zoom;
    setZoom(value);
    dom.canvasWrap.scrollLeft = contentX * state.zoom - (clientX - rect.left);
    dom.canvasWrap.scrollTop = contentY * state.zoom - (clientY - rect.top);
  }

  function fitToView() {
    const { displayTables } = getDisplay();
    if (!displayTables.length) return;
    const bounds = tablesBounds(displayTables, state.positions, CARD_W, cardHeight);
    const viewport = { width: dom.canvasWrap.clientWidth, height: dom.canvasWrap.clientHeight };
    state.zoom = computeFitZoom(bounds, viewport);
    applyZoom();
    const contentW = (bounds.maxX - bounds.minX) * state.zoom;
    const contentH = (bounds.maxY - bounds.minY) * state.zoom;
    dom.canvasWrap.scrollLeft = bounds.minX * state.zoom - (viewport.width - contentW) / 2;
    dom.canvasWrap.scrollTop = bounds.minY * state.zoom - (viewport.height - contentH) / 2;
  }

  // Document vide (nouveau document, ou table par défaut jamais touchée) :
  // un guide de démarrage vaut mieux qu'un canvas vide et silencieux. Réévalué
  // à chaque rendu (pas figé à l'ouverture) : dès qu'une vraie table apparaît
  // (première validation réussie) ou qu'un brouillon est en cours, cet écran
  // ne doit plus jamais recouvrir le canvas.
  function updateEmptyStateOverlay() {
    const shouldShow = isEffectivelyEmpty(tables) && !state.editMode && isStagingEmpty(state.staging);
    dom.emptyState.classList.toggle("is-visible", shouldShow);
  }

  function updateStagingToolbar() {
    const empty = isStagingEmpty(state.staging);
    dom.stagingCount.hidden = empty;
    dom.discardStagingBtn.hidden = empty;
    dom.commitSchemaBtn.hidden = empty;
    if (empty) return;
    const linkCount = stagedLinkCount(state.staging);
    const fieldCount = stagedFieldCount(state.staging) - linkCount;
    const tableCount = state.staging.tables.length;
    const parts = [];
    if (tableCount) parts.push(`${tableCount} table${tableCount > 1 ? "s" : ""}`);
    if (fieldCount) parts.push(`${fieldCount} champ${fieldCount > 1 ? "s" : ""}`);
    if (linkCount) parts.push(`${linkCount} liaison${linkCount > 1 ? "s" : ""}`);
    dom.stagingCount.textContent = `${parts.join(", ")} en attente`;
  }

  function renderAll() {
    const { displayTables, displayConnections, displayOrphanIds } = getDisplay();
    renderSidebar(
      dom.sidebar,
      displayTables,
      state.focused,
      (id) => setFocus(state.focused === id ? null : id),
      displayOrphanIds
    );
    renderCards(dom.canvasContent, displayTables, state.positions, displayOrphanIds, state.editMode);
    attachCardBehaviors(
      dom.canvasContent,
      state.positions,
      {
        onAddField: (tableId, rowEl) => startFieldDraft(tableId, rowEl),
        onRemoveStagedTable: (tableId) => removeStagedTableAndRerender(tableId),
        onRemoveStagedField: (tableId, fieldName) => removeStagedFieldAndRerender(tableId, fieldName),
        onLinkDragStart: (tableId, clientX, clientY) => startLinkDrag(tableId, clientX, clientY),
        onCardMoved: () => {
          renderWires(dom.wires, displayConnections, state.positions);
          updateWireVisibility(dom.wires, displayConnections, state);
          applyFocusStyles(dom.canvasContent, displayConnections, state.focused);
        },
        onCardToggled: (id) => setFocus(state.focused === id ? null : id),
        onFieldHover: (row) => {
          const table = tableById(displayTables, row.dataset.table);
          const field = table.fields.find((f) => f.name === row.dataset.field);
          tooltip.show(field, table.id);
        },
        onFieldMove: (event) => tooltip.move(event),
        onFieldLeave: () => tooltip.hide(),
        onRefEnter: (row) => {
          state.hoveredConn = `${row.dataset.table}.${row.dataset.field}`;
          updateWireVisibility(dom.wires, displayConnections, state);
        },
        onRefLeave: () => {
          state.hoveredConn = null;
          updateWireVisibility(dom.wires, displayConnections, state);
        },
        onRefJump: (targetId) => jumpTo(targetId),
        onTableHover: (tableId) => tooltip.showTable(tableById(displayTables, tableId)),
        onTableMove: (event) => tooltip.move(event),
        onTableLeave: () => tooltip.hide()
      },
      () => state.zoom
    );
    renderWires(dom.wires, displayConnections, state.positions);
    updateWireVisibility(dom.wires, displayConnections, state);
    applyFocusStyles(dom.canvasContent, displayConnections, state.focused);
    updateStagingToolbar();
    updateEmptyStateOverlay();
  }

  // Relit l'état réel du document Grist et rafraîchit l'affichage en place,
  // sans rechargement de page — utilisé juste après une écriture réelle pour
  // vérifier ce qui a vraiment été appliqué avant de l'afficher comme tel
  // (jamais de succès supposé en silence). Plus fiable qu'un rechargement de
  // page (qui repasse par toute la poignée de main Grist) et ça préserve la
  // disposition du canvas (zoom, cartes déplacées à la main).
  async function refreshFromGrist() {
    const freshTables = markBrokenReferences(await loadFromGrist());

    // Une table déjà connue garde sa position (éventuellement déplacée à la
    // main) ; seule une table tout juste apparue reçoit la position calculée
    // par la disposition automatique.
    freshTables.forEach((t) => {
      if (!state.positions[t.id]) {
        state.positions[t.id] = { x: t.x, y: t.y };
        state.defaultPositions[t.id] = { x: t.x, y: t.y };
      }
    });

    tables.length = 0;
    tables.push(...freshTables);

    dom.statTables.textContent = String(tables.length);
    dom.statFields.textContent = String(tables.reduce((n, t) => n + t.fields.length, 0));
    dom.statLinks.textContent = String(buildConnections(tables).length);

    renderAll();
  }

  function scrollToCard(tableId) {
    const card = dom.canvasContent.querySelector(`.table-card[data-id="${CSS.escape(tableId)}"]`);
    if (card) card.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  }

  function jumpTo(tableId) {
    setFocus(tableId);
    scrollToCard(tableId);
  }

  // Cible une ligne de champ précise (ex. depuis le tableau de bord santé) :
  // sur une carte à beaucoup de champs, sauter juste à la table ne suffit
  // pas à repérer laquelle est en cause, surtout si son nom est tronqué dans
  // le panneau — on scrolle jusqu'à la ligne et on la fait flasher.
  function jumpToField(tableId, fieldName) {
    setFocus(tableId);
    const row = dom.canvasContent.querySelector(
      `.table-card[data-id="${CSS.escape(tableId)}"] .field-row[data-field="${CSS.escape(fieldName)}"]`
    );
    if (!row) {
      scrollToCard(tableId);
      return;
    }
    row.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    row.classList.remove("is-jump-target");
    void row.offsetWidth; // relance l'animation même si la même ligne est reciblée coup sur coup
    row.classList.add("is-jump-target");
    row.addEventListener("animationend", () => row.classList.remove("is-jump-target"), { once: true });
  }

  function setFocus(id) {
    state.focused = id;
    if (id) {
      dom.focusBanner.classList.add("is-visible");
      dom.focusName.textContent = id;
    } else {
      dom.focusBanner.classList.remove("is-visible");
    }
    const { displayTables, displayConnections, displayOrphanIds } = getDisplay();
    applyFocusStyles(dom.canvasContent, displayConnections, state.focused);
    updateWireVisibility(dom.wires, displayConnections, state);
    renderSidebar(
      dom.sidebar,
      displayTables,
      state.focused,
      (rowId) => setFocus(state.focused === rowId ? null : rowId),
      displayOrphanIds
    );
  }

  // ---------- Mode édition (V3) ----------
  // Protection n°1 des consignes V3 : en dehors de ce mode, rien de tout ceci
  // n'est même accessible (aucune interaction de création possible).
  function setEditMode(on) {
    state.editMode = on;
    dom.editModeToggle.classList.toggle("is-active", on);
    dom.editModeToggle.setAttribute("aria-pressed", String(on));
    dom.editModeBanner.classList.toggle("is-visible", on);
    if (!on) activeDraftCancel?.();
    renderAll();
  }

  dom.editModeToggle.addEventListener("click", () => setEditMode(!state.editMode));

  // Un seul brouillon éphémère (formulaire de nom) à la fois : pas d'actions
  // groupées (consignes V3), chaque ajout au brouillon reste unitaire et
  // délibéré. Le brouillon de schéma lui-même (state.staging) n'a pas cette
  // limite : on peut y accumuler autant de tables/champs/liaisons qu'on veut
  // avant de valider.
  let activeDraftCancel = null;

  function setActiveDraft(cancelFn) {
    activeDraftCancel = cancelFn;
    dom.canvasContent.classList.add("is-drafting");
    dom.newTableBtn.disabled = true;
  }

  function clearActiveDraft() {
    activeDraftCancel = null;
    dom.canvasContent.classList.remove("is-drafting");
    dom.newTableBtn.disabled = false;
  }

  // Petit formulaire éphémère pour nommer une nouvelle table brouillon —
  // rien n'est écrit dans Grist ici, seulement ajouté à state.staging.
  function startNewTableDraft() {
    if (activeDraftCancel) return;
    const rect = dom.canvasWrap.getBoundingClientRect();
    const zoom = state.zoom || 1;
    // Décale chaque nouvelle table en cascade par rapport aux précédentes
    // déjà en brouillon : sans ça, plusieurs clics sur "Nouvelle table" sans
    // bouger la vue empilent toutes les cartes exactement au même endroit.
    const cascade = state.staging.tables.length * 60;
    const x = Math.max(0, (dom.canvasWrap.scrollLeft + rect.width / 2) / zoom - CARD_W / 2) + cascade;
    const y = Math.max(0, (dom.canvasWrap.scrollTop + rect.height / 2) / zoom - 40) + cascade;
    const card = createDraftTableCard({ x, y });
    dom.canvasContent.appendChild(card);
    setActiveDraft(cancelDraftTable);

    const input = card.querySelector(".draft-name-input");
    const addBtn = card.querySelector(".draft-create");
    const cancelBtn = card.querySelector(".draft-cancel");
    const errorEl = card.querySelector(".draft-error");

    input.addEventListener("input", () => {
      addBtn.disabled = sanitizeLabel(input.value).length === 0;
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !addBtn.disabled) addToStage();
      if (e.key === "Escape") cancelDraftTable();
    });
    cancelBtn.addEventListener("click", () => cancelDraftTable());
    addBtn.addEventListener("click", addToStage);
    input.focus();

    function cancelDraftTable() {
      card.remove();
      clearActiveDraft();
    }

    function addToStage() {
      const name = sanitizeLabel(input.value);
      if (!name) return;
      const error = validateNewTableName(state.staging, tables, name);
      if (error) {
        errorEl.hidden = false;
        errorEl.textContent = error;
        return;
      }
      state.staging = addStagedTable(state.staging, name);
      state.positions[name] = { x, y };
      state.defaultPositions[name] = { x, y };
      cancelDraftTable();
      renderAll();
    }
  }

  dom.newTableBtn.addEventListener("click", () => startNewTableDraft());

  // Petit formulaire éphémère pour nommer un nouveau champ (sur une table
  // réelle ou elle-même en brouillon) — même principe, rien n'est encore
  // écrit dans Grist.
  function startFieldDraft(tableId, addRowEl) {
    if (activeDraftCancel) return;
    const owner = isStagedTableName(state.staging, tableId)
      ? { kind: "staged", id: tableId }
      : { kind: "real", id: tableId };
    const row = createDraftFieldRow();
    addRowEl.insertAdjacentElement("beforebegin", row);
    addRowEl.hidden = true;
    // Le formulaire de champ (plusieurs lignes) grandit la carte au-delà de
    // sa hauteur habituelle : sans ça, ses propres boutons peuvent se
    // retrouver sous la carte suivante dans une disposition dense.
    const card = addRowEl.closest(".table-card");
    if (card) card.style.zIndex = "20";
    setActiveDraft(cancelFieldDraft);

    const nameInput = row.querySelector(".draft-field-name");
    const typeSelect = row.querySelector(".draft-field-type");
    const choicesInput = row.querySelector(".draft-field-choices");
    const addBtn = row.querySelector(".draft-field-create");
    const cancelBtn = row.querySelector(".draft-field-cancel");
    const errorEl = row.querySelector(".draft-field-error");

    function updateChoicesVisibility() {
      choicesInput.hidden = !isChoiceLikeType(typeSelect.value);
    }

    nameInput.addEventListener("input", () => {
      addBtn.disabled = sanitizeLabel(nameInput.value).length === 0;
    });
    nameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !addBtn.disabled) addToStage();
      if (e.key === "Escape") cancelFieldDraft();
    });
    typeSelect.addEventListener("change", updateChoicesVisibility);
    choicesInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !addBtn.disabled) addToStage();
      if (e.key === "Escape") cancelFieldDraft();
    });
    cancelBtn.addEventListener("click", () => cancelFieldDraft());
    addBtn.addEventListener("click", addToStage);
    nameInput.focus();

    function cancelFieldDraft() {
      row.remove();
      addRowEl.hidden = false;
      if (card) card.style.zIndex = "";
      clearActiveDraft();
    }

    function addToStage() {
      const name = sanitizeLabel(nameInput.value);
      if (!name) return;
      const error = validateNewFieldName(state.staging, tables, owner, name);
      if (error) {
        errorEl.hidden = false;
        errorEl.textContent = error;
        return;
      }
      const type = typeSelect.value;
      const choices = isChoiceLikeType(type) ? parseChoiceOptions(choicesInput.value) : [];
      state.staging = addStagedField(state.staging, owner, { name, type, choices });
      cancelFieldDraft();
      renderAll();
    }
  }

  function removeStagedTableAndRerender(tableId) {
    state.staging = removeStagedTable(state.staging, tableId);
    renderAll();
  }

  function removeStagedFieldAndRerender(tableId, fieldName) {
    const owner = isStagedTableName(state.staging, tableId)
      ? { kind: "staged", id: tableId }
      : { kind: "real", id: tableId };
    state.staging = removeStagedField(state.staging, owner, fieldName);
    renderAll();
  }

  // ---------- Tracer une liaison ----------
  // Poignée dédiée sur chaque carte (voir render/cards.js) : mousedown y
  // démarre le tracé, indépendant du déplacement de carte (en-tête). Un trait
  // temporaire suit la souris jusqu'au relâchement sur une autre carte (ou
  // la même — une auto-référence est un cas réel et courant dans Grist).
  let linkDragState = null; // { sourceId, path }

  function startLinkDrag(sourceId, clientX, clientY) {
    if (activeDraftCancel) return;
    const path = document.createElementNS(SVG_NS, "path");
    path.classList.add("wire", "is-drawing");
    dom.wires.appendChild(path);
    linkDragState = { sourceId, path };
    updateLinkDragPath(clientX, clientY);
  }

  function updateLinkDragPath(clientX, clientY) {
    if (!linkDragState) return;
    const rect = dom.canvasWrap.getBoundingClientRect();
    const a = tableAnchor(state.positions, linkDragState.sourceId, 0);
    const b = canvasPointFromClient(
      clientX,
      clientY,
      rect,
      dom.canvasWrap.scrollLeft,
      dom.canvasWrap.scrollTop,
      state.zoom || 1
    );
    linkDragState.path.setAttribute("d", elbowPath(a, b));
  }

  function cancelLinkDrag() {
    if (!linkDragState) return;
    linkDragState.path.remove();
    linkDragState = null;
  }

  window.addEventListener("mousemove", (e) => {
    if (!linkDragState) return;
    updateLinkDragPath(e.clientX, e.clientY);
  });

  window.addEventListener("mouseup", (e) => {
    if (!linkDragState) return;
    const { sourceId, path } = linkDragState;
    path.remove();
    linkDragState = null;
    const targetCard = e.target.closest(".table-card");
    if (!targetCard) return; // relâché en dehors d'une carte : annulation silencieuse
    openLinkDraft(sourceId, targetCard.dataset.id);
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cancelLinkDrag();
  });

  // Boîte de nommage affichée après un tracé réussi (voir
  // render/linkDraftDialog.js) : ajoute un champ Référence/Référence
  // multiple en brouillon sur la table source, ciblant la table de dépose.
  // Noms des champs déjà connus sur la table cible (réels ou eux-mêmes en
  // brouillon) — propose une "colonne à afficher" pour la liaison (visibleCol,
  // voir data/schemaCommit.js), à défaut de quoi Grist affiche l'identifiant
  // interne brut — repéré en pratique sur un vrai document.
  function targetFieldNames(targetId) {
    if (isStagedTableName(state.staging, targetId)) {
      return stagedFieldsForOwner(state.staging, "staged", targetId).map((f) => f.name);
    }
    const table = tableById(tables, targetId);
    return table ? table.fields.map((f) => f.name) : [];
  }

  function openLinkDraft(sourceId, targetId) {
    showLinkDraftDialog(dom, {
      sourceLabel: sourceId,
      targetLabel: targetId,
      defaultName: targetId,
      displayFieldOptions: targetFieldNames(targetId),
      onSubmit: (rawName, type, displayField) => {
        const name = sanitizeLabel(rawName);
        if (!name) return { error: "Le nom du champ ne peut pas être vide." };
        const owner = isStagedTableName(state.staging, sourceId)
          ? { kind: "staged", id: sourceId }
          : { kind: "real", id: sourceId };
        const error = validateNewFieldName(state.staging, tables, owner, name);
        if (error) return { error };
        const ref = isStagedTableName(state.staging, targetId)
          ? { kind: "staged", id: targetId }
          : { kind: "real", id: targetId };
        state.staging = addStagedField(state.staging, owner, { name, type, ref, displayField });
        renderAll();
      }
    });
  }

  // ---------- Validation du brouillon de schéma ----------
  function commitSchema() {
    if (isStagingEmpty(state.staging)) return;
    const summary = buildSchemaSummaryText(state.staging);
    showConfirmDialog(dom, {
      message: isLiveGrist
        ? `Valider ce schéma dans le document Grist ?\n\n${summary}`
        : `Simuler la validation de ce schéma ? Hors document Grist ici : rien n'est écrit, c'est un aperçu local.\n\n${summary}`,
      confirmLabel: "Valider",
      onConfirm: () => submitSchema()
    });
  }

  // Simulation hors document Grist (développement local sans iframe) :
  // applique le brouillon aux données locales et rafraîchit l'affichage,
  // sans rien écrire réellement nulle part.
  function applyStagingLocally(staging) {
    staging.tables.forEach((t) => {
      tables.push({ id: t.name, group: t.group, fields: [] });
      state.positions[t.name] = state.positions[t.name] || { x: 0, y: 0 };
      state.defaultPositions[t.name] = state.defaultPositions[t.name] || { x: 0, y: 0 };
    });
    staging.fields.forEach((f) => {
      const table = tableById(tables, f.owner.id);
      if (!table) return;
      const field = { name: f.name, type: f.type };
      if (f.ref) field.ref = f.ref.id;
      if (f.choices && f.choices.length) field.choices = f.choices;
      table.fields.push(field);
    });
    dom.statTables.textContent = String(tables.length);
    dom.statFields.textContent = String(tables.reduce((n, t) => n + t.fields.length, 0));
    dom.statLinks.textContent = String(buildConnections(tables).length);
  }

  // Écrit le brouillon dans Grist en deux temps (voir data/schemaCommit.js
  // pour le détail et le compromis assumé) : d'abord les tables, puis — une
  // fois qu'elles existent réellement — les colonnes (simples et liaisons),
  // pour ne jamais supposer qu'une colonne peut viser une table créée juste
  // avant dans le même lot sans l'avoir vérifié.
  async function submitSchema() {
    const stagingSnapshot = state.staging;

    if (!isLiveGrist) {
      applyStagingLocally(stagingSnapshot);
      state.staging = createStagingState();
      renderAll();
      showToast("Schéma ajouté (simulation locale, hors document Grist).");
      return;
    }

    dom.commitSchemaBtn.disabled = true;
    dom.discardStagingBtn.disabled = true;
    let phase = "tables";
    try {
      const tableActions = buildAddTableActions(stagingSnapshot);
      // Champs résolus : owner/ref pointant vers des id réels plutôt que vers
      // le nom brouillon d'origine, une fois que sa table existe pour de vrai
      // (voir resolveStagedFieldReferences) — sans cette étape, une colonne
      // visant une table dont le nom demandé contenait un espace ou un autre
      // caractère non valide échoue avec "No such table" côté Grist, quel que
      // soit le nombre de tentatives (rien ne re-résout jamais ce nom).
      let resolvedFields = stagingSnapshot.fields;
      let resolvedTableNames = {};
      if (tableActions.length) {
        const { tableRows: beforeRows } = await fetchRawGristMetadata();
        await applyActionsToGrist(tableActions);
        const { tableRows: afterRows } = await fetchRawGristMetadata();
        resolvedTableNames = resolveStagedTableNames(stagingSnapshot.tables, beforeRows, afterRows);
        resolvedFields = resolveStagedFieldReferences(stagingSnapshot.fields, resolvedTableNames);
      }
      // Les tables existent désormais réellement : on retire cette partie du
      // brouillon ; les champs gardent leur résolution même si la phase 2
      // échoue et qu'il faut relancer juste elle (un nouveau submitSchema
      // relira ces owner/ref déjà réels, sans avoir besoin de tout refaire).
      state.staging = { tables: [], fields: resolvedFields };

      phase = "champs";
      const columnActions = buildAddColumnActions({ fields: resolvedFields });
      if (columnActions.length) await applyActionsToGrist(columnActions);
      // Le schéma existe désormais réellement (tables et colonnes) : le
      // brouillon est entièrement vidé à partir d'ici, quoi qu'il arrive à
      // la phase 3 ci-dessous (réglage cosmétique de la colonne affichée,
      // pas une donnée qui pourrait se retrouver en double si on retentait).
      state.staging = createStagingState();

      let extraStepsWarning = "";
      try {
        // Phase 3 (best-effort, en deux volets) : a) règle visibleCol sur les
        // liaisons pour lesquelles une colonne à afficher a été choisie ; b)
        // ajoute chaque colonne tout juste créée à la section "Données
        // brutes" de sa table, sans quoi elle n'apparaît dans aucune vue
        // existante avant une action manuelle dans Grist (repéré en
        // pratique). Les deux ont besoin des id internes tout juste créés,
        // d'où la relecture brute à ce stade.
        const { tableRows, columnRows } = await fetchRawGristMetadata();
        const visibleColActions = buildVisibleColActions({ fields: resolvedFields }, tableRows, columnRows);
        if (visibleColActions.length) await applyActionsToGrist(visibleColActions);

        const rawDataSectionByTableRef = await fetchRawDataSectionsByTableRef();
        const rawDataFieldActions = buildRawDataFieldActions(
          resolvedFields,
          tableRows,
          columnRows,
          rawDataSectionByTableRef
        );
        if (rawDataFieldActions.length) await applyActionsToGrist(rawDataFieldActions);
      } catch (extraStepsErr) {
        extraStepsWarning =
          " (certains réglages annexes — colonne à afficher des liaisons, visibilité dans Données brutes — n'ont pas pu être appliqués automatiquement ; vérifie dans Grist si besoin.)";
      }

      await refreshFromGrist();
      const { missingTables, missingFields } = findMissingSchemaItems(
        { tables: stagingSnapshot.tables, fields: resolvedFields },
        tables,
        resolvedTableNames
      );
      if (missingTables.length === 0 && missingFields.length === 0) {
        showToast(`Schéma validé — tout apparaît bien dans le document.${extraStepsWarning}`);
      } else {
        const parts = [];
        if (missingTables.length) parts.push(`tables : ${missingTables.join(", ")}`);
        if (missingFields.length) parts.push(`champs : ${missingFields.join(", ")}`);
        showToast(
          `Schéma envoyé, mais certains éléments n'apparaissent pas tels quels (${parts.join(" ; ")}) — vérifie dans Grist.`
        );
      }
    } catch (err) {
      const message = err && err.message ? err.message : err;
      if (phase === "tables") {
        showToast(`Échec de la création des tables : ${message} — le brouillon est conservé, rien n'a été écrit.`);
      } else {
        showToast(
          `Les tables ont été créées, mais l'ajout des colonnes a échoué : ${message} — le brouillon des champs est conservé, tu peux réessayer.`
        );
        try {
          await refreshFromGrist();
        } catch {
          // Tant pis pour l'affichage immédiat des tables nouvellement créées
          // (elles sont bien réelles) : un rechargement manuel les montrera.
        }
      }
    } finally {
      dom.commitSchemaBtn.disabled = false;
      dom.discardStagingBtn.disabled = false;
      renderAll();
    }
  }

  function discardStaging() {
    if (isStagingEmpty(state.staging)) return;
    state.staging = createStagingState();
    renderAll();
  }

  dom.commitSchemaBtn.addEventListener("click", () => commitSchema());
  dom.discardStagingBtn.addEventListener("click", () => discardStaging());

  dom.search.addEventListener("input", (e) => {
    state.search = e.target.value;
    const { displayTables } = getDisplay();
    applySearchToCards(dom.canvasContent, displayTables, state.search);
    applySidebarSearch(dom.sidebar, displayTables, state.search);
  });

  dom.modeFocusBtn.addEventListener("click", () => {
    state.showAll = false;
    dom.modeFocusBtn.classList.add("active");
    dom.modeAllBtn.classList.remove("active");
    updateWireVisibility(dom.wires, getDisplay().displayConnections, state);
  });

  dom.modeAllBtn.addEventListener("click", () => {
    state.showAll = true;
    dom.modeAllBtn.classList.add("active");
    dom.modeFocusBtn.classList.remove("active");
    updateWireVisibility(dom.wires, getDisplay().displayConnections, state);
  });

  dom.focusClear.addEventListener("click", () => setFocus(null));

  dom.resetLayout.addEventListener("click", () => {
    const positions = resetPositions(state);
    dom.canvasContent.querySelectorAll(".table-card").forEach((card) => {
      const pos = positions[card.dataset.id];
      if (!pos) return;
      card.style.left = `${pos.x}px`;
      card.style.top = `${pos.y}px`;
    });
    const { displayConnections } = getDisplay();
    renderWires(dom.wires, displayConnections, state.positions);
    applyFocusStyles(dom.canvasContent, displayConnections, state.focused);
    fitToView();
  });

  dom.canvasContent.addEventListener("mousedown", (e) => {
    if (e.target === dom.canvasContent || e.target === dom.wires) setFocus(null);
  });

  dom.zoomIn.addEventListener("click", () => setZoom(state.zoom * ZOOM_STEP));
  dom.zoomOut.addEventListener("click", () => setZoom(state.zoom / ZOOM_STEP));
  dom.zoomLevel.addEventListener("click", () => setZoom(1));
  dom.zoomFit.addEventListener("click", () => fitToView());

  dom.canvasWrap.addEventListener(
    "wheel",
    (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const factor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
      setZoomAround(state.zoom * factor, e.clientX, e.clientY);
    },
    { passive: false }
  );

  renderAll();

  // Le premier ajustement attend que canvas-wrap ait une taille réelle avant
  // de calculer le zoom/défilement : dans l'iframe d'un widget Grist, le
  // conteneur peut encore mesurer 0×0 au moment où ce script s'exécute, le
  // temps que Grist termine de dimensionner le widget. Sans cette garde, le
  // calcul se fait sur une taille nulle et les tables restent collées en
  // haut à gauche au lieu d'être centrées.
  if (dom.canvasWrap.clientWidth > 0 && dom.canvasWrap.clientHeight > 0) {
    fitToView();
  } else {
    const observer = new ResizeObserver(() => {
      if (dom.canvasWrap.clientWidth > 0 && dom.canvasWrap.clientHeight > 0) {
        observer.disconnect();
        fitToView();
      }
    });
    observer.observe(dom.canvasWrap);
  }

  return { state, setFocus };
}
