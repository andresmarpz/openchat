import { sql } from "drizzle-orm";
import { timestamp } from "drizzle-orm/pg-core";

export const lifecycleFields = {
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => sql`now()`),
};
