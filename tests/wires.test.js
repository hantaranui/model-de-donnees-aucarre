import { describe, it, expect } from "vitest";
import { wireVisualState } from "../src/render/wires.js";

const conn = { key: "Utilisateurs.Abonnement", from: "Utilisateurs", to: "Abonnement" };
const baseState = { focused: null, showAll: false, hoveredConn: null };

describe("wireVisualState", () => {
  it("survol : prioritaire sur tout le reste", () => {
    const state = { ...baseState, focused: "Formations", hoveredConn: conn.key };
    expect(wireVisualState(conn, state)).toEqual({ classes: ["is-hovered"], opacity: "" });
  });

  it("sans focus et sans mode 'toutes les liaisons' : caché", () => {
    expect(wireVisualState(conn, baseState)).toEqual({ classes: ["is-hidden"], opacity: "" });
  });

  it("sans focus mais en mode 'toutes les liaisons' : visible", () => {
    const state = { ...baseState, showAll: true };
    expect(wireVisualState(conn, state)).toEqual({ classes: [], opacity: "" });
  });

  it("focus sur une table liée à la connexion : actif", () => {
    const state = { ...baseState, focused: "Utilisateurs" };
    expect(wireVisualState(conn, state)).toEqual({ classes: ["is-active"], opacity: "" });
  });

  it("focus sur une table non liée, mode focus seul : caché", () => {
    const state = { ...baseState, focused: "Formations" };
    expect(wireVisualState(conn, state)).toEqual({ classes: ["is-hidden"], opacity: "" });
  });

  it("focus sur une table non liée, mode 'toutes les liaisons' : estompé mais visible", () => {
    const state = { ...baseState, focused: "Formations", showAll: true };
    expect(wireVisualState(conn, state)).toEqual({ classes: [], opacity: 0.12 });
  });
});
