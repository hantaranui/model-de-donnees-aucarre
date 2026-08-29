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
    {
      id: 10,
      parentId: 1,
      parentPos: 2,
      colId: "Abonnement",
      type: "Ref:Abonnement",
      label: "Abonnement",
      isFormula: false,
      formula: "",
      visibleCol: 20
    },
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
    expect(tables.map((t) => t.id).sort()).toEqual(["Formations", "Utilisateurs"]);
  });

  it("trie les tables par ordre alphabétique plutôt que par ordre de création", () => {
    // _grist_Tables renvoie les tables dans leur ordre de création (ici
    // Utilisateurs avant Formations) : ce n'est ni visible ni modifiable
    // depuis Grist, donc on impose un ordre prévisible.
    const tables = buildTablesFromGristMetadata(tableRows, columnRows);
    expect(tables.map((t) => t.id)).toEqual(["Formations", "Utilisateurs"]);
  });

  it("trie naturellement les suffixes numériques (T2 avant T10)", () => {
    const rows = [
      { id: 1, tableId: "T10_Suivi", summarySourceTable: 0 },
      { id: 2, tableId: "T2_Suivi", summarySourceTable: 0 }
    ];
    const tables = buildTablesFromGristMetadata(rows, []);
    expect(tables.map((t) => t.id)).toEqual(["T2_Suivi", "T10_Suivi"]);
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

  it("résout visibleCol vers le libellé de la colonne affichée de la table cible", () => {
    const tables = buildTablesFromGristMetadata(tableRows, columnRows);
    const abonnementField = tables.find((t) => t.id === "Utilisateurs").fields.find((f) => f.name === "Abonnement");
    expect(abonnementField.displayColumn).toBe("Titre");
  });

  it("n'ajoute pas displayColumn quand visibleCol n'est pas défini", () => {
    const tables = buildTablesFromGristMetadata(tableRows, columnRows);
    const formations = tables.find((t) => t.id === "Formations");
    expect(formations.fields.find((f) => f.name === "JoursRestants").displayColumn).toBeUndefined();
  });

  it("n'ajoute pas displayColumn si visibleCol pointe vers une colonne inexistante", () => {
    const rows = [{ id: 1, tableId: "A", summarySourceTable: 0 }];
    const cols = [
      { id: 10, parentId: 1, parentPos: 1, colId: "Ref", type: "Ref:B", label: "Ref", isFormula: false, formula: "", visibleCol: 999 }
    ];
    const tables = buildTablesFromGristMetadata(rows, cols);
    expect(tables[0].fields[0].displayColumn).toBeUndefined();
  });

  it("attache la formule uniquement quand isFormula est vrai et qu'il y a un texte", () => {
    const tables = buildTablesFromGristMetadata(tableRows, columnRows);
    const formations = tables.find((t) => t.id === "Formations");
    expect(formations.fields.find((f) => f.name === "Titre").formula).toBeUndefined();
    expect(formations.fields.find((f) => f.name === "JoursRestants").formula).toBe("rec.Date - TODAY()");
  });

  it("reprend la description d'une table quand _grist_Tables en fournit une", () => {
    const rows = [{ id: 1, tableId: "A", summarySourceTable: 0, description: "Une table de test." }];
    const tables = buildTablesFromGristMetadata(rows, []);
    expect(tables[0].description).toBe("Une table de test.");
  });

  it("n'ajoute pas de description de table quand elle est vide", () => {
    const rows = [{ id: 1, tableId: "A", summarySourceTable: 0, description: "" }];
    const tables = buildTablesFromGristMetadata(rows, []);
    expect(tables[0].description).toBeUndefined();
  });

  it("reprend la description d'une colonne quand _grist_Tables_column en fournit une", () => {
    const rows = [{ id: 1, tableId: "A", summarySourceTable: 0 }];
    const cols = [
      {
        id: 10,
        parentId: 1,
        parentPos: 1,
        colId: "Nom",
        type: "Text",
        label: "Nom",
        isFormula: false,
        formula: "",
        description: "Le nom complet."
      }
    ];
    const tables = buildTablesFromGristMetadata(rows, cols);
    expect(tables[0].fields[0].description).toBe("Le nom complet.");
  });

  it("n'ajoute pas de description de colonne quand elle est absente", () => {
    const tables = buildTablesFromGristMetadata(tableRows, columnRows);
    const utilisateurs = tables.find((t) => t.id === "Utilisateurs");
    expect(utilisateurs.fields.find((f) => f.name === "Nom").description).toBeUndefined();
  });

  it("résout reverseCol vers la table et le champ portant la colonne miroir", () => {
    const rows = [
      { id: 1, tableId: "Formations", summarySourceTable: 0 },
      { id: 2, tableId: "Chapitre_stats", summarySourceTable: 0 }
    ];
    const cols = [
      {
        id: 10,
        parentId: 1,
        parentPos: 1,
        colId: "Chapitres",
        type: "RefList:Chapitre_stats",
        label: "Chapitres",
        isFormula: false,
        formula: "",
        reverseCol: 20
      },
      {
        id: 20,
        parentId: 2,
        parentPos: 1,
        colId: "Formation",
        type: "Ref:Formations",
        label: "Formation",
        isFormula: false,
        formula: "",
        reverseCol: 10
      }
    ];
    const tables = buildTablesFromGristMetadata(rows, cols);
    const chapitresField = tables.find((t) => t.id === "Formations").fields[0];
    expect(chapitresField.reverseField).toEqual({ table: "Chapitre_stats", name: "Formation" });
  });

  it("n'ajoute pas reverseField quand reverseCol n'est pas défini", () => {
    const tables = buildTablesFromGristMetadata(tableRows, columnRows);
    const abonnementField = tables.find((t) => t.id === "Utilisateurs").fields.find((f) => f.name === "Abonnement");
    expect(abonnementField.reverseField).toBeUndefined();
  });

  it("regroupe les tables par préfixe de nom partagé (T01_, T02_...)", () => {
    const rows = [
      { id: 1, tableId: "T01_Client", summarySourceTable: 0 },
      { id: 2, tableId: "T02_Commande", summarySourceTable: 0 },
      { id: 3, tableId: "Divers", summarySourceTable: 0 }
    ];
    const tables = buildTablesFromGristMetadata(rows, []);
    expect(tables.find((t) => t.id === "T01_Client").group).toBe("T");
    expect(tables.find((t) => t.id === "T02_Commande").group).toBe("T");
    expect(tables.find((t) => t.id === "Divers").group).toBe("Tables");
  });

  it("assigne à chaque table une position calculée", () => {
    const tables = buildTablesFromGristMetadata(tableRows, columnRows);
    tables.forEach((t) => {
      expect(typeof t.x).toBe("number");
      expect(typeof t.y).toBe("number");
    });
  });
});
