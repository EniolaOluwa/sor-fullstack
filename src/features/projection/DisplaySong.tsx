import QrCode from "@/components/ui/QrCode";
import type { DisplaySong } from "./display-types";
import styles from "./DisplayScreen.module.css";

type DisplaySongProps = {
  song: DisplaySong | null;
};

export default function DisplaySongSlide({ song }: DisplaySongProps) {
  if (!song) {
    return (
      <div className={styles.song}>
        <p className={styles.kicker}>Now singing</p>
        <p className={styles.songAuthor}>No song selected.</p>
      </div>
    );
  }

  return (
    <div className={styles.song}>
      <p className={styles.kicker}>Now singing</p>
      <h1 className={styles.songTitle}>{song.title}</h1>
      {song.author && <p className={styles.songAuthor}>{song.author}</p>}

      <div className={styles.qrFrame}>
        <QrCode
          slug={song.slug}
          size={512}
          className={styles.qrImage}
          alt={`QR code for ${song.title}`}
        />
      </div>
      <p className={styles.qrCaption}>Scan to sing along</p>
    </div>
  );
}
