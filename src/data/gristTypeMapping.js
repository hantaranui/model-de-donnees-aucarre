// Traduit une chaîne de type brute Grist (colonne `type` de la table
// interne _grist_Tables_column) vers les clés de type utilisées par ce
// widget (voir src/constants.js et src/icons.js).
export function mapGristType(rawType) {
  if (!rawType) return { type: "text" };
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
      // Types "Any", "Id" ou tout type futur non géré : on retombe sur du texte
      // plutôt que de laisser un champ sans icône.
      return { type: "text" };
  }
}
