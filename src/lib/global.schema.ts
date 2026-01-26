import { isValidPhoneNumber } from "libphonenumber-js";
import z from "zod";

export const validatePasswordSchema = z
 .object({
  password: z
   .string()
   .min(8, { error: "Password must be at least 8 characters long" })
   .max(100, { error: "Password must be at most 100 characters long" }),
  confirmPassword: z.string(),
 })
 .refine((data) => data.password === data.confirmPassword, {
  error: "Passwords do not match",
  path: ["confirmPassword"],
 });

export const phoneSchema = z
 .string({ error: "Phone number is required" })
 .trim()
 .refine((value) => value && isValidPhoneNumber(value), "Invalid phone number");

export const nameSchema = z
 .string()
 .min(3, { error: "Name must be at least 3 characters long" })
 .max(50, { error: "Name must be at most 50 characters long" });

export const bioSchema = z
 .string()
 .max(500, { error: "Bio must be at most 1000 characters long" });

export const emailSchema = z
 .email({ message: "Invalid email" })
 .max(255, { message: "Email must be at most 255 characters long" });

export const otherSchema = z
 .string()
 .max(255, { message: "Must be at most 255 characters long" });

export const slugSchema = z
 .string()
 .min(1, { message: "Slug is required" })
 .max(100, { message: "Slug must be at most 100 characters long" })
 .regex(
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  "Slug must be lowercase and contain only letters, numbers, and hyphens"
 );

export const websiteSchema = z
 .string({ message: "Website is required" })
 .trim()
 .min(1, { message: "Website cannot be empty" })
 .transform((value) => {
  if (value.match(/^https?:\/\//i)) {
   return value.replace(/\/$/, "");
  }
  return `https://${value.replace(/\/$/, "")}`;
 })
 .refine(
  (value) => {
   try {
    // Validate that the resulting URL is valid
    new URL(value);
    return true;
   } catch {
    return false;
   }
  },
  { message: "Invalid website URL" }
 );

export const facebookSchema = z
 .string({ message: "Facebook URL is required" })
 .trim()
 .min(1, { message: "Facebook URL cannot be empty" })
 .refine(
  (value) => {
   return /^(?:https?:\/\/)?(?:www\.)?facebook\.com\/[a-zA-Z0-9.]+\/?$/.test(
    value
   );
  },
  { message: "Invalid Facebook URL. Format: facebook.com/username" }
 )
 .transform((value) => {
  if (value.match(/^https?:\/\//i)) {
   return value.replace(/\/$/, "");
  }
  return `https://${value.replace(/\/$/, "")}`;
 });

export const instagramSchema = z
 .string({ message: "Instagram URL is required" })
 .trim()
 .min(1, { message: "Instagram URL cannot be empty" })
 .refine(
  (value) => {
   return /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/.test(
    value
   );
  },
  { message: "Invalid Instagram URL. Format: instagram.com/username" }
 )
 .transform((value) => {
  if (value.match(/^https?:\/\//i)) {
   return value.replace(/\/$/, "");
  }
  return `https://${value.replace(/\/$/, "")}`;
 });

export const facebookSchemaOptional = z
 .string()
 .optional()
 .transform((val) => (val === "" ? undefined : val))
 .pipe(facebookSchema.optional());

export const instagramSchemaOptional = z
 .string()
 .optional()
 .transform((val) => (val === "" ? undefined : val))
 .pipe(instagramSchema.optional());
