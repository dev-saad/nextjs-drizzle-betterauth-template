"use server";

import {
 changePasswordSchema,
 deleteUserSchema,
 disableTwoFactorSchema,
 enableTwoFactorSchema,
 generateBackupCodesSchema,
 hasPermissionSchema,
 linkSocialSchema,
 resetPasswordSchema,
 signInSchema,
 signInSocialSchema,
 signUpSchema,
 TOTPStepSchema,
 twoFactorVerificationSchema,
 unlinkSocialSchema,
} from "@/actions/schemas/auth";
import { auth } from "@/lib/auth/auth.config";
import { APP_URL } from "@/lib/constants/config";
import { QueryValuesType, ROUTES } from "@/lib/constants/routes";
import { safeLogAction } from "@/lib/utils/safe-action";
import { SocialProvider } from "better-auth/social-providers";
import { headers } from "next/headers";
import z from "zod";
import { getUser } from "./user.controllers";

// ** Sign In & Sign Up

export const signUp = safeLogAction({
 options: {
  actionName: "SIGN_UP",
  entityName: "USER",
  schema: signUpSchema,
  ignoreAuth: true,
 },
 handler: async (input) => {
  const response = await auth.api.signUpEmail({
   body: {
    name: input.name, // required
    email: input.email, // required
    password: input.password, // required
    phone: input.phone,
   },
   headers: await headers(),
  });

  if (!response?.user) {
   throw new Error("Sign up failed");
  }

  return {
   data: { success: true },
   entityId: response?.user?.id,
   userId: response?.user?.id,
  };
 },
});

export const signIn = safeLogAction({
 options: {
  actionName: "SIGN_IN",
  entityName: "USER",
  schema: signInSchema,
  ignoreAuth: true,
 },
 handler: async (input) => {
  const response = await auth.api.signInEmail({
   body: {
    email: input.email, // required
    password: input.password, // required
    rememberMe: input.rememberMe,
   },
   headers: await headers(),
  });

  if (!response?.user) {
   throw new Error("Sign in failed");
  }

  return {
   entityId: response?.user?.id,
   userId: response?.user?.id,
   data: response?.user,
  };
 },
});

// ** Reset Password

export const requestResetPassword = safeLogAction({
 options: {
  schema: z.object({
   email: z.email(),
  }),
  ignoreAuth: true,
 },
 handler: async (input) => {
  await auth.api.requestPasswordReset({
   body: {
    email: input.email,
    redirectTo: APP_URL + ROUTES.RESET_PASSWORD,
   },
   headers: await headers(),
  });
 },
});

export const resetPassword = safeLogAction({
 options: {
  schema: resetPasswordSchema,
 },
 handler: async (input) => {
  await auth.api.resetPassword({
   body: {
    newPassword: input.password,
    token: input.token,
   },
   headers: await headers(),
  });
 },
});

// ** Change Password

export const changePassword = safeLogAction({
 options: {
  actionName: "CHANGE_PASSWORD",
  entityName: "USER",
  schema: changePasswordSchema,
 },
 handler: async (input, ctx) => {
  await auth.api.changePassword({
   body: {
    ...input,
   },
   headers: await headers(),
  });

  return {
   data: {
    success: true,
   },
   entityId: ctx?.userId,
   userId: ctx?.userId,
  };
 },
});

// ** Two Factor

export const enableTwoFactor = safeLogAction({
 options: {
  actionName: "2FA_ENABLE",
  entityName: "USER",
  schema: enableTwoFactorSchema,
 },
 handler: async (input, ctx) => {
  await auth.api.enableTwoFactor({
   body: {
    ...input,
   },
   headers: await headers(),
  });
 },
});

export const disableTwoFactor = safeLogAction({
 options: {
  actionName: "2FA_DISABLE",
  entityName: "USER",
  schema: disableTwoFactorSchema,
 },
 handler: async (input, ctx) => {
  await auth.api.disableTwoFactor({
   body: {
    ...input,
   },
   headers: await headers(),
  });

  return {
   data: {
    success: true,
   },
   entityId: ctx?.userId,
   userId: ctx?.userId,
  };
 },
});

export const sendTwoFactorOTP = safeLogAction({
 options: {},
 handler: async () => {
  return await auth.api.sendTwoFactorOTP({
   body: {
    trustDevice: true,
   },
   headers: await headers(),
  });
 },
});

export const viewBackupCodes = safeLogAction({
 options: {
  schema: z.object({
   userId: z.string(),
  }),
 },
 handler: async (input, ctx) => {
  return await auth.api.viewBackupCodes({
   body: {
    userId: input.userId,
   },
   headers: await headers(),
  });
 },
});

export const generateBackupCodes = safeLogAction({
 options: {
  actionName: "2FA_GENERATE_BACKUP_CODES",
  entityName: "USER",
  schema: generateBackupCodesSchema,
 },
 handler: async (input, ctx) => {
  const response = await auth.api.generateBackupCodes({
   body: {
    ...input,
   },
   headers: await headers(),
  });

  return {
   data: {
    success: true,
    ...response,
   },
   entityId: ctx?.userId,
   userId: ctx?.userId,
  };
 },
});

export const getTwoFactorStatus = safeLogAction({
 options: {},
 handler: async () => {
  const user = await getUser();
  return !!user?.twoFactorEnabled;
 },
});

// ** Verify Two Step Authentication

export const verifyTOTP = safeLogAction({
 options: {
  actionName: "2FA_VERIFY_TOTP",
  entityName: "USER",
  schema: TOTPStepSchema,
 },
 handler: async (input, ctx) => {
  await auth.api.verifyTOTP({
   body: {
    ...input,
   },
   headers: await headers(),
  });

  return {
   data: { success: true },
   entityId: ctx?.userId,
   userId: ctx?.userId,
  };
 },
});

export const verifyAndEnableTOTP = safeLogAction({
 options: {
  actionName: "2FA_ENABLE",
  entityName: "USER",
  schema: TOTPStepSchema,
 },
 handler: async (input, ctx) => {
  await auth.api.verifyTOTP({
   body: {
    ...input,
   },
   headers: await headers(),
  });

  return {
   data: { success: true },
   entityId: ctx?.userId,
   userId: ctx?.userId,
  };
 },
});

export const verifyTwoFactorOTP = safeLogAction({
 options: {
  actionName: "2FA_VERIFY_EMAIL",
  entityName: "USER",
  schema: twoFactorVerificationSchema,
 },
 handler: async (input, ctx) => {
  await auth.api.verifyTOTP({
   body: {
    ...input,
   },
   headers: await headers(),
  });

  return {
   data: { success: true },
   entityId: ctx?.userId,
   userId: ctx?.userId,
  };
 },
});

export const verifyBackupCodes = safeLogAction({
 options: {
  actionName: "2FA_VERIFY_BACKUP_CODES",
  entityName: "USER",
  schema: twoFactorVerificationSchema,
 },
 handler: async (input, ctx) => {
  await auth.api.verifyBackupCode({
   body: {
    ...input,
   },
   headers: await headers(),
  });

  return {
   data: { success: true },
   entityId: ctx?.userId,
   userId: ctx?.userId,
  };
 },
});

export const verify2faByMethod = async (input: {
 method: QueryValuesType["twoFactorMethods"][number];
 code: string;
 trustDevice: boolean;
}) => {
 const { method, ...rest } = input;
 switch (method) {
  case "backup":
   return await verifyBackupCodes(rest);
  case "totp":
   return await verifyTOTP({
    code: rest.code,
    trustDevice: !!rest.trustDevice,
   });
  case "email":
   return await verifyTwoFactorOTP(rest);
 }
};

// ** Sign Out

export const signOut = safeLogAction({
 options: {
  actionName: "SIGN_OUT",
  entityName: "USER",
 },
 handler: async (_, ctx) => {
  await auth.api.signOut({
   headers: await headers(),
   asResponse: true,
  });

  return {
   entityId: ctx?.userId,
  };
 },
});

export const signInSocial = safeLogAction({
 options: {
  actionName: "SIGN_IN_SOCIAL",
  entityName: "USER",
  schema: signInSocialSchema,
 },
 handler: async ({ provider, signUp }) => {
  await auth.api.signInSocial({
   body: {
    provider: provider as SocialProvider,
    callbackURL: `${APP_URL}${ROUTES.ORGANIZATION.ROOT}`,
    requestSignUp: signUp ?? false,
    newUserCallbackURL: ROUTES.ONBOARDING,
   },
   headers: await headers(),
  });

  return {
   metadata: {
    provider,
    signUp,
   },
  };
 },
});

export const linkSocialAccount = safeLogAction({
 options: {
  actionName: "LINK_SOCIAL_ACCOUNT",
  entityName: "USER",
  schema: linkSocialSchema,
 },
 handler: async (provider) => {
  const res = await auth.api.linkSocialAccount({
   body: {
    provider: provider as SocialProvider,
    callbackURL: `${APP_URL}${ROUTES.USER.ACCOUNT}`, // Redirect back to account settings
   },
   headers: await headers(),
  });

  return {
   data: res,
   metadata: {
    provider,
   },
  };
 },
});

export const unlinkSocialAccount = safeLogAction({
 options: {
  actionName: "UNLINK_SOCIAL_ACCOUNT",
  entityName: "USER",
  schema: unlinkSocialSchema,
 },
 handler: async (provider) => {
  const res = await auth.api.unlinkAccount({
   body: {
    providerId: provider as SocialProvider,
   },
   headers: await headers(),
  });

  return {
   data: res,
   metadata: {
    provider,
   },
  };
 },
});

export const deleteUser = safeLogAction({
 options: {
  actionName: "DELETE",
  entityName: "USER",
  schema: deleteUserSchema,
 },
 handler: async (input, ctx) => {
  await auth.api.deleteUser({
   body: {
    password: input.password,
   },
   headers: await headers(),
  });

  return {
   entityId: ctx?.userId,
   metadata: ctx?.user,
  };
 },
});

export const getAccountInfo = safeLogAction({
 options: {
  schema: z.object({ accountId: z.string() }),
 },
 handler: async (input) => {
  const account = await auth.api.accountInfo({
   body: {
    accountId: input.accountId,
   },
   headers: await headers(),
  });

  return account;
 },
});

export const hasPermission = async (
 input: z.infer<typeof hasPermissionSchema>,
) => {
 const validatedInput = hasPermissionSchema.parse(input);
 try {
  const canAccess = await auth.api.hasPermission({
   body: {
    ...validatedInput,
   },
   headers: await headers(),
  });
  return {
   data: canAccess,
   success: true,
  };
 } catch (error: any) {
  console.error("Error checking permission:", error);
  return {
   success: false,
   error: error.message,
  };
 }
};
