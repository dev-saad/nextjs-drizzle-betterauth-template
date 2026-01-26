"use client";

import { useAppForm } from "@/components/global/form";
import {
 Dialog,
 DialogContent,
 DialogFooter,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { Typography } from "@/components/ui/typography";
import { twoFactorPasswordFormSchema } from "@/features/user/schema";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Separator } from "../ui/separator";

interface PasswordDialogProps {
 children?: React.ReactNode;
 title: string;
 description: string;
 onSubmit: (password: string) => Promise<unknown> | unknown;
 buttonLabel?: string;
}

export default function PasswordDialog({
 children,
 title,
 description,
 onSubmit,
 buttonLabel,
 variant = "default",
}: PasswordDialogProps & { variant?: "default" | "destructive" }) {
 const [open, setOpen] = useState(false);

 const form = useAppForm({
  defaultValues: {
   password: "",
  },
  validators: {
   onChange: twoFactorPasswordFormSchema,
  },
  onSubmit: async ({ value }) => {
   await onSubmit(value.password);
   setOpen(false);
   form.reset();
  },
 });

 return (
  <Dialog open={open} onOpenChange={setOpen}>
   <DialogTrigger asChild className="cursor-pointer">
    {children}
   </DialogTrigger>
   <DialogContent
    className={cn(variant === "destructive" && "border-destructive")}>
    <DialogHeader>
     <DialogTitle asChild>
      <Typography
       variant="h4"
       as="h2"
       className={cn(variant === "destructive" && "text-destructive")}>
       {title}
      </Typography>
     </DialogTitle>
     <Typography variant="small" className="text-muted-foreground mt-1">
      {description}
     </Typography>
    </DialogHeader>
    <Separator />
    <form
     onSubmit={(e) => {
      e.preventDefault();
      form.handleSubmit();
     }}>
     <FieldGroup>
      <form.AppField name="password">
       {(field) => (
        <field.InputField
         label="Password"
         type="password"
         placeholder="Enter your password"
         required
        />
       )}
      </form.AppField>
      <DialogFooter>
       <form.AppForm>
        <form.SubmitButton variant={variant}>
         {buttonLabel || "Continue"}
        </form.SubmitButton>
       </form.AppForm>
      </DialogFooter>
     </FieldGroup>
    </form>
   </DialogContent>
  </Dialog>
 );
}
