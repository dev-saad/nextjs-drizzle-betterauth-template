"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import * as React from "react";

const CollapsibleContext = React.createContext<{
 isOpen: boolean;
} | null>(null);

function Collapsible({
 open,
 onOpenChange,
 defaultOpen,
 children,
 ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
 const [isOpen, setIsOpen] = React.useState(open ?? defaultOpen ?? false);

 React.useEffect(() => {
  if (open !== undefined) {
   setIsOpen(open);
  }
 }, [open]);

 const handleOpenChange = (value: boolean) => {
  if (open === undefined) {
   setIsOpen(value);
  }
  onOpenChange?.(value);
 };

 return (
  <CollapsibleContext.Provider value={{ isOpen }}>
   <CollapsiblePrimitive.Root
    open={open ?? isOpen}
    onOpenChange={handleOpenChange}
    {...props}>
    {children}
   </CollapsiblePrimitive.Root>
  </CollapsibleContext.Provider>
 );
}

function CollapsibleTrigger({
 ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
 return (
  <CollapsiblePrimitive.CollapsibleTrigger
   data-slot="collapsible-trigger"
   {...props}
  />
 );
}

function CollapsibleContent({
 children,
 className,
 ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
 const { isOpen } = React.useContext(CollapsibleContext)!;

 return (
  <CollapsiblePrimitive.CollapsibleContent
   data-slot="collapsible-content"
   forceMount
   {...props}>
   <AnimatePresence initial={false}>
    {isOpen && (
     <m.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="overflow-hidden">
      <div className={className}>{children}</div>
     </m.div>
    )}
   </AnimatePresence>
  </CollapsiblePrimitive.CollapsibleContent>
 );
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
