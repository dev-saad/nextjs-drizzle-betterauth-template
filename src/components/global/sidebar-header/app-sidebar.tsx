"use client";

import { NAV_MAIN, NAV_SECONDARY } from "@/lib/constants/dashboard-nav";

import { NavMain } from "@/components/global/sidebar-header/nav-main";
import {
 Sidebar,
 SidebarContent,
 SidebarFooter,
 SidebarHeader,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { ISOLATED_ROUTES } from "@/lib/constants/routes";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import NavUser from "./nav-user";
import { OrgSwitcher } from "./org-switcher";

export function AppSidebar({
 navUser,
 ...props
}: React.ComponentProps<typeof Sidebar> & {
 navUser?: React.ReactNode;
}) {
 const pathname = usePathname();
 if (ISOLATED_ROUTES.some((path) => pathname.startsWith(path))) {
  return null;
 }
 return (
  <Sidebar collapsible="icon" {...props}>
   <SidebarHeader className="border-b border-border h-14 p-0">
    <Suspense fallback={<Skeleton className="h-full w-full" />}>
     <OrgSwitcher />
    </Suspense>
   </SidebarHeader>
   <SidebarContent
    className="[&::-webkit-scrollbar]:w-1
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-track]:bg-gray-100
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-gray-300
  dark:[&::-webkit-scrollbar-track]:bg-neutral-700
  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 py-2">
    {NAV_MAIN.map((group, index) => (
     <Suspense
      key={group.title || index}
      fallback={<Skeleton className="h-8 w-full" />}>
      <NavMain {...group} />
     </Suspense>
    ))}
    <div className="mt-auto" />
    {NAV_SECONDARY.map((group, index) => (
     <Suspense
      key={group.title || index}
      fallback={<Skeleton className="h-8 w-full" />}>
      <NavMain {...group} />
     </Suspense>
    ))}
   </SidebarContent>
   <SidebarFooter>
    <Suspense fallback={<Skeleton className="h-8 w-full" />}>
     <NavUser />
    </Suspense>
   </SidebarFooter>
   {/* <SidebarRail /> */}
  </Sidebar>
 );
}
