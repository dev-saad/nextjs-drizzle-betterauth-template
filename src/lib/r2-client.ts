import { cloudflare } from "@better-upload/server/clients";

export const r2Client = cloudflare({
 accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
 accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
 secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
});
