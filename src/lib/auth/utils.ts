// "use server";

// import { PermissionsType, statements } from "@/lib/constants/permissions";
// import { db } from "@/lib/drizzle/db";
// import { members, organizationRoles } from "@/lib/drizzle/schemas/auth.schema";
// import { eq } from "drizzle-orm";

// export const getUserPermissions = async (userId: string) => {
//  const mem = await db
//   .select({
//    organizationId: members.organizationId,
//    role: members.role,
//   })
//   .from(members)
//   .where(eq(members.userId, userId))
//   .limit(1);

//  const roles = await db
//   .select({
//    permission: organizationRoles.permission,
//   })
//   .from(organizationRoles)
//   .$withCache({
//     tag: "user-permissions",

//   });

//  return mem;

//  const permissions: Record<string, Partial<PermissionsType>> = {};

//  for (const row of roles) {
//   if (!row.organizationId) continue;

//   if (row.permission) {
//    try {
//     const parsed = JSON.parse(row.permission) as Partial<PermissionsType>;
//     permissions[row.organizationId] = parsed;
//    } catch (error) {
//     console.error(
//      `Failed to parse permissions for role ${row.role} in org ${row.organizationId}`,
//      error,
//     );
//    }
//   } else if (row.role === "owner") {
//    // Grant all permissions for owner
//    const allPermissions: any = {};
//    for (const [resource, actions] of Object.entries(statements)) {
//     allPermissions[resource] = actions;
//    }
//    permissions[row.organizationId] = allPermissions;
//   }
//  }

//  return permissions;
// };
