"use client";
import {
 BadgeCheck,
 Bell,
 ChevronsUpDown,
 CreditCard,
 LogOut,
 Sparkles,
} from "lucide-react";

import { signOut } from "@/actions/server/auth.controllers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuGroup,
 DropdownMenuItem,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
 SidebarMenu,
 SidebarMenuButton,
 SidebarMenuItem,
 useSidebar,
} from "@/components/ui/sidebar";
import { User } from "@/lib/auth/auth.config";
import { ROUTES } from "@/lib/constants/routes";
import { usePromise } from "@/lib/context/server-action-context";
import { saveState } from "@/lib/utils/persist";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NavUser = () => {
 const { isMobile } = useSidebar();
 const user = usePromise<User>("user");
 const pathname = usePathname();

 return (
  <SidebarMenu>
   <SidebarMenuItem>
    <DropdownMenu>
     <DropdownMenuTrigger asChild>
      <SidebarMenuButton
       size="lg"
       className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
       <Avatar className="h-8 w-8 rounded-lg">
        <AvatarImage src={user?.image ?? undefined} alt={user?.name} />
        <AvatarFallback className="rounded-lg">
         {user?.name?.slice(0, 2).toUpperCase()}
        </AvatarFallback>
       </Avatar>
       <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{user?.name}</span>
        <span className="truncate text-xs">{user?.email}</span>
       </div>
       <ChevronsUpDown className="ml-auto size-4" />
      </SidebarMenuButton>
     </DropdownMenuTrigger>
     <DropdownMenuContent
      className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
      side={isMobile ? "bottom" : "right"}
      align="end"
      sideOffset={4}>
      <DropdownMenuLabel className="p-0 font-normal">
       <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
        <Avatar className="h-8 w-8 rounded-lg">
         <AvatarImage src={user?.image ?? undefined} alt={user?.name} />
         <AvatarFallback className="rounded-lg">
          {user?.name?.slice(0, 2).toUpperCase()}
         </AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-left text-sm leading-tight">
         <span className="truncate font-medium">{user?.name}</span>
         <span className="truncate text-xs">{user?.email}</span>
        </div>
       </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
       <DropdownMenuItem>
        <Sparkles />
        Upgrade to Pro
       </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
       <DropdownMenuItem asChild>
        <Link
         href={ROUTES.USER.PROFILE}
         onClick={() => {
          saveState(
           {
            key: "previous_dashboard_url",
            storage: "localStorage",
           },
           pathname,
          );
         }}>
         <BadgeCheck />
         Account
        </Link>
       </DropdownMenuItem>
       <DropdownMenuItem>
        <CreditCard />
        Billing
       </DropdownMenuItem>
       <DropdownMenuItem>
        <Bell />
        Notifications
       </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem
       onClick={async () => {
        await signOut();
       }}>
       <LogOut />
       Log out
      </DropdownMenuItem>
     </DropdownMenuContent>
    </DropdownMenu>
   </SidebarMenuItem>
  </SidebarMenu>
 );
};

export default NavUser;
