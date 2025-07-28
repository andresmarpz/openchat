import {
  integer,
  jsonb,
  pgEnum,
  pgSchema,
  pgTable,
  primaryKey,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import {
  relations,
  type InferInsertModel,
  type InferSelectModel,
} from "drizzle-orm";
import { authUsers } from "drizzle-orm/supabase";
import type { Message } from "../trpc/routers/chat";
import { lifecycleFields } from "./utils";

export interface ChatValues {
  messages: Array<Message>;
}

export interface ChatMetadata {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  [key: string]: any;
}

export const chatMessageRole = pgEnum("chat_message_role", ["human", "ai"]);

export const messagePartsType = pgEnum("message_parts_type", [
  "text",
  "reasoning",
  "tool",
  "source_url",
  "file",
]);

export const chats = pgTable("chats", {
  chat_id: uuid("chat_id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .references(() => authUsers.id)
    .notNull(),
  title: text("title").notNull(),
  values: jsonb("values")
    .$type<ChatValues>()
    .$defaultFn(() => ({
      messages: [],
    }))
    .notNull(),
  metadata: jsonb("metadata")
    .$type<ChatMetadata>()
    .$defaultFn(() => ({}))
    .notNull(),
  ...lifecycleFields,
});

export const chatMessages = pgTable("chat_messages", {
  chat_id: uuid("chat_id")
    .references(() => chats.chat_id)
    .notNull(),
  id: uuid("id").primaryKey().defaultRandom(),
  role: chatMessageRole("role").notNull(),
  ...lifecycleFields,
});

export const chatPartsText = pgTable(
  "chat_parts_text",
  {
    chat_message_id: uuid("chat_message_id")
      .references(() => chatMessages.id)
      .notNull(),
    type: messagePartsType("type").notNull().default("text"),
    text: text("text").notNull(),
    index: integer("index").notNull(),
    state: text("state"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.chat_message_id, table.index] }),
  })
);

export const chatPartReasoning = pgTable(
  "chat_parts_reasoning",
  {
    chat_message_id: uuid("chat_message_id")
      .references(() => chatMessages.id)
      .notNull(),
    type: messagePartsType("type").notNull().default("reasoning"),
    reasoning: text("reasoning").notNull(),
    index: integer("index").notNull(),
    state: text("state"),
    providerMetadata: jsonb("provider_metadata"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.chat_message_id, table.index] }),
  })
);

export const chatPartTool = pgTable(
  "chat_parts_tool",
  {
    chat_message_id: uuid("chat_message_id")
      .references(() => chatMessages.id)
      .notNull(),
    type: messagePartsType("type").notNull().default("tool"),
    toolCallId: text("tool_call_id").notNull(),
    input: jsonb("input"),
    output: jsonb("output"),
    index: integer("index").notNull(),
    state: text("state").default("output-available"),
    errorText: text("error_text"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.chat_message_id, table.index] }),
  })
);

export const chatPartSourceUrl = pgTable(
  "chat_parts_source_url",
  {
    chat_message_id: uuid("chat_message_id")
      .references(() => chatMessages.id)
      .notNull(),
    type: messagePartsType("type").notNull().default("source_url"),
    index: integer("index").notNull(),
    sourceId: text("source_id").notNull(),
    url: text("url").notNull(),
    title: text("title"),
    providerMetadata: jsonb("provider_metadata"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.chat_message_id, table.index] }),
  })
);

export const chatPartFile = pgTable(
  "chat_parts_file",
  {
    chat_message_id: uuid("chat_message_id")
      .references(() => chatMessages.id)
      .notNull(),
    type: messagePartsType("type").notNull().default("file"),
    index: integer("index").notNull(),
    mediaType: text("media_type"),
    filename: text("filename"),
    url: text("url").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.chat_message_id, table.index] }),
  })
);

// Relations
export const chatsRelations = relations(chats, ({ many }) => ({
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(
  chatMessages,
  ({ one, many }) => ({
    chat: one(chats, {
      fields: [chatMessages.chat_id],
      references: [chats.chat_id],
    }),
    textParts: many(chatPartsText),
    reasoningParts: many(chatPartReasoning),
    toolParts: many(chatPartTool),
    sourceUrlParts: many(chatPartSourceUrl),
    fileParts: many(chatPartFile),
  })
);

export const chatPartsTextRelations = relations(chatPartsText, ({ one }) => ({
  message: one(chatMessages, {
    fields: [chatPartsText.chat_message_id],
    references: [chatMessages.id],
  }),
}));

export const chatPartReasoningRelations = relations(
  chatPartReasoning,
  ({ one }) => ({
    message: one(chatMessages, {
      fields: [chatPartReasoning.chat_message_id],
      references: [chatMessages.id],
    }),
  })
);

export const chatPartToolRelations = relations(chatPartTool, ({ one }) => ({
  message: one(chatMessages, {
    fields: [chatPartTool.chat_message_id],
    references: [chatMessages.id],
  }),
}));

export const chatPartSourceUrlRelations = relations(
  chatPartSourceUrl,
  ({ one }) => ({
    message: one(chatMessages, {
      fields: [chatPartSourceUrl.chat_message_id],
      references: [chatMessages.id],
    }),
  })
);

export const chatPartFileRelations = relations(chatPartFile, ({ one }) => ({
  message: one(chatMessages, {
    fields: [chatPartFile.chat_message_id],
    references: [chatMessages.id],
  }),
}));

type ChatMessagePartText = InferSelectModel<typeof chatPartsText>;
type ChatMessagePartReasoning = InferSelectModel<typeof chatPartReasoning>;
type ChatMessagePartTool = InferSelectModel<typeof chatPartTool>;
type ChatMessagePartSourceUrl = InferSelectModel<typeof chatPartSourceUrl>;
type ChatMessagePartFile = InferSelectModel<typeof chatPartFile>;

type ChatMessagePartTextInsert = InferInsertModel<typeof chatPartsText>;
type ChatMessagePartReasoningInsert = InferInsertModel<
  typeof chatPartReasoning
>;
type ChatMessagePartToolInsert = InferInsertModel<typeof chatPartTool>;
type ChatMessagePartSourceUrlInsert = InferInsertModel<
  typeof chatPartSourceUrl
>;
type ChatMessagePartFileInsert = InferInsertModel<typeof chatPartFile>;

export type ChatMessagePart =
  | ChatMessagePartText
  | ChatMessagePartReasoning
  | ChatMessagePartTool
  | ChatMessagePartSourceUrl
  | ChatMessagePartFile;

export type ChatMessagePartInsert =
  | ChatMessagePartTextInsert
  | ChatMessagePartReasoningInsert
  | ChatMessagePartToolInsert
  | ChatMessagePartSourceUrlInsert
  | ChatMessagePartFileInsert;

export type Chat = typeof chats.$inferSelect;
export type ChatInsert = typeof chats.$inferInsert;
