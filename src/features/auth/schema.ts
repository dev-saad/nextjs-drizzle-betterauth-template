import { QUERY_VALUES } from "@/lib/constants/routes";
import { emailSchema, nameSchema, phoneSchema } from "@/lib/global.schema";
import z from "zod";

export const signUpFormSchema = z
 .object({
  name: nameSchema,
  phone: phoneSchema,
  email: emailSchema,
  password: z
   .string()
   .min(8, "Password must be at least 8 characters long")
   .max(100, "Password must be at most 100 characters long"),
  confirmPassword: z.string(),
 })
 .refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
 });

export const signInFormSchema = z.object({
 email: emailSchema,
 password: z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(100, "Password must be at most 100 characters long"),
 rememberMe: z.boolean(),
 token: z.string().min(1, "Please complete the security check"),
});

export const requestResetPasswordFormSchema = z.object({
 email: emailSchema,
});

export const resetPasswordFormSchema = z
 .object({
  password: z
   .string()
   .min(8, "Password must be at least 8 characters long")
   .max(100, "Password must be at most 100 characters long"),
  confirmPassword: z.string(),
 })
 .refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
 });

export const twoFactorVerificationFormSchema = z.object({
 code: z.string().min(6, "Invalid code").max(6, "Invalid code"),
 trustDevice: z.boolean(),
});

export const twoFactorVerificationOptionsFormSchema = z.object({
 method: z.enum(QUERY_VALUES.twoFactorMethods, {
  error: "Please select a method",
 }),
});
