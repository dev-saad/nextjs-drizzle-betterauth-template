"use client";

import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import * as React from "react";

export interface ResponsiveDialogProps {
 open?: boolean;
 onOpenChange?: (open: boolean) => void;
 trigger?: React.ReactNode;
 title?: React.ReactNode;
 description?: React.ReactNode;
 children?: React.ReactNode;
 footer?: React.ReactNode;
 className?: string;
}

export function ResponsiveDialog({
 open,
 onOpenChange,
 trigger,
 title,
 description,
 children,
 footer,
 className,
}: ResponsiveDialogProps) {
 // Internal state for uncontrolled usage
 const [internalOpen, setInternalOpen] = React.useState(false);

 // Determine if controlled
 const isControlled = typeof open !== "undefined";
 const show = isControlled ? open : internalOpen;

 const handleOpenChange = (newOpen: boolean) => {
  if (!isControlled) {
   setInternalOpen(newOpen);
  }
  onOpenChange?.(newOpen);
 };

 return (
  <Dialog open={show} onOpenChange={handleOpenChange}>
   {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
   <DialogContent className={cn("sm:max-w-lg", className)}>
    {(title || description) && (
     <DialogHeader>
      {title && <DialogTitle>{title}</DialogTitle>}
      {description && <DialogDescription>{description}</DialogDescription>}
     </DialogHeader>
    )}
    {children}
    {footer && <DialogFooter>{footer}</DialogFooter>}
   </DialogContent>
  </Dialog>
 );
}
