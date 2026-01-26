"use client";

import { resetPassword } from "@/actions/server/auth.controllers";
import { useAppForm } from "@/components/global/form";
import { buttonVariants } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Field, FieldGroup } from "@/components/ui/field";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";
import { ArrowLeftToLineIcon, KeyRoundIcon } from "lucide-react";
import Link from "next/link";
import { redirect, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { resetPasswordFormSchema } from "../schema";
import AuthHeader from "./AuthHeader";

const ResetPassword = () => {
 const searchParams = useSearchParams();
 const token = searchParams.get("token");
 const error = searchParams.get("error");
 const invalidToken = error === "INVALID_TOKEN" || !token;

 const form = useAppForm({
  defaultValues: {
   password: "",
   confirmPassword: "",
  },
  validators: {
   onChange: resetPasswordFormSchema,
  },
  onSubmit: async ({ value }) => {
   if (token === null) return;
   const { success, error } = await resetPassword({
    token: token!,
    password: value.confirmPassword,
   });
   if (success) {
    toast.success("Password reset successfully");
    redirect(ROUTES.SIGN_IN);
   } else {
    toast.error(`Error resetting password: ${error}`);
   }
  },
 });
 return (
  <>
   <AuthHeader
    title={invalidToken ? "Invalid reset link" : "Reset Password"}
    description={
     invalidToken
      ? "The password reset link is invalid or has expired."
      : "Enter your new password to reset your account."
    }
   />
   <CardContent>
    {invalidToken ? (
     <Link
      href={ROUTES.SIGN_IN}
      className={cn(buttonVariants({ variant: "outline" }), "w-full mt-2")}>
      <ArrowLeftToLineIcon className="mr-2 h-4 w-4" />
      Back to login
     </Link>
    ) : (
     <form
      id="reset-password"
      onSubmit={(e) => {
       e.preventDefault();
       form.handleSubmit();
      }}>
      <FieldGroup>
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
       <form.AppField name="confirmPassword">
        {(field) => (
         <field.InputField
          label="Confirm password"
          type="password"
          placeholder="Confirm your password"
          AddonLeft={<KeyRoundIcon />}
         />
        )}
       </form.AppField>
       <form.AppForm>
        <Field>
         <form.SubmitButton>Reset Password</form.SubmitButton>
        </Field>
       </form.AppForm>
      </FieldGroup>
     </form>
    )}
   </CardContent>
  </>
 );
};

export default ResetPassword;
