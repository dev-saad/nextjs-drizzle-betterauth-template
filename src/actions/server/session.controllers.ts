"use server";

import { auth, Session } from "@/lib/auth/auth.config";
import { safeAction, safeLogAction } from "@/lib/utils/safe-action";
import { headers } from "next/headers";
import { cache } from "react";
import z from "zod";

export const getFullSession = cache(async () => {
 return await auth.api.getSession({
  headers: await headers(),
  returnHeaders: true,
 });
});

export const getSession = cache(async () => {
 const session = await getFullSession();
 return session?.response?.session;
});

export const getUserSessionList = cache(async () => {
 return await safeAction(async () => {
  const sessions = await auth.api.listSessions({
   headers: await headers(),
  });
  return sessions as Session[];
 });
});

export const revokeSession = safeLogAction({
 options: {
  actionName: "REVOKE",
  entityName: "SESSION",
  schema: z.object({
   token: z.string(),
  }),
 },
 handler: async (input) => {
  return await auth.api.revokeSession({
   body: {
    token: input.token,
   },
   headers: await headers(),
  });
 },
});
