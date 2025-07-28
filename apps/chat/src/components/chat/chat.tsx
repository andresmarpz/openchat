"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState, useRef } from "react";
import InputBox from "~/components/primitives/InputBox";
import { useTRPC } from "~/query/client";
import { inferOutput } from "@trpc/tanstack-react-query";

interface Props {
  threadId?: string;
}

export default function Chat({ threadId }: Props) {
  const [currentThreadId, setCurrentThreadId] = useState(threadId);
  const [currentResponse, setCurrentResponse] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const responseRef = useRef("");

  const trpc = useTRPC();
  type ThreadQueryData = inferOutput<typeof trpc.thread.get>;
  type Message = ThreadQueryData["values"]["messages"][number];
  const queryClient = useQueryClient();

  const { data: thread } = useQuery({
    queryKey: trpc.thread.get.queryKey({ threadId: currentThreadId! }),
    queryFn: async (...args) => {
      const result = await trpc.thread.get
        .queryOptions({ threadId: currentThreadId! })
        .queryFn?.(...args);

      return result ?? null;
    },
    enabled: !!currentThreadId,
    placeholderData: keepPreviousData,
  });

  const messages = thread?.values?.["messages"] ?? [];

  const { mutate } = useMutation({
    mutationKey: trpc.thread.chat.mutationKey(),
    mutationFn: async (input: { message: string; thread_id: string }) => {
      addMessage(
        {
          id: await generateUUID(),
          type: "human" as const,
          content: input.message,
          created_at: new Date().toISOString(),
        },
        input.thread_id
      );

      setIsStreaming(true);
      setCurrentResponse("");
      responseRef.current = "";

      const result = await trpc.thread.chat
        .mutationOptions()
        .mutationFn?.(input);
      if (!result) {
        throw new Error("No result from chat");
      }

      for await (const chunk of result) {
        if (chunk?.type === "messages/partial") {
          responseRef.current += chunk.data.content ?? "";
          setCurrentResponse(responseRef.current);
        } else if (chunk?.type === "messages") {
          addMessage(
            {
              id: chunk.data.id,
              type: "ai",
              content: chunk.data.content,
              created_at: new Date().toISOString(),
            },
            input.thread_id
          );
          setCurrentResponse("");
          setIsStreaming(false);
          break;
        }
      }

      return result;
    },
  });

  function addMessage(message: Message, threadId: string) {
    const setter = (old: ThreadQueryData | undefined) =>
      ({
        ...old!,
        values: {
          ...old?.values,
          messages: [...(old?.values?.messages ?? []), message],
        },
      } satisfies ThreadQueryData);

    const queryKey = trpc.thread.get.queryKey({ threadId });

    queryClient.setQueryData(queryKey, (old) => {
      const newData = setter(old);
      return newData;
    });
  }

  const handleSubmit = async (input: string) => {
    const newUUID = await generateUUID();
    if (!currentThreadId) {
      setCurrentThreadId(newUUID);
      window.history.pushState({}, "", `/chat/${newUUID}`);
      console.log("Created thread:", newUUID);
    }

    mutate({
      message: input,
      thread_id: currentThreadId ?? newUUID,
    });
  };

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
