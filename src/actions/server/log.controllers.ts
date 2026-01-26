"use server";

import { logsSchema } from "@/actions/schemas/log";
import { organizations, users } from "@/lib/drizzle";
import { auditLogs } from "@/lib/drizzle/schemas/other.schema";
import { buildFilters } from "@/lib/drizzle/utils/filter";
import { safeLogAction } from "@/lib/utils/safe-action";
import { and, count, desc, eq } from "drizzle-orm";

export const getLogs = safeLogAction({
 options: { schema: logsSchema, cache: true, withRls: true },
 handler: async (input, ctx) => {
  const filters = buildFilters(input, {
   actions: { type: "array", column: auditLogs.action },
   entityTypes: { type: "array", column: auditLogs.entityType },
   status: { type: "array", column: auditLogs.status },
   entityId: { type: "exact", column: auditLogs.entityId },
   search: {
    type: "search",
    columns: [
     users.name,
     users.email,
     auditLogs.entityId,
     auditLogs.action,
     auditLogs.id,
    ],
   },
   dateRange: { type: "dateRange", column: auditLogs.createdAt },
  });

  const limit = input.limit || 20;
  const offset = ((input.page || 1) - 1) * limit;

  // Ensure tx is available (it will be because withRls: true)
  const tx = ctx?.tx!;

  const logs = await tx
   .select({
    id: auditLogs.id,
    action: auditLogs.action,
    status: auditLogs.status,
    entityType: auditLogs.entityType,
    entityId: auditLogs.entityId,
    // Flattened User Info
    actorName: users.name.as("actor_name"),
    actorEmail: users.email || auditLogs.email,
    actorAvatar: users.image,
    // Flattened Org Info
    orgName: organizations.name.as("org_name"),
    orgSlug: organizations.slug,
    createdAt: auditLogs.createdAt,
   })
   .from(auditLogs)
   .leftJoin(users, eq(auditLogs.userId, users.id))
   .leftJoin(organizations, eq(auditLogs.organizationId, organizations.id))
   .where(and(...filters))
   .limit(limit)
   .offset(offset)
   .orderBy(desc(auditLogs.createdAt));

  const totalResult = await tx
   .select({ count: count() })
   .from(auditLogs)
   .leftJoin(users, eq(auditLogs.userId, users.id))
   .leftJoin(organizations, eq(auditLogs.organizationId, organizations.id))
   .where(and(...filters));

  const total = totalResult?.[0]?.count || 0;

  return {
   data: {
    logs,
    total,
   },
  };
 },
});

export type AuditLogsReturnType = ReturnType<typeof getLogs>;
export type AuditLogsType = NonNullable<Awaited<AuditLogsReturnType>["data"]>;
