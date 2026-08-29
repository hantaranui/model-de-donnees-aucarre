// Traduit une chaîne de type brute Grist (colonne `type` de la table
// interne _grist_Tables_column) vers les clés de type utilisées par ce
// widget (voir src/constants.js et src/icons.js).
export function mapGristType(rawType) {
  // "Any" (ou son équivalent vide) est la valeur littérale que Grist assigne
  // à une colonne tant que son type n'a jamais été choisi explicitement —
  // pas juste un type qu'on ne sait pas afficher (isGeneric distingue les
  // deux pour le tableau de bord santé du modèle).
  if (!rawType || rawType === "Any") return { type: "text", isGeneric: true };
  if (rawType.startsWith("Ref:")) return { type: "ref", ref: rawType.slice(4) };
  if (rawType.startsWith("RefList:")) return { type: "reflist", ref: rawType.slice(8) };
  if (rawType.startsWith("DateTime")) return { type: "datetime" };

  switch (rawType) {
    case "Text":
      return { type: "text" };
    case "Numeric":
      return { type: "numeric" };
    case "Int":
      return { type: "int" };
    case "Bool":
      return { type: "bool" };
    case "Date":
      return { type: "date" };
    case "Choice":
      return { type: "choice" };
    case "ChoiceList":
      return { type: "choicelist" };
    case "Attachments":
      return { type: "attachment" };
    default:
      // Type "Id" ou tout type futur non géré : un vrai type existe, on ne
      // sait juste pas encore l'afficher — ce n'est pas la même situation
      // qu'une colonne jamais finalisée, donc pas de isGeneric ici.
      return { type: "text" };
  }
}
