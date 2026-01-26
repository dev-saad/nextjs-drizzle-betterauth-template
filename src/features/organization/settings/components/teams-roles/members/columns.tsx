"use client";

import {
 getRolesList,
 MembersType,
} from "@/actions/server/organization.controllers";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import { getInitials } from "@/lib/utils";
import { getStorageUrl } from "@/lib/utils/files";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { CalendarCogIcon, UserRoundCog } from "lucide-react";
import { MemberActions } from "./MemberActions";

// Use MembersType[number] to get the single member type from the array
export const getMembersColumns = (
 organizationId: string,
): ColumnDef<NonNullable<MembersType>["members"][number]>[] => {
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
   id: "user",
   accessorKey: "user",
   header: "User",
   cell: ({ row }) => {
    const member = row.original;
    const user = member.user;
    const image = getStorageUrl(user.image);
    return (
     <div className="flex items-center gap-3">
      <Avatar className="h-9 w-9">
       <AvatarImage src={image} alt={user.name} />
       <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
       <span className="text-sm font-medium">{user.name}</span>
       <span className="text-xs text-muted-foreground">{user.email}</span>
      </div>
     </div>
    );
   },
   meta: {
    label: "User",
    // placeholder: "Search users...",
    // variant: "text",
    // icon: User,
   },
   // enableColumnFilter: true,
   enableSorting: false,
  },
  {
   id: "role",
   accessorKey: "role",
   header: "Role",
   cell: ({ row }) => {
    const role = row.getValue("role") as string | string[];
    const roles = Array.isArray(role) ? role : [role];

    return (
     <div className="flex flex-wrap gap-1">
      {roles.map((r, index) => (
       <Badge key={index} variant="outline" className="capitalize">
        {r}
       </Badge>
      ))}
     </div>
    );
   },
   enableSorting: false,
   enableColumnFilter: true,
   meta: {
    label: "Role",
    placeholder: "Search roles...",
    variant: "infiniteMultiSelect",
    Icon: UserRoundCog,
    infiniteOptions: (search) => ({
     queryFn: async ({ pageParam = 1 }: { pageParam?: unknown }) => {
      const { data } = await getRolesList({
       organizationId: organizationId,
       filters: {
        page: pageParam as number,
        limit: 10,
        search,
       },
      });

      if (!data) throw new Error("Failed to fetch roles");
      return data;
     },
    }),
   },
  },
  {
   id: "createdAt",
   accessorKey: "createdAt",
   header: ({ column }) => {
    return (
     <DataTableColumnHeader
      label="Joined At"
      column={column}
      title="Joined At"
     />
    );
   },
   cell: ({ row }) => {
    return (
     <span className="text-sm text-muted-foreground">
      {format(new Date(row.getValue("createdAt")), "MMM d, yyyy")}
     </span>
    );
   },
   meta: {
    label: "Joined At",
    placeholder: "Search joined...",
    variant: "dateRange",
    Icon: CalendarCogIcon,
   },
   enableColumnFilter: true,
  },
  {
   id: "actions",
   cell: ({ row }) => {
    const member = row.original;
    return <MemberActions member={member} organizationId={organizationId} />;
   },
   size: 32,
  },
 ];
};
