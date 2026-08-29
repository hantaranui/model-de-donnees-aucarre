import { icon } from "../icons.js";

const LEGEND_TYPES = [
  ["text", "Texte"],
  ["numeric", "Numérique"],
  ["int", "Entier"],
  ["bool", "Case à cocher"],
  ["date", "Date"],
  ["datetime", "Date et heure"],
  ["choice", "Choix"],
  ["choicelist", "Choix multiple"],
  ["attachment", "Pièce jointe"]
];

export function renderLegend(legendBody) {
  legendBody.innerHTML = "";
  LEGEND_TYPES.forEach(([type, label]) => {
    legendBody.insertAdjacentHTML("beforeend", `<div class="legend-item">${icon(type)}<span>${label}</span></div>`);
  });
  legendBody.insertAdjacentHTML(
    "beforeend",
    `<div class="legend-item ref">${icon("ref")}<span>Référence</span></div>`
  );
  legendBody.insertAdjacentHTML(
    "beforeend",
    `<div class="legend-item ref">${icon("reflist")}<span>Référence multiple</span></div>`
  );
  legendBody.insertAdjacentHTML(
    "beforeend",
    `<div class="legend-item"><span class="ftag" style="position:static">ƒx</span><span>Formule</span></div>`
  );
}

export function bindLegendToggle(legendEl, toggleEl) {
  toggleEl.addEventListener("click", () => {
    legendEl.classList.toggle("is-collapsed");
  });
}
