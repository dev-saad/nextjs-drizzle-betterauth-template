import { getSession } from "@/actions/server/session.controllers";
import { ROUTE_BUILDER, ROUTES } from "@/lib/constants/routes";
import { Route } from "next";
import { redirect } from "next/navigation";

const OrganizationPage = async () => {
 const session = await getSession();
 if (!session) {
  redirect(ROUTES.SIGN_IN);
 }

 if (session?.activeOrganizationId) {
  redirect(
   ROUTE_BUILDER.organization(
    session?.activeOrganizationId,
    ROUTES.ORGANIZATION.DEFAULT,
   ) as Route,
  );
 } else {
  redirect(ROUTES.ONBOARDING);
 }
};

export default OrganizationPage;
