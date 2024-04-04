import type { LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError
} from "@remix-run/react";
import { useTranslation } from "react-i18next";

import CompanyLogo from "~/components/company-logo.tsx";
import Footer from "~/components/footer.tsx";
import { DonationForm } from "~/routes/resources+/donate.tsx";
import { prisma } from "~/utils/db.server.ts";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { eventId } = params;
  const event = await prisma.event.findUnique({
    select: {
      Charities: {
        select: {
          Charity: { select: { id: true, name: true } },
          color: true
        }
      },
      collectLeads: true,
      donationAmount: true,
      donationCurrency: true,
      id: true,
      legalBlurb: true,
      name: true
    },
    where: { id: eventId }
  });
  if (!event) {
    throw new Response("Not Found", {
      status: 404
    });
  }
  const { Charities, ...rest } = event;
  const charities = Charities.map((item) => ({
    color: item.color,
    ...item.Charity
  }));
  return json({ event: { ...rest, charities } });
};

export default function EventDonate() {
  const { t } = useTranslation();
  const { event } = useLoaderData<typeof loader>();
  const amount = Intl.NumberFormat(undefined, {
    currency: event.donationCurrency,
    minimumFractionDigits: 0,
    style: "currency"
  }).format(Number(event.donationAmount));
  return (
    <>
      <main className="min-h-screen max-w-full bg-tabnine-deep-navy bg-[url('/assets/bg-bars.svg')] bg-contain bg-left-bottom bg-no-repeat px-4 pb-8 pt-8">
        <section className="mx-auto max-w-4xl">
          <div className="flex flex-col flex-wrap items-center justify-center gap-2 md:flex-row">
            <CompanyLogo className="inline-block w-[272px]" />
            <h1 className="font-inter text-5xl font-extrabold !leading-tight text-tabnine-bright-red">
              at {event.name}
            </h1>
          </div>
          <p className="p-4 text-center text-white">
            {t("donate-instructions", { amount })}
          </p>
          <div className="border-brand-gray-b rounded border bg-white p-4 sm:px-16">
            <DonationForm event={event} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  }
  throw error;
}
