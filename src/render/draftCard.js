// Petit formulaire éphémère affiché en mode édition pour nommer une nouvelle
// table brouillon (V3 : dessiner tout un schéma avant de le valider en bloc,
// voir data/staging.js). Une fois nommée, ce formulaire disparaît et laisse
// place à une vraie carte de table portant la classe is-staged (voir
// render/cards.js) — rien n'est encore écrit dans Grist à ce stade.
export function createDraftTableCard({ x, y }) {
  const card = document.createElement("div");
  card.className = "table-card is-draft";
  card.style.left = `${x}px`;
  card.style.top = `${y}px`;
  card.innerHTML = `
    <div class="card-header">
      <span class="dot"></span>
      <span class="tname">Nouvelle table</span>
    </div>
    <div class="card-body draft-body">
      <input type="text" class="draft-name-input" placeholder="Nom de la table…" maxlength="80" autocomplete="off" spellcheck="false">
      <div class="draft-actions">
        <button type="button" class="draft-cancel">Annuler</button>
        <button type="button" class="draft-create" disabled>Ajouter</button>
      </div>
      <div class="draft-error" hidden></div>
    </div>`;
  return card;
}
