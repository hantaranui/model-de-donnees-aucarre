// Détecte une convention de préfixe dans les noms de table (T02_Commande,
// Ref_Pays, REPORT_Ventes...) pour regrouper les tables dans la sidebar au
// lieu d'un unique bloc "Tables". Les chiffres qui suivent le préfixe (le
// "02" de T02_) sont ignorés : ils numérotent des tables individuelles, ce
// n'est pas ce qui définit le groupe.
export function extractGroupPrefix(tableId) {
  const match = String(tableId).match(/^([A-Za-z]+)\d*_/);
  return match ? match[1] : null;
}

// Fonction pure : un préfixe n'est retenu comme groupe que s'il est partagé
// par au moins deux tables — un simple underscore isolé dans un nom ne
// constitue pas une convention de nommage.
export function assignGroupsByPrefix(tables) {
  const counts = new Map();
  tables.forEach((t) => {
    const prefix = extractGroupPrefix(t.id);
    if (prefix) counts.set(prefix, (counts.get(prefix) || 0) + 1);
  });
  return tables.map((t) => {
    const prefix = extractGroupPrefix(t.id);
    const group = prefix && counts.get(prefix) > 1 ? prefix : "Tables";
    return { ...t, group };
  });
}
