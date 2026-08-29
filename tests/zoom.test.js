import { describe, it, expect } from "vitest";
import { clampZoom, computeFitZoom, tablesBounds, MIN_ZOOM } from "../src/zoom.js";

describe("clampZoom", () => {
  it("laisse passer une valeur dans la plage autorisée", () => {
    expect(clampZoom(1.5)).toBe(1.5);
  });
  it("plafonne au maximum", () => {
    expect(clampZoom(10)).toBeLessThanOrEqual(2.5);
  });
  it("plafonne au minimum", () => {
    expect(clampZoom(0)).toBe(MIN_ZOOM);
  });
});

describe("tablesBounds", () => {
  it("calcule la boîte englobante à partir des positions et hauteurs de cartes", () => {
    const tables = [
      { id: "A", fields: [{ name: "f1" }, { name: "f2" }] },
      { id: "B", fields: [{ name: "f1" }] }
    ];
    const positions = { A: { x: 0, y: 0 }, B: { x: 300, y: 50 } };
    const cardHeightFn = (t) => 40 + t.fields.length * 10;
    const bounds = tablesBounds(tables, positions, 200, cardHeightFn);
    expect(bounds).toEqual({ minX: 0, minY: 0, maxX: 500, maxY: 100 });
  });
});

describe("computeFitZoom", () => {
  it("réduit le zoom quand le contenu dépasse le viewport", () => {
    const bounds = { minX: 0, minY: 0, maxX: 2000, maxY: 1000 };
    const zoom = computeFitZoom(bounds, { width: 1000, height: 800 });
    expect(zoom).toBeLessThan(1);
  });

  it("ne dépasse jamais 100% même si le contenu est petit", () => {
    const bounds = { minX: 0, minY: 0, maxX: 100, maxY: 100 };
    const zoom = computeFitZoom(bounds, { width: 2000, height: 2000 });
    expect(zoom).toBe(1);
  });

  it("renvoie 1 pour un contenu vide (boîte dégénérée)", () => {
    const bounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    expect(computeFitZoom(bounds, { width: 1000, height: 800 })).toBe(1);
  });
});
