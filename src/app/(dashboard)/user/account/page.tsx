import { getUserAccounts } from "@/actions/server/user.controllers";
import SettingsAccount from "@/features/user/components/account/SettingsAccount";

export default function AccountPage() {
 const accountsPromise = getUserAccounts();

 return <SettingsAccount accountsPromise={accountsPromise} />;
}
