"use client";

import {
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";
import { AlertTriangle, Link, Trash2, User as UserIcon } from "lucide-react";

import { deleteUser } from "@/actions/server/auth.controllers";
import { UserAccountsReturnType } from "@/actions/server/user.controllers";
import PasswordDialog from "@/components/global/PasswordDialog";
import SocialAuth from "@/components/global/social-auth";
import { Button } from "@/components/ui/button";
import { User } from "@/lib/auth/auth.config";
import { usePromise } from "@/lib/context/server-action-context";
import { useRouter } from "next/navigation";
import { use } from "react";
import { toast } from "sonner";
import InsideCard from "../../../../components/global/InsideCard";

export const SettingsAccount = ({
 accountsPromise,
}: {
 accountsPromise: UserAccountsReturnType;
}) => {
 const router = useRouter();
 const { data: accounts, success, error } = use(accountsPromise);
 if (!success) {
  toast.error(`Failed to fetch accounts: ${error}`);
 }
 const userPromise = usePromise<User>("user");
 const user = userPromise; // Alias for compatibility with existing code or direct usage

 const handleDeleteUser = async (password: string) => {
  const { success, error } = await deleteUser({
   password: password,
  });
  if (!success || !!error) {
   toast.error(`Failed to delete user: ${error}`);
   return;
  }
  toast.success(`User deleted successfully`);
  router.refresh();
 };

 return (
  <>
   <CardHeader>
    <CardTitle>Account Settings</CardTitle>
    <CardDescription>
     Manage your account identity and connections.
    </CardDescription>
   </CardHeader>
   <Separator />
   <CardContent>
    <div className="flex flex-col gap-6">
     <div className="grid gap-4 md:grid-cols-2">
      {/* Email */}
      <InsideCard title="Account" icon={<UserIcon className="size-4" />}>
       <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
         <Typography variant="muted" className="text-xs">
          Your email address is managed via your identity provider.
         </Typography>
         <Input value={user?.email} disabled className="bg-muted/50" />
        </div>
        <div className="flex flex-col gap-2">
         <Typography variant="muted" className="text-xs">
          Your phone number is managed via your identity provider.
         </Typography>
         <Input value={user?.phone} disabled className="bg-muted/50" />
        </div>
       </div>
      </InsideCard>

      {/* Connected Accounts */}
      <InsideCard title="Connected Accounts" icon={<Link className="size-4" />}>
       <SocialAuth mode="connect" accounts={accounts} providers={["google"]} />
      </InsideCard>
     </div>

     <Separator />

     <InsideCard
      title="Danger Zone"
      icon={<AlertTriangle className="size-4 text-destructive" />}
      variant="destructive"
      className="border-destructive/50">
      <div className="flex flex-col space-y-4">
       <Typography variant="small" as="p">
        Permanently delete your account and all associated data. This action
        cannot be undone.
       </Typography>
       <PasswordDialog
        title="Delete Account"
        variant="destructive"
        description="Enter your password to delete your account"
        onSubmit={handleDeleteUser}
        buttonLabel="Delete Account">
        <Button variant="destructive" className="w-full sm:w-auto">
         <Trash2 className="mr-2 size-4" />
         Delete Account
        </Button>
       </PasswordDialog>
       {/* <AppAlertDialog
        trigger={
         <Button variant="destructive" className="w-full sm:w-auto">
          <Trash2 className="mr-2 size-4" />
          Delete Account
         </Button>
        }
        title="Delete Account?"
        description={
         <>
          This will permanently delete your account and all associated data.
          This action cannot be undone.
         </>
        }
        actionText="Delete Account"
        variant="destructive"
        onAction={handleDeleteUser}
       /> */}
      </div>
     </InsideCard>
    </div>
   </CardContent>
  </>
 );
};

export default SettingsAccount;
