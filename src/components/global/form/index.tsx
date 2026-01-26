import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { ActionButtons } from "./action-buttons";
import { CheckboxField } from "./checkbox-field";
import { CheckboxGroupField } from "./checkbox-group-field";
import { ComboBoxField } from "./combox-field";
import { InputField } from "./input-field";
import { RadioField } from "./radio-field";
import { SelectField } from "./select-field";
import { SubmitButton } from "./submit-button";
import TextareaField from "./textarea";
import { TurnstileField } from "./turnstile-field";
import { UploadField } from "./upload-field";

export const { fieldContext, useFieldContext, formContext, useFormContext } =
 createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
 fieldComponents: {
  InputField,
  CheckboxField,
  CheckboxGroupField,
  SelectField,
  RadioField,
  ComboBoxField,
  UploadField,
  TextareaField,
  TurnstileField,
 },
 formComponents: {
  SubmitButton,
  ActionButtons,
 },
 fieldContext,
 formContext,
});
