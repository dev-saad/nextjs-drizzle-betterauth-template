import { DashboardTitle } from "@/components/global/Dashboard";
import { Button } from "@/components/ui/button";
import { RoleDialog } from "@/features/organization/settings/components/teams-roles/roles/RoleDialog";
import { PlusIcon } from "lucide-react";

const RolesHeader = () => {
 return (
  <DashboardTitle mainTitle="Roles" section="Team & Roles">
   <RoleDialog
    trigger={
     <Button size="sm">
      <PlusIcon />
      Create Role
     </Button>
    }
   />
  </DashboardTitle>
 );
};

export default RolesHeader;
