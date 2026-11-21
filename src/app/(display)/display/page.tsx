import type { Metadata } from "next";
import { Suspense } from "react";
import DisplayScreen from "@/features/projection/DisplayScreen";
import { toLiveStateData } from "@/features/projection/live-state";
import type {
  DisplayBranding,
  DisplayPost,
  DisplayProgramItem,
  DisplaySong,
} from "@/features/projection/display-types";
import { formatEventDate } from "@/lib/format";
import { getActiveEvent } from "@/server/services/events";
import { getLiveState } from "@/server/services/live";
import { listPosts } from "@/server/services/posts";
import { listProgramItems } from "@/server/services/program";
import { listSongs } from "@/server/services/songs";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Display — Sound of Revival",
};

export default async function DisplayPage() {
  const event = await getActiveEvent();

  if (!event) {
    return <p className={styles.empty}>No active event.</p>;
  }

  const [programItems, songs, posts] = await Promise.all([
    listProgramItems(event.id),
    listSongs(event.id),
    listPosts(event.id),
  ]);

  const branding: DisplayBranding = {
    title: event.title,
    tagline: event.tagline,
    dateText: formatEventDate(event.startsAt),
    venue: event.venue,
  };

  const displayItems: DisplayProgramItem[] = programItems.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
  }));

  const displaySongs: DisplaySong[] = songs.map((song) => ({
    id: song.id,
    slug: song.slug,
    title: song.title,
    author: song.author,
  }));

  const displayPosts: DisplayPost[] = posts.map((post) => ({
    id: post.id,
    imageUrl: post.imageUrl,
    caption: post.caption,
  }));

  return (
    <Suspense
      fallback={
        <DisplayScreen
          eventId={event.id}
          branding={branding}
          programItems={displayItems}
          songs={displaySongs}
          posts={displayPosts}
          initialLiveState={null}
        />
      }
    >
      <DisplayWithState
        eventId={event.id}
        branding={branding}
        programItems={displayItems}
        songs={displaySongs}
        posts={displayPosts}
      />
    </Suspense>
  );
}

async function DisplayWithState({
  eventId,
  branding,
  programItems,
  songs,
  posts,
}: {
  eventId: string;
  branding: DisplayBranding;
  programItems: DisplayProgramItem[];
  songs: DisplaySong[];
  posts: DisplayPost[];
}) {
  const state = await getLiveState(eventId);

  return (
    <DisplayScreen
      eventId={eventId}
      branding={branding}
      programItems={programItems}
      songs={songs}
      posts={posts}
      initialLiveState={toLiveStateData(state)}
    />
  );
}
