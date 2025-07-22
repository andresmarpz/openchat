import { jsonb, pgSchema, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { lifecycleFields } from "../utils";
import { authUsers } from "drizzle-orm/supabase";

// Define the types for your JSON columns
export interface ThreadValues {
  messages: Array<{
    type: "user" | "ai" | "system";
    content: string;
    id?: string;
    created_at?: string;
  }>;
}

export interface ThreadMetadata {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  [key: string]: any; // Allow additional metadata
}

export const threads = pgTable("threads", {
  thread_id: uuid("thread_id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => authUsers.id),
  title: text("title").notNull(),
  values: jsonb("values")
    .$type<ThreadValues>()
    .$defaultFn(() => ({
      messages: [],
    })),
  metadata: jsonb("metadata")
    .$type<ThreadMetadata>()
    .$defaultFn(() => ({})),
  ...lifecycleFields,
});
