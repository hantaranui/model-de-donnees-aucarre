export const TYPE_LABELS = {
  text: "Texte",
  longtext: "Texte", // Grist ne distingue pas texte et texte long
  numeric: "Numérique",
  int: "Entier",
  bool: "Booléen",
  date: "Date",
  datetime: "Date et heure",
  choice: "Choix unique",
  choicelist: "Choix multiple",
  attachment: "Pièce jointe",
  ref: "Référence",
  reflist: "Référence multiple"
};

export const GROUP_COLORS = {
  Comptes: "#F77245",
  Contenu: "#0FAE93",
  Modules: "#59736E",
  Système: "#8676D9"
};

// Types proposés à la création d'un champ (mode édition, V3, étape 2) :
// exclut délibérément ref/reflist (créés en traçant une liaison sur le
// canvas, voir étape 3) et longtext (pas un vrai type Grist distinct).
export const CREATABLE_FIELD_TYPES = [
  "text",
  "numeric",
  "int",
  "bool",
  "date",
  "datetime",
  "choice",
  "choicelist",
  "attachment"
];

// Types pour lesquels la création propose de renseigner la liste des
// valeurs autorisées (widgetOptions.choices côté Grist).
export const CHOICE_LIKE_TYPES = ["choice", "choicelist"];

export const CARD_W = 232;
export const HEADER_H = 38;
export const ROW_H = 27;
