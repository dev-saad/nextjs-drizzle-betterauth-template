"use client";

import { User } from "@/lib/auth/auth.config";
import { QUERY_KEYS, QUERY_VALUES, ROUTES } from "@/lib/constants/routes";
import { useTwoFactor } from "@/lib/context/two-factor-context";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import AuthRecoveryCodes from "./two-factor-steps/BackupCodes";
import TOTPStep from "./two-factor-steps/TOTPStep";

export default function TwoFactorSetupPage({ user }: { user: User }) {
 const { backupCodes, totpURI, setSetupData } = useTwoFactor();
 const searchParams = useSearchParams();
 const step = searchParams.get(QUERY_KEYS.step);

 useEffect(() => {
  if (step === QUERY_VALUES.twoFactorSteps[1] && !!backupCodes) {
   setSetupData({ backupCodes: [], totpURI: "" });
   redirect(ROUTES.USER.SECURITY);
  }
  if (
   !user.twoFactorEnabled &&
   step === QUERY_VALUES.twoFactorSteps[0] &&
   !totpURI
  ) {
   setSetupData({ backupCodes: [], totpURI: "" });
   redirect(ROUTES.USER.SECURITY);
  }
 }, []);

 return (
  <div className="container max-w-lg py-10 mx-auto">
   {step === QUERY_VALUES.twoFactorSteps[0] ? (
    <TOTPStep />
   ) : (
    <AuthRecoveryCodes codes={backupCodes} />
   )}
  </div>
 );
}
