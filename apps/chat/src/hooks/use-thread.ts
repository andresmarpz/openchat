import { useCallback, useState } from "react";
import { AIMessage, HumanMessage, Message } from "@langchain/langgraph-sdk";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export function useThread() {
  const [messages, setMessages] = useState<Message[]>([]);

  const submit = useCallback(
    async (input: { query: string }) => {
      const accMessages = [
        ...messages,
        {
          type: "human",
          content: input.query,
        } satisfies HumanMessage,
      ];

      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            messages: accMessages,
          },
        }),
      });

      const reader = response.body
        ?.pipeThrough(new TextDecoderStream())
        .getReader();

      if (!reader) throw Error();

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += value;
        let eventMatch;
        // Process all complete SSE events in the buffer
        while ((eventMatch = buffer.match(/event: (.+)\ndata: (.+)\n\n/))) {
          const [, event, data] = eventMatch;
          let dataObject;
          try {
            dataObject = JSON.parse(data) as {
              content: string;
              type: "AIMessageChunk";
              name: string;
              id: string;
            };
          } catch (e) {
            console.error("Failed to parse data as JSON:", data, e);
            // Remove the processed event from the buffer anyway to avoid infinite loop
            buffer = buffer.slice(eventMatch.index! + eventMatch[0].length);
            continue;
          }

          const msgIndex = messages.findIndex(
            (msg) => msg.id === dataObject.id
          );
          if (msgIndex < 0) {
            setMessages((val) => [
              ...val,
              {
                content: dataObject.content,
                id: dataObject.id,
                type: "ai",
              } satisfies AIMessage,
            ]);
          } else {
            setMessages((val) =>
              val.map((msg) =>
                msg.id === dataObject.id
                  ? {
                      ...msg,
                      content: msg.content + dataObject.content,
                    }
                  : msg
              )
            );
          }

          // Remove the processed event from the buffer
          buffer = buffer.slice(eventMatch.index! + eventMatch[0].length);
        }
      }
    },
    [messages]
  );

  return {
    submit,
    messages,
  };
}
