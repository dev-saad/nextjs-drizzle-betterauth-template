import { getInvitation } from "@/actions/server/organization.controllers";
import { auth } from "@/lib/auth/auth.config";
import { QUERY_KEYS, ROUTES } from "@/lib/constants/routes";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
 const searchParams = req.nextUrl.searchParams;
 const id = searchParams.get("id");

 if (!id) {
  return new Response("Missing invitation ID", { status: 400 });
 }

 const session = await auth.api.getSession({
  headers: await headers(),
 });

 // 1. Validate Invitation
 const {
  data: invitation,
  error,
  success,
 } = await getInvitation({
  id,
 });

 if (error || !success || !invitation) {
  // If invalid, we can redirect to the accept page anyway, where the UI will show "Invalid"
  // Or we can return an error here.
  // The user said: "throw error if invitation is not valid"
  // Since this is an API route intended for redirection, we effectively "throw" by redirecting to an error state or showing plain text?
  // Let's redirect to the page but with an error param?
  // Or just let the page handle the invalid ID (as it does now with InvalidInvitationCard)
  // For the purpose of "Controller", let's redirect to the page.
  return redirect(`${ROUTES.ACCEPT_INVITATION}/${id}`);
 }

 // 2. Check Session
 if (!session) {
  const signInUrl = new URL(ROUTES.SIGN_IN, req.url);
  // Redirect back to THIS api route? Or to the page?
  // User said: "then after login redirect the user to the new page"
  // So we redirect to the Acceptance Page directly.
  signInUrl.searchParams.set(
   QUERY_KEYS.redirectTo,
   `${ROUTES.ACCEPT_INVITATION}/${id}`,
  );
  return redirect(signInUrl.toString());
 }

 // 3. All good, redirect to acceptance page
 return redirect(`${ROUTES.ACCEPT_INVITATION}/${id}`);
}
