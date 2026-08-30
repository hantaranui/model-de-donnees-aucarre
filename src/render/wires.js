import { fieldAnchor, tableAnchor, connectorPath } from "../geometry.js";

const SVG_NS = "http://www.w3.org/2000/svg";

export function renderWires(svg, connections, positions) {
  svg.innerHTML = "";
  const frag = document.createDocumentFragment();
  connections.forEach((c) => {
    const a = fieldAnchor(positions, c.from, c.fieldIndex);
    const b = c.bidirectional
      ? fieldAnchor(positions, c.to, c.toFieldIndex, "left")
      : tableAnchor(positions, c.to, c.targetOffset);

    const path = document.createElementNS(SVG_NS, "path");
    path.classList.add("wire");
    if (c.isStaged) path.classList.add("is-staged");
    path.dataset.key = c.key;
    path.setAttribute("d", connectorPath(a, b, c.kind));
    frag.appendChild(path);
  });
  svg.appendChild(frag);
}

// Fonction pure : détermine les classes CSS et l'opacité à appliquer à un fil
// selon l'état courant (focus, mode "toutes les liaisons", survol).
export function wireVisualState(conn, state) {
  const isFocusRelated = Boolean(state.focused) && (conn.from === state.focused || conn.to === state.focused);
  const isHovered = state.hoveredConn === conn.key;

  if (isHovered) return { classes: ["is-hovered"], opacity: "" };

  if (state.focused) {
    if (isFocusRelated) return { classes: ["is-active"], opacity: "" };
    if (state.showAll) return { classes: [], opacity: 0.12 };
    return { classes: ["is-hidden"], opacity: "" };
  }

  if (state.showAll) return { classes: [], opacity: "" };
  return { classes: ["is-hidden"], opacity: "" };
}

export function updateWireVisibility(svg, connections, state) {
  const byKey = new Map(connections.map((c) => [c.key, c]));
  svg.querySelectorAll(".wire").forEach((el) => {
    const conn = byKey.get(el.dataset.key);
    if (!conn) return;
    el.classList.remove("is-active", "is-hovered", "is-hidden");
    const { classes, opacity } = wireVisualState(conn, state);
    classes.forEach((c) => el.classList.add(c));
    el.style.opacity = opacity === "" ? "" : String(opacity);
  });
}
