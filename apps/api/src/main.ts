import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createTrpcContext } from "./trpc/init";
import { appRouter } from "./trpc/routers/_app";
import { handleChat } from "./ai/chat";

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

app.use(
  "/chat",
  cors({
    origin: "*",
  })
);
app.post("/chat", handleChat);

export default {
  port: 4000,
  fetch: app.fetch,
};
