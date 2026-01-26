import { eq } from "drizzle-orm";
import { pgView } from "drizzle-orm/pg-core";
import { members, users } from "../schemas/auth.schema";

export const membersView = pgView("members_view").as((qb) => {
 return qb
  .select({
   // Member specific fields
   id: members.id,
   organizationId: members.organizationId,
   role: members.role,
   joinedAt: members.createdAt, // Aliased for clarity if needed

   // User specific fields (Flattens the structure)
   userId: users.id.as("user_id"),
   userName: users.name,
   userEmail: users.email,
   userImage: users.image,
  })
  .from(members)
  .innerJoin(users, eq(members.userId, users.id));
});
