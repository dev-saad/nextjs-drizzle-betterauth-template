"use server";

import { auth } from "@/lib/auth/auth.config";
import { statements } from "@/lib/constants/permissions";
import { db } from "@/lib/drizzle/db";
import {
 organizationRoles,
 organizations,
 organizationSettings,
} from "@/lib/drizzle/schemas/auth.schema";
import { buildFilters } from "@/lib/drizzle/utils/filter";
import { withOffsetPagination } from "@/lib/drizzle/utils/pagination";
import { buildSort } from "@/lib/drizzle/utils/sort";
import { membersView } from "@/lib/drizzle/views/members";
import { uploadFile } from "@/lib/storage/actions";
import { generateStorageKey, StoragePaths } from "@/lib/storage/config";
import { getChangedValues } from "@/lib/utils/get-changed-values";
import { safeAction, safeLogAction } from "@/lib/utils/safe-action";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import kebabCase from "lodash/kebabCase";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { cache } from "react";
import z from "zod";
import {
 acceptInvitationSchema,
 addMemberSchema,
 checkOrgSlugAvailabilitySchema,
 createRoleSchema,
 deleteRoleSchema,
 getActiveMemberRoleSchema,
 getActiveMemberSchema,
 getInvitationSchema,
 getMembersListSchema,
 getOrganizationSchema,
 getRolesListSchema,
 getSlugSuggestionsSchema,
 organizationCreateSchema,
 organizationUpdateSchema,
 rejectInvitationSchema,
 removeMemberSchema,
 sendInvitationSchema,
 updateMemberRoleSchema,
 updateRoleSchema,
} from "../schemas/organization";

export const getOrganizationsList = cache(async () => {
 return await safeAction(async () => {
  return await auth.api.listOrganizations({
   headers: await headers(),
  });
 });
});

export type OrganizationListReturnType = ReturnType<
 typeof getOrganizationsList
>;
export type OrganizationListAwaitedReturnType =
 Awaited<OrganizationListReturnType>;
export type OrganizationListType = OrganizationListAwaitedReturnType["data"];

export const setActiveOrganization = async (organizationId: string) => {
 return await safeAction(async () => {
  const activeOrganization = await auth.api.setActiveOrganization({
   body: {
    organizationId,
   },
   headers: await headers(),
  });

  return {
   org: activeOrganization,
  };
 });
};

export const createOrganization = safeLogAction({
 options: {
  actionName: "CREATE",
  entityName: "ORGANIZATION",
  schema: organizationCreateSchema,
  withRls: true,
 },
 handler: async (organization, ctx) => {
  let { metadata, settings, logo, ...restOrganization } = organization;

  if (restOrganization.slug) {
   const slugAvailable = await checkOrgSlugAvailability({
    slug: restOrganization.slug,
   });

   if (!slugAvailable) {
    throw new Error("Slug is not available");
   }
  }

  // 1. Create Organization FIRST (to get the ID)
  // Ensure default Control Plane metadata is used if not provided
  const newOrganization = await auth.api.createOrganization({
   body: {
    ...restOrganization,
    logo: undefined, // Upload logo after creation
    metadata: metadata ?? undefined,
   },
   headers: await headers(),
  });

  if (!newOrganization || !newOrganization.id) {
   throw new Error("Failed to create organization");
  }

  // 1.5. Create Organization Settings
  try {
   await db.insert(organizationSettings).values({
    ...settings,
    businessWebsite: settings.businessWebsite || "",
    organizationId: newOrganization.id,
   });
  } catch (err) {
   // Assuming a soft failure here is okay, or we should rollback?
   // For now, logging error. Organization creation succeeded, settings failed.
   console.error("Failed to create organization settings", err);
  }

  // 2. Upload Logo if provided
  if (logo && logo instanceof File) {
   const { data, success, error } = await uploadFile({
    file: logo,
    key: generateStorageKey(
     StoragePaths.ORG_LOGO(newOrganization.id),
     logo.name,
    ),
   });

   if (!data || !success || error) {
    throw new Error("Logo upload failed");
   }

   if (success && data?.key) {
    // 3. Update Organization with Logo Key
    const { error, success } = await updateOrganization({
     organizationId: newOrganization.id,
     logo: data.key,
    });

    if (!success || error) {
     throw new Error("Logo update failed");
    }
    // Update the returned object's logo locally for the frontend
    newOrganization.logo = data.key;
   }
  }

  // 4. Revalidate Layout to update sidebar
  revalidatePath("/", "layout");

  return {
   org: newOrganization,
   orgId: newOrganization?.id,
   entityId: newOrganization?.id,
   revalidated: true,
  };
 },
});

export const updateOrganization = safeLogAction({
 options: {
  actionName: "UPDATE",
  entityName: "ORGANIZATION",
  schema: organizationUpdateSchema,
  withRls: true,
 },
 handler: async (organization) => {
  const { organizationId, ...coreChanges } = organization;

  // 1. Fetch Existing Data (Core + Settings)
  const {
   data: existingData,
   success,
   error,
  } = await getOrganization({ organizationId, withSettings: true });

  if (!success || error || !existingData) {
   throw new Error("Organization not found");
  }

  // 2. get changed values
  const orgChanges = getChangedValues(coreChanges, {
   ...existingData.org,
   settings: existingData.settings || {},
  });

  // 3. Check if there are any changes
  if (Object.keys(orgChanges).length === 0) {
   return {
    org: existingData,
    status: "unchanged",
   };
  }

  // 4. Check Slug Availability
  if (orgChanges.slug) {
   const slugAvailable = await checkOrgSlugAvailability({
    slug: orgChanges.slug,
   });

   if (!slugAvailable) {
    throw new Error("Slug is not available");
   }
  }

  // 5. Handle Logo Upload
  if (orgChanges.logo && orgChanges.logo instanceof File) {
   const { data, success, error } = await uploadFile({
    file: orgChanges.logo,
    key: generateStorageKey(
     StoragePaths.ORG_LOGO(organizationId),
     orgChanges.logo.name,
    ),
    cleanup: {
     previousKey: existingData?.org?.logo ?? "",
    },
   });

   if (!data || !success || error) {
    throw new Error("File upload failed");
   }

   orgChanges.logo = data.key;
  }

  // 6. Deserialize changed values (settings and org)
  const { settings: changedSettings, ...changedOrg } = orgChanges;

  // 7. Check and Update Organization
  if (Object.keys(changedOrg).length > 0) {
   await auth.api.updateOrganization({
    body: {
     data: {
      ...changedOrg,
      logo: orgChanges.logo ?? undefined,
     },
     organizationId,
    },
    headers: await headers(),
   });
  }

  // 8. Check and Update Organization Settings
  if (changedSettings && Object.keys(changedSettings).length > 0) {
   const checkSettings = await db.query.organizationSettings.findFirst({
    where: {
     organizationId,
    },
   });
   if (checkSettings) {
    await db
     .update(organizationSettings)
     .set({
      ...changedSettings,
     })
     .where(eq(organizationSettings.organizationId, organizationId));
   } else {
    const parsedSettings =
     organizationCreateSchema.shape.settings.parse(changedSettings);
    await db.insert(organizationSettings).values({
     ...parsedSettings,
     businessWebsite: parsedSettings.businessWebsite || "",
     organizationId: organizationId,
    });
   }
  }
 },
});

export const getOrganization = safeLogAction({
 options: {
  schema: getOrganizationSchema,
  cache: true,
  withRls: true,
  requiredPermissions: {
   organization: ["read"],
  },
 },
 handler: async (input) => {
  const withSettings = typeof input === "string" ? false : input.withSettings;

  const organization = await auth.api.getFullOrganization({
   headers: await headers(),
   params: {
    organizationId: input.organizationId,
   },
   query: {
    organizationId: input.organizationId,
   },
  });

  // Strict check: if auth.api returns a different org (e.g. active org fallback), treat as not found/unauthorized
  if (!organization || organization.id !== input.organizationId) {
   return {
    org: null,
    settings: null,
   };
  }

  if (!withSettings) {
   return {
    org: organization,
    settings: null,
   };
  }

  const settings = await db.query.organizationSettings.findFirst({
   where: {
    organizationId: input.organizationId,
   },
  });

  return {
   org: organization,
   ...(settings && { settings }),
  };
 },
});

export type OrganizationReturnType = ReturnType<typeof getOrganization>;
// Note: Return type now contains { org, settings }
export type OrganizationType = Awaited<OrganizationReturnType>["data"];

export const getSlugSuggestions = safeLogAction({
 options: {
  schema: getSlugSuggestionsSchema,
  cache: true,
 },
 handler: async (input) => {
  if (!input.name)
   return { originalAvailable: false, suggestions: [], baseSlug: "" };

  const baseSlug = kebabCase(input.name);
  const candidates = [
   baseSlug,
   `${baseSlug}-hq`,
   `official-${baseSlug}`,
   `the-${baseSlug}`,
   `${baseSlug}-app`,
   `${baseSlug}-co`,
   `${baseSlug}-corp`,
   `${baseSlug}-inc`,
   `${baseSlug}-group`,
   `${baseSlug}-global`,
   `${baseSlug}-international`,
   `${baseSlug}-limited`,
   `${baseSlug}-plc`,
   `${baseSlug}-llc`,
   `${baseSlug}-sa`,
   `${baseSlug}-sp`,
   `${baseSlug}-gmbh`,
   `${baseSlug}-ag`,
   `${baseSlug}-nv`,
   `${baseSlug}-oy`,
   `${baseSlug}-srl`,
   `${baseSlug}-pte`,
   `${baseSlug}-co`,
   `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`,
  ];

  const existingOrgs = await db
   .select({ slug: organizations.slug })
   .from(organizations)
   .where(inArray(organizations.slug, candidates));

  const existingSlugs = new Set(existingOrgs.map((o) => o.slug));
  const originalAvailable = !existingSlugs.has(baseSlug);
  const suggestions = candidates.filter((slug) => !existingSlugs.has(slug));

  return {
   originalAvailable,
   suggestions: suggestions.slice(0, 4), // Limit to 3-4 suggestions
   baseSlug,
  };
 },
});

export const checkOrgSlugAvailability = safeLogAction({
 options: {
  schema: checkOrgSlugAvailabilitySchema,
 },
 handler: async (input) => {
  const slugAvailable = await auth.api.checkOrganizationSlug({
   body: {
    slug: input.slug,
   },
   headers: await headers(),
  });

  return slugAvailable.status;
 },
});

export const createRole = safeLogAction({
 options: {
  schema: createRoleSchema,
  withRls: true,
  actionName: "CREATE",
  entityName: "ORGANIZATION_ROLE",
  requiredPermissions: {
   role: ["create"],
  },
 },
 handler: async (input) => {
  const role = await auth.api.createOrgRole({
   body: {
    ...input,
   },
   headers: await headers(),
  });

  return role;
 },
});

export const updateRole = safeLogAction({
 options: {
  schema: updateRoleSchema,
  withRls: true,
  actionName: "UPDATE",
  entityName: "ORGANIZATION_ROLE",
  requiredPermissions: {
   role: ["update"],
  },
 },
 handler: async (input) => {
  const role = await auth.api.updateOrgRole({
   body: {
    ...input,
   },
   headers: await headers(),
  });

  return role;
 },
});

export const deleteRole = safeLogAction({
 options: {
  schema: deleteRoleSchema,
  withRls: true,
  actionName: "DELETE",
  entityName: "ORGANIZATION_ROLE",
  requiredPermissions: {
   role: ["delete"],
  },
 },
 handler: async (input) => {
  const role = await auth.api.deleteOrgRole({
   body: {
    ...input,
   },
   headers: await headers(),
  });

  return role;
 },
});

export const getRolesList = safeLogAction({
 options: {
  schema: getRolesListSchema,
  cache: true,
  requiredPermissions: {
   role: ["read"],
  },
 },
 handler: async (input) => {
  // 1. Generate Dynamic Filters
  const dynamicFilters = buildFilters(input.filters, {
   search: {
    type: "search",
    columns: [organizationRoles.role],
   },
   createdAt: {
    type: "dateRange",
    column: organizationRoles.createdAt,
   },
  });

  // 2. Shared WHERE Clause
  const whereClause = and(
   eq(organizationRoles.organizationId, input.organizationId),
   ...dynamicFilters,
  );

  // 3. Sort Builder
  const orderBy = buildSort(input.filters.sort, {
   createdAt: organizationRoles.createdAt,
  });

  if (orderBy.length === 0) {
   orderBy.push(desc(organizationRoles.createdAt));
  }

  // 4. Base Query
  const query = db
   .select()
   .from(organizationRoles)
   .where(whereClause)
   .orderBy(...orderBy)
   .$dynamic();

  // 5. Execute - Fetch all first to handle JSON filtering in memory
  // Pagination is applied AFTER filtering
  const allRoles = await query;

  let filteredRoles = allRoles;

  // 6. Filter by Permissions (JSON)
  if (input.filters.permissions && input.filters.permissions.length > 0) {
   const permsToCheck = Array.isArray(input.filters.permissions)
    ? input.filters.permissions
    : input.filters.permissions.split(",");

   if (permsToCheck.length > 0) {
    filteredRoles = filteredRoles.filter((role) => {
     if (!role.permission) return false;
     try {
      const rolePerms = JSON.parse(role.permission) as Record<string, string[]>;
      // Check if role has ALL of the required permissions
      // For faceted filters, usually it's OR logic between selected options
      return permsToCheck.every((p) => {
       const [resource, action] = p.split(":");
       return rolePerms[resource]?.includes(action);
      });
     } catch (e) {
      return false;
     }
    });
   }
  }

  const totalCount = filteredRoles.length;
  const currentLimit = input.filters.limit || 10;
  const currentPage = input.filters.page || 1;
  const offset = (currentPage - 1) * currentLimit;

  // 7. Manual Pagination
  const paginatedRoles = filteredRoles.slice(offset, offset + currentLimit);

  return {
   data: {
    roles: paginatedRoles.map((role) => ({
     ...role,
     permission: role.permission ? JSON.parse(role.permission) : {},
    })),
    total: totalCount,
    pageCount: Math.ceil(totalCount / currentLimit),
   },
  };
 },
});

export type RolesReturnType = ReturnType<typeof getRolesList>;
// Adjust RolesType to match the new structure { roles: [], total, pageCount }
export type RolesType = Awaited<RolesReturnType>["data"];

export const sendInvitation = safeLogAction({
 options: {
  schema: sendInvitationSchema,
  withRls: true,
  actionName: "CREATE",
  entityName: "ORGANIZATION_INVITATION",
  requiredPermissions: {
   invitation: ["create"],
  },
 },
 handler: async (input) => {
  const invitation = await auth.api.createInvitation({
   body: {
    ...input,
    resend: true,
   },
   headers: await headers(),
  });

  return invitation;
 },
});

export const getInvitation = safeLogAction({
 options: {
  schema: getInvitationSchema,
  withRls: true,
 },
 handler: async (input) => {
  const invitation = await auth.api.getInvitation({
   query: {
    ...input,
   },
   headers: await headers(),
  });

  return invitation;
 },
});

export const acceptInvitation = safeLogAction({
 options: {
  schema: acceptInvitationSchema,
  withRls: true,
  actionName: "CREATE",
  entityName: "ORGANIZATION_ROLE",
 },
 handler: async (input) => {
  const role = await auth.api.acceptInvitation({
   body: {
    ...input,
   },
   headers: await headers(),
  });

  return role;
 },
});

export const rejectInvitation = safeLogAction({
 options: {
  schema: rejectInvitationSchema,
  withRls: true,
  actionName: "DELETE",
  entityName: "ORGANIZATION_INVITATION",
 },
 handler: async (input) => {
  const invitation = await auth.api.rejectInvitation({
   body: {
    ...input,
   },
   headers: await headers(),
  });

  return invitation;
 },
});

export const addMember = safeLogAction({
 options: {
  schema: addMemberSchema,
  withRls: true,
  actionName: "CREATE",
  entityName: "ORGANIZATION_MEMBER",
 },
 handler: async (input) => {
  const member = await auth.api.addMember({
   body: {
    ...input,
   },
   headers: await headers(),
  });

  return member;
 },
});

export const getMembersList = safeLogAction({
 options: {
  schema: getMembersListSchema,
  cache: true,
  requiredPermissions: {
   member: ["read"],
  },
 },
 handler: async (input) => {
  // 1. Generate Dynamic Filters
  const dynamicFilters = buildFilters(input.filters, {
   search: {
    type: "search",
    columns: [membersView.userName, membersView.userEmail],
   },
   role: {
    type: "arrayString",
    column: membersView.role,
   },
   joinedAt: {
    type: "dateRange",
    column: membersView.joinedAt,
   },
  });

  // 2. Build the Shared WHERE Clause
  const whereClause = and(
   eq(membersView.organizationId, input.organizationId),
   ...dynamicFilters,
  );

  // 3. Sort Builder (New)
  // Map the string keys from your Zod schema/Frontend to DB columns
  const orderBy = buildSort(input.filters.sort, {
   createdAt: membersView.joinedAt,
   //  role: membersView.role,
   //  name: membersView.userName,
   //  email: membersView.userEmail,
  });

  // Fallback: If no valid sort provided, default to createdAt desc
  if (orderBy.length === 0) {
   orderBy.push(desc(membersView.joinedAt));
  }

  // 4. Define the Base Query
  const query = db
   .select()
   .from(membersView)
   .where(whereClause)
   .orderBy(...orderBy)
   .$dynamic(); // Required for the helper to modify the query

  // 5. Execute Queries
  const [data, totalResult] = await Promise.all([
   // ✅ Use the helper for pagination
   withOffsetPagination(query, input.filters.page, input.filters.limit),

   // ⚠️ Manual count required here because we need the JOIN for search filters
   db.select({ count: count() }).from(membersView).where(whereClause),
  ]);

  const currentLimit = input.filters.limit || 10; // Default fallback to match helper defaults

  return {
   data: {
    members: data.map((row) => ({
     id: row.id,
     role: row.role?.split(",").map((role) => role.trim()),
     createdAt: row.joinedAt,
     user: {
      id: row.userId,
      name: row.userName,
      email: row.userEmail,
      image: row.userImage,
     },
    })),
    total: totalResult[0].count || 0,
    pageCount: Math.ceil((totalResult[0].count || 0) / currentLimit),
   },
  };
 },
});

export type MembersReturnType = ReturnType<typeof getMembersList>;
export type MembersType = Awaited<MembersReturnType>["data"];

export const getActiveMember = safeLogAction({
 options: {
  schema: getActiveMemberSchema,
 },
 handler: async (input) => {
  const member = await auth.api.getActiveMember({
   headers: await headers(),
   query: {
    organizationId: input.organizationId,
   },
  });

  return member;
 },
});

export const getActiveMemberRole = safeLogAction({
 options: {
  schema: getActiveMemberRoleSchema,
 },
 handler: async (input) => {
  return await auth.api.getActiveMemberRole({
   headers: await headers(),
   query: {
    organizationId: input.organizationId,
   },
  });
 },
});

export const updateMemberRole = safeLogAction({
 options: {
  schema: updateMemberRoleSchema,
  withRls: true,
  actionName: "UPDATE",
  entityName: "ORGANIZATION_ROLE",
  requiredPermissions: {
   role: ["update"],
  },
 },
 handler: async (input) => {
  if (input.role.includes("owner")) {
   throw new Error("Owner cannot be updated");
  }
  const role = await auth.api.updateMemberRole({
   body: {
    ...input,
   },
   headers: await headers(),
  });

  return role;
 },
});

export const removeMember = safeLogAction({
 options: {
  schema: removeMemberSchema,
  withRls: true,
  actionName: "DELETE",
  entityName: "ORGANIZATION_MEMBER",
  requiredPermissions: {
   member: ["delete"],
  },
 },
 handler: async (input) => {
  console.log(input);
  if (input.role.includes("owner")) {
   throw new Error("Owner cannot be removed");
  }
  const member = await auth.api.removeMember({
   body: {
    ...input,
   },
   headers: await headers(),
  });

  return member;
 },
});

// export const fetchPermissionsForRoles = async (
//  organizationId: string,
//  roles: string[],
// ) => {
//  if (roles.length === 0) {
//   return {};
//  }

//  // Fetch permissions for these roles from organizationRoles table
//  const permissionsData = await db
//   .select({ permission: organizationRoles.permission })
//   .from(organizationRoles)
//   .where(
//    and(
//     eq(organizationRoles.organizationId, organizationId),
//     inArray(organizationRoles.role, roles),
//    ),
//   );

//  // Consolidate permissions
//  const groupedPermissions: Record<string, Set<string>> = {};

//  permissionsData.forEach((record) => {
//   try {
//    const permObj = JSON.parse(record.permission);
//    Object.entries(permObj).forEach(([resource, actions]) => {
//     if (Array.isArray(actions)) {
//      if (!groupedPermissions[resource]) {
//       groupedPermissions[resource] = new Set();
//      }
//      actions.forEach((action: string) =>
//       groupedPermissions[resource].add(action),
//      );
//     }
//    });
//   } catch (e) {
//    // ignore parse error
//   }
//  });

//  return Object.fromEntries(
//   Object.entries(groupedPermissions).map(([resource, actionsSet]) => [
//    resource,
//    Array.from(actionsSet),
//   ]),
//  );
// };

export const getMemberPermissions = safeLogAction({
 options: {
  schema: z.object({
   organizationId: z.string(),
   member: z
    .object({
     organizationId: z.string(),
     role: z.string(),
    })
    .optional(),
  }),
  ignoreAuth: true,
 },
 handler: async (input) => {
  const headersList = await headers();
  const activeMember =
   input.member && Object.keys(input.member).length > 0
    ? input.member
    : await auth.api.getActiveMember({
       headers: headersList,
       query: {
        organizationId: input.organizationId,
       },
      });

  if (!activeMember) {
   return {
    data: {
     permissions: {},
    },
   };
  }

  // Get all roles for the member
  const roles = activeMember.role ? activeMember.role.split(",") : [];

  const permissionsData = roles.includes("owner")
   ? [{ permission: JSON.stringify(statements) }]
   : await db.query.organizationRoles.findMany({
      where: {
       organizationId: input.organizationId,
       role: {
        in: roles,
       },
      },
     });

  const groupedPermissions: Record<string, Set<string>> = {};

  permissionsData.forEach((record) => {
   try {
    const permObj = JSON.parse(record.permission);
    Object.entries(permObj).forEach(([resource, actions]) => {
     if (Array.isArray(actions)) {
      if (!groupedPermissions[resource]) {
       groupedPermissions[resource] = new Set();
      }
      actions.forEach((action: string) =>
       groupedPermissions[resource].add(action),
      );
     }
    });
   } catch (e) {
    // ignore parse error
   }
  });

  return {
   data: {
    permissions: Object.fromEntries(
     Object.entries(groupedPermissions).map(([resource, actionsSet]) => [
      resource,
      Array.from(actionsSet),
     ]),
    ),
   },
  };
 },
});
