import { UIMessage } from "@ai-sdk/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";

export default function ChatMessage({ message }: { message: UIMessage }) {
  return (
    <Card
      className={cn("flex flex-col gap-2 w-2/3", {
        "self-end": message.role === "user",
        "self-start": message.role === "assistant",
      })}
    >
      <CardHeader>
        <CardTitle>{message.role}</CardTitle>
      </CardHeader>
      <CardContent>
        {message.parts.map((part) => {
          if (part.type === "text") {
            return <p key={part.text}>{part.text}</p>;
          }

          return <div key={part.type}>{part.type}</div>;
        })}
      </CardContent>
    </Card>
  );
}
