import { nanoid } from "nanoid";
import z from "zod";

export const STORAGE_BUCKET = process.env.CLOUDFLARE_BUCKET_NAME!;
export const MAX_USER_IMAGE_SIZE = 2 * 1024 * 1024;
export const MAX_ORG_LOGO_SIZE = 2 * 1024 * 1024;

/**
 * Enterprise Path Strategy:
 * {scope}/{scopeId}/{category}/{filename}
 */
export const StoragePaths = {
 // Organization Assets
 ORG_LOGO: (orgId: string) => `organizations/${orgId}/branding`,
 ORG_DOCS: (orgId: string) => `organizations/${orgId}/documents`,

 // User Assets
 USER_AVATAR: (userId: string) => `users/${userId}/profile`,
} as const;

/**
 * Generates a clean, collision-free key for R2
 */
export function generateStorageKey(
 pathPrefix: string,
 originalName: string
): string {
 const ext = originalName.split(".").pop();
 const cleanName = originalName.split(".")[0].replace(/[^a-zA-Z0-9]/g, "-");
 return `${pathPrefix}/${cleanName}-${nanoid(10)}.${ext}`;
}

export const R2Routes = {
 organizationLogo: "organizationLogo",
 userImage: "userImage",
} as const;

export const r2MetadataSchema = z.object({
 [R2Routes.organizationLogo]: z.object({
  orgId: z.string(),
 }),
 [R2Routes.userImage]: z.object({}),
});

export type R2RoutesType = (typeof R2Routes)[keyof typeof R2Routes];
export type R2MetadataSchemaType = z.infer<typeof r2MetadataSchema>;
