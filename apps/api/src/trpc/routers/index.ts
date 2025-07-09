import { z } from "zod/v4";
import { publicProcedure, trpcRouter } from "../init";
import { createHTTPServer } from "@trpc/server/adapters/standalone";

export const appRouter = trpcRouter({
  // ...
  hello: publicProcedure.query(async () => {
    return {
      data: "hello",
    };
  }),
  userList: publicProcedure.input(z.string()).query(async () => {
    const users = [{ name: "pepe" }];

    return {
      data: users,
    };
  }),
});
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
