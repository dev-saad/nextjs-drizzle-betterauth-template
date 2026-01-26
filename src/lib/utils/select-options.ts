import { codes } from "currency-codes";
import { BUSINESS_CATEGORIES } from "../constants/industries";
import countries from "./countries";

export const countriesOptions = Object.entries(
 countries.getNames("en", { select: "official" })
)
 .map(([alpha2, name]) => ({
  label: name,
  value: alpha2,
 }))
 .sort((a, b) => a.label.localeCompare(b.label));

export const currencyCodeOptions = codes()
 .map((code) => ({
  label: code,
  value: code,
 }))
 .sort((a, b) => a.label.localeCompare(b.label));

export const timezoneOptions = Intl.supportedValuesOf("timeZone")
 .map((timezone) => ({
  label:
   timezone +
   " " +
   `(${
    new Intl.DateTimeFormat("en-US", {
     timeZone: timezone,
     timeZoneName: "shortOffset",
    })
     .formatToParts(new Date())
     .find((part) => part.type === "timeZoneName")?.value || ""
   })`,
  value: timezone,
 }))
 .sort((a, b) => a.label.localeCompare(b.label));

export const weightUnitOptions = [
 { label: "Kilograms (kg)", value: "kg" },
 { label: "Pounds (lb)", value: "lb" },
 { label: "Ounces (oz)", value: "oz" },
 { label: "Grams (g)", value: "g" },
];

export const dimensionUnitOptions = [
 { label: "Centimeters (cm)", value: "cm" },
 { label: "Inches (in)", value: "in" },
 { label: "Meters (m)", value: "m" },
 { label: "Millimeters (mm)", value: "mm" },
];

export const languageOptions = [
 { label: "English", value: "en" },
 { label: "Bengali", value: "bn" },
 { label: "Spanish", value: "es" },
 { label: "French", value: "fr" },
 { label: "German", value: "de" },
 { label: "Italian", value: "it" },
 { label: "Portuguese", value: "pt" },
 { label: "Russian", value: "ru" },
 { label: "Chinese", value: "zh" },
 { label: "Japanese", value: "ja" },
 { label: "Korean", value: "ko" },
];

export const businessTypeOptions = Object.keys(BUSINESS_CATEGORIES).map(
 (type) => ({
  label: type,
  value: type,
 })
);

export const categoryOptions = (type: string) =>
 BUSINESS_CATEGORIES[type as keyof typeof BUSINESS_CATEGORIES]
  ?.map((industry) => ({
   label: industry,
   value: industry,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));
