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

// Grist lie deux colonnes Référence miroir via reverseCol (ex.
// Formations.Chapitres <-> Chapitre_stats.Formation) : sans traitement
// particulier, ça donne deux liaisons distinctes qui pointent chacune vers
// l'en-tête de l'autre table et finissent par se croiser. Quand la paire est
// mutuelle (chaque champ déclare bien l'autre comme sa colonne miroir), on la
// fusionne en une seule liaison champ-à-champ.
function mergeReverseFieldPairs(rawConnections) {
  const byKey = new Map(rawConnections.map((c) => [c.key, c]));
  const consumed = new Set();
  const merged = [];

  rawConnections.forEach((c) => {
    if (consumed.has(c.key)) return;

    const mirrorKey = c.reverseField && `${c.reverseField.table}.${c.reverseField.name}`;
    const mirror = mirrorKey ? byKey.get(mirrorKey) : null;
    const isMutual =
      mirror && mirror.reverseField && mirror.reverseField.table === c.from && mirror.reverseField.name === c.fieldName;

    if (isMutual) {
      consumed.add(c.key);
      consumed.add(mirror.key);
      merged.push({
        key: c.key,
        from: c.from,
        fieldIndex: c.fieldIndex,
        to: c.to,
        toFieldIndex: mirror.fieldIndex,
        kind: c.kind,
        bidirectional: true
      });
    } else {
      merged.push({ key: c.key, from: c.from, fieldIndex: c.fieldIndex, to: c.to, kind: c.kind });
    }
  });

  return merged;
}

// Dérive la liste des liaisons (ref / reflist) à partir des tables, et calcule
// un décalage vertical (targetOffset) pour éviter que plusieurs flèches
// n'arrivent au même point sur une table cible.
export function buildConnections(tables) {
  const byId = new Map(tables.map((t) => [t.id, t]));

  const raw = [];
  tables.forEach((t) => {
    t.fields.forEach((f, fieldIndex) => {
      if (f.ref) {
        raw.push({
          key: `${t.id}.${f.name}`,
          from: t.id,
          fieldName: f.name,
          fieldIndex,
          to: f.ref,
          kind: f.type,
          reverseField: f.reverseField
        });
      }
    });
  });

  const connections = mergeReverseFieldPairs(raw);

  // Une liaison fusionnée (bidirectional) cible précisément le champ miroir
  // (toFieldIndex) : elle n'a pas besoin d'être étalée dans le groupe qui se
  // partage l'en-tête de la table cible.
  const targetGroups = {};
  connections.forEach((c) => {
    if (c.bidirectional) return;
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
