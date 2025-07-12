import z from "zod";
import { protectedProcedure, trpcRouter } from "../init";
import { db } from "../../db";
import { threads } from "../../db/schema/thread";
import { eq } from "drizzle-orm";

export const threadsRouter = trpcRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [thread] = await db
        .insert(threads)
        .values({
          title: input.title,
          user_id: ctx.user!.id,
        })
        .returning();

      return thread;
    }),
  get_all: protectedProcedure.query(async ({ ctx }) => {
    console.log(ctx.user);
    const userThreads = await db
      .select()
      .from(threads)
      .where(eq(threads.user_id, ctx.user!.id));
    return userThreads;
  }),
});
