import { defaultPositions } from "./data/tables.js";
import { createStagingState } from "./data/staging.js";

export function createState(tables) {
  return {
    focused: null,
    showAll: false,
    search: "",
    hoveredConn: null,
    zoom: 1,
    // Mode édition : désactivé par défaut à chaque ouverture du widget — voir
    // README/consignes V3, "lecture par défaut, édition sur activation
    // explicite". Aucune interaction de création n'est possible tant que ce
    // n'est pas true.
    editMode: false,
    // Brouillon de schéma (tables/champs/liaisons pas encore écrits dans
    // Grist) — voir data/staging.js et data/displayModel.js.
    staging: createStagingState(),
    defaultPositions: defaultPositions(tables),
    positions: defaultPositions(tables)
  };
}

export function resetPositions(state) {
  state.positions = JSON.parse(JSON.stringify(state.defaultPositions));
  return state.positions;
}
