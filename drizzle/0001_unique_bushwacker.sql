CREATE TABLE "program_item_songs" (
	"program_item_id" uuid NOT NULL,
	"song_id" uuid NOT NULL,
	CONSTRAINT "program_item_songs_program_item_id_song_id_pk" PRIMARY KEY("program_item_id","song_id")
);
--> statement-breakpoint
ALTER TABLE "program_item_songs" ADD CONSTRAINT "program_item_songs_program_item_id_program_items_id_fk" FOREIGN KEY ("program_item_id") REFERENCES "public"."program_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_item_songs" ADD CONSTRAINT "program_item_songs_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE cascade ON UPDATE no action;