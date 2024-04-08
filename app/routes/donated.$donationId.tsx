import type { LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError
} from "@remix-run/react";
import handlebars from "handlebars";
import { useTranslation } from "react-i18next";

import CompanyLogo from "~/components/company-logo.tsx";
import Footer from "~/components/footer.tsx";
import TweetButton from "~/components/tweet-button.tsx";
import { prisma } from "~/utils/db.server.ts";
import { processMarkdownToHtml } from "~/utils/markdown.server.ts";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { donationId } = params;
  const donation = await prisma.donation.findUnique({
    select: {
      Charity: { select: { name: true, twitter: true, website: true } },
      Event: {
        select: {
          donationAmount: true,
          donationCurrency: true,
          name: true,
          responseTemplate: true,
          tweetTemplate: true,
          twitter: true
        }
      },
      id: true
    },
    where: { id: donationId }
  });
  if (!donation) {
    throw new Response("Not Found", {
      status: 404
    });
  }

  const Currency = Intl.NumberFormat(undefined, {
    currency: donation.Event.donationCurrency,
    minimumFractionDigits: 0,
    style: "currency"
  });

  const responseTemplate = handlebars.compile(donation.Event.responseTemplate);
  const responseMd = responseTemplate({
    charity: { name: donation.Charity.name, url: donation.Charity.website },
    donationAmount: Currency.format(donation.Event.donationAmount.toNumber()),
    event: { name: donation.Event.name }
  });
  const responseHtml = processMarkdownToHtml(responseMd.trim());

  const tweetTemplate = handlebars.compile(donation.Event.tweetTemplate);
  const tweetText = tweetTemplate({
    charity: donation.Charity.twitter
      ? `@${donation.Charity.twitter}`
      : donation.Charity.name,
    donationAmount: Currency.format(donation.Event.donationAmount.toNumber()),
    event: donation.Event.twitter
      ? `@${donation.Event.twitter}`
      : donation.Event.name
  });

  return json({ donation, responseHtml, tweetText });
};

export default function DonateConfirm() {
  const { t } = useTranslation();
  const { donation, responseHtml, tweetText } = useLoaderData<typeof loader>();
  return (
    <>
      <main className="min-h-screen max-w-full bg-tabnine-deep-navy bg-[url('/assets/bg-bars.svg')]  bg-contain bg-left-bottom  bg-no-repeat px-4 pb-8 pt-8">
        <section className="mx-auto max-w-4xl">
          <div className="flex flex-col flex-wrap items-center justify-center gap-2 p-2 md:flex-row">
            <CompanyLogo className="inline-block w-[272px]" />
            <h1 className="font-inter text-5xl font-extrabold !leading-tight text-tabnine-bright-red">
              at {donation.Event.name}
            </h1>
          </div>
          <div className="border-brand-gray-b rounded border bg-white p-4 sm:px-16">
            <div
              dangerouslySetInnerHTML={{
                __html: responseHtml.content
              }}
            />
            <TweetButton text={t("share-to-twitter")} tweetText={tweetText} />
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
