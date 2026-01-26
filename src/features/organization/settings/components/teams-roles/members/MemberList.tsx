"use client";

import {
 MembersType,
 removeMember,
} from "@/actions/server/organization.controllers";
import { DataTable } from "@/components/data-table/data-table";
import DataTableActionBar from "@/components/data-table/data-table-action-bar";
import { DataTableSearch } from "@/components/data-table/data-table-search";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { PARAMS } from "@/lib/constants/routes";
import { type Row } from "@tanstack/react-table";

import { AppAlertDialog } from "@/components/global/AppAlertDialog";
import { ActionBarGroup, ActionBarItem } from "@/components/ui/action-bar";
import { Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";
import { toast } from "sonner";
import { getMembersColumns } from "./columns";

export const MemberList = ({ members }: { members: MembersType }) => {
 const params = useParams<typeof PARAMS>();
 const router = useRouter();
 const [isLoading, startTransition] = useTransition();
 const columns = useMemo(() => getMembersColumns(params.orgId), [params.orgId]);

 const { table } = useDataTable({
  data: members?.members || [],
  columns,
  rowCount: members?.total || 0,
  pageCount: members?.pageCount || -1,
  enablePersistence: true,
  persistenceId: "members",
  startTransition,
  debounceMs: 300,
  throttleMs: 50,
  enableGlobalFilter: true,
  shallow: false,
  getRowId: (row) => row.id,
 });

 const handleDeleteSelected = async (
  selectedRows: Row<NonNullable<MembersType>["members"][number]>[],
 ) => {
  const ids = selectedRows.map((row) => row.original.id);

  Promise.all(
   ids.map(async (id, index) => {
    toast.loading("Removing member...", { id: `remove-member-${id}` });
    const { success, error } = await removeMember({
     memberIdOrEmail: id,
     organizationId: params.orgId,
     role: selectedRows[index].original.role,
    });
    if (!success) {
     toast.error(`Failed to remove member: ${error}`, {
      id: `remove-member-${id}`,
     });
     return;
    }
    toast.success("Member removed successfully", { id: `remove-member-${id}` });
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
          Remove
         </ActionBarItem>
        }
        title="Remove Members?"
        description={
         rows.length === 1
          ? "Are you sure you want to remove this member? This action cannot be undone."
          : `Are you sure you want to remove these ${rows.length} members? This action cannot be undone.`
        }
        actionText="Remove"
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
    search={<DataTableSearch table={table} placeholder="Search members..." />}>
    <DataTableSortList table={table} align="end" />
   </DataTableToolbar>
  </DataTable>
 );
};

export default MemberList;
