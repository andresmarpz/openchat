"use client";

import Chat from "~/components/chat/chat";

export default function ChatPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="flex-grow">
        <Chat />
      </div>
    </div>
  );
}
