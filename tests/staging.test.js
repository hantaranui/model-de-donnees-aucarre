import { describe, it, expect } from "vitest";
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
} from "../src/data/staging.js";

describe("createStagingState / isStagingEmpty", () => {
  it("commence vide", () => {
    expect(isStagingEmpty(createStagingState())).toBe(true);
  });
});

describe("addStagedTable / removeStagedTable", () => {
  it("ajoute une table brouillon", () => {
    const staging = addStagedTable(createStagingState(), "Commandes");
    expect(isStagedTableName(staging, "Commandes")).toBe(true);
    expect(isStagingEmpty(staging)).toBe(false);
  });

  it("retire une table brouillon", () => {
    let staging = addStagedTable(createStagingState(), "Commandes");
    staging = removeStagedTable(staging, "Commandes");
    expect(isStagedTableName(staging, "Commandes")).toBe(false);
  });

  it("en cascade, retire les champs dont elle est propriétaire", () => {
    let staging = addStagedTable(createStagingState(), "Commandes");
    staging = addStagedField(staging, { kind: "staged", id: "Commandes" }, { name: "Statut", type: "text" });
    staging = removeStagedTable(staging, "Commandes");
    expect(stagedFieldsForOwner(staging, "staged", "Commandes")).toEqual([]);
  });

  it("en cascade, retire les champs (ailleurs) qui la référencent comme cible", () => {
    let staging = createStagingState();
    staging = addStagedTable(staging, "Clients");
    staging = addStagedField(staging, { kind: "real", id: "Commandes" }, {
      name: "Client",
      type: "ref",
      ref: { kind: "staged", id: "Clients" }
    });
    staging = removeStagedTable(staging, "Clients");
    expect(stagedFieldsForOwner(staging, "real", "Commandes")).toEqual([]);
  });
});

describe("addStagedField / removeStagedField", () => {
  it("ajoute puis retire un champ sur une table réelle", () => {
    const owner = { kind: "real", id: "Utilisateurs" };
    let staging = addStagedField(createStagingState(), owner, { name: "Age", type: "int" });
    expect(stagedFieldsForOwner(staging, "real", "Utilisateurs")).toHaveLength(1);
    staging = removeStagedField(staging, owner, "Age");
    expect(stagedFieldsForOwner(staging, "real", "Utilisateurs")).toEqual([]);
  });

  it("ne retire pas un champ homonyme d'une autre table", () => {
    let staging = addStagedField(createStagingState(), { kind: "real", id: "A" }, { name: "Nom", type: "text" });
    staging = addStagedField(staging, { kind: "real", id: "B" }, { name: "Nom", type: "text" });
    staging = removeStagedField(staging, { kind: "real", id: "A" }, "Nom");
    expect(stagedFieldsForOwner(staging, "real", "A")).toEqual([]);
    expect(stagedFieldsForOwner(staging, "real", "B")).toHaveLength(1);
  });
});

describe("stagedFieldCount / stagedLinkCount", () => {
  it("compte tous les champs, et seulement les liaisons pour stagedLinkCount", () => {
    let staging = addStagedField(createStagingState(), { kind: "real", id: "A" }, { name: "Nom", type: "text" });
    staging = addStagedField(staging, { kind: "real", id: "A" }, {
      name: "Parent",
      type: "ref",
      ref: { kind: "real", id: "A" }
    });
    expect(stagedFieldCount(staging)).toBe(2);
    expect(stagedLinkCount(staging)).toBe(1);
  });
});

describe("validateNewTableName", () => {
  const tables = [{ id: "Utilisateurs", fields: [] }];

  it("refuse un nom vide", () => {
    expect(validateNewTableName(createStagingState(), tables, "  ")).toMatch(/vide/);
  });

  it("refuse une collision avec une table réelle", () => {
    expect(validateNewTableName(createStagingState(), tables, "Utilisateurs")).toMatch(/existe déjà/);
  });

  it("refuse une collision avec une table déjà en brouillon", () => {
    const staging = addStagedTable(createStagingState(), "Commandes");
    expect(validateNewTableName(staging, tables, "Commandes")).toMatch(/brouillon/);
  });

  it("accepte un nom libre", () => {
    expect(validateNewTableName(createStagingState(), tables, "Commandes")).toBeNull();
  });
});

describe("validateNewFieldName", () => {
  const tables = [{ id: "Utilisateurs", fields: [{ name: "Nom", type: "text" }] }];

  it("refuse un nom vide", () => {
    expect(validateNewFieldName(createStagingState(), tables, { kind: "real", id: "Utilisateurs" }, "")).toMatch(
      /vide/
    );
  });

  it("refuse une collision avec un champ réel existant", () => {
    expect(
      validateNewFieldName(createStagingState(), tables, { kind: "real", id: "Utilisateurs" }, "Nom")
    ).toMatch(/existe déjà/);
  });

  it("refuse une collision avec un champ déjà en brouillon sur la même table", () => {
    const owner = { kind: "real", id: "Utilisateurs" };
    const staging = addStagedField(createStagingState(), owner, { name: "Age", type: "int" });
    expect(validateNewFieldName(staging, tables, owner, "Age")).toMatch(/brouillon/);
  });

  it("accepte le même nom sur une autre table (pas de collision croisée)", () => {
    const staging = addStagedField(createStagingState(), { kind: "real", id: "Autre" }, { name: "Age", type: "int" });
    expect(validateNewFieldName(staging, tables, { kind: "real", id: "Utilisateurs" }, "Age")).toBeNull();
  });
});

describe("buildSchemaSummaryText", () => {
  it("liste une ligne par table et par champ brouillon", () => {
    let staging = addStagedTable(createStagingState(), "Commandes");
    staging = addStagedField(staging, { kind: "staged", id: "Commandes" }, { name: "Statut", type: "choice", choices: ["Ouverte", "Fermée"] });
    staging = addStagedField(staging, { kind: "real", id: "Utilisateurs" }, {
      name: "Commande",
      type: "ref",
      ref: { kind: "staged", id: "Commandes" }
    });
    const text = buildSchemaSummaryText(staging);
    expect(text).toContain("Table « Commandes »");
    expect(text).toContain("Statut");
    expect(text).toContain("Ouverte, Fermée");
    expect(text).toContain("Commande");
    expect(text).toContain("→ Commandes");
  });
});

describe("resolveStagedFieldReferences", () => {
  it("résout l'owner d'un champ dont la table brouillon vient de devenir réelle", () => {
    const staging = addStagedField(createStagingState(), { kind: "staged", id: "Table 1" }, {
      name: "Montant",
      type: "numeric"
    });
    const resolved = resolveStagedFieldReferences(staging.fields, { "Table 1": "Table1" });
    expect(resolved[0].owner).toEqual({ kind: "real", id: "Table1" });
  });

  it("résout la cible (ref) d'une liaison vers une table brouillon devenue réelle", () => {
    const staging = addStagedField(createStagingState(), { kind: "real", id: "Commandes" }, {
      name: "Client",
      type: "ref",
      ref: { kind: "staged", id: "Table 1" }
    });
    const resolved = resolveStagedFieldReferences(staging.fields, { "Table 1": "Table1" });
    expect(resolved[0].ref).toEqual({ kind: "real", id: "Table1" });
    expect(resolved[0].owner).toEqual({ kind: "real", id: "Commandes" }); // déjà réel, inchangé
  });

  it("laisse un champ inchangé si sa table n'a pas besoin de résolution", () => {
    const staging = addStagedField(createStagingState(), { kind: "real", id: "Utilisateurs" }, {
      name: "Age",
      type: "int"
    });
    const resolved = resolveStagedFieldReferences(staging.fields, { "Table 1": "Table1" });
    expect(resolved[0]).toEqual(staging.fields[0]);
  });

  it("laisse une référence brouillon inchangée si aucune résolution n'est fournie pour elle", () => {
    const staging = addStagedField(createStagingState(), { kind: "staged", id: "Autre" }, {
      name: "Champ",
      type: "text"
    });
    const resolved = resolveStagedFieldReferences(staging.fields, { "Table 1": "Table1" });
    expect(resolved[0].owner).toEqual({ kind: "staged", id: "Autre" });
  });
});
