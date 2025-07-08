import { z } from "zod/v4";
import { publicProcedure, trpcRouter } from "../init";
import { createHTTPServer } from "@trpc/server/adapters/standalone";

const appRouter = trpcRouter({
  // ...
  userList: publicProcedure.input(z.string()).query(async () => {
    const users = [{ name: "pepe" }];

    return users;
  }),
});
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;

const server = createHTTPServer({
  router: appRouter,
});

server.listen(4054, undefined, undefined, () => console.log("hi"));
