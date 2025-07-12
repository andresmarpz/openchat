ALTER TABLE "threads" ALTER COLUMN "values" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "threads" ALTER COLUMN "metadata" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "threads" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "threads" ADD CONSTRAINT "threads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;