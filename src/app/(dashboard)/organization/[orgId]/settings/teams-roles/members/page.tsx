import { getMembersList } from "@/actions/server/organization.controllers";
import MemberList from "@/features/organization/settings/components/teams-roles/members/MemberList";
import { QUERY_KEYS } from "@/lib/constants/routes";
import { parseDateRange } from "@/lib/utils";

const MembersPage = async ({
 params,
 searchParams,
}: {
 params: Promise<{ orgId: string }>;
 searchParams: Promise<{
  [QUERY_KEYS.limit]: string;
  [QUERY_KEYS.page]: string;
  [QUERY_KEYS.role]: string;
  [QUERY_KEYS.sort]: string;
  [QUERY_KEYS.createdAt]: string;
  [QUERY_KEYS.search]: string;
 }>;
}) => {
 const { orgId } = await params;
 const { limit, page, role, sort, createdAt, search } = await searchParams;
 // Check permissions
 const {
  data: members,
  error: membersError,
  success: membersSuccess,
 } = await getMembersList({
  organizationId: orgId,
  filters: {
   limit: limit ? Number(limit) : 10,
   page: page ? Number(page) : 1,
   role: role ? [role] : [],
   search: search,
   sort: sort ? JSON.parse(sort) : [],
   joinedAt: parseDateRange(createdAt),
  },
 });

 if (!membersSuccess || membersError)
  console.log("membersError:-", membersError);

 return <MemberList members={members} />;
};

export default MembersPage;
