// Fonction pure : détermine si une table correspond à la recherche et quels
// champs matchent, pour piloter le surlignage et l'estompage dans le rendu.
// La recherche porte aussi sur les formules et les descriptions (table et
// champ), pas seulement sur les noms : un champ peut être pertinent pour une
// requête sans que son nom la contienne (ex. une formule qui appelle TODAY()).
function fieldMatches(field, q) {
  return (
    field.name.toLowerCase().includes(q) ||
    (field.formula && field.formula.toLowerCase().includes(q)) ||
    (field.description && field.description.toLowerCase().includes(q))
  );
}

export function tableSearchResult(table, query) {
  const q = query.trim().toLowerCase();
  const tableMatch =
    table.id.toLowerCase().includes(q) || Boolean(table.description && table.description.toLowerCase().includes(q));
  const matchedFields = new Set(q.length > 0 ? table.fields.filter((f) => fieldMatches(f, q)).map((f) => f.name) : []);
  const dim = q.length > 0 && !tableMatch && matchedFields.size === 0;
  return { tableMatch, matchedFields, dim };
}

export function applySearchToCards(canvasContent, tables, query) {
  const byId = new Map(tables.map((t) => [t.id, t]));
  canvasContent.querySelectorAll(".table-card").forEach((card) => {
    const table = byId.get(card.dataset.id);
    const { matchedFields, dim } = tableSearchResult(table, query);
    card.querySelectorAll(".field-row").forEach((row) => {
      row.classList.toggle("is-match", matchedFields.has(row.dataset.field));
    });
    card.style.opacity = dim ? "0.28" : "";
  });
}
