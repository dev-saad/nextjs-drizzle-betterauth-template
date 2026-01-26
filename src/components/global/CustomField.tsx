import { Field, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

interface CustomFieldProps extends React.ComponentProps<"input"> {
 id?: string;
 label: string;
}

const CustomField = (props: CustomFieldProps) => {
 return (
  <Field>
   <FieldLabel htmlFor={props.id}>{props.label}</FieldLabel>
   <Input
    id={props.id}
    type={props.type ?? "text"}
    placeholder={props.placeholder}
    required={props.required}
   />
  </Field>
 );
};

export default CustomField;
