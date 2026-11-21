import type { ReactNode } from "react";
import styles from "./layout.module.css";

/**
 * Fullscreen projection surface. Dark theme via `data-surface="display"`,
 * no chrome, no cursor — everything here is driven by live_state.
 */
export default function DisplayLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.screen} data-surface="display">
      {children}
    </div>
  );
}
