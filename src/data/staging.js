import { TYPE_LABELS } from "../constants.js";

// État du brouillon de schéma (V3 : dessiner tables/colonnes/liaisons sur le
// canvas, puis valider en bloc) : tables et champs pas encore écrits dans
// Grist, purement local. Toutes les fonctions sont pures (renvoient un
// nouvel état) pour rester testables sans DOM, comme le reste du projet.

export function createStagingState() {
  return { tables: [], fields: [] };
}

export function isStagingEmpty(staging) {
  return staging.tables.length === 0 && staging.fields.length === 0;
}

export function isStagedTableName(staging, id) {
  return staging.tables.some((t) => t.name === id);
}

function sameOwner(a, b) {
  return a.kind === b.kind && a.id === b.id;
}

function sameRef(a, b) {
  if (!a || !b) return false;
  return a.kind === b.kind && a.id === b.id;
}

export function addStagedTable(staging, name, group = "Brouillon") {
  return { ...staging, tables: [...staging.tables, { name, group }] };
}

// Retire une table brouillon, et en cascade : les champs qu'elle possédait,
// et tout champ (ailleurs, réel ou brouillon) qui la référence comme cible —
// une liaison ne peut pas survivre à la disparition de sa cible.
export function removeStagedTable(staging, name) {
  const owner = { kind: "staged", id: name };
  return {
    ...staging,
    tables: staging.tables.filter((t) => t.name !== name),
    fields: staging.fields.filter((f) => !sameOwner(f.owner, owner) && !sameRef(f.ref, owner))
  };
}

export function addStagedField(staging, owner, { name, type, choices, ref, displayField }) {
  return {
    ...staging,
    fields: [
      ...staging.fields,
      { owner, name, type, choices: choices || [], ref: ref || null, displayField: displayField || null }
    ]
  };
}

export function removeStagedField(staging, owner, name) {
  return {
    ...staging,
    fields: staging.fields.filter((f) => !(sameOwner(f.owner, owner) && f.name === name))
  };
}

export function stagedFieldsForOwner(staging, ownerKind, ownerId) {
  return staging.fields.filter((f) => f.owner.kind === ownerKind && f.owner.id === ownerId);
}

export function stagedFieldCount(staging) {
  return staging.fields.length;
}

export function stagedLinkCount(staging) {
  return staging.fields.filter((f) => f.ref).length;
}

// Un nom de table est valide s'il n'est pas vide et ne collisionne ni avec
// une table réelle existante, ni avec une autre table déjà en brouillon.
export function validateNewTableName(staging, tables, name) {
  const trimmed = String(name || "").trim();
  if (!trimmed) return "Le nom de la table ne peut pas être vide.";
  if (tables.some((t) => t.id === trimmed)) return `Une table « ${trimmed} » existe déjà dans le document.`;
  if (isStagedTableName(staging, trimmed)) return `Une table « ${trimmed} » est déjà en brouillon.`;
  return null;
}

// Un nom de champ est valide s'il n'est pas vide et ne collisionne pas avec
// un champ existant (réel ou brouillon) de la même table propriétaire.
export function validateNewFieldName(staging, tables, owner, name) {
  const trimmed = String(name || "").trim();
  if (!trimmed) return "Le nom du champ ne peut pas être vide.";
  if (owner.kind === "real") {
    const table = tables.find((t) => t.id === owner.id);
    if (table && table.fields.some((f) => f.name === trimmed)) {
      return `Un champ « ${trimmed} » existe déjà dans « ${owner.id} ».`;
    }
  }
  if (stagedFieldsForOwner(staging, owner.kind, owner.id).some((f) => f.name === trimmed)) {
    return `Un champ « ${trimmed} » est déjà en brouillon dans « ${owner.id} ».`;
  }
  return null;
}

// Une fois une table brouillon devenue réelle (phase 1 de commitSchema, voir
// app.js), fait pointer les champs qui la référençaient (comme propriétaire
// ou comme cible d'une liaison) vers son id réel — Grist peut adapter le nom
// demandé (espaces, caractères invalides...), donc l'id réel diffère parfois
// du nom initialement tapé. Sans cette résolution, toute action ultérieure
// (AddColumn, ModifyColumn, la vérification finale) viserait encore le nom
// demandé, inexistant côté Grist. Le résultat remplace state.staging.fields
// pour que le réessai après un échec partiel n'ait pas à refaire ce travail.
export function resolveStagedFieldReferences(fields, resolvedTableNames) {
  const resolveRef = (ref) => {
    if (ref && ref.kind === "staged" && resolvedTableNames[ref.id]) {
      return { kind: "real", id: resolvedTableNames[ref.id] };
    }
    return ref;
  };
  return fields.map((f) => ({
    ...f,
    owner: resolveRef(f.owner),
    ref: f.ref ? resolveRef(f.ref) : f.ref
  }));
}

// Résumé lisible de tout ce qui va être écrit — affiché tel quel (texte brut,
// pas de HTML) dans la boîte de confirmation finale.
export function buildSchemaSummaryText(staging) {
  const lines = [];
  staging.tables.forEach((t) => {
    lines.push(`+ Table « ${t.name} »`);
  });
  staging.fields.forEach((f) => {
    const typeLabel = TYPE_LABELS[f.type] || f.type;
    const target = f.ref ? ` → ${f.ref.id}` : "";
    const displayPart = f.ref && f.displayField ? ` (affiche : ${f.displayField})` : "";
    const choicesPart = f.choices && f.choices.length ? ` (${f.choices.join(", ")})` : "";
    lines.push(`+ Champ « ${f.name} » (${typeLabel}${target}${displayPart}${choicesPart}) dans « ${f.owner.id} »`);
  });
  return lines.join("\n");
}
