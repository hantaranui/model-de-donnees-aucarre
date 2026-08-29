import { describe, it, expect } from "vitest";
import { isEffectivelyEmpty } from "../src/data/documentState.js";

describe("isEffectivelyEmpty", () => {
  it("un document sans aucune table est vide", () => {
    expect(isEffectivelyEmpty([])).toBe(true);
  });

  it("la table par défaut d'un document Grist neuf (A/B/C jamais typées) est traitée comme vide", () => {
    const tables = [
      {
        id: "Table1",
        fields: [
          { name: "A", type: "text", isGeneric: true },
          { name: "B", type: "text", isGeneric: true },
          { name: "C", type: "text", isGeneric: true }
        ]
      }
    ];
    expect(isEffectivelyEmpty(tables)).toBe(true);
  });

  it("une seule table mais avec au moins une colonne typée : plus vide", () => {
    const tables = [
      {
        id: "Table1",
        fields: [
          { name: "A", type: "text", isGeneric: true },
          { name: "B", type: "numeric" }
        ]
      }
    ];
    expect(isEffectivelyEmpty(tables)).toBe(false);
  });

  it("une seule table générique mais avec une description : plus vide (intention manifeste)", () => {
    const tables = [
      {
        id: "Table1",
        description: "Table de suivi",
        fields: [{ name: "A", type: "text", isGeneric: true }]
      }
    ];
    expect(isEffectivelyEmpty(tables)).toBe(false);
  });

  it("plusieurs tables : jamais considéré comme vide, même si toutes génériques", () => {
    const tables = [
      { id: "Table1", fields: [{ name: "A", type: "text", isGeneric: true }] },
      { id: "Table2", fields: [{ name: "A", type: "text", isGeneric: true }] }
    ];
    expect(isEffectivelyEmpty(tables)).toBe(false);
  });

  it("une seule table sans aucune colonne est traitée comme vide", () => {
    expect(isEffectivelyEmpty([{ id: "Table1", fields: [] }])).toBe(true);
  });
});
