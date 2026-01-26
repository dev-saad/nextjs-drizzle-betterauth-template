import { CalendarDatePicker } from "@/components/global/CalendarDatePicker";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
 FilterConfig,
 FilterRowProps,
 FilterValue,
 SelectFilterConfig,
} from "@/types/filter-types";
import { Check, ChevronsUpDown, Search, XCircle } from "lucide-react";
import React, { useMemo } from "react";
import { DateRange } from "react-day-picker";
import { Command, CommandGroup, CommandItem, CommandList } from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export const FilterRow: React.FC<FilterRowProps> = ({
 filters,
 values,
 onFilterChange,
 onClearFilters,
 className,
}) => {
 const hasActiveFilters = useMemo(() => {
  return Object.keys(values).some((key) => {
   const value = values[key];

   if (value === undefined || value === null || value === "") {
    return false;
   }

   if (Array.isArray(value)) {
    return value.length > 0;
   }

   // Handling DateRange object check
   if (typeof value === "object" && "from" in value && !value.from && !value.to)
    return false;

   return true;
  });
 }, [values]);

 const handleFilterChange = (
  key: string,
  value: unknown,
  filter: FilterConfig<any>,
 ) => {
  onFilterChange?.(key, value as FilterValue);
  filter.onChange?.(value as any);
 };

 const renderFilter = (filter: FilterConfig<any>) => {
  const value = values[filter.key];

  switch (filter.type) {
   case "text":
    return (
     <div className="relative w-full">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
       placeholder={filter.placeholder}
       className="pl-9 h-9 bg-background w-full"
       value={(value as string) || ""}
       onChange={(e) => handleFilterChange(filter.key, e.target.value, filter)}
      />
     </div>
    );

   case "date":
    return (
     <CalendarDatePicker
      date={value as DateRange | undefined}
      onSelect={(date) => handleFilterChange(filter.key, date, filter)}
      placeholder={filter.placeholder}
      className="w-full"
     />
    );

   case "select":
    const isMultiple = (filter as SelectFilterConfig<string>).multiple;
    const currentVal = (Array.isArray(value) ? value : []) as string[];

    // Helper for display label
    let displayLabel = filter.allOptionLabel || filter.placeholder || "All";

    // logic: empty array means "ALL"
    if (currentVal.length > 0) {
     if (currentVal.length <= 2) {
      displayLabel = filter.options
       .filter((opt) => currentVal.includes(opt.value))
       .map((opt) => opt.label)
       .join(", ");
     } else {
      displayLabel = `${currentVal.length} selected`;
     }
    }

    return (
     <Popover modal={false}>
      <PopoverTrigger asChild>
       <Button
        variant="outline"
        role="combobox"
        className={cn(
         "h-9 w-full justify-between px-3 text-sm font-normal",
         currentVal.length === 0 && "text-muted-foreground",
        )}>
        <span className="truncate">{displayLabel}</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
       </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[200px] p-0" align="start">
       <Command>
        <CommandList>
         <CommandGroup>
          {/* Option: ALL */}
          <CommandItem
           value="ALL"
           onSelect={() => handleFilterChange(filter.key, [], filter)}>
           <Check
            className={cn(
             "mr-2 h-4 w-4",
             currentVal.length === 0 ? "opacity-100" : "opacity-0",
            )}
           />
           {filter.allOptionLabel || "All"}
          </CommandItem>

          {/* Dynamic Options */}
          {filter.options.map((option) => {
           const isSelected = currentVal.includes(option.value);

           return (
            <CommandItem
             key={option.value}
             value={option.label}
             onSelect={() => {
              if (isMultiple) {
               let newValues = [...currentVal];
               if (newValues.includes(option.value)) {
                newValues = newValues.filter((v) => v !== option.value);
               } else {
                newValues.push(option.value);
               }
               handleFilterChange(filter.key, newValues, filter);
              } else {
               // Single select: always replace with new single-item array
               // If clicking same item, potentially deselect? Or just keep selected? Standard select usually keeps selected.
               // Let's assume standard select behavior: clicking different item switches to it.
               handleFilterChange(filter.key, [option.value], filter);
              }
             }}>
             <Check
              className={cn(
               "mr-2 h-4 w-4",
               isSelected ? "opacity-100" : "opacity-0",
              )}
             />
             {option.label}
            </CommandItem>
           );
          })}
         </CommandGroup>
        </CommandList>
       </Command>
      </PopoverContent>
     </Popover>
    );

   default:
    return null;
  }
 };

 const handleClearFilters = () => {
  onClearFilters?.();
  filters.forEach((filter) => {
   filter.onClear?.();
  });
 };

 return (
  <div className={className}>
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
    {filters.map((filter) => (
     <div
      key={filter.key}
      className={
       filter.type === "text" || filter.type === "date"
        ? "col-span-1 sm:col-span-2 lg:col-span-2"
        : "col-span-1"
      }>
      {renderFilter(filter)}
     </div>
    ))}
   </div>

   {hasActiveFilters && (
    <div className="flex justify-end mt-2">
     <Button
      variant="ghost"
      size="sm"
      onClick={handleClearFilters}
      className="text-muted-foreground hover:text-foreground h-8 px-2 text-xs">
      <XCircle className="mr-1 h-3.5 w-3.5" />
      Clear Filters
     </Button>
    </div>
   )}
  </div>
 );
};
