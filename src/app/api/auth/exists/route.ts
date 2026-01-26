import { db } from "@/lib/drizzle/db";
import { users } from "@/lib/drizzle/schemas/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
 try {
  const searchParams = req.nextUrl.searchParams;
  const email = searchParams.get("email");
  const phone = searchParams.get("phone");

  // If neither parameter is provided
  if (!email && !phone) {
   return NextResponse.json(
    { error: "Email or phone parameter is required" },
    { status: 400 }
   );
  }

  // Check email if provided
  if (email) {
   const exists = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

   return NextResponse.json({
    exists: exists.length > 0,
   });
  }

  // Check phone if provided
  if (phone) {
   const exists = await db
    .select()
    .from(users)
    .where(eq(users.phone, phone))
    .limit(1);

   return NextResponse.json({ exists: exists.length > 0 });
  }
 } catch (error) {
  console.error("Error checking uniqueness:", error);
  return NextResponse.json(
   { error: "Server error checking uniqueness" },
   { status: 500 }
  );
 }
}
