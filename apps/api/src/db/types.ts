import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { threads } from "./schema/thread";

// Export the table inference types
export type Thread = InferSelectModel<typeof threads>;
export type NewThread = InferInsertModel<typeof threads>;

// Re-export the JSON types for convenience
export type { ThreadValues, ThreadMetadata } from "./schema/thread";
