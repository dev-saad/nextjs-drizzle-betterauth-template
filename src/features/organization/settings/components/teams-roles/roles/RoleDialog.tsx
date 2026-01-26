"use client";

import {
 createRole,
 RolesType,
 updateRole,
} from "@/actions/server/organization.controllers";
import { useAppForm } from "@/components/global/form";
import { ResponsiveDialog } from "@/components/global/responsive-dialog";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import {
 Field,
 FieldContent,
 FieldError,
 FieldLabel,
} from "@/components/ui/field";
import { statements } from "@/lib/constants/permissions";
import { PARAMS } from "@/lib/constants/routes";
import { capitalize } from "lodash";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
 createRoleFormSchema,
 CreateRoleFormSchemaType,
 updateRoleFormSchema,
} from "../../../schema";

interface RoleDialogProps {
 open?: boolean;
 onOpenChange?: (open: boolean) => void;
 trigger?: React.ReactNode;
 role?: NonNullable<RolesType>["roles"][number];
}

export const RoleDialog = ({
 open,
 onOpenChange,
 trigger,
 role,
}: RoleDialogProps) => {
 const { orgId } = useParams<typeof PARAMS>();
 const router = useRouter();
 const [internalOpen, setInternalOpen] = useState(false);
 const isControlled = typeof open !== "undefined";
 const isOpen = isControlled ? open : internalOpen;

 const handleOpenChange = (newOpen: boolean) => {
  if (!isControlled) {
   setInternalOpen(newOpen);
  }
  onOpenChange?.(newOpen);
 };

 const form = useAppForm({
  defaultValues: {
   role: role?.role || "",
   permissions: role?.permission || {},
  } as CreateRoleFormSchemaType,
  validators: {
   onChange: role ? updateRoleFormSchema : createRoleFormSchema,
  },
  onSubmit: async ({ value }) => {
   const cleanPermissions = (permissions: Record<string, string[]>) => {
    const cleaned = { ...permissions };
    Object.keys(cleaned).forEach((key) => {
     if (Array.isArray(cleaned[key]) && cleaned[key].length === 0) {
      delete cleaned[key];
     }
    });
    return cleaned;
   };

   const cleanedPermissions = cleanPermissions(value.permissions);

   if (role) {
    const { error, success } = await updateRole({
     roleId: role.id,
     roleName: value.role,
     organizationId: orgId,
     data: {
      // roleName: value.role,
      permission: cleanedPermissions,
     },
    });
    if (error || !success) {
     return toast.error(`Failed to update role: ${error}`);
    }
    toast.success("Role updated successfully");
   } else {
    const { error, success } = await createRole({
     role: value.role,
     permission: cleanedPermissions,
     organizationId: orgId,
    });
    if (error || !success) {
     return toast.error(`Failed to create role: ${error}`);
    }
   }
   toast.success("Role created successfully");
   form.reset();
   router.refresh();
   handleOpenChange(false);
  },
 });

 return (
  <ResponsiveDialog
   open={isOpen}
   onOpenChange={handleOpenChange}
   trigger={trigger}
   title={role ? "Update Role" : "Create Role"}
   description={
    role
     ? "Update the role and its permissions."
     : "Create a new role and assign permissions to it."
   }
   className="max-w-3xl">
   <form
    onSubmit={(e) => {
     e.preventDefault();
     form.handleSubmit();
    }}
    className="space-y-6">
    <form.AppField name="role">
     {(field) => (
      <field.InputField
       label="Role Name"
       placeholder="e.g. Content Editor"
       autoFocus
      />
     )}
    </form.AppField>

    <form.AppField name="permissions">
     {(permissionsField) => (
      <Field>
       <FieldLabel>
        Permissions <span className="text-destructive">*</span>
       </FieldLabel>
       <FieldContent className="border rounded-md divide-y gap-0">
        {Object.entries(statements).map(([entity, actions]) => (
         <div key={entity} className="p-4 flex items-center justify-between">
          <form.AppField name={`permissions.${entity}`}>
           {(field) => {
            return (
             <field.CheckboxGroupField
              label={capitalize(entity.replace("_", " "))}
              direction="horizontal"
              hasSelectAll
              required
              options={Object.values(actions).map((action) => ({
               label: capitalize(action),
               value: action,
              }))}
             />
            );
           }}
          </form.AppField>
         </div>
        ))}
       </FieldContent>
       <FieldError errors={permissionsField.state.meta.errors} />
      </Field>
     )}
    </form.AppField>

    <form.AppForm>
     <form.ActionButtons
      submitButton={
       <Button type="submit">{role ? "Update Role" : "Create Role"}</Button>
      }
      cancelButton={
       <DialogClose asChild>
        <Button type="button" variant="outline">
         Cancel
        </Button>
       </DialogClose>
      }
      submitType={role ? "update" : "create"}
     />
    </form.AppForm>
   </form>
  </ResponsiveDialog>
 );
};
