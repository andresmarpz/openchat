CREATE TYPE "public"."chat_message_role" AS ENUM('human', 'ai');--> statement-breakpoint
CREATE TYPE "public"."message_parts_type" AS ENUM('text', 'reasoning', 'tool', 'source_url', 'file');--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"chat_id" uuid NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" "chat_message_role" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_parts_file" (
	"chat_message_id" uuid NOT NULL,
	"type" "message_parts_type" DEFAULT 'file' NOT NULL,
	"index" integer NOT NULL,
	"media_type" text,
	"filename" text,
	"url" text NOT NULL,
	CONSTRAINT "chat_parts_file_chat_message_id_index_pk" PRIMARY KEY("chat_message_id","index")
);
--> statement-breakpoint
CREATE TABLE "chat_parts_reasoning" (
	"chat_message_id" uuid NOT NULL,
	"type" "message_parts_type" DEFAULT 'reasoning' NOT NULL,
	"reasoning" text NOT NULL,
	"index" integer NOT NULL,
	"state" text,
	"provider_metadata" jsonb,
	CONSTRAINT "chat_parts_reasoning_chat_message_id_index_pk" PRIMARY KEY("chat_message_id","index")
);
--> statement-breakpoint
CREATE TABLE "chat_parts_source_url" (
	"chat_message_id" uuid NOT NULL,
	"type" "message_parts_type" DEFAULT 'source_url' NOT NULL,
	"index" integer NOT NULL,
	"source_id" text NOT NULL,
	"url" text NOT NULL,
	"title" text,
	"provider_metadata" jsonb,
	CONSTRAINT "chat_parts_source_url_chat_message_id_index_pk" PRIMARY KEY("chat_message_id","index")
);
--> statement-breakpoint
CREATE TABLE "chat_parts_tool" (
	"chat_message_id" uuid NOT NULL,
	"type" "message_parts_type" DEFAULT 'tool' NOT NULL,
	"tool_call_id" text NOT NULL,
	"input" jsonb,
	"output" jsonb,
	"index" integer NOT NULL,
	"state" text DEFAULT 'output-available',
	"error_text" text,
	CONSTRAINT "chat_parts_tool_chat_message_id_index_pk" PRIMARY KEY("chat_message_id","index")
);
--> statement-breakpoint
CREATE TABLE "chat_parts_text" (
	"chat_message_id" uuid NOT NULL,
	"type" "message_parts_type" DEFAULT 'text' NOT NULL,
	"text" text NOT NULL,
	"index" integer NOT NULL,
	"state" text,
	CONSTRAINT "chat_parts_text_chat_message_id_index_pk" PRIMARY KEY("chat_message_id","index")
);
--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_chat_id_chats_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("chat_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_parts_file" ADD CONSTRAINT "chat_parts_file_chat_message_id_chat_messages_id_fk" FOREIGN KEY ("chat_message_id") REFERENCES "public"."chat_messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_parts_reasoning" ADD CONSTRAINT "chat_parts_reasoning_chat_message_id_chat_messages_id_fk" FOREIGN KEY ("chat_message_id") REFERENCES "public"."chat_messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_parts_source_url" ADD CONSTRAINT "chat_parts_source_url_chat_message_id_chat_messages_id_fk" FOREIGN KEY ("chat_message_id") REFERENCES "public"."chat_messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_parts_tool" ADD CONSTRAINT "chat_parts_tool_chat_message_id_chat_messages_id_fk" FOREIGN KEY ("chat_message_id") REFERENCES "public"."chat_messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_parts_text" ADD CONSTRAINT "chat_parts_text_chat_message_id_chat_messages_id_fk" FOREIGN KEY ("chat_message_id") REFERENCES "public"."chat_messages"("id") ON DELETE no action ON UPDATE no action;