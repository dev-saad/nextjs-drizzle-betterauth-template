import { getSession } from "@/actions/server/session.controllers";
import { ROUTE_BUILDER, ROUTES } from "@/lib/constants/routes";
import { Route } from "next";
import { redirect } from "next/navigation";

export default async function HomePage() {
 const session = await getSession();

 if (!!session) {
  const orgId = session?.activeOrganizationId;
  if (!orgId) {
   redirect(ROUTES.ONBOARDING);
  }
  // Example: redirect to user's default organization
  redirect(
   ROUTE_BUILDER.organization(orgId, ROUTES.ORGANIZATION.DEFAULT) as Route,
  );
 }

 // If no session (just in case proxy missed it)
 redirect(ROUTES.SIGN_IN);
}
