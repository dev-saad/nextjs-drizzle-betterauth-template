// Enum type — same as your DB enum
export const BUSINESS_TYPES = [
 "E-commerce",
 "Retail",
 "Wholesale",
 "Services",
] as const;
export type Industry = (typeof BUSINESS_TYPES)[number];

// Category definitions grouped by industry
export const BUSINESS_CATEGORIES: Record<Industry, string[]> = {
 "E-commerce": [
  "Fashion & Apparel",
  "Electronics & Gadgets",
  "Health & Beauty",
  "Home & Living",
  "Groceries & Essentials",
  "Books & Stationery",
  "Sports & Fitness",
  "Pet Supplies",
  "Toys & Games",
  "Automotive Accessories",
  "Digital Products",
  "Jewelry & Accessories",
 ],
 Retail: [
  "Clothing & Footwear",
  "Supermarket / Grocery",
  "Furniture & Home Decor",
  "Pharmacy / Health Store",
  "Hardware / Tools",
  "Gifts & Handicrafts",
  "Bookstore / Stationery",
  "Toy Shop",
 ],
 Wholesale: [
  "Consumer Electronics",
  "Industrial Supplies",
  "Fashion & Apparel (Bulk)",
  "Food & Beverage Distribution",
  "Building Materials",
  "Office Supplies",
  "Auto Parts",
  "Medical Supplies",
  "Cleaning & Hygiene Products",
  "Household Goods",
 ],
 Services: [
  "Marketing / Digital Agency",
  "IT / Software Development",
  "Logistics / Courier",
  "Printing & Packaging",
  "Event Management",
  "Consulting",
  "Repair & Maintenance",
  "Accounting / Finance",
  "Education / Training",
  "Healthcare / Clinics",
  "Real Estate / Property Management",
 ],
};

// Optional helper functions
export const getCategoriesByIndustry = (industry: Industry) =>
 BUSINESS_CATEGORIES[industry] || [];

export const getAllCategories = () => Object.values(BUSINESS_CATEGORIES).flat();
