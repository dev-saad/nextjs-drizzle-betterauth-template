// src/lib/routes.ts

import { Route } from "next";
import z from "zod";

// ✅ Static routes
export const ROUTES = {
 ROOT: "/",
 SIGN_IN: "/sign-in",
 SIGN_UP: "/sign-up",
 ONBOARDING: "/onboarding",
 REQUEST_RESET_PASSWORD: "/request-reset-password",
 RESET_PASSWORD: "/reset-password",
 TWO_FACTOR_VERIFICATION: "/two-factor/verify",
 TWO_FACTOR_OPTIONS: "/two-factor/options",
 ACCEPT_INVITATION: "/accept-invitation",
 ORGANIZATION: {
  ROOT: "/organization",
  DEFAULT: "/overview",
  OVERVIEW: "/overview",
  ANALYTICS: "/analytics",
  CREATE: "/create",
  SETTINGS: {
   ROOT: "/settings",
   GENERAL: "/settings",
   TEAM_ROLES: {
    ROOT: "/settings/teams-roles",
    MEMBERS: "/settings/teams-roles/members",
    ROLES: "/settings/teams-roles/roles",
   },
   BILLING: "/settings/billing",
   DEVELOPERS: "/settings/developers",
   AUDIT_LOGS: "/settings/audit-logs",
  },
  INTEGRATIONS: {
   ROOT: "/integrations",
   STORES: "/integrations/stores",
   LOGS: "/integrations/logs",
  },
  COURIERS: {
   ROOT: "/couriers",
   OVERVIEW: "/couriers/overview",
   RULES: "/couriers/rules",
  },
  CUSTOMERS: {
   ROOT: "/customers",
   LIST: "/customers/list",
   SEGMENTS: "/customers/segments",
  },
  PURCHASING: {
   ROOT: "/purchasing",
   ORDERS: "/purchasing/orders",
   SUPPLIERS: "/purchasing/suppliers",
  },
  INVENTORY: {
   ROOT: "/inventory",
   STOCK: "/inventory/stock",
   TRANSFERS: "/inventory/transfers",
   ADJUSTMENTS: "/inventory/adjustments",
   WAREHOUSES: "/inventory/warehouses",
  },
  PRODUCTS: {
   ROOT: "/products",
   LIST: "/products/list",
   COLLECTIONS: "/products/collections",
   ATTRIBUTES: "/products/attributes",
  },
  ORDERS: {
   ROOT: "/orders",
   LIST: "/orders/list",
   DRAFTS: "/orders/drafts",
   RETURNS: "/orders/return",
   SHIPMENTS: "/orders/shipments",
  },
 },
 USER: {
  ROOT: "/user",
  DEFAULT: "/user/profile",
  PROFILE: "/user/profile",
  ACCOUNT: "/user/account",
  SETTINGS: "/user/settings",
  SECURITY: "/user/security",
  TWO_FACTOR: "/user/security/two-factor",
  NOTIFICATIONS: "/user/notifications",
  BILLING: "/user/billing",
 },
} as const;

export type OrganizationRoutesType =
 (typeof ROUTES.ORGANIZATION)[keyof typeof ROUTES.ORGANIZATION];

export const ISOLATED_ROUTES = [
 ROUTES.USER.ROOT,
 ROUTES.ORGANIZATION.ROOT + ROUTES.ORGANIZATION.CREATE,
];

// ✅ Dynamic route builders
export const ROUTE_BUILDER = {
 organization: (
  orgId: string,
  path?: (typeof ROUTES.ORGANIZATION)[keyof typeof ROUTES.ORGANIZATION],
 ): Route =>
  `/organization/${orgId}${path ?? ROUTES.ORGANIZATION.DEFAULT}` as Route,
 // account: (path?: (typeof ROUTES.ACCOUNT)[keyof typeof ROUTES.ACCOUNT]) =>
 //  `/account${path ?? "/profile"}` as Route,
 products: (orgId: string, projectId: string) =>
  `/organization/${orgId}/project/${projectId}`,
 user: (userId: string) => `/users/${userId}`,
};

export const PARAMS_TYPE = {
 orgId: z.string(),
};

export const PARAMS = Object.fromEntries(
 Object.keys(PARAMS_TYPE).map((key) => [key, key]),
) as { [K in keyof typeof PARAMS_TYPE]: string };

// ✅ Query parameter utilities
export const QUERY_KEYS = {
 redirectTo: "redirectTo",
 search: "search",
 filters: "filters",
 step: "step",
 method: "method",
 limit: "limit",
 page: "page",
 sort: "sort",
 role: "role",
 createdAt: "createdAt",
 permissions: "permissions",
};

export const QUERY_VALUES = {
 onboardingSteps: [
  "personal",
  "business",
  "organization",
  "review",
  "submitting",
 ],
 twoFactorSteps: ["qr", "backup"],
 twoFactorMethods: ["totp", "email", "backup"],
 limit: [10, 20, 50, 100],
} as const;

export type QueryValuesType = typeof QUERY_VALUES;

// ✅ Example combined helpers
export const buildRedirectURL = (target: string) => {
 const params = new URLSearchParams();
 params.set(QUERY_KEYS.redirectTo, target);
 return `${ROUTES.SIGN_IN}?${params.toString()}`;
};
