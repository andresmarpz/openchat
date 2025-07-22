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
import { useParams, useRouter } from "next/navigation";

const generateUUID = async () => await import("uuid").then((m) => m.v7());

export default function Chat() {
  const router = useRouter();
  const [currentResponse, setCurrentResponse] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const responseRef = useRef("");

  const params = useParams();
  let threadId = Array.isArray(params.chatId)
    ? params.chatId[0]
    : params.chatId;

  const trpc = useTRPC();
  type ThreadQueryData = inferOutput<typeof trpc.thread.get>;
  type Message = ThreadQueryData["values"]["messages"][number];
  const queryClient = useQueryClient();

  const { data: thread } = useQuery({
    queryKey: trpc.thread.get.queryKey({ threadId: threadId! }),
    queryFn: async (...args) => {
      const result = await trpc.thread.get
        .queryOptions({ threadId: threadId! })
        .queryFn?.(...args);

      return result ?? null;
    },
    enabled: !!threadId,
    placeholderData: keepPreviousData,
  });
  console.log("thread", thread);

  const messages = thread?.values?.["messages"] ?? [];
  console.log(messages);

  const { mutateAsync } = useMutation(trpc.thread.chat.mutationOptions());

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
    console.log("queryKey", queryKey);

    queryClient.setQueryData(queryKey, (old) => {
      console.log("old", old);
      const newData = setter(old);
      console.log("newData", newData);
      return newData;
    });
  }

  async function handleSubmit(input: string) {
    if (!threadId) {
      threadId = await generateUUID();
      router.replace(`/chat/${threadId}`);
      console.log("Created thread:", threadId);
    }

    addMessage(
      {
        id: await generateUUID(),
        type: "human" as const,
        content: input,
        created_at: new Date().toISOString(),
      },
      threadId
    );

    // queryClient.invalidateQueries({
    //   queryKey: trpc.thread.get.queryKey({ threadId: threadId! }),
    // });

    // setIsStreaming(true);
    // setCurrentResponse("");
    // responseRef.current = "";

    // const result = await mutateAsync({
    //   message: input,
    //   thread_id: threadId,
    // });

    // for await (const chunk of result) {
    //   console.log(chunk);
    //   if (chunk?.type === "thread/set") {
    //     continue;
    //   } else if (chunk?.type === "messages/partial") {
    //     responseRef.current += chunk.content;
    //     setCurrentResponse(responseRef.current);
    //   } else if (chunk?.type === "messages") {
    //     addMessage({
    //       id: await generateUUID(),
    //       type: "ai",
    //       content: responseRef.current,
    //       created_at: new Date().toISOString(),
    //     });
    //     setCurrentResponse("");
    //     setIsStreaming(false);
    //   } else if (chunk?.type === "end") {
    //     console.log("finished!");
    //     break;
    //   }
    // }
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
