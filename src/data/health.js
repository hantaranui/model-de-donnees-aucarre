// Indicateurs du panneau "Santé du modèle". Seuls des signaux fiables et
// actionnables y figurent (voir revue de la v1 : le taux de description de
// table a été retiré car _grist_Tables n'a pas de champ description côté
// Grist — seules les colonnes en ont — et "tables isolées" a été retiré car
// ce n'est pas en soi un défaut, juste un fait de structure).
// Fonction pure, appelée avec les tables déjà enrichies par
// markBrokenReferences (pour brokenRef) et buildTablesFromGristMetadata
// (pour isGeneric/isEmptyColumn/displayColumn). isGeneric ne porte que sur
// les colonnes de données classiques : une colonne formule laissée en type
// "Non défini" est un usage Grist volontaire (le type suit la valeur
// calculée), pas un oubli — voir gristSource.js.

// Table encore à l'état de création, jamais travaillée : Grist crée
// toujours exactement 3 colonnes A/B/C à la création d'une table, donc "0
// colonne" n'arrive jamais — c'est cette combinaison précise qui signale une
// table oubliée plutôt qu'une vraie table à 3 colonnes.
export function isUntouchedTable(table) {
  if (table.fields.length !== 3) return false;
  const names = table.fields.map((f) => f.name).sort().join(",");
  if (names !== "A,B,C") return false;
  return table.fields.every((f) => f.isGeneric);
}

export function computeModelHealth(tables) {
  const genericFields = [];
  const brokenRefFields = [];
  const rowIdDisplayFields = [];
  const emptyColumnFields = [];
  const untouchedTables = [];

  tables.forEach((t) => {
    t.fields.forEach((f) => {
      if (f.isGeneric) genericFields.push({ table: t.id, field: f.name });
      if (f.brokenRef) brokenRefFields.push({ table: t.id, field: f.name });
      // displayColumn non résolu (visibleCol jamais choisi) : Grist retombe
      // sur l'affichage de l'identifiant de ligne brut ("Montrer la colonne :
      // Id de ligne" dans le panneau Grist — un état bel et bien configuré,
      // pas un oubli), illisible pour un humain (ex. "Agences[321]").
      if (f.ref && !f.displayColumn) rowIdDisplayFields.push({ table: t.id, field: f.name });
      if (f.isEmptyColumn) emptyColumnFields.push({ table: t.id, field: f.name });
    });
    if (isUntouchedTable(t)) untouchedTables.push(t.id);
  });

  return { genericFields, brokenRefFields, rowIdDisplayFields, emptyColumnFields, untouchedTables };
}
