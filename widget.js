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
        merged.push({ key: c.key, from: c.from, fieldIndex: c.fieldIndex, to: c.to, kind: c.kind });
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
            reverseField: f.reverseField
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

  // src/state.js
  function createState(tables) {
    return {
      focused: null,
      showAll: false,
      search: "",
      hoveredConn: null,
      zoom: 1,
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
    const safeName = escapeHtml(field.name);
    const safeRef = escapeHtml(field.ref);
    const refHTML = field.brokenRef ? `<span class="fref-broken" title="R\xE9f\xE9rence cass\xE9e : la table \xAB ${safeRef} \xBB n'existe plus">\u26A0 ${safeRef}</span>` : isRef ? `<span class="fref-target" data-jump="${safeRef}">\u2192 ${safeRef}</span>` : "";
    return `<div class="${classes.join(" ")}" data-table="${escapeHtml(tableId)}" data-field="${safeName}" data-idx="${idx}">
      ${icon(field.type)}
      <span class="fname${field.description ? " has-desc" : ""}">${safeName}</span>
      ${field.formula ? '<span class="ftag">\u0192x</span>' : ""}
      ${refHTML}
    </div>`;
  }
  function cardHTML(table, isOrphan) {
    const safeId = escapeHtml(table.id);
    return `
    <div class="card-header">
      <span class="dot"></span>
      <span class="tname${table.description ? " has-desc" : ""}">${safeId}</span>
      ${isOrphan ? '<span class="otag" title="Aucune liaison entrante ni sortante">Isol\xE9e</span>' : ""}
      <span class="fcount">${table.fields.length}</span>
    </div>
    <div class="card-body">
      ${table.fields.map((f, i) => fieldRowHTML(table.id, f, i)).join("")}
    </div>`;
  }
  function renderCards(canvasContent, tables, positions, orphanIds = /* @__PURE__ */ new Set()) {
    canvasContent.querySelectorAll(".table-card").forEach((el) => el.remove());
    tables.forEach((t) => {
      const pos = positions[t.id];
      const card = document.createElement("div");
      card.className = "table-card";
      card.dataset.id = t.id;
      card.style.left = `${pos.x}px`;
      card.style.top = `${pos.y}px`;
      card.style.setProperty("--group-color", GROUP_COLORS[t.group] || "#59736E");
      card.innerHTML = cardHTML(t, orphanIds.has(t.id));
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
      card.querySelectorAll(".field-row").forEach((row) => {
        row.addEventListener("mouseenter", (e) => callbacks.onFieldHover(row, e));
        row.addEventListener("mousemove", (e) => callbacks.onFieldMove(e));
        row.addEventListener("mouseleave", () => callbacks.onFieldLeave());
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

  // src/app.js
  function initApp(dom2, rawTables = TABLES) {
    const tables = markBrokenReferences(rawTables);
    const connections = buildConnections(tables);
    const orphanIds = orphanTableIds(tables, connections);
    const state = createState(tables);
    dom2.statTables.textContent = String(tables.length);
    dom2.statFields.textContent = String(tables.reduce((n, t) => n + t.fields.length, 0));
    dom2.statLinks.textContent = String(connections.length);
    const showEmptyState = isEffectivelyEmpty(tables);
    dom2.emptyState.classList.toggle("is-visible", showEmptyState);
    if (showEmptyState) return { state, connections, setFocus: () => {
    } };
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
      if (!tables.length) return;
      const bounds = tablesBounds(tables, state.positions, CARD_W, cardHeight);
      const viewport = { width: dom2.canvasWrap.clientWidth, height: dom2.canvasWrap.clientHeight };
      state.zoom = computeFitZoom(bounds, viewport);
      applyZoom();
      const contentW = (bounds.maxX - bounds.minX) * state.zoom;
      const contentH = (bounds.maxY - bounds.minY) * state.zoom;
      dom2.canvasWrap.scrollLeft = bounds.minX * state.zoom - (viewport.width - contentW) / 2;
      dom2.canvasWrap.scrollTop = bounds.minY * state.zoom - (viewport.height - contentH) / 2;
    }
    function renderAll() {
      renderSidebar(dom2.sidebar, tables, state.focused, (id) => setFocus(state.focused === id ? null : id), orphanIds);
      renderCards(dom2.canvasContent, tables, state.positions, orphanIds);
      attachCardBehaviors(dom2.canvasContent, state.positions, {
        onCardMoved: () => {
          renderWires(dom2.wires, connections, state.positions);
          updateWireVisibility(dom2.wires, connections, state);
          applyFocusStyles(dom2.canvasContent, connections, state.focused);
        },
        onCardToggled: (id) => setFocus(state.focused === id ? null : id),
        onFieldHover: (row) => {
          const table = tableById(tables, row.dataset.table);
          const field = table.fields.find((f) => f.name === row.dataset.field);
          tooltip.show(field, table.id);
        },
        onFieldMove: (event) => tooltip.move(event),
        onFieldLeave: () => tooltip.hide(),
        onRefEnter: (row) => {
          state.hoveredConn = `${row.dataset.table}.${row.dataset.field}`;
          updateWireVisibility(dom2.wires, connections, state);
        },
        onRefLeave: () => {
          state.hoveredConn = null;
          updateWireVisibility(dom2.wires, connections, state);
        },
        onRefJump: (targetId) => jumpTo(targetId),
        onTableHover: (tableId) => tooltip.showTable(tableById(tables, tableId)),
        onTableMove: (event) => tooltip.move(event),
        onTableLeave: () => tooltip.hide()
      }, () => state.zoom);
      renderWires(dom2.wires, connections, state.positions);
      updateWireVisibility(dom2.wires, connections, state);
      applyFocusStyles(dom2.canvasContent, connections, state.focused);
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
      applyFocusStyles(dom2.canvasContent, connections, state.focused);
      updateWireVisibility(dom2.wires, connections, state);
      renderSidebar(
        dom2.sidebar,
        tables,
        state.focused,
        (rowId) => setFocus(state.focused === rowId ? null : rowId),
        orphanIds
      );
    }
    dom2.search.addEventListener("input", (e) => {
      state.search = e.target.value;
      applySearchToCards(dom2.canvasContent, tables, state.search);
      applySidebarSearch(dom2.sidebar, tables, state.search);
    });
    dom2.modeFocusBtn.addEventListener("click", () => {
      state.showAll = false;
      dom2.modeFocusBtn.classList.add("active");
      dom2.modeAllBtn.classList.remove("active");
      updateWireVisibility(dom2.wires, connections, state);
    });
    dom2.modeAllBtn.addEventListener("click", () => {
      state.showAll = true;
      dom2.modeAllBtn.classList.add("active");
      dom2.modeFocusBtn.classList.remove("active");
      updateWireVisibility(dom2.wires, connections, state);
    });
    dom2.focusClear.addEventListener("click", () => setFocus(null));
    dom2.resetLayout.addEventListener("click", () => {
      const positions = resetPositions(state);
      dom2.canvasContent.querySelectorAll(".table-card").forEach((card) => {
        const pos = positions[card.dataset.id];
        card.style.left = `${pos.x}px`;
        card.style.top = `${pos.y}px`;
      });
      renderWires(dom2.wires, connections, state.positions);
      applyFocusStyles(dom2.canvasContent, connections, state.focused);
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
    return { state, connections, setFocus };
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
    const [tableColValues, columnColValues] = await Promise.all([
      window.grist.docApi.fetchTable("_grist_Tables"),
      window.grist.docApi.fetchTable("_grist_Tables_column")
    ]);
    return buildTablesFromGristMetadata(toRecords(tableColValues), toRecords(columnColValues));
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
    if (!isInIframe(window)) return TABLES;
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
      return await withTimeout(
        loadFromGrist(),
        GRIST_LOAD_TIMEOUT_MS,
        "Le document Grist met trop de temps \xE0 r\xE9pondre."
      );
    } finally {
      showLoading(false);
    }
  }
  resolveTables().then((tables) => initApp(dom, tables)).catch((err) => {
    console.error(err);
    showLoadError(
      "V\xE9rifie que l'acc\xE8s complet au document a bien \xE9t\xE9 autoris\xE9 pour ce widget, puis recharge la page."
    );
  });
})();
