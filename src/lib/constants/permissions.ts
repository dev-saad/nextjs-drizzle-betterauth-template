import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/organization/access";
import { z } from "zod";

// 1. Define reusable action sets
const CRUD = ["create", "read", "update", "delete"] as const;
const CUD = ["create", "update", "delete"] as const;
const CD = ["create", "delete"] as const;
const R = ["read"] as const;
const RU = ["read", "update"] as const;
const RD = ["read", "delete"] as const;
const CRU = ["create", "read", "update"] as const;
const CRD = ["create", "read", "delete"] as const;
const RUD = ["read", "update", "delete"] as const;

// 2. Define Custom Statements
export const customStatements = {
 order: CRUD,
 member: CRUD,
 role: CRUD,
 organization: RUD,
} as const;

// 3. Merge into the Master Source of Truth
export const statements = {
 ...defaultStatements,
 ...customStatements,
} as const;

// --- 🚀 THE FIX: Generate Zod Schema from 'statements' ---

// Helper type to map the statement object keys dynamically
type StatementKeys = keyof typeof statements;

// Dynamically build the Zod shape
const schemaShape = Object.fromEntries(
 Object.entries(statements).map(([resource, actions]) => {
  // Cast actions to [string, ...string[]] because z.enum expects a non-empty array
  const actionList = actions as unknown as [string, ...string[]];

  return [resource, z.array(z.enum(actionList)).optional()];
 }),
);

// Create the Zod Schema
export const PermissionsSchema = z.object(
 schemaShape,
) as unknown as z.ZodObject<{
 [K in StatementKeys]: z.ZodOptional<
  z.ZodArray<z.ZodType<(typeof statements)[K][number]>>
 >;
}>;

// --------------------------------------------------------

// 5. Initialize Access Control
export const ac = createAccessControl(statements);

// 6. Define Owner Role
export const ownerRole = ac.newRole({
 ...(statements as any),
});

// Type Inference
export type PermissionsType = z.infer<typeof PermissionsSchema>;

export const getAvailablePermissions = () => {
 return Object.entries(statements).map(([resource, actions]) => ({
  resource, // e.g., "orders"
  actions, // e.g., ["create", "read", "update", "delete"]
 }));
};
