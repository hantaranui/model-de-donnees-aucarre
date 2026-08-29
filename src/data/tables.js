// Données mockées représentant le modèle de données Grist.
// À terme, ce module sera remplacé par un adaptateur qui lit les vraies
// tables/colonnes du document via grist-plugin-api (voir README).
export const TABLES = [
  {
    id: "Utilisateurs",
    group: "Comptes",
    x: 320,
    y: 580,
    fields: [
      { name: "Nom", type: "text" },
      { name: "Email", type: "text" },
      { name: "DateInscription", type: "date" },
      { name: "Abonnement", type: "ref", ref: "Abonnement" },
      { name: "GrandCompte", type: "ref", ref: "Auxiliaires_GrandCompte" },
      { name: "FormationsSuivies", type: "reflist", ref: "Formations" }
    ]
  },
  {
    id: "Abonnement",
    group: "Comptes",
    x: 320,
    y: 320,
    fields: [
      { name: "Statut", type: "choice" },
      { name: "TypeFormule", type: "choice" },
      { name: "DateDebut", type: "date" },
      { name: "DateExpiration", type: "date" },
      { name: "Montant", type: "numeric" },
      { name: "JoursRestants", type: "int", formula: "rec.DateExpiration - TODAY()" }
    ]
  },
  {
    id: "Auxiliaires_GrandCompte",
    group: "Comptes",
    x: 320,
    y: 898,
    fields: [
      { name: "NomCompte", type: "text" },
      { name: "NbAuxiliaires", type: "int" },
      { name: "DateDebut", type: "date" },
      { name: "DateExpiration", type: "date", formula: "rec.DateDebut + 365" }
    ]
  },
  {
    id: "Formations",
    group: "Contenu",
    x: 700,
    y: 580,
    fields: [
      { name: "Titre", type: "text" },
      { name: "Code", type: "text" },
      { name: "NbVideos", type: "int" },
      { name: "PrixParticulier", type: "numeric" },
      { name: "Description", type: "longtext" },
      { name: "AttestationDoc", type: "attachment" },
      { name: "Chapitres", type: "reflist", ref: "Chapitre_stats" }
    ]
  },
  {
    id: "Chapitre_stats",
    group: "Contenu",
    x: 1070,
    y: 580,
    fields: [
      { name: "Titre", type: "text" },
      { name: "Formation", type: "ref", ref: "Formations" },
      { name: "Likes", type: "int" },
      { name: "Dislikes", type: "int" },
      { name: "Ordre", type: "int" },
      { name: "TauxSatisfaction", type: "numeric", formula: "rec.Likes / (rec.Likes + rec.Dislikes)" }
    ]
  },
  {
    id: "Modules_Bientraitance",
    group: "Modules",
    x: 1430,
    y: 320,
    fields: [
      { name: "Titre", type: "text" },
      { name: "Chapitre", type: "ref", ref: "Chapitre_stats" },
      { name: "Introduction", type: "longtext" },
      { name: "Quiz1", type: "choice" },
      { name: "BonneRep", type: "text" },
      { name: "Duree", type: "int" }
    ]
  },
  {
    id: "Modules_Nutrition",
    group: "Modules",
    x: 1430,
    y: 600,
    fields: [
      { name: "Titre", type: "text" },
      { name: "Chapitre", type: "ref", ref: "Chapitre_stats" },
      { name: "Recette", type: "longtext" },
      { name: "Astuce", type: "text" },
      { name: "Duree", type: "int" }
    ]
  },
  {
    id: "Modules_Deuil",
    group: "Modules",
    x: 1430,
    y: 860,
    fields: [
      { name: "Titre", type: "text" },
      { name: "Chapitre", type: "ref", ref: "Chapitre_stats" },
      { name: "Quiz", type: "choice" },
      { name: "BonneRep", type: "text" }
    ]
  }
];

export function tableById(tables, id) {
  return tables.find((t) => t.id === id);
}

export function defaultPositions(tables) {
  const positions = {};
  tables.forEach((t) => {
    positions[t.id] = { x: t.x, y: t.y };
  });
  return positions;
}
