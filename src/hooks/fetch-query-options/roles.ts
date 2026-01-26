import { createRoleSchema } from "@/actions/schemas/organization";
import {
 createRole,
 getRolesList,
} from "@/actions/server/organization.controllers";
import { toast } from "sonner";
import z from "zod";

export const rolesQueryOptions = {
 tags: ["roles"],
 infiniteList: ({
  orgId,
  search,
  limit = 10,
 }: {
  orgId: string;
  search?: string;
  limit?: number;
 }) => ({
  queryFn: async ({ pageParam = 1 }: { pageParam?: unknown }) => {
   const { data } = await getRolesList({
    organizationId: orgId,
    filters: {
     page: pageParam as number,
     limit: limit,
     search,
    },
   });

   if (!data) throw new Error("Failed to fetch roles");
   return data;
  },
 }),

 create: (orgId: string) => ({
  mutationFn: async (
   data: Omit<z.infer<typeof createRoleSchema>, "organizationId">,
  ) => {
   const { error, data: roleData } = await createRole({
    ...data,
    organizationId: orgId,
   });
   if (error) {
    throw new Error(error);
   }
   return roleData;
  },
  onSuccess: () => {
   toast.success("Role created successfully");
   // We might need a way to invalidate cache if we aren't using queryClient
   // But for now, keeping it simple as per request.
  },
 }),
};
