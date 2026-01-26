import TwoFactorVerificationForm from "@/features/auth/components/TwoFactorVerificationForm";
import { QUERY_VALUES, ROUTES } from "@/lib/constants/routes";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const TwoStepVerification = async ({
 searchParams,
}: {
 searchParams: Promise<{
  method: (typeof QUERY_VALUES.twoFactorMethods)[number];
 }>;
}) => {
 const cookieStore = await cookies();
 const isBetterAuth2FACookie = cookieStore.get("better-auth.two_factor");
 const { method } = await searchParams;
 if (!QUERY_VALUES.twoFactorMethods.includes(method)) {
  redirect(ROUTES.SIGN_IN);
 }
 return (
  <TwoFactorVerificationForm
   isBetterAuth2FACookie={!!isBetterAuth2FACookie}
   method={method}
  />
 );
};

export default TwoStepVerification;
