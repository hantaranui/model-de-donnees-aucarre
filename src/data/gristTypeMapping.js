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

// Mapping inverse de mapGristType, utilisé par le mode édition (V3) pour
// traduire le type choisi dans le widget vers la chaîne de type brute
// attendue par AddColumn. Ref/RefList ne sont volontairement pas ici : ces
// types se créent en traçant une liaison sur le canvas (étape dédiée), pas
// depuis ce sélecteur de type simple.
const GRIST_TYPE_BY_KEY = {
  text: "Text",
  numeric: "Numeric",
  int: "Int",
  bool: "Bool",
  date: "Date",
  // Fuseau horaire non demandé à l'utilisateur pour rester simple : à
  // vérifier contre un vrai document (le fuseau du document lui-même serait
  // sans doute plus juste qu'un UTC fixe, pas confirmé en pratique).
  datetime: "DateTime:Etc/UTC",
  choice: "Choice",
  choicelist: "ChoiceList",
  attachment: "Attachments"
};

export function buildGristTypeString(type) {
  const rawType = GRIST_TYPE_BY_KEY[type];
  if (!rawType) throw new Error(`Type de champ non pris en charge pour la création : ${type}`);
  return rawType;
}

// Pendant du mapping inverse ci-dessus, mais pour les liaisons (tracées sur
// le canvas, pas choisies dans le sélecteur de type simple) : construit
// "Ref:Cible" / "RefList:Cible" à partir du nom réel de la table cible.
export function buildGristRefTypeString(type, targetTableName) {
  if (type !== "ref" && type !== "reflist") {
    throw new Error(`Type de liaison non pris en charge : ${type}`);
  }
  const prefix = type === "reflist" ? "RefList" : "Ref";
  return `${prefix}:${targetTableName}`;
}
