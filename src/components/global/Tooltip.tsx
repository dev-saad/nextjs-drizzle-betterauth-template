import {
 Popover,
 PopoverContent,
 PopoverTrigger,
} from "@/components/ui/popover";
import {
 TooltipContent,
 TooltipProvider,
 Tooltip as TooltipRoot,
 TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface TooltipProps {
 children: ReactNode;
 content: ReactNode | string;
 side?: "top" | "right" | "bottom" | "left";
 align?: "start" | "center" | "end";
 className?: string;
 delayDuration?: number;
}

export function Tooltip({
 children,
 content,
 side,
 align,
 className,
 delayDuration = 0,
}: TooltipProps) {
 return (
  <Popover modal={false}>
   <TooltipProvider>
    <TooltipRoot delayDuration={delayDuration}>
     <TooltipTrigger asChild>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
     </TooltipTrigger>
     <TooltipContent
      side={side}
      align={align}
      className={cn("hidden lg:block", className)}>
      {content}
     </TooltipContent>
    </TooltipRoot>
   </TooltipProvider>
   <PopoverContent
    side={side}
    align={align}
    className={cn("bg-primary text-primary-foreground lg:hidden", className)}>
    {content}
   </PopoverContent>
  </Popover>
 );
}
