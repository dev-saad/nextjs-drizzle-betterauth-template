"use client";

import {
 deleteRole,
 RolesType,
} from "@/actions/server/organization.controllers";
import { DataTable } from "@/components/data-table/data-table";
import DataTableActionBar from "@/components/data-table/data-table-action-bar";
import { DataTableSearch } from "@/components/data-table/data-table-search";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { AppAlertDialog } from "@/components/global/AppAlertDialog";
import { ActionBarGroup, ActionBarItem } from "@/components/ui/action-bar";
import { useDataTable } from "@/hooks/use-data-table";
import { PARAMS } from "@/lib/constants/routes";
import { type Row } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";
import { toast } from "sonner";
import { getRolesColumns } from "./columns";

export const RoleList = ({ roles }: { roles: RolesType }) => {
 const [isLoading, startTransition] = useTransition();
 const params = useParams<typeof PARAMS>();
 const router = useRouter();

 const columns = useMemo(() => getRolesColumns(), []);

 const { table } = useDataTable({
  data: roles?.roles || [],
  columns,
  pageCount: roles?.pageCount || 1,
  startTransition,
  shallow: false,
  getRowId: (row) => row.id,
  enableGlobalFilter: true,
 });

 const handleDeleteSelected = async (
  selectedRows: Row<NonNullable<RolesType>["roles"][number]>[],
 ) => {
  const ids = selectedRows.map((row) => row.original.id);

  Promise.all(
   ids.map(async (id) => {
    toast.loading("Deleting role...", { id: `delete-role-${id}` });
    const { success, error } = await deleteRole({
     roleId: id,
     organizationId: params.orgId,
    });
    if (!success) {
     toast.error(`Failed to delete role: ${error}`, {
      id: `delete-role-${id}`,
     });
     return;
    }
    toast.success("Role deleted successfully", { id: `delete-role-${id}` });
    router.refresh();
   }),
  ).then(() => {
   table.toggleAllRowsSelected(false);
  });
 };

 return (
  <DataTable
   table={table}
   actionBar={
    <DataTableActionBar table={table}>
     {(rows) => (
      <ActionBarGroup>
       <AppAlertDialog
        trigger={
         <ActionBarItem
          variant="destructive"
          onSelect={(e) => e.preventDefault()}>
          <Trash2 />
          Delete
         </ActionBarItem>
        }
        title="Delete Roles?"
        description={
         rows.length === 1
          ? "Are you sure you want to delete this role? This action cannot be undone."
          : `Are you sure you want to delete these ${rows.length} roles? This action cannot be undone.`
        }
        actionText="Delete"
        cancelText="Cancel"
        onAction={() => handleDeleteSelected(rows)}
        variant="destructive"
       />
      </ActionBarGroup>
     )}
    </DataTableActionBar>
   }
   isLoading={isLoading}>
   <DataTableToolbar
    table={table}
    search={<DataTableSearch table={table} placeholder="Search roles..." />}>
    <DataTableSortList table={table} />
   </DataTableToolbar>
  </DataTable>
 );
};

export default RoleList;
