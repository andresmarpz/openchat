import { jsonb, pgSchema, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { lifecycleFields } from "../utils";
import { authUsers } from "drizzle-orm/supabase";
import type { Message } from "../../trpc/routers/thread";

// Define the types for your JSON columns
export interface ThreadValues {
  messages: Array<Message>;
}

export interface ThreadMetadata {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  [key: string]: any; // Allow additional metadata
}

export const threads = pgTable("threads", {
  thread_id: uuid("thread_id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .references(() => authUsers.id)
    .notNull(),
  title: text("title").notNull(),
  values: jsonb("values")
    .$type<ThreadValues>()
    .$defaultFn(() => ({
      messages: [],
    }))
    .notNull(),
  metadata: jsonb("metadata")
    .$type<ThreadMetadata>()
    .$defaultFn(() => ({}))
    .notNull(),
  ...lifecycleFields,
});
