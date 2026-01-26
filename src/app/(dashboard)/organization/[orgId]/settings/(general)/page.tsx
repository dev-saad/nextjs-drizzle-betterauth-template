import { getOrganization } from "@/actions/server/organization.controllers";
import GeneralSettings from "@/features/organization/settings/components/general-settings/GeneralSettings";

const OrgGeneralSettingPage = async ({
 params,
}: {
 params: Promise<{ orgId: string }>;
}) => {
 const { orgId } = await params;
 const { data } = await getOrganization({
  organizationId: orgId,
  withSettings: true,
 });
 return <GeneralSettings org={data} />;
};

export default OrgGeneralSettingPage;
