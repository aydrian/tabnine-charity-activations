import { flatRoutes } from "remix-flat-routes";

/** @type {import('@remix-run/dev').AppConfig} */
export default {
  dev: {
    command: "node server.js",
    manual: true,
    scheme: "https",
    tlsCert: "certs/cert.pem",
    tlsKey: "certs/key.pem"
  },
  ignoredRouteFiles: ["**/.*"],
  postcss: true,
  routes: async (defineRoutes) => {
    return flatRoutes("routes", defineRoutes);
  },
  serverDependenciesToBundle: ["remix-i18next", "i18next-prisma-backend"],
  serverModuleFormat: "esm",
  tailwind: true
};
