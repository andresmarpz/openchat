import Chat from "~/components/chat/chat";
import ChatContainer from "~/components/chat/chat-container";

export default function ChatPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="flex-grow">
        <ChatContainer />
      </div>
    </div>
  );
}
