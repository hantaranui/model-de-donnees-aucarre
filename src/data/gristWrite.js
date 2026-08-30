// Actions d'écriture Grist (V3 : le widget passe de la lecture seule à la
// création de tables/colonnes/liaisons). La construction des actions
// applyUserActions est séparée de l'appel réseau lui-même pour rester
// testable sans API — voir README, "fonctions pures séparées du rendu DOM".

// Nettoyage générique d'un nom saisi par l'utilisatrice·eur (nom de table ou
// libellé de colonne) : on ne fait que retirer les espaces superflus, Grist
// se charge lui-même de la sanitisation en identifiant valide côté table.
export function sanitizeLabel(rawName) {
  return String(rawName || "").trim();
}

// Contrairement au nom de table (voir sanitizeLabel), le colId attendu par
// AddColumn doit déjà être un identifiant valide : on reproduit ici la
// sanitisation que l'interface Grist applique elle-même à un libellé de
// colonne (accents et caractères spéciaux retirés, espaces en underscore,
// jamais un chiffre en tête). Point à vérifier en pratique : si Grist
// s'avère déjà tolérant sur ce paramètre, cette étape restera de toute façon
// inoffensive (identité sur un identifiant déjà valide).
export function sanitizeColId(rawName) {
  const trimmed = sanitizeLabel(rawName);
  if (!trimmed) return "";
  let id = trimmed
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "") // retire les diacritiques (accents) une fois décomposés
    .replace(/[^A-Za-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
  if (!id) id = "Champ";
  if (/^[0-9]/.test(id)) id = `C${id}`;
  return id;
}

// Découpe le texte "Actif, Inactif, En pause" saisi pour un champ Choix /
// Choix multiple en liste de valeurs, en ignorant les entrées vides (ex.
// virgule finale) et les espaces superflus autour de chaque valeur.
export function parseChoiceOptions(rawText) {
  return String(rawText || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

// Forme attendue par Grist dans widgetOptions pour restreindre les valeurs
// d'un champ Choix / Choix multiple. Point à vérifier en pratique : Grist
// accepte sans doute des métadonnées supplémentaires (couleurs par option,
// via choicesById) que ce widget ne propose pas encore de renseigner.
export function buildChoiceWidgetOptions(choices) {
  return JSON.stringify({ choices });
}

// Action ["AddTable", tableId, colonnes[]] — colonnes vide : voir séquençage
// V3, étape 1 (table vide d'abord, colonnes ajoutées dans un second temps).
export function buildAddTableAction(tableName) {
  return ["AddTable", tableName, []];
}

// Action ["AddColumn", tableId, colId, {...}] — étape 2 du séquençage V3.
export function buildAddColumnAction(tableId, colId, colOptions) {
  return ["AddColumn", tableId, colId, colOptions];
}

// Action ["ModifyColumn", tableId, colId, {...}] — utilisée après coup pour
// régler visibleCol sur une colonne Référence/Référence multiple tout juste
// créée (voir data/schemaCommit.js, buildVisibleColActions).
export function buildModifyColumnAction(tableId, colId, colOptions) {
  return ["ModifyColumn", tableId, colId, colOptions];
}

// Action générique ["AddRecord", tableId, null, {...}] (id laissé à Grist) —
// utilisée pour ajouter une colonne tout juste créée à la section "Données
// brutes" de sa table (voir data/schemaCommit.js, buildRawDataFieldActions).
export function buildAddRecordAction(tableId, colValues) {
  return ["AddRecord", tableId, null, colValues];
}

export function isGristWriteAvailable() {
  return (
    typeof window !== "undefined" &&
    !!window.grist &&
    !!window.grist.docApi &&
    typeof window.grist.docApi.applyUserActions === "function"
  );
}

// Envoie un lot d'actions au document Grist réellement ouvert (V3 : la
// validation d'un brouillon de schéma envoie plusieurs actions à la fois —
// voir data/schemaCommit.js et commitSchema dans app.js). Rejette si Grist
// refuse ou si l'appel échoue — à charge de l'appelant de le signaler
// clairement (règle "jamais de succès supposé en silence").
export async function applyActionsToGrist(actions) {
  return window.grist.docApi.applyUserActions(actions);
}
