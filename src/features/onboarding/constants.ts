import { QUERY_VALUES } from "@/lib/constants/routes";

export const steps = [
 {
  value: QUERY_VALUES.onboardingSteps[0],
  title: "Personal Information",
  description: "Tell us about yourself",
  fields: ["user.phone", "user.name"] as const,
 },
 {
  value: QUERY_VALUES.onboardingSteps[1],
  title: "About your business",
  description: "Tell us about your business",
  fields: [
   "organization.settings.businessType",
   "organization.settings.businessCategory",
   "organization.settings.businessWebsite",
   "organization.settings.businessFacebookUrl",
   "organization.settings.businessInstagramUrl",
   "organization.settings.businessRegistrationNumber",
  ] as const,
 },
 {
  value: QUERY_VALUES.onboardingSteps[2],
  title: "Organization setup",
  description: "Setup your organization",
  fields: [
   "organization.logo",
   "organization.name",
   "organization.settings.addressCountry",
   "organization.settings.addressPostalCode",
   "organization.settings.addressLine1",
   "organization.settings.addressLine2",
   "organization.settings.addressCity",
   "organization.settings.addressState",
   "organization.settings.localeCurrency",
   "organization.settings.localeTimezone",
  ] as const,
 },
 {
  value: QUERY_VALUES.onboardingSteps[3],
  title: "Review",
  description: "Review your business details",
  fields: [] as const,
 },
];
