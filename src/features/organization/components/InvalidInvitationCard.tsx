import { Button } from "@/components/ui/button";
import {
 Card,
 CardDescription,
 CardFooter,
 CardHeader,
 CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/lib/constants/routes";
import Link from "next/link";

export function InvalidInvitationCard() {
 return (
  <Card className="max-w-md w-full text-center">
   <CardHeader>
    <CardTitle className="text-destructive">Invalid Invitation</CardTitle>
    <CardDescription>
     This invitation is invalid or has expired.
    </CardDescription>
   </CardHeader>
   <CardFooter className="justify-center">
    <Button asChild>
     <Link href={ROUTES.ORGANIZATION.ROOT}>Go to Dashboard</Link>
    </Button>
   </CardFooter>
  </Card>
 );
}
