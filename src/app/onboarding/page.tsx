import { getSession } from "@/actions/server/session.controllers";
import { getUser } from "@/actions/server/user.controllers";
import OnboardingSteps from "@/features/onboarding/components/OnboardingSteps";
import {
 QUERY_KEYS,
 QUERY_VALUES,
 ROUTE_BUILDER,
 ROUTES,
} from "@/lib/constants/routes";
import { Route } from "next";
import { redirect } from "next/navigation";

const OnboardingPage = async ({
 searchParams,
}: {
 searchParams: Promise<{ [key: string]: any }>;
}) => {
 const { step } = await searchParams;
 const session = await getSession();
 const user = await getUser();
 const orgId = session?.activeOrganizationId;

 if (orgId) {
  redirect(
   ROUTE_BUILDER.organization(orgId, ROUTES.ORGANIZATION.DEFAULT) as Route,
  );
 }

 if (!step || !QUERY_VALUES.onboardingSteps.includes(step)) {
  redirect(
   `${ROUTES.ONBOARDING}?${QUERY_KEYS.step}=${QUERY_VALUES.onboardingSteps[0]}`,
  );
 }

 if (!session || !user) {
  redirect(ROUTES.SIGN_IN);
 }

 return <OnboardingSteps user={user} />;
};

export default OnboardingPage;
