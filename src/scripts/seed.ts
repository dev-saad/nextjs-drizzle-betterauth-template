// src/scripts/seed-audit.ts
import { db } from "@/lib/drizzle/db"; // Ensure this path matches your db instance
import {
 actionsEnum,
 entityTypesEnum,
 members,
 organizations,
 users,
} from "@/lib/drizzle/schemas/schema";
import { faker } from "@faker-js/faker";
import "dotenv/config";

// Helper to pick random item from array
const random = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

async function main() {
 console.log("🌱 Generating Audit Logs...");

 // 1. Fetch valid IDs to ensure Foreign Key constraints work
 const allOrgs = await db.select({ id: organizations.id }).from(organizations);
 const allUsers = await db.select({ id: users.id }).from(users);

 if (allOrgs.length === 0 || allUsers.length === 0) {
  console.error("❌ No Organizations or Users found. Seed them first!");
  process.exit(1);
 }

 const logsToInsert: (typeof members.$inferInsert)[] = [];

 // 2. Generate 50 dummy logs
 for (let i = 0; i < 500; i++) {
  const orgId = random(allOrgs).id;
  const userId = random(allUsers).id;
  const action = random(actionsEnum.enumValues);
  const entityType = random(entityTypesEnum.enumValues);

  logsToInsert.push({
   id: faker.string.uuid(),
   createdAt: faker.date.recent({ days: 30 }),
   userId,
   organizationId: orgId,
   role: "editor 2",
  });
 }

 // 3. Batch insert
 await db.insert(members).values(logsToInsert);

 console.log(`✅ Successfully seeded ${logsToInsert.length} audit logs!`);
 process.exit(0);
}

main().catch((err) => {
 console.error("❌ Seeding failed:", err);
 process.exit(1);
});
