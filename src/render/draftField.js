import { TYPE_LABELS, CREATABLE_FIELD_TYPES, CHOICE_LIKE_TYPES } from "../constants.js";
import { escapeHtml } from "../escapeHtml.js";

// Ligne "brouillon" insérée dans une carte existante pour créer un nouveau
// champ — même logique visuelle que la carte brouillon de la table (V3,
// étape 1), à l'échelle d'un champ. Le texte d'aide en tête de ligne dit
// explicitement "rien n'est encore créé" : un utilisateur qui découvre le
// mode édition ne doit pas se demander s'il vient de créer un champ pour de
// vrai en tapant simplement son nom.
export function createDraftFieldRow() {
  const row = document.createElement("div");
  row.className = "field-row is-draft-field";
  const options = CREATABLE_FIELD_TYPES.map(
    (type) => `<option value="${type}">${escapeHtml(TYPE_LABELS[type])}</option>`
  ).join("");
  row.innerHTML = `
    <div class="draft-field-hint">Brouillon — rien n'est encore créé</div>
    <input type="text" class="draft-field-name" placeholder="Nom du champ…" maxlength="80" autocomplete="off" spellcheck="false">
    <select class="draft-field-type">${options}</select>
    <input type="text" class="draft-field-choices" placeholder="Options séparées par une virgule (ex. Actif, Inactif)" maxlength="400" autocomplete="off" spellcheck="false" hidden>
    <div class="draft-field-actions">
      <button type="button" class="draft-field-cancel">Annuler</button>
      <button type="button" class="draft-field-create" disabled>Ajouter</button>
    </div>
    <div class="draft-field-error" hidden></div>`;
  return row;
}

export function isChoiceLikeType(type) {
  return CHOICE_LIKE_TYPES.includes(type);
}
