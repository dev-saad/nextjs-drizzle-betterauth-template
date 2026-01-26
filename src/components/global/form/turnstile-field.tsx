"use client";

import { Field, FieldError } from "@/components/ui/field";
import { PartialBy } from "@/lib/utils/types";
import Turnstile, { TurnstileProps } from "react-turnstile";
import { useFieldContext } from ".";

export function TurnstileField({
 ...props
}: PartialBy<TurnstileProps, "sitekey">) {
 const field = useFieldContext<string>();
 const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
 return (
  <Field>
   <Turnstile
    {...props}
    sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
    className="w-full"
    onSuccess={(token) => field.handleChange(token)}
    onError={() => console.log(field.state.value)}
   />
   {isInvalid && <FieldError errors={field.state.meta.errors} />}
  </Field>
 );
}
