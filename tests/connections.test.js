import { describe, it, expect } from "vitest";
import { buildConnections, connectedTables, computeTargetOffset, orphanTableIds } from "../src/data/connections.js";
import { HEADER_H, ROW_H } from "../src/constants.js";

const TABLES = [
  {
    id: "Utilisateurs",
    fields: [
      { name: "Nom", type: "text" },
      { name: "Abonnement", type: "ref", ref: "Abonnement" }
    ]
  },
  { id: "Abonnement", fields: [{ name: "Statut", type: "choice" }] },
  {
    id: "Formations",
    fields: [
      { name: "Chapitres", type: "reflist", ref: "Chapitre_stats" },
      { name: "Responsable", type: "ref", ref: "Chapitre_stats" }
    ]
  },
  { id: "Chapitre_stats", fields: [{ name: "Titre", type: "text" }] }
];

describe("buildConnections", () => {
  it("ne crée une liaison que pour les champs ref/reflist", () => {
    const connections = buildConnections(TABLES);
    expect(connections).toHaveLength(3);
    expect(connections.map((c) => c.key)).toEqual([
      "Utilisateurs.Abonnement",
      "Formations.Chapitres",
      "Formations.Responsable"
    ]);
  });

  it("conserve la table source, le champ et la table cible", () => {
    const [conn] = buildConnections(TABLES);
    expect(conn).toMatchObject({ from: "Utilisateurs", fieldIndex: 1, to: "Abonnement", kind: "ref" });
  });

  it("étale les liaisons qui pointent vers la même table sur toute sa hauteur", () => {
    const connections = buildConnections(TABLES);
    const towardChapitre = connections.filter((c) => c.to === "Chapitre_stats");
    // Chapitre_stats n'a qu'un champ : cardHeight = HEADER_H + ROW_H = 65.
    expect(towardChapitre.map((c) => c.targetOffset)).toEqual([-9, 36]);
  });

  it("laisse un décalage nul quand une seule liaison cible la table", () => {
    const connections = buildConnections(TABLES);
    const towardAbonnement = connections.find((c) => c.to === "Abonnement");
    expect(towardAbonnement.targetOffset).toBe(0);
  });
});

describe("computeTargetOffset", () => {
  it("décalage nul pour un groupe d'une seule liaison", () => {
    expect(computeTargetOffset(0, 1, 500)).toBe(0);
  });

  it("place la première et la dernière liaison près des bords de la carte", () => {
    const height = 400;
    const offsets = [0, 1].map((i) => computeTargetOffset(i, 2, height));
    expect(offsets[0]).toBeCloseTo(-9, 5);
    expect(offsets[1]).toBeCloseTo(height - HEADER_H / 2 - 10, 5);
  });

  it("répartit un grand nombre de liaisons sur toute la hauteur d'une carte haute, sans chevauchement", () => {
    // Une table avec beaucoup de champs (donc une carte haute) référencée par
    // des dizaines d'autres tables : cas réel sur un gros document Grist.
    const fieldCount = 48;
    const height = HEADER_H + fieldCount * ROW_H;
    const groupSize = 30;
    const offsets = Array.from({ length: groupSize }, (_, i) => computeTargetOffset(i, groupSize, height));

    // Écart minimal entre deux points consécutifs : largement plus que
    // l'épaisseur d'un trait, donc les liaisons restent distinguables.
    for (let i = 1; i < offsets.length; i++) {
      expect(offsets[i] - offsets[i - 1]).toBeGreaterThan(20);
    }
    // Toujours dans les limites de la carte.
    offsets.forEach((offset) => {
      expect(offset).toBeGreaterThanOrEqual(-HEADER_H / 2);
      expect(offset).toBeLessThanOrEqual(height - HEADER_H / 2);
    });
  });

  it("ne dépasse jamais les bornes même si la carte cible est minuscule", () => {
    const offset = computeTargetOffset(0, 5, 15);
    expect(offset).toBe(0);
  });
});

describe("buildConnections — paires bidirectionnelles (reverseCol)", () => {
  const withMirrorPair = [
    {
      id: "Formations",
      fields: [
        {
          name: "Chapitres",
          type: "reflist",
          ref: "Chapitre_stats",
          reverseField: { table: "Chapitre_stats", name: "Formation" }
        }
      ]
    },
    {
      id: "Chapitre_stats",
      fields: [
        { name: "Titre", type: "text" },
        {
          name: "Formation",
          type: "ref",
          ref: "Formations",
          reverseField: { table: "Formations", name: "Chapitres" }
        }
      ]
    }
  ];

  it("fusionne une paire mutuelle en une seule liaison champ-à-champ", () => {
    const connections = buildConnections(withMirrorPair);
    expect(connections).toHaveLength(1);
    expect(connections[0]).toMatchObject({
      from: "Formations",
      fieldIndex: 0,
      to: "Chapitre_stats",
      toFieldIndex: 1,
      bidirectional: true
    });
  });

  it("ne fusionne pas quand le pointeur miroir n'est pas mutuel", () => {
    const oneSided = [
      {
        id: "Formations",
        fields: [{ name: "Chapitres", type: "reflist", ref: "Chapitre_stats" }]
      },
      {
        id: "Chapitre_stats",
        fields: [
          {
            name: "Formation",
            type: "ref",
            ref: "Formations",
            reverseField: { table: "Formations", name: "Chapitres" }
          }
        ]
      }
    ];
    const connections = buildConnections(oneSided);
    expect(connections).toHaveLength(2);
    expect(connections.every((c) => !c.bidirectional)).toBe(true);
  });

  it("une liaison fusionnée n'a pas de targetOffset", () => {
    const connections = buildConnections(withMirrorPair);
    expect(connections[0].targetOffset).toBeUndefined();
  });
});

describe("connectedTables", () => {
  it("retourne les tables liées dans les deux sens", () => {
    const connections = buildConnections(TABLES);
    expect(connectedTables(connections, "Chapitre_stats")).toEqual(new Set(["Formations"]));
    expect(connectedTables(connections, "Formations")).toEqual(new Set(["Chapitre_stats"]));
  });

  it("retourne un set vide pour une table sans liaison", () => {
    const connections = buildConnections(TABLES);
    expect(connectedTables(connections, "Inconnue").size).toBe(0);
  });
});

describe("buildConnections — références cassées", () => {
  it("ne crée pas de liaison pour un champ marqué brokenRef", () => {
    const tables = [
      { id: "A", fields: [{ name: "X", type: "ref", ref: "Inexistante", brokenRef: true }] }
    ];
    const connections = buildConnections(tables);
    expect(connections).toHaveLength(0);
  });
});

describe("orphanTableIds", () => {
  it("ne retient que les tables sans aucune liaison entrante ni sortante", () => {
    const tables = [...TABLES, { id: "Isolee", fields: [{ name: "Note", type: "text" }] }];
    const connections = buildConnections(tables);
    expect(orphanTableIds(tables, connections)).toEqual(new Set(["Isolee"]));
  });

  it("renvoie un set vide quand toutes les tables sont liées", () => {
    const connections = buildConnections(TABLES);
    expect(orphanTableIds(TABLES, connections).size).toBe(0);
  });

  it("une table cible d'une référence n'est pas orpheline", () => {
    const tables = [
      { id: "A", fields: [{ name: "Ref", type: "ref", ref: "B" }] },
      { id: "B", fields: [{ name: "Nom", type: "text" }] }
    ];
    const connections = buildConnections(tables);
    expect(orphanTableIds(tables, connections)).toEqual(new Set());
  });
});