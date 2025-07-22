import z from "zod";
import { protectedProcedure, trpcRouter } from "../init";
import { db } from "../../db";
import { threads } from "../../db/schema/thread";
import { eq } from "drizzle-orm";
import { openrouter } from "../../ai/router";
import { streamText } from "ai";
import { randomUUIDv7 } from "bun";

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
    const userThreads = await db
      .select()
      .from(threads)
      .where(eq(threads.user_id, ctx.user!.id));
    return userThreads;
  }),
  get: protectedProcedure
    .input(
      z.object({
        threadId: z.string().uuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      return db
        .select()
        .from(threads)
        .where(eq(threads.thread_id, input.threadId!))
        .execute()
        .then((res) => res[0]);
    }),
  chat: protectedProcedure
    .input(
      z.object({
        thread_id: z.string().optional(),
        message: z.string(),
      })
    )
    .mutation(async function* ({ input, ctx }) {
      const initial_date = new Date().toISOString();
      const thread = input.thread_id
        ? await db
            .select({
              thread_id: threads.thread_id,
              user_id: threads.user_id,
              title: threads.title,
              values: threads.values,
              metadata: threads.metadata,
            })
            .from(threads)
            .where(eq(threads.thread_id, input.thread_id))
            .execute()
            .then((res) => res[0])
        : (
            await db
              .insert(threads)
              .values({
                title: "New thread",
                user_id: ctx.user!.id,
              })
              .onConflictDoNothing()
              .returning()
          )[0];

      if (!thread) {
        throw new Error("Failed to create or find thread");
      }

      try {
        yield { type: "thread/set", data: { threadId: thread.thread_id } };

        const result = streamText({
          model: openrouter.chat("openai/gpt-4o-mini"),
          prompt: input.message,
        });

        let response = "";
        for await (const chunk of result.textStream) {
          yield { type: "messages/partial", content: chunk };
          response += chunk;
        }

        yield { type: "messages" };

        await db
          .update(threads)
          .set({
            values: {
              ...thread.values,
              messages: [
                ...(thread.values?.messages ?? []),
                {
                  id: randomUUIDv7(),
                  type: "user",
                  content: input.message,
                  created_at: initial_date,
                },
                {
                  id: randomUUIDv7(),
                  type: "ai",
                  content: response,
                  created_at: new Date().toISOString(),
                },
              ],
            },
          })
          .where(eq(threads.thread_id, thread.thread_id))
          .returning({
            values: threads.values,
          });
      } catch (error) {
        throw error;
      }
    }),
});
