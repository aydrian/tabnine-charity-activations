import type { LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError
} from "@remix-run/react";
import matter from "matter-js";
import QRCode from "qrcode";
import React, { useEffect, useRef } from "react";
import { useEventSource } from "remix-utils/sse/react";

import appConfig from "~/app.config.ts";
import { Icon } from "~/components/icon.tsx";
import { getDashboardCharities } from "~/models/charity.server.ts";
import { prisma } from "~/utils/db.server.ts";
import { cn } from "~/utils/misc.ts";

import type { NewDonationEvent } from "./resources+/crl-cdc-webhook.tsx";
// import { hexToRgbA } from "~/utils/misc.ts";
const { Bodies, Engine, Render, Runner, World } = matter;

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

export default function EventDropboard() {
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
    <main className="min-h-screen max-w-full bg-brand-deep-purple bg-[url('/assets/bg.svg')] bg-cover p-4">
      <section className="prose mx-auto grid max-w-7xl">
        <h1 className="font-inter mb-0 bg-gradient-to-r from-brand-iridescent-blue to-brand-electric-purple bg-clip-text text-center text-5xl font-bold !leading-tight text-transparent sm:text-7xl">
          {appConfig.company.name} at {event.name}
        </h1>
        <div className="flex flex-col justify-stretch gap-4">
          <div className="flex grow gap-4">
            <div className="border-brand-gray-b grow rounded border bg-white p-2">
              <PlinkoBoard eventId={event.id} />
            </div>
            <div className="flex shrink flex-col justify-stretch gap-4 text-center">
              <div className="border-brand-gray-b flex grow flex-col items-center justify-center rounded border bg-white p-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-electric-purple p-2">
                  <Icon
                    className="aspect-square h-full text-gray-100"
                    name="gift-outline"
                  />
                </div>
                <div className="text-3xl font-extrabold">
                  {charities.reduce((acc, cur) => acc + cur.count, 0)}
                </div>
                <div className="text-semibold text-sm uppercase text-gray-700">
                  Total Donations
                </div>
              </div>
              <div className="border-brand-gray-b flex grow flex-col items-center justify-center gap-1 rounded border bg-white p-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-iridescent-blue p-2">
                  <Icon
                    className="aspect-square h-full text-gray-600"
                    name="banknotes-outline"
                  />
                </div>
                <div className="text-3xl font-extrabold">
                  {Currency.format(
                    charities.reduce(
                      (acc, cur) =>
                        acc + cur.count * Number(event.donationAmount),
                      0
                    )
                  )}
                </div>
                <div className="text-semibold text-sm uppercase text-gray-700">
                  Total Donated
                </div>
              </div>
              <div className="border-brand-gray-b flex grow flex-col items-center justify-center gap-1 rounded border bg-white p-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1da1f2] p-2">
                  <Icon
                    className="aspect-square h-full text-white"
                    name="twitter"
                  />
                </div>
                <div className="font-extrabold">
                  @{appConfig.company.twitter}
                </div>
              </div>
            </div>
          </div>
          <div className="border-brand-gray-b flex shrink gap-4 rounded border bg-white p-2">
            <a
              className="flex grow justify-center"
              href={donateLink}
              rel="noreferrer"
              target="_blank"
            >
              <img
                alt="Scan me"
                className="my-0 aspect-square h-full"
                src={qrcode}
              />
            </a>
            <div className="flex shrink flex-col justify-center gap-4">
              <h2 className="my-0 text-brand-deep-purple">
                Scan the QR Code and we'll donate{" "}
                {Currency.format(Number(event.donationAmount))} to your choice
                of the following charities:
              </h2>
              <div className="flex items-center justify-around">
                {charities.map((charity) => (
                  <React.Fragment key={charity.charity_id}>
                    {charity.logoSVG ? (
                      <img
                        alt={charity.name}
                        className="h-12 text-brand-deep-purple"
                        src={`data:image/svg+xml;utf8,${encodeURIComponent(
                          charity.logoSVG
                        )}`}
                      />
                    ) : null}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

const engine = Engine.create();
const runner = Runner.create();

function createDisc({ color }: { color: string }) {
  const body = Bodies.circle(
    Math.round(Math.random() * window.innerWidth),
    -30,
    20,
    {
      angle: Math.PI * (Math.random() * 2 - 1),
      friction: 0.001,
      frictionAir: 0.01,
      render: {
        fillStyle: color,
        lineWidth: 2,
        strokeStyle: "black"
      },
      restitution: 0.75
    }
  );
  World.add(engine.world, [body]);
}

function PlinkoBoard({
  className,
  eventId
}: {
  className?: string;
  eventId: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const newDonationEventString = useEventSource("/resources/crl-cdc-webhook", {
    event: `new-donation-${eventId}`
  });
  const newDonationEvent: NewDonationEvent | null = newDonationEventString
    ? JSON.parse(newDonationEventString)
    : null;

  console.log({ newDonationEvent });

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const height = canvas.clientHeight;
    const width = canvas.clientWidth;
    console.log({ height, width });

    const render = Render.create({
      canvas,
      engine: engine,
      options: {
        background: "transparent",
        height,
        width,
        wireframes: false
      }
    });

    const boundaries = {
      isStatic: true,
      render: {
        fillStyle: "red",
        strokeStyle: "red"
      }
    };
    const ground = Bodies.rectangle(width / 2, height, width, 10, boundaries);
    const leftWall = Bodies.rectangle(0, height / 2, 10, height, boundaries);
    const rightWall = Bodies.rectangle(
      width,
      height / 2,
      10,
      height,
      boundaries
    );

    const pegs = [];
    const pegOpts = {
      isStatic: true,
      render: {
        fillStyle: "brown",
        lineWidth: 1,
        strokeStyle: "black"
      }
    };

    for (let i = 0; i < 4; i++) {
      const x = (width / 5) * (i + 1);
      const y = height / 2;
      pegs.push(Bodies.circle(x, y, 10, pegOpts));
    }
    const bodies = [ground, leftWall, rightWall, ...pegs];

    World.add(engine.world, bodies);

    Render.run(render);
    Runner.run(runner, engine);
  }, [canvasRef]);

  if (newDonationEvent) {
    const charity = newDonationEvent.charities.find(
      ({ charity_id }) => newDonationEvent.charityId === charity_id
    );
    createDisc({ color: charity?.color ?? "white" });
  }

  return <canvas className={cn("w-full", className)} ref={canvasRef}></canvas>;
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
