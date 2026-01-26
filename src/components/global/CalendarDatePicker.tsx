"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
 Popover,
 PopoverContent,
 PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CalendarDatePickerProps {
 date?: DateRange;
 onSelect?: (date: DateRange | undefined) => void;
 className?: string;
 placeholder?: string;
 numberOfMonths?: number;
}

export function CalendarDatePicker({
 date,
 onSelect,
 className,
 placeholder = "Pick a date",
 numberOfMonths = 2,
}: CalendarDatePickerProps) {
 return (
  <div className={cn("grid gap-2", className)}>
   <Popover>
    <PopoverTrigger asChild>
     <Button
      id="date"
      variant={"outline"}
      className={cn(
       "w-full justify-start text-left font-normal ",
       !date && "text-muted-foreground"
      )}>
      <CalendarIcon className="size-4" />
      {date?.from ? (
       date.to ? (
        <span className="line-clamp-1 whitespace-break-spaces">
         {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
        </span>
       ) : (
        <span className="line-clamp-1 whitespace-break-spaces">
         {format(date.from, "LLL dd, y")}
        </span>
       )
      ) : (
       <span className="line-clamp-1 whitespace-break-spaces">
        {placeholder}
       </span>
      )}
     </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start">
     <Calendar
      autoFocus
      mode="range"
      defaultMonth={date?.from}
      selected={date}
      onSelect={onSelect}
      numberOfMonths={numberOfMonths}
     />
    </PopoverContent>
   </Popover>
  </div>
 );
}
