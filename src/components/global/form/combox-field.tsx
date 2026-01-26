import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import {
 Combobox,
 ComboboxAnchor,
 ComboboxBadgeItem,
 ComboboxBadgeList,
 ComboboxContent,
 ComboboxEmpty,
 ComboboxInput,
 ComboboxItem,
 ComboboxLoading,
 ComboboxTrigger,
} from "@/components/ui/combobox";
import {
 Field,
 FieldDescription,
 FieldError,
 FieldLabel,
} from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { isZodFieldRequired } from "@/lib/utils/zod";
import * as ComboboxPrimitive from "@diceui/combobox";
import { ChevronDown } from "lucide-react";
import { matchSorter } from "match-sorter";
import { ReactElement, useEffect, useMemo, useState } from "react";
import { useFieldContext } from ".";
import FlowketLoader from "../ResponsiveLoader";

type ComboBoxOption = {
 value: string;
 label: string;
};

type ComboBoxFieldProps = {
 label: string;
 options: ComboBoxOption[];
 placeholder?: string;
 searchPlaceholder?: string;
 noResultsText?: string;
 AddonLeft?: React.ReactNode;
 disabled?: boolean;
 required?: boolean;
 loading?: boolean;
 loadingInput?: boolean;
 loadingLabel?: string | ReactElement;
 description?: string;
 infiniteScrollRef?:
  | React.RefObject<HTMLDivElement | null>
  | ((instance: HTMLDivElement | null) => void);
 isFetchingNext?: boolean;
 shouldFilter?: boolean;
 createMissingOptions?: boolean;
} & React.ComponentProps<typeof ComboboxPrimitive.Root>;

export const ComboBoxField = ({
 label,
 options: initialOptions,
 placeholder = "Select an option",
 searchPlaceholder = "Search options...",
 noResultsText = "No option found.",
 AddonLeft,
 disabled,
 required,
 loading,
 loadingInput,
 loadingLabel,
 description,
 infiniteScrollRef,
 isFetchingNext,
 shouldFilter = true,
 createMissingOptions = false,
 ...props
}: ComboBoxFieldProps) => {
 const [input, setInput] = useState("");
 const [open, setOpen] = useState(false);
 const field = useFieldContext<string | string[]>();
 const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
 const formSchema = field.form.options.validators?.onChange;
 const isRequiredFromSchema = formSchema
  ? isZodFieldRequired(formSchema, field.name)
  : false;
 const showRequired = required !== undefined ? required : isRequiredFromSchema;

 const selectedValues = Array.isArray(field.state.value)
  ? field.state.value
  : field.state.value
    ? [field.state.value]
    : [];

 const options = useMemo(() => {
  if (!createMissingOptions) return initialOptions;

  const optionSet = new Set(initialOptions.map((o) => o.value));
  const missingOptions: ComboBoxOption[] = [];

  selectedValues.forEach((val) => {
   if (!optionSet.has(val)) {
    missingOptions.push({
     value: val,
     label: val.charAt(0).toUpperCase() + val.slice(1),
    });
   }
  });

  return [...initialOptions, ...missingOptions];
 }, [initialOptions, selectedValues, createMissingOptions]);

 const activeOption = options.find(
  (option) => option.value === field.state.value,
 );

 function onFilter(opt: string[], inputValue: string) {
  if (!shouldFilter) return opt;
  const filteredOptions = options.filter((option) =>
   opt.includes(option.value),
  );
  return matchSorter(filteredOptions, inputValue, {
   keys: ["label", "value"],
   threshold: matchSorter.rankings.MATCHES,
  }).map((option) => option.value);
 }

 useEffect(() => {
  if (field.state.value && !props.multiple) {
   setInput(activeOption?.label ?? "");
  }
 }, [field.state.value, activeOption?.label, props.multiple]);

 return (
  <Combobox
   value={field.state.value}
   onValueChange={(value) => {
    field.handleChange(value);
    if (!props.multiple) {
     const option = options.find((o) => o.value === value);
     setInput(option?.label ?? "");
    } else {
     setInput("");
    }
   }}
   onInputValueChange={(value) => setInput(value)}
   inputValue={input}
   onFilter={onFilter}
   manualFiltering={!shouldFilter}
   openOnFocus
   onOpenChange={setOpen}
   open={open}
   modal={true}
   {...props}>
   <Field>
    <FieldLabel className="max-w-fit" htmlFor={field.name}>
     {label}
     {showRequired && <span className="text-destructive">*</span>}
    </FieldLabel>
    {loadingInput ? (
     <Skeleton className="h-9" />
    ) : (
     <>
      <ComboboxAnchor
       asChild
       onClick={() => !open && setOpen(true)}
       onBlur={() => {
        if (!props.multiple) {
         setInput(activeOption?.label ?? "");
        }
       }}
       className="min-h-9 h-auto p-0 border-none shadow-none outline-none hover:bg-transparent focus:ring-0 data-focused:ring-0">
       <ButtonGroup className="w-full gap-0 flex-wrap">
        {AddonLeft && (
         <ButtonGroupText className="bg-accent text-primary h-full">
          {AddonLeft}
         </ButtonGroupText>
        )}
        <InputGroup className="w-full h-auto min-h-9 flex items-center justify-between gap-1">
         <div className="flex flex-wrap gap-1 flex-1">
          {props.multiple && selectedValues.length > 0 && (
           <ComboboxBadgeList>
            {selectedValues.map((value) => {
             const option = options.find((o) => o.value === value);
             return (
              <ComboboxBadgeItem key={value} value={value}>
               {option?.label}
              </ComboboxBadgeItem>
             );
            })}
           </ComboboxBadgeList>
          )}
          <ComboboxInput
           placeholder={
            props.multiple && selectedValues.length > 0
             ? undefined
             : placeholder
           }
           className="flex-1 min-w-[60px]"
           id={field.name}
           name={field.name}
           aria-invalid={isInvalid}
           autoComplete="off"
           asChild>
           <InputGroupInput />
          </ComboboxInput>
         </div>
         <ComboboxTrigger className="mr-3">
          <ChevronDown className="h-4 w-4 opacity-50" />
         </ComboboxTrigger>
        </InputGroup>
       </ButtonGroup>
      </ComboboxAnchor>
      <ComboboxContent
       className="max-h-[300px] overflow-y-auto"
       onWheel={(e) => e.stopPropagation()}
       onTouchMove={(e) => e.stopPropagation()}>
       {options.length === 0 && !loading && (
        <ComboboxEmpty>{noResultsText}</ComboboxEmpty>
       )}
       {loading ? (
        <ComboboxLoading className="flex flex-col items-center gap-2">
         <FlowketLoader />
         {loadingLabel}
        </ComboboxLoading>
       ) : (
        options.map((option) => (
         <ComboboxItem key={option.value} value={option.value} outset>
          {option.label}
         </ComboboxItem>
        ))
       )}
       {/* {isFetchingNext && (
        <ComboboxLoading className="flex flex-col items-center gap-2">
         <FlowketLoader />
        </ComboboxLoading>
       )} */}
       {infiniteScrollRef && <div ref={infiniteScrollRef} className="h-2" />}
      </ComboboxContent>
     </>
    )}
    <FieldDescription>{description}</FieldDescription>
    {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
     <FieldError errors={field.state.meta.errors} />
    )}
   </Field>
  </Combobox>
 );
};
