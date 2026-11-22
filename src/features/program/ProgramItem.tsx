import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { setLyricsPath } from "@/lib/urls";
import styles from "./ProgramItem.module.css";

export type ProgramItemData = {
  id: string;
  title: string;
  description: string | null;
  startsAt: Date | null;
};

export type ProgramItemState = "done" | "current" | "upcoming";

type ProgramItemProps = {
  index: number;
  item: ProgramItemData;
  state: ProgramItemState;
  hasLyrics?: boolean;
};

export default function ProgramItem({
  index,
  item,
  state,
  hasLyrics = false,
}: ProgramItemProps) {
  const lines =
    item.description
      ?.split("\n")
      .map((line) => line.trim())
      .filter(Boolean) ?? [];

  return (
    <li
      className={`${styles.item} ${styles[state]}`}
      aria-current={state === "current" ? "step" : undefined}
    >
      <span className={styles.number}>{index}</span>
      <div className={styles.body}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>{item.title}</h2>
          {state === "current" && <Badge tone="gold">Now</Badge>}
          {state === "done" && (
            <span className={styles.doneMark} role="img" aria-label="Completed">
              ✓
            </span>
          )}
        </div>

        {lines.length === 1 && <p className={styles.detail}>{lines[0]}</p>}

        {lines.length > 1 && (
          <ul className={styles.details}>
            {lines.map((line, lineIndex) => (
              <li key={`${item.id}-${lineIndex}`}>{line}</li>
            ))}
          </ul>
        )}

        {hasLyrics && (
          <Link href={setLyricsPath(item.id)} className={styles.lyricsLink}>
            Lyrics ↗
          </Link>
        )}
      </div>
    </li>
  );
}
