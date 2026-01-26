"use client";

import {
 disableTwoFactor,
 enableTwoFactor,
 generateBackupCodes,
} from "@/actions/server/auth.controllers";
import PasswordDialog from "@/components/global/PasswordDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
 Card,
 CardContent,
 CardDescription,
 CardFooter,
 CardHeader,
 CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "@/lib/auth/auth.config";
import { QUERY_KEYS, QUERY_VALUES, ROUTES } from "@/lib/constants/routes";
import { useTwoFactor } from "@/lib/context/two-factor-context";
import { Shield, ShieldCheck, ShieldEllipsis } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function TwoFactorCard({ user }: { user: User }) {
 const router = useRouter();
 const { setSetupData } = useTwoFactor();

 if (user.twoFactorEnabled === null) {
  return <Skeleton className="w-full h-[200px] rounded-xl" />;
 }

 return (
  <Card>
   <CardHeader>
    <CardTitle className="flex items-center gap-2">
     <div className="p-2 bg-accent rounded-md">
      {user.twoFactorEnabled ? (
       <ShieldCheck className="size-4 text-primary" />
      ) : (
       <Shield className="size-4 text-primary" />
      )}
     </div>
     Two-Factor Authentication
     {user.twoFactorEnabled ? (
      <Badge variant="default" className="bg-green-600 hover:bg-green-700">
       Enabled
      </Badge>
     ) : (
      <Badge variant="secondary">Disabled</Badge>
     )}
    </CardTitle>
    <CardDescription>
     Add an extra layer of security to your account.
    </CardDescription>
   </CardHeader>
   <CardContent>
    <div className="text-sm text-muted-foreground">
     {user.twoFactorEnabled
      ? "Your account is protected with two-factor authentication. You will be asked for a code when you sign in."
      : "Secure your account by requiring a code from your mobile phone in addition to your password."}
    </div>
   </CardContent>
   <CardFooter>
    {user.twoFactorEnabled ? (
     <div className="flex items-center gap-4">
      <PasswordDialog
       title="Disable Two-Factor Authentication"
       description="Enter your password to disable two-factor authentication."
       onSubmit={async (password) => {
        const { success, error } = await disableTwoFactor({
         password: password,
        });
        if (!success || !!error) {
         return toast.error(
          `Disable two-factor authentication failed: ${error}`,
         );
        }
        toast.success("Two-factor authentication disabled successfully");
        router.refresh();
       }}
       buttonLabel="Disable 2FA">
       <Button variant="destructive">Disable 2FA</Button>
      </PasswordDialog>
      <PasswordDialog
       title="Generate Backup Codes"
       description="Enter your password to generate new backup codes. If you have existing backup codes, they will be replaced."
       onSubmit={async (password) => {
        const { data, success, error } = await generateBackupCodes({
         password: password,
        });
        if (!success || !!error) {
         return toast.error(`Generate backup codes failed: ${error}`);
        }
        if (success && data) {
         setSetupData({ backupCodes: data.backupCodes, totpURI: "" });
         toast.success("Backup codes generated successfully");
         router.push(
          `${ROUTES.USER.TWO_FACTOR}?${QUERY_KEYS.step}=${QUERY_VALUES.twoFactorSteps[1]}`,
         );
        }
       }}
       buttonLabel="Generate">
       <Button variant="outline">
        <ShieldEllipsis />
        Generate Backup Codes
       </Button>
      </PasswordDialog>
     </div>
    ) : (
     <PasswordDialog
      title="Enable Two-Factor Authentication"
      description="Enter your password to enable two-factor authentication."
      onSubmit={async (password) => {
       const { data, success, error } = await enableTwoFactor({
        password: password,
       });
       if (!success || !!error) {
        return toast.error(`Enable two-factor authentication failed: ${error}`);
       }
       !!data && setSetupData(data);
       router.push(
        `${ROUTES.USER.TWO_FACTOR}?${QUERY_KEYS.step}=${QUERY_VALUES.twoFactorSteps[0]}`,
       );
      }}
      buttonLabel="Enable 2FA">
      <Button className="w-full sm:w-auto">Enable 2FA</Button>
     </PasswordDialog>
    )}
   </CardFooter>
  </Card>
 );
}
