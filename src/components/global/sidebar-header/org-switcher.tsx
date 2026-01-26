"use client";

import {
 getActiveMemberRole,
 OrganizationListAwaitedReturnType,
 OrganizationType,
 setActiveOrganization,
} from "@/actions/server/organization.controllers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BadgeOverflow } from "@/components/ui/badge-overflow";
import { buttonVariants } from "@/components/ui/button";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuShortcut,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
 SidebarMenu,
 SidebarMenuButton,
 SidebarMenuItem,
 useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTE_BUILDER, ROUTES } from "@/lib/constants/routes";
import { usePromise } from "@/lib/context/server-action-context";
import { cn } from "@/lib/utils";
import { getStorageUrl } from "@/lib/utils/files";
import { saveState } from "@/lib/utils/persist";
import { Building2, ChevronsUpDown, Plus } from "lucide-react";
import { Route } from "next";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function OrgSwitcher() {
 const router = useRouter();
 const params = useParams();
 const pathname = usePathname();
 const { isMobile } = useSidebar();
 const orgId = params.orgId as string | undefined;

 const { data: orgs, error: orgsError } =
  usePromise<OrganizationListAwaitedReturnType>("orgs");
 const [roles, setRoles] = useState<string[]>([]);

 const fetchRoles = async () => {
  if (!orgId) return;
  const { data, error } = await getActiveMemberRole({ organizationId: orgId });
  if (error) {
   toast.error(`Error fetching roles: ${error}`);
  } else {
   setRoles(data?.role.split(",").map((role) => role.trim()) ?? []);
  }
 };
 useEffect(() => {
  fetchRoles();
 }, []);

 if (orgsError) {
  toast.error(`Error fetching organizations list: ${orgsError}`);
 }

 const activeOrg = orgs?.find((org) => org.id === orgId);
 const orgLogo = getStorageUrl(activeOrg?.logo);

 const handleOrgChange = async (newOrgId: string) => {
  const { success, error } = await setActiveOrganization(newOrgId);
  if (success) {
   const segments = pathname.split("/");
   if (segments[1] === "organization" && segments[2]) {
    segments[2] = newOrgId;
    const newPath = segments.join("/");
    router.push(newPath as Route);
   } else {
    router.push(
     ROUTE_BUILDER.organization(newOrgId, ROUTES.ORGANIZATION.DEFAULT),
    );
   }
  } else {
   toast.error(`Organization switch failed: ${error}`);
  }
 };

 if (!orgs?.length) {
  return <Skeleton className="h-12 w-full" />;
 }

 return (
  <SidebarMenu className="h-full">
   <SidebarMenuItem className="h-full flex items-center justify-center">
    <DropdownMenu>
     <DropdownMenuTrigger asChild>
      <SidebarMenuButton
       size="lg"
       className={cn(
        "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground ring-accent w-full h-full cursor-pointer",
       )}>
       <Avatar className="rounded-md">
        <AvatarImage src={orgLogo} alt={activeOrg?.name ?? ""} />
        <AvatarFallback>
         <Building2 />
        </AvatarFallback>
       </Avatar>
       <div className="flex-1 text-left text-sm leading-tight flex flex-col gap-0.5 ">
        <span className="truncate font-semibold">{activeOrg?.name}</span>
        {roles && roles?.length > 0 && (
         <BadgeOverflow
          items={roles}
          lineCount={1}
          maxItems={1}
          renderBadge={(_, role) => (
           <Badge variant="outline" size="tiny">
            {role}
           </Badge>
          )}
         />
        )}
       </div>
       <ChevronsUpDown className="ml-auto" />
      </SidebarMenuButton>
     </DropdownMenuTrigger>
     <DropdownMenuContent
      className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
      align="start"
      side={isMobile ? "bottom" : "right"}
      sideOffset={4}>
      <DropdownMenuLabel className="text-muted-foreground text-xs">
       Organizations
      </DropdownMenuLabel>
      {orgs?.map((org, index) => (
       <OrgItem
        key={org.id}
        org={org}
        index={index}
        onClick={() => org.id && handleOrgChange(org.id)}
       />
      ))}
      <DropdownMenuSeparator />
      <CreateOrgItem pathname={pathname} />
     </DropdownMenuContent>
    </DropdownMenu>
   </SidebarMenuItem>
  </SidebarMenu>
 );
}

function OrgItem({
 org,
 index,
 onClick,
}: {
 org: Partial<NonNullable<OrganizationType>["org"]>;
 index: number;
 onClick: () => void;
}) {
 return (
  <DropdownMenuItem onClick={onClick} className="gap-2 p-2 cursor-pointer">
   <Avatar className="rounded-md">
    <AvatarImage src={getStorageUrl(org?.logo ?? null)} alt={org?.name ?? ""} />
    <AvatarFallback>
     <Building2 />
    </AvatarFallback>
   </Avatar>
   {org?.name}
   <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
  </DropdownMenuItem>
 );
}

function CreateOrgItem({ pathname }: { pathname: string }) {
 return (
  <DropdownMenuItem asChild>
   <Link
    href={ROUTES.ORGANIZATION.ROOT + ROUTES.ORGANIZATION.CREATE}
    onClick={() => {
     saveState(
      {
       key: "previous_dashboard_url",
       storage: "localStorage",
      },
      pathname,
     );
    }}
    className={cn(
     buttonVariants({ variant: "ghost" }),
     "w-full justify-start cursor-pointer",
    )}>
    <Plus />
    Create Organization
   </Link>
  </DropdownMenuItem>
 );
}
