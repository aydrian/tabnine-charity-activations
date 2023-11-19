import { type TypeOf, z } from "zod";

declare global {
  namespace NodeJS {
    interface ProcessEnv extends TypeOf<typeof zodEnv> {}
  }
}

const zodEnv = z.object({
  DATABASE_URL: z.string(),
  FLY_APP_NAME: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  SESSION_SECRET: z.string()
});

try {
  zodEnv.parse(process.env);
} catch (err) {
  if (err instanceof z.ZodError) {
    const { fieldErrors } = err.flatten();
    const errorMessage = Object.entries(fieldErrors)
      .map(([field, errors]) =>
        errors ? `${field}: ${errors.join(", ")}` : field
      )
      .join("\n ");

    throw new Error(`Missing environment variables:\n  ${errorMessage}`);

    process.exit(1);
  }
}
