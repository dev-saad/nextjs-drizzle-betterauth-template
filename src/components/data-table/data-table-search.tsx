"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Table } from "@tanstack/react-table";
import { Search } from "lucide-react";

interface DataTableSearchProps<TData> extends Omit<
 React.ComponentProps<typeof Input>,
 "onChange"
> {
 table: Table<TData>;
 placeholder?: string;
}

export function DataTableSearch<TData>({
 table,
 placeholder,
 className,
 ...props
}: DataTableSearchProps<TData>) {
 return (
  <div className={cn("relative", className)}>
   <Search className="absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
   <Input
    placeholder={placeholder ?? "Search..."}
    value={(table.getState().globalFilter as string) ?? ""}
    onChange={(event) => table.setGlobalFilter(event.target.value)}
    className="h-8 pl-8 flex-1 w-full lg:min-w-[300px] sm:max-w-[300px] sm:min-w-[200px]"
    {...props}
   />
  </div>
 );
}
