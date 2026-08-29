// Glyphes typographiques : rendus comme du texte SVG plein (pas de contour),
// pour les types où une lettre/notation est plus lisible qu'un pictogramme.
const GLYPH_ICONS = {
  text: { label: "T", size: 12, weight: 800 },
  longtext: { label: "T", size: 12, weight: 800 }, // Grist ne distingue pas texte et texte long
  numeric: { label: "1.0", size: 7.5, weight: 700 },
  int: { label: "[1]", size: 7.5, weight: 700 }
};

// Pictogrammes en traits, dans un viewBox 20x20 (fill: none, stroke: currentColor).
const PATH_ICONS = {
  bool: '<rect x="3" y="7" width="14" height="7" rx="3.5"/><circle cx="13.3" cy="10.5" r="2.2" fill="currentColor" stroke="none"/>',
  date: '<rect x="3" y="5" width="14" height="12" rx="1.6"/><path d="M3 9h14M7 3v3.4M13 3v3.4"/>',
  datetime: '<circle cx="10" cy="10" r="7"/><path d="M10 6.7V10.3l2.6 1.7"/>',
  choice: '<circle cx="10" cy="10" r="7"/><path d="M6.7 10.3l2 2 4.4-4.8"/>',
  choicelist:
    '<circle cx="10" cy="10" r="7"/><path d="M5.3 11l1.3 1.3 2.6-3"/><path d="M10.8 11l1.3 1.3 2.6-3"/>',
  attachment: '<path d="M12.5 5.2 7 10.7a2.6 2.6 0 0 0 3.7 3.7l5.7-5.7a4.3 4.3 0 1 0-6-6L4.7 8.4"/>',
  ref: '<path d="M8.3 11.7a4.1 4.1 0 0 0 6.2.4l2.3-2.3a4.1 4.1 0 0 0-5.8-5.8l-1.3 1.3"/><path d="M11.7 8.3a4.1 4.1 0 0 0-6.2-.4l-2.3 2.3a4.1 4.1 0 0 0 5.8 5.8l1.3-1.3"/>',
  reflist:
    '<path d="M4.2 9a2.5 2.5 0 0 0 3.8.3l1.3-1.3a2.5 2.5 0 0 0-3.5-3.5l-.6.6"/><path d="M6.6 6.6a2.5 2.5 0 0 0-3.8-.3L1.5 7.6a2.5 2.5 0 0 0 3.5 3.5l.6-.6"/><path d="M12.2 15a2.5 2.5 0 0 0 3.8.3l1.3-1.3a2.5 2.5 0 0 0-3.5-3.5l-.6.6" opacity="0.55"/><path d="M14.6 12.6a2.5 2.5 0 0 0-3.8-.3l-1.3 1.3a2.5 2.5 0 0 0 3.5 3.5l.6-.6" opacity="0.55"/>'
};

export function icon(name, extraAttrs = "") {
  const glyph = GLYPH_ICONS[name];
  if (glyph) {
    return `<svg class="ficon" viewBox="0 0 20 20" ${extraAttrs}><text x="10" y="14.5" text-anchor="middle" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="${glyph.size}" font-weight="${glyph.weight}" fill="currentColor" stroke="none">${glyph.label}</text></svg>`;
  }
  const shape = PATH_ICONS[name] || PATH_ICONS.ref;
  return `<svg class="ficon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ${extraAttrs}>${shape}</svg>`;
}
