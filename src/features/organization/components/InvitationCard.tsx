"use client";

import {
 acceptInvitation,
 rejectInvitation,
} from "@/actions/server/organization.controllers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
 Card,
 CardContent,
 CardDescription,
 CardFooter,
 CardHeader,
 CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/lib/constants/routes";
import { getStorageUrl } from "@/lib/utils/files";
import { Check, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

interface InvitationCardProps {
 id: string;
 inviterEmail: string;
 orgName: string;
 role: string;
 logo?: string | null;
}

export function InvitationCard({
 id,
 inviterEmail,
 orgName,
 role,
 logo,
}: InvitationCardProps) {
 const router = useRouter();
 const [isAccepting, startAcceptTransition] = useTransition();
 const [isRejecting, startRejectTransition] = useTransition();

 const handleAccept = () => {
  startAcceptTransition(async () => {
   const { error, success } = await acceptInvitation({
    invitationId: id,
   });

   if (error || !success) {
    toast.error(error || "Failed to accept invitation");
    return;
   }

   toast.success("Invitation accepted successfully");
   router.push(ROUTES.ORGANIZATION.ROOT);
  });
 };

 const handleReject = () => {
  startRejectTransition(async () => {
   const { error, success } = await rejectInvitation({
    invitationId: id,
   });

   if (error || !success) {
    toast.error(error || "Failed to reject invitation");
    return;
   }

   toast.success("Invitation declined");
   router.push(ROUTES.ORGANIZATION.ROOT);
  });
 };

 return (
  <Card className="max-w-md w-full">
   <CardHeader className="text-center">
    <div className="mx-auto mb-4 bg-primary/10 p-3 rounded-full w-fit">
     <Avatar className="h-12 w-12 border-2 border-background">
      <AvatarImage src={getStorageUrl(logo)} alt={orgName} />
      <AvatarFallback className="bg-primary text-primary-foreground text-lg">
       {orgName.substring(0, 2).toUpperCase()}
      </AvatarFallback>
     </Avatar>
    </div>
    <CardTitle>Join {orgName}</CardTitle>
    <CardDescription>
     You have been invited to join <strong>{orgName}</strong> as a{" "}
     <strong>{role}</strong> by {inviterEmail}.
    </CardDescription>
   </CardHeader>
   <CardContent className="space-y-4">
    <div className="text-sm text-muted-foreground text-center">
     By accepting, you will gain access to the organization&apos;s resources and
     be able to collaborate with your team.
    </div>
   </CardContent>
   <CardFooter className="flex-col gap-2">
    <Button
     className="w-full"
     onClick={handleAccept}
     disabled={isAccepting || isRejecting}>
     {isAccepting ? (
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
     ) : (
      <Check className="mr-2 h-4 w-4" />
     )}
     Accept Invitation
    </Button>
    <Button
     variant="outline"
     className="w-full"
     onClick={handleReject}
     disabled={isAccepting || isRejecting}>
     {isRejecting ? (
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
     ) : (
      <X className="mr-2 h-4 w-4" />
     )}
     Decline
    </Button>
   </CardFooter>
  </Card>
 );
}
