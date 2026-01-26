import { getRolesList } from "@/actions/server/organization.controllers";
import RoleList from "@/features/organization/settings/components/teams-roles/roles/RoleList";
import { QUERY_KEYS } from "@/lib/constants/routes";
import { parseDateRange } from "@/lib/utils";

const RolesPage = async ({
 params,
 searchParams,
}: {
 params: Promise<{ orgId: string }>;
 searchParams: Promise<{
  [QUERY_KEYS.limit]: string;
  [QUERY_KEYS.page]: string;
  [QUERY_KEYS.search]: string;
  [QUERY_KEYS.permissions]: string;
  [QUERY_KEYS.createdAt]: string;
 }>;
}) => {
 const { orgId } = await params;
 const { limit, page, search, permissions, createdAt } = await searchParams;

 const {
  data: roles,
  error: rolesError,
  success: rolesSuccess,
 } = await getRolesList({
  organizationId: orgId,
  filters: {
   limit: limit ? parseInt(limit) : undefined,
   page: page ? parseInt(page) : 1,
   search: search || "",
   permissions,
   createdAt: parseDateRange(createdAt),
  },
 });

 if (!rolesSuccess || rolesError) console.log("rolesError:-", rolesError);

 return <RoleList roles={roles} />;
};

export default RolesPage;
