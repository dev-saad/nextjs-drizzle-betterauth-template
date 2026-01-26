import { capitalize } from "lodash";
import { z } from "zod";

function unwrapSchema(schema: z.ZodType<any>): z.ZodType<any> {
 const anySchema = schema as any;
 const type = anySchema._def?.typeName || anySchema.type; // support internal typeName too

 if (
  type === "ZodOptional" ||
  type === "ZodNullable" ||
  type === "ZodDefault"
 ) {
  return unwrapSchema(anySchema.def.innerType);
 }

 if (type === "ZodEffects") {
  return unwrapSchema(anySchema._def.schema);
 }

 // Legacy/Different version checks (using string type if typeName is missing)
 if (type === "optional" || type === "nullable" || type === "default") {
  return unwrapSchema(anySchema.def.innerType);
 }

 if (type === "effects") {
  return unwrapSchema(anySchema._def.schema);
 }

 return schema;
}

function isSchemaOptional(schema: z.ZodType<any>): boolean {
 const anySchema = schema as any;
 const type = anySchema._def?.typeName || anySchema.type;

 if (type === "ZodOptional" || type === "optional") return true;
 if (type === "ZodDefault" || type === "default") return true;

 if (type === "ZodEffects" || type === "effects") {
  return isSchemaOptional(anySchema._def.schema);
 }

 return false;
}

export function isZodFieldRequired(
 schema: z.ZodType<any>,
 path: string,
): boolean {
 const parts = path.split(".");
 let currentSchema: z.ZodType<any> = schema;

 for (const part of parts) {
  // If the current parent is optional, the child is effectively optional/not required
  if (isSchemaOptional(currentSchema)) {
   return false;
  }

  // Unwrap to go deeper
  const unwrapped = unwrapSchema(currentSchema);
  const anyUnwrapped = unwrapped as any;
  const type = anyUnwrapped._def?.typeName || anyUnwrapped.type;

  if (type === "ZodObject" || type === "object") {
   if (anyUnwrapped.shape && part in anyUnwrapped.shape) {
    currentSchema = anyUnwrapped.shape[part];
   } else {
    return false; // Path not found
   }
  } else {
   return false; // Not an object, can't traverse
  }
 }

 const finalCheck = !isSchemaOptional(currentSchema);
 return finalCheck;
}

// Configuration Types
type ImageSchemaOptions = {
 required?: boolean;
 maxSizeBytes?: number;
 acceptedTypes?: string[];
 message?: string;
 removeRemoteStorageUrl?: boolean;
};

const DEFAULT_ACCEPTED_TYPES = [
 "image/jpeg",
 "image/jpg",
 "image/png",
 "image/webp",
];

export const createImageSchema = (options: ImageSchemaOptions = {}) => {
 const {
  required = false,
  maxSizeBytes = 2 * 1024 * 1024,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  message,
  removeRemoteStorageUrl = false,
 } = options;

 // 1. Valid File Object
 const fileSchema = z
  .instanceof(File, { message: "File is required" })
  .refine((file) => file.size <= maxSizeBytes, {
   message: `File size must be less than ${maxSizeBytes / 1024 / 1024}MB`,
  })
  .refine((file) => acceptedTypes.includes(file.type), {
   message: "Unsupported file format",
  });

 // 2. Valid URL String
 let urlSchema = z.string({ message: "Invalid image URL" });

 if (!removeRemoteStorageUrl) {
  // @ts-ignore - z.url() might be available in user's version
  urlSchema = z.url({ message: "Invalid image URL" });
 }

 // 3. The Logic
 return z
  .union([
   z.string(),
   z.instanceof(File),
   z.null(),
   z.undefined(),
   z.literal(""),
  ])
  .transform((val) => (val === "" ? null : val))
  .transform((val) => {
   if (removeRemoteStorageUrl && typeof val === "string") {
    const baseUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_BASE_URL?.replace(
     /\/$/,
     "",
    );
    if (baseUrl && val.includes(baseUrl)) {
     return val.replace(baseUrl, "").replace(/^\//, "");
    }
   }
   return val;
  })
  .pipe(
   z
    .union([urlSchema, fileSchema])
    .nullable()
    .optional()
    .superRefine((val, ctx) => {
     // If strictly required, check for null/undefined
     if (required && (val === null || val === undefined)) {
      ctx.addIssue({
       code: z.ZodIssueCode.custom,
       message: message || "Image is required",
      });
     }
    }),
  );
};

export const refineUrl = (val: string) => {
 if (!val) return val;
 if (/^https?:\/\//i.test(val)) {
  return val.replace(/\/$/, "");
 }
 return `https://${val.replace(/\/$/, "")}`;
};

const SOCIAL_PLATFORMS = {
 facebook: ["facebook.com"],
 instagram: ["instagram.com"],
 twitter: ["twitter.com", "x.com"],
 linkedin: ["linkedin.com"],
 github: ["github.com"],
 youtube: ["youtube.com", "youtu.be"],
} as const;

export type SocialPlatform = keyof typeof SOCIAL_PLATFORMS;

export const createUrlSchema = (options?: {
 social?: SocialPlatform;
 domains?: string[];
 message?: string;
 required?: boolean;
}) => {
 const {
  social,
  domains: customDomains,
  message,
  required = true,
 } = options || {};

 const domains = [
  ...(social ? SOCIAL_PLATFORMS[social] : []),
  ...(customDomains || []),
 ];

 const errorMessage =
  message || `${social ? `${capitalize(social)} url` : "URL"} is required`;

 const schema = z
  .string({ message: errorMessage })
  .trim()
  .transform(refineUrl)
  .superRefine((val, ctx) => {
   if (!val) {
    if (required) {
     ctx.addIssue({
      code: "custom",
      message: errorMessage,
     });
    }
    return;
   }

   try {
    const url = new URL(val);
    if (domains.length > 0) {
     const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
     // Simple domain check: valid if hostname ends with any of the allowed domains
     // This allows subdomains like m.facebook.com
     const isAllowed = domains.some(
      (d) =>
       hostname === d.toLowerCase() || hostname.endsWith(`.${d.toLowerCase()}`),
     );

     if (!isAllowed) {
      ctx.addIssue({
       code: "custom",
       message: message || "Invalid URL",
      });
     }
    }
   } catch {
    ctx.addIssue({
     code: "custom",
     message: message || "Invalid URL",
    });
   }
  });

 if (!required) {
  return schema.optional();
 }

 return schema;
};

export const DateRangeSchema = z.preprocess(
 (arg) => {
  // 1. If it's already an object (e.g. from code), leave it alone
  if (typeof arg === "object" && arg !== null) return arg;

  // 2. If it's a string "start,end" (e.g. from URL), parse it
  if (typeof arg === "string") {
   const [startStr, endStr] = arg.split(",");

   // Convert only if value exists, otherwise undefined
   const from = startStr ? new Date(Number(startStr)) : undefined;
   const to = endStr ? new Date(Number(endStr)) : undefined;

   return { from, to };
  }

  return undefined;
 },
 z.object({
  from: z.date().optional(),
  to: z.date().optional(),
 }),
);

// 1. Define the raw object shape (from the JSON)
const RawSortItemSchema = z.object({
 id: z.string(),
 desc: z.boolean(),
});

/**
 * SortSchema
 * * Input: JSON String `[{"id":"role","desc":true}]` OR Array `[{id: "role", desc: true}]`
 * Output: String Array `["role:desc"]`
 */
export const SortSchema = z.preprocess(
 // A. Preprocess: Parse JSON string if needed
 (arg) => {
  if (typeof arg === "string") {
   try {
    return JSON.parse(arg);
   } catch (e) {
    return []; // Fail safe
   }
  }
  return arg;
 },
 // B. Validate & Transform
 z
  .array(RawSortItemSchema)
  .optional()
  .default([])
  .transform((items) => {
   // C. Convert to ["id:asc", "id:desc"] format
   return items.map((item) => `${item.id}:${item.desc ? "desc" : "asc"}`);
  }),
);
