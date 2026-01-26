"use client";

import { requestResetPassword } from "@/actions/server/auth.controllers";
import { useAppForm } from "@/components/global/form";
import { Button, buttonVariants } from "@/components/ui/button";
import { CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { useCooldownTimer } from "@/hooks/use-cooldown-timer";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";
import { ArrowLeftToLineIcon, MailIcon } from "lucide-react";
import * as m from "motion/react-m";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { requestResetPasswordFormSchema } from "../schema";
import AuthHeader from "./AuthHeader";

const RequestResetPassword = () => {
 const [emailSent, setEmailSent] = useState(false);
 const [submittedEmail, setSubmittedEmail] = useState("");
 const { isCooldown, startCooldown, resetCooldown, cooldown } =
  useCooldownTimer(60);

 const handleResend = async () => {
  if (isCooldown) return;

  const { success, error } = await requestResetPassword({
   email: submittedEmail,
  });
  if (success) {
   toast.success("Password reset link Resent successfully");
   resetCooldown();
  } else {
   toast.error(`Error resending password reset link: ${error}`);
  }
 };

 const form = useAppForm({
  defaultValues: {
   email: "",
  },
  validators: {
   onChange: requestResetPasswordFormSchema,
  },
  onSubmit: async ({ value }) => {
   const { success, error } = await requestResetPassword({
    email: value.email,
   });
   if (success) {
    toast.success("Password reset link sent successfully");
    setSubmittedEmail(value.email);
    setEmailSent(true);
    startCooldown();
   } else {
    toast.error(`Error resetting password: ${error}`);
   }
  },
 });

 if (emailSent) {
  return (
   <CardContent className="flex flex-col items-center justify-center pt-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
    <m.div
     initial={{ scale: 0.5, opacity: 0 }}
     animate={{ scale: 1, opacity: 1 }}
     transition={{ type: "spring", stiffness: 300, damping: 20 }}
     className="p-4 rounded-full bg-primary/10 mb-6 ring-4 ring-primary/5">
     <MailIcon className="h-12 w-12 text-primary" strokeWidth={1.5} />
    </m.div>

    <CardTitle className="text-xl text-center mb-2">Check your email</CardTitle>

    <CardDescription className="text-center mb-8 max-w-sm">
     We have sent a password reset link to <br />
     <span className="font-medium text-foreground">{submittedEmail}</span>
    </CardDescription>

    <Link
     href={`mailto:${submittedEmail}`}
     target="_blank"
     className={cn(buttonVariants(), "w-full mb-6 group")}>
     Open Email App
    </Link>

    <div className="flex flex-col gap-4 w-full">
     <FieldDescription className="text-center">
      Did not receive the email?{" "}
      <Button
       onClick={handleResend}
       disabled={isCooldown}
       variant="link"
       className="disabled:opacity-50 disabled:cursor-not-allowed">
       {isCooldown ? `Resend in ${cooldown}s` : "Click to resend"}
      </Button>
     </FieldDescription>

     <div className="relative">
      <div className="absolute inset-0 flex items-center">
       <span className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
       <span className="bg-background px-2 text-muted-foreground">Or</span>
      </div>
     </div>

     <Link
      href={ROUTES.SIGN_IN}
      className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
      <ArrowLeftToLineIcon className="mr-2 h-4 w-4" />
      Back to login
     </Link>
    </div>
   </CardContent>
  );
 }

 return (
  <>
   <AuthHeader
    title="Reset password"
    description="Enter your email address and we'll send you a link to reset your password"
   />
   <CardContent>
    <form
     id="reset-password-form"
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
         description="We'll send a password reset link to this email address"
        />
       )}
      </form.AppField>
      <form.AppForm>
       <Field>
        <form.SubmitButton>Reset password</form.SubmitButton>
       </Field>
      </form.AppForm>
     </FieldGroup>
    </form>
    <Link
     href={ROUTES.SIGN_IN}
     className={cn(buttonVariants({ variant: "ghost" }), "w-full mt-2")}>
     <ArrowLeftToLineIcon className="mr-2 h-4 w-4" />
     Back to login
    </Link>
   </CardContent>
  </>
 );
};

export default RequestResetPassword;
