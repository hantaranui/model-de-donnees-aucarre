// On ne se fie pas à grist.ready() pour savoir si on est bien dans Grist :
// cette fonction ne renvoie pas de Promise (fire-and-forget côté API), donc
// rien à attendre. Le seul signal fiable et disponible immédiatement est le
// fait d'être chargé dans une iframe.
export function isInIframe(win) {
  return win.self !== win.top;
}

export function withTimeout(promise, ms, message = "Délai dépassé") {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    })
  ]);
}
