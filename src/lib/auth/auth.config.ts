// src/lib/auth/auth.ts (updated with custom error for duplicate phone)
import { APIError, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import {
 captcha,
 customSession,
 organization,
 twoFactor,
} from "better-auth/plugins";
import { db } from "../drizzle/db";

import { getMemberPermissions } from "@/actions/server/organization.controllers";
import { UserPreferences } from "@/lib/types/user";
import { eq } from "drizzle-orm";
import { z } from "zod";
import API_PATHS from "../constants/api-paths";
import { ac, ownerRole } from "../constants/permissions";
import * as schema from "../drizzle/schemas/auth.schema";
import { phoneSchema } from "../global.schema";
import { safeAction } from "../utils/safe-action";

const disposableEmailDomains = [
 "mailinator.com",
 "10minutemail.com",
 "yopmail.com",
 "guerrillamail.com",
 "guerrillamailblock.com",
 "crsay.com",
 "illubd.com",
 "comfythings.com",
];

export const auth = betterAuth({
 appName: "Flowket",
 database: drizzleAdapter(db, {
  provider: "pg",
  schema: {
   ...schema,
   user: schema.users,
   session: schema.sessions,
   account: schema.accounts,
   verification: schema.verifications,
   organization: schema.organizations,
   member: schema.members,
   invitation: schema.invitations,
   twoFactor: schema.twoFactor,
   organizationRole: schema.organizationRoles,
  },
 }),
 // rateLimit: {
 //  enabled: true,
 //  max: 2,
 //  window: 10,
 // },
 hooks: {
  before: async (request) => {},
 },
 databaseHooks: {
  user: {
   create: {
    before: async (session) => {
     const email = session.email?.toLowerCase() ?? "";
     const domain = email.split("@")[1];

     if (!domain)
      throw new APIError("BAD_REQUEST", { message: "Invalid email address" });
     if (disposableEmailDomains.includes(domain)) {
      throw new APIError("UNPROCESSABLE_ENTITY", {
       message: "Disposable email addresses are not allowed.",
      });
     }
    },
   },
  },
  session: {
   cookieCache: {
    enabled: true,
    maxAge: 5 * 60, // Cache duration in seconds (1 minute)
    strategy: "compact", // or "compact" or "jwe"
   },

   create: {
    after: async (session) => {
     if (session.activeOrganizationId) {
      await db
       .update(schema.users)
       .set({ activeOrganizationId: session.activeOrganizationId as string })
       .where(eq(schema.users.id, session.userId));
     }
    },
   },
   update: {
    after: async (session) => {
     if (session.activeOrganizationId) {
      await db
       .update(schema.users)
       .set({ activeOrganizationId: session.activeOrganizationId as string })
       .where(eq(schema.users.id, session.userId));
     }
    },
   },
  },
 },
 session: {
  freshAge: 60 * 5,
  expiresIn: 60 * 60 * 24 * 7, // 7 days
  updateAge: 60 * 60 * 24, // 1 day
 },
 emailAndPassword: {
  enabled: true,
  minPasswordLength: 8,
  resetPasswordTokenExpiresIn: 60 * 60 * 24, // 1 day
  sendResetPassword: async ({ user, url, token }) => {
   await safeAction(async () => {
    await fetch(API_PATHS.requestResetPasswordEmail, {
     method: "POST",
     body: JSON.stringify({ user, url, token }),
    });
   });
  },
 },
 socialProviders: {
  google: {
   clientId: process.env.GOOGLE_CLIENT_ID!,
   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
   disableImplicitSignUp: true,
  },
 },
 user: {
  deleteUser: {
   enabled: true,
  },
  additionalFields: {
   phone: {
    type: "string",
    required: true,
    input: true,
    validator: {
     input: phoneSchema,
     output: phoneSchema,
    },
   },
   activeOrganizationId: {
    type: "string",
    required: false,
    input: false,
    validator: {
     input: z.string().optional(),
     output: z.string().optional(),
    },
   },
   preferences: {
    type: "json",
    required: false,
    input: true,
    validator: {
     input: z.object({
      theme: z.enum(["light", "dark", "system", "rose", "blue", "green"]),
     }),
     output: z.object({
      theme: z.enum(["light", "dark", "system", "rose", "blue", "green"]),
     }),
    },
   },
  },
 },

 plugins: [
  customSession(async ({ user, session }) => {
   const permissions: Record<string, Record<string, string[]>> = {};
   let activeOrganizationId;
   const u = await db.query.users.findFirst({
    where: {
     id: session.userId,
    },
    columns: { activeOrganizationId: true },
   });
   if (!!u?.activeOrganizationId) {
    activeOrganizationId = u.activeOrganizationId;
   }

   //**  If the user has no active organization, try to find the last member

   if (!activeOrganizationId) {
    const lastMember = await db.query.members.findFirst({
     where: {
      userId: session.userId,
     },
     orderBy: (member, { desc }) => [desc(member.createdAt)],
    });

    if (!!lastMember?.organizationId) {
     activeOrganizationId = lastMember.organizationId;
    }
   }

   // Permissions Mapping
   const userMemberships = await db.query.members.findMany({
    where: {
     userId: session.userId,
    },
    columns: { organizationId: true, role: true },
   });

   if (userMemberships.length > 0) {
    for (const membership of userMemberships) {
     if (!membership.role) continue;
     const { data: orgPermissions } = await getMemberPermissions({
      organizationId: membership.organizationId,
      member: membership,
     });

     if (
      orgPermissions?.permissions &&
      Object.keys(orgPermissions?.permissions).length > 0
     ) {
      permissions[membership.organizationId] = orgPermissions?.permissions;
     }
    }
   }

   return {
    session: {
     ...session,
     activeOrganizationId,
     permissions,
    },
    user,
   };
  }),
  organization({
   ac,
   roles: {
    owner: ownerRole,
   },
   dynamicAccessControl: {
    enabled: true,
   },
   sendInvitationEmail: async ({ id, email, inviter, organization, role }) => {
    const inviteLink = `${API_PATHS.acceptInvitation}?id=${id}`;
    await safeAction(async () => {
     await fetch(API_PATHS.sendInvitationEmail, {
      method: "POST",
      body: JSON.stringify({
       id,
       email,
       inviter,
       organization,
       role,
       inviteLink,
      }),
     });
    });
   },
   organizationHooks: {},
  }),
  twoFactor({
   backupCodeOptions: {
    length: 8,
   },
   otpOptions: {
    sendOTP: async ({ user, otp }, ctx) => {
     await safeAction(async () => {
      await fetch(API_PATHS.send2FAOtpEmail, {
       method: "POST",
       body: JSON.stringify({ user, otp }),
      });
     });
    },
   },
  }),
  captcha({
   provider: "cloudflare-turnstile", // or google-recaptcha, hcaptcha, captchafox
   secretKey: process.env.TURNSTILE_SECRET_KEY!,
  }),
  nextCookies(),
 ],

 emailVerification: {
  sendVerificationEmail: async ({ user, url, token }, request) => {
   await safeAction(async () => {
    await fetch(API_PATHS.verifyEmail, {
     method: "POST",
     body: JSON.stringify({ user, url, token }),
    });
   });
  },
  sendOnSignUp: true,
  autoSignInAfterVerification: true,
 },
});

export type Session = typeof auth.$Infer.Session.session & {
 permissions: Record<string, Record<string, string[]>>;
 activeOrganizationId?: string | null;
};
export type User = Omit<typeof auth.$Infer.Session.user, "preferences"> & {
 preferences?: UserPreferences | null;
};
