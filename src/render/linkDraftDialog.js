import { escapeHtml } from "../escapeHtml.js";

// Valeur d'option choisie quand l'utilisateur laisse la colonne à afficher
// sur l'identifiant interne (comportement par défaut de Grist si rien n'est
// réglé) — voir data/schemaCommit.js, buildVisibleColActions.
const NO_DISPLAY_FIELD = "";

// Boîte de saisie du nom (cardinalité, et colonne à afficher) d'une liaison
// brouillon, affichée après avoir tracé un trait d'une carte vers une autre
// — voir data/staging.js. Structurée comme render/confirmDialog.js, mais
// avec de vrais champs de saisie : onSubmit renvoie { error } pour rester
// ouverte et afficher un message (nom déjà pris, vide...), ou rien pour
// valider.
export function showLinkDraftDialog(
  dom,
  { sourceLabel, targetLabel, defaultName, displayFieldOptions = [], onSubmit, onCancel }
) {
  dom.linkDraftSource.textContent = sourceLabel;
  dom.linkDraftTarget.textContent = targetLabel;
  dom.linkDraftName.value = defaultName;
  dom.linkDraftType.value = "ref";
  dom.linkDraftDisplayCol.innerHTML =
    `<option value="${NO_DISPLAY_FIELD}">Identifiant interne (par défaut)</option>` +
    displayFieldOptions.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join("");
  dom.linkDraftError.hidden = true;
  dom.linkDraftDialog.classList.add("is-visible");
  dom.linkDraftName.focus();
  dom.linkDraftName.select();

  function cleanup() {
    dom.linkDraftDialog.classList.remove("is-visible");
    dom.linkDraftConfirmBtn.removeEventListener("click", handleConfirm);
    dom.linkDraftCancelBtn.removeEventListener("click", handleCancel);
    dom.linkDraftName.removeEventListener("keydown", handleKeydown);
    dom.linkDraftDialog.removeEventListener("click", handleOverlayClick);
  }
  function handleConfirm() {
    const displayField = dom.linkDraftDisplayCol.value || null;
    const result = onSubmit(dom.linkDraftName.value, dom.linkDraftType.value, displayField);
    if (result && result.error) {
      dom.linkDraftError.hidden = false;
      dom.linkDraftError.textContent = result.error;
      return;
    }
    cleanup();
  }
  function handleCancel() {
    cleanup();
    if (onCancel) onCancel();
  }
  function handleKeydown(e) {
    if (e.key === "Enter") handleConfirm();
    if (e.key === "Escape") handleCancel();
  }
  function handleOverlayClick(e) {
    if (e.target === dom.linkDraftDialog) handleCancel();
  }

  dom.linkDraftConfirmBtn.addEventListener("click", handleConfirm);
  dom.linkDraftCancelBtn.addEventListener("click", handleCancel);
  dom.linkDraftName.addEventListener("keydown", handleKeydown);
  dom.linkDraftDialog.addEventListener("click", handleOverlayClick);
}
