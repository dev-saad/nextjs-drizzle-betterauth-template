import {
 between,
 eq,
 gt,
 gte,
 ilike,
 inArray,
 isNotNull,
 isNull,
 lt,
 lte,
 ne,
 notInArray,
 or,
 SQL,
} from "drizzle-orm";
import { PgColumn } from "drizzle-orm/pg-core";

export type FilterType =
 | "exact"
 | "notEq"
 | "array"
 | "notArray"
 | "search"
 | "dateRange"
 | "range"
 | "boolean"
 | "comparison"
 | "arrayString";

export type FilterConfig<TInput> = {
 [K in keyof TInput]?:
  | { type: "exact"; column: PgColumn | SQL.Aliased }
  | { type: "notEq"; column: PgColumn | SQL.Aliased }
  | { type: "array"; column: PgColumn | SQL.Aliased }
  | { type: "notArray"; column: PgColumn | SQL.Aliased }
  | { type: "search"; columns: (PgColumn | SQL.Aliased)[] } // Plural 'columns'
  | { type: "dateRange"; column: PgColumn | SQL.Aliased }
  | { type: "range"; column: PgColumn | SQL.Aliased }
  | { type: "boolean"; column: PgColumn | SQL.Aliased }
  | { type: "comparison"; column: PgColumn | SQL.Aliased }
  | { type: "arrayString"; column: PgColumn | SQL.Aliased };
};

export function buildFilters<TInput extends Record<string, any>>(
 input: TInput,
 config: FilterConfig<TInput>,
): SQL[] {
 const filters: SQL[] = [];

 Object.entries(config).forEach(([key, filterConfig]) => {
  const value = input[key];

  if (!filterConfig) return;
  if (value === undefined || value === null) return;
  if (Array.isArray(value) && value.length === 0) return;
  if (typeof value === "string" && value.trim() === "") return;

  // ❌ REMOVED: const col = filterConfig.column as PgColumn;
  // We now access properties directly inside the switch case.

  switch (filterConfig.type) {
   // --- Basic Equality ---
   case "exact":
    filters.push(eq(filterConfig.column as PgColumn, value));
    break;

   case "notEq":
    filters.push(ne(filterConfig.column as PgColumn, value));
    break;

   // --- Arrays / Lists ---
   case "array":
    if (Array.isArray(value)) {
     filters.push(inArray(filterConfig.column as PgColumn, value));
    }
    break;

   case "notArray":
    if (Array.isArray(value)) {
     filters.push(notInArray(filterConfig.column as PgColumn, value));
    }
    break;

   // --- Fuzzy Search ---
   case "search":
    if (typeof value === "string") {
     const searchLower = `%${value.toLowerCase()}%`;
     // ✅ Uses 'columns' (plural) specific to this type
     const searchFilters = filterConfig.columns.map((searchCol) =>
      ilike(searchCol as PgColumn, searchLower),
     );
     const searchGroup = or(...searchFilters);
     if (searchGroup) filters.push(searchGroup);
    }
    break;

   // --- Ranges (Date & Number) ---
   case "dateRange":
   case "range":
    const rangeCol = filterConfig.column as PgColumn;
    if (typeof value === "object") {
     if (value.from && value.to) {
      filters.push(between(rangeCol, value.from, value.to));
     } else if (value.from) {
      filters.push(gte(rangeCol, value.from));
     } else if (value.to) {
      filters.push(lte(rangeCol, value.to));
     }
    }
    break;

   // --- Boolean / Existence ---
   case "boolean":
    const boolCol = filterConfig.column as PgColumn;
    const boolVal = String(value) === "true";
    if (boolVal) {
     filters.push(isNotNull(boolCol));
    } else {
     filters.push(isNull(boolCol));
    }
    break;

   // --- Advanced Comparison ---
   case "comparison":
    const compCol = filterConfig.column as PgColumn;
    if (typeof value === "object") {
     if (value.gt !== undefined) filters.push(gt(compCol, value.gt));
     if (value.gte !== undefined) filters.push(gte(compCol, value.gte));
     if (value.lt !== undefined) filters.push(lt(compCol, value.lt));
     if (value.lte !== undefined) filters.push(lte(compCol, value.lte));
     if (value.ne !== undefined) filters.push(ne(compCol, value.ne));
    }
    break;

   // --- CSV / String Array Handling ---
   case "arrayString":
    if (Array.isArray(value) && value.length > 0) {
     const arrayStringCol = filterConfig.column as PgColumn;
     const arrayStringFilters = value.map((v) =>
      ilike(arrayStringCol, `%${v}%`),
     );
     filters.push(or(...arrayStringFilters)!);
    }
    break;
  }
 });

 return filters;
}
