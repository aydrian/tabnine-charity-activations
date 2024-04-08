import type { LoaderFunctionArgs } from "@remix-run/node";

import { useLoaderData } from "@remix-run/react";
import QRCode from "qrcode";

import CompanyLogo from "~/components/company-logo.tsx";
import { Button } from "~/components/ui/button.tsx";
import { prisma } from "~/utils/db.server.ts";

export async function loader({ params, request }: LoaderFunctionArgs) {
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

  const signUpUrl = "https://eu1.hubs.ly/H08rRcH0";
  const qrcode = await QRCode.toDataURL(signUpUrl);

  return { event, qrcode, signUpUrl };
}
export default function DashboardSlugSignUp() {
  const { event, qrcode, signUpUrl } = useLoaderData<typeof loader>();
  return (
    <div className="flex h-screen w-full flex-col gap-6 bg-tabnine-deep-navy bg-[url('/assets/bg-bars.svg')] bg-contain bg-left-bottom bg-no-repeat p-12">
      <header className="flex gap-2">
        <CompanyLogo className="inline-block w-[272px]" />
        <h1 className="font-inter text-5xl font-extrabold !leading-tight text-tabnine-bright-red">
          at {event.name}
        </h1>
      </header>
      <main className="flex w-full flex-col justify-around gap-6 md:flex-row">
        <div className="flex w-2/3 flex-col items-center justify-center rounded-2xl border-2 bg-white p-2">
          <h2 className="font-inter text-3xl font-bold !leading-tight text-tabnine-deep-navy">
            Sign up for Tabnine Pro
          </h2>
          <p className="p-4 text-center text-tabnine-deep-navy">
            To sign up using this machine, click the button below. If you're not
            comfortable entering your credit card information here, you may scan
            the QR code and continue on your personal device.
          </p>
          <Button
            asChild
            className="bg-tabnine-bright-red font-roboto-mono text-2xl hover:bg-tabnine-red-400"
          >
            <a href={signUpUrl}>continue to sign up</a>
          </Button>
        </div>
        <div className="w-1/3 items-center p-8">
          <img
            alt="Scan me"
            className="my-0 aspect-square w-full rounded-2xl border-2 border-dashed border-tabnine-bright-red"
            src={qrcode}
          />
        </div>
      </main>
    </div>
  );
}
