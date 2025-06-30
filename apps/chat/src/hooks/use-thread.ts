"use client";

import { useCallback, useState } from "react";
import { AIMessage, HumanMessage, Message } from "@langchain/langgraph-sdk";
import { createClient } from "~/lib/supabase/client";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export function useThread() {
  const [messages, setMessages] = useState<Message[]>([]);
  const client = createClient();

  const submit = useCallback(async (input: { query: string }) => {
    const userMessage: HumanMessage = {
      type: "human",
      content: input.query,
      id: crypto.randomUUID(),
    };

    setMessages((prev) => [...prev, userMessage]);

    const {
      data: { session },
    } = await client.auth.getSession();
    const token = session?.access_token;

    console.log(token);

    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        input: { messages: [{ role: "user", content: input.query }] },
      }),
    });

    const reader = response.body
      ?.pipeThrough(new TextDecoderStream())
      .getReader();

    if (!reader) throw Error();

    let buffer = "";
    let currentMessageId: string | null = null;
    let accumulatedContent = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += value;
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("event: messages")) {
            continue;
          }

          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "AIMessageChunk") {
                if (!currentMessageId) {
                  currentMessageId = data.id;
                  accumulatedContent = data.content || "";

                  const chunkMessage: AIMessage = {
                    type: "ai",
                    content: accumulatedContent,
                    id: currentMessageId!,
                  };

                  setMessages((prev) => [...prev, chunkMessage]);
                } else if (data.id === currentMessageId) {
                  accumulatedContent += data.content || "";

                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === currentMessageId
                        ? { ...msg, content: accumulatedContent }
                        : msg
                    )
                  );
                }
              } else if (data.type === "ai" && data.id === currentMessageId) {
                const finalMessage: AIMessage = {
                  type: "ai",
                  content: data.content,
                  id: data.id,
                };

                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === currentMessageId ? finalMessage : msg
                  )
                );

                currentMessageId = null;
                accumulatedContent = "";
              }
            } catch (error) {
              console.error("Error parsing SSE data:", error);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }, []);

  return {
    submit,
    messages,
  };
}
