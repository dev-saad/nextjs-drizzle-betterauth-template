"use client";

import { sendTwoFactorOTP } from "@/actions/server/auth.controllers";
import { useAppForm } from "@/components/global/form";
import { CardContent } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { QUERY_KEYS, QUERY_VALUES, ROUTES } from "@/lib/constants/routes";
import { Lock, Mail, Smartphone } from "lucide-react";
import { Route } from "next";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { twoFactorVerificationOptionsFormSchema } from "../schema";
import AuthHeader from "./AuthHeader";

const TwoFactorVerificationOptions = ({
 isBetterAuth2FACookie,
}: {
 isBetterAuth2FACookie: boolean;
}) => {
 const router = useRouter();
 const form = useAppForm({
  defaultValues: {
   method: QUERY_VALUES.twoFactorMethods[1] as string,
  },
  validators: {
   onDynamic: twoFactorVerificationOptionsFormSchema,
  },
  onSubmit: async ({ value }) => {
   if (!isBetterAuth2FACookie) {
    toast.error("Your two-factor authentication time has expired");
    router.push(ROUTES.SIGN_IN);
    return;
   }
   if (
    !value.method ||
    !QUERY_VALUES.twoFactorMethods.includes(
     value.method as (typeof QUERY_VALUES.twoFactorMethods)[number]
    )
   )
    return;
   if (value.method === "email") {
    const { error, success } = await sendTwoFactorOTP();
    if (error) {
     return toast.error(
      "There was an error sending the verification code. Try another method or try again later."
     );
    }
    if (success) {
     toast.success("Two-factor authentication code sent successfully");
    }
   }
   router.push(
    `${ROUTES.TWO_FACTOR_VERIFICATION}?${QUERY_KEYS.method}=${value.method}` as Route
   );
  },
 });
 return (
  <>
   <AuthHeader title="Two-Factor Authentication options" />
   <CardContent>
    <form
     name="two-factor-verification-options"
     onSubmit={(e) => {
      e.preventDefault();
      form.handleSubmit();
     }}>
     <FieldGroup>
      <form.AppField name="method">
       {(field) => (
        <field.RadioField
         label="Select your preferred method"
         variant="box"
         hideRadio
         options={[
          {
           value: "totp",
           label: "Authenticator App",
           description:
            "Use a mobile app like Google Authenticator or Authy to generate a verification code.",
           icon: <Smartphone size={24} />,
          },
          {
           value: "email",
           label: "Email",
           description: "Receive a verification code via your email address.",
           icon: <Mail size={24} />,
          },
          {
           value: "backup",
           label: "Backup Code",
           description: "Use a backup code to verify your identity.",
           icon: <Lock size={24} />,
          },
         ]}
        />
       )}
      </form.AppField>
      <form.AppForm>
       <form.SubmitButton>Select Method</form.SubmitButton>
      </form.AppForm>
     </FieldGroup>
    </form>
   </CardContent>
  </>
 );
};

export default TwoFactorVerificationOptions;
