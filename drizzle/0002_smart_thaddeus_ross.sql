ALTER TABLE "social_posts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "social_posts" CASCADE;--> statement-breakpoint
ALTER TABLE "live_state" ALTER COLUMN "mode" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "live_state" ALTER COLUMN "mode" SET DEFAULT 'idle'::text;--> statement-breakpoint
DROP TYPE "public"."live_mode";--> statement-breakpoint
CREATE TYPE "public"."live_mode" AS ENUM('idle', 'program', 'song', 'qr');--> statement-breakpoint
ALTER TABLE "live_state" ALTER COLUMN "mode" SET DEFAULT 'idle'::"public"."live_mode";--> statement-breakpoint
ALTER TABLE "live_state" ALTER COLUMN "mode" SET DATA TYPE "public"."live_mode" USING "mode"::"public"."live_mode";--> statement-breakpoint
ALTER TABLE "live_state" DROP COLUMN "post_id";