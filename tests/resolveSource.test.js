import { describe, it, expect } from "vitest";
import { isInIframe, withTimeout } from "../src/data/resolveSource.js";

describe("isInIframe", () => {
  it("faux en dehors de toute iframe (self === top)", () => {
    const win = { self: {}, top: undefined };
    win.top = win.self;
    expect(isInIframe(win)).toBe(false);
  });

  it("vrai dans une iframe (self !== top)", () => {
    const win = { self: {}, top: {} };
    expect(isInIframe(win)).toBe(true);
  });
});

describe("withTimeout", () => {
  it("résout avec la valeur de la promesse si elle arrive avant le délai", async () => {
    const result = await withTimeout(Promise.resolve("ok"), 50);
    expect(result).toBe("ok");
  });

  it("rejette avec le message donné si le délai est dépassé", async () => {
    const neverResolves = new Promise(() => {});
    await expect(withTimeout(neverResolves, 20, "trop long")).rejects.toThrow("trop long");
  });
});
