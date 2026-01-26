import TwoFactorVerificationOptions from "@/features/auth/components/TwoFactorVerificationOptions";
import { ROUTES } from "@/lib/constants/routes";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const TwoFactorOptions = async () => {
 const cookieStore = await cookies();
 const isBetterAuth2FACookie = cookieStore.get("better-auth.two_factor");
 if (!isBetterAuth2FACookie) {
  redirect(ROUTES.SIGN_IN);
 }
 return (
  <TwoFactorVerificationOptions
   isBetterAuth2FACookie={!!isBetterAuth2FACookie}
  />
 );
};

export default TwoFactorOptions;
