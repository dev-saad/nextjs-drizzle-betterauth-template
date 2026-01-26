import { getInvitation } from "@/actions/server/organization.controllers";
import { InvalidInvitationCard } from "@/features/organization/components/InvalidInvitationCard";
import { InvitationCard } from "@/features/organization/components/InvitationCard";

export default async function AcceptInvitationPage({
 params,
}: {
 params: Promise<{ id: string }>;
}) {
 const { id } = await params;
 const {
  data: invitation,
  error,
  success,
 } = await getInvitation({
  id,
 });

 if (error || !success || !invitation) {
  return (
   <div className="flex min-h-screen flex-col items-center justify-center p-4">
    <InvalidInvitationCard />
   </div>
  );
 }

 return (
  <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-muted/20">
   <InvitationCard
    id={id}
    inviterEmail={invitation.inviterEmail}
    orgName={invitation.organizationName}
    role={invitation.role}
    // logo={invitation.organization?.logo}
   />
  </div>
 );
}
