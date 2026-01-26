"use client";

import {
 createOrganization,
 OrganizationType,
 updateOrganization,
} from "@/actions/server/organization.controllers";
import { useAppForm } from "@/components/global/form";
import { Tooltip } from "@/components/global/Tooltip";
import { Button } from "@/components/ui/button";
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { useSlugExists } from "@/features/auth/hooks/useExists";
import {
 organizationFormSchema,
 OrganizationFormSchemaType,
} from "@/features/organization/settings/schema";
import { useGenerateSlug } from "@/hooks/use-generate-slug";
import { ROUTE_BUILDER } from "@/lib/constants/routes";
import { getStorageUrl } from "@/lib/utils/files";
import {
 businessTypeOptions,
 categoryOptions,
 countriesOptions,
 currencyCodeOptions,
 dimensionUnitOptions,
 languageOptions,
 timezoneOptions,
 weightUnitOptions,
} from "@/lib/utils/select-options";
import { SiFacebook, SiInstagram } from "@icons-pack/react-simple-icons";
import { BuildingIcon, Link, Loader2, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface OrganizationFormProps extends React.HTMLAttributes<HTMLFormElement> {
 mode?: "create" | "update";
 initialData?: OrganizationType;
 onSuccess?: (data: any) => void;
}

const OrganizationForm = ({
 mode = "create",
 initialData,
 onSuccess,
 ...props
}: OrganizationFormProps) => {
 const orgLogo = getStorageUrl(initialData?.org?.logo);
 const router = useRouter();
 const { generateSlug, isGenerating: isGeneratingSlug } = useGenerateSlug();

 const form = useAppForm({
  defaultValues: {
   logo: orgLogo,
   name: initialData?.org?.name ?? "",
   slug: initialData?.org?.slug ?? "",
   settings: {
    addressLine1: initialData?.settings?.addressLine1 ?? "",
    addressLine2: initialData?.settings?.addressLine2 ?? "",
    addressCity: initialData?.settings?.addressCity ?? "",
    addressState: initialData?.settings?.addressState ?? "",
    addressPostalCode: initialData?.settings?.addressPostalCode ?? "",
    addressCountry: initialData?.settings?.addressCountry ?? "",
    businessType: initialData?.settings?.businessType ?? "",
    businessCategory: initialData?.settings?.businessCategory ?? "",
    businessWebsite: initialData?.settings?.businessWebsite ?? "",
    businessFacebookUrl: initialData?.settings?.businessFacebookUrl ?? "",
    businessInstagramUrl: initialData?.settings?.businessInstagramUrl ?? "",
    businessRegistrationNumber:
     initialData?.settings?.businessRegistrationNumber ?? "",
    localeCurrency: initialData?.settings?.localeCurrency ?? "",
    localeTimezone: initialData?.settings?.localeTimezone ?? "",
    localeLanguage: initialData?.settings?.localeLanguage ?? "",
    localeWeightUnit: initialData?.settings?.localeWeightUnit ?? "",
    localeDimensionUnit: initialData?.settings?.localeDimensionUnit ?? "",
   },
  } as OrganizationFormSchemaType,
  validators: {
   onChange: organizationFormSchema,
  },
  onSubmit: async ({ value }) => {
   try {
    if (mode === "update" && initialData?.org?.id) {
     const { error, success, status } = await updateOrganization({
      organizationId: initialData.org.id,
      ...value,
     });
     if (status === "unchanged") {
      toast.info("No changes detected");
      return;
     }
     if (!success || error) {
      toast.error(error);
      return;
     }
     toast.success("Organization details updated successfully");
     if (onSuccess) onSuccess(value);
    } else if (mode === "create") {
     const { error, success, data } = await createOrganization({
      ...value,
     });
     if (!success || error || !data) {
      toast.error(error);
      return;
     }
     toast.success("Organization created successfully");
     if (onSuccess) onSuccess(data);
     else router.push(ROUTE_BUILDER.organization(data?.org?.id));
    }
   } catch (err: any) {
    toast.error(err.message || "An unexpected error occurred");
   } finally {
    router.refresh();
   }
  },
 });

 const handleGenerateSlug = async () => {
  const name = form.getFieldValue("name");
  const newSlug = await generateSlug(name as string);
  if (newSlug) {
   form.setFieldValue("slug", newSlug);
  }
 };

 const { checkSlugExists, Icon, color, message } = useSlugExists();

 return (
  <form
   id={`organization-form-${initialData?.org?.id}`}
   onSubmit={(e) => {
    e.preventDefault();
    form.handleSubmit();
   }}
   {...props}>
   <FieldGroup>
    <Card>
     <CardHeader>
      <CardTitle>Organization Identity</CardTitle>
      <CardDescription>
       Visible to your customers and on invoices.
      </CardDescription>
     </CardHeader>
     <CardContent>
      <FieldGroup className="flex-col sm:flex-row items-center gap-5">
       <form.AppField name="logo">
        {(field) => (
         <field.UploadField AvatarIcon={BuildingIcon} className="w-fit" />
        )}
       </form.AppField>
       <FieldGroup>
        <form.AppField name="name">
         {(field) => (
          <field.InputField label="Organization Name" placeholder="Acme Corp" />
         )}
        </form.AppField>
        <form.AppField
         name="slug"
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
           label="URL Slug"
           placeholder="flowket-corp"
           AddonLeft="flowket.com/"
           Icon={
            Icon && (
             <Tooltip content={message}>{<Icon className={color} />}</Tooltip>
            )
           }
           AddonRight={
            <Tooltip content="Generate Slug">
             <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleGenerateSlug}
              disabled={isGeneratingSlug}>
              {isGeneratingSlug ? (
               <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
               <Wand2 className="h-4 w-4" />
              )}
              <span className="sr-only">Generate Slug</span>
             </Button>
            </Tooltip>
           }
          />
         )}
        </form.AppField>
       </FieldGroup>
      </FieldGroup>
     </CardContent>
    </Card>
    {/* --- BUSINESS TYPE & CATEGORY CARD --- */}
    <Card>
     <CardHeader>
      <CardTitle>Business Details</CardTitle>
      <CardDescription>
       Used for verifying the business and for filtering.
      </CardDescription>
     </CardHeader>
     <CardContent>
      <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
       <form.AppField name="settings.businessType">
        {(field) => (
         <field.SelectField
          label="Business Type"
          options={businessTypeOptions}
         />
        )}
       </form.AppField>
       <form.AppField name="settings.businessCategory">
        {(field) => (
         <field.SelectField
          label="Business Category"
          options={categoryOptions(
           form.state.values?.settings?.businessType as string,
          )}
         />
        )}
       </form.AppField>
       <form.AppField name="settings.businessWebsite">
        {(field) => (
         <field.InputField
          label="Website"
          placeholder="yourdomain.com"
          AddonLeft={<Link />}
          type="text"
         />
        )}
       </form.AppField>

       <form.AppField name="settings.businessFacebookUrl">
        {(field) => (
         <field.InputField
          label="Facebook URL"
          placeholder="facebook.com/yourbusiness"
          AddonLeft={<SiFacebook />}
          type="url"
         />
        )}
       </form.AppField>

       <form.AppField name="settings.businessInstagramUrl">
        {(field) => (
         <field.InputField
          label="Instagram URL"
          placeholder="instagram.com/yourbusiness"
          AddonLeft={<SiInstagram />}
          type="url"
         />
        )}
       </form.AppField>

       <form.AppField name="settings.businessRegistrationNumber">
        {(field) => (
         <field.InputField
          label="Registration Number"
          placeholder="Business Registration Number"
         />
        )}
       </form.AppField>
      </FieldGroup>
     </CardContent>
    </Card>
    {/* --- LOCALIZATION & STANDARDS CARD --- */}
    <Card>
     <CardHeader>
      <CardTitle>Regional & Standards</CardTitle>
      <CardDescription>
       Units and formats used for calculations.
      </CardDescription>
     </CardHeader>
     <CardContent>
      <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
       <form.AppField name="settings.localeCurrency">
        {(field) => (
         <field.ComboBoxField label="Currency" options={currencyCodeOptions} />
        )}
       </form.AppField>
       <form.AppField name="settings.localeTimezone">
        {(field) => (
         <field.ComboBoxField label="Timezone" options={timezoneOptions} />
        )}
       </form.AppField>
       <form.AppField name="settings.localeWeightUnit">
        {(field) => (
         <field.SelectField label="Weight Unit" options={weightUnitOptions} />
        )}
       </form.AppField>
       <form.AppField name="settings.localeDimensionUnit">
        {(field) => (
         <field.SelectField
          label="Dimension Unit"
          options={dimensionUnitOptions}
         />
        )}
       </form.AppField>
       <form.AppField name="settings.localeLanguage">
        {(field) => (
         <field.SelectField label="Language" options={languageOptions} />
        )}
       </form.AppField>
      </FieldGroup>
     </CardContent>
    </Card>
    {/* --- ADDRESS CARD --- */}
    <Card>
     <CardHeader>
      <CardTitle>Business Address</CardTitle>
      <CardDescription>
       Used as the default origin for shipping.
      </CardDescription>
     </CardHeader>
     <CardContent>
      <FieldGroup>
       <form.AppField name="settings.addressCountry">
        {(field) => (
         <field.ComboBoxField label="Country" options={countriesOptions} />
        )}
       </form.AppField>
       <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
        <form.AppField name="settings.addressLine1">
         {(field) => <field.InputField label="Line 1" />}
        </form.AppField>
        <form.AppField name="settings.addressLine2">
         {(field) => <field.InputField label="Line 2" />}
        </form.AppField>
       </div>
       <div className="grid sm:grid-cols-3 grid-cols-1 gap-4">
        <form.AppField name="settings.addressCity">
         {(field) => <field.InputField label="City" />}
        </form.AppField>
        <form.AppField name="settings.addressState">
         {(field) => <field.InputField label="State" />}
        </form.AppField>
        <form.AppField name="settings.addressPostalCode">
         {(field) => <field.InputField label="Postal Code" />}
        </form.AppField>
       </div>
      </FieldGroup>
     </CardContent>
    </Card>

    <form.AppForm>
     <form.ActionButtons
      sticky
      submitButton={{
       label: mode === "create" ? "Create Organization" : "Save Changes",
      }}
      cancelButton={{
       label: "Discard Changes",
       onClick: () => form.reset(),
      }}
      position="bottom"
      design="card"
      submitType={mode === "create" ? "create" : "update"}
     />
    </form.AppForm>
   </FieldGroup>
  </form>
 );
};

export default OrganizationForm;
