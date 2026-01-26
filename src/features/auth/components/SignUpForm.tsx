"use client";

import { signUp } from "@/actions/server/auth.controllers";
import { useAppForm } from "@/components/global/form";
import SocialAuth from "@/components/global/social-auth";
import { CardContent } from "@/components/ui/card";
import {
 Field,
 FieldDescription,
 FieldGroup,
 FieldSeparator,
} from "@/components/ui/field";
import { useEmailExits, usePhoneExists } from "@/features/auth/hooks/useExists";
import API_PATHS from "@/lib/constants/api-paths";
import { APP_URL } from "@/lib/constants/config";
import { QUERY_KEYS, ROUTES } from "@/lib/constants/routes";
import { emailSchema, phoneSchema } from "@/lib/global.schema";
import { KeyRoundIcon, Mail, User2 } from "lucide-react";
import { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { signUpFormSchema } from "../schema";
import AuthHeader from "./AuthHeader";

const SignUpForm = () => {
 const router = useRouter();
 const searchParams = useSearchParams();
 const redirectTo = (searchParams.get("redirectTo") as Route) ?? undefined;

 const form = useAppForm({
  defaultValues: {
   name: "",
   phone: "",
   email: "",
   password: "",
   confirmPassword: "",
  },
  validators: {
   onChange: signUpFormSchema,
  },
  onSubmit: async ({ value }) => {
   const { success, error } = await signUp({
    name: value.name,
    email: value.email,
    password: value.password,
    phone: value.phone,
   });
   if (success) {
    toast.success("Sign up successful! Please check your email.");
    const redirectTo = searchParams.get(QUERY_KEYS.redirectTo);
    router.push((redirectTo as Route) ?? ROUTES.ONBOARDING);
   } else {
    toast.error(`Sign up failed: ${error}`);
   }
  },
 });

 const {
  checkEmailExists,
  Icon: EmailIcon,
  color: emailColor,
 } = useEmailExits();
 const {
  checkPhoneExists,
  Icon: PhoneIcon,
  color: phoneColor,
 } = usePhoneExists();

 return (
  <>
   <AuthHeader
    title="Create an account"
    description="Sign up to get started!"
   />
   <CardContent>
    <FieldGroup>
     <Field>
      <SocialAuth mode="signup" />
     </Field>
     <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
      or continue with
     </FieldSeparator>
     <form
      id="sign-up-form"
      onSubmit={(e) => {
       e.preventDefault();
       form.handleSubmit();
      }}>
      <FieldGroup className="">
       <form.AppField name="name">
        {(field) => (
         <field.InputField
          label="Name"
          type="text"
          placeholder="Your full name"
          AddonLeft={<User2 />}
         />
        )}
       </form.AppField>
       <form.AppField
        name="email"
        validators={{
         onChangeAsync: async ({ value }) => {
          const exists = await checkEmailExists(value);
          return exists
           ? {
              message: "Email already in use",
              severity: "error",
              code: 1001,
             }
           : undefined;
         },
        }}>
        {(field) => {
         const isFormatValid = emailSchema.safeParse(field.state.value).success;
         return (
          <field.InputField
           label="Email"
           type="email"
           placeholder="Your email"
           AddonLeft={<Mail />}
           Icon={
            isFormatValid
             ? EmailIcon && <EmailIcon className={emailColor} />
             : undefined
           }
          />
         );
        }}
       </form.AppField>
       <form.AppField
        name="phone"
        validators={{
         onChangeAsync: async ({ value }) => {
          const exists = await checkPhoneExists(value);
          return exists
           ? {
              message: "Phone number already in use",
              severity: "error",
              code: 1001,
             }
           : undefined;
         },
        }}>
        {(field) => {
         const isFormatValid = phoneSchema.safeParse(field.state.value).success;
         return (
          <field.InputField
           label="Phone"
           type="tel"
           placeholder="Your phone number"
           AddonLeft={<Mail />}
           Icon={
            isFormatValid
             ? PhoneIcon && <PhoneIcon className={phoneColor} />
             : undefined
           }
          />
         );
        }}
       </form.AppField>
       <form.AppField name="password">
        {(field) => (
         <field.InputField
          label="Password"
          type="password"
          placeholder="Your password"
          autoComplete="new-password"
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
          autoComplete="new-password"
          AddonLeft={<KeyRoundIcon />}
         />
        )}
       </form.AppField>
       <form.AppForm>
        <Field className="mt-2">
         <form.SubmitButton>Sign up</form.SubmitButton>
        </Field>
       </form.AppForm>
       <FieldDescription className="text-center">
        Already have an account?{" "}
        <Link
         href={{
          pathname: ROUTES.SIGN_IN,
          search:
           redirectTo === API_PATHS.acceptInvitation.slice(APP_URL.length)
            ? `${QUERY_KEYS.redirectTo}=${redirectTo}`
            : "",
         }}>
         Sign in
        </Link>
       </FieldDescription>
      </FieldGroup>
     </form>
    </FieldGroup>
   </CardContent>
  </>
 );
};

export default SignUpForm;
