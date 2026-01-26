"use client";

import type { Column } from "@tanstack/react-table";
import { Check, PlusCircle, XCircle } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
 Command,
 CommandEmpty,
 CommandGroup,
 CommandInput,
 CommandItem,
 CommandList,
 CommandSeparator,
} from "@/components/ui/command";
import {
 Popover,
 PopoverContent,
 PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { cn } from "@/lib/utils";
import { Option } from "@/types/data-table";
import { useDebouncedValue } from "@tanstack/react-pacer";
import { CommandLoading } from "cmdk";
import FlowketLoader from "../global/ResponsiveLoader";

interface DataTableInfiniteFacetedFilterProps<TData, TValue> {
 column?: Column<TData, TValue>;
 title?: string;
 multiple?: boolean;
 Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
 queryOptionsFactory: (search?: string) => any;
}

export function DataTableInfiniteFacetedFilter<TData, TValue>({
 column,
 title,
 multiple,
 Icon,
 queryOptionsFactory,
}: DataTableInfiniteFacetedFilterProps<TData, TValue>) {
 const [open, setOpen] = React.useState(false);
 const [search, setSearch] = React.useState("");
 const [debouncedSearch] = useDebouncedValue(search, { wait: 500 });

 const columnFilterValue = column?.getFilterValue();
 const selectedValues = new Set(
  Array.isArray(columnFilterValue) ? columnFilterValue : [],
 );

 const fetchData = React.useCallback(
  async (page: number) => {
   const options = queryOptionsFactory(debouncedSearch);
   const result = await options.queryFn({ pageParam: page });
   return {
    data: result.roles || result.data || [],
    total: result.total || 0,
   };
  },
  [debouncedSearch, queryOptionsFactory],
 );

 const {
  data: infiniteData,
  isLoading,
  hasMore,
  observerRef,
  reset,
 } = useInfiniteScroll({
  fetchData,
  limit: 10,
 });

 React.useEffect(() => {
  if (open && (!infiniteData || infiniteData.length === 0)) {
   reset();
  }
 }, [open, infiniteData, reset]);

 const options = React.useMemo(() => {
  return (infiniteData?.map((role: any) => ({
   label: role.role.charAt(0).toUpperCase() + role.role.slice(1),
   value: role.role,
  })) || []) as Option[];
 }, [infiniteData]);

 const onItemSelect = React.useCallback(
  (option: Option, isSelected: boolean) => {
   if (!column) return;

   if (multiple) {
    const newSelectedValues = new Set(selectedValues);
    if (isSelected) {
     newSelectedValues.delete(option.value);
    } else {
     newSelectedValues.add(option.value);
    }
    const filterValues = Array.from(newSelectedValues);
    column.setFilterValue(filterValues.length ? filterValues : undefined);
   } else {
    column.setFilterValue(isSelected ? undefined : [option.value]);
    setOpen(false);
   }
  },
  [column, multiple, selectedValues],
 );

 const onReset = React.useCallback(
  (event?: React.MouseEvent) => {
   event?.stopPropagation();
   column?.setFilterValue(undefined);
  },
  [column],
 );

 return (
  <Popover open={open} onOpenChange={setOpen}>
   <PopoverTrigger asChild>
    <Button variant="outline" size="sm" className="border-dashed font-normal">
     {selectedValues?.size > 0 ? (
      <div
       role="button"
       aria-label={`Clear ${title} filter`}
       tabIndex={0}
       className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
       onClick={onReset}>
       <XCircle />
      </div>
     ) : (
      <>{Icon ? <Icon /> : <PlusCircle />}</>
     )}
     {title}
     {selectedValues?.size > 0 && (
      <>
       <Separator
        orientation="vertical"
        className="mx-0.5 data-[orientation=vertical]:h-4"
       />
       <Badge
        variant="secondary"
        className="rounded-sm px-1 font-normal lg:hidden">
        {selectedValues.size}
       </Badge>
       <div className="hidden items-center gap-1 lg:flex">
        {selectedValues.size > 2 ? (
         <Badge variant="secondary" className="rounded-sm px-1 font-normal">
          {selectedValues.size} selected
         </Badge>
        ) : (
         options
          .filter((option) => selectedValues.has(option.value))
          // For infinite content, selected options might not be in current 'options' array.
          // We should ideally persist selected options display using a separate store or logic.
          // But for now, just showing values provided by filter.
          .map((option) => (
           <Badge
            variant="secondary"
            key={option.value}
            className="rounded-sm px-1 font-normal">
            {option.label}
           </Badge>
          ))
        )}
        {/* If options are missing, maybe just show count? */}
        {selectedValues.size > 0 &&
         options.filter((o) => selectedValues.has(o.value)).length === 0 && (
          <Badge variant="secondary" className="rounded-sm px-1 font-normal">
           {selectedValues.size} items
          </Badge>
         )}
       </div>
      </>
     )}
    </Button>
   </PopoverTrigger>
   <PopoverContent className="w-50 p-0" align="start">
    <Command shouldFilter={false}>
     <CommandInput
      placeholder={title}
      value={search}
      onValueChange={setSearch}
     />
     <CommandList className="max-h-full">
      {infiniteData?.length === 0 && isLoading && (
       <CommandLoading className="flex flex-col items-center justify-center py-5 text-xs">
        <FlowketLoader size={16} className="mb-2" />
        Loading...
       </CommandLoading>
      )}
      {!isLoading && options.length === 0 && (
       <CommandEmpty>No results found.</CommandEmpty>
      )}
      <CommandGroup className="max-h-[300px] scroll-py-1 overflow-y-auto overflow-x-hidden">
       {options.map((option) => {
        const isSelected = selectedValues.has(option.value);

        return (
         <CommandItem
          key={option.value}
          value={option.value} // Required for cmkd even if shouldFilter=false? No, but good practice
          onSelect={() => onItemSelect(option, isSelected)}>
          <div
           className={cn(
            "flex size-4 items-center justify-center rounded-sm border border-primary",
            isSelected ? "bg-primary" : "opacity-50 [&_svg]:invisible",
           )}>
           <Check />
          </div>
          {option.icon && <option.icon />}
          <span className="truncate">{option.label}</span>
         </CommandItem>
        );
       })}
       {/* Infinite Scroll Sentinel */}
       {hasMore && options.length > 0 && (
        <div ref={observerRef} className="py-2 flex justify-center w-full">
         {isLoading && <FlowketLoader size={16} />}
        </div>
       )}
      </CommandGroup>
      {selectedValues.size > 0 && (
       <>
        <CommandSeparator />
        <CommandGroup>
         <CommandItem
          onSelect={() => onReset()}
          className="justify-center text-center">
          Clear filters
         </CommandItem>
        </CommandGroup>
       </>
      )}
     </CommandList>
    </Command>
   </PopoverContent>
  </Popover>
 );
}
