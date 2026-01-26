import {
 getRolesList,
 MembersType,
 sendInvitation,
 updateMemberRole,
} from "@/actions/server/organization.controllers";
import { useAppForm } from "@/components/global/form";
import { ResponsiveDialog } from "@/components/global/responsive-dialog";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { PARAMS } from "@/lib/constants/routes";
import { useDebouncedValue } from "@tanstack/react-pacer";
import { capitalize } from "lodash";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
 sendInvitationFormSchema,
 SendInvitationFormSchemaType,
} from "../../../schema";

interface InviteMemberDialogProps {
 open?: boolean;
 onOpenChange?: (open: boolean) => void;
 trigger?: React.ReactNode;
 member?: NonNullable<MembersType>["members"][number];
}

export const InviteMemberDialog = ({
 open,
 onOpenChange,
 trigger,
 member,
}: InviteMemberDialogProps) => {
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

 const [searchValue, setSearchValue] = useState("");
 const [debouncedSearchValue] = useDebouncedValue(searchValue, {
  wait: 500,
 });

 const fetchRolesCallback = useCallback(
  async (page: number) => {
   const { data } = await getRolesList({
    organizationId: orgId,
    filters: {
     page: page,
     limit: 10,
     search: debouncedSearchValue,
    },
   });
   return data ? { data: data.roles, total: data.total } : [];
  },
  [orgId, debouncedSearchValue],
 );

 const {
  data: roles,
  isLoading: isLoadingRoles,
  observerRef,
  reset,
 } = useInfiniteScroll({
  fetchData: fetchRolesCallback,
  limit: 10,
 });

 useEffect(() => {
  if (open && (!roles || roles.length === 0)) {
   reset();
  }
 }, [fetchRolesCallback, open]);

 const form = useAppForm({
  defaultValues: {
   email: member?.user.email || "",
   role: member?.role ?? [],
   organizationId: orgId,
  } as SendInvitationFormSchemaType,
  validators: {
   onChange: sendInvitationFormSchema,
  },
  onSubmit: async ({ value }) => {
   if (member) {
    const { error } = await updateMemberRole({
     role: value.role,
     organizationId: orgId,
     memberId: member.id,
    });

    if (error) {
     return toast.error(`Failed to update member role: ${error}`);
    }

    toast.success("Member role updated successfully");
   } else {
    const { error } = await sendInvitation({
     email: value.email,
     role: value.role,
     organizationId: orgId,
    });

    if (error) {
     return toast.error(`Failed to send invitation: ${error}`);
    }

    toast.success("Invitation sent successfully");
   }
   form.reset();
   handleOpenChange(false);
   router.refresh();
  },
 });

 return (
  <ResponsiveDialog
   open={isOpen}
   onOpenChange={handleOpenChange}
   trigger={trigger}
   title={member ? "Update Member Role" : "Invite Member"}
   description={
    member
     ? "Update the role for this member."
     : "Invite a new member to your organization."
   }
   className="max-w-md">
   <form
    onSubmit={(e) => {
     e.preventDefault();
     form.handleSubmit();
    }}
    className="space-y-6">
    <form.AppField name="email">
     {(field) => (
      <field.InputField
       label="Email Address"
       placeholder="john@example.com"
       type="email"
       readOnly={!!member}
       disabled={!!member}
      />
     )}
    </form.AppField>

    <form.AppField name="role">
     {(field) => (
      <field.ComboBoxField
       label="Role"
       createMissingOptions
       multiple
       loading={roles?.length === 0 && isLoadingRoles}
       //  loadingInput={isLoadingRoles}
       loadingLabel="Loading roles..."
       description="You can select multiple roles for the user."
       shouldFilter={false}
       placeholder="Search or Select a role"
       options={
        roles?.map((role) => ({
         label: capitalize(role.role),
         value: role.role,
        })) || []
       }
       infiniteScrollRef={observerRef}
       isFetchingNext={isLoadingRoles}
       onInputValueChange={setSearchValue}
       inputValue={searchValue}
      />
     )}
    </form.AppField>

    <form.AppForm>
     <form.ActionButtons
      submitButton={{
       label: member ? "Update Role" : "Send Invitation",
      }}
      cancelButton={
       <DialogClose>
        <Button variant="outline" type="button">
         Cancel
        </Button>
       </DialogClose>
      }
      submitType={member ? "update" : "create"}
     />
    </form.AppForm>
   </form>
  </ResponsiveDialog>
 );
};
