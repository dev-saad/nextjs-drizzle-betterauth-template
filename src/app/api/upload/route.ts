import { getSession } from "@/actions/server/session.controllers";
import { r2Client } from "@/lib/r2-client";
import {
 generateStorageKey,
 MAX_ORG_LOGO_SIZE,
 MAX_USER_IMAGE_SIZE,
 r2MetadataSchema,
 R2Routes,
 StoragePaths,
} from "@/lib/storage/config";
import { route, type Router } from "@better-upload/server";
import { toRouteHandler } from "@better-upload/server/adapters/next";

const router: Router = {
 client: r2Client,
 bucketName: process.env.CLOUDFLARE_BUCKET_NAME!,
 routes: {
  [R2Routes.organizationLogo]: route({
   fileTypes: ["image/*"],
   maxFileSize: MAX_ORG_LOGO_SIZE, // 2MB
   clientMetadataSchema: r2MetadataSchema.shape[R2Routes.organizationLogo],
   onBeforeUpload: async ({ file, clientMetadata }) => {
    const session = await getSession();
    if (!session) {
     throw new Error("Unauthorized");
    }
    return {
     objectInfo: {
      key: generateStorageKey(
       StoragePaths.ORG_LOGO(clientMetadata.orgId),
       file.name
      ),
     },
    };
   },
  }),
  [R2Routes.userImage]: route({
   fileTypes: ["image/*"],
   maxFileSize: MAX_USER_IMAGE_SIZE, // 2MB
   onBeforeUpload: async ({ file }) => {
    const session = await getSession();
    if (!session) {
     throw new Error("Unauthorized");
    }
    return {
     objectInfo: {
      key: generateStorageKey(
       StoragePaths.USER_AVATAR(session.userId),
       file.name
      ),
     },
    };
   },
  }),
 },
};

export const { POST } = toRouteHandler(router);
