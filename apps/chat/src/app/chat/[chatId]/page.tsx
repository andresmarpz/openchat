import ChatContainer from "~/components/chat/chat-container";
import { getQueryClient } from "~/query/server";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;

  const trpc = getQueryClient();

  const messageHistory = await trpc.return(
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="flex-grow">
        <ChatContainer chatId={chatId} />
      </div>
    </div>
  );
}
