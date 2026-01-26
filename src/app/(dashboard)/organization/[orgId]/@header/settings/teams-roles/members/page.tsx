"use client";

import { DashboardTitle } from "@/components/global/Dashboard";
import { PermissionGuard } from "@/components/global/permission-guard";
import { Button } from "@/components/ui/button";
import { InviteMemberDialog } from "@/features/organization/settings/components/teams-roles/members/InviteMemberDialog";
import { UserRoundPlus } from "lucide-react";

const MembersHeader = () => {
 return (
  <DashboardTitle mainTitle="Members" section="Team & Roles">
   <InviteMemberDialog
    trigger={
     <PermissionGuard
      required={{ member: ["create"] }}
      showDisabled
      disabledTooltip="You do not have permission to invite members"
      asChild>
      <Button>
       Invite Member
       <UserRoundPlus />
      </Button>
     </PermissionGuard>
    }
   />
  </DashboardTitle>
 );
};

export default MembersHeader;
