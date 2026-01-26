"use strict";

import { Slot } from "@radix-ui/react-slot";
import React from "react";
import { copyToClipboard } from "../../lib/utils";

interface CopyTextProps extends React.HTMLAttributes<HTMLSpanElement> {
 text: string;
 message?: string;
 asChild?: boolean;
}

export const CopyText = React.forwardRef<HTMLSpanElement, CopyTextProps>(
 ({ text, message, children, className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "span";

  const handleCopy = (e: React.MouseEvent) => {
   e.preventDefault();
   e.stopPropagation();
   copyToClipboard(text, { message });
  };

  return (
   <Comp ref={ref} onClick={handleCopy} className={className} {...props}>
    {children}
   </Comp>
  );
 },
);

CopyText.displayName = "CopyText";
