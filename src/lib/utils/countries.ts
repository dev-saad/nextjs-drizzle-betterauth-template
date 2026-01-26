// src/lib/utils/countries.ts
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

// Register once globally
try {
 countries.registerLocale(enLocale);
} catch (err) {
 // Avoid "locale already registered" in dev/hot reload
 if (process.env.NODE_ENV === "development") {
  console.warn("Locale already registered: en");
 }
}

// Export the configured instance
export default countries;
