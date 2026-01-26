import { getUser } from "@/actions/server/user.controllers";
import TwoFactorSetupPage from "@/features/user/components/security/two-factor/TwoFactorSetupPage";

import { QUERY_KEYS, QUERY_VALUES, ROUTES } from "@/lib/constants/routes";
import { Route } from "next";
import { redirect } from "next/navigation";

export default async function Page({
 searchParams,
}: {
 searchParams: Promise<{ step: (typeof QUERY_VALUES.twoFactorSteps)[number] }>;
}) {
 const { step } = await searchParams;
 const user = await getUser();
 if (user?.twoFactorEnabled && step === QUERY_VALUES.twoFactorSteps[0]) {
  redirect(
   `${ROUTES.USER.TWO_FACTOR}?${QUERY_KEYS.step}=${QUERY_VALUES.twoFactorSteps[1]}` as Route,
  );
 }
 if (!step || !QUERY_VALUES.twoFactorSteps.includes(step)) {
  redirect(
   `${ROUTES.USER.TWO_FACTOR}?${QUERY_KEYS.step}=${QUERY_VALUES.twoFactorSteps[0]}` as Route,
  );
 }
 if (!user) {
  redirect(ROUTES.SIGN_IN);
 }
 return <TwoFactorSetupPage user={user} />;
}
