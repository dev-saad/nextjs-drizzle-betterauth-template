"use server";

import {
 additionalUserUpdateSchema,
 userUpdateSchema,
} from "@/actions/schemas/user";
import { auth, User } from "@/lib/auth/auth.config";
import { db } from "@/lib/drizzle/db";
import { userAdditional } from "@/lib/drizzle/schemas/auth.schema";
import { uploadFile } from "@/lib/storage/actions";
import { generateStorageKey, StoragePaths } from "@/lib/storage/config";
import { getChangedValues } from "@/lib/utils/get-changed-values";
import { safeAction, safeLogAction } from "@/lib/utils/safe-action";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { cache } from "react";
import { getFullSession, getSession } from "./session.controllers";

export const getUser = cache(async () => {
 const session = await getFullSession();
 return session?.response?.user as User;
});

export const requireUser = cache(async () => {
 const session = await getSession();
 return session;
});

export const getUserAccounts = cache(async () => {
 return await safeAction(async () => {
  const user = await auth.api.listUserAccounts({
   headers: await headers(),
  });

  return user;
 });
});

export type UserAccountsReturnType = ReturnType<typeof getUserAccounts>;
export type UserAccountsType = Awaited<UserAccountsReturnType>["data"];

export const updateUser = safeLogAction({
 options: {
  actionName: "UPDATE",
  entityName: "USER",
  schema: userUpdateSchema,
 },
 handler: async (parsedInput, ctx) => {
  // 1. GET OLD DATA (From Context - Zero Extra DB Calls!)
  const existingUser = ctx?.user;

  if (!existingUser) {
   throw new Error("Unauthorized");
  }

  // 2. CHECK FOR CHANGES
  const changes = getChangedValues(parsedInput, existingUser);

  if (Object.keys(changes).length === 0) {
   return {
    data: existingUser,
    status: "unchanged", // <--- Clean status return
   };
  }

  // 2.5. HANDLE FILE UPLOAD
  if (changes.image && changes.image instanceof File) {
   const { data, success, error } = await uploadFile({
    file: changes.image,
    key: generateStorageKey(
     StoragePaths.USER_AVATAR(ctx?.userId),
     changes.image.name,
    ),
    cleanup: {
     previousKey: existingUser.image,
    },
   });

   if (!data || !success || error) {
    throw new Error(`File upload failed: ${error}`);
   }

   changes.image = data.key;
  }

  // 3. PERFORM UPDATE
  const updatedUser = await auth.api.updateUser({
   body: {
    ...changes,
   },
   headers: await headers(),
  });

  // 4. RETURN FOR LOGGING
  return {
   data: updatedUser,
   status: "updated",
   entityId: ctx?.userId,
   previousState: existingUser,
  };
 },
});

export const upsertUserAdditional = safeLogAction({
 options: {
  actionName: "UPDATE",
  entityName: "USER",
  schema: additionalUserUpdateSchema,
 },
 handler: async (input, ctx) => {
  const userId = ctx?.userId;
  if (!userId) throw new Error("Unauthorized");

  // 1. Fetch Existing Data
  const existing = await db.query.userAdditional.findFirst({
   where: { userId },
  });

  // 2. CHECK FOR CHANGES
  if (existing) {
   const changes = getChangedValues(input, existing);

   if (Object.keys(changes).length === 0) {
    return {
     data: { success: true },
     status: "unchanged", // <--- Clean status return
    };
   }
  }

  // 3. Perform Update
  if (existing) {
   await db
    .update(userAdditional)
    .set({
     ...input,
     updatedAt: new Date(),
    })
    .where(eq(userAdditional.userId, userId));
  } else {
   await db.insert(userAdditional).values({
    ...input,
    userId,
   });
  }

  // 4. Return Success
  return {
   data: { success: true },
   status: "changed",
   entityId: userId,
   previousState: existing,
  };
 },
});

export const getUserWithAdditional = cache(async () => {
 return await safeAction(async () => {
  const session = await getSession();

  if (!session) {
   return null;
  }

  const userId = session.userId;
  const user = await getUser();

  const additional = await db.query.userAdditional.findFirst({
   where: {
    userId,
   },
  });

  return {
   ...user,
   ...additional,
  };
 });
});

export const getUserAdditional = cache(async () => {
 return await safeAction(async () => {
  const session = await getSession();

  if (!session) {
   return null;
  }

  const userId = session.userId;

  const additional = await db.query.userAdditional.findFirst({
   where: {
    userId,
   },
  });

  return additional;
 });
});

export type UserAdditionalReturnType = ReturnType<typeof getUserAdditional>;
export type UserAdditionalType = Awaited<UserAdditionalReturnType>["data"];

export type UserWithAdditionalReturnType = ReturnType<
 typeof getUserWithAdditional
>;
export type UserWithAdditionalType =
 Awaited<UserWithAdditionalReturnType>["data"];
