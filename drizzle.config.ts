import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
 out: "./drizzle",
 schema: "./src/lib/drizzle/index.ts",
 dialect: "postgresql",
 dbCredentials: {
  url: process.env.DATABASE_URL!,
 },

 schemaFilter: ["public", "authentication"],
});
