import { getSession } from "@/actions/server/session.controllers";
import { ROUTE_BUILDER, ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";
import { Route } from "next";
import Link from "next/link";

const Logo = async ({
 size,
 variant,
}: {
 size?: "sm" | "md" | "lg";
 variant?: "light" | "dark";
}) => {
 const session = await getSession();
 const orgId = session?.activeOrganizationId;
 return (
  <Link
   href={
    orgId
     ? (ROUTE_BUILDER.organization(orgId, ROUTES.ORGANIZATION.DEFAULT) as Route)
     : ROUTES.SIGN_IN
   }>
   <h1
    className={cn(
     "font-bold font-mono",
     size === "sm"
      ? "text-xl"
      : size === "md"
        ? "text-3xl"
        : size === "lg"
          ? "text-4xl"
          : "text-2xl",
     variant === "dark" ? "text-accent-foreground" : "text-primary",
    )}>
    RBX
   </h1>
  </Link>
 );
};

export default Logo;
