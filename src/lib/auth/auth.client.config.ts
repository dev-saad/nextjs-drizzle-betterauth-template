import {
 inferAdditionalFields,
 organizationClient,
 twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react"; // make sure to import from better-auth/react
import { ac, ownerRole } from "../constants/permissions";
import type { auth } from "./auth.config";

export const authClient = createAuthClient({
 //you can pass client configuration here
 plugins: [
  organizationClient({
   ac: ac,
   roles: {
    owner: ownerRole,
   },
   dynamicAccessControl: {
    enabled: true,
   },
  }),
  twoFactorClient(),
  inferAdditionalFields<typeof auth>(),
 ],
 fetchOptions: {
  onError: async (context) => {
   const { response } = context;
   if (response.status === 429) {
    const retryAfter = response.headers.get("X-Retry-After");
    console.log(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
   }
  },
 },
});
