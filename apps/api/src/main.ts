import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./trpc/routers";
import { cors } from "hono/cors";

const app = new Hono();
app.get("/", (c) => c.text("Hello Bun!"));

app.use(
  "/trpc/*",
  cors({
    origin: "*",
  }),
  trpcServer({
    router: appRouter,
  })
);

export default {
  port: 4000,
  fetch: app.fetch,
};
