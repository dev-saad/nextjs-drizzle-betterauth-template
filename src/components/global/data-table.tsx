// "use client";

// import { FilterRow } from "@/components/global/FilterRow";
// import { Button } from "@/components/ui/button";
// import {
//  Card,
//  CardContent,
//  CardFooter,
//  CardHeader,
//  CardTitle,
// } from "@/components/ui/card";
// import {
//  DropdownMenu,
//  DropdownMenuCheckboxItem,
//  DropdownMenuContent,
//  DropdownMenuItem,
//  DropdownMenuLabel,
//  DropdownMenuSeparator,
//  DropdownMenuSub,
//  DropdownMenuSubContent,
//  DropdownMenuSubTrigger,
//  DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Input } from "@/components/ui/input";
// import {
//  Pagination,
//  PaginationContent,
//  PaginationEllipsis,
//  PaginationItem,
//  PaginationLink,
// } from "@/components/ui/pagination";
// import {
//  Select,
//  SelectContent,
//  SelectItem,
//  SelectTrigger,
//  SelectValue,
// } from "@/components/ui/select";
// import {
//  Table,
//  TableBody,
//  TableCell,
//  TableHead,
//  TableHeader,
//  TableRow,
// } from "@/components/ui/table";
// import { QUERY_VALUES } from "@/lib/constants/routes";
// import { cn } from "@/lib/utils";
// import { FilterRowProps } from "@/types/filter-types";
// import {
//  ColumnDef,
//  ColumnFiltersState,
//  SortingState,
//  VisibilityState,
//  flexRender,
//  getCoreRowModel,
//  getFilteredRowModel,
//  getPaginationRowModel,
//  getSortedRowModel,
//  useReactTable,
// } from "@tanstack/react-table";
// import { LucideIcon, SlidersHorizontal, Zap } from "lucide-react";
// import * as React from "react";
// import { Skeleton } from "../ui/skeleton";
// import { Typography } from "../ui/typography";
// import { FlowketLoader } from "./ResponsiveLoader";

// export interface ActionMenuItem<TData> {
//  type?: "item" | "separator" | "label";
//  label?: string;
//  onClick?: (data: TData[]) => void;
//  subItems?: ActionMenuItem<TData>[];
//  icon?: LucideIcon;
//  variant?: "default" | "destructive";
// }

// interface PaginationProps {
//  total: number;
//  page: number;
//  limit: number;
//  setPage: (page: number) => void;
//  setLimit: (limit: number) => void;
// }

// interface DataTableProps<TData, TValue> {
//  columns: ColumnDef<TData, TValue>[];
//  data: TData[];
//  variant?: "default" | "card" | "card-list";
//  filterColumn?: string; // Legacy simple filter
//  onRowClick?: (row: TData) => void;

//  // Pagination
//  paginationProps?: PaginationProps; // Server-side pagination props

//  // Advanced Filtering
//  filterProps?: FilterRowProps;

//  // Actions
//  actionMenuItems?: ActionMenuItem<TData>[];

//  // Loading
//  isLoading?: boolean;
// }

// export function DataTable<TData, TValue>({
//  columns,
//  data,
//  variant = "default",
//  filterColumn,
//  onRowClick,
//  filterProps,
//  paginationProps,
//  actionMenuItems,
//  isLoading,
// }: DataTableProps<TData, TValue>) {
//  const [sorting, setSorting] = React.useState<SortingState>([]);
//  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
//   [],
//  );
//  const [columnVisibility, setColumnVisibility] =
//   React.useState<VisibilityState>({});
//  const [rowSelection, setRowSelection] = React.useState({});

//  // Internal state for client-side pagination if needed (though react-table can handle it automatically)
//  // We only strictly need this if we want to control it hybridly, but react-table internal state is usually enough for client-side.

//  const table = useReactTable({
//   data,
//   columns,
//   onSortingChange: setSorting,
//   onColumnFiltersChange: setColumnFilters,
//   getCoreRowModel: getCoreRowModel(),
//   getPaginationRowModel: getPaginationRowModel(),
//   getSortedRowModel: getSortedRowModel(),
//   getFilteredRowModel: getFilteredRowModel(),
//   onColumnVisibilityChange: setColumnVisibility,
//   onRowSelectionChange: setRowSelection,
//   manualPagination: !!paginationProps,
//   pageCount: paginationProps
//    ? Math.ceil(paginationProps.total / paginationProps.limit)
//    : undefined,
//   state: {
//    sorting,
//    columnFilters,
//    columnVisibility,
//    rowSelection,
//    pagination: paginationProps
//     ? {
//        pageIndex: paginationProps.page - 1,
//        pageSize: paginationProps.limit,
//       }
//     : undefined,
//   },
//   onPaginationChange: (updater) => {
//    if (paginationProps) {
//     const oldState = {
//      pageIndex: paginationProps.page - 1,
//      pageSize: paginationProps.limit,
//     };
//     const newState =
//      typeof updater === "function" ? updater(oldState) : updater;

//     paginationProps.setPage(newState.pageIndex + 1);
//     if (newState.pageSize !== paginationProps.limit) {
//      paginationProps.setLimit(newState.pageSize);
//     }
//    }
//    // For client-side, we don't need to do anything here because we are not passing 'pagination' to state
//    // so react-table manages it internally if 'state.pagination' is undefined.
//   },
//  });

//  // Recursive helper for menu items
//  const renderMenuItems = (
//   items: ActionMenuItem<TData>[],
//   selectedData: TData[],
//  ) => {
//   return items.map((item, idx) => {
//    if (item.type === "separator") {
//     return <DropdownMenuSeparator key={idx} />;
//    }

//    if (item.type === "label") {
//     return (
//      <DropdownMenuLabel key={idx} className="text-xs">
//       {item.label}
//      </DropdownMenuLabel>
//     );
//    }

//    if (item.subItems && item.subItems.length > 0) {
//     return (
//      <DropdownMenuSub key={idx}>
//       <DropdownMenuSubTrigger>
//        {item.icon && <item.icon />}
//        {item.label}
//       </DropdownMenuSubTrigger>
//       <DropdownMenuSubContent>
//        {renderMenuItems(item.subItems, selectedData)}
//       </DropdownMenuSubContent>
//      </DropdownMenuSub>
//     );
//    }
//    return (
//     <DropdownMenuItem
//      key={idx}
//      onClick={() => item.onClick?.(selectedData)}
//      variant={item.variant}
//      className="cursor-pointer">
//      {item.icon && <item.icon />}
//      {item.label}
//     </DropdownMenuItem>
//    );
//   });
//  };

//  const renderCardView = (mode: "grid" | "list") => {
//   // Skeleton Loading State
//   if (isLoading && !table.getRowModel().rows?.length) {
//    return (
//     <div
//      className={cn(
//       "grid gap-4",
//       mode === "grid"
//        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
//        : "grid-cols-1",
//      )}>
//      {Array.from({ length: paginationProps?.limit || 8 }).map((_, i) => (
//       <Skeleton key={i} className="h-32 w-full rounded-xl" />
//      ))}
//     </div>
//    );
//   }

//   return (
//    <div
//     className={cn(
//      "grid gap-4 relative",
//      mode === "grid"
//       ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
//       : "grid-cols-1",
//     )}>
//     {/* Loading Overlay */}
//     {isLoading && table.getRowModel().rows?.length > 0 && (
//      <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10 transition-opacity duration-300">
//       <FlowketLoader />
//      </div>
//     )}

//     {table.getRowModel().rows.map((row) => (
//      <Card
//       key={row.id}
//       className={cn(
//        "overflow-hidden transition-all hover:shadow-md",
//        onRowClick && "cursor-pointer hover:border-primary/50",
//        mode === "list" &&
//         "flex flex-col sm:flex-row items-center justify-between p-4 gap-4",
//       )}
//       onClick={() => onRowClick && onRowClick(row.original)}>
//       {mode === "grid" ? (
//        <>
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//          {/* Title */}
//          <CardTitle className="text-base font-medium">
//           <Typography variant="h5" as="h4">
//            {row.getVisibleCells()[0]
//             ? flexRender(
//                row.getVisibleCells()[0].column.columnDef.cell,
//                row.getVisibleCells()[0].getContext(),
//               )
//             : "Item"}
//           </Typography>
//          </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-2">
//          {row
//           .getVisibleCells()
//           .slice(1)
//           .map((cell) => {
//            if (cell.column.id === "actions") return null;
//            return (
//             <div
//              key={cell.id}
//              className="flex items-center justify-between text-sm">
//              <Typography variant="muted">
//               {typeof cell.column.columnDef.header === "string"
//                ? cell.column.columnDef.header
//                : cell.column.id}
//              </Typography>
//              <div className="font-medium">
//               {flexRender(cell.column.columnDef.cell, cell.getContext())}
//              </div>
//             </div>
//            );
//           })}
//         </CardContent>
//         {/* Footer/Actions */}
//         {row.getVisibleCells().find((c) => c.column.id === "actions") && (
//          <CardFooter className="bg-muted/50 px-6 py-3">
//           <div className="w-full flex justify-end">
//            {flexRender(
//             row.getVisibleCells().find((c) => c.column.id === "actions")!.column
//              .columnDef.cell,
//             row
//              .getVisibleCells()
//              .find((c) => c.column.id === "actions")!
//              .getContext(),
//            )}
//           </div>
//          </CardFooter>
//         )}
//        </>
//       ) : (
//        <>
//         {/* List View */}
//         <div className="flex flex-1 flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 w-full overflow-hidden">
//          {row.getVisibleCells().map((cell) => {
//           if (cell.column.id === "actions") return null;
//           return (
//            <div key={cell.id} className="flex flex-col gap-1 min-w-[20px]">
//             {/* Show header label only on mobile? or always for clarity? */}
//             <Typography variant="muted" className="text-xs sm:hidden">
//              {typeof cell.column.columnDef.header === "string"
//               ? cell.column.columnDef.header
//               : cell.column.id}
//             </Typography>
//             <Typography variant="p" className="text-sm mt-0">
//              {flexRender(cell.column.columnDef.cell, cell.getContext())}
//             </Typography>
//            </div>
//           );
//          })}
//         </div>
//         {/* Actions */}
//         {row.getVisibleCells().find((c) => c.column.id === "actions") && (
//          <div className="shrink-0">
//           {flexRender(
//            row.getVisibleCells().find((c) => c.column.id === "actions")!.column
//             .columnDef.cell,
//            row
//             .getVisibleCells()
//             .find((c) => c.column.id === "actions")!
//             .getContext(),
//           )}
//          </div>
//         )}
//        </>
//       )}
//      </Card>
//     ))}
//    </div>
//   );
//  };

//  return (
//   <div className="w-full space-y-4">
//    {/* Filters & View Options */}
//    <div className="flex flex-col gap-4">
//     {filterProps && <FilterRow {...filterProps} />}

//     {(filterColumn ||
//      Object.keys(columnVisibility).length >= 0 ||
//      paginationProps ||
//      (actionMenuItems && actionMenuItems.length > 0)) && (
//      <div className="flex items-center justify-between gap-2">
//       {/* Left Area: Actions */}
//       <div className="flex items-center gap-2">
//        {actionMenuItems &&
//         actionMenuItems.length > 0 &&
//         table.getFilteredSelectedRowModel().rows.length > 0 && (
//          <DropdownMenu modal={false} defaultOpen>
//           <DropdownMenuTrigger asChild>
//            <Button
//             variant="outline"
//             size="default"
//             className="ring-2 ring-ring/10">
//             <Zap />
//             Actions ({table.getFilteredSelectedRowModel().rows.length})
//            </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align="start">
//            {renderMenuItems(
//             actionMenuItems,
//             table.getSelectedRowModel().rows.map((r) => r.original),
//            )}
//           </DropdownMenuContent>
//          </DropdownMenu>
//         )}
//       </div>

//       {/* Right Area: Filters, Limit, View */}
//       <div className="flex items-center gap-2">
//        {filterColumn && !filterProps && (
//         <Input
//          placeholder={`Filter ${filterColumn}...`}
//          value={
//           (table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""
//          }
//          onChange={(event) =>
//           table.getColumn(filterColumn)?.setFilterValue(event.target.value)
//          }
//          className="h-8 w-[150px] lg:w-[250px]"
//         />
//        )}

//        {paginationProps && (
//         <div className="flex items-center gap-2">
//          <p className="text-sm font-medium hidden sm:block">Rows per page</p>
//          <Select
//           value={`${paginationProps.limit}`}
//           onValueChange={(value) => {
//            paginationProps.setLimit(Number(value));
//           }}>
//           <SelectTrigger className="h-8 w-[70px]">
//            <SelectValue placeholder={paginationProps.limit} />
//           </SelectTrigger>
//           <SelectContent side="top">
//            {QUERY_VALUES.limit.map((limit) => (
//             <SelectItem key={limit} value={`${limit}`}>
//              {limit}
//             </SelectItem>
//            ))}
//           </SelectContent>
//          </Select>
//         </div>
//        )}

//        <DropdownMenu>
//         <DropdownMenuTrigger asChild>
//          <Button variant="outline" size="sm" className="hidden h-8 lg:flex">
//           <SlidersHorizontal className="mr-2 h-4 w-4" />
//           View
//          </Button>
//         </DropdownMenuTrigger>
//         <DropdownMenuContent align="end">
//          {table
//           .getAllColumns()
//           .filter((column) => column.getCanHide())
//           .map((column) => {
//            return (
//             <DropdownMenuCheckboxItem
//              key={column.id}
//              className="capitalize"
//              checked={column.getIsVisible()}
//              onCheckedChange={(value) => column.toggleVisibility(!!value)}>
//              {column.id}
//             </DropdownMenuCheckboxItem>
//            );
//           })}
//         </DropdownMenuContent>
//        </DropdownMenu>
//       </div>
//      </div>
//     )}
//    </div>

//    {/* Content */}
//    {variant === "default" && (
//     <div className="rounded-md border bg-card relative">
//      {isLoading && table.getRowModel().rows?.length > 0 && (
//       <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10 transition-opacity duration-300">
//        <FlowketLoader />
//       </div>
//      )}
//      <Table>
//       <TableHeader>
//        {table.getHeaderGroups().map((headerGroup) => (
//         <TableRow key={headerGroup.id}>
//          {headerGroup.headers.map((header) => {
//           return (
//            <TableHead key={header.id}>
//             {header.isPlaceholder
//              ? null
//              : flexRender(header.column.columnDef.header, header.getContext())}
//            </TableHead>
//           );
//          })}
//         </TableRow>
//        ))}
//       </TableHeader>
//       <TableBody>
//        {isLoading && !table.getRowModel().rows?.length ? (
//         Array.from({ length: paginationProps?.limit || 5 }).map((_, index) => (
//          <TableRow key={index}>
//           {columns.map((_, colIndex) => (
//            <TableCell key={colIndex}>
//             <Skeleton className="h-6 w-full" />
//            </TableCell>
//           ))}
//          </TableRow>
//         ))
//        ) : table.getRowModel().rows?.length ? (
//         table.getRowModel().rows.map((row) => (
//          <TableRow
//           key={row.id}
//           data-state={row.getIsSelected() && "selected"}
//           onClick={() => onRowClick && onRowClick(row.original)}
//           className={cn(onRowClick && "cursor-pointer")}>
//           {row.getVisibleCells().map((cell) => (
//            <TableCell key={cell.id}>
//             {flexRender(cell.column.columnDef.cell, cell.getContext())}
//            </TableCell>
//           ))}
//          </TableRow>
//         ))
//        ) : (
//         <TableRow>
//          <TableCell colSpan={columns.length} className="h-24 text-center">
//           No results.
//          </TableCell>
//         </TableRow>
//        )}
//       </TableBody>
//      </Table>
//     </div>
//    )}

//    {variant === "card" && renderCardView("grid")}
//    {variant === "card-list" && renderCardView("list")}

//    {/* Pagination */}
//    <div className="flex items-center justify-between py-4">
//     {/* Left: Info */}
//     <div className="flex-1 text-sm text-muted-foreground">
//      {table.getFilteredSelectedRowModel().rows.length} of{" "}
//      {paginationProps
//       ? paginationProps.total
//       : table.getFilteredRowModel().rows.length}{" "}
//      row(s) selected.
//     </div>

//     {/* Center: Page Numbers */}
//     <div className="flex-1 flex justify-center sm:flex">
//      <Pagination className="w-auto mx-0">
//       <PaginationContent>
//        {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).map(
//         (page) => {
//          const currentPage = table.getState().pagination.pageIndex + 1;
//          const totalPages = table.getPageCount();
//          const isVisible =
//           page === 1 ||
//           page === totalPages ||
//           (page >= currentPage - 1 && page <= currentPage + 1);

//          if (!isVisible) {
//           if (page === currentPage - 2 || page === currentPage + 2) {
//            return (
//             <PaginationItem key={page}>
//              <PaginationEllipsis />
//             </PaginationItem>
//            );
//           }
//           return null;
//          }

//          return (
//           <PaginationItem key={page}>
//            <PaginationLink
//             isActive={page === currentPage}
//             onClick={() => table.setPageIndex(page - 1)}
//             className="cursor-pointer h-8 w-8">
//             {page}
//            </PaginationLink>
//           </PaginationItem>
//          );
//         },
//        )}
//       </PaginationContent>
//      </Pagination>
//     </div>

//     {/* Right: Buttons */}
//     <div className="flex-1 flex items-center justify-end space-x-2">
//      <Button
//       variant="outline"
//       size="sm"
//       onClick={() => table.previousPage()}
//       disabled={!table.getCanPreviousPage()}>
//       Previous
//      </Button>
//      <Button
//       variant="outline"
//       size="sm"
//       onClick={() => table.nextPage()}
//       disabled={!table.getCanNextPage()}>
//       Next
//      </Button>
//     </div>
//    </div>
//   </div>
//  );
// }
