import z from "zod";
import { protectedProcedure, trpcRouter } from "../init";
import { ChatService } from "../../services/chat";

export interface Message {
  id: string;
  type: "human" | "ai";
  content: string;
  created_at: string;
}

export const chatsRouter = trpcRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ChatService.createChat(ctx.user!.id, input.title);
    }),
  get_all: protectedProcedure.query(async ({ ctx }) => {
    return await ChatService.getUserChats(ctx.user!.id);
  }),
  get: protectedProcedure
    .input(
      z.object({
        chatId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      return await ChatService.getChatWithMessages(input.chatId);
    }),
});
