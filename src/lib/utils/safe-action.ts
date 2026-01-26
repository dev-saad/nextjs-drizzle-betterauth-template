import { getSession } from "@/actions/server/session.controllers";
import { getUser } from "@/actions/server/user.controllers";
import { db } from "@/lib/drizzle/db";
import {
 actionsEnum,
 auditLogs,
 entityTypesEnum,
} from "@/lib/drizzle/schemas/schema";
import { getAuditDiff } from "@/lib/utils/get-changed-values";
import { withRLS } from "@/lib/utils/with-rls";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { after } from "next/server"; // 👈 KEY PERFORMANCE IMPORT
import { cache } from "react";
import { z } from "zod";
import { PermissionsType } from "../constants/permissions";

// --- Types ---
type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export interface ActionResponse<T> {
 success: boolean;
 data?: T;
 error?: string;
 status?: "unchanged" | "changed";
}

type ActionContext = {
 userId: string;
 user: any;
 orgId: string;
 ip: string;
 userAgent: string;
 tx?: Transaction;
};

// --- Helpers ---
const getErrorMessage = (error: unknown): string => {
 if (typeof error === "string") return error;
 if (error instanceof z.ZodError)
  return error.issues[0]?.message || "Validation error";
 if (error instanceof Error) return error.message;
 return "An unexpected error occurred.";
};

export async function safeAction<T>(
 action: () => Promise<T>,
): Promise<ActionResponse<T>> {
 try {
  const data = await action();
  return { success: true, data };
 } catch (error) {
  return { success: false, error: getErrorMessage(error) };
 }
}

// * Warning: This "unstable_cache" is not a production ready solution. It is only for development purpose.
// const checkPermission = async (
//  permission: PermissionsType,
//  orgId: string,
//  userId: string,
//  headerList: Headers,
// ) => {
//  try {
//   const hasPermission = unstable_cache(
//    async () => {
//     return await auth.api.hasPermission({
//      headers: headerList,
//      body: { permission, organizationId: orgId },
//     });
//    },
//    [`permission-${permission}-${orgId}-${userId}`],
//    {
//     tags: [
//      `org-${orgId}-permissions`,
//      `user-${userId}-permissions`,
//      `org-${orgId}-user-${userId}-permissions`,
//     ],
//     revalidate: 60 * 1,
//    },
//   );
//   return {
//    data: hasPermission,
//    success: true,
//   };
//  } catch (error) {
//   return { success: false, error: getErrorMessage(error) };
//  }
// };
// --- MAIN WRAPPER ---

type ActionOptions<TSchema extends z.ZodType<any> | undefined> = {
 actionName?: (typeof actionsEnum.enumValues)[number];
 entityName?: (typeof entityTypesEnum.enumValues)[number];
 schema?: TSchema;
 ignoreAuth?: boolean;
 cache?: boolean;
 withRls?: boolean;
 requiredPermissions?: PermissionsType;
};

export function safeLogAction<
 TSchema extends z.ZodType<any> | undefined = undefined,
 TOutput = any,
>({
 options = {},
 handler,
}: {
 options?: ActionOptions<TSchema>;
 handler: (
  input: TSchema extends z.ZodType<any> ? z.infer<TSchema> : unknown,
  ctx: ActionContext | null,
 ) => Promise<
  | {
     data: TOutput;
     entityId?: string;
     metadata?: Record<string, any>;
     previousState?: Record<string, any>;
     userId?: string;
     orgId?: string;
     status?: "unchanged" | "changed";
    }
  | TOutput
 >;
}) {
 const action = async (
  ...args: TSchema extends z.ZodType<any>
   ? [input: z.infer<TSchema>]
   : [input?: unknown]
 ): Promise<ActionResponse<TOutput>> => {
  const startTime = performance.now();
  const rawInput = args[0];
  let ctx: ActionContext | null = null;
  let finalLogData: any = {}; // Store data for the 'after' block

  try {
   // 1. FAST AUTH: Fetch Headers, Session, and User in parallel
   const [headerList, session, user] = await Promise.all([
    headers(),
    options.ignoreAuth ? null : getSession(),
    options.ignoreAuth ? null : getUser(),
   ]);

   const ip = headerList.get("x-forwarded-for") || "unknown";
   const userAgent = headerList.get("user-agent") || "unknown";

   let userId = user?.id;
   let orgId = session?.activeOrganizationId ?? "";

   if (!options.ignoreAuth) {
    if (!user || !session) {
     return { success: false, error: "Unauthorized" };
    }
    ctx = { userId: userId!, user, orgId, ip, userAgent };
   }

   // 2. Input Validation
   let parsedInput = rawInput;
   if (options.schema) {
    const result = options.schema.safeParse(rawInput);
    if (!result.success) {
     return { success: false, error: result.error.issues[0].message };
    }
    parsedInput = result.data;
   }

   // 3. Org Override Logic
   if (parsedInput && typeof parsedInput === "object" && ctx) {
    const inputOrgId =
     (parsedInput as any).organizationId || (parsedInput as any).orgId;
    if (inputOrgId && typeof inputOrgId === "string") {
     ctx.orgId = inputOrgId;
     orgId = inputOrgId;
    }
   }

   // 4. Permission Check
   if (options.requiredPermissions && !options.ignoreAuth && ctx?.orgId) {
    const orgPermissions = session?.permissions?.[ctx.orgId];

    if (!orgPermissions) {
     return {
      success: false,
      error: "Unauthorized: No permissions found for this organization",
     };
    }

    const isAuthorized = Object.entries(options.requiredPermissions).every(
     ([resource, requiredActions]) => {
      const userActions = orgPermissions[resource];
      // Check if user has access to the resource
      if (!userActions || !Array.isArray(userActions)) return false;

      // Check if user has all required actions for the resource
      return (requiredActions as string[]).every((action) =>
       userActions.includes(action),
      );
     },
    );

    if (!isAuthorized) {
     return { success: false, error: "Unauthorized: Insufficient Permissions" };
    }
   }

   // 5. Execute Handler
   let result: any;
   if (options.withRls && ctx) {
    result = await withRLS(
     { userId: ctx.userId, orgId: ctx.orgId },
     async (tx) => {
      return await handler(parsedInput as any, { ...ctx!, tx });
     },
    );
   } else {
    result = await handler(parsedInput as any, ctx);
   }

   // 6. Normalize Result
   const isResultObject = result && typeof result === "object";
   const data = isResultObject && "data" in result ? result.data : result;
   const status =
    isResultObject && "status" in result ? result.status : undefined;

   // Prepare data for Background Logging
   finalLogData = {
    userId: userId ?? (isResultObject ? result.userId : null),
    orgId: orgId ?? (isResultObject ? result.orgId : null),
    entityId: isResultObject ? result.entityId : null,
    metadata: isResultObject ? result.metadata : {},
    previousState: isResultObject ? result.previousState : null,
    parsedInput,
    ip,
    userAgent,
    rawInput,
   };

   //  console.log("duration", performance.now() - startTime);
   // 7. RETURN IMMEDIATELY (Do not await logging)
   return { success: true, data, status };
  } catch (error) {
   const message = getErrorMessage(error);
   // Log error in background if needed
   return { success: false, error: message };
  } finally {
   // 8. BACKGROUND LOGGING (Fire and Forget)
   // This runs AFTER the response is sent to the user

   if (options.actionName && options.entityName) {
    after(async () => {
     try {
      // Recalculate diffs in background
      let metadata = finalLogData.metadata || {};
      if (finalLogData.previousState && finalLogData.parsedInput) {
       const changes = getAuditDiff(
        finalLogData.parsedInput,
        finalLogData.previousState,
       );
       if (Object.keys(changes).length > 0) {
        metadata = { ...metadata, changes, type: "UPDATE" };
       } else {
        metadata = { ...metadata, status: "unchanged" };
       }
      } else if (!finalLogData.previousState && finalLogData.parsedInput) {
       metadata = {
        ...metadata,
        values: finalLogData.parsedInput,
        type: "CREATE",
       };
      }

      const email =
       finalLogData.parsedInput?.email ||
       (typeof finalLogData.rawInput === "object"
        ? (finalLogData.rawInput as any)?.email
        : undefined);

      await db.insert(auditLogs).values({
       id: nanoid(),
       organizationId: finalLogData.orgId || null,
       userId: finalLogData.userId,
       action: options.actionName!,
       entityId: finalLogData.entityId || "unknown",
       entityType: options.entityName! || "GENERAL",
       status: "success",
       metadata: metadata,
       ipAddress: finalLogData.ip,
       userAgent: finalLogData.userAgent,
       email: email,
      });
     } catch (e) {
      console.error("Background Audit Log Failed:", e);
     }
    });
   }
  }
 };

 return options.cache ? cache(action) : action;
}
