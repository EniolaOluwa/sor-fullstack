"use client";

import styles from "./PrintButton.module.css";

export default function PrintButton() {
  return (
    <button
      className={styles.button}
      onClick={() => window.print()}
      type="button"
    >
      Print sheet
    </button>
  );
}
