"use client";

import { withForm } from "@/components/global/form";
import { FieldGroup } from "@/components/ui/field";
import { useSlugExists } from "@/features/auth/hooks/useExists";
import {
 countriesOptions,
 currencyCodeOptions,
 dimensionUnitOptions,
 timezoneOptions,
 weightUnitOptions,
} from "@/lib/utils/select-options";
import { BuildingIcon } from "lucide-react";
import { onboardingFormOptions } from "../../form-config";

const OrganizationStep = withForm({
 ...onboardingFormOptions,
 render: function Render({ form }) {
  const { checkSlugExists, Icon, color } = useSlugExists();
  return (
   <FieldGroup>
    <form.AppField name="organization.logo">
     {(field) => <field.UploadField AvatarIcon={BuildingIcon} />}
    </form.AppField>
    <form.AppField name="organization.name">
     {(field) => (
      <field.InputField
       label="Organization Name"
       placeholder="Enter your organization name"
       AddonLeft={<BuildingIcon />}
      />
     )}
    </form.AppField>
    <form.AppField
     name="organization.slug"
     validators={{
      onChangeAsync: async ({ value }) => {
       const exists = await checkSlugExists(value);
       return exists
        ? {
           message: "Slug already in use",
           severity: "error",
           code: 1001,
          }
        : undefined;
      },
     }}>
     {(field) => (
      <field.InputField
       label="Organization Slug"
       placeholder="Enter your organization slug"
       AddonLeft="flowket.com/organizations/"
       Icon={Icon && <Icon className={color} />}
      />
     )}
    </form.AppField>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
     <form.AppField name="organization.settings.addressCountry">
      {(field) => (
       <field.ComboBoxField
        label="Country"
        placeholder="Select country"
        options={countriesOptions}
       />
      )}
     </form.AppField>
     <form.AppField name="organization.settings.addressPostalCode">
      {(field) => (
       <field.InputField label="Postal Code" placeholder="Zip/Postal Code" />
      )}
     </form.AppField>
    </div>

    <form.AppField name="organization.settings.addressLine1">
     {(field) => (
      <field.InputField label="Address Line 1" placeholder="Street address" />
     )}
    </form.AppField>
    <form.AppField name="organization.settings.addressLine2">
     {(field) => (
      <field.InputField
       label="Address Line 2"
       placeholder="Apartment, suite, etc. (optional)"
      />
     )}
    </form.AppField>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
     <form.AppField name="organization.settings.addressCity">
      {(field) => <field.InputField label="City" placeholder="City" />}
     </form.AppField>
     <form.AppField name="organization.settings.addressState">
      {(field) => (
       <field.InputField label="State/Province" placeholder="State" />
      )}
     </form.AppField>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
     <form.AppField name="organization.settings.localeCurrency">
      {(field) => (
       <field.ComboBoxField
        label="Currency"
        placeholder="Select currency"
        options={currencyCodeOptions}
       />
      )}
     </form.AppField>
     <form.AppField name="organization.settings.localeTimezone">
      {(field) => (
       <field.ComboBoxField
        label="Timezone"
        placeholder="Select timezone"
        options={timezoneOptions}
       />
      )}
     </form.AppField>
     <form.AppField name="organization.settings.localeWeightUnit">
      {(field) => (
       <field.SelectField label="Weight Unit" options={weightUnitOptions} />
      )}
     </form.AppField>
     <form.AppField name="organization.settings.localeDimensionUnit">
      {(field) => (
       <field.SelectField
        label="Dimension Unit"
        options={dimensionUnitOptions}
       />
      )}
     </form.AppField>
    </div>
   </FieldGroup>
  );
 },
});

export default OrganizationStep;
