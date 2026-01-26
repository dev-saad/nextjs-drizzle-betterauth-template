import {
 resetPasswordFormSchema,
 signInFormSchema,
 signUpFormSchema,
 twoFactorVerificationFormSchema,
} from "@/features/auth/schema";
import {
 changePasswordFormSchema,
 TOTPStepFormSchema,
} from "@/features/user/schema";
import { PermissionsSchema } from "@/lib/constants/permissions";
import { SocialProvider } from "better-auth/social-providers";
import z from "zod";

export const changePasswordSchema = changePasswordFormSchema.omit({
 confirmPassword: true,
});

export const TOTPStepSchema = TOTPStepFormSchema;

export const twoFactorVerificationSchema = twoFactorVerificationFormSchema;

export const signUpSchema = signUpFormSchema.omit({
 confirmPassword: true,
});
export const signInSchema = signInFormSchema.omit({ token: true });

export const resetPasswordSchema = resetPasswordFormSchema
 .omit({ confirmPassword: true })
 .extend({ token: z.string() });

export const signInSocialSchema = z.object({
 provider: z.string() as z.ZodType<SocialProvider>,
 signUp: z.boolean().optional(),
});

export const linkSocialSchema = z.string() as z.ZodType<SocialProvider>;
export const unlinkSocialSchema = z.string() as z.ZodType<SocialProvider>;
export const deleteUserSchema = z.object({
 password: z.string(),
});

export const enableTwoFactorSchema = z.object({
 password: z.string(),
});

export const disableTwoFactorSchema = z.object({
 password: z.string(),
});

export const generateBackupCodesSchema = z.object({
 password: z.string(),
});

export const hasPermissionSchema = z.object({
 permissions: PermissionsSchema,
 organizationId: z.string(),
});
