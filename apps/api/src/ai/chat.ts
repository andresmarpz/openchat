import type { Handler } from "hono";
import type { BlankEnv, BlankInput } from "hono/types";
import { openrouter } from "./router";
import { convertToModelMessages, streamText } from "ai";

export const handleChat: Handler<BlankEnv, "/chat", BlankInput> = async (c) => {
  const { messages } = await c.req.json();

  const result = streamText({
    // @ts-expect-error - OpenRouterChatLanguageModel is not typed correctly or smth.
    model: openrouter.chat("openai/gpt-4o-mini"),
    messages: convertToModelMessages(messages),
  });

  // Mark the response as a v1 data stream:
  c.header("Content-Type", "text/plain; charset=utf-8");

  return result.toUIMessageStreamResponse();
};
