import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { CharityPicker } from "~/components/charity-picker.tsx";
import {
  CheckboxGroupField,
  ErrorList,
  Field,
  RadioGroupField,
  SubmitButton,
  TextareaField
} from "~/components/forms.tsx";
import { prisma } from "~/utils/db.server.ts";

const DonationWithLeads = z.object({
  charityId: z.string(),
  collectLeads: z.literal("true"),
  company: z.string({ required_error: "Company is required" }),
  email: z.string({ required_error: "Company email is invalid" }),
  eventId: z.string(),
  firstName: z.string({ required_error: "First name is required" }),
  jobRole: z.string({ required_error: "Job title is required" }),
  lastName: z.string({ required_error: "Last name is required" })
});

const DonationWithoutLeads = z.object({
  charityId: z.string(),
  collectLeads: z.literal("false"),
  companyAdoption: z.string(),
  email: z.string({ required_error: "Company email is invalid" }),
  eventId: z.string(),
  sdicUseAI: z.string(),
  statementAgree: z.coerce.number(),
  toolEval: z.string(),
  usingAI: z.boolean()
});

const DonationFormSchema = z.discriminatedUnion("collectLeads", [
  DonationWithLeads,
  DonationWithoutLeads
]);

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: DonationFormSchema
  });
  if (submission.status === "error") {
    return json(submission.reply(), { status: 400 });
  }

  const { charityId, collectLeads, eventId, ...leadData } = submission.value;
  console.log({ collectLeads, leadData });
  const createLead = { Lead: { create: { ...leadData } } };

  const donation = await prisma.donation.create({
    // @ts-ignore
    data: {
      charityId,
      eventId,
      ...(collectLeads === "true" ? createLead : undefined)
    },
    select: { id: true }
  });
  return redirect(`/donated/${donation.id}`);
};

export function DonationForm({
  event
}: {
  event: {
    charities: {
      color: string;
      id: string;
      name: string;
    }[];
    collectLeads: boolean;
    donationAmount: string;
    donationCurrency: string;
    id: string;
    legalBlurb: null | string;
    name: string;
  };
}) {
  const { t } = useTranslation();
  const donationFormFetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    constraint: getZodConstraint(DonationFormSchema),
    defaultValue: {
      collectLeads: String(event.collectLeads),
      eventId: event.id
    },
    id: "donation-form",
    lastResult: donationFormFetcher.data,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: DonationFormSchema });
    },
    shouldRevalidate: "onBlur"
  });

  return (
    <donationFormFetcher.Form
      action="/resources/donate"
      className="not-prose flex flex-col sm:mb-4"
      method="post"
      {...getFormProps(form)}
    >
      <input {...getInputProps(fields.eventId, { type: "hidden" })} />
      <input {...getInputProps(fields.collectLeads, { type: "hidden" })} />
      <Field
        errors={fields.email.errors}
        inputProps={{
          ...getInputProps(fields.email, { type: "email" }),
          autoComplete: "email"
        }}
        labelProps={{
          children: t("email"),
          htmlFor: fields.email.id
        }}
      />
      {event.collectLeads ? (
        <>
          <Field
            errors={fields.firstName.errors}
            inputProps={{
              ...getInputProps(fields.firstName, { type: "text" }),
              autoComplete: "given-name"
            }}
            labelProps={{
              children: t("given-name"),
              htmlFor: fields.firstName.id
            }}
          />
          <Field
            errors={fields.lastName.errors}
            inputProps={{
              ...getInputProps(fields.lastName, { type: "text" }),
              autoComplete: "family-name"
            }}
            labelProps={{
              children: t("family-name"),
              htmlFor: fields.lastName.id
            }}
          />
          <Field
            errors={fields.company.errors}
            inputProps={{
              ...getInputProps(fields.company, { type: "text" }),
              autoComplete: "organization"
            }}
            labelProps={{
              children: t("organization"),
              htmlFor: fields.company.id
            }}
          />
          <Field
            errors={fields.jobRole.errors}
            inputProps={{
              ...getInputProps(fields.jobRole, { type: "text" }),
              autoComplete: "organization-title"
            }}
            labelProps={{
              children: t("organization-title"),
              htmlFor: fields.jobRole.id
            }}
          />
        </>
      ) : null}
      <RadioGroupField
        errors={fields.usingAI.errors}
        labelProps={{
          children:
            "As an individual, are you currently using AI in your software development processes?",
          htmlFor: fields.usingAI.id
        }}
        options={[
          { label: "Yes", value: "true" },
          { label: "No", value: "false" }
        ]}
        radioGroupProps={{
          ...getInputProps(fields.usingAI, { type: "text" })
        }}
      />
      <RadioGroupField
        errors={fields.companyAdoption.errors}
        labelProps={{
          children:
            "Are you currently using AI in your software development processes?",
          htmlFor: fields.companyAdoption.id
        }}
        options={[
          { label: "Not yet evaluating", value: "Not yet evaluating" },
          {
            label: "Plan to evaluate in the next 6 months",
            value: "Plan to evaluate in the next 6 months"
          },
          { label: "Currently Evaluating", value: "Currently Evaluating" },
          {
            label: "Have one or more tools in use within our company",
            value: "Have one or more tools in use within our company"
          },
          {
            label:
              "Broad adoption of one or more tools across our organization",
            value: "Broad adoption of one or more tools across our organization"
          }
        ]}
        radioGroupProps={{
          ...getInputProps(fields.companyAdoption, { type: "text" })
        }}
      />
      <CheckboxGroupField
        checkboxGroupProps={{
          ...getInputProps(fields.sdicUseAI, { type: "text" })
        }}
        errors={fields.sdicUseAI.errors}
        labelProps={{
          children: `In what parts of the software development lifecycle are AI tools in use today?`,
          htmlFor: fields.sdicUseAI.id
        }}
        options={[
          {
            label: "Planning / architecture",
            value: "Planning / architecture"
          },
          { label: "Code generation", value: "Code generation" },
          { label: "Documentation", value: "Documentation" },
          { label: "Testing", value: "Testing" },
          { label: "Security", value: "Security" },
          { label: "Deployment / DevOps", value: "Deployment / DevOps" },
          { label: "Maintenance / Bug Fixes", value: "Maintenance / Bug Fixes" }
        ]}
      />
      <RadioGroupField
        errors={fields.statementAgree.errors}
        labelProps={{
          children: `How much do you agree with this statement, “AI tools add value to the software development process today”?`,
          htmlFor: fields.statementAgree.id
        }}
        options={[
          { label: "1 - strongly disagree ", value: "1" },
          { label: "2", value: "2" },
          { label: "3", value: "3" },
          { label: "4", value: "4" },
          { label: "5", value: "5" },
          { label: "6", value: "6" },
          { label: "7", value: "7" },
          { label: "8", value: "8" },
          { label: "9", value: "9" },
          { label: "10 - strongly agree", value: "10" }
        ]}
        radioGroupProps={{
          ...getInputProps(fields.statementAgree, { type: "text" })
        }}
      />
      <TextareaField
        errors={fields.toolEval.errors}
        labelProps={{
          children: "What tools are you currently using and/or evaluating?",
          htmlFor: fields.toolEval.id
        }}
        textareaProps={getTextareaProps(fields.toolEval)}
      />
      <CharityPicker
        charities={event.charities}
        errors={fields.charityId.errors}
        label={t("select-charity")}
        name={fields.charityId.name}
      />
      <ErrorList errors={form.errors} id={form.errorId} />
      <SubmitButton
        className="mt-4 px-6 py-2 md:min-w-[150px] md:self-start"
        state={donationFormFetcher.state}
        type="submit"
      >
        {t("submit")}
      </SubmitButton>
      {event.collectLeads ? (
        <div className=" text-xs text-gray-700">{event.legalBlurb}</div>
      ) : null}
    </donationFormFetcher.Form>
  );
}
