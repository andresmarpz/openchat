"use client";

import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import {
  createTRPCClient,
  httpBatchLink,
  httpBatchStreamLink,
  loggerLink,
  splitLink,
} from "@trpc/client";
import { useState } from "react";
import { makeQueryClient } from "~/query/query-client";
import { AppRouter } from "@openchat/api/src/trpc/routers/_app";
import superjson from "superjson";
import { createClient } from "~/lib/supabase/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

let browserQueryClient: QueryClient;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  }

  // Browser: make a new query client if we don't already have one
  // This is very important, so we don't re-make a new client if React
  // suspends during the initial render. This may not be needed if we
  // have a suspense boundary BELOW the creation of the query client
  if (!browserQueryClient) browserQueryClient = makeQueryClient();

  return browserQueryClient;
}

export function getUrl() {
  const base = (() => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    throw new Error("No API URL found");
  })();
  return `${base}/trpc`;
}

export function TRPCReactProvider(
  props: Readonly<{
    children: React.ReactNode;
  }>
) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        splitLink({
          condition: (op) => {
            return op.type === "mutation" && op.path === "chat.chat";
          },
          true: httpBatchStreamLink({
            transformer: superjson,
            url: getUrl(),
            async headers() {
              const supabase = createClient();

              const {
                data: { session },
              } = await supabase.auth.getSession();

              return {
                Authorization: `Bearer ${session?.access_token}`,
              };
            },
          }),
          false: httpBatchLink({
            transformer: superjson,
            url: getUrl(),
            async headers() {
              const supabase = createClient();

              const {
                data: { session },
              } = await supabase.auth.getSession();

              return {
                Authorization: `Bearer ${session?.access_token}`,
              };
            },
          }),
        }),
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
      ],
    })
  );

  return (
    <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </TRPCProvider>
  );
}
