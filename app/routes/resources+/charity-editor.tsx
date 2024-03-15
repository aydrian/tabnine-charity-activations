import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { type ChangeEvent, useRef } from "react";
import { z } from "zod";

import {
  ErrorList,
  Field,
  SubmitButton,
  TextareaField
} from "~/components/forms.tsx";
import { Icon } from "~/components/icon.tsx";
import { requireUserId } from "~/utils/auth.server.ts";
import { prisma } from "~/utils/db.server.ts";
import slugify from "~/utils/slugify.ts";

import { FileUploader } from "./upload.tsx";

export const CharityEditorSchema = z.object({
  description: z.string({ required_error: "Description is required" }),
  id: z.string().optional(),
  logoSVG: z.string().optional(),
  name: z.string({ required_error: "Name is required" }),
  slug: z.string({ required_error: "Slug is required" }),
  twitter: z.string().optional(),
  website: z.string().url().optional()
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: CharityEditorSchema
  });
  if (submission.status === "error") {
    return json(submission.reply(), { status: 400 });
  }

  const { id, ...data } = submission.value;

  if (id) {
    await prisma.charity.update({
      data,
      where: { id }
    });
  } else {
    await prisma.charity.create({
      data: {
        ...data,
        createdBy: userId
      }
    });
  }
  return redirect("/admin/dashboard");
};

export function CharityEditor({
  charity
}: {
  charity?: {
    description: string;
    id: string;
    logoSVG: null | string;
    name: string;
    slug: string;
    twitter: null | string;
    website: null | string;
  };
}) {
  const slugRef = useRef<HTMLInputElement>(null);
  const charityEditorFetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    constraint: getZodConstraint(CharityEditorSchema),
    id: "charity-editor",
    lastResult: charityEditorFetcher.data?.submission,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: CharityEditorSchema });
    },
    shouldRevalidate: "onBlur"
  });

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nameValue = event.target.value;
    if (slugRef.current?.value.length === 0) {
      slugRef.current.value = slugify(nameValue, { lower: true });
    }
  };

  return (
    <charityEditorFetcher.Form
      action="/resources/charity-editor"
      method="post"
      {...getFormProps(form)}
      className="not-prose mb-8 flex flex-col sm:mb-4"
    >
      <input name="id" type="hidden" value={charity?.id} />
      <Field
        errors={fields.name.errors}
        inputProps={{
          ...getInputProps(fields.name, { type: "text" }),
          defaultValue: charity?.name,
          onBlur: handleOnChange
        }}
        labelProps={{ children: "Name", htmlFor: fields.name.id }}
      />
      <Field
        errors={fields.slug.errors}
        inputProps={{
          ...getInputProps(fields.slug, { type: "text" }),
          defaultValue: charity?.slug
        }}
        labelProps={{ children: "Slug", htmlFor: fields.slug.id }}
        ref={slugRef}
      />
      <TextareaField
        errors={fields.description.errors}
        labelProps={{ children: "Description", htmlFor: fields.description.id }}
        textareaProps={{
          ...getTextareaProps(fields.description),
          defaultValue: charity?.description
        }}
      />
      <div className="flex flex-col gap-1">
        <span className="font-bold !text-brand-deep-purple">Logo</span>
        <FileUploader
          UploadIcon={<Icon name="photo-outline" />}
          className="h-52"
          defaultValue={charity?.logoSVG ?? undefined}
          fileTypes=".svg"
          name={fields.logoSVG.name}
        />
        <span className=" px-4 pb-3 pt-1 text-xs italic text-gray-700">
          Please use a 1-color svg file.
        </span>
      </div>
      <Field
        errors={fields.website.errors}
        inputProps={{
          ...getInputProps(fields.website, { type: "text" }),
          defaultValue: charity?.website ?? undefined
        }}
        labelProps={{ children: "Website", htmlFor: fields.website.id }}
      />
      <Field
        errors={fields.twitter.errors}
        inputProps={{
          ...getInputProps(fields.twitter, { type: "text" }),
          defaultValue: charity?.twitter ?? undefined
        }}
        labelProps={{ children: "Twitter", htmlFor: fields.twitter.id }}
      />
      <ErrorList errors={form.errors} id={form.errorId} />
      <SubmitButton
        className="mt-4 px-6 py-2 md:min-w-[150px] md:self-start"
        state={charityEditorFetcher.state}
        type="submit"
      >
        Submit
      </SubmitButton>
    </charityEditorFetcher.Form>
  );
}
