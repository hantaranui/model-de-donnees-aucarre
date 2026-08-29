// Les noms de table/champ viennent du document Grist (texte libre) : ils
// passent systématiquement par textContent, jamais innerHTML.
function plural(count) {
  return count > 1 ? "s" : "";
}

// item est soit une chaîne (nom de table, indicateur "tables non finalisées"),
// soit { table, field }. Le nom de champ est ce qui identifie concrètement le
// problème : il passe en premier et en évidence, le nom de table (souvent
// bien plus long dans un vrai document) en second plan en dessous plutôt que
// de risquer de le laisser hors du chip tronqué.
function appendItemList(section, items, onJump) {
  if (items.length === 0) return;
  const list = document.createElement("div");
  list.className = "health-item-list";
  items.forEach((item) => {
    const isTableOnly = typeof item === "string";
    const tableId = isTableOnly ? item : item.table;
    const fieldName = isTableOnly ? null : item.field;

    const chip = document.createElement("button");
    chip.className = "health-item-chip";
    if (fieldName) {
      const fieldEl = document.createElement("span");
      fieldEl.className = "chip-field";
      fieldEl.textContent = fieldName;
      const tableEl = document.createElement("span");
      tableEl.className = "chip-table";
      tableEl.textContent = tableId;
      chip.appendChild(fieldEl);
      chip.appendChild(tableEl);
    } else {
      chip.textContent = tableId;
    }
    chip.addEventListener("click", () => onJump(tableId, fieldName));
    list.appendChild(chip);
  });
  section.appendChild(list);
}

function renderIndicator(bodyEl, count, label, items, onJump) {
  const section = document.createElement("div");
  section.className = "health-indicator";
  section.innerHTML = `<div class="health-count">${count}</div><div class="health-label">${label}</div>`;
  appendItemList(section, items, onJump);
  bodyEl.appendChild(section);
}

// onJump(tableId, fieldName) : fieldName vaut null pour l'indicateur "tables
// encore à l'état de création" (rien à cibler de plus précis qu'la table).
export function renderHealthPanel(bodyEl, health, onJump) {
  bodyEl.innerHTML = "";

  renderIndicator(
    bodyEl,
    health.genericFields.length,
    `colonne${plural(health.genericFields.length)} en type générique (Any) non finalisé${plural(health.genericFields.length)}`,
    health.genericFields,
    onJump
  );

  renderIndicator(
    bodyEl,
    health.brokenRefFields.length,
    `référence${plural(health.brokenRefFields.length)} cassée${plural(health.brokenRefFields.length)} (table cible supprimée)`,
    health.brokenRefFields,
    onJump
  );

  renderIndicator(
    bodyEl,
    health.rowIdDisplayFields.length,
    // "Montrer la colonne : Id de ligne" dans Grist : la référence affiche un
    // identifiant numérique brut (ex. "Agences[321]") plutôt qu'un champ
    // représentatif — c'est un réglage bel et bien présent dans Grist, pas
    // une case vide, d'où ce libellé qui décrit l'effet plutôt qu'un oubli.
    `référence${plural(health.rowIdDisplayFields.length)} affichant l'identifiant de ligne brut`,
    health.rowIdDisplayFields,
    onJump
  );

  renderIndicator(
    bodyEl,
    health.emptyColumnFields.length,
    // Vocabulaire Grist : "Colonne vide" est la nature de colonne d'un champ
    // ajouté mais jamais tranché entre donnée et formule — ce n'est une
    // "colonne formule" qu'une fois du code écrit dedans.
    `colonne${plural(health.emptyColumnFields.length)} encore à l'état "Colonne vide"`,
    health.emptyColumnFields,
    onJump
  );

  renderIndicator(
    bodyEl,
    health.untouchedTables.length,
    `table${plural(health.untouchedTables.length)} encore à l'état de création (jamais travaillée${plural(health.untouchedTables.length)})`,
    health.untouchedTables,
    onJump
  );
}
