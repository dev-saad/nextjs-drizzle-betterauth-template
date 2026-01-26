import { getOrganizationsList } from "@/actions/server/organization.controllers";
import { getSession } from "@/actions/server/session.controllers";
import { DashboardContent } from "@/components/global/Dashboard";
import { ROUTE_BUILDER, ROUTES } from "@/lib/constants/routes";
import { redirect } from "next/navigation";

const OrganizationLayout = async ({
 children,
 header,
 params,
}: {
 children: React.ReactNode;
 header: React.ReactNode;
 params: Promise<{ orgId: string }>;
}) => {
 const { orgId } = await params;
 const session = await getSession();
 const { data: orgs } = await getOrganizationsList();
 const hasAccess = orgs?.find((org) => org.id === orgId);

 if (!hasAccess) {
  if (!session?.activeOrganizationId) {
   redirect(ROUTES.ORGANIZATION.ROOT);
  }
  redirect(
   ROUTE_BUILDER.organization(
    session?.activeOrganizationId,
    ROUTES.ORGANIZATION.DEFAULT,
   ),
  );
 }

 return (
  <DashboardContent>
   {header}
   {children}
  </DashboardContent>
 );
};

export default OrganizationLayout;
