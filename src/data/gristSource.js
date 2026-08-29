import { mapGristType } from "./gristTypeMapping.js";
import { computeGridLayout } from "../layout.js";

const HIDDEN_COL_IDS = new Set(["manualSort"]);

function isHiddenColumn(colId) {
  return HIDDEN_COL_IDS.has(colId) || colId.startsWith("gristHelper_");
}

// grist.docApi.fetchTable() renvoie un objet "orienté colonnes" :
// { id: [1, 2], colA: ["x", "y"], ... }. On le remet en lignes classiques
// pour que le reste du code manipule des objets { id, colA, ... }.
export function toRecords(colValues) {
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

// Construit la même forme de données que src/data/tables.js (id, group, x, y,
// fields[]) à partir des lignes brutes des tables internes _grist_Tables et
// _grist_Tables_column. Fonction pure : testable avec des fixtures, sans
// dépendre de l'API Grist elle-même.
export function buildTablesFromGristMetadata(tableRows, columnRows) {
  const visibleTables = tableRows.filter(
    (t) => !t.summarySourceTable && !String(t.tableId).startsWith("_grist_")
  );

  const tables = visibleTables.map((t) => {
    const fields = columnRows
      .filter((c) => c.parentId === t.id && !isHiddenColumn(c.colId))
      .sort((a, b) => a.parentPos - b.parentPos)
      .map((c) => {
        const { type, ref } = mapGristType(c.type);
        const field = { name: c.label || c.colId, type };
        if (ref) field.ref = ref;
        if (c.isFormula && c.formula) field.formula = c.formula;
        return field;
      });

    return { id: t.tableId, group: "Tables", fields };
  });

  const positions = computeGridLayout(tables);
  tables.forEach((t) => {
    t.x = positions[t.id].x;
    t.y = positions[t.id].y;
  });

  return tables;
}

// Point d'entrée réel : lit le document Grist courant via le plugin API.
// Nécessite un accès complet (grist.ready({ requiredAccess: "full" }) déjà
// appelé ailleurs) puisqu'on lit des tables autres que celle liée au widget.
export async function loadFromGrist() {
  const [tableColValues, columnColValues] = await Promise.all([
    window.grist.docApi.fetchTable("_grist_Tables"),
    window.grist.docApi.fetchTable("_grist_Tables_column")
  ]);
  return buildTablesFromGristMetadata(toRecords(tableColValues), toRecords(columnColValues));
}
