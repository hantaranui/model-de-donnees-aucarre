import { stagedFieldsForOwner } from "./staging.js";

function toDisplayField(f) {
  const field = { name: f.name, type: f.type, isStaged: true };
  if (f.ref) field.ref = f.ref.id;
  if (f.choices && f.choices.length) field.choices = f.choices;
  return field;
}

// Fusionne les tables réelles avec le brouillon en cours (tables et champs
// pas encore écrits dans Grist) en une vue unique, de même forme que les
// tables réelles, pour que tout le pipeline de rendu existant (connexions,
// sidebar, cartes, liaisons, recherche...) puisse s'en servir sans aucune
// modification — une liaison brouillon dont la cible est elle-même une
// table brouillon se résout automatiquement, buildConnections ne faisant
// qu'une recherche par id dans le tableau qu'on lui donne.
export function buildDisplayTables(tables, staging) {
  const realDisplay = tables.map((t) => {
    const stagedOwnFields = stagedFieldsForOwner(staging, "real", t.id).map(toDisplayField);
    return stagedOwnFields.length ? { ...t, fields: [...t.fields, ...stagedOwnFields] } : t;
  });

  const stagedDisplay = staging.tables.map((t) => ({
    id: t.name,
    group: t.group,
    isStaged: true,
    fields: stagedFieldsForOwner(staging, "staged", t.name).map(toDisplayField)
  }));

  return [...realDisplay, ...stagedDisplay];
}
