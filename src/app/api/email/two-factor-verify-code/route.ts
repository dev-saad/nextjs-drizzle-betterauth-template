import TwoStepVerifyCodeEmail from "@/components/global/emails/two-step-verify-code-email";
import { User } from "@/lib/auth/auth.config";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export interface TwoFactorVerifyCodeBody {
 user: User;
 otp: string;
}

export async function POST(req: Request) {
 try {
  const body = await req.json();
  const { user, otp } = body as TwoFactorVerifyCodeBody;

  if (!user || !user.email || !otp) {
   return new Response("Missing required fields", { status: 400 });
  }

  const res = await resend.emails.send({
   from: "hi@alsaadkarim.com",
   to: [user.email],
   subject: "Flowket - Two Factor Verify Code",
   react: TwoStepVerifyCodeEmail({ otpCode: otp }),
  });

  if (res.error) {
   return new Response(res.error.message ?? "Failed to send email", {
    status: res.error.statusCode ?? 500,
   });
  }

  return new Response("Email sent successfully", { status: 200 });
 } catch (error) {
  return new Response("Failed to send email", { status: 500 });
 }
}
