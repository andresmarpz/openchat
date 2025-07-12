import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./trpc/routers";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createTrpcContext } from "./trpc/init";

const app = new Hono();
app.get("/", (c) => c.text("Hello Bun!"));

app.use(
  "/trpc/*",
  cors({
    origin: "*",
  }),
  trpcServer({
    router: appRouter,
    createContext: createTrpcContext,
  }),
  logger()
);

export default {
  port: 4000,
  fetch: app.fetch,
};
