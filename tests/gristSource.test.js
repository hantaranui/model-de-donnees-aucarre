import { describe, it, expect } from "vitest";
import { toRecords, buildTablesFromGristMetadata } from "../src/data/gristSource.js";

describe("toRecords", () => {
  it("transforme un objet orienté colonnes en tableau de lignes", () => {
    const colValues = { id: [1, 2], tableId: ["A", "B"] };
    expect(toRecords(colValues)).toEqual([
      { id: 1, tableId: "A" },
      { id: 2, tableId: "B" }
    ]);
  });

  it("renvoie un tableau vide sans colonne id", () => {
    expect(toRecords({})).toEqual([]);
  });
});

describe("buildTablesFromGristMetadata", () => {
  const tableRows = [
    { id: 1, tableId: "Utilisateurs", summarySourceTable: 0 },
    { id: 2, tableId: "Formations", summarySourceTable: 0 },
    { id: 3, tableId: "GristSummary_6_Formations", summarySourceTable: 2 }
  ];

  const columnRows = [
    { id: 10, parentId: 1, parentPos: 2, colId: "Abonnement", type: "Ref:Abonnement", label: "Abonnement", isFormula: false, formula: "" },
    { id: 11, parentId: 1, parentPos: 1, colId: "Nom", type: "Text", label: "Nom", isFormula: false, formula: "" },
    { id: 12, parentId: 1, parentPos: 3, colId: "manualSort", type: "ManualSortPos", label: "", isFormula: false, formula: "" },
    { id: 20, parentId: 2, parentPos: 1, colId: "Titre", type: "Text", label: "Titre", isFormula: false, formula: "" },
    {
      id: 21,
      parentId: 2,
      parentPos: 2,
      colId: "JoursRestants",
      type: "Int",
      label: "JoursRestants",
      isFormula: true,
      formula: "rec.Date - TODAY()"
    },
    { id: 30, parentId: 3, parentPos: 1, colId: "count", type: "Int", label: "count", isFormula: true, formula: "" }
  ];

  it("exclut les tables de synthèse (summarySourceTable) et les tables internes _grist_*", () => {
    const tables = buildTablesFromGristMetadata(tableRows, columnRows);
    expect(tables.map((t) => t.id)).toEqual(["Utilisateurs", "Formations"]);
  });

  it("trie les champs par parentPos et exclut les colonnes techniques", () => {
    const tables = buildTablesFromGristMetadata(tableRows, columnRows);
    const utilisateurs = tables.find((t) => t.id === "Utilisateurs");
    expect(utilisateurs.fields.map((f) => f.name)).toEqual(["Nom", "Abonnement"]);
  });

  it("traduit le type brut et conserve la table cible d'une référence", () => {
    const tables = buildTablesFromGristMetadata(tableRows, columnRows);
    const abonnementField = tables.find((t) => t.id === "Utilisateurs").fields.find((f) => f.name === "Abonnement");
    expect(abonnementField).toMatchObject({ type: "ref", ref: "Abonnement" });
  });

  it("attache la formule uniquement quand isFormula est vrai et qu'il y a un texte", () => {
    const tables = buildTablesFromGristMetadata(tableRows, columnRows);
    const formations = tables.find((t) => t.id === "Formations");
    expect(formations.fields.find((f) => f.name === "Titre").formula).toBeUndefined();
    expect(formations.fields.find((f) => f.name === "JoursRestants").formula).toBe("rec.Date - TODAY()");
  });

  it("assigne à chaque table une position calculée", () => {
    const tables = buildTablesFromGristMetadata(tableRows, columnRows);
    tables.forEach((t) => {
      expect(typeof t.x).toBe("number");
      expect(typeof t.y).toBe("number");
    });
  });
});
