# Modèle de données — Widget Grist

Widget custom pour [Grist](https://www.getgrist.com/) qui affiche le modèle de données d'un document : les tables sous forme de cartes, leurs champs typés, et les liaisons (`Ref` / `RefList`) entre elles — un peu comme un diagramme entité-relation généré automatiquement à partir du document.

## Fonctionnalités

- Lecture automatique des tables, colonnes, types et formules du document Grist (accès complet requis, voir plus bas).
- Icônes par type de colonne (Texte, Numérique, Entier, Case à cocher, Date, Date et heure, Choix, Choix multiple, Pièce jointe, Référence, Référence multiple).
- Liaisons dessinées en connecteurs coudés, avec les marques de cardinalité (pied de corbeau) déduites du schéma.
- Mode focus (isole une table et ses liaisons directes) et mode "toutes les liaisons".
- Recherche de table/champ, zoom (molette + Ctrl/Cmd, boutons, ajustement automatique), cartes déplaçables.
- Thème clair/sombre automatique.
- Fonctionne aussi hors Grist (données de démonstration), pratique pour le développement.

## Développement

```bash
npm install
npm run dev
```

Ouvre `http://localhost:5173` : hors d'une iframe Grist, le widget affiche un jeu de données de démonstration (voir `src/data/tables.js`). `npm run dev` recompile `widget.js` à chaque modification (mode watch) et sert le dossier courant.

Pour tester avec un vrai document Grist, ajoute un widget "URL personnalisée" pointant vers cette adresse locale dans une page Grist, puis autorise l'accès complet au document quand c'est demandé.

### Build

```bash
npm run build
```

Regroupe `src/main.js` et tout ce qu'il importe en un seul fichier `widget.js` à la racine du repo (esbuild, format IIFE). `index.html` le charge directement (`<script src="widget.js">`) et ne bouge jamais — pas de dossier de sortie séparé, pas de distinction entre version "source" et version "publiée" : `widget.js` est commité dans le repo, comme le reste du code.

Pour publier une nouvelle version sur GitHub Pages :

```bash
npm run build
git add widget.js
git commit -m "Rebuild widget.js"
git push
```

GitHub Pages sert la racine du repo tel quel ("Deploy from a branch", dossier `/ (root)`) — aucune étape de build côté GitHub. L'URL qui en résulte (`https://<compte>.github.io/<repo>/`) est celle à utiliser comme widget custom dans Grist.

### Tests

```bash
npm test        # une passe
npm run test:watch
```

## Comment ça se branche à Grist

Le widget détecte tout seul le document Grist qui l'embarque — aucune configuration d'URL ou d'instance à faire au build. Au chargement :

1. Il vérifie qu'il est bien dans une iframe (`window.self !== window.top`).
2. Il détecte l'origine du parent via `window.location.ancestorOrigins` (ou `document.referrer` en repli, ou `?gristOrigin=...` dans l'URL du widget en dernier recours).
3. Il charge dynamiquement `grist-plugin-api.js` depuis cette origine, puis demande l'accès complet au document (`requiredAccess: "full"`) — nécessaire car le widget lit toutes les tables du document, pas seulement celle qui lui est liée dans la vue.
4. Il lit les tables internes `_grist_Tables` / `_grist_Tables_column` pour reconstruire le schéma.

Résultat : la même build fonctionne sur n'importe quelle instance Grist (SaaS ou auto-hébergée) sans rien reconfigurer.

## Structure du code

```
src/
  data/        adaptateur Grist (lecture du schéma, mapping des types) et données de démonstration
  render/      fonctions de rendu DOM (cartes, sidebar, liaisons, légende, infobulle)
  app.js       orchestration : état, événements, câblage des modules
  main.js      point d'entrée : détection Grist, chargement, démarrage
  geometry.js  calcul des connecteurs et marques de cardinalité (fonctions pures)
  layout.js    disposition automatique des cartes
  zoom.js      calculs de zoom / ajustement à l'écran
tests/         tests unitaires (Vitest) sur les modules purs
widget.js      généré par `npm run build` (esbuild) — ne pas éditer à la main
```

La logique métier (mapping de types, calculs géométriques, layout, recherche, focus) est séparée du rendu DOM pour rester testable sans navigateur.

## Sécurité

Les noms de tables/champs viennent du document Grist (texte libre modifiable par n'importe quel éditeur) et sont échappés avant insertion dans le DOM (`src/escapeHtml.js`) pour éviter toute injection HTML.

## Crédits

Développé par **[au carré](https://www.aucarre.tech/)** — Hanta C., avec l'assistance de [Claude Code](https://claude.com/claude-code) (Anthropic).
