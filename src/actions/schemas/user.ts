import { userAdditional, users } from "@/lib/drizzle";
import { MAX_USER_IMAGE_SIZE } from "@/lib/storage/config";
import { createImageSchema } from "@/lib/utils/zod";
import { createInsertSchema } from "drizzle-zod";

export const userInsertSchema = createInsertSchema(users);
export const additionalUserInsertSchema = createInsertSchema(userAdditional);

export const userUpdateSchema = userInsertSchema
 .extend({
  image: createImageSchema({
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
 })
 .pick({
  name: true,
  image: true,
  phone: true,
  preferences: true,
  activeOrganizationId: true,
 })
 .partial();

export const additionalUserUpdateSchema = additionalUserInsertSchema.partial();
