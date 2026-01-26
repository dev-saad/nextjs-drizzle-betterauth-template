"use client";

import {
 MembersType,
 removeMember,
} from "@/actions/server/organization.controllers";
import { AppAlertDialog } from "@/components/global/AppAlertDialog";
import { CopyText } from "@/components/global/CopyText";
import { Button } from "@/components/ui/button";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontalIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { InviteMemberDialog } from "./InviteMemberDialog";

interface MemberActionsProps {
 member: NonNullable<MembersType>["members"][number];
 organizationId: string;
}

export const MemberActions = ({
 member,
 organizationId,
}: MemberActionsProps) => {
 const [showEditDialog, setShowEditDialog] = useState(false);
 const splitRole = member.role;
 const router = useRouter();

 const handleRemoveMember = async () => {
  const result = await removeMember({
   organizationId,
   memberIdOrEmail: member.user.email,
   role: member.role,
  });
  if (result.success) {
   toast.success("Member removed successfully");
   router.refresh();
  } else {
   toast.error(`Failed to remove member: ${result.error}`);
  }
 };

 return (
  !splitRole.includes("owner") && (
   <>
    <InviteMemberDialog
     open={showEditDialog}
     onOpenChange={setShowEditDialog}
     member={member}
    />
    <DropdownMenu modal={false}>
     <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="h-8 w-8 p-0">
       <span className="sr-only">Open menu</span>
       <MoreHorizontalIcon className="h-4 w-4" />
      </Button>
     </DropdownMenuTrigger>
     <DropdownMenuContent align="end">
      <CopyText text={member.user.id} asChild>
       <DropdownMenuItem>Copy User ID</DropdownMenuItem>
      </CopyText>
      <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
       Edit Member
      </DropdownMenuItem>
      <AppAlertDialog
       title="Remove Member"
       description="Are you sure you want to remove this member? They will lose access to the organization."
       actionText="Remove"
       variant="destructive"
       onAction={handleRemoveMember}
       trigger={
        <DropdownMenuItem
         onSelect={(e) => e.preventDefault()}
         className="text-destructive">
         Remove Member
        </DropdownMenuItem>
       }
      />
     </DropdownMenuContent>
    </DropdownMenu>
   </>
  )
 );
};
