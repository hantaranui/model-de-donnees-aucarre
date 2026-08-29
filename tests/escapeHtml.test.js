import { describe, it, expect } from "vitest";
import { escapeHtml } from "../src/escapeHtml.js";

describe("escapeHtml", () => {
  it("échappe les caractères spéciaux HTML", () => {
    expect(escapeHtml(`<img src=x onerror=alert(1)>`)).toBe("&lt;img src=x onerror=alert(1)&gt;");
  });

  it("échappe les guillemets, pour rester sûr dans un attribut", () => {
    expect(escapeHtml(`"><script>1</script>`)).toBe("&quot;&gt;&lt;script&gt;1&lt;/script&gt;");
  });

  it("laisse intact un texte sans caractère spécial", () => {
    expect(escapeHtml("NomDuChamp_1")).toBe("NomDuChamp_1");
  });

  it("convertit les valeurs non-chaînes en chaîne avant d'échapper", () => {
    expect(escapeHtml(42)).toBe("42");
  });
});
