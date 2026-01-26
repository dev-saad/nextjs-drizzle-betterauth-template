import { z } from "zod";
import { nameSchema, phoneSchema } from "../../lib/global.schema";
import { organizationFormSchema } from "../organization/settings/schema";

export const onboardingFormSchema = z.object({
 organization: organizationFormSchema,
 user: z.object({
  name: nameSchema,
  phone: phoneSchema,
 }),
});

export type OnboardingFormSchemaType = z.infer<typeof onboardingFormSchema>;
