import { describe, it, expect } from "vitest";
import { computeModelHealth, isUntouchedTable } from "../src/data/health.js";

describe("computeModelHealth", () => {
  it("liste les colonnes en type générique (table + champ)", () => {
    const tables = [
      {
        id: "A",
        fields: [
          { name: "X", type: "text", isGeneric: true },
          { name: "Y", type: "int" }
        ]
      }
    ];
    expect(computeModelHealth(tables).genericFields).toEqual([{ table: "A", field: "X" }]);
  });

  it("liste les références cassées (brokenRef)", () => {
    const tables = [
      {
        id: "A",
        fields: [{ name: "Ref", type: "ref", ref: "Inexistante", brokenRef: true, displayColumn: undefined }]
      }
    ];
    expect(computeModelHealth(tables).brokenRefFields).toEqual([{ table: "A", field: "Ref" }]);
  });

  it("liste les références sans colonne affichée configurée", () => {
    const tables = [
      { id: "A", fields: [{ name: "Ref", type: "ref", ref: "B" }] },
      { id: "B", fields: [] }
    ];
    expect(computeModelHealth(tables).missingDisplayColumnFields).toEqual([{ table: "A", field: "Ref" }]);
  });

  it("n'ajoute pas une référence à la liste quand displayColumn est résolu", () => {
    const tables = [
      { id: "A", fields: [{ name: "Ref", type: "ref", ref: "B", displayColumn: "Nom" }] },
      { id: "B", fields: [] }
    ];
    expect(computeModelHealth(tables).missingDisplayColumnFields).toEqual([]);
  });

  it("n'ajoute pas un champ non-référence à la liste des colonnes affichées manquantes", () => {
    const tables = [{ id: "A", fields: [{ name: "Nom", type: "text" }] }];
    expect(computeModelHealth(tables).missingDisplayColumnFields).toEqual([]);
  });

  it("liste les colonnes encore à l'état 'Colonne vide' (isEmptyColumn)", () => {
    const tables = [
      {
        id: "A",
        fields: [
          { name: "Calc", type: "text", isEmptyColumn: true },
          { name: "Autre", type: "text", formula: "1+1" }
        ]
      }
    ];
    expect(computeModelHealth(tables).emptyColumnFields).toEqual([{ table: "A", field: "Calc" }]);
  });

  it("liste les tables encore à l'état de création", () => {
    const tables = [
      {
        id: "Table1",
        fields: [
          { name: "A", type: "text", isGeneric: true },
          { name: "B", type: "text", isGeneric: true },
          { name: "C", type: "text", isGeneric: true }
        ]
      },
      { id: "Utilisateurs", fields: [{ name: "Nom", type: "text" }] }
    ];
    expect(computeModelHealth(tables).untouchedTables).toEqual(["Table1"]);
  });

  it("renvoie des listes vides sur un modèle sans problème", () => {
    const tables = [
      { id: "A", fields: [{ name: "Nom", type: "text" }, { name: "Ref", type: "ref", ref: "B", displayColumn: "Nom" }] },
      { id: "B", fields: [{ name: "Nom", type: "text" }] }
    ];
    const health = computeModelHealth(tables);
    expect(health.genericFields).toEqual([]);
    expect(health.brokenRefFields).toEqual([]);
    expect(health.missingDisplayColumnFields).toEqual([]);
    expect(health.emptyColumnFields).toEqual([]);
    expect(health.untouchedTables).toEqual([]);
  });
});

describe("isUntouchedTable", () => {
  it("reconnaît la table par défaut A/B/C toutes génériques", () => {
    const table = {
      fields: [
        { name: "A", isGeneric: true },
        { name: "B", isGeneric: true },
        { name: "C", isGeneric: true }
      ]
    };
    expect(isUntouchedTable(table)).toBe(true);
  });

  it("ignore l'ordre des colonnes", () => {
    const table = {
      fields: [
        { name: "C", isGeneric: true },
        { name: "A", isGeneric: true },
        { name: "B", isGeneric: true }
      ]
    };
    expect(isUntouchedTable(table)).toBe(true);
  });

  it("refuse si une colonne a été renommée", () => {
    const table = {
      fields: [
        { name: "A", isGeneric: true },
        { name: "B", isGeneric: true },
        { name: "Nom", isGeneric: true }
      ]
    };
    expect(isUntouchedTable(table)).toBe(false);
  });

  it("refuse si une colonne a un vrai type", () => {
    const table = {
      fields: [
        { name: "A", isGeneric: true },
        { name: "B", isGeneric: true },
        { name: "C" }
      ]
    };
    expect(isUntouchedTable(table)).toBe(false);
  });

  it("refuse si la table n'a pas exactement 3 colonnes", () => {
    const table = { fields: [{ name: "A", isGeneric: true }, { name: "B", isGeneric: true }] };
    expect(isUntouchedTable(table)).toBe(false);
  });
});
