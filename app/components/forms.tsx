import { type FieldMetadata, useInputControl } from "@conform-to/react";
import { clsx } from "clsx";
import React, { type ComponentProps, useId } from "react";

import {
  TemplateEditor,
  type TemplateEditorProps
} from "~/components/template-editor.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "~/components/ui/select.tsx";

import { Button, type ButtonProps } from "./ui/button.tsx";
import { Checkbox, type CheckboxProps } from "./ui/checkbox.tsx";
import { Input } from "./ui/input.tsx";
import { Label } from "./ui/label.tsx";
import {
  RadioGroup,
  RadioGroupItem,
  type RadioGroupProps
} from "./ui/radio-group.tsx";
import { Textarea } from "./ui/textarea.tsx";

export type ListOfErrors = Array<null | string | undefined> | null | undefined;

export function ErrorList({
  errors,
  id
}: {
  errors?: ListOfErrors;
  id?: string;
}) {
  const errorsToRender = errors?.filter(Boolean);
  if (!errorsToRender?.length) return null;
  return (
    <ul className="flex flex-col gap-1" id={id}>
      {errorsToRender.map((e) => (
        <li className="text-[10px] text-tabnine-red-500" key={e}>
          {e}
        </li>
      ))}
    </ul>
  );
}

export const Field = React.forwardRef<
  HTMLInputElement,
  {
    className?: string;
    errors?: ListOfErrors;
    inputProps: React.InputHTMLAttributes<HTMLInputElement>;
    labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
  }
>(({ className, errors, inputProps, labelProps }, ref) => {
  const fallbackId = useId();
  const id = inputProps.id ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;

  return (
    <div className={clsx("flex flex-col gap-1", className)}>
      <Label
        htmlFor={id}
        {...labelProps}
        className="font-bold text-brand-deep-purple"
      />
      <Input
        aria-describedby={errorId}
        aria-invalid={errorId ? true : undefined}
        id={id}
        {...inputProps}
        ref={ref}
      />
      <div className="px-4 pb-3 pt-1">
        {errorId ? <ErrorList errors={errors} id={errorId} /> : null}
      </div>
    </div>
  );
});
Field.displayName = "Field";

export function OldField({
  className,
  errors,
  inputProps,
  labelProps
}: {
  className?: string;
  errors?: ListOfErrors;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
}) {
  const fallbackId = useId();
  const id = inputProps.id ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;

  return (
    <div className={clsx("flex flex-col gap-1", className)}>
      <Label
        htmlFor={id}
        {...labelProps}
        className="font-bold text-brand-deep-purple"
      />
      <Input
        aria-describedby={errorId}
        aria-invalid={errorId ? true : undefined}
        id={id}
        {...inputProps}
      />
      <div className="px-4 pb-3 pt-1">
        {errorId ? <ErrorList errors={errors} id={errorId} /> : null}
      </div>
    </div>
  );
}

export function TextareaField({
  className,
  errors,
  labelProps,
  textareaProps
}: {
  className?: string;
  errors?: ListOfErrors;
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
  textareaProps: React.InputHTMLAttributes<HTMLTextAreaElement>;
}) {
  const fallbackId = useId();
  const id = textareaProps.id ?? textareaProps.name ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;
  return (
    <div className={clsx("flex flex-col gap-1", className)}>
      <Label
        htmlFor={id}
        {...labelProps}
        className="font-bold text-brand-deep-purple"
      />
      <Textarea
        aria-describedby={errorId}
        aria-invalid={errorId ? true : undefined}
        id={id}
        placeholder=" "
        {...textareaProps}
      ></Textarea>
      <div className="px-4 pb-3 pt-1">
        {errorId ? <ErrorList errors={errors} id={errorId} /> : null}
      </div>
    </div>
  );
}

export function TemplateEditorField({
  className,
  errors,
  labelProps,
  templateEditorProps
}: {
  className?: string;
  errors?: ListOfErrors;
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
  templateEditorProps: TemplateEditorProps;
}) {
  const fallbackId = useId();
  const id = templateEditorProps.id ?? templateEditorProps.name ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;
  return (
    <div className={clsx("flex flex-col gap-1", className)}>
      <Label
        htmlFor={id}
        {...labelProps}
        className="font-bold text-brand-deep-purple"
      />
      <TemplateEditor
        aria-describedby={errorId}
        aria-invalid={errorId ? true : undefined}
        id={id}
        placeholder=" "
        {...templateEditorProps}
      ></TemplateEditor>
      <div className="px-4 pb-3 pt-1">
        {errorId ? <ErrorList errors={errors} id={errorId} /> : null}
      </div>
    </div>
  );
}

export function RadioGroupField({
  className,
  errors,
  labelProps,
  meta,
  options,
  radioGroupProps
}: {
  className?: string;
  errors?: ListOfErrors;
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
  meta: FieldMetadata<string>;
  options: { name: string; value: string }[];
  radioGroupProps: RadioGroupProps;
}) {
  const control = useInputControl(meta);
  const fallbackId = useId();
  const id = meta.name ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;
  return (
    <div className={className}>
      <Label
        htmlFor={id}
        {...labelProps}
        className="font-bold text-brand-deep-purple"
      />
      <RadioGroup
        name={meta.name}
        onBlur={control.blur}
        onValueChange={control.change}
        value={control.value ?? ""}
      >
        {options.map(({ name, value }) => (
          <div className="flex items-center space-x-2" key={value}>
            <RadioGroupItem id={`${meta.id}-${value}`} value={value} />
            <Label htmlFor={`${meta.id}-${value}`}>{name}</Label>
          </div>
        ))}
      </RadioGroup>
      <div className="px-4 pb-3 pt-1">
        {errorId ? <ErrorList errors={errors} id={errorId} /> : null}
      </div>
    </div>
  );
}

export function CheckboxGroupField({
  className,
  errors,
  labelProps,
  meta,
  options
}: {
  className?: string;
  errors?: ListOfErrors;
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
  meta: FieldMetadata<"" | string[]>;
  options: Array<{ name: string; value: string }>;
}) {
  const fallbackId = useId();
  const id = meta.name ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;
  return (
    <div className={className}>
      <Label
        htmlFor={id}
        {...labelProps}
        className="font-bold text-brand-deep-purple"
      />
      <div className="grid gap-2">
        {options.map(({ name, value }, index) => (
          <div className="flex items-center space-x-2" key={value}>
            <Checkbox
              defaultChecked={
                meta.initialValue && Array.isArray(meta.initialValue)
                  ? meta.initialValue.includes(value)
                  : meta.initialValue === value
              }
              id={`${meta.id}-${value}`}
              name={meta.name}
              value={value}
            />
            <Label htmlFor={`${meta.id}-${value}`}>{name}</Label>
          </div>
        ))}
      </div>
      <div className="px-4 pb-3 pt-1">
        {errorId ? <ErrorList errors={errors} id={errorId} /> : null}
      </div>
    </div>
  );
}

export function SelectField({
  className,
  errors,
  labelProps,
  meta,
  options,
  ...selectProps
}: {
  className?: string;
  errors?: ListOfErrors;
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
  meta: FieldMetadata<string>;
  options: Array<{ name: string; value: string }>;
} & ComponentProps<typeof Select>) {
  const control = useInputControl(meta);
  const fallbackId = useId();
  const id = meta.name ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;

  return (
    <div className={clsx("flex flex-col gap-1", className)}>
      <Label
        htmlFor={id}
        {...labelProps}
        className="font-bold text-brand-deep-purple"
      />
      <Select
        {...selectProps}
        name={meta.name}
        onOpenChange={(open) => {
          if (!open) control.blur();
        }}
        onValueChange={(value) => {
          control.change(value);
        }}
        value={control.value ?? meta.initialValue}
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder={labelProps.children} />
        </SelectTrigger>
        <SelectContent>
          {options.map(({ name, value }) => (
            <SelectItem key={value} value={value}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="px-4 pb-3 pt-1">
        {errorId ? <ErrorList errors={errors} id={errorId} /> : null}
      </div>
    </div>
  );
}

export function CheckboxField({
  buttonProps,
  className,
  errors,
  labelProps
}: {
  buttonProps: CheckboxProps & {
    form: string;
    name: string;
    value?: string;
  };
  className?: string;
  errors?: ListOfErrors;
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
}) {
  const { defaultChecked, key, ...checkboxProps } = buttonProps;
  const fallbackId = useId();
  const checkedValue = buttonProps.value ?? "on";
  const input = useInputControl({
    formId: buttonProps.form,
    initialValue: defaultChecked ? checkedValue : undefined,
    key,
    name: buttonProps.name
  });
  const id = buttonProps.id ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;

  return (
    <div className={className}>
      <div className="flex gap-2">
        <Label
          className="font-bold text-brand-deep-purple"
          htmlFor={id}
          {...labelProps}
        />
        <Checkbox
          {...checkboxProps}
          aria-describedby={errorId}
          aria-invalid={errorId ? true : undefined}
          checked={input.value === checkedValue}
          id={id}
          onBlur={(event) => {
            input.blur();
            buttonProps.onBlur?.(event);
          }}
          onCheckedChange={(state) => {
            input.change(state.valueOf() ? checkedValue : "");
            buttonProps.onCheckedChange?.(state);
          }}
          onFocus={(event) => {
            input.focus();
            buttonProps.onFocus?.(event);
          }}
          type="button"
        />
      </div>
      <div className="px-4 pb-3 pt-1">
        {errorId ? <ErrorList errors={errors} id={errorId} /> : null}
      </div>
    </div>
  );
}

export function SubmitButton({
  state = "idle",
  submittingText = "Submitting...",
  ...props
}: ButtonProps & {
  state?: "idle" | "loading" | "submitting";
  submittingText?: string;
}) {
  return (
    <Button
      {...props}
      className={clsx(
        props.className,
        "bg-tabnine-bright-red text-tabnine-neutral-white duration-300 hover:bg-tabnine-red-400 disabled:bg-tabnine-blue-300 disabled:text-tabnine-neutral-light-white"
      )}
      disabled={props.disabled || state !== "idle"}
    >
      {state !== "idle" ? submittingText : props.children}
    </Button>
  );
}
