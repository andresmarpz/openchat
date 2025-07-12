import { createClient, type User } from "@supabase/supabase-js";
import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "hono";
import superjson from "superjson";
/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */

type TrpcContext = {
  user: User | null;
};

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createTrpcContext = async (_: unknown, context: Context) => {
  const authHeader = context.req.header("Authorization");
  if (!authHeader) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No authorization header",
    });
  }

  const token = authHeader.split(" ")[1];
  const client = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );

  const { data } = await client.auth.getUser(token);
  return { user: data.user ?? null };
};

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const trpcRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    });
  }
  return next({ ctx });
});
