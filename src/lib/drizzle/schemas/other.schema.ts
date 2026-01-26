// src/lib/drizzle/schemas/audit-schema.ts
import { sql } from "drizzle-orm";
import {
 index,
 jsonb,
 pgEnum,
 pgPolicy,
 pgRole,
 pgTable,
 text,
 timestamp,
} from "drizzle-orm/pg-core";
import { organizations, users } from "./auth.schema";

// --- RLS Helpers ---
// This SQL matches the variable we set in `db-ctx.ts`
const authUid = sql`current_setting('app.current_user_id', true)`;

export const actionsEnum = pgEnum("action", [
 "2FA_VERIFY_TOTP",
 "2FA_VERIFY_EMAIL",
 "2FA_VERIFY_BACKUP_CODES",
 "2FA_ENABLE",
 "2FA_DISABLE",
 "2FA_GENERATE_BACKUP_CODES",
 "CHANGE_PASSWORD",
 "SIGN_OUT",
 "SIGN_IN",
 "LINK_SOCIAL_ACCOUNT",
 "UNLINK_SOCIAL_ACCOUNT",
 "SIGN_IN_SOCIAL",
 "SIGN_UP",
 "CREATE",
 "UPDATE",
 "DELETE",
 "REVOKE",
]);

export const entityTypesEnum = pgEnum("entity_type", [
 "USER",
 "SECURITY",
 "ORGANIZATION",
 "ORGANIZATION_ROLE",
 "ORGANIZATION_INVITATION",
 "ORGANIZATION_MEMBER",
 "PRODUCT",
 "ORDER",
 "CATEGORY",
 "BRAND",
 "SUPPLIER",
 "CUSTOMER",
 "GENERAL",
 "SESSION",
]);

export const auditStatusEnum = pgEnum("audit_status", ["success", "failed"]);
const user = pgRole("user");

export const auditLogs = pgTable(
 "audit_log",
 {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").references(() => organizations.id, {
   onDelete: "cascade",
  }), // Links log to Org
  userId: text("user_id").references(() => users.id, {
   onDelete: "set null",
  }), // Links to actor
  email: text("email").references(() => users.email, {
   onDelete: "set null",
  }), // Tracks email for unauthenticated actions (e.g., failed login)
  action: actionsEnum("action").notNull(), // e.g., "ORDER_CREATED", "MEMBER_REMOVED"
  entityId: text("entity_id").notNull(), // The ID of the order/product modified
  entityType: entityTypesEnum("entity_type").notNull(), // "ORDER", "PRODUCT", "MEMBER"
  status: auditStatusEnum("status").notNull().default("success"), // "success", "failed"
  metadata: jsonb("metadata"), // Stores { oldStatus: "pending", newStatus: "paid" }
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
 },
 (table) => [
  index("audit_org_idx").on(table.organizationId), // Fast lookup for Org Dashboard
  index("audit_entity_idx").on(table.entityId),
  index("audit_user_idx").on(table.userId),
  index("audit_email_idx").on(table.email),
  index("audit_action_idx").on(table.action),
  index("audit_entity_type_idx").on(table.entityType),
  index("audit_status_idx").on(table.status),
  index("audit_created_at_idx").on(table.createdAt),
  // 1. INSERT POLICY: Allow creation of logs
  // We allow 'public' (the authenticated app) to insert logs.
  pgPolicy("create_audit_log", {
   for: "insert",
   to: "public",
   withCheck: sql`true`,
  }),

  // 2. READ POLICY: Organization-based Access
  // Users can read logs ONLY IF they are a member of the log's organization
  pgPolicy("view_audit_logs", {
   for: "select",
   to: "public",
   using: sql`
        (
          -- CASE 1: Organization Context (Unchanged)
          -- You see logs if you are a member of the Org
          (
            ${table.organizationId} IS NOT NULL AND 
            EXISTS (
              SELECT 1 FROM authentication.members 
              WHERE authentication.members.organization_id = ${table.organizationId} 
              AND authentication.members.user_id = ${authUid}
            )
          )
          
          OR

          -- CASE 2: Actor Context (Unchanged)
          -- You see logs of actions YOU performed
          (
            ${table.userId} IS NOT NULL AND 
            ${table.userId} = ${authUid}
          )

          OR

          -- CASE 3: Email/Personal Context (FIXED)
          -- You see logs targeting YOUR EMAIL, regardless of who did it (System/Admin),
          -- AS LONG AS it is not part of another Organization.
          (
            ${table.organizationId} IS NULL AND
            -- Removed: ${table.userId} IS NULL AND <-- allow specific actors (admins)
            ${table.email} IS NOT NULL AND
            ${table.email} = (
              SELECT email FROM authentication.users WHERE id = ${authUid}
            )
          )
        )
      `,
  }),
 ],
);

// Relations
