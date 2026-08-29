// Marque les champs Référence / Référence multiple dont la table cible
// n'existe plus dans le document (colonne jamais nettoyée après suppression
// de la table visée, ou document partiellement corrompu). Fonction pure :
// renvoie de nouvelles tables, sans muter celles reçues en entrée.
export function markBrokenReferences(tables) {
  const existingIds = new Set(tables.map((t) => t.id));
  return tables.map((t) => ({
    ...t,
    fields: t.fields.map((f) => (f.ref && !existingIds.has(f.ref) ? { ...f, brokenRef: true } : f))
  }));
}
