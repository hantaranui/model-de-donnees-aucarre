import { describe, it, expect } from "vitest";
import { fieldAnchor, tableAnchor, elbowPath, cardinalityMarker, connectorPath } from "../src/geometry.js";
import { CARD_W, HEADER_H, ROW_H } from "../src/constants.js";

describe("fieldAnchor", () => {
  it("place l'ancre au bord droit de la carte par défaut, au niveau de la ligne du champ", () => {
    const positions = { Formations: { x: 100, y: 50 } };
    const anchor = fieldAnchor(positions, "Formations", 2);
    expect(anchor.x).toBe(100 + CARD_W);
    expect(anchor.y).toBe(50 + HEADER_H + 2 * ROW_H + ROW_H / 2);
  });

  it("place l'ancre au bord gauche quand side vaut 'left'", () => {
    const positions = { Formations: { x: 100, y: 50 } };
    const anchor = fieldAnchor(positions, "Formations", 2, "left");
    expect(anchor.x).toBe(100);
    expect(anchor.y).toBe(50 + HEADER_H + 2 * ROW_H + ROW_H / 2);
  });
});

describe("tableAnchor", () => {
  it("place l'ancre au bord gauche de l'en-tête sans décalage", () => {
    const positions = { Abonnement: { x: 40, y: 40 } };
    const anchor = tableAnchor(positions, "Abonnement");
    expect(anchor).toEqual({ x: 40, y: 40 + HEADER_H / 2 });
  });

  it("applique le décalage vertical fourni", () => {
    const positions = { Abonnement: { x: 40, y: 40 } };
    const anchor = tableAnchor(positions, "Abonnement", 11);
    expect(anchor.y).toBe(40 + HEADER_H / 2 + 11);
  });
});

describe("elbowPath", () => {
  it("trace une ligne droite quand les deux points sont à la même hauteur", () => {
    expect(elbowPath({ x: 0, y: 50 }, { x: 200, y: 50 })).toBe("M 0 50 L 200 50");
  });

  it("route un coude horizontal-vertical-horizontal avec des coins arrondis", () => {
    const path = elbowPath({ x: 0, y: 0 }, { x: 200, y: 100 });
    expect(path).toBe("M 0 0 L 92 0 Q 100 0 100 8 L 100 92 Q 100 100 108 100 L 200 100");
  });

  it("retombe sur des coins vifs quand l'espace est trop petit pour arrondir", () => {
    const path = elbowPath({ x: 0, y: 0 }, { x: 1, y: 0.5 });
    expect(path).toBe("M 0 0 L 0.5 0 L 0.5 0.5 L 1 0.5");
  });
});

describe("cardinalityMarker", () => {
  it("« un » : un trait perpendiculaire en retrait du point d'ancrage", () => {
    expect(cardinalityMarker({ x: 10, y: 20 }, 1, "one")).toBe("M 2 14 L 2 26");
  });

  it("« un » : le retrait s'inverse selon le sens du fil", () => {
    expect(cardinalityMarker({ x: 10, y: 20 }, -1, "one")).toBe("M 18 14 L 18 26");
  });

  it("« plusieurs » : une fourche à deux branches partant du point d'ancrage", () => {
    expect(cardinalityMarker({ x: 10, y: 20 }, 1, "many")).toBe("M 10 20 L 0 14 M 10 20 L 0 26");
  });
});

describe("connectorPath", () => {
  const a = { x: 0, y: 0 };
  const b = { x: 200, y: 0 };

  it("référence simple : fourche (plusieurs) côté source, trait (un) côté cible", () => {
    expect(connectorPath(a, b, "ref")).toBe(
      "M 0 0 L 200 0 M 0 0 L -10 -6 M 0 0 L -10 6 M 192 -6 L 192 6"
    );
  });

  it("référence multiple : c'est l'inverse — trait côté source, fourche côté cible", () => {
    expect(connectorPath(a, b, "reflist")).toBe(
      "M 0 0 L 200 0 M -8 -6 L -8 6 M 200 0 L 190 -6 M 200 0 L 190 6"
    );
  });
});
