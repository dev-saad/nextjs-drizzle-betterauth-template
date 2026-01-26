import { changePassword } from "@/actions/server/auth.controllers";
import { useAppForm } from "@/components/global/form";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { toast } from "sonner";
import { changePasswordFormSchema } from "../../schema";

interface ChangePasswordFormProps {
 onSuccess?: () => void;
}

const ChangePasswordForm = ({ onSuccess }: ChangePasswordFormProps) => {
 const form = useAppForm({
  defaultValues: {
   currentPassword: "",
   newPassword: "",
   confirmPassword: "",
   revokeOtherSessions: false,
  },
  validators: {
   onChange: changePasswordFormSchema,
  },
  onSubmit: async ({ value }) => {
   const validatedSchema = changePasswordFormSchema.safeParse(value);
   if (!validatedSchema.success) {
    toast.error(validatedSchema.error.message);
    return;
   }
   const { success, error } = await changePassword({
    ...validatedSchema.data,
    newPassword: validatedSchema.data.confirmPassword,
   });
   if (success) {
    toast.success("Password changed successfully");
    form.reset();
    onSuccess?.();
   }
   if (!success && error) {
    toast.error(`Error changing password: ${error}`);
   }
  },
 });
 return (
  <form
   id="change-password-form"
   onSubmit={(e) => {
    e.preventDefault();
    form.handleSubmit();
   }}>
   <FieldGroup>
    <form.AppField name="currentPassword">
     {(field) => <field.InputField type="password" label="Current Password" />}
    </form.AppField>
    <form.AppField name="newPassword">
     {(field) => <field.InputField type="password" label="New Password" />}
    </form.AppField>
    <form.AppField name="confirmPassword">
     {(field) => (
      <field.InputField type="password" label="Confirm New Password" />
     )}
    </form.AppField>
    <form.AppField name="revokeOtherSessions">
     {(field) => (
      <field.CheckboxField
       label="Sign out from other devices"
       description="Sign out from other devices"
       className="mt-2"
      />
     )}
    </form.AppField>
    <form.AppForm>
     <div className="flex gap-3 ml-auto">
      <DialogClose onClick={() => form.reset()} asChild>
       <Button variant="outline" className="cursor-pointer">
        Cancel
       </Button>
      </DialogClose>
      <form.SubmitButton>Change Password</form.SubmitButton>
     </div>
    </form.AppForm>
   </FieldGroup>
  </form>
 );
};

export default ChangePasswordForm;
