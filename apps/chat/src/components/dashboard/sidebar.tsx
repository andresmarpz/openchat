"use client"

import { MessageCircle, Plus, Settings, User } from "lucide-react"
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
} from "~/components/ui/sidebar"
import { Button } from "~/components/ui/button"

const mockThreads = [
  {
    id: "1",
    title: "How to implement authentication in Next.js",
    lastMessage: "Let me help you set up authentication...",
    timestamp: "2 hours ago",
    isActive: true,
  },
  {
    id: "2", 
    title: "React state management patterns",
    lastMessage: "There are several approaches to state management...",
    timestamp: "1 day ago",
    isActive: false,
  },
  {
    id: "3",
    title: "Database design for chat application",
    lastMessage: "For a chat application, you'll want to consider...",
    timestamp: "2 days ago",
    isActive: false,
  },
  {
    id: "4",
    title: "Deployment strategies for Node.js apps",
    lastMessage: "Here are the most common deployment options...",
    timestamp: "3 days ago",
    isActive: false,
  },
  {
    id: "5",
    title: "CSS Grid vs Flexbox comparison",
    lastMessage: "Both CSS Grid and Flexbox have their uses...",
    timestamp: "1 week ago",
    isActive: false,
  },
]

export function AppSidebar() {
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
              {mockThreads.map((thread) => (
                <SidebarMenuItem key={thread.id}>
                  <SidebarMenuButton
                    isActive={thread.isActive}
                    className="flex flex-col items-start gap-1 p-3 h-auto"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <MessageCircle className="size-4 shrink-0" />
                      <span className="font-medium truncate">{thread.title}</span>
                    </div>
                    <div className="text-xs text-muted-foreground pl-6 w-full">
                      <p className="truncate">{thread.lastMessage}</p>
                      <p className="text-xs mt-1">{thread.timestamp}</p>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
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
  )
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
        <div className="p-4 h-full overflow-auto">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}
