import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import {
 Field,
 FieldDescription,
 FieldError,
 FieldLabel,
} from "@/components/ui/field";
import {
 InputGroup,
 InputGroupAddon,
 InputGroupButton,
 InputGroupInput,
} from "@/components/ui/input-group";
import {
 InputOTP,
 InputOTPGroup,
 InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import { isZodFieldRequired } from "@/lib/utils/zod";
import { EyeIcon, EyeOff, LucideIcon } from "lucide-react";
import React, { InputHTMLAttributes } from "react";
import { useFieldContext } from ".";
import { PhoneInput } from "../inputPhone";

type InputFieldProps = {
 label?: string;
 Icon?: React.ReactElement | LucideIcon;
 AddonLeft?: React.ReactNode;
 AddonRight?: React.ReactNode;
 iconColor?: string;
 inputClass?: string;
 type?: InputHTMLAttributes<HTMLInputElement>["type"] | "url" | "otp";
 required?: boolean;
 description?: string;
 otpLength?: number;
 containerClassName?: string;
 onComplete?: () => void;
 pattern?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export const InputField = ({
 label,
 Icon,
 iconColor,
 AddonLeft,
 AddonRight,
 inputClass,
 required,
 description,
 type,
 otpLength,
 containerClassName,
 onComplete,
 pattern,
 ...inputProps
}: InputFieldProps) => {
 const field = useFieldContext<string>();
 const isInvalid = field.state.meta.isBlurred && !field.state.meta.isValid;

 const formSchema = field.form.options.validators?.onChange;
 const isRequiredFromSchema = formSchema
  ? isZodFieldRequired(formSchema, field.name)
  : false;
 const showRequired = required !== undefined ? required : isRequiredFromSchema;
 const [showPassword, setShowPassword] = React.useState(false);

 return (
  <Field className={cn(containerClassName)}>
   {label && (
    <FieldLabel htmlFor={field.name.toLowerCase()} className="max-w-fit">
     {label}
     {showRequired && <span className="text-destructive">*</span>}
    </FieldLabel>
   )}
   {type === "tel" ? (
    <PhoneInput
     {...inputProps}
     id={field.name}
     name={field.name}
     defaultCountry="BD"
     value={field.state.value}
     onChange={(e) => field.handleChange(e)}
     international
     onBlur={field.handleBlur}
     aria-invalid={isInvalid}
     Icon={Icon}
     iconColor={iconColor}
    />
   ) : type === "otp" ? (
    <InputOTP
     maxLength={otpLength ?? 6}
     value={field.state.value}
     onChange={(e) => field.handleChange(e)}
     onComplete={onComplete}
     pattern={pattern}>
     <InputOTPGroup>
      {Array.from({ length: otpLength ?? 6 }, (_, i) => (
       <InputOTPSlot key={i} index={i} />
      ))}
     </InputOTPGroup>
    </InputOTP>
   ) : (
    <ButtonGroup>
     {AddonLeft && (
      <ButtonGroupText className="bg-accent text-primary">
       {AddonLeft}
      </ButtonGroupText>
     )}
     <InputGroup>
      <InputGroupInput
       id={field.name.toLowerCase()}
       name={field.name.toLowerCase()}
       value={field.state.value}
       onChange={(e) => {
        if (type === "url") {
         field.handleChange(e.target.value.replace(/^https?:\/\//i, ""));
        } else {
         field.handleChange(e.target.value);
        }
       }}
       onBlur={field.handleBlur}
       aria-invalid={isInvalid}
       className={cn(inputClass)}
       type={type === "password" && showPassword ? "text" : type}
       {...inputProps}
      />
      {Icon && (
       <InputGroupAddon align="inline-end">
        {typeof Icon === "function" ? (
         <Icon className={cn("size-4", iconColor)} />
        ) : (
         Icon
        )}
       </InputGroupAddon>
      )}
      {AddonRight && (
       <InputGroupAddon align="inline-end">{AddonRight}</InputGroupAddon>
      )}
      {type === "password" && (
       <InputGroupAddon align="inline-end">
        <InputGroupButton
         className="cursor-pointer"
         onClick={() => setShowPassword(!showPassword)}>
         {showPassword ? (
          <EyeIcon className={cn("size-4", iconColor)} />
         ) : (
          <EyeOff className={cn("size-4", iconColor)} />
         )}
        </InputGroupButton>
       </InputGroupAddon>
      )}
     </InputGroup>
    </ButtonGroup>
   )}
   {description && <FieldDescription>{description}</FieldDescription>}
   {isInvalid && <FieldError errors={field.state.meta.errors} />}
  </Field>
 );
};
