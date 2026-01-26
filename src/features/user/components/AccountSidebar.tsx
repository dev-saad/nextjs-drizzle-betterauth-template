"use client";

import {
 Highlight,
 HighlightItem,
} from "@/components/animate-ui/primitives/effects/highlight";
import { buttonVariants } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";
import { IdCard, MapPin, Settings, Shield, User } from "lucide-react";
import { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarItems = [
 {
  title: "Profile",
  href: ROUTES.USER.PROFILE,
  icon: User,
 },
 {
  title: "Account",
  href: ROUTES.USER.ACCOUNT,
  icon: IdCard,
 },
 {
  title: "Security",
  href: ROUTES.USER.SECURITY,
  icon: Shield,
 },
 {
  title: "Billing",
  href: ROUTES.USER.BILLING,
  icon: MapPin,
 },
 {
  title: "Preferences",
  href: ROUTES.USER.SETTINGS,
  icon: Settings,
 },
];

export function AccountSidebar({ className }: { className?: string }) {
 const pathname = usePathname();
 const splitPath = pathname.split("/").filter((path) => path !== "");
 const activePath = "/" + splitPath[0] + "/" + splitPath[1];
 const isMobile = useIsMobile();

 return (
  <aside
   className={cn(
    "w-full rounded-md lg:rounded-xl border bg-card text-card-foreground shadow-lg flex flex-col gap-2 p-1 lg:p-2 h-fit sticky top-15 lg:top-20 lg:w-1/5 lg:max-w-62 lg:min-w-32 z-10",
    className
   )}>
   <nav className="flex lg:flex-col gap-1">
    <Highlight
     mode="parent"
     controlledItems
     enabled
     hover={!isMobile}
     click={!isMobile}
     value={activePath}
     className="lg:bg-muted rounded-md"
     containerClassName="w-full flex lg:flex-col overflow-x-auto snap-x snap-mandatory no-scrollbar ">
     {sidebarItems.map((item) => {
      const Icon = item.icon;
      const isActive = activePath === item.href;

      return (
       <HighlightItem key={item.href} value={item.href} className="snap-start">
        <Link
         className={cn(
          buttonVariants({
           variant: isActive ? "secondary" : "ghost",
           size: isMobile ? "sm" : "default",
          }),
          "w-full justify-start gap-2",
          !isActive && "hover:!bg-transparent"
         )}
         href={item.href as Route}
         passHref>
         <Icon className="size-4" />
         {item.title}
        </Link>
       </HighlightItem>
      );
     })}
    </Highlight>
   </nav>
  </aside>
 );
}
