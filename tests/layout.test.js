import { describe, it, expect } from "vitest";
import { computeGridLayout, cardHeight } from "../src/layout.js";
import { CARD_W, HEADER_H, ROW_H } from "../src/constants.js";

function table(id, fieldCount) {
  return { id, fields: Array.from({ length: fieldCount }, (_, i) => ({ name: `f${i}`, type: "text" })) };
}

describe("cardHeight", () => {
  it("additionne l'en-tête et une ligne par champ", () => {
    expect(cardHeight(table("A", 4))).toBe(HEADER_H + 4 * ROW_H);
  });
});

describe("computeGridLayout", () => {
  it("empile les premières tables dans la même colonne", () => {
    const positions = computeGridLayout([table("A", 3), table("B", 2)]);
    expect(positions.A.x).toBe(positions.B.x);
    expect(positions.B.y).toBeGreaterThan(positions.A.y);
  });

  it("démarre une nouvelle colonne quand la hauteur dépasse le maximum", () => {
    // Une table très haute doit forcer un retour à la ligne pour la suivante.
    const huge = table("Big", 40);
    const positions = computeGridLayout([huge, table("Next", 1)]);
    expect(positions.Next.x).toBeGreaterThan(positions.Big.x);
    expect(positions.Next.y).toBe(positions.Big.y);
  });

  it("espace les colonnes de la largeur d'une carte plus la marge", () => {
    const huge = table("Big", 40);
    const positions = computeGridLayout([huge, table("Next", 1)]);
    expect(positions.Next.x - positions.Big.x).toBe(CARD_W + 40);
  });

  it("est déterministe pour les mêmes tables", () => {
    const tables = [table("A", 3), table("B", 5), table("C", 2)];
    expect(computeGridLayout(tables)).toEqual(computeGridLayout(tables));
  });
});
