import { Pool } from "@neondatabase/serverless";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-serverless";
import { relations } from "./relations";
import * as schema from "./schemas/schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
export const db = drizzle({
 client: pool,
 schema: { ...schema },
 relations: { ...relations },
});

// export const dbWithRLS = db.;

// import "dotenv/config";
// import { drizzle } from "drizzle-orm/postgres-js";
// import postgres from "postgres";
// import { relations } from "./relations";
// import * as schema from "./schemas/schema";

// // const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
// let connectionString = process.env.DATABASE_URL!;
// // Disable prefetch as it is not supported for "Transaction" pool mode
// export const client = postgres(connectionString, { prepare: false });

// export const db = drizzle({
//  client,
//  schema: { ...schema },
//  relations: { ...relations },
// });
