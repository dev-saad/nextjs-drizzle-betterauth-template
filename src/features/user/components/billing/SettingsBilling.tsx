"use client";

import {
 upsertUserAdditional,
 UserAdditionalType,
} from "@/actions/server/user.controllers";
import { useAppForm } from "@/components/global/form";
import { Button } from "@/components/ui/button";
import {
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { countriesOptions } from "@/lib/utils/select-options";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { billingFormSchema, BillingFormSchemaType } from "../../schema";

const SettingsBilling = ({ user }: { user: UserAdditionalType }) => {
 const router = useRouter();
 const form = useAppForm({
  defaultValues: {
   line1: user?.line1 ?? "",
   line2: user?.line2 ?? "",
   city: user?.city ?? "",
   state: user?.state ?? "",
   postalCode: user?.postalCode ?? "",
   country: user?.country ?? "",
  } as BillingFormSchemaType,
  validators: {
   onChange: billingFormSchema,
  },
  onSubmit: async ({ value }) => {
   const { success, error, status } = await upsertUserAdditional(value);

   if (status === "unchanged") {
    toast.info("No changes detected!");
    return;
   }

   if (!success || !!error) {
    toast.error(`Error updating billing info: ${error}`);
    return;
   }

   toast.success("Billing info updated successfully");
   router.refresh();
   form.reset(value); // Update default values
  },
 });

 return (
  <>
   <CardHeader>
    <CardTitle>Physical Address</CardTitle>
    <CardDescription>Manage your billing and shipping address</CardDescription>
   </CardHeader>
   <Separator />
   <CardContent>
    <form
     id="billing-form"
     onSubmit={(e) => {
      e.preventDefault();
      form.handleSubmit();
     }}>
     <FieldGroup>
      <div className="grid grid-cols-1 gap-4">
       <form.AppField name="line1">
        {(field) => (
         <field.InputField
          label="Address Line 1"
          placeholder="Street address"
         />
        )}
       </form.AppField>
       <form.AppField name="line2">
        {(field) => (
         <field.InputField
          label="Address Line 2"
          placeholder="Apartment, suite, unit, etc."
         />
        )}
       </form.AppField>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       <form.AppField name="city">
        {(field) => <field.InputField label="City" placeholder="City" />}
       </form.AppField>
       <form.AppField name="state">
        {(field) => (
         <field.InputField label="State / Province" placeholder="State" />
        )}
       </form.AppField>
       <form.AppField name="postalCode">
        {(field) => (
         <field.InputField label="Postal Code" placeholder="Postal Code" />
        )}
       </form.AppField>
       <form.AppField name="country">
        {(field) => (
         <field.ComboBoxField
          label="Country"
          placeholder="Select country"
          options={countriesOptions}
         />
        )}
       </form.AppField>
      </div>

      <Separator className="my-4" />
      <form.AppForm>
       <div className="flex gap-4">
        <Field>
         <Button
          className="cursor-pointer"
          variant="outline"
          type="button"
          onClick={() => form.reset()}>
          Cancel
         </Button>
        </Field>
        <Field>
         <form.SubmitButton>
          <Save /> Update Address
         </form.SubmitButton>
        </Field>
       </div>
      </form.AppForm>
     </FieldGroup>
    </form>
   </CardContent>
  </>
 );
};

export default SettingsBilling;
