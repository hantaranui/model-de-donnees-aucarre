// Boîte de confirmation générique du mode édition : la seule porte d'entrée
// vers une écriture réelle dans Grist. Générique pour être réutilisée telle
// quelle par les prochaines étapes (colonne, référence) — voir consignes V3,
// "résumé lisible ... pas juste confirmer ?".
export function showConfirmDialog(dom, { message, confirmLabel = "Créer", onConfirm, onCancel }) {
  dom.confirmMessage.textContent = message;
  dom.confirmConfirmBtn.textContent = confirmLabel;
  dom.confirmDialog.classList.add("is-visible");

  function cleanup() {
    dom.confirmDialog.classList.remove("is-visible");
    dom.confirmConfirmBtn.removeEventListener("click", handleConfirm);
    dom.confirmCancelBtn.removeEventListener("click", handleCancel);
    dom.confirmDialog.removeEventListener("click", handleOverlayClick);
  }
  function handleConfirm() {
    cleanup();
    onConfirm();
  }
  function handleCancel() {
    cleanup();
    if (onCancel) onCancel();
  }
  function handleOverlayClick(e) {
    if (e.target === dom.confirmDialog) handleCancel();
  }

  dom.confirmConfirmBtn.addEventListener("click", handleConfirm);
  dom.confirmCancelBtn.addEventListener("click", handleCancel);
  dom.confirmDialog.addEventListener("click", handleOverlayClick);
}
