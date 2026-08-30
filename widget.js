(() => {
  // src/data/tables.js
  var TABLES = [
    {
      id: "Utilisateurs",
      group: "Comptes",
      x: 320,
      y: 580,
      description: "Un compte apprenant. Cr\xE9\xE9 automatiquement \xE0 la premi\xE8re connexion via le SSO du client.",
      fields: [
        { name: "Nom", type: "text" },
        { name: "Email", type: "text" },
        { name: "DateInscription", type: "date" },
        {
          name: "Abonnement",
          type: "ref",
          ref: "Abonnement",
          displayColumn: "Statut",
          description: "L'abonnement individuel de l'utilisateur, distinct de celui de son grand compte le cas \xE9ch\xE9ant."
        },
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
        { name: "DateExpiration", type: "date", formula: "rec.DateDebut + 365" },
        // Référence cassée : la table visée n'existe plus (colonne oubliée
        // après une suppression). Exemple de démo pour la détection dédiée
        // (brokenRef est calculé automatiquement par markBrokenReferences).
        { name: "AncienneOffre", type: "ref", ref: "Offres_Archivees" }
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
        {
          name: "Chapitres",
          type: "reflist",
          ref: "Chapitre_stats",
          reverseField: { table: "Chapitre_stats", name: "Formation" }
        }
      ]
    },
    {
      id: "Chapitre_stats",
      group: "Contenu",
      x: 1070,
      y: 580,
      fields: [
        { name: "Titre", type: "text" },
        {
          name: "Formation",
          type: "ref",
          ref: "Formations",
          reverseField: { table: "Formations", name: "Chapitres" }
        },
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
    },
    {
      id: "Parametres",
      group: "Syst\xE8me",
      x: 1430,
      y: 1120,
      description: "R\xE9glages globaux de la plateforme (une seule ligne en pratique). Table volontairement isol\xE9e.",
      fields: [
        { name: "NomPlateforme", type: "text" },
        { name: "ContactSupport", type: "text" },
        { name: "MaintenanceActive", type: "bool" }
      ]
    }
  ];
  function tableById(tables, id) {
    return tables.find((t) => t.id === id);
  }
  function defaultPositions(tables) {
    const positions = {};
    tables.forEach((t) => {
      positions[t.id] = { x: t.x, y: t.y };
    });
    return positions;
  }

  // src/constants.js
  var TYPE_LABELS = {
    text: "Texte",
    longtext: "Texte",
    // Grist ne distingue pas texte et texte long
    numeric: "Num\xE9rique",
    int: "Entier",
    bool: "Bool\xE9en",
    date: "Date",
    datetime: "Date et heure",
    choice: "Choix unique",
    choicelist: "Choix multiple",
    attachment: "Pi\xE8ce jointe",
    ref: "R\xE9f\xE9rence",
    reflist: "R\xE9f\xE9rence multiple"
  };
  var GROUP_COLORS = {
    Comptes: "#F77245",
    Contenu: "#0FAE93",
    Modules: "#59736E",
    Syst\u00E8me: "#8676D9"
  };
  var CREATABLE_FIELD_TYPES = [
    "text",
    "numeric",
    "int",
    "bool",
    "date",
    "datetime",
    "choice",
    "choicelist",
    "attachment"
  ];
  var CHOICE_LIKE_TYPES = ["choice", "choicelist"];
  var CARD_W = 232;
  var HEADER_H = 38;
  var ROW_H = 27;

  // src/layout.js
  var GAP_X = 40;
  var GAP_Y = 40;
  var MAX_COLUMN_HEIGHT = 860;
  var DEFAULT_MARGIN = 280;
  function cardHeight(table) {
    return HEADER_H + table.fields.length * ROW_H;
  }
  function computeGridLayout(tables, startX = DEFAULT_MARGIN, startY = DEFAULT_MARGIN) {
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

  // src/data/connections.js
  var EDGE_MARGIN = 10;
  function computeTargetOffset(index, groupSize, targetCardHeight) {
    if (groupSize <= 1) return 0;
    const top = EDGE_MARGIN - HEADER_H / 2;
    const bottom = targetCardHeight - HEADER_H / 2 - EDGE_MARGIN;
    if (bottom <= top) return 0;
    return top + index / (groupSize - 1) * (bottom - top);
  }
  function mergeReverseFieldPairs(rawConnections) {
    const byKey = new Map(rawConnections.map((c) => [c.key, c]));
    const consumed = /* @__PURE__ */ new Set();
    const merged = [];
    rawConnections.forEach((c) => {
      if (consumed.has(c.key)) return;
      const mirrorKey = c.reverseField && `${c.reverseField.table}.${c.reverseField.name}`;
      const mirror = mirrorKey ? byKey.get(mirrorKey) : null;
      const isMutual = mirror && mirror.reverseField && mirror.reverseField.table === c.from && mirror.reverseField.name === c.fieldName;
      if (isMutual) {
        consumed.add(c.key);
        consumed.add(mirror.key);
        merged.push({
          key: c.key,
          from: c.from,
          fieldIndex: c.fieldIndex,
          to: c.to,
          toFieldIndex: mirror.fieldIndex,
          kind: c.kind,
          bidirectional: true
        });
      } else {
        merged.push({ key: c.key, from: c.from, fieldIndex: c.fieldIndex, to: c.to, kind: c.kind, isStaged: c.isStaged });
      }
    });
    return merged;
  }
  function buildConnections(tables) {
    const byId2 = new Map(tables.map((t) => [t.id, t]));
    const raw = [];
    tables.forEach((t) => {
      t.fields.forEach((f, fieldIndex) => {
        if (f.ref && !f.brokenRef) {
          raw.push({
            key: `${t.id}.${f.name}`,
            from: t.id,
            fieldName: f.name,
            fieldIndex,
            to: f.ref,
            kind: f.type,
            reverseField: f.reverseField,
            isStaged: f.isStaged
          });
        }
      });
    });
    const connections = mergeReverseFieldPairs(raw);
    const targetGroups = {};
    connections.forEach((c) => {
      if (c.bidirectional) return;
      (targetGroups[c.to] = targetGroups[c.to] || []).push(c);
    });
    Object.entries(targetGroups).forEach(([targetId, group]) => {
      const height = cardHeight(byId2.get(targetId));
      group.forEach((c, i) => {
        c.targetOffset = computeTargetOffset(i, group.length, height);
      });
    });
    return connections;
  }
  function connectedTables(connections, id) {
    const set = /* @__PURE__ */ new Set();
    connections.forEach((c) => {
      if (c.from === id) set.add(c.to);
      if (c.to === id) set.add(c.from);
    });
    return set;
  }
  function orphanTableIds(tables, connections) {
    const linked = /* @__PURE__ */ new Set();
    connections.forEach((c) => {
      linked.add(c.from);
      linked.add(c.to);
    });
    return new Set(tables.filter((t) => !linked.has(t.id)).map((t) => t.id));
  }

  // src/data/referenceIntegrity.js
  function markBrokenReferences(tables) {
    const existingIds = new Set(tables.map((t) => t.id));
    return tables.map((t) => ({
      ...t,
      fields: t.fields.map((f) => f.ref && !existingIds.has(f.ref) ? { ...f, brokenRef: true } : f)
    }));
  }

  // src/data/documentState.js
  function isEffectivelyEmpty(tables) {
    if (tables.length === 0) return true;
    if (tables.length > 1) return false;
    const [table] = tables;
    return !table.description && table.fields.every((f) => f.isGeneric);
  }

  // src/data/health.js
  function isUntouchedTable(table) {
    if (table.fields.length !== 3) return false;
    const names = table.fields.map((f) => f.name).sort().join(",");
    if (names !== "A,B,C") return false;
    return table.fields.every((f) => f.isGeneric);
  }
  function computeModelHealth(tables) {
    const genericFields = [];
    const brokenRefFields = [];
    const rowIdDisplayFields = [];
    const emptyColumnFields = [];
    const untouchedTables = [];
    tables.forEach((t) => {
      t.fields.forEach((f) => {
        if (f.isGeneric) genericFields.push({ table: t.id, field: f.name });
        if (f.brokenRef) brokenRefFields.push({ table: t.id, field: f.name });
        if (f.ref && !f.displayColumn) rowIdDisplayFields.push({ table: t.id, field: f.name });
        if (f.isEmptyColumn) emptyColumnFields.push({ table: t.id, field: f.name });
      });
      if (isUntouchedTable(t)) untouchedTables.push(t.id);
    });
    return { genericFields, brokenRefFields, rowIdDisplayFields, emptyColumnFields, untouchedTables };
  }

  // src/data/staging.js
  function createStagingState() {
    return { tables: [], fields: [] };
  }
  function isStagingEmpty(staging) {
    return staging.tables.length === 0 && staging.fields.length === 0;
  }
  function isStagedTableName(staging, id) {
    return staging.tables.some((t) => t.name === id);
  }
  function sameOwner(a, b) {
    return a.kind === b.kind && a.id === b.id;
  }
  function sameRef(a, b) {
    if (!a || !b) return false;
    return a.kind === b.kind && a.id === b.id;
  }
  function addStagedTable(staging, name, group = "Brouillon") {
    return { ...staging, tables: [...staging.tables, { name, group }] };
  }
  function removeStagedTable(staging, name) {
    const owner = { kind: "staged", id: name };
    return {
      ...staging,
      tables: staging.tables.filter((t) => t.name !== name),
      fields: staging.fields.filter((f) => !sameOwner(f.owner, owner) && !sameRef(f.ref, owner))
    };
  }
  function addStagedField(staging, owner, { name, type, choices, ref, displayField }) {
    return {
      ...staging,
      fields: [
        ...staging.fields,
        { owner, name, type, choices: choices || [], ref: ref || null, displayField: displayField || null }
      ]
    };
  }
  function removeStagedField(staging, owner, name) {
    return {
      ...staging,
      fields: staging.fields.filter((f) => !(sameOwner(f.owner, owner) && f.name === name))
    };
  }
  function stagedFieldsForOwner(staging, ownerKind, ownerId) {
    return staging.fields.filter((f) => f.owner.kind === ownerKind && f.owner.id === ownerId);
  }
  function stagedFieldCount(staging) {
    return staging.fields.length;
  }
  function stagedLinkCount(staging) {
    return staging.fields.filter((f) => f.ref).length;
  }
  function validateNewTableName(staging, tables, name) {
    const trimmed = String(name || "").trim();
    if (!trimmed) return "Le nom de la table ne peut pas \xEAtre vide.";
    if (tables.some((t) => t.id === trimmed)) return `Une table \xAB ${trimmed} \xBB existe d\xE9j\xE0 dans le document.`;
    if (isStagedTableName(staging, trimmed)) return `Une table \xAB ${trimmed} \xBB est d\xE9j\xE0 en brouillon.`;
    return null;
  }
  function validateNewFieldName(staging, tables, owner, name) {
    const trimmed = String(name || "").trim();
    if (!trimmed) return "Le nom du champ ne peut pas \xEAtre vide.";
    if (owner.kind === "real") {
      const table = tables.find((t) => t.id === owner.id);
      if (table && table.fields.some((f) => f.name === trimmed)) {
        return `Un champ \xAB ${trimmed} \xBB existe d\xE9j\xE0 dans \xAB ${owner.id} \xBB.`;
      }
    }
    if (stagedFieldsForOwner(staging, owner.kind, owner.id).some((f) => f.name === trimmed)) {
      return `Un champ \xAB ${trimmed} \xBB est d\xE9j\xE0 en brouillon dans \xAB ${owner.id} \xBB.`;
    }
    return null;
  }
  function resolveStagedFieldReferences(fields, resolvedTableNames) {
    const resolveRef = (ref) => {
      if (ref && ref.kind === "staged" && resolvedTableNames[ref.id]) {
        return { kind: "real", id: resolvedTableNames[ref.id] };
      }
      return ref;
    };
    return fields.map((f) => ({
      ...f,
      owner: resolveRef(f.owner),
      ref: f.ref ? resolveRef(f.ref) : f.ref
    }));
  }
  function buildSchemaSummaryText(staging) {
    const lines = [];
    staging.tables.forEach((t) => {
      lines.push(`+ Table \xAB ${t.name} \xBB`);
    });
    staging.fields.forEach((f) => {
      const typeLabel = TYPE_LABELS[f.type] || f.type;
      const target = f.ref ? ` \u2192 ${f.ref.id}` : "";
      const displayPart = f.ref && f.displayField ? ` (affiche : ${f.displayField})` : "";
      const choicesPart = f.choices && f.choices.length ? ` (${f.choices.join(", ")})` : "";
      lines.push(`+ Champ \xAB ${f.name} \xBB (${typeLabel}${target}${displayPart}${choicesPart}) dans \xAB ${f.owner.id} \xBB`);
    });
    return lines.join("\n");
  }

  // src/state.js
  function createState(tables) {
    return {
      focused: null,
      showAll: false,
      search: "",
      hoveredConn: null,
      zoom: 1,
      // Mode édition : désactivé par défaut à chaque ouverture du widget — voir
      // README/consignes V3, "lecture par défaut, édition sur activation
      // explicite". Aucune interaction de création n'est possible tant que ce
      // n'est pas true.
      editMode: false,
      // Brouillon de schéma (tables/champs/liaisons pas encore écrits dans
      // Grist) — voir data/staging.js et data/displayModel.js.
      staging: createStagingState(),
      defaultPositions: defaultPositions(tables),
      positions: defaultPositions(tables)
    };
  }
  function resetPositions(state) {
    state.positions = JSON.parse(JSON.stringify(state.defaultPositions));
    return state.positions;
  }

  // src/icons.js
  var GLYPH_ICONS = {
    text: { label: "T", size: 12, weight: 800 },
    longtext: { label: "T", size: 12, weight: 800 },
    // Grist ne distingue pas texte et texte long
    numeric: { label: "1.0", size: 7.5, weight: 700 },
    int: { label: "[1]", size: 7.5, weight: 700 }
  };
  var PATH_ICONS = {
    bool: '<rect x="3" y="7" width="14" height="7" rx="3.5"/><circle cx="13.3" cy="10.5" r="2.2" fill="currentColor" stroke="none"/>',
    date: '<rect x="3" y="5" width="14" height="12" rx="1.6"/><path d="M3 9h14M7 3v3.4M13 3v3.4"/>',
    datetime: '<circle cx="10" cy="10" r="7"/><path d="M10 6.7V10.3l2.6 1.7"/>',
    choice: '<circle cx="10" cy="10" r="7"/><path d="M6.7 10.3l2 2 4.4-4.8"/>',
    choicelist: '<circle cx="10" cy="10" r="7"/><path d="M5.3 11l1.3 1.3 2.6-3"/><path d="M10.8 11l1.3 1.3 2.6-3"/>',
    attachment: '<path d="M12.5 5.2 7 10.7a2.6 2.6 0 0 0 3.7 3.7l5.7-5.7a4.3 4.3 0 1 0-6-6L4.7 8.4"/>',
    ref: '<path d="M8.3 11.7a4.1 4.1 0 0 0 6.2.4l2.3-2.3a4.1 4.1 0 0 0-5.8-5.8l-1.3 1.3"/><path d="M11.7 8.3a4.1 4.1 0 0 0-6.2-.4l-2.3 2.3a4.1 4.1 0 0 0 5.8 5.8l1.3-1.3"/>',
    reflist: '<path d="M4.2 9a2.5 2.5 0 0 0 3.8.3l1.3-1.3a2.5 2.5 0 0 0-3.5-3.5l-.6.6"/><path d="M6.6 6.6a2.5 2.5 0 0 0-3.8-.3L1.5 7.6a2.5 2.5 0 0 0 3.5 3.5l.6-.6"/><path d="M12.2 15a2.5 2.5 0 0 0 3.8.3l1.3-1.3a2.5 2.5 0 0 0-3.5-3.5l-.6.6" opacity="0.55"/><path d="M14.6 12.6a2.5 2.5 0 0 0-3.8-.3l-1.3 1.3a2.5 2.5 0 0 0 3.5 3.5l.6-.6" opacity="0.55"/>'
  };
  function icon(name, extraAttrs = "") {
    const glyph = GLYPH_ICONS[name];
    if (glyph) {
      return `<svg class="ficon" viewBox="0 0 20 20" ${extraAttrs}><text x="10" y="14.5" text-anchor="middle" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="${glyph.size}" font-weight="${glyph.weight}" fill="currentColor" stroke="none">${glyph.label}</text></svg>`;
    }
    const shape = PATH_ICONS[name] || PATH_ICONS.ref;
    return `<svg class="ficon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ${extraAttrs}>${shape}</svg>`;
  }

  // src/render/legend.js
  var LEGEND_TYPES = [
    ["text", "Texte"],
    ["numeric", "Num\xE9rique"],
    ["int", "Entier"],
    ["bool", "Bool\xE9en"],
    ["date", "Date"],
    ["datetime", "Date et heure"],
    ["choice", "Choix unique"],
    ["choicelist", "Choix multiple"],
    ["attachment", "Pi\xE8ce jointe"]
  ];
  function renderLegend(legendBody) {
    legendBody.innerHTML = "";
    LEGEND_TYPES.forEach(([type, label]) => {
      legendBody.insertAdjacentHTML("beforeend", `<div class="legend-item">${icon(type)}<span>${label}</span></div>`);
    });
    legendBody.insertAdjacentHTML(
      "beforeend",
      `<div class="legend-item ref">${icon("ref")}<span>R\xE9f\xE9rence</span></div>`
    );
    legendBody.insertAdjacentHTML(
      "beforeend",
      `<div class="legend-item ref">${icon("reflist")}<span>R\xE9f\xE9rence multiple</span></div>`
    );
    legendBody.insertAdjacentHTML(
      "beforeend",
      `<div class="legend-item"><span class="ftag" style="position:static">\u0192x</span><span>Formule</span></div>`
    );
  }
  function bindLegendToggle(legendEl, toggleEl) {
    toggleEl.addEventListener("click", () => {
      legendEl.classList.toggle("is-collapsed");
    });
  }

  // src/render/health.js
  function plural(count) {
    return count > 1 ? "s" : "";
  }
  function appendItemList(section, items, onJump) {
    if (items.length === 0) return;
    const list = document.createElement("div");
    list.className = "health-item-list";
    items.forEach((item) => {
      const isTableOnly = typeof item === "string";
      const tableId = isTableOnly ? item : item.table;
      const fieldName = isTableOnly ? null : item.field;
      const chip = document.createElement("button");
      chip.className = "health-item-chip";
      if (fieldName) {
        const fieldEl = document.createElement("span");
        fieldEl.className = "chip-field";
        fieldEl.textContent = fieldName;
        const tableEl = document.createElement("span");
        tableEl.className = "chip-table";
        tableEl.textContent = tableId;
        chip.appendChild(fieldEl);
        chip.appendChild(tableEl);
      } else {
        chip.textContent = tableId;
      }
      chip.addEventListener("click", () => onJump(tableId, fieldName));
      list.appendChild(chip);
    });
    section.appendChild(list);
  }
  function renderIndicator(bodyEl, count, label, items, onJump) {
    const section = document.createElement("div");
    section.className = "health-indicator";
    section.innerHTML = `<div class="health-count">${count}</div><div class="health-label">${label}</div>`;
    appendItemList(section, items, onJump);
    bodyEl.appendChild(section);
  }
  function renderHealthPanel(bodyEl, health, onJump) {
    bodyEl.innerHTML = "";
    renderIndicator(
      bodyEl,
      health.genericFields.length,
      `colonne${plural(health.genericFields.length)} en type g\xE9n\xE9rique (Any) non finalis\xE9${plural(health.genericFields.length)}`,
      health.genericFields,
      onJump
    );
    renderIndicator(
      bodyEl,
      health.brokenRefFields.length,
      `r\xE9f\xE9rence${plural(health.brokenRefFields.length)} cass\xE9e${plural(health.brokenRefFields.length)} (table cible supprim\xE9e)`,
      health.brokenRefFields,
      onJump
    );
    renderIndicator(
      bodyEl,
      health.rowIdDisplayFields.length,
      // "Montrer la colonne : Id de ligne" dans Grist : la référence affiche un
      // identifiant numérique brut (ex. "Agences[321]") plutôt qu'un champ
      // représentatif — c'est un réglage bel et bien présent dans Grist, pas
      // une case vide, d'où ce libellé qui décrit l'effet plutôt qu'un oubli.
      `r\xE9f\xE9rence${plural(health.rowIdDisplayFields.length)} affichant l'identifiant de ligne brut`,
      health.rowIdDisplayFields,
      onJump
    );
    renderIndicator(
      bodyEl,
      health.emptyColumnFields.length,
      // Vocabulaire Grist : "Colonne vide" est la nature de colonne d'un champ
      // ajouté mais jamais tranché entre donnée et formule — ce n'est une
      // "colonne formule" qu'une fois du code écrit dedans.
      `colonne${plural(health.emptyColumnFields.length)} encore \xE0 l'\xE9tat "Colonne vide"`,
      health.emptyColumnFields,
      onJump
    );
    renderIndicator(
      bodyEl,
      health.untouchedTables.length,
      `table${plural(health.untouchedTables.length)} encore \xE0 l'\xE9tat de cr\xE9ation (jamais travaill\xE9e${plural(health.untouchedTables.length)})`,
      health.untouchedTables,
      onJump
    );
  }

  // src/escapeHtml.js
  var ESCAPE_MAP = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);
  }

  // src/search.js
  function fieldMatches(field, q) {
    return field.name.toLowerCase().includes(q) || field.formula && field.formula.toLowerCase().includes(q) || field.description && field.description.toLowerCase().includes(q);
  }
  function tableSearchResult(table, query) {
    const q = query.trim().toLowerCase();
    const tableMatch = table.id.toLowerCase().includes(q) || Boolean(table.description && table.description.toLowerCase().includes(q));
    const matchedFields = new Set(q.length > 0 ? table.fields.filter((f) => fieldMatches(f, q)).map((f) => f.name) : []);
    const dim = q.length > 0 && !tableMatch && matchedFields.size === 0;
    return { tableMatch, matchedFields, dim };
  }
  function applySearchToCards(canvasContent, tables, query) {
    const byId2 = new Map(tables.map((t) => [t.id, t]));
    canvasContent.querySelectorAll(".table-card").forEach((card) => {
      const table = byId2.get(card.dataset.id);
      const { matchedFields, dim } = tableSearchResult(table, query);
      card.querySelectorAll(".field-row").forEach((row) => {
        row.classList.toggle("is-match", matchedFields.has(row.dataset.field));
      });
      card.style.opacity = dim ? "0.28" : "";
    });
  }

  // src/render/sidebar.js
  function groupTables(tables) {
    const groups = /* @__PURE__ */ new Map();
    tables.forEach((t) => {
      if (!groups.has(t.group)) groups.set(t.group, []);
      groups.get(t.group).push(t);
    });
    return groups;
  }
  function renderSidebar(sidebarEl, tables, focusedId, onSelect, orphanIds = /* @__PURE__ */ new Set()) {
    sidebarEl.innerHTML = "";
    groupTables(tables).forEach((groupTables_, groupName) => {
      const wrap = document.createElement("div");
      wrap.className = "sidebar-group";
      wrap.innerHTML = `<div class="sidebar-group-label">${escapeHtml(groupName)}</div>`;
      groupTables_.forEach((t) => {
        const row = document.createElement("div");
        row.className = "sidebar-row";
        if (t.id === focusedId) row.classList.add("is-focused");
        row.dataset.table = t.id;
        const orphanMark = orphanIds.has(t.id) ? '<span class="orphan-dot" title="Aucune liaison entrante ni sortante">\u25CF</span>' : "";
        row.innerHTML = `<span class="name">${escapeHtml(t.id)}</span>${orphanMark}<span class="count">${t.fields.length}</span>`;
        row.addEventListener("click", () => onSelect(t.id));
        wrap.appendChild(row);
      });
      sidebarEl.appendChild(wrap);
    });
  }
  function applySidebarSearch(sidebarEl, tables, query) {
    const byId2 = new Map(tables.map((t) => [t.id, t]));
    sidebarEl.querySelectorAll(".sidebar-row").forEach((row) => {
      const table = byId2.get(row.dataset.table);
      const { dim } = tableSearchResult(table, query);
      row.classList.toggle("is-dim", dim);
    });
  }

  // src/render/cards.js
  function fieldRowHTML(tableId, field, idx) {
    const isRef = field.type === "ref" || field.type === "reflist";
    const classes = ["field-row"];
    if (isRef) classes.push("is-ref");
    if (field.brokenRef) classes.push("is-broken-ref");
    if (field.isStaged) classes.push("is-staged");
    const safeName = escapeHtml(field.name);
    const safeRef = escapeHtml(field.ref);
    const refHTML = field.brokenRef ? `<span class="fref-broken" title="R\xE9f\xE9rence cass\xE9e : la table \xAB ${safeRef} \xBB n'existe plus">\u26A0 ${safeRef}</span>` : isRef ? `<span class="fref-target" data-jump="${safeRef}">\u2192 ${safeRef}</span>` : "";
    const removeBtn = field.isStaged ? `<button type="button" class="staged-remove staged-remove-field" title="Retirer ce champ du brouillon">\xD7</button>` : "";
    return `<div class="${classes.join(" ")}" data-table="${escapeHtml(tableId)}" data-field="${safeName}" data-idx="${idx}">
      ${icon(field.type)}
      <span class="fname${field.description ? " has-desc" : ""}">${safeName}</span>
      ${field.formula ? '<span class="ftag">\u0192x</span>' : ""}
      ${refHTML}
      ${removeBtn}
    </div>`;
  }
  function cardHTML(table, isOrphan, editMode) {
    const safeId = escapeHtml(table.id);
    const linkHandle = editMode ? `<button type="button" class="link-handle" title="Tracer une liaison vers une autre table">\u{1F517}</button>` : "";
    const removeTableBtn = table.isStaged ? `<button type="button" class="staged-remove staged-remove-table" title="Retirer cette table du brouillon">\xD7</button>` : "";
    return `
    <div class="card-header">
      <span class="dot"></span>
      <span class="tname${table.description ? " has-desc" : ""}">${safeId}</span>
      ${isOrphan ? '<span class="otag" title="Aucune liaison entrante ni sortante">Isol\xE9e</span>' : ""}
      <span class="fcount">${table.fields.length}</span>
      ${linkHandle}
      ${removeTableBtn}
    </div>
    <div class="card-body">
      ${table.fields.map((f, i) => fieldRowHTML(table.id, f, i)).join("")}
      ${editMode ? `<div class="field-row add-field-row" data-table="${safeId}"><span class="add-field-icon">+</span><span>Ajouter un champ</span></div>` : ""}
    </div>`;
  }
  function renderCards(canvasContent, tables, positions, orphanIds = /* @__PURE__ */ new Set(), editMode = false) {
    canvasContent.querySelectorAll(".table-card").forEach((el) => el.remove());
    tables.forEach((t) => {
      const pos = positions[t.id];
      const card = document.createElement("div");
      card.className = t.isStaged ? "table-card is-staged" : "table-card";
      card.dataset.id = t.id;
      card.style.left = `${pos.x}px`;
      card.style.top = `${pos.y}px`;
      card.style.setProperty("--group-color", GROUP_COLORS[t.group] || "#59736E");
      card.innerHTML = cardHTML(t, orphanIds.has(t.id), editMode);
      canvasContent.appendChild(card);
    });
  }
  function attachCardBehaviors(canvasContent, positions, callbacks, getZoom = () => 1) {
    canvasContent.querySelectorAll(".table-card").forEach((card) => {
      const header = card.querySelector(".card-header");
      let dragging = false;
      let moved = false;
      let startX, startY, origX, origY;
      header.addEventListener("mousedown", (e) => {
        dragging = true;
        moved = false;
        startX = e.clientX;
        startY = e.clientY;
        const pos = positions[card.dataset.id];
        origX = pos.x;
        origY = pos.y;
        card.classList.add("is-dragging");
        e.preventDefault();
      });
      header.addEventListener("mouseenter", () => callbacks.onTableHover(card.dataset.id));
      header.addEventListener("mousemove", (e) => callbacks.onTableMove(e));
      header.addEventListener("mouseleave", () => callbacks.onTableLeave());
      window.addEventListener("mousemove", (e) => {
        if (!dragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
        if (!moved) return;
        const zoom = getZoom() || 1;
        const pos = positions[card.dataset.id];
        pos.x = Math.max(0, origX + dx / zoom);
        pos.y = Math.max(0, origY + dy / zoom);
        card.style.left = `${pos.x}px`;
        card.style.top = `${pos.y}px`;
        callbacks.onCardMoved(card.dataset.id);
      });
      window.addEventListener("mouseup", () => {
        if (!dragging) return;
        dragging = false;
        card.classList.remove("is-dragging");
        if (!moved) callbacks.onCardToggled(card.dataset.id);
      });
      const linkHandle = card.querySelector(".link-handle");
      if (linkHandle) {
        linkHandle.addEventListener("mousedown", (e) => {
          e.stopPropagation();
          e.preventDefault();
          callbacks.onLinkDragStart(card.dataset.id, e.clientX, e.clientY);
        });
      }
      const removeTableBtn = card.querySelector(".staged-remove-table");
      if (removeTableBtn) {
        removeTableBtn.addEventListener("mousedown", (e) => e.stopPropagation());
        removeTableBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          callbacks.onRemoveStagedTable(card.dataset.id);
        });
      }
      const addFieldRow = card.querySelector(".add-field-row");
      if (addFieldRow) {
        addFieldRow.addEventListener("click", (e) => {
          e.stopPropagation();
          callbacks.onAddField(card.dataset.id, addFieldRow);
        });
      }
      card.querySelectorAll(".field-row:not(.add-field-row)").forEach((row) => {
        row.addEventListener("mouseenter", (e) => callbacks.onFieldHover(row, e));
        row.addEventListener("mousemove", (e) => callbacks.onFieldMove(e));
        row.addEventListener("mouseleave", () => callbacks.onFieldLeave());
        const removeFieldBtn = row.querySelector(".staged-remove-field");
        if (removeFieldBtn) {
          removeFieldBtn.addEventListener("mousedown", (e) => e.stopPropagation());
          removeFieldBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            callbacks.onRemoveStagedField(card.dataset.id, row.dataset.field);
          });
        }
        if (row.classList.contains("is-ref")) {
          row.addEventListener("mouseenter", () => callbacks.onRefEnter(row));
          row.addEventListener("mouseleave", () => callbacks.onRefLeave());
          const jump = row.querySelector(".fref-target");
          if (jump) {
            jump.addEventListener("click", (e) => {
              e.stopPropagation();
              callbacks.onRefJump(jump.dataset.jump);
            });
          }
        }
      });
    });
  }

  // src/geometry.js
  function fieldAnchor(positions, tableId, fieldIdx, side = "right") {
    const pos = positions[tableId];
    const x = side === "left" ? pos.x : pos.x + CARD_W;
    return { x, y: pos.y + HEADER_H + fieldIdx * ROW_H + ROW_H / 2 };
  }
  function tableAnchor(positions, tableId, offset = 0) {
    const pos = positions[tableId];
    return { x: pos.x, y: pos.y + HEADER_H / 2 + offset };
  }
  function canvasPointFromClient(clientX, clientY, rect, scrollLeft, scrollTop, zoom) {
    return {
      x: (scrollLeft + clientX - rect.left) / zoom,
      y: (scrollTop + clientY - rect.top) / zoom
    };
  }
  function elbowPath(a, b, cornerRadius = 8) {
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
  function cardinalityMarker(point, dirX, kind) {
    const { x, y } = point;
    if (kind === "many") {
      const backX = x - dirX * 10;
      return `M ${x} ${y} L ${backX} ${y - 6} M ${x} ${y} L ${backX} ${y + 6}`;
    }
    const tickX = x - dirX * 8;
    return `M ${tickX} ${y - 6} L ${tickX} ${y + 6}`;
  }
  function connectorPath(a, b, kind) {
    const dirX = Math.sign(b.x - a.x) || 1;
    const sourceKind = kind === "reflist" ? "one" : "many";
    const targetKind = kind === "reflist" ? "many" : "one";
    return [
      elbowPath(a, b),
      cardinalityMarker(a, dirX, sourceKind),
      cardinalityMarker(b, dirX, targetKind)
    ].join(" ");
  }

  // src/render/wires.js
  var SVG_NS = "http://www.w3.org/2000/svg";
  function renderWires(svg, connections, positions) {
    svg.innerHTML = "";
    const frag = document.createDocumentFragment();
    connections.forEach((c) => {
      const a = fieldAnchor(positions, c.from, c.fieldIndex);
      const b = c.bidirectional ? fieldAnchor(positions, c.to, c.toFieldIndex, "left") : tableAnchor(positions, c.to, c.targetOffset);
      const path = document.createElementNS(SVG_NS, "path");
      path.classList.add("wire");
      if (c.isStaged) path.classList.add("is-staged");
      path.dataset.key = c.key;
      path.setAttribute("d", connectorPath(a, b, c.kind));
      frag.appendChild(path);
    });
    svg.appendChild(frag);
  }
  function wireVisualState(conn, state) {
    const isFocusRelated = Boolean(state.focused) && (conn.from === state.focused || conn.to === state.focused);
    const isHovered = state.hoveredConn === conn.key;
    if (isHovered) return { classes: ["is-hovered"], opacity: "" };
    if (state.focused) {
      if (isFocusRelated) return { classes: ["is-active"], opacity: "" };
      if (state.showAll) return { classes: [], opacity: 0.12 };
      return { classes: ["is-hidden"], opacity: "" };
    }
    if (state.showAll) return { classes: [], opacity: "" };
    return { classes: ["is-hidden"], opacity: "" };
  }
  function updateWireVisibility(svg, connections, state) {
    const byKey = new Map(connections.map((c) => [c.key, c]));
    svg.querySelectorAll(".wire").forEach((el) => {
      const conn = byKey.get(el.dataset.key);
      if (!conn) return;
      el.classList.remove("is-active", "is-hovered", "is-hidden");
      const { classes, opacity } = wireVisualState(conn, state);
      classes.forEach((c) => el.classList.add(c));
      el.style.opacity = opacity === "" ? "" : String(opacity);
    });
  }

  // src/render/tooltip.js
  function tooltipContent(field, tableName) {
    let extraHTML = "";
    if (field.description) {
      extraHTML += `<div class="t-description">${escapeHtml(field.description)}</div>`;
    }
    if (field.ref) {
      extraHTML += `<div class="t-label" style="margin-top:6px;">Cible</div><div class="mono">${escapeHtml(field.ref)}</div>`;
      if (field.brokenRef) {
        extraHTML += `<div class="t-broken">\u26A0 Cette table n'existe plus dans le document</div>`;
      }
      if (field.displayColumn) {
        extraHTML += `<div class="t-display-col">${escapeHtml(field.displayColumn)}</div>`;
      }
    }
    if (field.formula) {
      extraHTML += `<div class="t-label" style="margin-top:6px;">Formule</div><div class="t-formula">${escapeHtml(field.formula)}</div>`;
    }
    return {
      tableName: tableName || "",
      name: field.name,
      typeLabel: TYPE_LABELS[field.type] || field.type,
      extraHTML
    };
  }
  function tableTooltipContent(table) {
    const extraHTML = table.description ? `<div class="t-description">${escapeHtml(table.description)}</div>` : "";
    return { tableName: "", name: table.id, typeLabel: "", extraHTML };
  }
  function tooltipPosition(cursor, tooltipRect, viewport, pad = 14) {
    let x = cursor.x + pad;
    let y = cursor.y + pad;
    if (x + tooltipRect.width > viewport.width - 10) x = cursor.x - tooltipRect.width - pad;
    if (y + tooltipRect.height > viewport.height - 10) y = cursor.y - tooltipRect.height - pad;
    return { x, y };
  }
  function createTooltipController(tooltipEl, tableEl, nameEl, typeEl, extraEl) {
    function show(field, tableName) {
      const content = tooltipContent(field, tableName);
      tableEl.textContent = content.tableName;
      nameEl.textContent = content.name;
      typeEl.textContent = content.typeLabel;
      extraEl.innerHTML = content.extraHTML;
      tooltipEl.classList.add("is-visible");
    }
    function showTable(table) {
      if (!table.description) return;
      const content = tableTooltipContent(table);
      tableEl.textContent = content.tableName;
      nameEl.textContent = content.name;
      typeEl.textContent = content.typeLabel;
      extraEl.innerHTML = content.extraHTML;
      tooltipEl.classList.add("is-visible");
    }
    function move(event) {
      const rect = tooltipEl.getBoundingClientRect();
      const pos = tooltipPosition(
        { x: event.clientX, y: event.clientY },
        rect,
        { width: window.innerWidth, height: window.innerHeight }
      );
      tooltipEl.style.left = `${pos.x}px`;
      tooltipEl.style.top = `${pos.y}px`;
    }
    function hide() {
      tooltipEl.classList.remove("is-visible");
    }
    return { show, showTable, move, hide };
  }

  // src/render/draftCard.js
  function createDraftTableCard({ x, y }) {
    const card = document.createElement("div");
    card.className = "table-card is-draft";
    card.style.left = `${x}px`;
    card.style.top = `${y}px`;
    card.innerHTML = `
    <div class="card-header">
      <span class="dot"></span>
      <span class="tname">Nouvelle table</span>
    </div>
    <div class="card-body draft-body">
      <input type="text" class="draft-name-input" placeholder="Nom de la table\u2026" maxlength="80" autocomplete="off" spellcheck="false">
      <div class="draft-actions">
        <button type="button" class="draft-cancel">Annuler</button>
        <button type="button" class="draft-create" disabled>Ajouter</button>
      </div>
      <div class="draft-error" hidden></div>
    </div>`;
    return card;
  }

  // src/render/draftField.js
  function createDraftFieldRow() {
    const row = document.createElement("div");
    row.className = "field-row is-draft-field";
    const options = CREATABLE_FIELD_TYPES.map(
      (type) => `<option value="${type}">${escapeHtml(TYPE_LABELS[type])}</option>`
    ).join("");
    row.innerHTML = `
    <div class="draft-field-hint">Brouillon \u2014 rien n'est encore cr\xE9\xE9</div>
    <input type="text" class="draft-field-name" placeholder="Nom du champ\u2026" maxlength="80" autocomplete="off" spellcheck="false">
    <select class="draft-field-type">${options}</select>
    <input type="text" class="draft-field-choices" placeholder="Options s\xE9par\xE9es par une virgule (ex. Actif, Inactif)" maxlength="400" autocomplete="off" spellcheck="false" hidden>
    <div class="draft-field-actions">
      <button type="button" class="draft-field-cancel">Annuler</button>
      <button type="button" class="draft-field-create" disabled>Ajouter</button>
    </div>
    <div class="draft-field-error" hidden></div>`;
    return row;
  }
  function isChoiceLikeType(type) {
    return CHOICE_LIKE_TYPES.includes(type);
  }

  // src/render/confirmDialog.js
  function showConfirmDialog(dom2, { message, confirmLabel = "Cr\xE9er", onConfirm, onCancel }) {
    dom2.confirmMessage.textContent = message;
    dom2.confirmConfirmBtn.textContent = confirmLabel;
    dom2.confirmDialog.classList.add("is-visible");
    function cleanup() {
      dom2.confirmDialog.classList.remove("is-visible");
      dom2.confirmConfirmBtn.removeEventListener("click", handleConfirm);
      dom2.confirmCancelBtn.removeEventListener("click", handleCancel);
      dom2.confirmDialog.removeEventListener("click", handleOverlayClick);
    }
    function handleConfirm() {
      cleanup();
      onConfirm();
    }
    function handleCancel() {
      cleanup();
      if (onCancel) onCancel();
    }
    function handleOverlayClick(e) {
      if (e.target === dom2.confirmDialog) handleCancel();
    }
    dom2.confirmConfirmBtn.addEventListener("click", handleConfirm);
    dom2.confirmCancelBtn.addEventListener("click", handleCancel);
    dom2.confirmDialog.addEventListener("click", handleOverlayClick);
  }

  // src/render/linkDraftDialog.js
  var NO_DISPLAY_FIELD = "";
  function showLinkDraftDialog(dom2, { sourceLabel, targetLabel, defaultName, displayFieldOptions = [], onSubmit, onCancel }) {
    dom2.linkDraftSource.textContent = sourceLabel;
    dom2.linkDraftTarget.textContent = targetLabel;
    dom2.linkDraftName.value = defaultName;
    dom2.linkDraftType.value = "ref";
    dom2.linkDraftDisplayCol.innerHTML = `<option value="${NO_DISPLAY_FIELD}">Identifiant interne (par d\xE9faut)</option>` + displayFieldOptions.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join("");
    dom2.linkDraftError.hidden = true;
    dom2.linkDraftDialog.classList.add("is-visible");
    dom2.linkDraftName.focus();
    dom2.linkDraftName.select();
    function cleanup() {
      dom2.linkDraftDialog.classList.remove("is-visible");
      dom2.linkDraftConfirmBtn.removeEventListener("click", handleConfirm);
      dom2.linkDraftCancelBtn.removeEventListener("click", handleCancel);
      dom2.linkDraftName.removeEventListener("keydown", handleKeydown);
      dom2.linkDraftDialog.removeEventListener("click", handleOverlayClick);
    }
    function handleConfirm() {
      const displayField = dom2.linkDraftDisplayCol.value || null;
      const result = onSubmit(dom2.linkDraftName.value, dom2.linkDraftType.value, displayField);
      if (result && result.error) {
        dom2.linkDraftError.hidden = false;
        dom2.linkDraftError.textContent = result.error;
        return;
      }
      cleanup();
    }
    function handleCancel() {
      cleanup();
      if (onCancel) onCancel();
    }
    function handleKeydown(e) {
      if (e.key === "Enter") handleConfirm();
      if (e.key === "Escape") handleCancel();
    }
    function handleOverlayClick(e) {
      if (e.target === dom2.linkDraftDialog) handleCancel();
    }
    dom2.linkDraftConfirmBtn.addEventListener("click", handleConfirm);
    dom2.linkDraftCancelBtn.addEventListener("click", handleCancel);
    dom2.linkDraftName.addEventListener("keydown", handleKeydown);
    dom2.linkDraftDialog.addEventListener("click", handleOverlayClick);
  }

  // src/focus.js
  function applyFocusStyles(canvasContent, connections, focusedId) {
    const related = focusedId ? connectedTables(connections, focusedId) : null;
    canvasContent.querySelectorAll(".table-card").forEach((card) => {
      const id = card.dataset.id;
      card.classList.remove("is-active", "is-dimmed");
      if (!focusedId) return;
      if (id === focusedId || related && related.has(id)) {
        card.classList.add("is-active");
      } else {
        card.classList.add("is-dimmed");
      }
    });
  }

  // src/zoom.js
  var MIN_ZOOM = 0.15;
  var MAX_ZOOM = 2.5;
  var ZOOM_STEP = 1.2;
  function clampZoom(value) {
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
  }
  function tablesBounds(tables, positions, cardWidth, cardHeightFn) {
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
  function computeFitZoom(bounds, viewport, padding = 60) {
    const contentW = bounds.maxX - bounds.minX;
    const contentH = bounds.maxY - bounds.minY;
    if (!(contentW > 0) || !(contentH > 0)) return 1;
    const scale = Math.min((viewport.width - padding) / contentW, (viewport.height - padding) / contentH);
    return Math.max(MIN_ZOOM, Math.min(1, scale));
  }

  // src/data/gristWrite.js
  function sanitizeLabel(rawName) {
    return String(rawName || "").trim();
  }
  function sanitizeColId(rawName) {
    const trimmed = sanitizeLabel(rawName);
    if (!trimmed) return "";
    let id = trimmed.normalize("NFD").replace(new RegExp("[\\u0300-\\u036f]", "g"), "").replace(/[^A-Za-z0-9_]+/g, "_").replace(/^_+|_+$/g, "");
    if (!id) id = "Champ";
    if (/^[0-9]/.test(id)) id = `C${id}`;
    return id;
  }
  function parseChoiceOptions(rawText) {
    return String(rawText || "").split(",").map((value) => value.trim()).filter(Boolean);
  }
  function buildChoiceWidgetOptions(choices) {
    return JSON.stringify({ choices });
  }
  function buildAddTableAction(tableName) {
    return ["AddTable", tableName, []];
  }
  function buildAddColumnAction(tableId, colId, colOptions) {
    return ["AddColumn", tableId, colId, colOptions];
  }
  function buildModifyColumnAction(tableId, colId, colOptions) {
    return ["ModifyColumn", tableId, colId, colOptions];
  }
  function buildAddRecordAction(tableId, colValues) {
    return ["AddRecord", tableId, null, colValues];
  }
  async function applyActionsToGrist(actions) {
    return window.grist.docApi.applyUserActions(actions);
  }

  // src/data/gristTypeMapping.js
  function mapGristType(rawType) {
    if (!rawType || rawType === "Any") return { type: "text", isGeneric: true };
    if (rawType.startsWith("Ref:")) return { type: "ref", ref: rawType.slice(4) };
    if (rawType.startsWith("RefList:")) return { type: "reflist", ref: rawType.slice(8) };
    if (rawType.startsWith("DateTime")) return { type: "datetime" };
    switch (rawType) {
      case "Text":
        return { type: "text" };
      case "Numeric":
        return { type: "numeric" };
      case "Int":
        return { type: "int" };
      case "Bool":
        return { type: "bool" };
      case "Date":
        return { type: "date" };
      case "Choice":
        return { type: "choice" };
      case "ChoiceList":
        return { type: "choicelist" };
      case "Attachments":
        return { type: "attachment" };
      default:
        return { type: "text" };
    }
  }
  var GRIST_TYPE_BY_KEY = {
    text: "Text",
    numeric: "Numeric",
    int: "Int",
    bool: "Bool",
    date: "Date",
    // Fuseau horaire non demandé à l'utilisateur pour rester simple : à
    // vérifier contre un vrai document (le fuseau du document lui-même serait
    // sans doute plus juste qu'un UTC fixe, pas confirmé en pratique).
    datetime: "DateTime:Etc/UTC",
    choice: "Choice",
    choicelist: "ChoiceList",
    attachment: "Attachments"
  };
  function buildGristTypeString(type) {
    const rawType = GRIST_TYPE_BY_KEY[type];
    if (!rawType) throw new Error(`Type de champ non pris en charge pour la cr\xE9ation : ${type}`);
    return rawType;
  }
  function buildGristRefTypeString(type, targetTableName) {
    if (type !== "ref" && type !== "reflist") {
      throw new Error(`Type de liaison non pris en charge : ${type}`);
    }
    const prefix = type === "reflist" ? "RefList" : "Ref";
    return `${prefix}:${targetTableName}`;
  }

  // src/data/tableGrouping.js
  function extractGroupPrefix(tableId) {
    const match = String(tableId).match(/^([A-Za-z]+)\d*_/);
    return match ? match[1] : null;
  }
  function assignGroupsByPrefix(tables) {
    const counts = /* @__PURE__ */ new Map();
    tables.forEach((t) => {
      const prefix = extractGroupPrefix(t.id);
      if (prefix) counts.set(prefix, (counts.get(prefix) || 0) + 1);
    });
    return tables.map((t) => {
      const prefix = extractGroupPrefix(t.id);
      const group = prefix && counts.get(prefix) > 1 ? prefix : "Tables";
      return { ...t, group };
    });
  }

  // src/data/gristSource.js
  var HIDDEN_COL_IDS = /* @__PURE__ */ new Set(["manualSort"]);
  function isHiddenColumn(colId) {
    return HIDDEN_COL_IDS.has(colId) || colId.startsWith("gristHelper_");
  }
  function toRecords(colValues) {
    const keys = Object.keys(colValues);
    const length = colValues.id ? colValues.id.length : 0;
    const records = [];
    for (let i = 0; i < length; i++) {
      const record = {};
      keys.forEach((key) => {
        record[key] = colValues[key][i];
      });
      records.push(record);
    }
    return records;
  }
  function buildTablesFromGristMetadata(tableRows, columnRows) {
    const visibleTables = tableRows.filter(
      (t) => !t.summarySourceTable && !String(t.tableId).startsWith("_grist_")
    );
    const columnsById = new Map(columnRows.map((c) => [c.id, c]));
    const tableIdById = new Map(tableRows.map((t) => [t.id, t.tableId]));
    const tables = visibleTables.map((t) => {
      const fields = columnRows.filter((c) => c.parentId === t.id && !isHiddenColumn(c.colId)).sort((a, b) => a.parentPos - b.parentPos).map((c) => {
        const { type, ref, isGeneric } = mapGristType(c.type);
        const field = { name: c.label || c.colId, type };
        if (isGeneric && !c.isFormula) field.isGeneric = true;
        if (ref) {
          field.ref = ref;
          const displayCol = c.visibleCol ? columnsById.get(c.visibleCol) : null;
          if (displayCol) field.displayColumn = displayCol.label || displayCol.colId;
          const reverseCol = c.reverseCol ? columnsById.get(c.reverseCol) : null;
          if (reverseCol) {
            const reverseTableId = tableIdById.get(reverseCol.parentId);
            if (reverseTableId) {
              field.reverseField = { table: reverseTableId, name: reverseCol.label || reverseCol.colId };
            }
          }
        }
        if (c.isFormula) {
          if (c.formula) field.formula = c.formula;
          else field.isEmptyColumn = true;
        }
        if (c.description) field.description = c.description;
        return field;
      });
      const table = { id: t.tableId, fields };
      if (t.description) table.description = t.description;
      return table;
    });
    tables.sort((a, b) => a.id.localeCompare(b.id, "fr", { numeric: true, sensitivity: "base" }));
    const groupedTables = assignGroupsByPrefix(tables);
    const positions = computeGridLayout(groupedTables);
    groupedTables.forEach((t) => {
      t.x = positions[t.id].x;
      t.y = positions[t.id].y;
    });
    return groupedTables;
  }
  async function loadFromGrist() {
    const { tableRows, columnRows } = await fetchRawGristMetadata();
    return buildTablesFromGristMetadata(tableRows, columnRows);
  }
  async function fetchRawGristMetadata() {
    const [tableColValues, columnColValues] = await Promise.all([
      window.grist.docApi.fetchTable("_grist_Tables"),
      window.grist.docApi.fetchTable("_grist_Tables_column")
    ]);
    return { tableRows: toRecords(tableColValues), columnRows: toRecords(columnColValues) };
  }
  async function fetchRawDataSectionsByTableRef() {
    const [viewColValues, sectionColValues] = await Promise.all([
      window.grist.docApi.fetchTable("_grist_Views"),
      window.grist.docApi.fetchTable("_grist_Views_section")
    ]);
    const viewRows = toRecords(viewColValues);
    const sectionRows = toRecords(sectionColValues);
    const rawDataViewIds = new Set(viewRows.filter((v) => v.type === "raw_data").map((v) => v.id));
    const byTableRef = /* @__PURE__ */ new Map();
    sectionRows.forEach((s) => {
      if (rawDataViewIds.has(s.parentId)) byTableRef.set(s.tableRef, s.id);
    });
    return byTableRef;
  }

  // src/data/displayModel.js
  function toDisplayField(f) {
    const field = { name: f.name, type: f.type, isStaged: true };
    if (f.ref) field.ref = f.ref.id;
    if (f.choices && f.choices.length) field.choices = f.choices;
    return field;
  }
  function buildDisplayTables(tables, staging) {
    const realDisplay = tables.map((t) => {
      const stagedOwnFields = stagedFieldsForOwner(staging, "real", t.id).map(toDisplayField);
      return stagedOwnFields.length ? { ...t, fields: [...t.fields, ...stagedOwnFields] } : t;
    });
    const stagedDisplay = staging.tables.map((t) => ({
      id: t.name,
      group: t.group,
      isStaged: true,
      fields: stagedFieldsForOwner(staging, "staged", t.name).map(toDisplayField)
    }));
    return [...realDisplay, ...stagedDisplay];
  }

  // src/data/schemaCommit.js
  function buildAddTableActions(staging) {
    return staging.tables.map((t) => buildAddTableAction(t.name));
  }
  function resolveStagedTableNames(stagedTables, beforeTableRows, afterTableRows) {
    const beforeIds = new Set(beforeTableRows.map((t) => t.id));
    const newRows = afterTableRows.filter((t) => !beforeIds.has(t.id)).sort((a, b) => a.id - b.id);
    const resolved = {};
    stagedTables.forEach((t, i) => {
      if (newRows[i]) resolved[t.name] = newRows[i].tableId;
    });
    return resolved;
  }
  function buildAddColumnActions(staging) {
    return staging.fields.map((f) => {
      const colId = sanitizeColId(f.name);
      const rawType = f.ref ? buildGristRefTypeString(f.type, f.ref.id) : buildGristTypeString(f.type);
      const colOptions = { type: rawType, label: f.name };
      if (f.choices && f.choices.length) colOptions.widgetOptions = buildChoiceWidgetOptions(f.choices);
      return buildAddColumnAction(f.owner.id, colId, colOptions);
    });
  }
  function buildVisibleColActions(staging, tableRows, columnRows) {
    const tableRowIdByName = new Map(tableRows.map((t) => [t.tableId, t.id]));
    const columnsByTableRowId = /* @__PURE__ */ new Map();
    columnRows.forEach((c) => {
      if (!columnsByTableRowId.has(c.parentId)) columnsByTableRowId.set(c.parentId, []);
      columnsByTableRowId.get(c.parentId).push(c);
    });
    function findColumn(tableName, colLabel) {
      const tableRowId = tableRowIdByName.get(tableName);
      if (tableRowId === void 0) return null;
      const cols = columnsByTableRowId.get(tableRowId) || [];
      return cols.find((c) => c.label === colLabel) || null;
    }
    const actions = [];
    staging.fields.forEach((f) => {
      if (!f.ref || !f.displayField) return;
      const refColumn = findColumn(f.owner.id, f.name);
      const displayColumn = findColumn(f.ref.id, f.displayField);
      if (!refColumn || !displayColumn) return;
      actions.push(buildModifyColumnAction(f.owner.id, refColumn.colId, { visibleCol: displayColumn.id }));
    });
    return actions;
  }
  function buildRawDataFieldActions(fields, tableRows, columnRows, rawDataSectionByTableRef) {
    const tableRowIdByName = new Map(tableRows.map((t) => [t.tableId, t.id]));
    const columnsByTableRowId = /* @__PURE__ */ new Map();
    columnRows.forEach((c) => {
      if (!columnsByTableRowId.has(c.parentId)) columnsByTableRowId.set(c.parentId, []);
      columnsByTableRowId.get(c.parentId).push(c);
    });
    const actions = [];
    fields.forEach((f) => {
      const tableRowId = tableRowIdByName.get(f.owner.id);
      if (tableRowId === void 0) return;
      const sectionId = rawDataSectionByTableRef.get(tableRowId);
      if (sectionId === void 0) return;
      const cols = columnsByTableRowId.get(tableRowId) || [];
      const col = cols.find((c) => c.label === f.name);
      if (!col) return;
      actions.push(buildAddRecordAction("_grist_Views_section_field", { parentId: sectionId, colRef: col.id }));
    });
    return actions;
  }
  function findMissingSchemaItems(staging, freshTables, resolvedTableNames = {}) {
    const byId2 = new Map(freshTables.map((t) => [t.id, t]));
    const missingTables = staging.tables.filter((t) => !byId2.has(resolvedTableNames[t.name] || t.name)).map((t) => t.name);
    const missingFields = staging.fields.filter((f) => {
      const table = byId2.get(f.owner.id);
      return !table || !table.fields.some((tf) => tf.name === f.name);
    }).map((f) => `${f.name} (${f.owner.id})`);
    return { missingTables, missingFields };
  }

  // src/app.js
  var SVG_NS2 = "http://www.w3.org/2000/svg";
  function initApp(dom2, rawTables = TABLES, options = {}) {
    const { isLiveGrist = false } = options;
    const tables = markBrokenReferences(rawTables);
    const state = createState(tables);
    dom2.statTables.textContent = String(tables.length);
    dom2.statFields.textContent = String(tables.reduce((n, t) => n + t.fields.length, 0));
    dom2.statLinks.textContent = String(buildConnections(tables).length);
    let toastTimer = null;
    function showToast(message) {
      dom2.toast.textContent = message;
      dom2.toast.classList.add("is-visible");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => dom2.toast.classList.remove("is-visible"), 6e3);
    }
    function getDisplay() {
      const displayTables = markBrokenReferences(buildDisplayTables(tables, state.staging));
      const displayConnections = buildConnections(displayTables);
      const displayOrphanIds = orphanTableIds(displayTables, displayConnections);
      return { displayTables, displayConnections, displayOrphanIds };
    }
    renderLegend(dom2.legendBody);
    bindLegendToggle(dom2.legend, dom2.legendToggle);
    renderHealthPanel(
      dom2.healthBody,
      computeModelHealth(tables),
      (tableId, fieldName) => fieldName ? jumpToField(tableId, fieldName) : jumpTo(tableId)
    );
    bindLegendToggle(dom2.healthPanel, dom2.healthToggle);
    const tooltip = createTooltipController(dom2.tooltip, dom2.ttTable, dom2.ttName, dom2.ttType, dom2.ttExtra);
    function applyZoom() {
      dom2.canvasContent.style.transform = `scale(${state.zoom})`;
      dom2.zoomLevel.textContent = `${Math.round(state.zoom * 100)}%`;
    }
    function setZoom(value) {
      state.zoom = clampZoom(value);
      applyZoom();
    }
    function setZoomAround(value, clientX, clientY) {
      const rect = dom2.canvasWrap.getBoundingClientRect();
      const contentX = (dom2.canvasWrap.scrollLeft + clientX - rect.left) / state.zoom;
      const contentY = (dom2.canvasWrap.scrollTop + clientY - rect.top) / state.zoom;
      setZoom(value);
      dom2.canvasWrap.scrollLeft = contentX * state.zoom - (clientX - rect.left);
      dom2.canvasWrap.scrollTop = contentY * state.zoom - (clientY - rect.top);
    }
    function fitToView() {
      const { displayTables } = getDisplay();
      if (!displayTables.length) return;
      const bounds = tablesBounds(displayTables, state.positions, CARD_W, cardHeight);
      const viewport = { width: dom2.canvasWrap.clientWidth, height: dom2.canvasWrap.clientHeight };
      state.zoom = computeFitZoom(bounds, viewport);
      applyZoom();
      const contentW = (bounds.maxX - bounds.minX) * state.zoom;
      const contentH = (bounds.maxY - bounds.minY) * state.zoom;
      dom2.canvasWrap.scrollLeft = bounds.minX * state.zoom - (viewport.width - contentW) / 2;
      dom2.canvasWrap.scrollTop = bounds.minY * state.zoom - (viewport.height - contentH) / 2;
    }
    function updateEmptyStateOverlay() {
      const shouldShow = isEffectivelyEmpty(tables) && !state.editMode && isStagingEmpty(state.staging);
      dom2.emptyState.classList.toggle("is-visible", shouldShow);
    }
    function updateStagingToolbar() {
      const empty = isStagingEmpty(state.staging);
      dom2.stagingCount.hidden = empty;
      dom2.discardStagingBtn.hidden = empty;
      dom2.commitSchemaBtn.hidden = empty;
      if (empty) return;
      const linkCount = stagedLinkCount(state.staging);
      const fieldCount = stagedFieldCount(state.staging) - linkCount;
      const tableCount = state.staging.tables.length;
      const parts = [];
      if (tableCount) parts.push(`${tableCount} table${tableCount > 1 ? "s" : ""}`);
      if (fieldCount) parts.push(`${fieldCount} champ${fieldCount > 1 ? "s" : ""}`);
      if (linkCount) parts.push(`${linkCount} liaison${linkCount > 1 ? "s" : ""}`);
      dom2.stagingCount.textContent = `${parts.join(", ")} en attente`;
    }
    function renderAll() {
      const { displayTables, displayConnections, displayOrphanIds } = getDisplay();
      renderSidebar(
        dom2.sidebar,
        displayTables,
        state.focused,
        (id) => setFocus(state.focused === id ? null : id),
        displayOrphanIds
      );
      renderCards(dom2.canvasContent, displayTables, state.positions, displayOrphanIds, state.editMode);
      attachCardBehaviors(
        dom2.canvasContent,
        state.positions,
        {
          onAddField: (tableId, rowEl) => startFieldDraft(tableId, rowEl),
          onRemoveStagedTable: (tableId) => removeStagedTableAndRerender(tableId),
          onRemoveStagedField: (tableId, fieldName) => removeStagedFieldAndRerender(tableId, fieldName),
          onLinkDragStart: (tableId, clientX, clientY) => startLinkDrag(tableId, clientX, clientY),
          onCardMoved: () => {
            renderWires(dom2.wires, displayConnections, state.positions);
            updateWireVisibility(dom2.wires, displayConnections, state);
            applyFocusStyles(dom2.canvasContent, displayConnections, state.focused);
          },
          onCardToggled: (id) => setFocus(state.focused === id ? null : id),
          onFieldHover: (row) => {
            const table = tableById(displayTables, row.dataset.table);
            const field = table.fields.find((f) => f.name === row.dataset.field);
            tooltip.show(field, table.id);
          },
          onFieldMove: (event) => tooltip.move(event),
          onFieldLeave: () => tooltip.hide(),
          onRefEnter: (row) => {
            state.hoveredConn = `${row.dataset.table}.${row.dataset.field}`;
            updateWireVisibility(dom2.wires, displayConnections, state);
          },
          onRefLeave: () => {
            state.hoveredConn = null;
            updateWireVisibility(dom2.wires, displayConnections, state);
          },
          onRefJump: (targetId) => jumpTo(targetId),
          onTableHover: (tableId) => tooltip.showTable(tableById(displayTables, tableId)),
          onTableMove: (event) => tooltip.move(event),
          onTableLeave: () => tooltip.hide()
        },
        () => state.zoom
      );
      renderWires(dom2.wires, displayConnections, state.positions);
      updateWireVisibility(dom2.wires, displayConnections, state);
      applyFocusStyles(dom2.canvasContent, displayConnections, state.focused);
      updateStagingToolbar();
      updateEmptyStateOverlay();
    }
    async function refreshFromGrist() {
      const freshTables = markBrokenReferences(await loadFromGrist());
      freshTables.forEach((t) => {
        if (!state.positions[t.id]) {
          state.positions[t.id] = { x: t.x, y: t.y };
          state.defaultPositions[t.id] = { x: t.x, y: t.y };
        }
      });
      tables.length = 0;
      tables.push(...freshTables);
      dom2.statTables.textContent = String(tables.length);
      dom2.statFields.textContent = String(tables.reduce((n, t) => n + t.fields.length, 0));
      dom2.statLinks.textContent = String(buildConnections(tables).length);
      renderAll();
    }
    function scrollToCard(tableId) {
      const card = dom2.canvasContent.querySelector(`.table-card[data-id="${CSS.escape(tableId)}"]`);
      if (card) card.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }
    function jumpTo(tableId) {
      setFocus(tableId);
      scrollToCard(tableId);
    }
    function jumpToField(tableId, fieldName) {
      setFocus(tableId);
      const row = dom2.canvasContent.querySelector(
        `.table-card[data-id="${CSS.escape(tableId)}"] .field-row[data-field="${CSS.escape(fieldName)}"]`
      );
      if (!row) {
        scrollToCard(tableId);
        return;
      }
      row.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      row.classList.remove("is-jump-target");
      void row.offsetWidth;
      row.classList.add("is-jump-target");
      row.addEventListener("animationend", () => row.classList.remove("is-jump-target"), { once: true });
    }
    function setFocus(id) {
      state.focused = id;
      if (id) {
        dom2.focusBanner.classList.add("is-visible");
        dom2.focusName.textContent = id;
      } else {
        dom2.focusBanner.classList.remove("is-visible");
      }
      const { displayTables, displayConnections, displayOrphanIds } = getDisplay();
      applyFocusStyles(dom2.canvasContent, displayConnections, state.focused);
      updateWireVisibility(dom2.wires, displayConnections, state);
      renderSidebar(
        dom2.sidebar,
        displayTables,
        state.focused,
        (rowId) => setFocus(state.focused === rowId ? null : rowId),
        displayOrphanIds
      );
    }
    function setEditMode(on) {
      state.editMode = on;
      dom2.editModeToggle.classList.toggle("is-active", on);
      dom2.editModeToggle.setAttribute("aria-pressed", String(on));
      dom2.editModeBanner.classList.toggle("is-visible", on);
      if (!on) activeDraftCancel?.();
      renderAll();
    }
    dom2.editModeToggle.addEventListener("click", () => setEditMode(!state.editMode));
    let activeDraftCancel = null;
    function setActiveDraft(cancelFn) {
      activeDraftCancel = cancelFn;
      dom2.canvasContent.classList.add("is-drafting");
      dom2.newTableBtn.disabled = true;
    }
    function clearActiveDraft() {
      activeDraftCancel = null;
      dom2.canvasContent.classList.remove("is-drafting");
      dom2.newTableBtn.disabled = false;
    }
    function startNewTableDraft() {
      if (activeDraftCancel) return;
      const rect = dom2.canvasWrap.getBoundingClientRect();
      const zoom = state.zoom || 1;
      const cascade = state.staging.tables.length * 60;
      const x = Math.max(0, (dom2.canvasWrap.scrollLeft + rect.width / 2) / zoom - CARD_W / 2) + cascade;
      const y = Math.max(0, (dom2.canvasWrap.scrollTop + rect.height / 2) / zoom - 40) + cascade;
      const card = createDraftTableCard({ x, y });
      dom2.canvasContent.appendChild(card);
      setActiveDraft(cancelDraftTable);
      const input = card.querySelector(".draft-name-input");
      const addBtn = card.querySelector(".draft-create");
      const cancelBtn = card.querySelector(".draft-cancel");
      const errorEl = card.querySelector(".draft-error");
      input.addEventListener("input", () => {
        addBtn.disabled = sanitizeLabel(input.value).length === 0;
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !addBtn.disabled) addToStage();
        if (e.key === "Escape") cancelDraftTable();
      });
      cancelBtn.addEventListener("click", () => cancelDraftTable());
      addBtn.addEventListener("click", addToStage);
      input.focus();
      function cancelDraftTable() {
        card.remove();
        clearActiveDraft();
      }
      function addToStage() {
        const name = sanitizeLabel(input.value);
        if (!name) return;
        const error = validateNewTableName(state.staging, tables, name);
        if (error) {
          errorEl.hidden = false;
          errorEl.textContent = error;
          return;
        }
        state.staging = addStagedTable(state.staging, name);
        state.positions[name] = { x, y };
        state.defaultPositions[name] = { x, y };
        cancelDraftTable();
        renderAll();
      }
    }
    dom2.newTableBtn.addEventListener("click", () => startNewTableDraft());
    function startFieldDraft(tableId, addRowEl) {
      if (activeDraftCancel) return;
      const owner = isStagedTableName(state.staging, tableId) ? { kind: "staged", id: tableId } : { kind: "real", id: tableId };
      const row = createDraftFieldRow();
      addRowEl.insertAdjacentElement("beforebegin", row);
      addRowEl.hidden = true;
      const card = addRowEl.closest(".table-card");
      if (card) card.style.zIndex = "20";
      setActiveDraft(cancelFieldDraft);
      const nameInput = row.querySelector(".draft-field-name");
      const typeSelect = row.querySelector(".draft-field-type");
      const choicesInput = row.querySelector(".draft-field-choices");
      const addBtn = row.querySelector(".draft-field-create");
      const cancelBtn = row.querySelector(".draft-field-cancel");
      const errorEl = row.querySelector(".draft-field-error");
      function updateChoicesVisibility() {
        choicesInput.hidden = !isChoiceLikeType(typeSelect.value);
      }
      nameInput.addEventListener("input", () => {
        addBtn.disabled = sanitizeLabel(nameInput.value).length === 0;
      });
      nameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !addBtn.disabled) addToStage();
        if (e.key === "Escape") cancelFieldDraft();
      });
      typeSelect.addEventListener("change", updateChoicesVisibility);
      choicesInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !addBtn.disabled) addToStage();
        if (e.key === "Escape") cancelFieldDraft();
      });
      cancelBtn.addEventListener("click", () => cancelFieldDraft());
      addBtn.addEventListener("click", addToStage);
      nameInput.focus();
      function cancelFieldDraft() {
        row.remove();
        addRowEl.hidden = false;
        if (card) card.style.zIndex = "";
        clearActiveDraft();
      }
      function addToStage() {
        const name = sanitizeLabel(nameInput.value);
        if (!name) return;
        const error = validateNewFieldName(state.staging, tables, owner, name);
        if (error) {
          errorEl.hidden = false;
          errorEl.textContent = error;
          return;
        }
        const type = typeSelect.value;
        const choices = isChoiceLikeType(type) ? parseChoiceOptions(choicesInput.value) : [];
        state.staging = addStagedField(state.staging, owner, { name, type, choices });
        cancelFieldDraft();
        renderAll();
      }
    }
    function removeStagedTableAndRerender(tableId) {
      state.staging = removeStagedTable(state.staging, tableId);
      renderAll();
    }
    function removeStagedFieldAndRerender(tableId, fieldName) {
      const owner = isStagedTableName(state.staging, tableId) ? { kind: "staged", id: tableId } : { kind: "real", id: tableId };
      state.staging = removeStagedField(state.staging, owner, fieldName);
      renderAll();
    }
    let linkDragState = null;
    function startLinkDrag(sourceId, clientX, clientY) {
      if (activeDraftCancel) return;
      const path = document.createElementNS(SVG_NS2, "path");
      path.classList.add("wire", "is-drawing");
      dom2.wires.appendChild(path);
      linkDragState = { sourceId, path };
      updateLinkDragPath(clientX, clientY);
    }
    function updateLinkDragPath(clientX, clientY) {
      if (!linkDragState) return;
      const rect = dom2.canvasWrap.getBoundingClientRect();
      const a = tableAnchor(state.positions, linkDragState.sourceId, 0);
      const b = canvasPointFromClient(
        clientX,
        clientY,
        rect,
        dom2.canvasWrap.scrollLeft,
        dom2.canvasWrap.scrollTop,
        state.zoom || 1
      );
      linkDragState.path.setAttribute("d", elbowPath(a, b));
    }
    function cancelLinkDrag() {
      if (!linkDragState) return;
      linkDragState.path.remove();
      linkDragState = null;
    }
    window.addEventListener("mousemove", (e) => {
      if (!linkDragState) return;
      updateLinkDragPath(e.clientX, e.clientY);
    });
    window.addEventListener("mouseup", (e) => {
      if (!linkDragState) return;
      const { sourceId, path } = linkDragState;
      path.remove();
      linkDragState = null;
      const targetCard = e.target.closest(".table-card");
      if (!targetCard) return;
      openLinkDraft(sourceId, targetCard.dataset.id);
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") cancelLinkDrag();
    });
    function targetFieldNames(targetId) {
      if (isStagedTableName(state.staging, targetId)) {
        return stagedFieldsForOwner(state.staging, "staged", targetId).map((f) => f.name);
      }
      const table = tableById(tables, targetId);
      return table ? table.fields.map((f) => f.name) : [];
    }
    function openLinkDraft(sourceId, targetId) {
      showLinkDraftDialog(dom2, {
        sourceLabel: sourceId,
        targetLabel: targetId,
        defaultName: targetId,
        displayFieldOptions: targetFieldNames(targetId),
        onSubmit: (rawName, type, displayField) => {
          const name = sanitizeLabel(rawName);
          if (!name) return { error: "Le nom du champ ne peut pas \xEAtre vide." };
          const owner = isStagedTableName(state.staging, sourceId) ? { kind: "staged", id: sourceId } : { kind: "real", id: sourceId };
          const error = validateNewFieldName(state.staging, tables, owner, name);
          if (error) return { error };
          const ref = isStagedTableName(state.staging, targetId) ? { kind: "staged", id: targetId } : { kind: "real", id: targetId };
          state.staging = addStagedField(state.staging, owner, { name, type, ref, displayField });
          renderAll();
        }
      });
    }
    function commitSchema() {
      if (isStagingEmpty(state.staging)) return;
      const summary = buildSchemaSummaryText(state.staging);
      showConfirmDialog(dom2, {
        message: isLiveGrist ? `Valider ce sch\xE9ma dans le document Grist ?

${summary}` : `Simuler la validation de ce sch\xE9ma ? Hors document Grist ici : rien n'est \xE9crit, c'est un aper\xE7u local.

${summary}`,
        confirmLabel: "Valider",
        onConfirm: () => submitSchema()
      });
    }
    function applyStagingLocally(staging) {
      staging.tables.forEach((t) => {
        tables.push({ id: t.name, group: t.group, fields: [] });
        state.positions[t.name] = state.positions[t.name] || { x: 0, y: 0 };
        state.defaultPositions[t.name] = state.defaultPositions[t.name] || { x: 0, y: 0 };
      });
      staging.fields.forEach((f) => {
        const table = tableById(tables, f.owner.id);
        if (!table) return;
        const field = { name: f.name, type: f.type };
        if (f.ref) field.ref = f.ref.id;
        if (f.choices && f.choices.length) field.choices = f.choices;
        table.fields.push(field);
      });
      dom2.statTables.textContent = String(tables.length);
      dom2.statFields.textContent = String(tables.reduce((n, t) => n + t.fields.length, 0));
      dom2.statLinks.textContent = String(buildConnections(tables).length);
    }
    async function submitSchema() {
      const stagingSnapshot = state.staging;
      if (!isLiveGrist) {
        applyStagingLocally(stagingSnapshot);
        state.staging = createStagingState();
        renderAll();
        showToast("Sch\xE9ma ajout\xE9 (simulation locale, hors document Grist).");
        return;
      }
      dom2.commitSchemaBtn.disabled = true;
      dom2.discardStagingBtn.disabled = true;
      let phase = "tables";
      try {
        const tableActions = buildAddTableActions(stagingSnapshot);
        let resolvedFields = stagingSnapshot.fields;
        let resolvedTableNames = {};
        if (tableActions.length) {
          const { tableRows: beforeRows } = await fetchRawGristMetadata();
          await applyActionsToGrist(tableActions);
          const { tableRows: afterRows } = await fetchRawGristMetadata();
          resolvedTableNames = resolveStagedTableNames(stagingSnapshot.tables, beforeRows, afterRows);
          resolvedFields = resolveStagedFieldReferences(stagingSnapshot.fields, resolvedTableNames);
        }
        state.staging = { tables: [], fields: resolvedFields };
        phase = "champs";
        const columnActions = buildAddColumnActions({ fields: resolvedFields });
        if (columnActions.length) await applyActionsToGrist(columnActions);
        state.staging = createStagingState();
        let extraStepsWarning = "";
        try {
          const { tableRows, columnRows } = await fetchRawGristMetadata();
          const visibleColActions = buildVisibleColActions({ fields: resolvedFields }, tableRows, columnRows);
          if (visibleColActions.length) await applyActionsToGrist(visibleColActions);
          const rawDataSectionByTableRef = await fetchRawDataSectionsByTableRef();
          const rawDataFieldActions = buildRawDataFieldActions(
            resolvedFields,
            tableRows,
            columnRows,
            rawDataSectionByTableRef
          );
          if (rawDataFieldActions.length) await applyActionsToGrist(rawDataFieldActions);
        } catch (extraStepsErr) {
          extraStepsWarning = " (certains r\xE9glages annexes \u2014 colonne \xE0 afficher des liaisons, visibilit\xE9 dans Donn\xE9es brutes \u2014 n'ont pas pu \xEAtre appliqu\xE9s automatiquement ; v\xE9rifie dans Grist si besoin.)";
        }
        await refreshFromGrist();
        const { missingTables, missingFields } = findMissingSchemaItems(
          { tables: stagingSnapshot.tables, fields: resolvedFields },
          tables,
          resolvedTableNames
        );
        if (missingTables.length === 0 && missingFields.length === 0) {
          showToast(`Sch\xE9ma valid\xE9 \u2014 tout appara\xEEt bien dans le document.${extraStepsWarning}`);
        } else {
          const parts = [];
          if (missingTables.length) parts.push(`tables : ${missingTables.join(", ")}`);
          if (missingFields.length) parts.push(`champs : ${missingFields.join(", ")}`);
          showToast(
            `Sch\xE9ma envoy\xE9, mais certains \xE9l\xE9ments n'apparaissent pas tels quels (${parts.join(" ; ")}) \u2014 v\xE9rifie dans Grist.`
          );
        }
      } catch (err) {
        const message = err && err.message ? err.message : err;
        if (phase === "tables") {
          showToast(`\xC9chec de la cr\xE9ation des tables : ${message} \u2014 le brouillon est conserv\xE9, rien n'a \xE9t\xE9 \xE9crit.`);
        } else {
          showToast(
            `Les tables ont \xE9t\xE9 cr\xE9\xE9es, mais l'ajout des colonnes a \xE9chou\xE9 : ${message} \u2014 le brouillon des champs est conserv\xE9, tu peux r\xE9essayer.`
          );
          try {
            await refreshFromGrist();
          } catch {
          }
        }
      } finally {
        dom2.commitSchemaBtn.disabled = false;
        dom2.discardStagingBtn.disabled = false;
        renderAll();
      }
    }
    function discardStaging() {
      if (isStagingEmpty(state.staging)) return;
      state.staging = createStagingState();
      renderAll();
    }
    dom2.commitSchemaBtn.addEventListener("click", () => commitSchema());
    dom2.discardStagingBtn.addEventListener("click", () => discardStaging());
    dom2.search.addEventListener("input", (e) => {
      state.search = e.target.value;
      const { displayTables } = getDisplay();
      applySearchToCards(dom2.canvasContent, displayTables, state.search);
      applySidebarSearch(dom2.sidebar, displayTables, state.search);
    });
    dom2.modeFocusBtn.addEventListener("click", () => {
      state.showAll = false;
      dom2.modeFocusBtn.classList.add("active");
      dom2.modeAllBtn.classList.remove("active");
      updateWireVisibility(dom2.wires, getDisplay().displayConnections, state);
    });
    dom2.modeAllBtn.addEventListener("click", () => {
      state.showAll = true;
      dom2.modeAllBtn.classList.add("active");
      dom2.modeFocusBtn.classList.remove("active");
      updateWireVisibility(dom2.wires, getDisplay().displayConnections, state);
    });
    dom2.focusClear.addEventListener("click", () => setFocus(null));
    dom2.resetLayout.addEventListener("click", () => {
      const positions = resetPositions(state);
      dom2.canvasContent.querySelectorAll(".table-card").forEach((card) => {
        const pos = positions[card.dataset.id];
        if (!pos) return;
        card.style.left = `${pos.x}px`;
        card.style.top = `${pos.y}px`;
      });
      const { displayConnections } = getDisplay();
      renderWires(dom2.wires, displayConnections, state.positions);
      applyFocusStyles(dom2.canvasContent, displayConnections, state.focused);
      fitToView();
    });
    dom2.canvasContent.addEventListener("mousedown", (e) => {
      if (e.target === dom2.canvasContent || e.target === dom2.wires) setFocus(null);
    });
    dom2.zoomIn.addEventListener("click", () => setZoom(state.zoom * ZOOM_STEP));
    dom2.zoomOut.addEventListener("click", () => setZoom(state.zoom / ZOOM_STEP));
    dom2.zoomLevel.addEventListener("click", () => setZoom(1));
    dom2.zoomFit.addEventListener("click", () => fitToView());
    dom2.canvasWrap.addEventListener(
      "wheel",
      (e) => {
        if (!e.ctrlKey && !e.metaKey) return;
        e.preventDefault();
        const factor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
        setZoomAround(state.zoom * factor, e.clientX, e.clientY);
      },
      { passive: false }
    );
    renderAll();
    if (dom2.canvasWrap.clientWidth > 0 && dom2.canvasWrap.clientHeight > 0) {
      fitToView();
    } else {
      const observer = new ResizeObserver(() => {
        if (dom2.canvasWrap.clientWidth > 0 && dom2.canvasWrap.clientHeight > 0) {
          observer.disconnect();
          fitToView();
        }
      });
      observer.observe(dom2.canvasWrap);
    }
    return { state, setFocus };
  }

  // src/data/resolveSource.js
  function isInIframe(win) {
    return win.self !== win.top;
  }
  function withTimeout(promise, ms, message = "D\xE9lai d\xE9pass\xE9") {
    return Promise.race([
      promise,
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error(message)), ms);
      })
    ]);
  }

  // src/data/gristOrigin.js
  function parseOrigin(url) {
    try {
      return new URL(url).origin;
    } catch {
      return null;
    }
  }
  function detectParentOrigin(win) {
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

  // src/data/loadGristPluginApi.js
  function loadGristPluginApi(origin, doc = document) {
    return new Promise((resolve, reject) => {
      const script = doc.createElement("script");
      script.src = `${origin}/grist-plugin-api.js`;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`\xC9chec du chargement de grist-plugin-api.js depuis ${origin}`));
      doc.head.appendChild(script);
    });
  }

  // src/main.js
  var GRIST_LOAD_TIMEOUT_MS = 3e4;
  function byId(id) {
    return document.getElementById(id);
  }
  var dom = {
    statTables: byId("stat-tables"),
    statFields: byId("stat-fields"),
    statLinks: byId("stat-links"),
    search: byId("search"),
    modeFocusBtn: byId("mode-focus"),
    modeAllBtn: byId("mode-all"),
    resetLayout: byId("reset-layout"),
    sidebar: byId("sidebar"),
    canvasWrap: byId("canvas-wrap"),
    canvasContent: byId("canvas-content"),
    emptyState: byId("empty-state"),
    wires: byId("wires"),
    zoomIn: byId("zoom-in"),
    zoomOut: byId("zoom-out"),
    zoomLevel: byId("zoom-level"),
    zoomFit: byId("zoom-fit"),
    focusBanner: byId("focus-banner"),
    focusName: byId("focus-name"),
    focusClear: byId("focus-clear"),
    editModeToggle: byId("edit-mode-toggle"),
    editModeBanner: byId("edit-mode-banner"),
    newTableBtn: byId("new-table-btn"),
    stagingCount: byId("staging-count"),
    discardStagingBtn: byId("discard-staging-btn"),
    commitSchemaBtn: byId("commit-schema-btn"),
    confirmDialog: byId("confirm-dialog"),
    confirmMessage: byId("confirm-message"),
    confirmConfirmBtn: byId("confirm-confirm"),
    confirmCancelBtn: byId("confirm-cancel"),
    linkDraftDialog: byId("link-draft-dialog"),
    linkDraftSource: byId("link-draft-source"),
    linkDraftTarget: byId("link-draft-target"),
    linkDraftName: byId("link-draft-name"),
    linkDraftType: byId("link-draft-type"),
    linkDraftDisplayCol: byId("link-draft-display-col"),
    linkDraftError: byId("link-draft-error"),
    linkDraftConfirmBtn: byId("link-draft-confirm"),
    linkDraftCancelBtn: byId("link-draft-cancel"),
    toast: byId("toast"),
    legend: byId("legend"),
    legendToggle: byId("legend-toggle"),
    legendBody: byId("legend-body"),
    healthPanel: byId("health-panel"),
    healthToggle: byId("health-toggle"),
    healthBody: byId("health-body"),
    tooltip: byId("tooltip"),
    ttTable: byId("tt-table"),
    ttName: byId("tt-name"),
    ttType: byId("tt-type"),
    ttExtra: byId("tt-extra")
  };
  var loadingEl = byId("loading");
  var loadErrorEl = byId("load-error");
  var loadErrorMessageEl = byId("load-error-message");
  function showLoading(visible) {
    loadingEl.classList.toggle("is-visible", visible);
  }
  function showLoadError(message) {
    loadErrorMessageEl.textContent = message;
    loadErrorEl.classList.add("is-visible");
  }
  async function resolveTables() {
    if (!isInIframe(window)) return { tables: TABLES, isLiveGrist: false };
    const origin = detectParentOrigin(window);
    if (!origin) {
      throw new Error(
        "Impossible de d\xE9terminer l'origine du document Grist parent (ancestorOrigins et document.referrer indisponibles)."
      );
    }
    showLoading(true);
    try {
      await loadGristPluginApi(origin);
      window.grist.ready({ requiredAccess: "full" });
      const tables = await withTimeout(
        loadFromGrist(),
        GRIST_LOAD_TIMEOUT_MS,
        "Le document Grist met trop de temps \xE0 r\xE9pondre."
      );
      return { tables, isLiveGrist: true };
    } finally {
      showLoading(false);
    }
  }
  resolveTables().then(({ tables, isLiveGrist }) => initApp(dom, tables, { isLiveGrist })).catch((err) => {
    console.error(err);
    showLoadError(
      "V\xE9rifie que l'acc\xE8s complet au document a bien \xE9t\xE9 autoris\xE9 pour ce widget, puis recharge la page."
    );
  });
})();
