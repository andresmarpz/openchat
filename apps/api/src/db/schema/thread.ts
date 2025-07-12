import { jsonb, pgSchema, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { lifecycleFields } from "../utils";
import { authUsers } from "drizzle-orm/supabase";

export const threads = pgTable("threads", {
  thread_id: uuid("thread_id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => authUsers.id),
  title: text("title").notNull(),
  values: jsonb("values").$defaultFn(() => ({})),
  metadata: jsonb("metadata").$defaultFn(() => ({})),
  ...lifecycleFields,
});
