import { describe, it, expect } from "vitest";
import { extractGroupPrefix, assignGroupsByPrefix } from "../src/data/tableGrouping.js";

describe("extractGroupPrefix", () => {
  it("extrait le préfixe alphabétique avant l'underscore", () => {
    expect(extractGroupPrefix("Ref_Pays")).toBe("Ref");
  });

  it("ignore les chiffres qui suivent le préfixe (numérotation individuelle)", () => {
    expect(extractGroupPrefix("T02_Commande")).toBe("T");
    expect(extractGroupPrefix("T10_Suivi")).toBe("T");
  });

  it("gère un préfixe tout en majuscules", () => {
    expect(extractGroupPrefix("REPORT_Ventes")).toBe("REPORT");
  });

  it("renvoie null quand il n'y a pas d'underscore", () => {
    expect(extractGroupPrefix("Utilisateurs")).toBeNull();
  });

  it("renvoie null quand le nom commence directement par un chiffre", () => {
    expect(extractGroupPrefix("2024_Ventes")).toBeNull();
  });
});

describe("assignGroupsByPrefix", () => {
  it("regroupe les tables qui partagent un même préfixe", () => {
    const tables = [{ id: "Ref_Pays" }, { id: "Ref_Statut" }, { id: "Formations" }];
    const grouped = assignGroupsByPrefix(tables);
    expect(grouped.find((t) => t.id === "Ref_Pays").group).toBe("Ref");
    expect(grouped.find((t) => t.id === "Ref_Statut").group).toBe("Ref");
  });

  it("ignore les chiffres de numérotation pour regrouper des tables numérotées séquentiellement", () => {
    const tables = [{ id: "T01_Client" }, { id: "T02_Commande" }, { id: "T03_Produit" }];
    const grouped = assignGroupsByPrefix(tables);
    grouped.forEach((t) => expect(t.group).toBe("T"));
  });

  it("laisse une table dans le groupe par défaut si son préfixe n'est partagé par aucune autre", () => {
    const tables = [{ id: "Ref_Pays" }, { id: "Ref_Statut" }, { id: "Auxiliaires_GrandCompte" }];
    const grouped = assignGroupsByPrefix(tables);
    expect(grouped.find((t) => t.id === "Auxiliaires_GrandCompte").group).toBe("Tables");
  });

  it("renvoie un seul groupe 'Tables' quand aucune table ne suit de convention de préfixe", () => {
    const tables = [{ id: "Utilisateurs" }, { id: "Formations" }, { id: "Abonnement" }];
    const grouped = assignGroupsByPrefix(tables);
    grouped.forEach((t) => expect(t.group).toBe("Tables"));
  });

  it("préserve les autres propriétés de la table", () => {
    const tables = [{ id: "Ref_Pays", fields: [{ name: "Nom" }], description: "x" }];
    const grouped = assignGroupsByPrefix(tables);
    expect(grouped[0]).toMatchObject({ id: "Ref_Pays", fields: [{ name: "Nom" }], description: "x" });
  });
});
