const ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};

// Les noms de table/champ viennent du document Grist et sont du texte libre
// choisi par n'importe quel éditeur du document — jamais du HTML de
// confiance. Toute valeur insérée via innerHTML/insertAdjacentHTML doit
// passer par ici pour éviter qu'un nom de colonne du type
// `"><img src=x onerror=...>` ne s'exécute dans le widget.
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);
}
