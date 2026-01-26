import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function OnboardingLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
  <div className="w-full container px-4 py-5 lg:px-8 lg:py-10 min-h-screen flex flex-col">
   <div className="flex-1 grid">{children}</div>
   <div className="mt-8 text-center text-sm text-muted-foreground">
    Need help?{" "}
    <Link
     href="mailto:support@flowket.app"
     className={cn(buttonVariants({ variant: "link" }), "px-0")}>
     Contact support
    </Link>
   </div>
  </div>
 );
}
