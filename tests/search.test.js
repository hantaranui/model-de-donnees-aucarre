import { describe, it, expect } from "vitest";
import { tableSearchResult } from "../src/search.js";

const table = {
  id: "Formations",
  fields: [{ name: "Titre", type: "text" }, { name: "Code", type: "text" }, { name: "NbVideos", type: "numeric" }]
};

describe("tableSearchResult", () => {
  it("requête vide : aucun champ surligné, table non estompée", () => {
    const result = tableSearchResult(table, "");
    expect(result).toEqual({ tableMatch: true, matchedFields: new Set(), dim: false });
  });

  it("match sur le nom de la table : non estompée même sans champ correspondant", () => {
    const result = tableSearchResult(table, "format");
    expect(result.tableMatch).toBe(true);
    expect(result.dim).toBe(false);
  });

  it("match sur un nom de champ : ce champ est retenu, la table n'est pas estompée", () => {
    const result = tableSearchResult(table, "code");
    expect(result.tableMatch).toBe(false);
    expect(result.matchedFields).toEqual(new Set(["Code"]));
    expect(result.dim).toBe(false);
  });

  it("aucun match ni sur la table ni sur un champ : la table est estompée", () => {
    const result = tableSearchResult(table, "zzz");
    expect(result.dim).toBe(true);
  });

  it("la recherche ignore la casse", () => {
    const result = tableSearchResult(table, "TITRE");
    expect(result.matchedFields).toEqual(new Set(["Titre"]));
  });
});
