import { BUSINESS_TYPES, getAllCategories } from "@/lib/constants/industries";
import { emailSchema, otherSchema, slugSchema } from "@/lib/global.schema";
import { MAX_ORG_LOGO_SIZE } from "@/lib/storage/config";
import {
 currencyCodeOptions,
 dimensionUnitOptions,
 languageOptions,
 timezoneOptions,
 weightUnitOptions,
} from "@/lib/utils/select-options";
import { createImageSchema, createUrlSchema } from "@/lib/utils/zod";
import { z } from "zod";

export const weightUnitEnum = z.enum(
 weightUnitOptions.map((option) => option.value),
 { error: "Weight Unit is required" },
);
export const dimensionUnitEnum = z.enum(
 dimensionUnitOptions.map((option) => option.value),
 { error: "Dimension Unit is required" },
);
export const currencyEnum = z.enum(
 currencyCodeOptions.map((option) => option.value),
 { error: "Currency is required" },
);
export const languageEnum = z.enum(
 languageOptions.map((option) => option.value),
 { error: "Language is required" },
);
export const timezoneEnum = z.enum(
 timezoneOptions.map((option) => option.value),
 { error: "Timezone is required" },
);

export const orgSettingsSchema = z.object({
 addressLine1: z.string().min(1, "Address Line 1 is required"),
 addressLine2: z.string().optional().nullish(),
 addressCity: z.string().min(1, "City is required"),
 addressState: z.string().min(1, "State is required"),
 addressPostalCode: z.string().min(1, "Postal Code is required"),
 addressCountry: z.string().min(1, "Country is required"),
 // Business
 businessType: z.enum(BUSINESS_TYPES, {
  error: "Business Type is required",
 }),
 businessCategory: z.enum(getAllCategories(), {
  error: "Category is required",
 }),
 businessWebsite: createUrlSchema({
  required: true,
  message: "Website is required",
 }),
 businessFacebookUrl: createUrlSchema({
  social: "facebook",
  required: false,
 }).nullish(),
 businessInstagramUrl: createUrlSchema({
  social: "instagram",
  required: false,
 }).nullish(),
 businessRegistrationNumber: z
  .string()
  .max(22, "Registration Number is too long")
  .optional()
  .nullish(),
 // Locale
 localeCurrency: currencyEnum,
 localeTimezone: timezoneEnum,
 localeLanguage: languageEnum,
 localeWeightUnit: weightUnitEnum,
 localeDimensionUnit: dimensionUnitEnum,
});

export const controlPlaneMetadataSchema = z.object({
 onboarding: z.object({
  isComplete: z.boolean(),
 }),
 plan: z.object({
  tier: z.enum(["free", "growth", "scale"]),
  status: z.enum(["active", "past_due", "canceled"]),
  limits: z.object({
   maxProducts: z.number(),
   maxOrdersPerMonth: z.number(),
  }),
 }),
 flags: z.array(z.string()),
});

export const organizationFormSchema = z.object({
 name: otherSchema.min(1, "Organization name is required"),
 slug: slugSchema,
 logo: createImageSchema({
  required: true,
  maxSizeBytes: MAX_ORG_LOGO_SIZE,
  message: "Logo is required",
 }),
 settings: orgSettingsSchema,
});

export type OrganizationFormSchemaType = z.infer<typeof organizationFormSchema>;

export const createRoleFormSchema = z.object({
 role: z.string().min(1, "Role name is required"),
 permissions: z.record(z.string(), z.array(z.string())).refine((value) => {
  return Object.values(value).some((v) => v.length > 0);
 }, "At least one permission is required"),
});

export type CreateRoleFormSchemaType = z.infer<typeof createRoleFormSchema>;

export const updateRoleFormSchema = createRoleFormSchema.extend({});

export type UpdateRoleFormSchemaType = z.infer<typeof updateRoleFormSchema>;

export const sendInvitationFormSchema = z.object({
 email: emailSchema,
 role: z.array(z.string()).min(1, "Role is required"),
 organizationId: z.string().min(1, "Organization ID is required"),
});

export type SendInvitationFormSchemaType = z.infer<
 typeof sendInvitationFormSchema
>;
