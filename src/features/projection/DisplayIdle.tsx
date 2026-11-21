import type { DisplayBranding } from "./display-types";
import styles from "./DisplayScreen.module.css";

type DisplayIdleProps = {
  branding: DisplayBranding;
};

export default function DisplayIdle({ branding }: DisplayIdleProps) {
  const meta = [branding.dateText, branding.venue].filter(Boolean).join(" · ");

  return (
    <div className={styles.idle}>
      <p className={styles.kicker}>Baze University Chapel presents</p>
      <h1 className={styles.idleTitle}>
        <span className={styles.idleTitleSmall}>Sound of</span>
        <span className={styles.idleTitleScript}>Revival</span>
      </h1>
      {branding.tagline && (
        <p className={styles.idleTagline}>{branding.tagline}</p>
      )}
      {meta && <p className={styles.idleMeta}>{meta}</p>}
    </div>
  );
}
