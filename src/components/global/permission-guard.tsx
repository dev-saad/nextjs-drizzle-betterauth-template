import { Tooltip } from "@/components/global/Tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermission } from "@/hooks/use-permission";
import { PermissionsType } from "@/lib/constants/permissions";
import { PARAMS } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { useParams } from "next/navigation";
import { ReactNode } from "react";

interface PermissionGuardProps extends Omit<
 React.HTMLAttributes<HTMLElement>,
 "children"
> {
 required: PermissionsType;
 orgId?: string;
 fallback?: ReactNode;
 loading?: ReactNode;
 children: ReactNode | ((props: { hasPermission: boolean }) => ReactNode);
 asChild?: boolean;
 showDisabled?: boolean;
 disabledTooltip?: ReactNode | string;
}

export function PermissionGuard({
 required,
 orgId,
 fallback = null,
 loading = null,
 children,
 asChild = false,
 showDisabled = false,
 disabledTooltip,
 className,
 ...props
}: PermissionGuardProps) {
 const { orgId: activeOrgId } = useParams<typeof PARAMS>();
 const { hasPermission, isLoading } = usePermission({
  required,
  orgId: orgId ?? activeOrgId,
 });

 const Comp = asChild ? Slot : "div";

 if (isLoading) {
  if (loading) return <>{loading}</>;

  // Auto Skeleton: use the Skeleton component with asChild to mirror the child's layout
  return (
   <Skeleton
    asChild
    className={cn(
     "pointer-events-none select-none", // bg-muted to match previous look if needed, or rely on Skeleton's default
     asChild ? "" : className,
    )}
    aria-hidden="true"
    {...props}>
    {typeof children === "function" ? null : children}
   </Skeleton>
  );
 }

 if (typeof children === "function") {
  return <>{children({ hasPermission })}</>;
 }
 // Note: if !asChild, we usually wrap in a div or Fragment.
 // To support strict "render only children", if !asChild we might want Fragment, but validation on className requires an element.
 // Let's simplify: if asChild, Slot. If not, just render children directly if we don't need to apply classes.
 // But for 'showDisabled', we need to apply classes.

 if (hasPermission) {
  return asChild ? <Slot {...props}>{children}</Slot> : <>{children}</>;
 }

 if (showDisabled) {
  const disabledContent = (
   <Comp
    className={cn(
     "pointer-events-none opacity-50",
     asChild ? "" : className, // If valid element
    )}
    aria-disabled="true"
    // If we are not using Slot (disabledContent is div), passing children is fine.
    // If using Slot, children is standard.
    {...props}>
    {children}
   </Comp>
  );

  if (disabledTooltip) {
   // Wrap in a span/div to capture hover events for tooltip
   return (
    <Tooltip content={disabledTooltip}>
     <div className={cn("inline-block cursor-not-allowed", className)}>
      {disabledContent}
     </div>
    </Tooltip>
   );
  }

  return disabledContent;
 }

 return <>{fallback}</>;
}
