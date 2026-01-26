import { db } from "@/lib/drizzle/db";
import { sql } from "drizzle-orm";

// Helper type to extract the transaction type from our specific DB instance
type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function withRLS<T>(
 context: { userId?: string; orgId?: string } | string | undefined,
 callback: (tx: Transaction) => Promise<T>
): Promise<T> {
 const userId = typeof context === "string" ? context : context?.userId;
 const orgId = typeof context === "object" ? context?.orgId : undefined;

 return db.transaction(async (tx) => {
  if (userId) {
   await tx.execute(
    sql`SELECT set_config('app.current_user_id', ${userId}, true)`
   );
  }

  if (orgId) {
   await tx.execute(
    sql`SELECT set_config('app.current_org_id', ${orgId}, true)`
   );
  }

  return callback(tx);
 });
}
