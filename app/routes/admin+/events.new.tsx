import type { LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { EventEditor } from "~/routes/resources+/event-editor.tsx";
import { requireUserId } from "~/utils/auth.server.ts";
import { prisma } from "~/utils/db.server.ts";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUserId(request);
  const charities = await prisma.charity.findMany({
    select: { id: true, name: true }
  });
  return json({ charities });
};

export default function AddEvent() {
  const { charities } = useLoaderData<typeof loader>();

  return (
    <section className="prose mx-auto grid max-w-4xl gap-12">
      <div className="border-brand-gray-b rounded border bg-white p-8 sm:px-16">
        <h2 className="m-0 font-bold text-brand-deep-purple">Create Event</h2>
        <EventEditor allCharities={charities} />
      </div>
    </section>
  );
}
