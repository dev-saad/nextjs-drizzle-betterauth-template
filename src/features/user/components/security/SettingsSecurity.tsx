"use client";

import LogsViewer from "@/components/global/LogsViewer";
import { Button } from "@/components/ui/button";
import {
 Card,
 CardContent,
 CardDescription,
 CardFooter,
 CardHeader,
 CardTitle,
} from "@/components/ui/card";
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";
import { Session, User } from "@/lib/auth/auth.config";
import { usePromise } from "@/lib/context/server-action-context";
import { ActionResponse } from "@/lib/utils/safe-action";
import { Key, Monitor } from "lucide-react";
import { use, useState } from "react";
import { toast } from "sonner";
import ChangePasswordForm from "./ChangePasswordForm";
import SessionCard from "./SessionCard";
import TwoFactorCard from "./two-factor/TwoFactorCard";

const SettingsSecurity = ({
 sessionsPromise,
 //  securityLogsPromise,
}: {
 sessionsPromise: Promise<ActionResponse<Session[]>>;
 //  securityLogsPromise: Promise<ActionResponse<AuditLogsReturnType[]>>;
}) => {
 const user = usePromise<User>("user");
 const sessions = use(sessionsPromise);
 //  const logs = use(securityLogsPromise);
 const currentSession = usePromise<Session>("session");
 const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

 if (!!sessions.error) {
  toast.error(`Error fetching sessions: ${sessions.error}`);
 }

 return (
  <>
   <CardHeader>
    <CardTitle>Security Settings</CardTitle>
    <CardDescription>Manage your account security settings</CardDescription>
   </CardHeader>
   <Separator />
   <CardContent className="flex flex-col gap-6">
    <div className="grid grid-cols-1  lg:grid-cols-2 gap-6">
     {/* Password Card */}
     <Card>
      <CardHeader>
       <CardTitle className="flex items-center gap-2">
        <div className="p-2 bg-accent rounded-md">
         <Key className="size-4 text-primary" />
        </div>
        Password
       </CardTitle>
       <CardDescription>
        Ensure your account is using a long, random password to stay secure.
       </CardDescription>
      </CardHeader>
      <CardContent>
       <p className="text-sm text-muted-foreground">
        Your password was last changed... (feature pending)
       </p>
      </CardContent>
      <CardFooter>
       <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}>
        <DialogTrigger asChild>
         <Button variant="outline">Change Password</Button>
        </DialogTrigger>
        <DialogContent>
         <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
           Enter your current password and new password
          </DialogDescription>
         </DialogHeader>
         <Separator />
         <ChangePasswordForm onSuccess={() => setIsPasswordDialogOpen(false)} />
        </DialogContent>
       </Dialog>
      </CardFooter>
     </Card>

     {/* 2FA Card */}
     {user && <TwoFactorCard user={user} />}
    </div>
    <Separator />
    <div className="flex flex-col gap-4">
     <Typography variant="h5" as="h4">
      <Monitor /> Active Sessions
     </Typography>
     <div className="flex flex-col gap-4">
      {sessions.data
       ?.sort((a, b) => {
        if (a.id === currentSession?.id) return -1;
        if (b.id === currentSession?.id) return 1;
        return 0;
       })
       .map((session) => (
        <SessionCard
         session={session}
         key={session.id}
         isCurrent={session.id === currentSession?.id}
        />
       ))}
     </div>
    </div>
    <Separator />
    <div className="flex flex-col gap-4">
     <LogsViewer
      // data={logs.data || []}
      title="Security Logs"
      description="View your security logs here"
      enabledFilters={["action", "date", "status", "entity"]}
      actions={[
       "2FA_DISABLE",
       "2FA_ENABLE",
       "CHANGE_PASSWORD",
       "REVOKE",
       "SIGN_IN",
       "SIGN_OUT",
       "SIGN_UP",
      ]}
      entityTypes={["USER", "SESSION", "SECURITY"]}
     />
    </div>
   </CardContent>
  </>
 );
};

export default SettingsSecurity;
