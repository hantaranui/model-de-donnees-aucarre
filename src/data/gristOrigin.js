function parseOrigin(url) {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

// Détecte l'origine du document Grist parent, sans dépendre d'une valeur
// figée au build (utile puisque ce widget est réutilisé sur plusieurs
// instances Grist : SaaS personnelle, auto-hébergée d'un client, etc.).
//
// Ordre de priorité :
// 1. ?gristOrigin=... dans l'URL du widget — filet de secours manuel si la
//    détection automatique échoue dans un navigateur donné.
// 2. window.location.ancestorOrigins — la source la plus fiable (Chrome/Edge) :
//    donne l'origine réelle du parent sans dépendre de la politique de
//    referrer, que Grist ou le navigateur pourrait restreindre.
// 3. document.referrer — repli pour les navigateurs sans ancestorOrigins
//    (Firefox, Safari) ; reflète l'origine de la page qui a chargé l'iframe,
//    sauf politique de referrer plus stricte.
export function detectParentOrigin(win) {
  const override = new URLSearchParams(win.location.search).get("gristOrigin");
  if (override) {
    const parsed = parseOrigin(override);
    if (parsed) return parsed;
  }

  const ancestorOrigins = win.location.ancestorOrigins;
  if (ancestorOrigins && ancestorOrigins.length > 0) {
    return ancestorOrigins[0];
  }

  if (win.document.referrer) {
    return parseOrigin(win.document.referrer);
  }

  return null;
}
