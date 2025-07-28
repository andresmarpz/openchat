import { z } from "zod/v4";
import { publicProcedure, trpcRouter } from "../init";
import { chatsRouter } from "./chat";

export const appRouter = trpcRouter({
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
  chat: chatsRouter,
});
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
