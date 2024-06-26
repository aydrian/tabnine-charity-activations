import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { type ChangeEvent, useRef, useState } from "react";
import { z } from "zod";

import appConfig from "~/app.config.ts";
import {
  type CharityItemWithColor,
  CharitySelector
} from "~/components/charity-selector.tsx";
import {
  CheckboxField,
  ErrorList,
  Field,
  SelectField,
  SubmitButton,
  TemplateEditorField,
  TextareaField
} from "~/components/forms.tsx";
import { requireUserId } from "~/utils/auth.server.ts";
import { prisma } from "~/utils/db.server.ts";
import slugify from "~/utils/slugify.ts";

const EventWithLeads = z.object({
  charities: z
    .array(z.object({ charityId: z.string(), color: z.string() }))
    .max(4, "A max of 4 charities is allowed")
    .min(1, "At least 1 charity is required"),
  collectLeads: z.literal("on"),
  donationAmount: z.number().default(3.0),
  donationCurrency: z.string().default("usd"),
  endDate: z.date({ required_error: "End Date is required" }),
  id: z.string().optional(),
  legalBlurb: z.string().optional(),
  location: z.string({ required_error: "Location is required" }),
  name: z.string({ required_error: "Name is required" }),
  responseTemplate: z.string({
    required_error: "Response Template is required"
  }),
  slug: z.string({ required_error: "Slug is required" }),
  startDate: z.date({ required_error: "Start Date is required" }),
  tweetTemplate: z.string({ required_error: "Tweet Template is required" }),
  twitter: z.string().optional()
});

const EventWithoutLeads = z.object({
  charities: z
    .array(z.object({ charityId: z.string(), color: z.string() }))
    .max(4, "A max of 4 charities is allowed")
    .min(1, "At least 1 charity is required"),
  collectLeads: z.undefined(),
  donationAmount: z.number().default(3.0),
  donationCurrency: z.string().default("usd"),
  endDate: z.date({ required_error: "End Date is required" }),
  id: z.string().optional(),
  location: z.string({ required_error: "Location is required" }),
  name: z.string({ required_error: "Name is required" }),
  responseTemplate: z.string({
    required_error: "Response Template is required"
  }),
  slug: z.string({ required_error: "Slug is required" }),
  startDate: z.date({ required_error: "Start Date is required" }),
  tweetTemplate: z.string({ required_error: "Tweet Template is required" }),
  twitter: z.string().optional()
});

export const EventEditorSchema = z
  .discriminatedUnion("collectLeads", [EventWithLeads, EventWithoutLeads])
  .transform(({ collectLeads, ...rest }) => ({
    collectLeads: collectLeads === "on",
    ...rest
  }));

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: EventEditorSchema
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      {
        status: submission.status === "error" ? 400 : 200
      }
    );
  }

  const { charities, id, ...data } = submission.value;

  if (id) {
    const eventUpdate = prisma.event.update({
      data,
      where: { id }
    });

    const charitiesDelete = prisma.charitiesForEvents.deleteMany({
      where: {
        AND: {
          charityId: { notIn: charities.map((c) => c.charityId) },
          eventId: id
        }
      }
    });

    const charityUpserts = charities.map((charity) => {
      return prisma.charitiesForEvents.upsert({
        create: {
          charityId: charity.charityId,
          color: charity.color,
          eventId: id
        },
        update: {
          color: charity.color
        },
        where: {
          eventId_charityId: { charityId: charity.charityId, eventId: id }
        }
      });
    });

    await prisma.$transaction([
      eventUpdate,
      charitiesDelete,
      ...charityUpserts
    ]);
  } else {
    await prisma.event.create({
      data: {
        ...data,
        Charities: { create: charities },
        createdBy: userId
      }
    });
  }
  return redirect("/admin/dashboard");
};

export function EventEditor({
  allCharities,
  event
}: {
  allCharities: CharityItemWithColor[];
  event?: {
    charities: CharityItemWithColor[];
    collectLeads: boolean;
    donationAmount: string;
    donationCurrency: string;
    endDate: string;
    id: string;
    legalBlurb: null | string;
    location: string;
    name: string;
    responseTemplate: string;
    slug: string;
    startDate: string;
    tweetTemplate: string;
    twitter: null | string;
  };
}) {
  const slugRef = useRef<HTMLInputElement>(null);
  const [collectLeads, setCollectLeads] = useState(!!event?.collectLeads);
  const eventEditorFetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    constraint: getZodConstraint(
      collectLeads ? EventWithLeads : EventWithoutLeads
    ) as any,
    defaultValue: {
      donationCurrency: event?.donationCurrency ?? "usd"
    },
    id: "event-editor",
    lastResult: eventEditorFetcher.data?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: EventEditorSchema });
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
    <eventEditorFetcher.Form
      action="/resources/event-editor"
      method="post"
      {...getFormProps(form)}
      className="not-prose mb-8 flex flex-col sm:mb-4"
    >
      <input name="id" type="hidden" value={event?.id} />
      <Field
        errors={fields.name.errors}
        inputProps={{
          ...getInputProps(fields.name, { type: "text" }),
          defaultValue: event?.name,
          onBlur: handleOnChange
        }}
        labelProps={{ children: "Name", htmlFor: fields.name.id }}
      />
      <Field
        errors={fields.slug.errors}
        inputProps={{
          ...getInputProps(fields.slug, { type: "text" }),
          defaultValue: event?.slug
        }}
        labelProps={{ children: "Slug", htmlFor: fields.slug.id }}
        ref={slugRef}
      />
      <div className="flex w-full flex-row justify-between gap-2">
        <Field
          className="grow"
          errors={fields.startDate.errors}
          inputProps={{
            ...getInputProps(fields.startDate, { type: "date" }),
            defaultValue: event?.startDate?.split("T")[0]
          }}
          labelProps={{ children: "Start Date", htmlFor: fields.startDate.id }}
        />
        <Field
          className="grow"
          errors={fields.endDate.errors}
          inputProps={{
            ...getInputProps(fields.endDate, { type: "date" }),
            defaultValue: event?.endDate?.split("T")[0]
          }}
          labelProps={{ children: "End Date", htmlFor: fields.endDate.id }}
        />
      </div>
      <Field
        errors={fields.location.errors}
        inputProps={{
          ...getInputProps(fields.location, { type: "text" }),
          defaultValue: event?.location
        }}
        labelProps={{ children: "Location", htmlFor: fields.location.id }}
      />
      <div className="flex w-full flex-row justify-between gap-2">
        <Field
          className="grow"
          errors={fields.donationAmount.errors}
          inputProps={{
            ...getInputProps(fields.donationAmount, { type: "number" }),
            defaultValue: event?.donationAmount || "3"
          }}
          labelProps={{
            children: "Donation Amount",
            htmlFor: fields.donationAmount.id
          }}
        />
        <SelectField
          errors={fields.donationCurrency.errors}
          labelProps={{
            children: "Donation Currency",
            htmlFor: fields.donationCurrency.id
          }}
          meta={fields.donationCurrency}
          options={[
            { name: "usd", value: "usd" },
            { name: "eur", value: "eur" }
          ]}
        />
        <Field
          className="grow"
          errors={fields.twitter.errors}
          inputProps={{
            ...getInputProps(fields.twitter, { type: "text" }),
            defaultValue: event?.twitter ?? undefined
          }}
          labelProps={{
            children: "Twitter",
            htmlFor: fields.twitter.id
          }}
        />
      </div>
      <TemplateEditorField
        errors={fields.responseTemplate.errors}
        labelProps={{
          children: "Response Template",
          htmlFor: fields.responseTemplate.id
        }}
        templateEditorProps={{
          variables: [
            {
              className: "bg-green-500",
              displayName: "Event Name",
              value: "{{event.name}}"
            },
            {
              className: "bg-yellow-500",
              displayName: "Charity Name",
              value: "{{charity.name}}"
            },
            {
              className: "bg-yellow-500",
              displayName: "Charity URL",
              value: "{{charity.url}}"
            },
            {
              className: "bg-blue-500",
              displayName: "Donation Amount",
              value: "{{donationAmount}}"
            }
          ],
          ...getTextareaProps(fields.responseTemplate),
          defaultValue:
            event?.responseTemplate ||
            "Thank you for helping us donate {{donationAmount}} to {{charity}} at {{event}}."
        }}
      />
      <TemplateEditorField
        errors={fields.tweetTemplate.errors}
        labelProps={{
          children: "Tweet Template",
          htmlFor: fields.tweetTemplate.id
        }}
        templateEditorProps={{
          variables: [
            {
              className: "bg-green-500",
              displayName: "Event",
              value: "{{event}}"
            },
            {
              className: "bg-yellow-500",
              displayName: "Charity",
              value: "{{charity}}"
            },
            {
              className: "bg-blue-500",
              displayName: "Donation Amount",
              value: "{{donationAmount}}"
            }
          ],
          ...getTextareaProps(fields.tweetTemplate),
          defaultValue:
            event?.tweetTemplate ||
            `I just helped @${appConfig.company.twitter} donate {{donationAmount}} to {{charity}} at {{event}}.`
        }}
      />
      <CheckboxField
        buttonProps={{
          ...getInputProps(fields.collectLeads, { type: "checkbox" }),
          defaultChecked: collectLeads,
          onCheckedChange: () => setCollectLeads(!collectLeads),
          required: false
        }}
        errors={fields.collectLeads.errors}
        labelProps={{
          children: "Collect lead data?",
          htmlFor: fields.collectLeads.id
        }}
      />
      {collectLeads ? (
        <TextareaField
          errors={fields.legalBlurb.errors}
          labelProps={{
            children: "Legal Blurb",
            htmlFor: fields.legalBlurb.id
          }}
          textareaProps={{
            ...getTextareaProps(fields.legalBlurb),
            defaultValue: event?.legalBlurb ?? undefined
          }}
        />
      ) : null}
      <div className="flex flex-col gap-2">
        <h3 className="mb-0 text-xl font-semibold text-brand-deep-purple">
          Which charities will this event support?
        </h3>
        <CharitySelector
          allCharities={allCharities}
          maxItems={appConfig.charity.maxPerEvent}
          selectedCharities={event?.charities}
        />
        <div className="px-4 pb-3 pt-1">
          {fields.charities.errors?.length ? (
            <ErrorList
              errors={fields.charities.errors}
              id={`${fields.charities.id}-error`}
            />
          ) : null}
        </div>
      </div>
      <ErrorList errors={form.errors} id={form.errorId} />
      <SubmitButton
        className="mt-4 px-6 py-2 md:min-w-[150px] md:self-start"
        size="lg"
        state={eventEditorFetcher.state}
        type="submit"
      >
        Submit
      </SubmitButton>
    </eventEditorFetcher.Form>
  );
}
