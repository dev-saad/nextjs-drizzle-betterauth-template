"use client";

import { withForm } from "@/components/global/form";
import { FieldGroup } from "@/components/ui/field";
import { usePhoneExists } from "@/features/auth/hooks/useExists";
import { authClient } from "@/lib/auth/auth.client.config";
import { phoneSchema } from "@/lib/global.schema";
import { User2 } from "lucide-react";
import { onboardingFormOptions } from "../../form-config";

const PersonalInfoStep = withForm({
 ...onboardingFormOptions,
 render: function Render({ form }) {
  const { checkPhoneExists, Icon, color } = usePhoneExists();
  const { data: session } = authClient.useSession();

  return (
   <FieldGroup>
    <form.AppField name="user.name">
     {(field) => (
      <field.InputField
       label="Name"
       placeholder="Enter your name"
       AddonLeft={<User2 />}
      />
     )}
    </form.AppField>
    <form.AppField
     name="user.phone"
     validators={{
      onChangeAsync: async ({ value }) => {
       const exists =
        session?.user?.phone === value ? false : await checkPhoneExists(value);
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
        Icon={isFormatValid ? Icon && <Icon className={color} /> : undefined}
       />
      );
     }}
    </form.AppField>
   </FieldGroup>
  );
 },
});

export default PersonalInfoStep;
