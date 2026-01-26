import {
 controlPlaneMetadataSchema,
 orgSettingsSchema,
} from "@/features/organization/settings/schema";
import { organizations } from "@/lib/drizzle";
import { emailSchema, otherSchema, slugSchema } from "@/lib/global.schema";
import { MAX_ORG_LOGO_SIZE } from "@/lib/storage/config";
import {
 createImageSchema,
 DateRangeSchema,
 SortSchema,
} from "@/lib/utils/zod";
import { createInsertSchema } from "drizzle-zod";
import z from "zod";

const organizationInsertSchema = createInsertSchema(organizations);

export const organizationCreateSchema = organizationInsertSchema
 .extend({
  name: otherSchema.min(1, "Organization name is required"),
  slug: slugSchema,
  metadata: controlPlaneMetadataSchema
   .default({
    onboarding: {
     isComplete: false,
    },
    plan: {
     tier: "free",
     status: "active",
     limits: {
      maxProducts: 10,
      maxOrdersPerMonth: 100,
     },
    },
    flags: [],
   })
   .optional(),
  settings: orgSettingsSchema, // Legacy metadata (Address, Business, Locale)
  logo: createImageSchema({
   required: true,
   maxSizeBytes: MAX_ORG_LOGO_SIZE,
   message: "Logo is required",
   removeRemoteStorageUrl: true,
  }),
 })
 .omit({
  id: true,
  createdAt: true,
 });

export const organizationUpdateSchema = organizationInsertSchema
 .extend({
  organizationId: z.string(),
  metadata: controlPlaneMetadataSchema.partial(),
  settings: orgSettingsSchema.partial(),
  logo: createImageSchema({
   required: false,
   maxSizeBytes: MAX_ORG_LOGO_SIZE,
   message: "Logo is required",
   removeRemoteStorageUrl: true,
  }),
 })
 .partial()
 .required({
  organizationId: true,
 });

export const getOrganizationBaseSchema = z.object({
 withSettings: z.boolean().optional(),
});

export const getOrganizationSchema = getOrganizationBaseSchema.extend({
 organizationId: z.string(),
 slug: z.string().optional(),
});
export const checkOrgSlugAvailabilitySchema = z.object({
 slug: z.string(),
});

export const getSlugSuggestionsSchema = z.object({
 name: z.string(),
});

export const createRoleSchema = z.object({
 organizationId: z.string(),
 role: z.string().min(1, "Role name is required"),
 permission: z.record(z.string(), z.array(z.string())).refine((value) => {
  return Object.values(value).some((v) => v.length > 0);
 }, "At least one permission is required"),
});

export const updateRoleSchema = z.object({
 organizationId: z.string(),
 roleId: z.string(), // This is effectively the role ID or the slug if better-auth uses slug
 roleName: z.string().min(1, "Role name is required").optional(),
 data: z.object({
  roleName: z.string().min(1, "Role name is required").optional(),
  permission: z.record(z.string(), z.array(z.string())).refine((value) => {
   return Object.values(value).some((v) => v.length > 0);
  }, "At least one permission is required"),
 }),
});

export const deleteRoleSchema = z.object({
 organizationId: z.string(),
 roleId: z.string(),
});

export const getRolesListSchema = z.object({
 organizationId: z.string(),
 filters: z.object({
  search: z.string().optional(),
  permissions: z.union([z.string(), z.array(z.string())]).optional(),
  limit: z.coerce.number().optional(),
  page: z.coerce.number().optional(),
  sort: SortSchema.optional(),
  createdAt: DateRangeSchema.optional(),
 }),
});

export const acceptInvitationSchema = z.object({
 invitationId: z.string(),
});

export const rejectInvitationSchema = z.object({
 invitationId: z.string(),
});

export const getInvitationSchema = z.object({
 id: z.string(),
});

export const sendInvitationSchema = z.object({
 email: z.email(),
 role: z.union([z.any(), z.array(z.string())]),
 organizationId: z.string(),
 resend: z.boolean().optional(),
 teamId: z.string().optional(),
});

export const addMemberSchema = z.object({
 organizationId: z.string(),
 userId: z.string(),
 role: z.union([z.any(), z.array(z.string())]),
 teamId: z.string().optional(),
});

export const getMembersListSchema = z.object({
 organizationId: z.string(),
 filters: z.object({
  search: z.string().optional(),
  role: z.array(z.string()).optional(),
  limit: z.coerce.number().optional(),
  page: z.coerce.number().optional(),
  sort: SortSchema.optional(),
  joinedAt: DateRangeSchema.optional(),
 }),
});

export const updateMemberRoleSchema = z.object({
 organizationId: z.string(),
 memberId: z.string(),
 role: z.union([z.string(), z.array(z.string())]),
});

export const removeMemberSchema = z.object({
 organizationId: z.string(),
 memberIdOrEmail: z.union([z.string(), emailSchema]),
 role: z.union([z.any(), z.array(z.string())]),
});

export const getOrganizationMembersSchema = z.object({
 organizationId: z.string(),
 limit: z.number().optional(),
 offset: z.number().optional(),
 sortedBy: z.string().optional(),
 sortDirection: z.enum(["asc", "desc"]).optional(),
 filters: z
  .array(
   z.object({
    field: z.string(),
    value: z.any(),
    operator: z.enum([
     "eq",
     "ne",
     "gt",
     "gte",
     "lt",
     "lte",
     "in",
     "nin",
     "contains",
     "exists",
     "notExists",
     "startsWith",
     "endsWith",
     "regex",
     "notRegex",
    ]),
   }),
  )
  .optional(),
});

export const getActiveMemberSchema = z.object({
 organizationId: z.string(),
});

export const getActiveMemberRoleSchema = z.object({
 organizationId: z.string(),
});
