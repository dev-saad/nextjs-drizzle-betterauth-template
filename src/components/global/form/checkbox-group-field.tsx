import {
 CheckboxGroup,
 CheckboxGroupDescription,
 CheckboxGroupItem,
 CheckboxGroupLabel,
 CheckboxGroupList,
 CheckboxGroupMessage,
} from "@/components/ui/checkbox-group";
import { Field, FieldContent } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { isZodFieldRequired } from "@/lib/utils/zod";
import * as CheckboxGroupPrimitive from "@diceui/checkbox-group";
import { useFieldContext } from ".";

interface CheckboxGroupFieldProps extends React.ComponentProps<
 typeof CheckboxGroupPrimitive.Root
> {
 label?: string;
 description?: string;
 options: { label: string; value: string }[];
 className?: string;
 direction?: "horizontal" | "vertical";
 hasSelectAll?: boolean;
}

export const CheckboxGroupField = ({
 label,
 description,
 options,
 className,
 direction = "horizontal",
 hasSelectAll,
 required,
 ...props
}: CheckboxGroupFieldProps) => {
 const field = useFieldContext<string[]>();
 const isInvalid = field.state.meta.isBlurred && !field.state.meta.isValid;

 const formSchema = field.form.options.validators?.onChange;
 const isRequiredFromSchema = formSchema
  ? isZodFieldRequired(formSchema, field.name)
  : false;
 const showRequired = required !== undefined ? required : isRequiredFromSchema;
 const value = field.state.value || [];

 const allValues = options.map((o) => o.value);
 const isAllSelected =
  allValues.length > 0 && allValues.every((v) => value.includes(v));

 const uiValue = isAllSelected ? [...value, "all"] : value;

 const handleValueChange = (newValue: string[]) => {
  if (newValue.includes("all") && !uiValue.includes("all")) {
   // "All" was just checked
   field.handleChange(allValues);
  } else if (!newValue.includes("all") && uiValue.includes("all")) {
   // "All" was just unchecked
   field.handleChange([]);
  } else {
   // Normal item toggle
   field.handleChange(newValue.filter((v) => v !== "all"));
  }
 };

 const displayOptions = hasSelectAll
  ? [{ label: "All", value: "all" }, ...options]
  : options;

 return (
  <Field>
   <FieldContent>
    <CheckboxGroup
     value={uiValue}
     onValueChange={handleValueChange}
     orientation={direction}
     className={cn(className)}
     aria-invalid={isInvalid}
     {...props}>
     {label && <CheckboxGroupLabel>{label}</CheckboxGroupLabel>}
     <CheckboxGroupList className="flex-wrap">
      {displayOptions.map((option) => (
       <CheckboxGroupItem
        key={option.value}
        value={option.value}
        className="cursor-pointer"
        labelClassName="cursor-pointer">
        {option.label}
       </CheckboxGroupItem>
      ))}
     </CheckboxGroupList>
     {description && (
      <CheckboxGroupDescription>{description}</CheckboxGroupDescription>
     )}
     <CheckboxGroupMessage>{field.state.meta.errors?.[0]}</CheckboxGroupMessage>
    </CheckboxGroup>
   </FieldContent>
  </Field>
 );
};
