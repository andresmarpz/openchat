"use client";
import { CommandIcon, CornerDownLeftIcon, PlusIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";
import { useThread } from "~/hooks/use-thread";
import { cn } from "~/lib/utils";

interface Props {
  onSendMessage: (message: string) => unknown;
}

export default function InputBox({ onSendMessage }: Props) {
  const form = useForm({
    defaultValues: {
      message: "",
    },
  });

  const { messages, submit } = useThread();

  const handleSubmit = form.handleSubmit(async (data) => {
    // const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    // const response = await fetch(`${backendUrl}/chat`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     input: {
    //       messages: [{ role: "user", content: "hiii" }],
    //     },
    //   }),
    // });
    // const reader = response.body?.getReader();
    // if (!reader) {
    //   return;
    // }
    // const decoder = new TextDecoder();
    // while (true) {
    //   const { done, value } = await reader.read();
    //   if (done) {
    //     break;
    //   }
    //   const text = decoder.decode(value, { stream: true });
    //   console.log(text);
    // }
    await submit({
      query: data.message,
    });
  });

  return (
    <Form {...form}>
      <ul>
        {messages.map((msg) => (
          <li key={msg.id}>{String(msg.content)}</li>
        ))}
      </ul>
      <form onSubmit={handleSubmit} className="flex relative h-full w-full p-2">
        <div className="flex relative w-full">
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Textarea className="resize-none" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <Button
            className={cn(
              "text-xs text-gray-1000",
              "select-none",
              "gap-0.5 px-2!",
              "group",
              "absolute right-2 bottom-2"
            )}
            type="submit"
            size="sm"
            variant="outline"
          >
            <CommandIcon className="h-4 w-4 border group-hover:border-neutral-600 rounded p-[2px]" />
            <PlusIcon className="h-3! w-3! p-[2px]" />
            <CornerDownLeftIcon className="h-4 w-4 border group-hover:border-neutral-600 rounded p-[2px]" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
