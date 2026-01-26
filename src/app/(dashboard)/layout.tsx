import { getOrganizationsList } from "@/actions/server/organization.controllers";
import { getSession } from "@/actions/server/session.controllers";
import { getUser } from "@/actions/server/user.controllers";
import { AppSidebar } from "@/components/global/sidebar-header/app-sidebar";
import { SiteHeader } from "@/components/global/sidebar-header/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PromiseProvider } from "@/lib/context/server-action-context";
import { cookies } from "next/headers";
import React from "react";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
 const cookieStore = await cookies();
 const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

 const userPromise = getUser();
 const sessionPromise = getSession();
 const orgsPromise = getOrganizationsList();

 return (
  <PromiseProvider
   promises={{
    user: userPromise,
    session: sessionPromise,
    orgs: orgsPromise,
   }}>
   <SidebarProvider defaultOpen={defaultOpen}>
    <AppSidebar />
    <SidebarInset>
     <SiteHeader />
     <div className="flex flex-1 flex-col gap-4 p-4 md:p-8 ">{children}</div>
    </SidebarInset>
   </SidebarProvider>
  </PromiseProvider>
 );
};

export default DashboardLayout;
