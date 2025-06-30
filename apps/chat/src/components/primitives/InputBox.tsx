"use client";
import { CommandIcon, CornerDownLeftIcon, PlusIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";

interface Props {
  onSendMessage: (message: string) => Promise<unknown>;
}

export default function InputBox({ onSendMessage }: Props) {
  const form = useForm({
    defaultValues: {
      message: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSendMessage(data.message);
  });

  return (
    <Form {...form}>
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
