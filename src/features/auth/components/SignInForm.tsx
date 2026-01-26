"use client";

import { signIn } from "@/actions/server/auth.controllers";
import ErrorAlert from "@/components/global/ErrorAlert";
import { useAppForm } from "@/components/global/form";
import SocialAuth from "@/components/global/social-auth";
import { buttonVariants } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
 Field,
 FieldDescription,
 FieldGroup,
 FieldSeparator,
} from "@/components/ui/field";
import API_PATHS from "@/lib/constants/api-paths";
import { APP_URL } from "@/lib/constants/config";
import { QUERY_KEYS, QUERY_VALUES, ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";
import { KeyRoundIcon, MailIcon } from "lucide-react";
import { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { signInFormSchema } from "../schema";
import AuthHeader from "./AuthHeader";

export function SignInForm() {
 const [signInError, setSignInError] = useState("");
 const searchParams = useSearchParams();
 const router = useRouter();
 const redirectTo = (searchParams.get("redirectTo") as Route) ?? undefined;

 const form = useAppForm({
  defaultValues: {
   email: "",
   password: "",
   rememberMe: false,
   token: "",
  },
  validators: {
   onChange: signInFormSchema,
  },

  onSubmit: async ({ value }) => {
   const { success, error, data } = await signIn({
    email: value.email,
    password: value.password,
    rememberMe: value.rememberMe,
   });
   if (success && data) {
    if ("twoFactorRedirect" in data) {
     router.push(
      `${ROUTES.TWO_FACTOR_VERIFICATION}?${QUERY_KEYS.method}=${QUERY_VALUES.twoFactorMethods[0]}` as Route,
     );
     return;
    }
    toast.success("Sign in successful!");
    router.push(redirectTo ?? ROUTES.ORGANIZATION.ROOT);
   } else {
    toast.error(`Error signing in: ${error}`);
    error && setSignInError(error);
   }
  },
 });
 return (
  <>
   <AuthHeader
    title="Sign into your account"
    description="Sign in to get started!"
   />
   <CardContent>
    <FieldGroup>
     <Field>
      <SocialAuth mode="signin" />
     </Field>
     <FieldSeparator>or continue with</FieldSeparator>
     {signInError && <ErrorAlert message={signInError} />}
     <form
      id="sign-in-form"
      onSubmit={(e) => {
       e.preventDefault();
       form.handleSubmit();
      }}>
      <FieldGroup>
       <form.AppField name="email">
        {(field) => (
         <field.InputField
          label="Email"
          type="email"
          placeholder="Your email"
          AddonLeft={<MailIcon />}
         />
        )}
       </form.AppField>
       <form.AppField name="password">
        {(field) => (
         <field.InputField
          label="Password"
          type="password"
          placeholder="Your password"
          AddonLeft={<KeyRoundIcon />}
         />
        )}
       </form.AppField>
       <div className="flex items-center justify-between">
        <form.AppField name="rememberMe">
         {(field) => <field.CheckboxField label="Remember me" />}
        </form.AppField>
        <Link
         href={ROUTES.REQUEST_RESET_PASSWORD}
         className={cn(buttonVariants({ variant: "link" }))}>
         Forgot password?
        </Link>
       </div>
       <form.AppField name="token">
        {(field) => <field.TurnstileField />}
       </form.AppField>
       <form.AppForm>
        <Field>
         <form.SubmitButton>Sign in</form.SubmitButton>
        </Field>
       </form.AppForm>
       <FieldDescription className="text-center">
        Don&apos;t have an account?{" "}
        <Link
         href={{
          pathname: ROUTES.SIGN_UP,
          search:
           redirectTo === API_PATHS.acceptInvitation.slice(APP_URL.length)
            ? `${QUERY_KEYS.redirectTo}=${redirectTo}`
            : "",
         }}>
         Sign up
        </Link>
       </FieldDescription>
      </FieldGroup>
     </form>
    </FieldGroup>
   </CardContent>
  </>
 );
}
