"use client";

import { RolesType } from "@/actions/server/organization.controllers";
import { Tooltip } from "@/components/global/Tooltip";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Scroller } from "@/components/ui/scroller";
import { statements } from "@/lib/constants/permissions";
import { ColumnDef } from "@tanstack/react-table";
import { capitalize } from "lodash";
import { Calendar, Info, Shield } from "lucide-react";
import { RoleActions } from "./RoleActions";

export const getRolesColumns = (): ColumnDef<
 NonNullable<RolesType>["roles"][number]
>[] => {
 return [
  {
   id: "select",
   header: ({ table }) => (
    <Checkbox
     checked={
      table.getIsAllPageRowsSelected() ||
      (table.getIsSomePageRowsSelected() && "indeterminate")
     }
     onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
     aria-label="Select all"
    />
   ),
   cell: ({ row }) => (
    <Checkbox
     checked={row.getIsSelected()}
     onCheckedChange={(value) => row.toggleSelected(!!value)}
     aria-label="Select row"
    />
   ),
   size: 25,
   enableSorting: false,
   enableHiding: false,
  },
  {
   id: "role",
   accessorKey: "role",
   header: "Role Name",
   cell: ({ row }) => {
    return (
     <div className="flex items-center gap-2">
      <Shield className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium capitalize">{row.original.role}</span>
     </div>
    );
   },
   meta: {
    label: "Role",
    placeholder: "Search roles...",
    variant: "text",
    Icon: Shield,
   },
   enableColumnFilter: false,
   enableSorting: false,
  },
  {
   id: "permissions",
   accessorKey: "permissions",
   header: "Permissions",

   cell: ({ row }) => {
    // Assuming 'permissions' is an object or array in the role data
    // Drizzle/BetterAuth schema usually stores it as JSON.
    const permissions = row.original.permission as Record<string, string[]>;
    const count = Object.values(permissions || {}).flat().length;

    return (
     <div className="flex items-center gap-2">
      <Tooltip
       delayDuration={300}
       className="max-w-xs"
       content={
        <Scroller
         className="flex max-h-[300px] flex-col p-1 pr-3 py-2 "
         withNavigation>
         {Object.entries(permissions || {}).length > 0 ? (
          Object.entries(permissions).map(([resource, actions]) => (
           <div key={resource} className="mb-2 flex flex-col gap-1 last:mb-0">
            <div className="flex items-center gap-2 font-semibold text-primary-foreground text-xs">
             <div className="size-1.5 rounded-full bg-primary-foreground/60" />
             <span className="capitalize">{resource}</span>
            </div>
            <p className="pl-3.5 text-primary-foreground/80 text-xs leading-relaxed">
             {(actions as string[]).map((a) => capitalize(a)).join(", ")}
            </p>
           </div>
          ))
         ) : (
          <span className="text-xs text-primary-foreground/70">
           No permissions assigned
          </span>
         )}
        </Scroller>
       }>
       <Badge variant="secondary" className="cursor-help">
        {count} Permissions
        <Info className="ml-1" />
       </Badge>
      </Tooltip>
     </div>
    );
   },

   meta: {
    label: "Permissions",
    placeholder: "Search permissions...",
    variant: "multiSelect",
    options: Object.entries(statements).flatMap(([resource, actions]) =>
     (actions as readonly string[]).map((action) => ({
      label: `${capitalize(resource)}: ${capitalize(action)}`,
      value: `${resource}:${action}`,
     })),
    ),
    Icon: Shield,
   },
   enableSorting: false,
   enableColumnFilter: true,
  },
  {
   id: "createdAt",
   accessorKey: "createdAt",
   header: "Created At",
   cell: ({ row }) => {
    return (
     <div className="flex items-center gap-2">
      <span className="font-medium capitalize">
       {row.original.createdAt.toLocaleDateString()}
      </span>
     </div>
    );
   },
   meta: {
    label: "Created At",
    placeholder: "Search created at...",
    variant: "dateRange",
    Icon: Calendar,
   },
   enableSorting: true,
   enableColumnFilter: true,
  },
  {
   id: "actions",
   cell: ({ row }) => {
    const role = row.original;
    return <RoleActions role={role} />;
   },
   size: 32,
  },
 ];
};
