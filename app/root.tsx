import {
  type LinksFunction,
  type LoaderFunctionArgs,
  type MetaFunction,
  json
} from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData
} from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useChangeLanguage } from "remix-i18next/react";

import iconHref from "~/components/icons/sprite.svg";
import i18next from "~/utils/i18next.server.ts";

import styles from "./tailwind.css";

export const links: LinksFunction = () => [
  // Preload CSS as a resource to avoid render blocking
  { as: "image", href: iconHref, rel: "preload", type: "image/svg+xml" },
  { as: "style", href: "/fonts/roboto/font.css", rel: "preload" },
  { as: "style", href: styles, rel: "preload" },
  { href: "/fonts/inter/font.css", rel: "stylesheet" },
  { href: "/fonts/roboto/font.css", rel: "stylesheet" },
  { href: "/fonts/roboto-mono/font.css", rel: "stylesheet" },
  { href: styles, rel: "stylesheet" },
  { href: "/apple-touch-icon.png", rel: "apple-touch-icon", sizes: "180x180" },
  {
    href: "/favicon-32x32.png",
    rel: "icon",
    sizes: "32x32",
    type: "image/png"
  },
  {
    href: "/favicon-16x16.png",
    rel: "icon",
    sizes: "16x16",
    type: "image/png"
  },
  { href: "/site.webmanifest", rel: "manifest" }
];

export async function loader({ request }: LoaderFunctionArgs) {
  let locale = await i18next.getLocale(request);
  return json({ locale });
}
export let handle = {
  // In the handle export, we can add a i18n key with namespaces our route
  // will need to load. This key can be a single string or an array of strings.
  // TIP: In most cases, you should set this to your defaultNS from your i18n config
  // or if you did not set one, set it to the i18next default namespace "translation"
  i18n: "common"
};

export const meta: MetaFunction = () => {
  return [{ title: "Charity Activations" }];
};

export default function App() {
  // Get the locale from the loader
  let { locale } = useLoaderData<typeof loader>();

  let { i18n } = useTranslation();

  // This hook will change the i18n instance language to the current locale
  // detected by the loader, this way, when we do something to change the
  // language, this locale will change and i18next will load the correct
  // translation files
  useChangeLanguage(locale);
  return (
    <html dir={i18n.dir()} lang={locale}>
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width,initial-scale=1" name="viewport" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
