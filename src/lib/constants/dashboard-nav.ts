import {
 LayoutDashboard,
 LifeBuoy,
 Send,
 Settings,
 Users2,
 type LucideIcon,
} from "lucide-react";
import { ROUTES } from "./routes";

export interface Team {
 name: string;
 logo: LucideIcon;
 plan: string;
}

export interface NavItem {
 title: string;
 url: string;
 icon?: LucideIcon;
 isActive?: boolean;
 relatedTo?: "organization";
 items?: NavItem[];
}

export interface NavGroup {
 title?: string;
 items: NavItem[];
 relatedTo?: "organization";
}

export interface User {
 name: string;
 email: string;
 avatar: string;
}

export const NAV_MAIN: NavGroup[] = [
 /* =======================
  * OVERVIEW
  * ======================= */
 {
  title: "Overview",
  items: [
   {
    title: "Dashboard",
    url: ROUTES.ORGANIZATION.OVERVIEW,
    icon: LayoutDashboard,
    relatedTo: "organization",
   },
  ],
 },

 /* =======================
  * SETTINGS
  * ======================= */
 {
  title: "Settings",
  items: [
   {
    title: "General",
    icon: Settings,
    relatedTo: "organization",
    url: ROUTES.ORGANIZATION.SETTINGS.GENERAL,
   },
   {
    title: "Teams & Roles",
    icon: Users2,
    relatedTo: "organization",
    url: ROUTES.ORGANIZATION.SETTINGS.TEAM_ROLES.ROOT,
    items: [
     {
      title: "Members",
      url: ROUTES.ORGANIZATION.SETTINGS.TEAM_ROLES.MEMBERS,
      relatedTo: "organization",
     },
     {
      title: "Roles",
      url: ROUTES.ORGANIZATION.SETTINGS.TEAM_ROLES.ROLES,
      relatedTo: "organization",
     },
    ],
   },
  ],
 },
];

export const NAV_SECONDARY: NavGroup[] = [
 {
  items: [
   {
    title: "Support",
    url: "#",
    icon: LifeBuoy,
   },
   {
    title: "Feedback",
    url: "#",
    icon: Send,
   },
  ],
 },
];

export const NAV_PROJECTS: NavGroup[] = [];
