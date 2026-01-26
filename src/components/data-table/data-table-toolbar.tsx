"use client";

import type { Column, Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import * as React from "react";

import { DataTableDateFilter } from "@/components/data-table/data-table-date-filter";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { DataTableSliderFilter } from "@/components/data-table/data-table-slider-filter";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DataTableInfiniteFacetedFilter } from "./data-table-infinite-faceted-filter";

interface DataTableToolbarProps<TData> extends React.ComponentProps<"div"> {
 table: Table<TData>;
 search?: React.ReactNode;
}

export function DataTableToolbar<TData>({
 table,
 children,
 className,
 search,
 ...props
}: DataTableToolbarProps<TData>) {
 const isFiltered = table.getState().columnFilters.length > 0;

 const columns = React.useMemo(
  () => table.getAllColumns().filter((column) => column.getCanFilter()),
  [table],
 );

 const onReset = React.useCallback(() => {
  table.resetColumnFilters();
 }, [table]);

 return (
  <div
   role="toolbar"
   aria-orientation="horizontal"
   className={cn(
    "flex flex-col gap-2 sm:flex-row sm:items-center p-1",
    className,
   )}
   {...props}>
   {search}
   <div className="flex w-full items-start justify-between gap-2">
    <div className="flex flex-1 flex-wrap items-center gap-2">
     {columns.map((column) => (
      <DataTableToolbarFilter key={column.id} column={column} />
     ))}
     {isFiltered && (
      <Button
       aria-label="Reset filters"
       variant="outline"
       size="sm"
       className="border-dashed"
       onClick={onReset}>
       <X />
       Reset
      </Button>
     )}
    </div>
    <div className="flex items-center gap-2">
     {children}
     <DataTableViewOptions table={table} align="end" />
    </div>
   </div>
  </div>
 );
}
interface DataTableToolbarFilterProps<TData> {
 column: Column<TData>;
}

function DataTableToolbarFilter<TData>({
 column,
}: DataTableToolbarFilterProps<TData>) {
 {
  const columnMeta = column.columnDef.meta;

  const onFilterRender = React.useCallback(() => {
   if (!columnMeta?.variant) return null;

   switch (columnMeta.variant) {
    case "text":
     return (
      <Input
       placeholder={columnMeta.placeholder ?? columnMeta.label}
       value={(column.getFilterValue() as string) ?? ""}
       onChange={(event) => column.setFilterValue(event.target.value)}
       className="h-8 w-40 lg:w-56"
      />
     );

    case "number":
     return (
      <div className="relative">
       <Input
        type="number"
        inputMode="numeric"
        placeholder={columnMeta.placeholder ?? columnMeta.label}
        value={(column.getFilterValue() as string) ?? ""}
        onChange={(event) => column.setFilterValue(event.target.value)}
        className={cn("h-8 w-[120px]", columnMeta.unit && "pr-8")}
       />
       {columnMeta.unit && (
        <span className="absolute top-0 right-0 bottom-0 flex items-center rounded-r-md bg-accent px-2 text-muted-foreground text-sm">
         {columnMeta.unit}
        </span>
       )}
      </div>
     );

    case "range":
     return (
      <DataTableSliderFilter
       column={column}
       title={columnMeta.label ?? column.id}
      />
     );

    case "date":
    case "dateRange":
     return (
      <DataTableDateFilter
       column={column}
       title={columnMeta.label ?? column.id}
       multiple={columnMeta.variant === "dateRange"}
      />
     );

    case "select":
    case "multiSelect":
     return (
      <DataTableFacetedFilter
       column={column}
       title={columnMeta.label ?? column.id}
       Icon={columnMeta.Icon}
       fetchOptions={columnMeta.fetchOptions}
       options={columnMeta.options ?? []}
       multiple={columnMeta.variant === "multiSelect"}
      />
     );

    case "infiniteMultiSelect":
     return (
      <DataTableInfiniteFacetedFilter
       column={column}
       title={columnMeta.label ?? column.id}
       Icon={columnMeta.Icon}
       multiple={columnMeta.variant === "infiniteMultiSelect"}
       queryOptionsFactory={columnMeta.infiniteOptions!}
      />
     );

    default:
     return null;
   }
  }, [column, columnMeta]);

  return onFilterRender();
 }
}
