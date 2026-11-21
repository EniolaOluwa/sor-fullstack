import QrCode from "@/components/ui/QrCode";
import type { DisplaySong } from "./display-types";
import styles from "./DisplayScreen.module.css";

type DisplayQrGridProps = {
  songs: DisplaySong[];
};

export default function DisplayQrGrid({ songs }: DisplayQrGridProps) {
  return (
    <div className={styles.qrGridPage}>
      <p className={styles.kicker}>Sing along</p>
      <h1 className={styles.qrGridTitle}>Scan a song</h1>

      <ul className={styles.qrGrid}>
        {songs.map((song) => (
          <li key={song.id} className={styles.qrGridCard}>
            <div className={styles.qrGridFrame}>
              <QrCode
                slug={song.slug}
                size={256}
                className={styles.qrGridImage}
                alt={`QR code for ${song.title}`}
              />
            </div>
            <p className={styles.qrGridSongTitle}>{song.title}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
