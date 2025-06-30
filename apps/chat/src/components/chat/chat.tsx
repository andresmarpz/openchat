"use client";

import InputBox from "~/components/primitives/InputBox";
import { useThread } from "~/hooks/use-thread";

export default function Chat() {
  const { messages, submit } = useThread();

  return (
    <div>
      <ul>
        {messages.map((message) => {
          return (
            <li key={message.id}>
              {message.type === "human" ? "You" : "AI"}
              {String(message.content)}
            </li>
          );
        })}
      </ul>

      <InputBox onSendMessage={(message) => submit({ query: message })} />
    </div>
  );
}
