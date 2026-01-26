"use client";

import {
 AlertDialog,
 AlertDialogAction,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
 AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import React, { MouseEvent, useState } from "react";
import { buttonVariants } from "../ui/button";

interface AppAlertDialogProps {
 trigger: React.ReactNode;
 title: string;
 description?: React.ReactNode;
 cancelText?: string;
 actionText?: string;
 variant?: "default" | "destructive";
 onAction?: () => Promise<void> | void;
}

export function AppAlertDialog({
 trigger,
 title,
 description,
 cancelText = "Cancel",
 actionText = "Continue",
 variant = "default",
 onAction,
}: AppAlertDialogProps) {
 const [isLoading, setIsLoading] = useState(false);
 const [open, setOpen] = useState(false);

 const handleAction = async (e: MouseEvent) => {
  e.preventDefault();
  if (!onAction) return;
  setIsLoading(true);
  try {
   await onAction();
  } finally {
   setIsLoading(false);
   setOpen(false);
  }
 };

 return (
  <AlertDialog open={open} onOpenChange={setOpen}>
   <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
   <AlertDialogContent>
    <AlertDialogHeader>
     <AlertDialogTitle>{title}</AlertDialogTitle>
     {description && (
      <AlertDialogDescription>{description}</AlertDialogDescription>
     )}
    </AlertDialogHeader>
    <AlertDialogFooter>
     <AlertDialogCancel disabled={isLoading}>{cancelText}</AlertDialogCancel>
     <AlertDialogAction
      onClick={handleAction}
      className={buttonVariants({
       variant: variant === "destructive" ? "destructive" : "default",
      })}
      disabled={isLoading}>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {actionText}
     </AlertDialogAction>
    </AlertDialogFooter>
   </AlertDialogContent>
  </AlertDialog>
 );
}
