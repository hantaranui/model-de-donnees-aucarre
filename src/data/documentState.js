// Un document Grist tout juste créé n'est jamais réellement vide : il
// contient toujours une table par défaut (3 colonnes A/B/C dont le type et
// la nature n'ont jamais été choisis, donc "génériques" — voir
// mapGristType/isGeneric). On l'assimile à un document vide plutôt que
// d'afficher ce fantôme comme s'il s'agissait d'un vrai début de modèle.
export function isEffectivelyEmpty(tables) {
  if (tables.length === 0) return true;
  if (tables.length > 1) return false;

  const [table] = tables;
  return !table.description && table.fields.every((f) => f.isGeneric);
}
