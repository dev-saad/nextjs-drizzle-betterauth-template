import { Button, buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useStore } from "@tanstack/react-form";
import { VariantProps } from "class-variance-authority";
import * as m from "motion/react-m";
import React, { ComponentProps } from "react";
import { useFormContext } from ".";

type ActionButtonProps = {
 label?: React.ReactNode;
} & ComponentProps<"button"> &
 VariantProps<typeof buttonVariants>;

interface ActionActionButtonsProps extends React.HTMLAttributes<HTMLDivElement> {
 submitButton?: ActionButtonProps | React.ReactNode;
 cancelButton?: ActionButtonProps | React.ReactNode;
 sticky?: boolean;
 position?:
  | "top"
  | "bottom"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";
 design?: "default" | "card";
 submitType?: "create" | "update";
}

export const ActionButtons = ({
 submitButton,
 cancelButton,
 sticky = false,
 position = "bottom",
 design = "default",
 submitType = "create",
 className,
 ...props
}: ActionActionButtonsProps) => {
 const form = useFormContext();
 const [isSubmitting, canSubmit, isDirty] = useStore(form.store, (state) => [
  state.isSubmitting,
  state.canSubmit,
  state.isDirty,
 ]);

 const renderSubmitButton = () => {
  if (React.isValidElement(submitButton)) {
   return React.cloneElement(
    submitButton as React.ReactElement<{ disabled?: boolean }>,
    {
     disabled:
      (submitType === "update" && !isDirty) || isSubmitting || !canSubmit,
    },
   );
  }

  const {
   label: submitLabel,
   className: submitClassName,
   ...submitProps
  } = (submitButton as ActionButtonProps) || {};

  return (
   <Button
    type="submit"
    disabled={
     (submitType === "update" && !isDirty) || isSubmitting || !canSubmit
    }
    className={submitClassName}
    {...submitProps}>
    {isSubmitting && <Spinner />}
    {submitLabel || "Save Changes"}
   </Button>
  );
 };

 const renderCancelButton = () => {
  if (React.isValidElement(cancelButton)) {
   return cancelButton;
  }

  if (!cancelButton) return null;

  const {
   label: cancelLabel,
   className: cancelClassName,
   ...cancelProps
  } = (cancelButton as ActionButtonProps) || {};

  return (
   <Button
    variant="outline"
    type="button"
    className={cancelClassName}
    {...cancelProps}>
    {cancelLabel || "Cancel"}
   </Button>
  );
 };

 const SubmitBtn = renderSubmitButton();
 const CancelBtn = renderCancelButton();

 // Determine positioning classes
 const getPositionClasses = () => {
  switch (position) {
   case "top":
    return "top-4 left-0 right-0 justify-center";
   case "top-left":
    return "top-4 mr-auto left-4 justify-start w-fit";
   case "top-right":
    return "top-4 ml-auto right-4 justify-end w-fit";
   case "bottom-left":
    return "bottom-4 mr-auto left-4 justify-start w-fit";
   case "bottom-right":
    return "bottom-4 ml-auto right-4 justify-end w-fit";
   case "bottom":
   default:
    return "bottom-0 left-0 right-0 justify-end border-t";
  }
 };

 const isFullWidth = position === "top" || position === "bottom";

 if (sticky) {
  const content = (
   <div className="flex w-full items-center gap-4">
    {isFullWidth ? (
     <div className="container mx-auto flex items-center justify-end gap-4">
      {CancelBtn}
      {SubmitBtn}
     </div>
    ) : (
     <>
      {CancelBtn}
      {SubmitBtn}
     </>
    )}
   </div>
  );

  const containerClasses = cn(
   "sticky z-50 flex items-center bg-background/80 backdrop-blur-md transition-all duration-300",
   getPositionClasses(),
   design === "card" && !isFullWidth
    ? "rounded-xl border shadow-lg p-2"
    : isFullWidth
      ? "-mx-4 px-4 md:-mx-8 md:px-8 py-4"
      : "p-4",
   className,
  );

  const initialY = position.includes("top") ? -100 : 100;

  return (
   <div className={cn(containerClasses, "overflow-hidden")}>
    <m.div
     initial={{ opacity: 0, y: initialY }}
     animate={{ opacity: 1, y: 0 }}
     exit={{ opacity: 0, y: initialY }}
     transition={{ type: "tween", duration: 0.3 }}>
     {content}
    </m.div>
   </div>
  );
 }

 // Default non-sticky render
 return (
  <div
   className={cn("flex items-center justify-end gap-4", className)}
   {...props}>
   {CancelBtn}
   {SubmitBtn}
  </div>
 );
};
