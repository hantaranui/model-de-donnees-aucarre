import { CARD_W, HEADER_H, ROW_H } from "./constants.js";

export function fieldAnchor(positions, tableId, fieldIdx) {
  const pos = positions[tableId];
  return { x: pos.x + CARD_W, y: pos.y + HEADER_H + fieldIdx * ROW_H + ROW_H / 2 };
}

export function tableAnchor(positions, tableId, offset = 0) {
  const pos = positions[tableId];
  return { x: pos.x, y: pos.y + HEADER_H / 2 + offset };
}

// Connecteur "elbow" (coudé) : horizontal - vertical - horizontal, avec des
// coins légèrement arrondis. Les deux extrémités (bord de champ, bord de
// table) sont toujours abordées à l'horizontale dans notre mise en page,
// donc un unique point milieu en X suffit à router le coude.
export function elbowPath(a, b, cornerRadius = 8) {
  if (a.y === b.y) return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;

  const midX = a.x + (b.x - a.x) / 2;
  const dirX = Math.sign(b.x - a.x) || 1;
  const dirY = Math.sign(b.y - a.y) || 1;
  const r = Math.min(cornerRadius, Math.abs(midX - a.x), Math.abs(b.x - midX), Math.abs(b.y - a.y) / 2);

  if (r < 1) return `M ${a.x} ${a.y} L ${midX} ${a.y} L ${midX} ${b.y} L ${b.x} ${b.y}`;

  return [
    `M ${a.x} ${a.y}`,
    `L ${midX - dirX * r} ${a.y}`,
    `Q ${midX} ${a.y} ${midX} ${a.y + dirY * r}`,
    `L ${midX} ${b.y - dirY * r}`,
    `Q ${midX} ${b.y} ${midX + dirX * r} ${b.y}`,
    `L ${b.x} ${b.y}`
  ].join(" ");
}

// Marque de cardinalité façon "pied de corbeau" : un trait perpendiculaire
// pour "un", une fourche à deux branches pour "plusieurs". Dessinée juste
// avant le point d'ancrage, en remontant le fil vers l'autre extrémité.
export function cardinalityMarker(point, dirX, kind) {
  const { x, y } = point;
  if (kind === "many") {
    const backX = x - dirX * 10;
    return `M ${x} ${y} L ${backX} ${y - 6} M ${x} ${y} L ${backX} ${y + 6}`;
  }
  const tickX = x - dirX * 8;
  return `M ${tickX} ${y - 6} L ${tickX} ${y + 6}`;
}

// Compose le tracé complet d'une liaison : le fil + ses deux marques de
// cardinalité. Une Référence simple = "plusieurs lignes source pointent vers
// une ligne cible" (fourche côté source, trait côté cible) ; une Référence
// multiple, c'est l'inverse.
export function connectorPath(a, b, kind) {
  const dirX = Math.sign(b.x - a.x) || 1;
  const sourceKind = kind === "reflist" ? "one" : "many";
  const targetKind = kind === "reflist" ? "many" : "one";
  return [
    elbowPath(a, b),
    cardinalityMarker(a, dirX, sourceKind),
    cardinalityMarker(b, dirX, targetKind)
  ].join(" ");
}
