// Injecte grist-plugin-api.js depuis l'origine détectée (voir gristOrigin.js)
// plutôt qu'une balise <script> figée au build sur une seule instance Grist.
export function loadGristPluginApi(origin, doc = document) {
  return new Promise((resolve, reject) => {
    const script = doc.createElement("script");
    script.src = `${origin}/grist-plugin-api.js`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Échec du chargement de grist-plugin-api.js depuis ${origin}`));
    doc.head.appendChild(script);
  });
}
