import { CARD_W, HEADER_H, ROW_H } from "./constants.js";

const GAP_X = 40;
const GAP_Y = 40;
const MAX_COLUMN_HEIGHT = 860;

// Marge de départ généreuse (plutôt que de coller les cartes au coin
// supérieur gauche) : ça laisse de la place pour glisser une carte vers le
// haut ou la gauche sans buter tout de suite sur la limite basse (0,0) du
// glisser-déposer.
const DEFAULT_MARGIN = 280;

export function cardHeight(table) {
  return HEADER_H + table.fields.length * ROW_H;
}

// Dispose les tables en colonnes (comme un mur de briques) : on empile dans la
// colonne courante tant que ça tient sous MAX_COLUMN_HEIGHT, puis on démarre
// une nouvelle colonne. Utilisé quand les tables n'ont pas de position propre
// (données lues depuis un vrai document Grist).
export function computeGridLayout(tables, startX = DEFAULT_MARGIN, startY = DEFAULT_MARGIN) {
  const positions = {};
  let x = startX;
  let y = startY;

  tables.forEach((table) => {
    const height = cardHeight(table);
    if (y > startY && y + height > MAX_COLUMN_HEIGHT) {
      x += CARD_W + GAP_X;
      y = startY;
    }
    positions[table.id] = { x, y };
    y += height + GAP_Y;
  });

  return positions;
}
