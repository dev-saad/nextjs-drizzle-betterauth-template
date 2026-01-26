import { getUserAdditional } from "@/actions/server/user.controllers";
import SettingsBilling from "@/features/user/components/billing/SettingsBilling";

import { redirect } from "next/navigation";

export default async function BillingPage() {
 const user = await getUserAdditional();

 if (!user.data || user.error || !user.success) {
  redirect("/sign-in");
 }

 return <SettingsBilling user={user.data} />;
}
