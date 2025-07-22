"use client";

import { MessageCircle, Plus, Settings, User } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { Button } from "~/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/query/client";
import Link from "next/link";

export function AppSidebar() {
  const trpc = useTRPC();
  const { data: threads } = useQuery(trpc.thread.get_all.queryOptions());

  const formattedThreads = threads?.map((thread) => ({
    id: thread.thread_id,
    title: thread.title,
    lastMessage: thread?.values?.["messages"]?.[0]?.content ?? "No messages",
    timestamp:
      thread.updated_at?.toString() ?? thread.created_at?.toString() ?? "",
    isActive: false,
  }));

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <MessageCircle className="size-6" />
          <span className="text-lg font-semibold">OpenChat</span>
        </div>
        <Button className="w-full justify-start gap-2">
          <Plus className="size-4" />
          New Chat
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Search</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarInput
              placeholder="Search conversations..."
              className="w-full"
            />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Recent Threads</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {formattedThreads?.map((thread) => (
                <Link key={"side_" + thread.id} href={`/chat/${thread.id}`}>
                  <SidebarMenuItem key={thread.id}>
                    <SidebarMenuButton
                      isActive={thread.isActive}
                      className="flex flex-col items-start gap-1 p-3 h-auto"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <MessageCircle className="size-4 shrink-0" />
                        <span className="font-medium truncate">
                          {thread.title}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground pl-6 w-full">
                        <p className="truncate">{thread.lastMessage}</p>
                        <p className="text-xs mt-1">{thread.timestamp}</p>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </Link>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Loading Example</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {Array.from({ length: 3 }).map((_, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Settings className="size-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <User className="size-4" />
              <span>Profile</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-hidden">
        <div className="flex items-center gap-2 border-b p-4">
          <SidebarTrigger />
          <h1 className="text-lg font-semibold">Chat</h1>
        </div>
        <div className="p-4 h-full overflow-auto">{children}</div>
      </main>
    </SidebarProvider>
  );
}
