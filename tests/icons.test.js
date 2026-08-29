import { describe, it, expect } from "vitest";
import { icon } from "../src/icons.js";

describe("icon", () => {
  it("texte : rend la lettre T en glyphe plein, sans contour", () => {
    const svg = icon("text");
    expect(svg).toContain(">T<");
    expect(svg).toContain('fill="currentColor"');
    expect(svg).not.toContain('stroke="currentColor"');
  });

  it("texte long : identique au texte, Grist ne distingue pas les deux", () => {
    expect(icon("longtext")).toBe(icon("text"));
  });

  it("numérique : rend '1.0' en glyphe", () => {
    expect(icon("numeric")).toContain(">1.0<");
  });

  it("entier : rend '[1]' en glyphe", () => {
    expect(icon("int")).toContain(">[1]<");
  });

  it("booléen : pictogramme en traits (toggle), pas de glyphe texte", () => {
    const svg = icon("bool");
    expect(svg).toContain('stroke="currentColor"');
    expect(svg).not.toContain("<text");
  });

  it("type inconnu : retombe sur le pictogramme référence", () => {
    expect(icon("mystere")).toBe(icon("ref"));
  });

  it("transmet les attributs additionnels sur la balise svg", () => {
    expect(icon("date", 'data-x="1"')).toContain('data-x="1"');
    expect(icon("text", 'data-x="1"')).toContain('data-x="1"');
  });
});
