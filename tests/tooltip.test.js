import { describe, it, expect } from "vitest";
import { tooltipContent, tooltipPosition } from "../src/render/tooltip.js";

describe("tooltipContent", () => {
  it("champ simple : pas de bloc supplémentaire", () => {
    const content = tooltipContent({ name: "Nom", type: "text" });
    expect(content).toEqual({ tableName: "", name: "Nom", typeLabel: "Texte", extraHTML: "" });
  });

  it("inclut le nom de la table quand il est fourni", () => {
    const content = tooltipContent({ name: "Nom", type: "text" }, "Utilisateurs");
    expect(content.tableName).toBe("Utilisateurs");
  });

  it("champ référence : affiche la table cible", () => {
    const content = tooltipContent({ name: "Abonnement", type: "ref", ref: "Abonnement" });
    expect(content.extraHTML).toContain("Abonnement");
    expect(content.extraHTML).toContain("Cible");
  });

  it("champ formule : affiche la formule", () => {
    const content = tooltipContent({ name: "JoursRestants", type: "numeric", formula: "rec.DateExpiration - TODAY()" });
    expect(content.extraHTML).toContain("rec.DateExpiration - TODAY()");
    expect(content.extraHTML).toContain("Formule");
  });

  it("champ référence avec colonne affichée : ajoute une ligne sous la cible", () => {
    const content = tooltipContent({ name: "Abonnement", type: "ref", ref: "Abonnement", displayColumn: "Statut" });
    expect(content.extraHTML).toContain("t-display-col");
    expect(content.extraHTML).toContain("Statut");
  });

  it("champ référence sans colonne affichée : pas de ligne supplémentaire", () => {
    const content = tooltipContent({ name: "Abonnement", type: "ref", ref: "Abonnement" });
    expect(content.extraHTML).not.toContain("t-display-col");
  });

  it("échappe une colonne affichée malveillante", () => {
    const content = tooltipContent({
      name: "X",
      type: "ref",
      ref: "Y",
      displayColumn: `<img src=x onerror=alert(1)>`
    });
    expect(content.extraHTML).not.toContain("<img");
    expect(content.extraHTML).toContain("&lt;img");
  });

  it("type inconnu : retombe sur le nom brut du type", () => {
    const content = tooltipContent({ name: "X", type: "mystere" });
    expect(content.typeLabel).toBe("mystere");
  });

  it("échappe une formule malveillante (texte libre venant du document Grist)", () => {
    const content = tooltipContent({
      name: "X",
      type: "numeric",
      formula: `</div><img src=x onerror=alert(1)>`
    });
    expect(content.extraHTML).not.toContain("<img");
    expect(content.extraHTML).toContain("&lt;img");
  });

  it("échappe une table cible malveillante", () => {
    const content = tooltipContent({ name: "X", type: "ref", ref: `"><script>alert(1)</script>` });
    expect(content.extraHTML).not.toContain("<script>");
    expect(content.extraHTML).toContain("&lt;script&gt;");
  });
});

describe("tooltipPosition", () => {
  const viewport = { width: 1000, height: 800 };
  const rect = { width: 200, height: 100 };

  it("place le tooltip en bas à droite du curseur par défaut", () => {
    const pos = tooltipPosition({ x: 100, y: 100 }, rect, viewport);
    expect(pos).toEqual({ x: 114, y: 114 });
  });

  it("bascule à gauche si ça déborde à droite", () => {
    const pos = tooltipPosition({ x: 950, y: 100 }, rect, viewport);
    expect(pos.x).toBe(950 - 200 - 14);
  });

  it("bascule au-dessus si ça déborde en bas", () => {
    const pos = tooltipPosition({ x: 100, y: 750 }, rect, viewport);
    expect(pos.y).toBe(750 - 100 - 14);
  });
});
