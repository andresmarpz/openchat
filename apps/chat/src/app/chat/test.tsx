"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/query/client";

export default function Test() {
  const trpc = useTRPC();
  const query = useQuery(trpc.hello.queryOptions());

  console.log(trpc.hello.queryOptions());

  return <div>{JSON.stringify(query.data)}</div>;
}
