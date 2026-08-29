export const MIN_ZOOM = 0.15;
export const MAX_ZOOM = 2.5;
export const ZOOM_STEP = 1.2;

export function clampZoom(value) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

// Boîte englobante de toutes les tables, dans l'espace de coordonnées non
// zoomé du canvas — sert à calculer le zoom et le défilement pour "Ajuster".
export function tablesBounds(tables, positions, cardWidth, cardHeightFn) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  tables.forEach((t) => {
    const pos = positions[t.id];
    const h = cardHeightFn(t);
    minX = Math.min(minX, pos.x);
    minY = Math.min(minY, pos.y);
    maxX = Math.max(maxX, pos.x + cardWidth);
    maxY = Math.max(maxY, pos.y + h);
  });
  return { minX, minY, maxX, maxY };
}

// Niveau de zoom qui fait tenir `bounds` dans `viewport`, avec une marge.
// Plafonné à 100% : "Ajuster" ne doit jamais agrandir un petit schéma
// au-delà de sa taille réelle, seulement le réduire si besoin.
export function computeFitZoom(bounds, viewport, padding = 60) {
  const contentW = bounds.maxX - bounds.minX;
  const contentH = bounds.maxY - bounds.minY;
  if (!(contentW > 0) || !(contentH > 0)) return 1;
  const scale = Math.min((viewport.width - padding) / contentW, (viewport.height - padding) / contentH);
  return Math.max(MIN_ZOOM, Math.min(1, scale));
}
