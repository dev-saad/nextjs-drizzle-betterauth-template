"use client";

import { ChevronRight } from "lucide-react";

import {
 Collapsible,
 CollapsibleContent,
 CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
 SidebarGroup,
 SidebarGroupLabel,
 SidebarMenu,
 SidebarMenuButton,
 SidebarMenuItem,
 SidebarMenuSub,
 SidebarMenuSubButton,
 SidebarMenuSubItem,
 useSidebar,
} from "@/components/ui/sidebar";
import {
 Tooltip,
 TooltipContent,
 TooltipTrigger,
} from "@/components/ui/tooltip";

import { type NavGroup } from "@/lib/constants/dashboard-nav";
import { OrganizationRoutesType, ROUTE_BUILDER } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";
import { Route } from "next";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

export function NavMain({ items, title }: NavGroup) {
 const pathname = usePathname();
 const params = useParams();
 const orgId = params.orgId as string;
 const { state, isMobile } = useSidebar();
 return (
  <SidebarGroup className={"!py-0"}>
   {state !== "collapsed" && title && (
    <SidebarGroupLabel>{title}</SidebarGroupLabel>
   )}
   <SidebarMenu>
    {items.map((item) => {
     const path = (
      item.relatedTo === "organization"
       ? ROUTE_BUILDER.organization(orgId, item.url as OrganizationRoutesType)
       : item.url
     ) as Route;

     if (item.items && item.items.length > 0) {
      if (state === "collapsed" && !isMobile) {
       return (
        <SidebarMenuItem key={item.title}>
         <DropdownMenu modal={false}>
          <Tooltip disableHoverableContent>
           <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
             <SidebarMenuButton
              isActive={pathname === path}
              className="cursor-pointer aria-[expanded=true]:bg-sidebar-accent">
              {item.icon && <item.icon />}
              <span>{item.title}</span>
              <ChevronRight className="ml-auto" />
             </SidebarMenuButton>
            </DropdownMenuTrigger>
           </TooltipTrigger>
           <TooltipContent
            side="right"
            align="center"
            className="pointer-events-none">
            {item.title}
           </TooltipContent>
          </Tooltip>
          <DropdownMenuContent side="right" align="start" sideOffset={4}>
           <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
           <DropdownMenuSeparator />
           {item.items.map((subItem) => {
            const subPath = (
             subItem.relatedTo === "organization"
              ? ROUTE_BUILDER.organization(
                 orgId,
                 subItem.url as OrganizationRoutesType,
                )
              : subItem.url
            ) as Route;
            return (
             <DropdownMenuItem
              key={subItem.title}
              className={cn(
               "cursor-pointer hover:bg-sidebar-accent duration-200 ease-in-out",
               pathname === subPath && "bg-sidebar-accent",
              )}
              asChild>
              <Link href={subPath} className="cursor-pointer">
               <span>{subItem.title}</span>
              </Link>
             </DropdownMenuItem>
            );
           })}
          </DropdownMenuContent>
         </DropdownMenu>
        </SidebarMenuItem>
       );
      }

      return (
       <Collapsible
        key={item.title}
        asChild
        defaultOpen={pathname === path}
        className="group/collapsible">
        <SidebarMenuItem>
         <CollapsibleTrigger asChild>
          <SidebarMenuButton
           tooltip={item.title}
           isActive={pathname === path}
           className="cursor-pointer">
           {item.icon && <item.icon />}
           <span>{item.title}</span>
           <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
         </CollapsibleTrigger>
         <CollapsibleContent>
          <SidebarMenuSub>
           {item.items?.map((subItem) => {
            const subPath = (
             subItem.relatedTo === "organization"
              ? ROUTE_BUILDER.organization(
                 orgId,
                 subItem.url as OrganizationRoutesType,
                )
              : subItem.url
            ) as Route;
            return (
             <SidebarMenuSubItem key={subItem.title}>
              <SidebarMenuSubButton asChild isActive={pathname === subPath}>
               <Link href={subPath}>
                <span>{subItem.title}</span>
               </Link>
              </SidebarMenuSubButton>
             </SidebarMenuSubItem>
            );
           })}
          </SidebarMenuSub>
         </CollapsibleContent>
        </SidebarMenuItem>
       </Collapsible>
      );
     }

     return (
      <SidebarMenuItem key={item.title}>
       <Tooltip disableHoverableContent>
        <TooltipTrigger asChild>
         <SidebarMenuButton
          asChild
          isActive={pathname === path}
          className="cursor-pointer">
          <Link href={path} className="cursor-pointer">
           {item.icon && <item.icon />}
           <span>{item.title}</span>
          </Link>
         </SidebarMenuButton>
        </TooltipTrigger>
        <TooltipContent
         side="right"
         align="center"
         hidden={state !== "collapsed" || isMobile}
         className="pointer-events-none">
         {item.title}
        </TooltipContent>
       </Tooltip>
      </SidebarMenuItem>
     );
    })}
   </SidebarMenu>
  </SidebarGroup>
 );
}
