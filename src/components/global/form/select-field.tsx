import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/ui/select";
import { isZodFieldRequired } from "@/lib/utils/zod";
import { useFieldContext } from ".";

type SelectOption = {
 value: string;
 label: string;
};

type SelectFieldProps = {
 label: string;
 options: SelectOption[];
 placeholder?: string;
 required?: boolean;
};

export const SelectField = ({
 label,
 options,
 placeholder,
 required,
}: SelectFieldProps) => {
 const field = useFieldContext<string>();
 const formSchema = field.form.options.validators?.onChange;
 const isRequiredFromSchema = formSchema
  ? isZodFieldRequired(formSchema, field.name)
  : false;
 const showRequired = required !== undefined ? required : isRequiredFromSchema;

 return (
  <Field>
   <FieldLabel htmlFor={field.name}>
    {label}
    {showRequired && <span className="text-destructive">*</span>}
   </FieldLabel>
   <Select
    value={field.state.value}
    onValueChange={(value: string) => field.handleChange(value)}>
    <SelectTrigger id={field.name} onBlur={field.handleBlur}>
     <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent>
     {options?.map((option) => (
      <SelectItem key={option.value} value={option.value}>
       {option.label}
      </SelectItem>
     ))}
    </SelectContent>
   </Select>
   {field.state.meta.errors.length > 0 && (
    <FieldError errors={field.state.meta.errors} />
   )}
  </Field>
 );
};
