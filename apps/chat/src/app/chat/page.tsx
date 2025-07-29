import { Suspense } from "react";
import ChatContainer from "~/components/chat/chat-container";

export default function ChatPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="flex-grow">
        <Suspense fallback={null}>
          <ChatContainer />
        </Suspense>
      </div>
    </div>
  );
}
