import { actionsEnum, auditStatusEnum, entityTypesEnum } from "@/lib/drizzle";
import z from "zod";

export const logsSchema = z.object({
 actions: z.array(z.enum(actionsEnum.enumValues)).optional(),
 entityTypes: z.array(z.enum(entityTypesEnum.enumValues)).optional(),
 entityId: z.string().optional(),
 page: z.number().default(1),
 limit: z.number().default(20),
 search: z.string().optional(),
 status: z.array(z.enum(auditStatusEnum.enumValues)).optional(),
 dateRange: z
  .object({
   from: z.date().optional(),
   to: z.date().optional(),
  })
  .optional(),
});
