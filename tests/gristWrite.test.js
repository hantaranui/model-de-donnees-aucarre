import { describe, it, expect } from "vitest";
import {
  buildAddTableAction,
  buildAddColumnAction,
  buildAddRecordAction,
  sanitizeLabel,
  sanitizeColId,
  parseChoiceOptions,
  buildChoiceWidgetOptions,
  isGristWriteAvailable
} from "../src/data/gristWrite.js";

describe("buildAddTableAction", () => {
  it("construit l'action AddTable avec une liste de colonnes vide", () => {
    expect(buildAddTableAction("Commandes")).toEqual(["AddTable", "Commandes", []]);
  });
});

describe("buildAddColumnAction", () => {
  it("construit l'action AddColumn avec les options de colonne fournies", () => {
    expect(buildAddColumnAction("Commandes", "Statut", { type: "Text", label: "Statut" })).toEqual([
      "AddColumn",
      "Commandes",
      "Statut",
      { type: "Text", label: "Statut" }
    ]);
  });
});

describe("buildAddRecordAction", () => {
  it("construit l'action AddRecord avec un id laissé à Grist", () => {
    expect(buildAddRecordAction("_grist_Views_section_field", { parentId: 4, colRef: 12 })).toEqual([
      "AddRecord",
      "_grist_Views_section_field",
      null,
      { parentId: 4, colRef: 12 }
    ]);
  });
});

describe("sanitizeLabel", () => {
  it("retire les espaces de début/fin", () => {
    expect(sanitizeLabel("  Commandes  ")).toBe("Commandes");
  });

  it("valeur vide ou absente devient une chaîne vide", () => {
    expect(sanitizeLabel("")).toBe("");
    expect(sanitizeLabel(undefined)).toBe("");
  });
});

describe("sanitizeColId", () => {
  it("laisse un identifiant déjà valide inchangé", () => {
    expect(sanitizeColId("Statut")).toBe("Statut");
  });

  it("remplace les espaces par des underscores", () => {
    expect(sanitizeColId("Date de naissance")).toBe("Date_de_naissance");
  });

  it("retire les accents", () => {
    expect(sanitizeColId("Numéro de téléphone")).toBe("Numero_de_telephone");
  });

  it("préfixe un identifiant qui commencerait par un chiffre", () => {
    expect(sanitizeColId("2FA")).toBe("C2FA");
  });

  it("retombe sur un nom générique si tout est retiré", () => {
    expect(sanitizeColId("???")).toBe("Champ");
  });

  it("chaîne vide ou absente devient une chaîne vide (pas de génération de nom)", () => {
    expect(sanitizeColId("")).toBe("");
    expect(sanitizeColId(undefined)).toBe("");
  });
});

describe("parseChoiceOptions", () => {
  it("découpe une liste séparée par des virgules en retirant les espaces", () => {
    expect(parseChoiceOptions("Actif, Inactif ,  En pause")).toEqual(["Actif", "Inactif", "En pause"]);
  });

  it("ignore les entrées vides (virgule finale, virgules répétées)", () => {
    expect(parseChoiceOptions("Actif,,Inactif,")).toEqual(["Actif", "Inactif"]);
  });

  it("chaîne vide ou absente donne une liste vide", () => {
    expect(parseChoiceOptions("")).toEqual([]);
    expect(parseChoiceOptions(undefined)).toEqual([]);
  });
});

describe("buildChoiceWidgetOptions", () => {
  it("sérialise la liste de choix sous la forme attendue par Grist", () => {
    expect(buildChoiceWidgetOptions(["Actif", "Inactif"])).toBe(JSON.stringify({ choices: ["Actif", "Inactif"] }));
  });
});

describe("isGristWriteAvailable", () => {
  it("faux hors iframe Grist (pas de window.grist)", () => {
    expect(isGristWriteAvailable()).toBe(false);
  });
});
