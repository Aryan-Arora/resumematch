import dotenv from "dotenv";
import * as Sentry from "@sentry/node";

dotenv.config();

if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 });
  console.log("Sentry error monitoring enabled.");
}
