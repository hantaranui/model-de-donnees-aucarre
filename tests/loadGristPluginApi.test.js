import { describe, it, expect } from "vitest";
import { loadGristPluginApi } from "../src/data/loadGristPluginApi.js";

function fakeDoc() {
  const script = { src: "" };
  const appended = [];
  return {
    script,
    appended,
    createElement: () => script,
    head: { appendChild: (el) => appended.push(el) }
  };
}

describe("loadGristPluginApi", () => {
  it("pointe le script vers grist-plugin-api.js sur l'origine donnée", () => {
    const doc = fakeDoc();
    loadGristPluginApi("https://hantarabari.getgrist.com", doc);
    expect(doc.script.src).toBe("https://hantarabari.getgrist.com/grist-plugin-api.js");
    expect(doc.appended).toEqual([doc.script]);
  });

  it("résout quand le script se charge", async () => {
    const doc = fakeDoc();
    const promise = loadGristPluginApi("https://grist.aucarre.tech", doc);
    doc.script.onload();
    await expect(promise).resolves.toBeUndefined();
  });

  it("rejette avec un message explicite si le script échoue", async () => {
    const doc = fakeDoc();
    const promise = loadGristPluginApi("https://grist.aucarre.tech", doc);
    doc.script.onerror();
    await expect(promise).rejects.toThrow("https://grist.aucarre.tech");
  });
});
