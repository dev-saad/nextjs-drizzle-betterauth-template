"use server";

import { getSession } from "@/actions/server/session.controllers";
import { safeLogAction } from "@/lib/utils/safe-action";
import { deleteObject, putObject } from "@better-upload/server/helpers";
import { z } from "zod";
import { r2Client } from "../r2-client";
import { STORAGE_BUCKET } from "./config";

const deleteFileSchema = z.object({
 key: z.string().min(1),
});

export const deleteFile = safeLogAction({
 options: { schema: deleteFileSchema },
 handler: async ({ key }) => {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const isUserFile = key.startsWith(`users/${session.userId}/`);

  if (!isUserFile) {
   console.warn(
    `[Audit] User ${session.userId} deleting potential shared file: ${key}`,
   );
  }

  await deleteObject(r2Client, {
   bucket: STORAGE_BUCKET,
   key: key,
  });
 },
});

const uploadFileSchema = z.object({
 file: z.instanceof(File),
 key: z.string(),
 contentType: z.string().optional(),
 cleanup: z
  .object({
   previousKey: z.string().nullable().optional(),
  })
  .optional(),
});

export const uploadFile = safeLogAction({
 options: {
  schema: uploadFileSchema,
 },
 handler: async (input) => {
  const { file, key, contentType } = input;

  await putObject(r2Client, {
   bucket: STORAGE_BUCKET,
   key: key,
   body: file,
   contentType: contentType || file.type,
  }).then((res) => {
   if (input.cleanup?.previousKey) {
    deleteFile({
     key: input.cleanup.previousKey,
    });
   }
  });

  return {
   data: { key },
  };
 },
});
