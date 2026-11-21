"use client";

import { useLiveState } from "./useLiveState";
import type { LiveStateData } from "./live-state";
import type {
  DisplayBranding,
  DisplayPost,
  DisplayProgramItem,
  DisplaySong,
} from "./display-types";
import DisplayIdle from "./DisplayIdle";
import DisplayPostSlide from "./DisplayPost";
import DisplayProgram from "./DisplayProgram";
import DisplayQrGrid from "./DisplayQrGrid";
import DisplaySongSlide from "./DisplaySong";
import styles from "./DisplayScreen.module.css";

type DisplayScreenProps = {
  eventId: string;
  branding: DisplayBranding;
  programItems: DisplayProgramItem[];
  songs: DisplaySong[];
  posts: DisplayPost[];
  initialLiveState: LiveStateData | null;
};

export default function DisplayScreen({
  eventId,
  branding,
  programItems,
  songs,
  posts,
  initialLiveState,
}: DisplayScreenProps) {
  const live = useLiveState(eventId, initialLiveState);
  const mode = live?.mode ?? "idle";

  // Remount (and crossfade) only when the slide actually changes — not on
  // every poll tick.
  const slideKey = [
    mode,
    live?.programItemId ?? "",
    live?.songId ?? "",
    live?.postId ?? "",
  ].join(":");

  let content;
  switch (mode) {
    case "program":
      content = (
        <DisplayProgram
          items={programItems}
          currentId={live?.programItemId ?? null}
        />
      );
      break;
    case "song": {
      const song = songs.find((entry) => entry.id === live?.songId) ?? null;
      content = <DisplaySongSlide song={song} />;
      break;
    }
    case "qr":
      content = <DisplayQrGrid songs={songs} />;
      break;
    case "post": {
      const post = posts.find((entry) => entry.id === live?.postId) ?? null;
      content = <DisplayPostSlide post={post} />;
      break;
    }
    default:
      content = <DisplayIdle branding={branding} />;
  }

  return (
    <div className={styles.stage}>
      <div key={slideKey} className={styles.scene}>
        {content}
      </div>
    </div>
  );
}
