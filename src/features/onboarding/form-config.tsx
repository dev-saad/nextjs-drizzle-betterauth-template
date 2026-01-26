import { BUSINESS_TYPES } from "@/lib/constants/industries";
import { formOptions } from "@tanstack/react-form";
import { OnboardingFormSchemaType } from "./schema";

export const onboardingFormOptions = formOptions({
 // Define any global form options for onboarding forms here
 defaultValues: {
  organization: {
   name: "",
   slug: "",
   logo: undefined,
   metadata: {
    onboarding: {
     isComplete: false,
    },
    plan: {
     tier: "free",
     status: "active",
     limits: {
      maxProducts: 100,
      maxOrdersPerMonth: 50,
     },
    },
    flags: [],
   },
   settings: {
    addressLine1: "",
    addressLine2: "",
    addressCity: "",
    addressState: "",
    addressPostalCode: "",
    addressCountry: "",
    businessType: BUSINESS_TYPES[0],
    businessCategory: "",
    businessWebsite: "",
    businessFacebookUrl: "",
    businessInstagramUrl: "",
    businessRegistrationNumber: "",
    localeCurrency: "",
    localeTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    localeLanguage: "en",
    localeWeightUnit: "kg",
    localeDimensionUnit: "cm",
   },
  },
  user: {
   name: "",
   phone: "",
  },
 } as OnboardingFormSchemaType,
});
