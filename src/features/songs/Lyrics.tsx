import type { LyricSection } from "@/server/db/schema";
import { sectionHeading } from "@/lib/lyrics";
import styles from "./Lyrics.module.css";

type LyricsProps = {
  sections: LyricSection[];
};

export default function Lyrics({ sections }: LyricsProps) {
  return (
    <div className={styles.lyrics}>
      {sections.map((section, index) => (
        <section
          key={`${section.type}-${section.label ?? index}-${index}`}
          className={`${styles.section} ${styles[section.type]}`}
        >
          <h2 className={styles.heading}>{sectionHeading(section)}</h2>
          <div className={styles.lines}>
            {section.lines.map((line, lineIndex) => (
              <p key={lineIndex} className={styles.line}>
                {line}
              </p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
