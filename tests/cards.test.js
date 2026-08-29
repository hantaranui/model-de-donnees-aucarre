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
});
