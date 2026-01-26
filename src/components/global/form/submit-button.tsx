import { Button, buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useStore } from "@tanstack/react-form";
import { VariantProps } from "class-variance-authority";
import { ComponentProps } from "react";
import { useFormContext } from ".";

type SubmitButtonProps = {
 children: React.ReactNode;
 className?: string;
} & ComponentProps<"button"> &
 VariantProps<typeof buttonVariants>;

export const SubmitButton = ({
 children,
 className,
 ...props
}: SubmitButtonProps) => {
 const form = useFormContext();

 const [isSubmitting, canSubmit] = useStore(form.store, (state) => [
  state.isSubmitting,
  state.canSubmit,
 ]);

 return (
  <Button
   type="submit"
   className={className}
   disabled={isSubmitting || !canSubmit}
   {...props}>
   {isSubmitting && <Spinner />}
   {children}
  </Button>
 );
};
