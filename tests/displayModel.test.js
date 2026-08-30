import { describe, it, expect } from "vitest";
import { buildDisplayTables } from "../src/data/displayModel.js";
import { buildConnections } from "../src/data/connections.js";
import { createStagingState, addStagedTable, addStagedField } from "../src/data/staging.js";

describe("buildDisplayTables", () => {
  it("sans brouillon, renvoie les tables réelles telles quelles", () => {
    const tables = [{ id: "A", fields: [{ name: "Nom", type: "text" }] }];
    expect(buildDisplayTables(tables, createStagingState())).toEqual(tables);
  });

  it("insère un champ brouillon dans une table réelle existante", () => {
    const tables = [{ id: "A", fields: [{ name: "Nom", type: "text" }] }];
    const staging = addStagedField(createStagingState(), { kind: "real", id: "A" }, { name: "Age", type: "int" });
    const display = buildDisplayTables(tables, staging);
    const table = display.find((t) => t.id === "A");
    expect(table.fields).toHaveLength(2);
    expect(table.fields[1]).toMatchObject({ name: "Age", type: "int", isStaged: true });
  });

  it("ajoute une table brouillon avec ses propres champs brouillon", () => {
    let staging = addStagedTable(createStagingState(), "Commandes");
    staging = addStagedField(staging, { kind: "staged", id: "Commandes" }, { name: "Montant", type: "numeric" });
    const display = buildDisplayTables([], staging);
    expect(display).toHaveLength(1);
    expect(display[0]).toMatchObject({ id: "Commandes", isStaged: true });
    expect(display[0].fields).toEqual([{ name: "Montant", type: "numeric", isStaged: true }]);
  });

  it("une liaison brouillon vers une table brouillon se résout via buildConnections, sans aucune modification de buildConnections", () => {
    let staging = addStagedTable(createStagingState(), "Clients");
    staging = addStagedField(staging, { kind: "real", id: "Commandes" }, {
      name: "Client",
      type: "ref",
      ref: { kind: "staged", id: "Clients" }
    });
    const tables = [{ id: "Commandes", fields: [] }];
    const display = buildDisplayTables(tables, staging);
    const connections = buildConnections(display);
    expect(connections).toHaveLength(1);
    expect(connections[0]).toMatchObject({ from: "Commandes", to: "Clients", kind: "ref" });
  });
});
