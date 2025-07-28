import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { chats, chatMessages } from "./schema";

// Export the table inference types
export type Chat = InferSelectModel<typeof chats>;
export type NewChat = InferInsertModel<typeof chats>;
export type ChatMessage = InferSelectModel<typeof chatMessages>;
export type NewChatMessage = InferInsertModel<typeof chatMessages>;

// Re-export the JSON types for convenience
export type { ChatValues, ChatMetadata } from "./schema";
