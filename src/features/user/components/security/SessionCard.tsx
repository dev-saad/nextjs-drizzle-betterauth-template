import { revokeSession } from "@/actions/server/session.controllers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Session } from "@/lib/auth/auth.config";
import { formatDistanceToNow } from "date-fns";
import {
 Clock,
 Globe,
 Laptop,
 Loader2,
 LogOut,
 MapPin,
 Phone,
 Smartphone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { UAParser } from "ua-parser-js";

const SessionCard = ({
 session,
 isCurrent,
}: {
 session: Session;
 isCurrent?: boolean;
}) => {
 const router = useRouter();
 const [isRevoking, setIsRevoking] = useState(false);
 const userAgentInfo = session.userAgent ? UAParser(session.userAgent) : null;

 const getDeviceIcon = () => {
  const deviceType = userAgentInfo?.device.type;
  if (deviceType === "mobile") return Phone;
  if (deviceType === "tablet") return Smartphone;
  if (!deviceType) return Laptop; // Default to laptop/desktop
  return Globe;
 };

 const Icon = getDeviceIcon();

 const handleRevoke = async () => {
  setIsRevoking(true);
  const revoked = await revokeSession({ token: session.token });
  if (revoked?.success) {
   toast.success("Session revoked successfully");
   router.refresh();
  } else {
   toast.error("Failed to revoke session");
  }
  setIsRevoking(false);
 };

 return (
  <div className="flex items-center justify-between p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
   <div className="flex items-center gap-4">
    <div className="p-3 bg-secondary/50 rounded-full">
     <Icon className="size-5 text-secondary-foreground" />
    </div>
    <div className="space-y-1">
     <div className="flex items-center gap-2">
      <p className="font-medium text-sm">
       {userAgentInfo?.browser.name} on {userAgentInfo?.os.name}
      </p>
      {isCurrent && (
       <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
        This Device
       </Badge>
      )}
     </div>
     <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <div className="flex items-center gap-1">
       <MapPin className="size-3" />
       {session.ipAddress || "Unknown Location"}
      </div>
      <div className="flex items-center gap-1">
       <Clock className="size-3" />
       {isCurrent
        ? "Active now"
        : `Last active ${formatDistanceToNow(new Date(session.updatedAt), {
           addSuffix: true,
          })}`}
      </div>
     </div>
    </div>
   </div>

   {!isCurrent && (
    <Button
     variant="ghost"
     size="sm"
     className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
     onClick={handleRevoke}
     disabled={isRevoking}>
     {isRevoking ? (
      <>
       <Loader2 className="animate-spin" />
       <span>Revoking...</span>
      </>
     ) : (
      <>
       <LogOut />
       <span>Revoke</span>
      </>
     )}
    </Button>
   )}
  </div>
 );
};

export default SessionCard;
