"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import ChatMessage from "~/components/chat/chat-message";
import InputBox from "~/components/primitives/InputBox";
import { createClient } from "~/lib/supabase/client";
import { v7 } from "uuid";
import { useRouter } from "next/navigation";

interface Props {
  chatId?: string;
}

export default function ChatContainer({ chatId }: Props) {
  const router = useRouter();
  const { id, messages, sendMessage } = useChat({
    ...(chatId ? { id: chatId } : {}),
    generateId: v7,
    transport: new DefaultChatTransport({
      api: `${process.env.NEXT_PUBLIC_API_URL}/chat`,
      headers: async () => {
        const supabase = createClient();

        const {
          data: { session },
        } = await supabase.auth.getSession();

        return {
          Authorization: `Bearer ${session?.access_token}`,
        };
      },
    }),
    onError(error) {
      console.error(error);
    },
  });

  const onSendMessage = async (message: string) => {
    const shouldRedirect = !id && window.location.pathname.startsWith("/chat/");
    if (shouldRedirect) {
      window.history.pushState(null, "", `/chat/${id}`);
    }

    await sendMessage({
      parts: [{ type: "text", text: message }],
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          return <ChatMessage key={message.id} message={message} />;
        })}
      </div>

      <div className="border-t p-4">
        <InputBox onSendMessage={onSendMessage} />
      </div>
    </div>
  );
}
