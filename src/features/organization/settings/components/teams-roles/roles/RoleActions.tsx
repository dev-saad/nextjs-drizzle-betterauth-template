"use client";

import {
 deleteRole,
 RolesType,
} from "@/actions/server/organization.controllers";
import { AppAlertDialog } from "@/components/global/AppAlertDialog";
import { PermissionGuard } from "@/components/global/permission-guard";
import { Button } from "@/components/ui/button";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PARAMS } from "@/lib/constants/routes";
import { MoreHorizontalIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { RoleDialog } from "./RoleDialog";

interface RoleActionsProps {
 role: NonNullable<RolesType>["roles"][number];
}

export const RoleActions = ({ role }: RoleActionsProps) => {
 const [showEditDialog, setShowEditDialog] = useState(false);
 const { orgId } = useParams<typeof PARAMS>();
 const router = useRouter();

 const handleDelete = async () => {
  const { error, success } = await deleteRole({
   organizationId: orgId,
   roleId: role.id,
  });

  if (error || !success) {
   toast.error(`Failed to delete role: ${error}`);
   return;
  }

  toast.success("Role deleted successfully");
  router.refresh();
 };

 return (
  <>
   <RoleDialog
    open={showEditDialog}
    onOpenChange={setShowEditDialog}
    role={role}
   />
   <DropdownMenu modal={false}>
    <DropdownMenuTrigger asChild>
     <Button variant="ghost" className="h-8 w-8 p-0">
      <span className="sr-only">Open menu</span>
      <MoreHorizontalIcon className="h-4 w-4" />
     </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
     <DropdownMenuItem onClick={() => navigator.clipboard.writeText(role.id)}>
      Copy Role ID
     </DropdownMenuItem>
     <PermissionGuard required={{ role: ["update"] }}>
      <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
       Edit Role
      </DropdownMenuItem>
     </PermissionGuard>
     <AppAlertDialog
      title="Remove Role"
      description="Are you sure you want to remove this role? The members with this role will lose access to the permissions"
      actionText="Remove"
      variant="destructive"
      onAction={handleDelete}
      trigger={
       <DropdownMenuItem
        onSelect={(e) => e.preventDefault()}
        variant="destructive">
        Delete Role
       </DropdownMenuItem>
      }
     />
    </DropdownMenuContent>
   </DropdownMenu>
  </>
 );
};
