import { describe, it, expect } from "vitest";
import {
  buildAddTableActions,
  buildAddColumnActions,
  buildVisibleColActions,
  buildRawDataFieldActions,
  resolveStagedTableNames,
  findMissingSchemaItems
} from "../src/data/schemaCommit.js";
import { createStagingState, addStagedTable, addStagedField } from "../src/data/staging.js";

describe("buildAddTableActions", () => {
  it("une action AddTable par table brouillon, dans l'ordre", () => {
    let staging = addStagedTable(createStagingState(), "Commandes");
    staging = addStagedTable(staging, "Clients");
    expect(buildAddTableActions(staging)).toEqual([
      ["AddTable", "Commandes", []],
      ["AddTable", "Clients", []]
    ]);
  });
});

describe("buildAddColumnActions", () => {
  it("champ simple", () => {
    const staging = addStagedField(createStagingState(), { kind: "real", id: "Utilisateurs" }, {
      name: "Age",
      type: "int"
    });
    expect(buildAddColumnActions(staging)).toEqual([
      ["AddColumn", "Utilisateurs", "Age", { type: "Int", label: "Age" }]
    ]);
  });

  it("champ Choix avec options : widgetOptions renseigné", () => {
    const staging = addStagedField(createStagingState(), { kind: "real", id: "Utilisateurs" }, {
      name: "Statut",
      type: "choice",
      choices: ["Actif", "Inactif"]
    });
    const [action] = buildAddColumnActions(staging);
    expect(action[3].widgetOptions).toBe(JSON.stringify({ choices: ["Actif", "Inactif"] }));
  });

  it("liaison Référence : type Ref:Cible construit à partir du nom réel de la cible", () => {
    const staging = addStagedField(createStagingState(), { kind: "real", id: "Commandes" }, {
      name: "Client",
      type: "ref",
      ref: { kind: "real", id: "Clients" }
    });
    expect(buildAddColumnActions(staging)).toEqual([
      ["AddColumn", "Commandes", "Client", { type: "Ref:Clients", label: "Client" }]
    ]);
  });

  it("liaison Référence multiple : type RefList:Cible", () => {
    const staging = addStagedField(createStagingState(), { kind: "real", id: "Formations" }, {
      name: "Chapitres",
      type: "reflist",
      ref: { kind: "staged", id: "Chapitre_stats" }
    });
    const [action] = buildAddColumnActions(staging);
    expect(action[3].type).toBe("RefList:Chapitre_stats");
  });

  it("nettoie le libellé en un colId valide", () => {
    const staging = addStagedField(createStagingState(), { kind: "real", id: "Utilisateurs" }, {
      name: "Date de naissance",
      type: "date"
    });
    const [action] = buildAddColumnActions(staging);
    expect(action[2]).toBe("Date_de_naissance");
    expect(action[3].label).toBe("Date de naissance");
  });
});

describe("buildVisibleColActions", () => {
  const tableRows = [
    { id: 10, tableId: "Commandes" },
    { id: 20, tableId: "Clients" }
  ];
  const columnRows = [
    { id: 101, parentId: 10, colId: "Client", label: "Client" },
    { id: 201, parentId: 20, colId: "Nom", label: "Nom" },
    { id: 202, parentId: 20, colId: "Ville", label: "Ville" }
  ];

  it("construit ModifyColumn avec l'id interne de la colonne à afficher", () => {
    const staging = addStagedField(createStagingState(), { kind: "real", id: "Commandes" }, {
      name: "Client",
      type: "ref",
      ref: { kind: "real", id: "Clients" },
      displayField: "Nom"
    });
    expect(buildVisibleColActions(staging, tableRows, columnRows)).toEqual([
      ["ModifyColumn", "Commandes", "Client", { visibleCol: 201 }]
    ]);
  });

  it("ignore un champ sans displayField choisi", () => {
    const staging = addStagedField(createStagingState(), { kind: "real", id: "Commandes" }, {
      name: "Client",
      type: "ref",
      ref: { kind: "real", id: "Clients" }
    });
    expect(buildVisibleColActions(staging, tableRows, columnRows)).toEqual([]);
  });

  it("ignore un champ qui n'est pas une liaison", () => {
    const staging = addStagedField(createStagingState(), { kind: "real", id: "Commandes" }, {
      name: "Montant",
      type: "numeric"
    });
    expect(buildVisibleColActions(staging, tableRows, columnRows)).toEqual([]);
  });

  it("ignore silencieusement si la colonne à afficher est introuvable dans la relecture", () => {
    const staging = addStagedField(createStagingState(), { kind: "real", id: "Commandes" }, {
      name: "Client",
      type: "ref",
      ref: { kind: "real", id: "Clients" },
      displayField: "Inconnue"
    });
    expect(buildVisibleColActions(staging, tableRows, columnRows)).toEqual([]);
  });
});

describe("resolveStagedTableNames", () => {
  it("associe chaque table brouillon à la ligne apparue après la phase 1, dans l'ordre de création", () => {
    const stagedTables = [{ name: "Table 1", group: "Brouillon" }, { name: "Clients", group: "Brouillon" }];
    const before = [{ id: 1, tableId: "Utilisateurs" }];
    const after = [
      { id: 1, tableId: "Utilisateurs" },
      { id: 2, tableId: "Table1" }, // Grist a retiré l'espace du nom demandé "Table 1"
      { id: 3, tableId: "Clients" }
    ];
    expect(resolveStagedTableNames(stagedTables, before, after)).toEqual({
      "Table 1": "Table1",
      Clients: "Clients"
    });
  });

  it("renvoie un objet vide quand aucune nouvelle table n'apparaît", () => {
    const stagedTables = [{ name: "Commandes", group: "Brouillon" }];
    const rows = [{ id: 1, tableId: "Utilisateurs" }];
    expect(resolveStagedTableNames(stagedTables, rows, rows)).toEqual({});
  });
});

describe("buildRawDataFieldActions", () => {
  const tableRows = [{ id: 10, tableId: "Commandes" }];
  const columnRows = [{ id: 101, parentId: 10, colId: "Montant", label: "Montant" }];
  const rawDataSectionByTableRef = new Map([[10, 4]]); // section 4 = Données brutes de Commandes

  it("ajoute la colonne tout juste créée à la section Données brutes de sa table", () => {
    const staging = addStagedField(createStagingState(), { kind: "real", id: "Commandes" }, {
      name: "Montant",
      type: "numeric"
    });
    expect(buildRawDataFieldActions(staging.fields, tableRows, columnRows, rawDataSectionByTableRef)).toEqual([
      ["AddRecord", "_grist_Views_section_field", null, { parentId: 4, colRef: 101 }]
    ]);
  });

  it("ignore silencieusement si la table n'a pas de section Données brutes connue", () => {
    const staging = addStagedField(createStagingState(), { kind: "real", id: "Autre" }, {
      name: "Champ",
      type: "text"
    });
    expect(buildRawDataFieldActions(staging.fields, tableRows, columnRows, rawDataSectionByTableRef)).toEqual([]);
  });

  it("ignore silencieusement si la colonne est introuvable dans la relecture", () => {
    const staging = addStagedField(createStagingState(), { kind: "real", id: "Commandes" }, {
      name: "Inconnue",
      type: "text"
    });
    expect(buildRawDataFieldActions(staging.fields, tableRows, columnRows, rawDataSectionByTableRef)).toEqual([]);
  });
});

describe("findMissingSchemaItems", () => {
  it("aucun élément manquant quand tout apparaît dans la relecture", () => {
    let staging = addStagedTable(createStagingState(), "Commandes");
    staging = addStagedField(staging, { kind: "staged", id: "Commandes" }, { name: "Montant", type: "numeric" });
    const freshTables = [{ id: "Commandes", fields: [{ name: "Montant", type: "numeric" }] }];
    expect(findMissingSchemaItems(staging, freshTables)).toEqual({ missingTables: [], missingFields: [] });
  });

  it("signale une table absente de la relecture", () => {
    const staging = addStagedTable(createStagingState(), "Commandes");
    expect(findMissingSchemaItems(staging, [])).toEqual({ missingTables: ["Commandes"], missingFields: [] });
  });

  it("signale un champ absent (table présente mais sans ce champ)", () => {
    const staging = addStagedField(createStagingState(), { kind: "real", id: "Utilisateurs" }, {
      name: "Age",
      type: "int"
    });
    const freshTables = [{ id: "Utilisateurs", fields: [] }];
    const result = findMissingSchemaItems(staging, freshTables);
    expect(result.missingFields).toEqual(["Age (Utilisateurs)"]);
  });

  it("ne signale pas une table à tort quand Grist a adapté son nom (résolu via resolvedTableNames)", () => {
    const staging = addStagedTable(createStagingState(), "Table 1");
    const freshTables = [{ id: "Table1", fields: [] }];
    const result = findMissingSchemaItems(staging, freshTables, { "Table 1": "Table1" });
    expect(result.missingTables).toEqual([]);
  });
});
