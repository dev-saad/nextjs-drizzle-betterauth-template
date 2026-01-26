"use client";

import { verify2faByMethod } from "@/actions/server/auth.controllers";
import { useAppForm } from "@/components/global/form";
import { buttonVariants } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { QueryValuesType, ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { twoFactorVerificationFormSchema } from "../schema";
import AuthHeader from "./AuthHeader";

export default function TwoFactorVerificationForm({
 isBetterAuth2FACookie,
 method,
}: {
 isBetterAuth2FACookie: boolean;
 method: QueryValuesType["twoFactorMethods"][number];
}) {
 const router = useRouter();
 const searchParams = useSearchParams();
 const redirectTo = searchParams.get("redirectTo");
 const [error, setError] = useState<string | null>(null);

 const form = useAppForm({
  defaultValues: {
   code: "",
   trustDevice: false,
  },
  validators: {
   onChange: twoFactorVerificationFormSchema,
  },
  onSubmit: async ({ value }) => {
   if (!isBetterAuth2FACookie) {
    toast.error("Your two-factor authentication time has expired");
    router.push(ROUTES.SIGN_IN);
    return;
   }
   const { success, error } = await verify2faByMethod({
    code: value.code,
    trustDevice: value.trustDevice,
    method,
   });
   if (success) {
    toast.success("Two-factor authentication successful!");
    form.reset();
    router.push(((redirectTo as string) ?? ROUTES.ORGANIZATION.ROOT) as Route);
   } else {
    form.resetField("code");
    setError(error || "Invalid code");
    toast.error(error || "Invalid code");
   }
  },
 });

 return (
  <>
   <AuthHeader
    title="Two-Factor Authentication"
    description={
     method === "email"
      ? "Enter the code from your email."
      : method === "backup"
        ? "Enter your backup code. That you received when you enabled two-factor authentication."
        : "Enter the code from your authenticator app."
    }
   />
   <CardContent>
    <form
     onSubmit={(e) => {
      e.preventDefault();
      form.handleSubmit(e);
     }}>
     <FieldGroup className="items-center">
      <form.AppField name="code">
       {(field) => (
        <div className="flex flex-col gap-2 items-center">
         <field.InputField
          type="otp"
          otpLength={method === "backup" ? 8 : 6}
          onComplete={form.handleSubmit}
          containerClassName="w-fit flex-wrap"
          pattern={REGEXP_ONLY_DIGITS}
         />
         <FieldError>{error}</FieldError>
        </div>
       )}
      </form.AppField>
      <div className="flex w-full justify-between">
       <form.AppField name="trustDevice">
        {(field) => <field.CheckboxField label="Trust this device" />}
       </form.AppField>
       <Link
        href={ROUTES.TWO_FACTOR_OPTIONS}
        className={cn(buttonVariants({ variant: "link", size: "sm" }), "px-0")}>
        Try another method
       </Link>
      </div>
      <form.AppForm>
       <form.SubmitButton className="w-full">Verify</form.SubmitButton>
      </form.AppForm>
     </FieldGroup>
    </form>
   </CardContent>
  </>
 );
}
