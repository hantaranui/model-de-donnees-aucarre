import { describe, it, expect, beforeEach } from "vitest";
import { applyFocusStyles } from "../src/focus.js";

const connections = [{ key: "A.ref", from: "A", to: "B" }];

function makeCanvas(ids) {
  const canvas = document.createElement("div");
  ids.forEach((id) => {
    const card = document.createElement("div");
    card.className = "table-card";
    card.dataset.id = id;
    canvas.appendChild(card);
  });
  return canvas;
}

function classesOf(canvas, id) {
  return [...canvas.querySelector(`[data-id="${id}"]`).classList];
}

describe("applyFocusStyles", () => {
  let canvas;

  beforeEach(() => {
    canvas = makeCanvas(["A", "B", "C"]);
  });

  it("sans focus : aucune carte n'est marquée active ou estompée", () => {
    applyFocusStyles(canvas, connections, null);
    ["A", "B", "C"].forEach((id) => expect(classesOf(canvas, id)).toEqual(["table-card"]));
  });

  it("la table focalisée et ses tables liées sont actives, les autres estompées", () => {
    applyFocusStyles(canvas, connections, "A");
    expect(classesOf(canvas, "A")).toContain("is-active");
    expect(classesOf(canvas, "B")).toContain("is-active");
    expect(classesOf(canvas, "C")).toContain("is-dimmed");
  });

  it("un nouvel appel retire l'état précédent avant d'appliquer le nouveau focus", () => {
    applyFocusStyles(canvas, connections, "A");
    applyFocusStyles(canvas, connections, "C");
    expect(classesOf(canvas, "A")).toContain("is-dimmed");
    expect(classesOf(canvas, "B")).toContain("is-dimmed");
    expect(classesOf(canvas, "C")).toContain("is-active");
  });
});
