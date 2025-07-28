"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import InputBox from "~/components/primitives/InputBox";
import { createClient } from "~/lib/supabase/client";

interface Props {
  chatId?: string;
}

export default function ChatContainer({ chatId }: Props) {
  const { messages, sendMessage, status } = useChat({
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

  console.log(status, messages);

  const onSendMessage = async (message: string) => {
    await sendMessage({
      parts: [{ type: "text", text: message }],
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          return (
            <div key={message.id}>
              <pre>{JSON.stringify(message, null, 2)}</pre>
            </div>
          );
        })}
      </div>

      <div className="border-t p-4">
        <InputBox onSendMessage={onSendMessage} />
      </div>
    </div>
  );
}
