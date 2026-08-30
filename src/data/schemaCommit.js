import {
  buildAddTableAction,
  buildAddColumnAction,
  buildModifyColumnAction,
  buildAddRecordAction,
  sanitizeColId,
  buildChoiceWidgetOptions
} from "./gristWrite.js";
import { buildGristTypeString, buildGristRefTypeString } from "./gristTypeMapping.js";

// Construction des actions Grist pour la validation d'un brouillon de schéma
// (V3) — en deux phases distinctes plutôt qu'un unique lot combiné : une
// colonne Référence visant une table brouillon a besoin que cette table
// existe déjà réellement, et la seule façon d'en être sûr sans supposer un
// ordre d'exécution interne à un lot (jamais vérifié) est d'attendre la
// résolution du premier appel avant de construire le second — voir
// commitSchema dans app.js.

// Phase 1 : une action AddTable par table en brouillon, dans l'ordre où
// elles ont été ajoutées au brouillon.
export function buildAddTableActions(staging) {
  return staging.tables.map((t) => buildAddTableAction(t.name));
}

// Entre la phase 1 et la phase 2 : retrouve le nom réel que Grist a attribué
// à chaque table brouillon tout juste créée — Grist peut adapter le nom
// demandé (espaces, caractères invalides...), et toute colonne visant cette
// table doit alors utiliser ce nom réel, jamais celui initialement tapé
// (sans quoi Grist refuse avec "No such table"). Résolu par élimination
// entre une relecture juste avant et juste après la phase 1, dans l'ordre de
// création (id interne croissant) — suppose qu'aucune autre table n'est
// créée ailleurs pendant ce court intervalle.
export function resolveStagedTableNames(stagedTables, beforeTableRows, afterTableRows) {
  const beforeIds = new Set(beforeTableRows.map((t) => t.id));
  const newRows = afterTableRows.filter((t) => !beforeIds.has(t.id)).sort((a, b) => a.id - b.id);
  const resolved = {};
  stagedTables.forEach((t, i) => {
    if (newRows[i]) resolved[t.name] = newRows[i].tableId;
  });
  return resolved;
}

// Phase 2 : une action AddColumn par champ en brouillon (simple ou liaison),
// à envoyer une fois la phase 1 confirmée. Suppose que owner/ref pointent
// déjà vers des id réels (voir data/staging.js, resolveStagedFieldReferences,
// appelé juste avant dans commitSchema) — jamais le nom brouillon d'origine.
export function buildAddColumnActions(staging) {
  return staging.fields.map((f) => {
    const colId = sanitizeColId(f.name);
    const rawType = f.ref ? buildGristRefTypeString(f.type, f.ref.id) : buildGristTypeString(f.type);
    const colOptions = { type: rawType, label: f.name };
    if (f.choices && f.choices.length) colOptions.widgetOptions = buildChoiceWidgetOptions(f.choices);
    return buildAddColumnAction(f.owner.id, colId, colOptions);
  });
}

// Phase 3a (optionnelle) : règle la colonne affichée (visibleCol) des
// liaisons pour lesquelles l'utilisateur en a choisi une, une fois les
// tables ET les colonnes réellement créées (phases 1 et 2) — visibleCol
// attend l'id interne de la colonne à afficher, pas son colId, d'où le
// besoin de relire les lignes brutes de _grist_Tables_column à ce stade
// (voir fetchRawGristMetadata et commitSchema dans app.js). Sans ce
// réglage, Grist affiche l'identifiant interne brut de ligne à la place du
// champ attendu — repéré en pratique par l'utilisateur sur un vrai document.
export function buildVisibleColActions(staging, tableRows, columnRows) {
  const tableRowIdByName = new Map(tableRows.map((t) => [t.tableId, t.id]));
  const columnsByTableRowId = new Map();
  columnRows.forEach((c) => {
    if (!columnsByTableRowId.has(c.parentId)) columnsByTableRowId.set(c.parentId, []);
    columnsByTableRowId.get(c.parentId).push(c);
  });

  function findColumn(tableName, colLabel) {
    const tableRowId = tableRowIdByName.get(tableName);
    if (tableRowId === undefined) return null;
    const cols = columnsByTableRowId.get(tableRowId) || [];
    return cols.find((c) => c.label === colLabel) || null;
  }

  const actions = [];
  staging.fields.forEach((f) => {
    if (!f.ref || !f.displayField) return;
    const refColumn = findColumn(f.owner.id, f.name);
    const displayColumn = findColumn(f.ref.id, f.displayField);
    if (!refColumn || !displayColumn) return; // colonne introuvable : signalé séparément, pas d'erreur silencieuse côté commitSchema
    actions.push(buildModifyColumnAction(f.owner.id, refColumn.colId, { visibleCol: displayColumn.id }));
  });
  return actions;
}

// Phase 3b (optionnelle, comme la 3a ci-dessus) : ajoute chaque colonne tout
// juste créée
// à la section "Données brutes" (Raw Data) de sa table. Vérifié en pratique
// contre un document de test : une colonne créée par AddColumn n'apparaît
// automatiquement dans AUCUNE vue existante, pas même Données brutes — Grist
// ne le fait qu'en ajoutant la colonne à la main depuis son interface,
// laquelle enchaîne alors une action équivalente à celle-ci en coulisses.
export function buildRawDataFieldActions(fields, tableRows, columnRows, rawDataSectionByTableRef) {
  const tableRowIdByName = new Map(tableRows.map((t) => [t.tableId, t.id]));
  const columnsByTableRowId = new Map();
  columnRows.forEach((c) => {
    if (!columnsByTableRowId.has(c.parentId)) columnsByTableRowId.set(c.parentId, []);
    columnsByTableRowId.get(c.parentId).push(c);
  });

  const actions = [];
  fields.forEach((f) => {
    const tableRowId = tableRowIdByName.get(f.owner.id);
    if (tableRowId === undefined) return;
    const sectionId = rawDataSectionByTableRef.get(tableRowId);
    if (sectionId === undefined) return;
    const cols = columnsByTableRowId.get(tableRowId) || [];
    const col = cols.find((c) => c.label === f.name);
    if (!col) return;
    actions.push(buildAddRecordAction("_grist_Views_section_field", { parentId: sectionId, colRef: col.id }));
  });
  return actions;
}

// Après la validation, une fois le document réellement relu (refreshFromGrist) :
// compare le brouillon envoyé à ce qui apparaît vraiment, pour un rapport
// honnête plutôt qu'un succès supposé en silence — généralise à toute la
// liste ce que submitCreate vérifiait déjà pour un item unique. resolvedTableNames
// (nom brouillon -> nom réel, voir resolveStagedTableNames) évite de signaler
// à tort une table comme manquante quand Grist a seulement adapté son nom.
export function findMissingSchemaItems(staging, freshTables, resolvedTableNames = {}) {
  const byId = new Map(freshTables.map((t) => [t.id, t]));

  const missingTables = staging.tables
    .filter((t) => !byId.has(resolvedTableNames[t.name] || t.name))
    .map((t) => t.name);

  const missingFields = staging.fields
    .filter((f) => {
      const table = byId.get(f.owner.id);
      return !table || !table.fields.some((tf) => tf.name === f.name);
    })
    .map((f) => `${f.name} (${f.owner.id})`);

  return { missingTables, missingFields };
}
