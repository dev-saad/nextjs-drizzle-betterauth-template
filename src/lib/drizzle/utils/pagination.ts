import { db } from "@/lib/drizzle/db";
import { SQL, and, asc, count, desc, eq, gt, lt, or } from "drizzle-orm";
import { PgColumn, PgSelect, PgTable } from "drizzle-orm/pg-core";

// --- Types ---

export type PaginationMode = "offset" | "cursor";

export interface PaginationParams {
 page?: number; // For Offset: 1-based index
 pageSize?: number; // Default: 10
 cursor?: string; // For Cursor: Encoded string
 direction?: "forward" | "backward"; // For Cursor navigation
}

export interface SortParams {
 column?: string;
 order?: "asc" | "desc";
}

// --- 1. Offset Pagination (Standard Tables) ---

export function withOffsetPagination<T extends PgSelect>(
 qb: T,
 page: number = 1,
 pageSize: number = 10,
) {
 return qb.limit(pageSize).offset((page - 1) * pageSize);
}

// Helper to get total count for metadata
export async function getTotalCount(
 table: PgTable,
 filters?: SQL,
): Promise<number> {
 const result = await db.select({ count: count() }).from(table).where(filters);
 return result[0].count;
}

// --- 2. Cursor Pagination (Infinite Scroll / High Perf) ---

// Decodes the cursor (assumed to be: "value_id")
function decodeCursor(cursor: string) {
 const [value, id] = atob(cursor).split("_");
 return { value, id };
}

// Encodes the cursor
function encodeCursor(value: any, id: string) {
 return btoa(`${value}_${id}`);
}

export function withCursorPagination<T extends PgSelect>(
 qb: T,
 column: PgColumn, // The column we are sorting by (e.g., createdAt)
 idColumn: PgColumn, // The unique ID column (primary key) for tie-breaking
 cursor: string | undefined,
 pageSize: number = 10,
 order: "asc" | "desc" = "desc", // Default to newest first
) {
 const isAsc = order === "asc";

 // Apply Ordering
 qb
  .orderBy(
   isAsc ? asc(column) : desc(column),
   isAsc ? asc(idColumn) : desc(idColumn),
  )
  .limit(pageSize);

 // Apply Cursor Filter
 if (cursor) {
  const { value: cursorValue, id: cursorId } = decodeCursor(cursor);

  // Logic: (col > val) OR (col = val AND id > id)
  // Adjust operator based on sort direction
  const compareOp = isAsc ? gt : lt;

  qb.where(
   or(
    compareOp(column, cursorValue),
    and(eq(column, cursorValue), gt(idColumn, cursorId)),
   ),
  );
 }

 return qb;
}
