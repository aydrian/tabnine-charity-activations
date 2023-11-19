import { Authenticator } from "remix-auth";
import { GoogleStrategy } from "remix-auth-google";

import { prisma } from "~/utils/db.server.ts";
import { sessionStorage } from "~/utils/session.server.ts";

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export const authenticator = new Authenticator<string>(sessionStorage);

const googleStrategy = new GoogleStrategy<string>(
  {
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
  },
  async ({ accessToken, extraParams, profile, refreshToken }) => {
    const email = profile.emails[0].value;
    const imageUrl = profile.photos[0].value;
    const user = await prisma.user.upsert({
      create: {
        email,
        firstName: profile.name.givenName,
        fullName: profile.displayName,
        imageUrl,
        lastName: profile.name.familyName
      },
      select: {
        id: true
      },
      update: {
        email,
        firstName: profile.name.givenName,
        fullName: profile.displayName,
        imageUrl,
        lastName: profile.name.familyName
      },
      where: { email }
    });
    return user.id;
  }
);

// Tell the Authenticator to use the OKTA strategy
authenticator.use(googleStrategy);

export const requireUserId = async (
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) => {
  const searchParams = new URLSearchParams([
    ["redirectTo", redirectTo],
    ["loginMessage", "Please login to continue"]
  ]);
  const userId = await authenticator.isAuthenticated(request, {
    failureRedirect: `/admin?${searchParams}`
  });
  return userId;
};
