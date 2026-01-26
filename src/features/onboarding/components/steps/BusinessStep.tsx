"use client";

import { withForm } from "@/components/global/form";
import { FieldGroup } from "@/components/ui/field";
import {
 businessTypeOptions,
 categoryOptions,
} from "@/lib/utils/select-options";
import { Briefcase } from "lucide-react";
import { onboardingFormOptions } from "../../form-config";

const BusinessStep = withForm({
 ...onboardingFormOptions,
 render: function Render({ form }) {
  return (
   <FieldGroup>
    <form.AppField name="organization.settings.businessType">
     {(field) => (
      <field.SelectField
       label="Business Type"
       placeholder="Select your business type"
       options={businessTypeOptions}
      />
     )}
    </form.AppField>

    <form.AppField name="organization.settings.businessCategory">
     {(field) => (
      <field.ComboBoxField
       label="Business Category"
       placeholder="Enter your industry type"
       options={
        categoryOptions(
         form.state.values.organization?.settings?.businessType as string
        ) || []
       }
       disabled={!form.state.values.organization?.settings?.businessType}
       AddonLeft={<Briefcase className="size-4" />}
      />
     )}
    </form.AppField>

    <form.AppField name="organization.settings.businessWebsite">
     {(field) => (
      <field.InputField
       label="Website"
       placeholder="yourdomain.com"
       AddonLeft={"https://"}
       type="text"
      />
     )}
    </form.AppField>

    <form.AppField name="organization.settings.businessFacebookUrl">
     {(field) => (
      <field.InputField
       label="Facebook URL"
       placeholder="facebook.com/yourbusiness"
       AddonLeft={"https://"}
       type="url"
       required={false}
      />
     )}
    </form.AppField>

    <form.AppField name="organization.settings.businessInstagramUrl">
     {(field) => (
      <field.InputField
       label="Instagram URL"
       placeholder="instagram.com/yourbusiness"
       AddonLeft={"https://"}
       type="url"
       required={false}
      />
     )}
    </form.AppField>

    <form.AppField name="organization.settings.businessRegistrationNumber">
     {(field) => (
      <field.InputField
       label="Registration Number"
       placeholder="Business Registration Number"
      />
     )}
    </form.AppField>
   </FieldGroup>
  );
 },
});

export default BusinessStep;
