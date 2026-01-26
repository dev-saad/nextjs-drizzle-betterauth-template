import { asc, desc, SQL } from "drizzle-orm";
import { PgColumn } from "drizzle-orm/pg-core";

// Type for the configuration object
export type SortConfig<T extends Record<string, any>> = {
 [K in keyof T]: PgColumn | SQL | SQL.Aliased;
};

export function buildSort<T extends Record<string, any>>(
 sortInput: string[] | undefined | null,
 config: SortConfig<T>,
): SQL[] {
 // 1. Handle empty input safely
 if (!sortInput || sortInput.length === 0) {
  return [];
 }

 const orderBy: SQL[] = [];

 // 2. Iterate through sort strings (e.g., "role:asc")
 sortInput.forEach((sortItem) => {
  const [key, direction] = sortItem.split(":"); // ["role", "asc"]

  // 3. Look up the column in the config
  const column = config[key];

  // If key matches a configured column, apply direction
  if (column) {
   orderBy.push(direction === "asc" ? asc(column) : desc(column));
  }
 });

 return orderBy;
}
