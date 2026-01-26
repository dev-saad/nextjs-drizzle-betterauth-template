import ResetPassword from "@/components/global/emails/request-reset-password-email";
import { User } from "@/lib/auth/auth.config";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export interface ResetPasswordBody {
 user: User;
 url: string;
 token: string;
}

export async function POST(req: Request) {
 try {
  const body = await req.json();
  const { user, url, token } = body as ResetPasswordBody;

  if (!user || !user.email || !url || !token) {
   return new Response("Missing required fields", { status: 400 });
  }

  const res = await resend.emails.send({
   from: "hi@alsaadkarim.com",
   to: [user.email],
   subject: "Flowket - Reset Password",
   react: ResetPassword({ url }),
  });

  if (res.error) {
   return new Response(res.error.message ?? "Failed to send email", {
    status: 500,
   });
  }

  return new Response("Email sent successfully", { status: 200 });
 } catch (error) {
  return new Response("Failed to send email", { status: 500 });
 }
}
