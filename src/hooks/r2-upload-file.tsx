"use client";

import type { R2MetadataSchemaType, R2RoutesType } from "@/lib/storage/config";
import { safeAction } from "@/lib/utils/safe-action";
import { useUploadFile, useUploadFiles } from "@better-upload/client";

/**
 * Helper to determine if metadata is required
 */
type UploadOptions<TRoute extends R2RoutesType> = {
 onUploadProgress?: (progress: number) => void;
} & (Record<string, never> extends R2MetadataSchemaType[TRoute]
 ? { metadata?: R2MetadataSchemaType[TRoute] }
 : { metadata: R2MetadataSchemaType[TRoute] });

/**
 * STRONGLY TYPED SINGLE UPLOAD
 * Usage: const { upload } = useR2Upload("userImage");
 */
export const useR2Upload = <TRoute extends R2RoutesType>(route: TRoute) => {
 const { upload: baseUpload, ...rest } = useUploadFile({
  route,
 });

 // We wrap the upload function to enforce YOUR metadata types
 const upload = async (file: File, options?: UploadOptions<TRoute>) => {
  return await safeAction(async () => {
   return await baseUpload(file, options);
  });
 };

 return { upload, ...rest };
};

/**
 * STRONGLY TYPED MULTI UPLOAD
 * Usage: const { upload } = useR2Uploads("organizationDocuments");
 */
export const useR2Uploads = <TRoute extends R2RoutesType>(route: TRoute) => {
 const { upload: baseUpload, ...rest } = useUploadFiles({
  route,
 });

 const upload = async (files: File[], options?: UploadOptions<TRoute>) => {
  return await safeAction(async () => {
   return await baseUpload(files, options);
  });
 };

 return { upload, ...rest };
};
