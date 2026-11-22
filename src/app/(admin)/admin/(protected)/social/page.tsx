import type { Metadata } from "next";
import SocialGraphicGenerator from "@/features/social/SocialGraphicGenerator";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Social graphics — Admin",
};

export default function SocialGraphicsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Social graphics</h1>
        <p className={styles.status}>
          Paste an Instagram link to generate a branded graphic you can
          download and project.
        </p>
      </header>

      <SocialGraphicGenerator />
    </div>
  );
}
