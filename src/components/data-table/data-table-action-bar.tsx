import {
 ActionBar,
 ActionBarClose,
 ActionBarSelection,
 ActionBarSeparator,
} from "@/components/ui/action-bar";
import { type Row, type Table as TanstackTable } from "@tanstack/react-table";
import { X } from "lucide-react";
import { useCallback } from "react";

const DataTableActionBar = <TData,>({
 table,
 children,
}: {
 table: TanstackTable<TData>;
 children?: React.ReactNode | ((rows: Row<TData>[]) => React.ReactNode);
}) => {
 const rows = table.getFilteredSelectedRowModel().rows;
 const onOpenChange = useCallback(
  (open: boolean) => {
   if (!open) {
    table.toggleAllRowsSelected(false);
   }
  },
  [table],
 );

 return (
  <ActionBar open={rows.length > 0} onOpenChange={onOpenChange}>
   <ActionBarSelection>
    {rows.length} selected
    <ActionBarSeparator />
    <ActionBarClose className="cursor-pointer">
     <X />
    </ActionBarClose>
   </ActionBarSelection>
   <ActionBarSeparator />
   {typeof children === "function" ? children(rows) : children}
  </ActionBar>
 );
};

export default DataTableActionBar;
