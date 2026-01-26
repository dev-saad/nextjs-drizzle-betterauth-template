import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
 flexRender,
 type Row,
 type Table as TanstackTable,
} from "@tanstack/react-table";
import * as React from "react";

import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import {
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from "@/components/ui/table";
import { getColumnPinningStyle } from "@/lib/data-table";
import { cn } from "@/lib/utils";
import FlowketLoader from "../global/ResponsiveLoader";

interface DataTableProps<TData> extends React.ComponentProps<"div"> {
 table: TanstackTable<TData>;
 actionBar?: React.ReactNode | ((rows: Row<TData>[]) => React.ReactNode);
 isLoading?: boolean;
}

export function DataTable<TData>({
 table,
 actionBar,
 children,
 className,
 isLoading,
 ...props
}: DataTableProps<TData>) {
 const [animationParent] = useAutoAnimate();

 return (
  <div
   className={cn("flex w-full flex-col gap-2.5 overflow-auto", className)}
   {...props}>
   {children}
   <div className="relative overflow-hidden rounded-md border">
    <div className="relative w-full overflow-auto scrollbar-thin">
     <table className="w-full caption-bottom text-sm">
      <TableHeader>
       {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
         {headerGroup.headers.map((header) => (
          <TableHead
           key={header.id}
           colSpan={header.colSpan}
           style={{
            ...getColumnPinningStyle({ column: header.column }),
           }}>
           {header.isPlaceholder
            ? null
            : flexRender(header.column.columnDef.header, header.getContext())}
          </TableHead>
         ))}
        </TableRow>
       ))}
      </TableHeader>
      <TableBody className="relative" ref={animationParent}>
       {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
         <FlowketLoader />
        </div>
       )}
       {table.getRowModel().rows?.length ? (
        table.getRowModel().rows.map((row) => (
         <TableRow
          key={row.id}
          data-state={row.getIsSelected() && "selected"}
          className={cn(
           "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors cursor-pointer",
           // Replicate table row styles if needed, though most are handled by className
          )}>
          {row.getVisibleCells().map((cell) => (
           <TableCell
            key={cell.id}
            style={{
             ...getColumnPinningStyle({ column: cell.column }),
            }}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
           </TableCell>
          ))}
         </TableRow>
        ))
       ) : (
        <TableRow>
         <TableCell
          colSpan={table.getAllColumns().length}
          className="h-24 text-center">
          No results.
         </TableCell>
        </TableRow>
       )}
      </TableBody>
     </table>
    </div>
   </div>
   <div className="flex flex-col gap-2.5">
    <DataTablePagination table={table} />
    {actionBar &&
     table.getFilteredSelectedRowModel().rows.length > 0 &&
     (typeof actionBar === "function"
      ? actionBar(table.getFilteredSelectedRowModel().rows)
      : actionBar)}
   </div>
  </div>
 );
}
