import { TABLES, tableById } from "./data/tables.js";
import { buildConnections, orphanTableIds } from "./data/connections.js";
import { markBrokenReferences } from "./data/referenceIntegrity.js";
import { createState, resetPositions } from "./state.js";
import { renderLegend, bindLegendToggle } from "./render/legend.js";
import { renderSidebar, applySidebarSearch } from "./render/sidebar.js";
import { renderCards, attachCardBehaviors } from "./render/cards.js";
import { renderWires, updateWireVisibility } from "./render/wires.js";
import { createTooltipController } from "./render/tooltip.js";
import { applyFocusStyles } from "./focus.js";
import { applySearchToCards } from "./search.js";
import { CARD_W } from "./constants.js";
import { cardHeight } from "./layout.js";
import { clampZoom, computeFitZoom, tablesBounds, ZOOM_STEP } from "./zoom.js";

export function initApp(dom, rawTables = TABLES) {
  const tables = markBrokenReferences(rawTables);
  const connections = buildConnections(tables);
  const orphanIds = orphanTableIds(tables, connections);
  const state = createState(tables);

  dom.statTables.textContent = String(tables.length);
  dom.statFields.textContent = String(tables.reduce((n, t) => n + t.fields.length, 0));
  dom.statLinks.textContent = String(connections.length);

  renderLegend(dom.legendBody);
  bindLegendToggle(dom.legend, dom.legendToggle);

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
    if (!tables.length) return;
    const bounds = tablesBounds(tables, state.positions, CARD_W, cardHeight);
    const viewport = { width: dom.canvasWrap.clientWidth, height: dom.canvasWrap.clientHeight };
    state.zoom = computeFitZoom(bounds, viewport);
    applyZoom();
    const contentW = (bounds.maxX - bounds.minX) * state.zoom;
    const contentH = (bounds.maxY - bounds.minY) * state.zoom;
    dom.canvasWrap.scrollLeft = bounds.minX * state.zoom - (viewport.width - contentW) / 2;
    dom.canvasWrap.scrollTop = bounds.minY * state.zoom - (viewport.height - contentH) / 2;
  }

  function renderAll() {
    renderSidebar(dom.sidebar, tables, state.focused, (id) => setFocus(state.focused === id ? null : id), orphanIds);
    renderCards(dom.canvasContent, tables, state.positions, orphanIds);
    attachCardBehaviors(dom.canvasContent, state.positions, {
      onCardMoved: () => {
        renderWires(dom.wires, connections, state.positions);
        updateWireVisibility(dom.wires, connections, state);
        applyFocusStyles(dom.canvasContent, connections, state.focused);
      },
      onCardToggled: (id) => setFocus(state.focused === id ? null : id),
      onFieldHover: (row) => {
        const table = tableById(tables, row.dataset.table);
        const field = table.fields.find((f) => f.name === row.dataset.field);
        tooltip.show(field, table.id);
      },
      onFieldMove: (event) => tooltip.move(event),
      onFieldLeave: () => tooltip.hide(),
      onRefEnter: (row) => {
        state.hoveredConn = `${row.dataset.table}.${row.dataset.field}`;
        updateWireVisibility(dom.wires, connections, state);
      },
      onRefLeave: () => {
        state.hoveredConn = null;
        updateWireVisibility(dom.wires, connections, state);
      },
      onRefJump: (targetId) => jumpTo(targetId),
      onTableHover: (tableId) => tooltip.showTable(tableById(tables, tableId)),
      onTableMove: (event) => tooltip.move(event),
      onTableLeave: () => tooltip.hide()
    }, () => state.zoom);
    renderWires(dom.wires, connections, state.positions);
    updateWireVisibility(dom.wires, connections, state);
    applyFocusStyles(dom.canvasContent, connections, state.focused);
  }

  function scrollToCard(tableId) {
    const card = dom.canvasContent.querySelector(`.table-card[data-id="${tableId}"]`);
    if (card) card.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  }

  function jumpTo(tableId) {
    setFocus(tableId);
    scrollToCard(tableId);
  }

  function setFocus(id) {
    state.focused = id;
    if (id) {
      dom.focusBanner.classList.add("is-visible");
      dom.focusName.textContent = id;
    } else {
      dom.focusBanner.classList.remove("is-visible");
    }
    applyFocusStyles(dom.canvasContent, connections, state.focused);
    updateWireVisibility(dom.wires, connections, state);
    renderSidebar(
      dom.sidebar,
      tables,
      state.focused,
      (rowId) => setFocus(state.focused === rowId ? null : rowId),
      orphanIds
    );
  }

  dom.search.addEventListener("input", (e) => {
    state.search = e.target.value;
    applySearchToCards(dom.canvasContent, tables, state.search);
    applySidebarSearch(dom.sidebar, tables, state.search);
  });

  dom.modeFocusBtn.addEventListener("click", () => {
    state.showAll = false;
    dom.modeFocusBtn.classList.add("active");
    dom.modeAllBtn.classList.remove("active");
    updateWireVisibility(dom.wires, connections, state);
  });

  dom.modeAllBtn.addEventListener("click", () => {
    state.showAll = true;
    dom.modeAllBtn.classList.add("active");
    dom.modeFocusBtn.classList.remove("active");
    updateWireVisibility(dom.wires, connections, state);
  });

  dom.focusClear.addEventListener("click", () => setFocus(null));

  dom.resetLayout.addEventListener("click", () => {
    const positions = resetPositions(state);
    dom.canvasContent.querySelectorAll(".table-card").forEach((card) => {
      const pos = positions[card.dataset.id];
      card.style.left = `${pos.x}px`;
      card.style.top = `${pos.y}px`;
    });
    renderWires(dom.wires, connections, state.positions);
    applyFocusStyles(dom.canvasContent, connections, state.focused);
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

  return { state, connections, setFocus };
}
