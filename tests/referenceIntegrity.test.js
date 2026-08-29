import { describe, it, expect } from "vitest";
import { markBrokenReferences } from "../src/data/referenceIntegrity.js";

describe("markBrokenReferences", () => {
  it("marque un champ ref dont la table cible n'existe pas", () => {
    const tables = [{ id: "A", fields: [{ name: "X", type: "ref", ref: "Inexistante" }] }];
    const marked = markBrokenReferences(tables);
    expect(marked[0].fields[0].brokenRef).toBe(true);
  });

  it("n'ajoute pas brokenRef quand la table cible existe", () => {
    const tables = [
      { id: "A", fields: [{ name: "X", type: "ref", ref: "B" }] },
      { id: "B", fields: [] }
    ];
    const marked = markBrokenReferences(tables);
    expect(marked[0].fields[0].brokenRef).toBeUndefined();
  });

  it("n'ajoute pas brokenRef à un champ sans ref", () => {
    const tables = [{ id: "A", fields: [{ name: "Nom", type: "text" }] }];
    const marked = markBrokenReferences(tables);
    expect(marked[0].fields[0].brokenRef).toBeUndefined();
  });

  it("ne mute pas les tables reçues en entrée", () => {
    const tables = [{ id: "A", fields: [{ name: "X", type: "ref", ref: "Inexistante" }] }];
    markBrokenReferences(tables);
    expect(tables[0].fields[0].brokenRef).toBeUndefined();
  });
});
