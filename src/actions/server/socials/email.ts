// import NotionMagicLinkEmail from "@/components/global/emails/notion-magic-link";
// import { userSelectType } from "@/lib/types/user";
// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY!);

// interface SendVerificationEmailProps {
//  user: Omit<userSelectType, "phone">;
//  url: string;
//  token: string;
// }

// export const sendVerificationEmail = async ({
//  user,
//  url,
//  token,
// }: SendVerificationEmailProps) => {
//  const { data, error } = await resend.emails.send({
//   from: "hi@alsaadkarim.com",
//   to: [user.email],
//   subject: "Hello world",
//   // html: `<strong>Verify your email by clicking <a href="${url}">here</a></strong>`,
//   react: NotionMagicLinkEmail({ loginCode: url }),
//  });
//  console.log("Resend response:", { data, error });
// };
