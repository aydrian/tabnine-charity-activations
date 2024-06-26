import type { LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import appConfig from "~/app.config.ts";
import CompanyLogo from "~/components/company-logo.tsx";
import { Icon } from "~/components/icon.tsx";
import { GoogleLoginForm } from "~/routes/auth+/google+/_index.tsx";
import { authenticator } from "~/utils/auth.server.ts";
import { redirectToCookie } from "~/utils/cookies.server.ts";
import { commitSession, getSession } from "~/utils/session.server.ts";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/admin/dashboard"
  });
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirectTo");
  const loginMessage = url.searchParams.get("loginMessage");

  let headers = new Headers();
  if (redirectTo) {
    headers.append("Set-Cookie", await redirectToCookie.serialize(redirectTo));
  }
  const session = await getSession(request.headers.get("cookie"));
  const error = session.get(authenticator.sessionErrorKey);
  let errorMessage: null | string = null;
  if (typeof error?.message === "string") {
    errorMessage = error.message;
  }
  // TODO: Is this necessary?
  headers.append("Set-Cookie", await commitSession(session));

  return json({ formError: errorMessage, loginMessage }, { headers });
};

export default function AdminIndex() {
  const data = useLoaderData<typeof loader>();
  return (
    <>
      <header className="w-full bg-white p-4 shadow-lg">
        <nav className="mx-auto flex max-w-7xl items-center justify-between">
          <a href={appConfig.company.website} rel="noreferrer" target="_blank">
            <CompanyLogo />
          </a>
          <a
            href="https://github.com/aydrian/tabnine-charity-activations/"
            rel="noreferrer"
            target="_blank"
          >
            <Icon className="h-7 w-7 text-brand-deep-purple" name="github" />
          </a>
        </nav>
      </header>
      <main className="min-h-screen max-w-full bg-brand-deep-purple bg-[url('/assets/bg.svg')] bg-cover p-4 md:py-16">
        <section className="mx-auto grid max-w-4xl gap-6 md:gap-12">
          <div className="mx-auto max-w-3xl">
            <h1 className="font-inter mb-2 bg-gradient-to-r from-brand-iridescent-blue to-brand-electric-purple bg-clip-text text-center text-4xl font-bold !leading-tight text-transparent sm:text-7xl md:text-5xl">
              Charity Activations
            </h1>
            <h2 className="my-0 text-center text-lg leading-tight text-white md:text-2xl">
              Manage charity activations for {appConfig.company.name} sponsored
              events.
            </h2>
          </div>
          <div className="border-brand-gray-b rounded border bg-white p-6 sm:px-16">
            <h3 className="m-0 font-bold text-brand-deep-purple">Login</h3>
            {data.loginMessage ? (
              <div className="text-sm text-red-500">{data.loginMessage}</div>
            ) : null}
            <GoogleLoginForm className="text-center md:text-left" />
          </div>
        </section>
      </main>
      <footer className="bg-black">
        <ul className="mx-auto flex max-w-7xl items-center justify-between p-4 text-sm font-bold text-white">
          <li>
            <a
              href={`https://twitter.com/${appConfig.company.twitter}/`}
              rel="noreferrer"
              target="_blank"
            >
              @{appConfig.company.twitter}
            </a>
          </li>
          <li>
            <a
              href={appConfig.company.privacyPolicyUrl}
              rel="noreferrer"
              target="_blank"
            >
              Privacy Policy
            </a>
          </li>
        </ul>
      </footer>
    </>
  );
}
