"use client";

import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { ISOLATED_ROUTES, ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";
import { clearState, loadState } from "@/lib/utils/persist";
import { ArrowLeftToLine } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { DashboardBreadcrumb } from "./dashboard-breadcrumb";

export function SiteHeader() {
 const pathname = usePathname();
 const backUrl = loadState({
  key: "previous_dashboard_url",
  storage: "localStorage",
 });

 return (
  <header className="flex h-14 shrink-0 items-center gap-2 transition-[width,height] ease-linear sticky top-0 z-50 w-full border-b bg-background">
   <div className="flex items-center gap-2 px-4">
    {!ISOLATED_ROUTES.some((path) => pathname.startsWith(path)) ? (
     <>
      <SidebarTrigger className="-ml-1" />
      <Separator
       orientation="vertical"
       className="mr-2 data-[orientation=vertical]:h-4"
      />
     </>
    ) : (
     <>
      <Link
       className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
       href={backUrl ?? ROUTES.ORGANIZATION.ROOT}
       onClick={() => {
        clearState({
         key: "previous_dashboard_url",
         storage: "localStorage",
        });
       }}>
       <ArrowLeftToLine className="size-4" />
       <span>Back to Dashboard</span>
      </Link>
      <Separator
       orientation="vertical"
       className="mr-2 data-[orientation=vertical]:h-4"
      />
     </>
    )}
    <Suspense fallback={<Skeleton className="h-4 w-24" />}>
     <DashboardBreadcrumb />
    </Suspense>
   </div>
  </header>
 );
}
