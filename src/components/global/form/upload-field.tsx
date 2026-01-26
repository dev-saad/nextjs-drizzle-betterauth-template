import AvatarUpload, { AvatarUploadProps } from "@/components/ui/avatar-upload";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { FileMetadata } from "@/hooks/use-file-upload";
import type { UploadHookControl } from "@better-upload/client";
import React from "react";
import { useFieldContext } from ".";

type UploadFieldProps = Omit<AvatarUploadProps, "onChange"> & {
 // optional field object from your form render prop
 field?: any;
 control?: UploadHookControl<true>;
 metadata?: Record<string, unknown>;
 label?: string;
 className?: string;
};

export const UploadField: React.FC<UploadFieldProps> = ({
 control,
 label,
 className,
 ...fileProps
}) => {
 const field = useFieldContext<File | FileMetadata | undefined>();

 return (
  <Field className={className}>
   {label && <FieldLabel className="mx-auto !w-fit">{label}</FieldLabel>}
   <AvatarUpload
    {...fileProps}
    value={field?.state.value as any}
    onFileChange={(value) => field?.setValue(value as any)}
    // onRemove={() => {
    //  field?.setValue(undefined);
    //  console.log("field?.state.value", field?.state.value);
    // }}
   />
   {/* render form field errors when we have a field and meta info */}
   {field?.state?.meta?.isTouched && !field?.state?.meta?.isValid && (
    <FieldError errors={field.state.meta.errors} className="text-center" />
   )}
  </Field>
 );
};

export default UploadField;
