import { describe, it, expect } from "vitest";
import { detectParentOrigin } from "../src/data/gristOrigin.js";

function fakeWin({ search = "", ancestorOrigins, referrer = "" } = {}) {
  return {
    location: { search, ancestorOrigins },
    document: { referrer }
  };
}

describe("detectParentOrigin", () => {
  it("priorise le paramètre ?gristOrigin= s'il est présent et valide", () => {
    const win = fakeWin({
      search: "?gristOrigin=https://hantarabari.getgrist.com/some/path",
      ancestorOrigins: ["https://grist.aucarre.tech"],
      referrer: "https://autre.example.com/doc"
    });
    expect(detectParentOrigin(win)).toBe("https://hantarabari.getgrist.com");
  });

  it("ignore un ?gristOrigin= invalide et continue la détection", () => {
    const win = fakeWin({
      search: "?gristOrigin=pas-une-url",
      ancestorOrigins: ["https://grist.aucarre.tech"]
    });
    expect(detectParentOrigin(win)).toBe("https://grist.aucarre.tech");
  });

  it("utilise ancestorOrigins en priorité sur document.referrer", () => {
    const win = fakeWin({
      ancestorOrigins: ["https://hantarabari.getgrist.com"],
      referrer: "https://autre.example.com/doc"
    });
    expect(detectParentOrigin(win)).toBe("https://hantarabari.getgrist.com");
  });

  it("retombe sur document.referrer si ancestorOrigins est absent", () => {
    const win = fakeWin({ referrer: "https://hantarabari.getgrist.com/o/docs/abc/Doc" });
    expect(detectParentOrigin(win)).toBe("https://hantarabari.getgrist.com");
  });

  it("retombe sur document.referrer si ancestorOrigins est vide", () => {
    const win = fakeWin({ ancestorOrigins: [], referrer: "https://grist.aucarre.tech/doc/xyz" });
    expect(detectParentOrigin(win)).toBe("https://grist.aucarre.tech");
  });

  it("renvoie null si rien n'est disponible", () => {
    const win = fakeWin();
    expect(detectParentOrigin(win)).toBeNull();
  });

  it("renvoie null si le referrer n'est pas une URL valide", () => {
    const win = fakeWin({ referrer: "pas-une-url" });
    expect(detectParentOrigin(win)).toBeNull();
  });
});
