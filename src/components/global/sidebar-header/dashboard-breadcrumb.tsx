"use client";

import {
 Breadcrumb,
 BreadcrumbItem,
 BreadcrumbLink,
 BreadcrumbList,
 BreadcrumbPage,
 BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import React from "react";

export function DashboardBreadcrumb() {
 const pathname = usePathname();
 const segments = pathname.split("/").filter((segment) => segment !== "");

 // Helper to capitalize first letter
 const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

 const breadcrumbItems = segments
  .map((segment, index) => {
   const href = `/${segments.slice(0, index + 1).join("/")}`;
   return {
    href,
    label: capitalize(segment),
    segment,
    index,
   };
  })
  .filter(({ segment, index }) => {
   // Filter out 'organization' and the segment immediately following it (orgId)
   // if (segment === "organization") return false;
   // if (index > 0 && segments[index - 1] === "organization") return false;

   // Filter out common ID patterns
   // UUIDs/CUIDs (length > 20 is a safe heuristic for these)
   if (segment.length > 20) return false;
   // Prefixed IDs (e.g., org_123, user_456)
   if (segment.includes("_") && /\d/.test(segment)) return false;
   // Purely numeric IDs
   if (!isNaN(Number(segment))) return false;

   return true;
  });

 return (
  <Breadcrumb>
   <BreadcrumbList>
    {breadcrumbItems.map((item, index) => {
     const isLast = index === breadcrumbItems.length - 1;

     return (
      <React.Fragment key={item.href}>
       <BreadcrumbItem>
        {isLast ? (
         <BreadcrumbPage>{item.label}</BreadcrumbPage>
        ) : (
         <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
        )}
       </BreadcrumbItem>
       {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
      </React.Fragment>
     );
    })}
   </BreadcrumbList>
  </Breadcrumb>
 );
}
