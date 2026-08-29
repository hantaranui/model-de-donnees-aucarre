import { describe, it, expect } from "vitest";
import { fieldRowHTML } from "../src/render/cards.js";

describe("fieldRowHTML", () => {
  it("champ simple : pas de classe is-ref, pas de badge formule", () => {
    const html = fieldRowHTML("Formations", { name: "Titre", type: "text" }, 0);
    expect(html).not.toContain("is-ref");
    expect(html).not.toContain("ftag");
    expect(html).toContain("Titre");
  });

  it("champ référence : porte la classe is-ref et le lien vers la cible", () => {
    const html = fieldRowHTML("Utilisateurs", { name: "Abonnement", type: "ref", ref: "Abonnement" }, 3);
    expect(html).toContain('class="field-row is-ref"');
    expect(html).toContain('data-jump="Abonnement"');
  });

  it("champ formule : affiche le badge ƒx", () => {
    const html = fieldRowHTML("Abonnement", { name: "JoursRestants", type: "numeric", formula: "x" }, 5);
    expect(html).toContain("ftag");
  });

  it("échappe un nom de champ malveillant (label Grist = texte libre non fiable)", () => {
    const html = fieldRowHTML("Formations", { name: `"><img src=x onerror=alert(1)>`, type: "text" }, 0);
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img");
  });

  it("échappe la table cible d'une référence, y compris dans l'attribut data-jump", () => {
    const html = fieldRowHTML("Utilisateurs", { name: "Ref", type: "ref", ref: `"><script>alert(1)</script>` }, 0);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("champ avec description : porte la classe has-desc", () => {
    const html = fieldRowHTML("Formations", { name: "Titre", type: "text", description: "Le titre affiché." }, 0);
    expect(html).toContain("has-desc");
  });

  it("champ sans description : pas de classe has-desc", () => {
    const html = fieldRowHTML("Formations", { name: "Titre", type: "text" }, 0);
    expect(html).not.toContain("has-desc");
  });

  it("référence cassée : porte la classe is-broken-ref et un badge dédié, pas de lien data-jump", () => {
    const html = fieldRowHTML(
      "Auxiliaires_GrandCompte",
      { name: "AncienneOffre", type: "ref", ref: "Offres_Archivees", brokenRef: true },
      0
    );
    expect(html).toContain("is-broken-ref");
    expect(html).toContain("fref-broken");
    expect(html).not.toContain("data-jump");
  });

  it("référence valide : pas de classe is-broken-ref", () => {
    const html = fieldRowHTML("Utilisateurs", { name: "Abonnement", type: "ref", ref: "Abonnement" }, 0);
    expect(html).not.toContain("is-broken-ref");
  });

  it("échappe la table cible d'une référence cassée", () => {
    const html = fieldRowHTML(
      "A",
      { name: "X", type: "ref", ref: `"><script>alert(1)</script>`, brokenRef: true },
      0
    );
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
