import { controlPlaneMetadataSchema } from "@/features/organization/settings/schema";
import { BUSINESS_TYPES, getAllCategories } from "@/lib/constants/industries";
import { UserPreferences } from "@/lib/types/user";
import {
 currencyCodeOptions,
 dimensionUnitOptions,
 languageOptions,
 timezoneOptions,
 weightUnitOptions,
} from "@/lib/utils/select-options";
import { sql } from "drizzle-orm";
import {
 boolean,
 index,
 jsonb,
 pgEnum,
 pgPolicy,
 pgSchema,
 pgTable,
 text,
 timestamp,
 uniqueIndex,
 uuid,
} from "drizzle-orm/pg-core";
import z from "zod";

// --- RLS Helpers ---
const authUid = sql`current_setting('app.current_user_id', true)`;
export const authSchema = pgSchema("authentication");

export const currencyEnum = pgEnum(
 "currency",
 currencyCodeOptions.map((option) => option.value) as [string, ...string[]],
);
export const businessTypeEnum = pgEnum("business_type", BUSINESS_TYPES);
export const businessCategoryEnum = pgEnum(
 "business_category",
 getAllCategories() as [string, ...string[]],
);
export const weightUnitEnum = pgEnum(
 "weight_unit",
 weightUnitOptions.map((option) => option.value) as [string, ...string[]],
);
export const dimensionUnitEnum = pgEnum(
 "dimension_unit",
 dimensionUnitOptions.map((option) => option.value) as [string, ...string[]],
);
export const languageEnum = pgEnum(
 "language",
 languageOptions.map((option) => option.value) as [string, ...string[]],
);
export const timezoneEnum = pgEnum(
 "timezone",
 timezoneOptions.map((option) => option.value) as [string, ...string[]],
);

export const users = authSchema.table(
 "users",
 {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  phone: text("phone"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
   .defaultNow()
   .$onUpdate(() => /* @__PURE__ */ new Date())
   .notNull(),
  activeOrganizationId: text("active_organization_id"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  preferences: jsonb("preferences").$type<UserPreferences>(),
 },
 (table) => [
  // 1. Fast login lookup
  index("user_email_idx").on(table.email),
  // 2. Dashboard sorting (Newest users first)
  index("user_created_at_idx").on(table.createdAt),
  // 3. Search optimization
  index("user_name_idx").on(table.name),
 ],
);

export const userAdditional = pgTable(
 "user_additional",
 {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
   .notNull()
   .unique()
   .references(() => users.id, { onDelete: "cascade" }),
  bio: text("bio"),
  line1: text("line1"),
  line2: text("line2"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postal_code"),
  country: text("country"),
  website: text("website"),
  socialLinks: jsonb("social_links").$type<{
   github?: string;
   linkedin?: string;
   twitter?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
   .defaultNow()
   .$onUpdate(() => /* @__PURE__ */ new Date())
   .notNull(),
 },
 (table) => [
  // 1. Join optimization
  index("user_additional_user_id_idx").on(table.userId),
 ],
);

export const sessions = authSchema.table(
 "sessions",
 {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
   .$onUpdate(() => /* @__PURE__ */ new Date())
   .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
   .notNull()
   .references(() => users.id, { onDelete: "cascade" }),
  activeOrganizationId: text("active_organization_id"),
 },
 (table) => [
  index("session_userId_idx").on(table.userId),
  index("session_token_idx").on(table.token), // Fast session validation
 ],
);

export const accounts = authSchema.table(
 "accounts",
 {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
   .notNull()
   .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
   .$onUpdate(() => /* @__PURE__ */ new Date())
   .notNull(),
 },
 (table) => [
  index("account_userId_idx").on(table.userId),
  // Composite index for OAuth lookups (e.g. finding google account 123)
  index("account_provider_account_idx").on(table.providerId, table.accountId),
 ],
);

export const verifications = authSchema.table(
 "verifications",
 {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
   .defaultNow()
   .$onUpdate(() => /* @__PURE__ */ new Date())
   .notNull(),
 },
 (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const organizations = authSchema.table(
 "organizations",
 {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
   .defaultNow()
   .$onUpdate(() => /* @__PURE__ */ new Date())
   .notNull(),
  metadata: jsonb("metadata")
   .$type<z.infer<typeof controlPlaneMetadataSchema>>()
   .default({} as z.infer<typeof controlPlaneMetadataSchema>)
   .notNull(),
 },
 (table) => [
  // 1. Slug lookup (app.com/org/slug)
  uniqueIndex("org_slug_idx").on(table.slug),
  // 2. Sorting by creation date
  index("org_created_at_idx").on(table.createdAt),
 ],
);

export const organizationSettings = authSchema.table(
 "organization_settings",
 {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: text("organization_id")
   .notNull()
   .unique()
   .references(() => organizations.id, { onDelete: "cascade" }),
  // Address
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  addressCity: text("address_city").notNull(),
  addressState: text("address_state").notNull(),
  addressPostalCode: text("address_postal_code").notNull(),
  addressCountry: text("address_country").notNull(),
  // Business
  businessType: businessTypeEnum("business_type").notNull(),
  businessCategory: text("business_category").notNull(),
  businessWebsite: text("business_website").notNull(),
  businessFacebookUrl: text("business_facebook_url"),
  businessInstagramUrl: text("business_instagram_url"),
  businessRegistrationNumber: text("business_registration_number"),
  // Locale
  localeCurrency: text("locale_currency").notNull(),
  localeTimezone: text("locale_timezone").notNull(),
  localeLanguage: text("locale_language").notNull(),
  localeWeightUnit: text("locale_weight_unit").notNull(),
  localeDimensionUnit: text("locale_dimension_unit").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
   .defaultNow()
   .$onUpdate(() => /* @__PURE__ */ new Date())
   .notNull(),
 },
 (table) => [
  // 1. Optimize fetching settings by Org ID
  index("org_settings_org_id_idx").on(table.organizationId),
 ],
);

export const organizationRoles = authSchema.table(
 "organization_roles",
 {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
   .notNull()
   .references(() => organizations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  permission: text("permission").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(
   () => /* @__PURE__ */ new Date(),
  ),
 },
 (table) => [index("org_roles_org_id_idx").on(table.organizationId)],
);

export const members = authSchema.table(
 "members",
 {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
   .notNull()
   .references(() => organizations.id, { onDelete: "cascade" }),
  userId: text("user_id")
   .notNull()
   .references(() => users.id, { onDelete: "cascade" }),
  role: text("role").default("member").notNull(),
  updatedAt: timestamp("updated_at")
   .defaultNow()
   .$onUpdate(() => /* @__PURE__ */ new Date())
   .notNull(),
  createdAt: timestamp("created_at").notNull(),
 },
 (table) => [
  // 1. Find all organizations a user belongs to (e.g., "My Organizations" list)
  index("members_user_id_idx").on(table.userId),

  // 2. Filter members by role (e.g., "Show me all Admins")
  index("members_org_role_idx").on(table.organizationId, table.role),

  // 3. ✅ PERFORMANCE CRITICAL: Sort members by date WITHIN an organization
  //    Query: "Get all members of Org X, newest first"
  index("members_org_created_at_idx").on(table.organizationId, table.createdAt),

  pgPolicy("all_members_access", {
   for: "all",
   to: "app_user",
   using: sql`EXISTS (
      SELECT 1 FROM authentication.members AS m
      WHERE m.organization_id = ${table.organizationId}
      AND m.user_id = ${authUid}
    )`,
  }),
 ],
);

export const invitations = authSchema.table(
 "invitations",
 {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
   .notNull()
   .references(() => organizations.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role"),
  status: text("status").default("pending").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  inviterId: text("inviter_id")
   .notNull()
   .references(() => users.id, { onDelete: "cascade" }),
 },
 (table) => [
  // 1. Find all invites for an email
  index("invitations_email_idx").on(table.email),
  // 2. Find all invites for an organization
  index("invitations_org_id_idx").on(table.organizationId),
 ],
);

export const twoFactor = authSchema.table(
 "two_factor",
 {
  id: text("id").primaryKey(),
  secret: text("secret").notNull(),
  backupCodes: text("backup_codes").notNull(),
  userId: text("user_id")
   .notNull()
   .references(() => users.id, { onDelete: "cascade" }),
 },
 (table) => [
  index("two_factor_user_id_idx").on(table.userId),
  index("two_factor_secret_idx").on(table.secret),
 ],
);
