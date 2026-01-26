import InvitationEmail, {
 InvitationEmailProps,
} from "@/components/global/emails/invitation-email";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
 try {
  const body = await req.json();
  const { id, email, inviter, organization, role, inviteLink } =
   body as InvitationEmailProps;

  if (!email || !inviter || !organization || !role || !inviteLink) {
   return new Response("Missing required fields", { status: 400 });
  }

  const res = await resend.emails.send({
   from: "hi@alsaadkarim.com", // Keeping consistent with verify-email route
   to: [email],
   subject: `Join ${organization.name} on FlowKet`,
   react: InvitationEmail({
    id,
    email,
    inviter,
    organization,
    role,
    inviteLink,
   }),
  });

  if (res.error) {
   return new Response(res.error.message ?? "Failed to send email", {
    status: 500,
   });
  }

  return new Response("Email sent successfully", { status: 200 });
 } catch (error) {
  console.error("Failed to send invitation email:", error);
  return new Response("Failed to send email", { status: 500 });
 }
}
