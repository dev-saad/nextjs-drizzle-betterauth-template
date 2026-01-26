import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group";
import { isZodFieldRequired } from "@/lib/utils/zod";
import { LucideIcon } from "lucide-react";
import { useFieldContext } from ".";

type TextareaFieldProps = {
 label: string;
 Icon?: React.ComponentType | LucideIcon;
 AddonLeft?: React.ReactNode;
 AddonRight?: React.ReactNode;
 iconColor?: string;
 inputClass?: string;
 required?: boolean;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const TextareaField = ({
 label,
 Icon,
 iconColor,
 AddonLeft,
 AddonRight,
 inputClass,
 required,
 ...inputProps
}: TextareaFieldProps) => {
 const field = useFieldContext<string>();
 const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

 const formSchema = field.form.options.validators?.onChange;
 const isRequiredFromSchema = formSchema
  ? isZodFieldRequired(formSchema, field.name)
  : false;
 const showRequired = required !== undefined ? required : isRequiredFromSchema;

 return (
  <Field>
   <FieldLabel htmlFor={field.name} className="max-w-fit">
    {label}
    {showRequired && <span className="text-destructive">*</span>}
   </FieldLabel>
   <InputGroup>
    <InputGroupTextarea placeholder="Ask, Search or Chat..." {...inputProps} />
   </InputGroup>

   {isInvalid && <FieldError errors={field.state.meta.errors} />}
  </Field>
 );
};

export default TextareaField;
