import type { DisplayProgramItem } from "./display-types";
import styles from "./DisplayScreen.module.css";

type DisplayProgramProps = {
  items: DisplayProgramItem[];
  currentId: string | null;
};

export default function DisplayProgram({
  items,
  currentId,
}: DisplayProgramProps) {
  const index = currentId
    ? items.findIndex((item) => item.id === currentId)
    : -1;

  if (items.length === 0) {
    return (
      <div className={styles.program}>
        <p className={styles.kicker}>Order of Service</p>
      </div>
    );
  }

  // No item selected yet — show the whole program.
  if (index === -1) {
    return (
      <div className={styles.qrGridPage}>
        <p className={styles.kicker}>Order of Service</p>
        <h1 className={styles.qrGridTitle}>Today&rsquo;s programme</h1>
        <ol className={styles.programList}>
          {items.map((item, position) => (
            <li key={item.id}>
              <span className={styles.programListPosition}>{position + 1}</span>
              <span>{item.title}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  const current = items[index];
  const next = items[index + 1];
  const details =
    current.description
      ?.split("\n")
      .map((line) => line.trim())
      .filter(Boolean) ?? [];

  return (
    <div className={styles.program}>
      <p className={styles.kicker}>
        Order of Service · {index + 1} of {items.length}
      </p>
      <h1 className={styles.programTitle}>{current.title}</h1>

      {details.length > 1 && (
        <ul className={styles.programDetails}>
          {details.map((line, lineIndex) => (
            <li key={lineIndex}>{line}</li>
          ))}
        </ul>
      )}

      {next && <p className={styles.programNext}>Next — {next.title}</p>}
    </div>
  );
}
