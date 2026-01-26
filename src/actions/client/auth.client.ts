import { authClient } from "@/lib/auth/auth.client.config";
import { APP_URL } from "@/lib/constants/config";
import { ROUTES } from "@/lib/constants/routes";
import { SocialProvider } from "better-auth/social-providers";

export const signInWithGoogle = async ({ signUp }: { signUp?: boolean }) => {
 await authClient.signIn.social({
  provider: "google",
  callbackURL: `${APP_URL}${ROUTES.ORGANIZATION.ROOT}`,
  requestSignUp: signUp ?? false,
  newUserCallbackURL: ROUTES.ONBOARDING,
 });
};

export const signInSocial = async ({
 provider,
 signUp,
}: {
 provider: SocialProvider;
 signUp?: boolean;
}) => {
 await authClient.signIn.social({
  provider: provider,
  callbackURL: `${APP_URL}${ROUTES.ORGANIZATION.ROOT}`,
  requestSignUp: signUp ?? false,
  newUserCallbackURL: ROUTES.ONBOARDING,
 });
};
