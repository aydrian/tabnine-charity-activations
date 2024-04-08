import type { LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import {
  Link,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError
} from "@remix-run/react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Title,
  Tooltip
} from "chart.js";
import QRCode from "qrcode";
import React from "react";
import { Bar } from "react-chartjs-2";
import { useEventSource } from "remix-utils/sse/react";

import CompanyLogo from "~/components/company-logo.tsx";
import { Icon } from "~/components/icon.tsx";
import { Button } from "~/components/ui/button.tsx";
import { getDashboardCharities } from "~/models/charity.server.ts";
import { prisma } from "~/utils/db.server.ts";
import { hexToRgbA } from "~/utils/misc.ts";

import type { NewDonationEvent } from "./resources+/crl-cdc-webhook.tsx";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { slug } = params;
  const event = await prisma.event.findUnique({
    select: {
      donationAmount: true,
      donationCurrency: true,
      endDate: true,
      id: true,
      name: true,
      startDate: true
    },
    where: { slug }
  });
  if (!event) {
    throw new Response("Not Found", {
      status: 404
    });
  }

  const charities = await getDashboardCharities(event.id);
  const donateLink = `${
    process.env.NODE_ENV === "development"
      ? "https://localhost:3000"
      : `https://${process.env.FLY_APP_NAME}.fly.dev`
  }/donate/${event.id}`;
  const qrcode = await QRCode.toDataURL(donateLink);
  return json({ charities, donateLink, event, qrcode });
};

export default function EventDashboard() {
  const {
    charities: initCharities,
    donateLink,
    event,
    qrcode
  } = useLoaderData<typeof loader>();
  const newDonationEventString = useEventSource("/resources/crl-cdc-webhook", {
    event: `new-donation-${event.id}`
  });
  const newDonationEvent: NewDonationEvent | null = newDonationEventString
    ? JSON.parse(newDonationEventString)
    : null;
  const charities = newDonationEvent?.charities ?? initCharities;
  const Currency = Intl.NumberFormat(undefined, {
    currency: event.donationCurrency,
    minimumFractionDigits: 0,
    style: "currency"
  });

  return (
    <div className="flex h-screen w-full flex-col gap-6 bg-tabnine-deep-navy bg-[url('/assets/bg-bars.svg')] bg-contain bg-left-bottom bg-no-repeat p-12">
      <header className="flex items-center justify-between">
        <div className="flex gap-2">
          <CompanyLogo className="inline-block w-[272px]" />
          <h1 className="font-inter text-5xl font-extrabold !leading-tight text-tabnine-bright-red">
            at {event.name}
          </h1>
        </div>
        <Button
          asChild
          className="bg-tabnine-bright-red font-roboto-mono text-2xl hover:bg-tabnine-red-400"
        >
          <Link target="_blank" to="./sign-up">
            sign up for Tabnine Pro
          </Link>
        </Button>
      </header>
      <main className="flex grow gap-4">
        <div className="border-brand-gray-b grow rounded border bg-white p-2">
          <Bar
            data={{
              datasets: [
                {
                  backgroundColor: charities.map((charity) =>
                    hexToRgbA(charity.color, 1)
                  ),
                  borderColor: charities.map((charity) => charity.color),
                  borderWidth: 1,
                  data: charities.map((charity) => charity.count),
                  label: "total donations"
                }
              ],
              labels: charities.map((charity) => charity.name)
            }}
            options={{
              responsive: true,
              scales: { y: { ticks: { stepSize: 1 } } }
            }}
          />
        </div>
        <div className="flex min-w-max flex-col justify-evenly gap-4 text-center">
          <div className="flex flex-col items-center justify-center gap-2 p-2">
            <div className="flex items-center justify-center p-2">
              <Icon
                className="h-12 w-12 text-tabnine-bright-blue"
                name="curley-brace"
              />
              <Icon
                className="aspect-square h-12 text-tabnine-bright-red"
                name="gift"
              />
              <Icon
                className="h-12 w-12 rotate-180 text-tabnine-bright-blue"
                name="curley-brace"
              />
            </div>
            <div className="font-inter text-7xl font-extrabold text-white">
              {charities.reduce((acc, cur) => acc + cur.count, 0)}
            </div>
            <div className="text-semibold font-roboto-mono  text-xl text-tabnine-dev-purple">
              Total donation
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-2 p-2">
            <div className="flex shrink justify-center p-2">
              <Icon
                className="inline-block h-12 w-12 text-tabnine-bright-blue"
                name="curley-brace"
              />
              <Icon
                className="aspect-square h-12 text-tabnine-bright-red"
                name="piggy-bank"
              />
              <Icon
                className="h-12 w-12 rotate-180 text-tabnine-bright-blue"
                name="curley-brace"
              />
            </div>
            <div className="font-inter text-7xl font-extrabold text-white">
              {Currency.format(
                charities.reduce(
                  (acc, cur) => acc + cur.count * Number(event.donationAmount),
                  0
                )
              )}
            </div>
            <div className="text-semibold font-roboto-mono text-xl text-tabnine-dev-purple">
              Total donated
            </div>
          </div>
        </div>
      </main>
      <footer className="flex gap-4 rounded border bg-white p-4">
        <div className="flex items-center justify-center">
          <h2 className="font-inter text-4xl font-bold text-tabnine-deep-navy">
            Scan the QR Code and we'll{" "}
            <span className="text-tabnine-bright-blue">
              donate {Currency.format(Number(event.donationAmount))} to your
              choice
            </span>{" "}
            of the following charities:
          </h2>
        </div>
        <div className="flex w-52 items-center justify-center">
          <a href={donateLink} rel="noreferrer" target="_blank">
            <img
              alt="Scan me"
              className="h-46 w-46 my-0 aspect-square rounded-2xl border-2 border-dashed border-tabnine-bright-red"
              src={qrcode}
            />
          </a>
        </div>
        <div className="flex flex-wrap items-center justify-around gap-4">
          {charities.map((charity) => (
            <React.Fragment key={charity.charity_id}>
              {charity.logoSVG ? (
                <img
                  alt={charity.name}
                  className="h-14 text-tabnine-deep-navy"
                  src={`data:image/svg+xml;utf8,${encodeURIComponent(
                    charity.logoSVG
                  )}`}
                />
              ) : null}
            </React.Fragment>
          ))}
        </div>
      </footer>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="bg-white">
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  }

  throw error;
}
