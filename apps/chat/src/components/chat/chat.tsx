"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState, useRef } from "react";
import InputBox from "~/components/primitives/InputBox";
import { useTRPC } from "~/query/client";
interface Message {
  id: string;
  type: "human" | "ai";
  content: string;
}

export default function Chat() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentResponse, setCurrentResponse] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const responseRef = useRef("");

  const trpc = useTRPC();

  const params = useParams();
  const targetChatId = params["chatId"];
  const threadId = Array.isArray(targetChatId) ? targetChatId[0] : targetChatId;

  useQuery({
    queryKey: trpc.thread.get.queryKey({ threadId: threadId! }),
    queryFn: async (...args) => {
      const result = await trpc.thread.get
        .queryOptions({ threadId: threadId! })
        .queryFn?.(...args);

      if (result) {
        const msgs = result?.values["messages"];
        console.log("msgs", msgs);
        if (msgs) setMessages(msgs);
      }

      return result;
    },
    enabled: !!threadId,
  });

  const { mutateAsync } = useMutation(trpc.thread.chat.mutationOptions());

  async function handleSubmit(input: string) {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "human",
        content: input,
      },
    ]);

    setIsStreaming(true);
    setCurrentResponse("");
    responseRef.current = "";

    const result = await mutateAsync({
      message: input,
      thread_id: threadId,
    });

    for await (const chunk of result) {
      if (chunk?.type === "thread/set") {
        router.replace(`/chat/${chunk.data?.threadId}`, {
          scroll: false,
        });
        continue;
      } else if (chunk?.type === "messages/partial") {
        responseRef.current += chunk.content;
        setCurrentResponse(responseRef.current);
      } else if (chunk?.type === "messages") {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            type: "ai",
            content: responseRef.current,
          },
        ]);
        setCurrentResponse("");
        setIsStreaming(false);
      } else if (chunk?.type === "end") {
        console.log("finished!");
        break;
      }
    }
  }

  return (
    <div>
      <ul>
        {messages.map((message) => {
          return (
            <li key={message.id}>
              {message.type === "human" ? "You: " : "AI: "}
              {message.content}
            </li>
          );
        })}
        {isStreaming && currentResponse && <li>AI: {currentResponse}</li>}
      </ul>

      <InputBox onSendMessage={(message) => handleSubmit(message)} />
    </div>
  );
}
