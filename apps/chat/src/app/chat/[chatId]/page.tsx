import ChatContainer from "~/components/chat/chat-container";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;
  console.log("chatId", chatId);

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="flex-grow">
        <ChatContainer chatId={chatId} />
      </div>
    </div>
  );
}
