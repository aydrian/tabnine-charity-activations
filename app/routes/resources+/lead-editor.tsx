import { getFormProps, getTextareaProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { LeadScore } from "@prisma/client";
import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Link, useFetcher } from "@remix-run/react";
import { z } from "zod";

import type { getLeads } from "~/models/leads.server.ts";

import { ErrorList, SubmitButton, TextareaField } from "~/components/forms.tsx";
import { LeadScoreSelector } from "~/components/lead-score-selector.tsx";
import { requireUserId } from "~/utils/auth.server.ts";
import { prisma } from "~/utils/db.server.ts";

type LeadType = Awaited<ReturnType<typeof getLeads>>[number];

const LeadEditorSchema = z.object({
  id: z.string(),
  notes: z.string().optional(),
  score: z.nativeEnum(LeadScore)
});

export const action = async ({ request }: ActionFunctionArgs) => {
  await requireUserId(request);
  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: LeadEditorSchema
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      {
        status: submission.status === "error" ? 400 : 200
      }
    );
  }

  const { id, notes, score } = submission.value;
  const lead = await prisma.lead.update({
    data: { notes, score },
    select: { Donation: { select: { eventId: true } } },
    where: { id }
  });
  return redirect(`/admin/events/${lead.Donation.eventId}/leads`);
};

export function LeadEditor({ lead }: { lead: LeadType }) {
  const leadEditorFetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    constraint: getZodConstraint(LeadEditorSchema),
    id: "lead-editor",
    lastResult: leadEditorFetcher.data?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: LeadEditorSchema });
    },
    shouldRevalidate: "onBlur"
  });

  return (
    <leadEditorFetcher.Form
      action="/resources/lead-editor"
      method="post"
      {...getFormProps(form)}
      className="flex flex-col gap-3"
    >
      <div className="flex flex-col gap-1 md:flex-row md:gap-3">
        <input name="id" type="hidden" value={lead.id} />
        <LeadScoreSelector
          defaultSelected={lead.score}
          label="Score Lead"
          name={fields.score.name}
        />
        <TextareaField
          className="flex grow flex-col"
          errors={fields.notes.errors}
          labelProps={{ children: "Notes:", htmlFor: fields.notes.id }}
          textareaProps={{
            ...getTextareaProps(fields.notes),
            defaultValue: lead.notes ?? undefined
          }}
        />
        <ErrorList errors={form.errors} id={form.errorId} />
      </div>
      <div className="flex justify-end gap-3">
        <SubmitButton className="px-6 py-2 md:min-w-[150px] md:self-start">
          Save
        </SubmitButton>
        <Link
          className="rounded border border-gray-200 bg-white px-6 py-2 text-xl font-medium text-gray-900 no-underline hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
          preventScrollReset={true}
          relative="path"
          to="../"
        >
          Cancel
        </Link>
      </div>
    </leadEditorFetcher.Form>
  );
}
