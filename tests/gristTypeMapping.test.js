import { describe, it, expect } from "vitest";
import { mapGristType, buildGristTypeString, buildGristRefTypeString } from "../src/data/gristTypeMapping.js";

describe("mapGristType", () => {
  it.each([
    ["Text", { type: "text" }],
    ["Numeric", { type: "numeric" }],
    ["Int", { type: "int" }],
    ["Bool", { type: "bool" }],
    ["Date", { type: "date" }],
    ["Choice", { type: "choice" }],
    ["ChoiceList", { type: "choicelist" }],
    ["Attachments", { type: "attachment" }]
  ])("mappe %s vers %o", (raw, expected) => {
    expect(mapGristType(raw)).toEqual(expected);
  });

  it("DateTime avec fuseau horaire devient datetime", () => {
    expect(mapGristType("DateTime:Europe/Paris")).toEqual({ type: "datetime" });
  });

  it("Ref:Table extrait la table cible", () => {
    expect(mapGristType("Ref:Formations")).toEqual({ type: "ref", ref: "Formations" });
  });

  it("RefList:Table extrait la table cible", () => {
    expect(mapGristType("RefList:Chapitre_stats")).toEqual({ type: "reflist", ref: "Chapitre_stats" });
  });

  it("type vide ou 'Any' : colonne jamais finalisée, retombe sur texte et se signale comme générique", () => {
    expect(mapGristType("")).toEqual({ type: "text", isGeneric: true });
    expect(mapGristType("Any")).toEqual({ type: "text", isGeneric: true });
  });

  it("type futur inconnu du mapping : retombe sur texte sans se signaler comme générique", () => {
    expect(mapGristType("TypeFuturInconnu")).toEqual({ type: "text" });
  });
});

describe("buildGristTypeString", () => {
  it.each([
    ["text", "Text"],
    ["numeric", "Numeric"],
    ["int", "Int"],
    ["bool", "Bool"],
    ["date", "Date"],
    ["choice", "Choice"],
    ["choicelist", "ChoiceList"],
    ["attachment", "Attachments"]
  ])("traduit %s vers %s", (type, expected) => {
    expect(buildGristTypeString(type)).toBe(expected);
  });

  it("datetime porte un fuseau horaire explicite", () => {
    expect(buildGristTypeString("datetime")).toBe("DateTime:Etc/UTC");
  });

  it("lève une erreur pour un type non pris en charge (ref/reflist : étape dédiée)", () => {
    expect(() => buildGristTypeString("ref")).toThrow();
    expect(() => buildGristTypeString("reflist")).toThrow();
    expect(() => buildGristTypeString("inconnu")).toThrow();
  });
});

describe("buildGristRefTypeString", () => {
  it("construit Ref:Cible", () => {
    expect(buildGristRefTypeString("ref", "Formations")).toBe("Ref:Formations");
  });

  it("construit RefList:Cible", () => {
    expect(buildGristRefTypeString("reflist", "Formations")).toBe("RefList:Formations");
  });

  it("lève une erreur pour un type qui n'est pas une liaison", () => {
    expect(() => buildGristRefTypeString("text", "Formations")).toThrow();
  });
});
