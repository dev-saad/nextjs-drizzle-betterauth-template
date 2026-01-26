"use server";

import { presignGetObject } from "@better-upload/server/helpers";
import { cache } from "react";
import { r2Client } from "./r2-client";
import { safeAction } from "./utils/safe-action";

export const getR2PresignedUrl = cache(async (key: string) => {
 return await safeAction(async () => {
  const data = await presignGetObject(r2Client, {
   bucket: process.env.CLOUDFLARE_BUCKET_NAME!,
   key,
   expiresIn: 60, // 1 day
  });
  return data;
 });
});
