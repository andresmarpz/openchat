"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "~/query/client";

export default function Test() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const query = useQuery(trpc.thread.get_all.queryOptions());
  const mutation = useMutation(trpc.thread.create.mutationOptions());

  console.log(trpc.thread.get_all.queryOptions());

  return (
    <div>
      {JSON.stringify(query.data)}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          const title = formData.get("title") as string;
          await mutation.mutateAsync({ title });
          queryClient.invalidateQueries({
            queryKey: trpc.thread.get_all.queryKey(),
          });
        }}
      >
        <input name="title" />
        <button>Send</button>
      </form>
    </div>
  );
}
