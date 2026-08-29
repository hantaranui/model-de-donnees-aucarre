import { describe, it, expect } from "vitest";
import { groupTables, renderSidebar, applySidebarSearch } from "../src/render/sidebar.js";

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

  it("marque une table isolée avec un indicateur dédié", () => {
    const el = document.createElement("div");
    const tables = [{ id: "Isolee", group: "Tables", fields: [] }];
    renderSidebar(el, tables, null, () => {}, new Set(["Isolee"]));
    expect(el.querySelector(".sidebar-row .orphan-dot")).not.toBeNull();
  });

  it("n'ajoute pas d'indicateur pour une table liée", () => {
    const el = document.createElement("div");
    const tables = [{ id: "Liee", group: "Tables", fields: [] }];
    renderSidebar(el, tables, null, () => {}, new Set());
    expect(el.querySelector(".sidebar-row .orphan-dot")).toBeNull();
  });
});

describe("applySidebarSearch", () => {
  const tables = [
    { id: "Utilisateurs", group: "Comptes", fields: [{ name: "Email", type: "text" }] },
    {
      id: "Abonnement",
      group: "Comptes",
      fields: [{ name: "JoursRestants", type: "int", formula: "rec.DateExpiration - TODAY()" }]
    }
  ];

  function renderedSidebar() {
    const el = document.createElement("div");
    renderSidebar(el, tables, null, () => {});
    return el;
  }

  it("n'estompe aucune table quand la requête est vide", () => {
    const el = renderedSidebar();
    applySidebarSearch(el, tables, "");
    el.querySelectorAll(".sidebar-row").forEach((row) => expect(row.classList.contains("is-dim")).toBe(false));
  });

  it("n'estompe pas une table dont une formule correspond, même sans match sur le nom", () => {
    const el = renderedSidebar();
    applySidebarSearch(el, tables, "today");
    const row = el.querySelector('.sidebar-row[data-table="Abonnement"]');
    expect(row.classList.contains("is-dim")).toBe(false);
  });

  it("estompe une table sans aucun match", () => {
    const el = renderedSidebar();
    applySidebarSearch(el, tables, "zzz");
    el.querySelectorAll(".sidebar-row").forEach((row) => expect(row.classList.contains("is-dim")).toBe(true));
  });
});
