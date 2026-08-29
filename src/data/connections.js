import { HEADER_H } from "../constants.js";
import { cardHeight } from "../layout.js";

// Marge de sécurité en haut/bas de la carte : le point d'ancrage le plus
// excentré doit toujours rester visiblement à l'intérieur, jamais pile sur
// un coin arrondi.
const EDGE_MARGIN = 10;

// Écart vertical d'une liaison entrante parmi `groupSize` liaisons visant la
// même table. Plutôt que de les serrer dans l'en-tête (elles finissent par
// se chevaucher et former un bloc illisible dès qu'une table est très
// référencée — cas courant sur un vrai document Grist), on les étale sur
// toute la hauteur réelle de la carte cible : il y a largement la place dès
// qu'elle a quelques champs, et ça reste toujours à l'intérieur de la carte.
export function computeTargetOffset(index, groupSize, targetCardHeight) {
  if (groupSize <= 1) return 0;
  const top = EDGE_MARGIN - HEADER_H / 2;
  const bottom = targetCardHeight - HEADER_H / 2 - EDGE_MARGIN;
  if (bottom <= top) return 0;
  return top + (index / (groupSize - 1)) * (bottom - top);
}

// Dérive la liste des liaisons (ref / reflist) à partir des tables, et calcule
// un décalage vertical (targetOffset) pour éviter que plusieurs flèches
// n'arrivent au même point sur une table cible.
export function buildConnections(tables) {
  const byId = new Map(tables.map((t) => [t.id, t]));

  const connections = [];
  tables.forEach((t) => {
    t.fields.forEach((f, fieldIndex) => {
      if (f.ref) {
        connections.push({
          key: `${t.id}.${f.name}`,
          from: t.id,
          fieldIndex,
          to: f.ref,
          kind: f.type
        });
      }
    });
  });

  const targetGroups = {};
  connections.forEach((c) => {
    (targetGroups[c.to] = targetGroups[c.to] || []).push(c);
  });
  Object.entries(targetGroups).forEach(([targetId, group]) => {
    const target = byId.get(targetId);
    const height = target ? cardHeight(target) : HEADER_H;
    group.forEach((c, i) => {
      c.targetOffset = computeTargetOffset(i, group.length, height);
    });
  });

  return connections;
}

export function connectedTables(connections, id) {
  const set = new Set();
  connections.forEach((c) => {
    if (c.from === id) set.add(c.to);
    if (c.to === id) set.add(c.from);
  });
  return set;
}
