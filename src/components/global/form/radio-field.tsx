import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { useFieldContext } from ".";
import Img from "../Image";

type RadioOption = {
 value: string;
 label: string;
 image?: string;
 description?: string;
 icon?: React.ReactNode;
};

type RadioFieldProps = {
 label?: string;
 options: RadioOption[];
 variant?: "default" | "card" | "box";
 groupClass?: string;
 onValueChange?: (value: string) => void;
 onClick?: (value: string) => void;
 required?: boolean;
 hideRadio?: boolean;
};

export const RadioField = ({
 label,
 options,
 variant,
 groupClass,
 onValueChange,
 onClick,
 required,
 hideRadio,
}: RadioFieldProps) => {
 const field = useFieldContext<string>();

 return (
  <Field>
   {label && <FieldLabel>{label}</FieldLabel>}
   <RadioGroup
    onValueChange={(value: string) => {
     field.handleChange(value);
     onValueChange && onValueChange(value);
    }}
    defaultValue={field.state.value}
    onBlur={field.handleBlur}
    name={field.name}
    className={cn(groupClass)}>
    {variant === "card"
     ? options.map((option) => (
        <FieldLabel
         htmlFor={option.value}
         key={option.value}
         className="rounded-2xl w-full"
         onClick={() => {
          onClick && onClick(option.value);
         }}>
         <Card className="w-full has-[[aria-checked=true]]:ring-primary has-[[aria-checked=true]]:ring-1 has-[[aria-checked=true]]:drop-shadow-lg has-[[aria-checked=true]]:drop-shadow-primary/30 has-[[aria-checked=true]]:bg-accent items-center has-[[aria-checked=true]]:scale-101 duration-300 ease-in origin-center">
          <CardContent className="w-full">
           {option.image && (
            <Img
             src={option.image}
             alt={option.label}
             className="w-full h-[220px]"
             imgClass="object-contain"
            />
           )}
           <RadioGroupItem
            value={option.value}
            id={option.value}
            className="hidden"
           />
          </CardContent>
          <CardFooter>
           <CardTitle className="text-xl">{option.label}</CardTitle>
          </CardFooter>
         </Card>
        </FieldLabel>
       ))
     : variant === "box"
       ? options.map((option) => {
          const isActive = field.state.value === option.value;
          return (
           <FieldLabel
            key={option.value}
            htmlFor={option.value}
            className={cn(
             "flex items-start space-x-3 border rounded-md p-4 cursor-pointer w-full transition-all duration-200 ease-in-out",
             isActive
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-input hover:bg-muted/50 hover:border-muted-foreground/25"
            )}
            onClick={() => {
             onClick && onClick(option.value);
            }}>
            <RadioGroupItem
             value={option.value}
             id={option.value}
             className={cn("mt-1", hideRadio && "hidden")}
            />
            {option.icon && (
             <div className="mt-1 text-primary">{option.icon}</div>
            )}
            <div className="space-y-1">
             <div className="font-medium">{option.label}</div>
             {option.description && (
              <p className="text-sm text-muted-foreground leading-snug">
               {option.description}
              </p>
             )}
            </div>
           </FieldLabel>
          );
         })
       : options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
           <RadioGroupItem value={option.value} id={option.value} />
           <FieldLabel htmlFor={option.value}>{option.label}</FieldLabel>
          </div>
         ))}
   </RadioGroup>
   <FieldError errors={field.state.meta.errors} />
  </Field>
 );
};
