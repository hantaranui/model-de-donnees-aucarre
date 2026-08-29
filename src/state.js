import { defaultPositions } from "./data/tables.js";

export function createState(tables) {
  return {
    focused: null,
    showAll: false,
    search: "",
    hoveredConn: null,
    zoom: 1,
    defaultPositions: defaultPositions(tables),
    positions: defaultPositions(tables)
  };
}

export function resetPositions(state) {
  state.positions = JSON.parse(JSON.stringify(state.defaultPositions));
  return state.positions;
}
