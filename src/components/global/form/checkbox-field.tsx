import { Checkbox } from "@/components/animate-ui/primitives/radix/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { useFieldContext } from ".";

type CheckboxFieldProps = {
 label: string;
 description?: string;
 required?: boolean;
 className?: string;
};

export const CheckboxField = ({
 label,
 description,
 required,
 className,
}: CheckboxFieldProps) => {
 const field = useFieldContext<boolean>();

 return (
  <Field orientation="horizontal" className={cn("max-w-fit", className)}>
   <Checkbox
    id={field.name}
    checked={field.state.value}
    onCheckedChange={(checked: boolean) => {
     field.handleChange(checked === true);
    }}
    onBlur={field.handleBlur}
   />
   <FieldLabel htmlFor={field.name} className="cursor-pointer">
    {label}
   </FieldLabel>
  </Field>
 );
};
