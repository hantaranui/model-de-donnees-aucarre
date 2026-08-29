import { describe, it, expect } from "vitest";
import { groupTables, renderSidebar } from "../src/render/sidebar.js";

const TABLES = [
  { id: "Utilisateurs", group: "Comptes", fields: [] },
  { id: "Abonnement", group: "Comptes", fields: [] },
  { id: "Formations", group: "Contenu", fields: [] }
];

describe("groupTables", () => {
  it("regroupe les tables par groupe métier", () => {
    const groups = groupTables(TABLES);
    expect([...groups.keys()]).toEqual(["Comptes", "Contenu"]);
    expect(groups.get("Comptes").map((t) => t.id)).toEqual(["Utilisateurs", "Abonnement"]);
    expect(groups.get("Contenu").map((t) => t.id)).toEqual(["Formations"]);
  });
});

describe("renderSidebar", () => {
  it("n'injecte pas un nom de table malveillant comme élément DOM réel", () => {
    const el = document.createElement("div");
    const malicious = [
      { id: `"><img src=x onerror=alert(1)>`, group: "Comptes", fields: [] }
    ];
    renderSidebar(el, malicious, null, () => {});
    expect(el.querySelector("img")).toBeNull();
    expect(el.textContent).toContain("<img");
  });
});
