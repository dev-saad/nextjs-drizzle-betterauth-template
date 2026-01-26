import {
 bioSchema,
 nameSchema,
 otherSchema,
 phoneSchema,
 websiteSchema,
} from "@/lib/global.schema";
import { MAX_USER_IMAGE_SIZE } from "@/lib/storage/config";
import { createImageSchema, createUrlSchema } from "@/lib/utils/zod";
import { z } from "zod";

export const changePasswordFormSchema = z
 .object({
  currentPassword: z
   .string()
   .min(8, "Password must be at least 8 characters long")
   .max(100, "Password must be at most 100 characters long"),
  newPassword: z
   .string()
   .min(8, "Password must be at least 8 characters long")
   .max(100, "Password must be at most 100 characters long"),
  confirmPassword: z.string(),
  revokeOtherSessions: z.boolean(),
 })
 .refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
 });

export const twoFactorPasswordFormSchema = z.object({
 password: z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(100, "Password must be at most 100 characters long"),
});

export const TOTPStepFormSchema = z.object({
 code: z
  .string()
  .min(6, "Code must be at least 6 characters long")
  .max(6, "Code must be at most 6 characters long"),
 trustDevice: z.boolean(),
});

export const billingFormSchema = z.object({
 line1: otherSchema.optional(),
 line2: otherSchema.optional(),
 city: otherSchema.optional(),
 state: otherSchema.optional(),
 postalCode: otherSchema.optional(),
 country: otherSchema.optional(),
});

export const userProfileFormSchema = z.object({
 name: nameSchema,
 phone: phoneSchema.optional().or(z.literal("")),
 bio: bioSchema.optional(),
 website: websiteSchema.optional().or(z.literal("")),
 avatar: createImageSchema({
  required: true,
  maxSizeBytes: MAX_USER_IMAGE_SIZE,
  removeRemoteStorageUrl: true,
  acceptedTypes: [
   "image/jpeg",
   "image/jpg",
   "image/png",
   "image/webp",
   "image/svg+xml",
  ],
 }),
 socialLinks: z
  .object({
   twitter: createUrlSchema({ social: "twitter", required: false }),
   github: createUrlSchema({ social: "github", required: false }),
   linkedin: createUrlSchema({ social: "linkedin", required: false }),
  })
  .optional(),
});

export type BillingFormSchemaType = z.infer<typeof billingFormSchema>;
export type UserProfileFormSchemaType = z.infer<typeof userProfileFormSchema>;
