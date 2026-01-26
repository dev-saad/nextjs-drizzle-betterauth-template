// import {
//  organizationCreateSchema,
//  organizationUpdateSchema,
// } from "@/actions/schemas/organization";
// import { getOrganizationById } from "@/actions/server/organization.controllers";
// import { organizationFormSchema } from "@/features/dashboard/settings/schema";
// import z from "zod";
// import { organizations } from "../drizzle/schemas/auth.schema";

// export type OrganizationSelectType = Partial<
//  Omit<typeof organizations.$inferSelect, "updatedAt">
// >;

// export type OrganizationInsertType = Omit<
//  typeof organizations.$inferInsert,
//  "id" | "slug"
// >;
// export type OrganizationUpdateType = Partial<OrganizationInsertType>;

// // Action Types
// export type OrganizationCreateSchemaType = z.infer<
//  typeof organizationCreateSchema
// >;
// export type OrganizationUpdateSchemaType = z.infer<
//  typeof organizationUpdateSchema
// >;

// // Return Type
// export type OrganizationReturnType = Awaited<
//  ReturnType<typeof getOrganizationById>
// >;

// // Form Types
// export type OrganizationFormSchemaType = z.infer<typeof organizationFormSchema>;
