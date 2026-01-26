import { authClient } from "@/lib/auth/auth.client.config";
import { Session } from "@/lib/auth/auth.config";
import { PermissionsType } from "@/lib/constants/permissions"; // Adjust path to your permissions.ts
import { useMemo } from "react";

type PermissionCheckProps = {
 required?: PermissionsType;
 orgId?: string;
};

export function usePermission({ required, orgId }: PermissionCheckProps = {}) {
 const { data, isPending } = authClient.useSession();
 const session = data?.session as Session;

 const result = useMemo(() => {
  // 1. Loading State
  if (isPending) return { hasPermission: false, isLoading: true };

  // 2. Determine Organization context (Prop > Active Session)
  const targetOrgId = orgId || session?.activeOrganizationId;

  if (!targetOrgId || !session?.permissions) {
   return { hasPermission: false, isLoading: false };
  }

  // 3. Get permissions for the specific organization
  // Type assertion needed if Better-Auth types aren't fully inferring your custom structure yet
  const orgPermissions = (session.permissions as Record<string, any>)[
   targetOrgId
  ];

  if (!orgPermissions) {
   return { hasPermission: false, isLoading: false };
  }

  // 4. If no specific permissions required, just checking if valid member
  if (!required || Object.keys(required).length === 0) {
   return { hasPermission: true, isLoading: false };
  }

  // 5. The Core Check Logic
  const hasPermission = Object.entries(required).every(
   ([resource, actions]) => {
    const allowedActions = orgPermissions[resource] || [];

    // If 'actions' is undefined or empty, we assume they just need access to the resource
    if (!actions || actions.length === 0) return true;

    // Check if user has ALL required actions
    return (actions as string[]).every((action) =>
     allowedActions.includes(action),
    );
   },
  );

  return { hasPermission, isLoading: false };
 }, [session, isPending, required, orgId]);

 return result;
}
